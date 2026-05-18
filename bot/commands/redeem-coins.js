const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, SquadHistory } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('redeem-coins')
    .setDescription('Redeem your current streak for coins! (Resets streak to 0)'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      await connectDB();
      const discordId = interaction.user.id;
      const user = await User.findOne({ discordId });

      if (!user) {
        return interaction.editReply({ content: '❌ You must join the Marathon server and complete a session first.' });
      }

      // Check if they have done any session
      if (!user.lastActive) {
         return interaction.editReply({ content: '❌ You need to complete at least one valid session to redeem coins.' });
      }

      // Dynamically calculate display streak
      let currentStreak = user.streak ?? 1;
      
      const getSessionDate = (date) => {
        const d = new Date(date);
        d.setHours(d.getHours() - 4);
        d.setMinutes(d.getMinutes() - 30);
        d.setHours(0, 0, 0, 0);
        return d;
      };
      
      const currentSession = getSessionDate(new Date());
      const lastSession = getSessionDate(user.lastActive);
      const diffDays = Math.round((currentSession.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
      
      // If they missed a day, their streak is essentially 1 right now (unless protected)
      if (diffDays > 1) {
        if (!(user.streakProtection && diffDays === 2)) {
          currentStreak = 1;
        }
      }

      if (currentStreak === 0) {
         return interaction.editReply({ content: '❌ Your streak is currently 0. Complete a session to start a new streak before redeeming!' });
      }

      // Calculate rewards based on current streak (n)
      const n = currentStreak;
      const personalCoins = 35 * Math.pow(2, n - 1);
      const teamCoins = 15 * Math.pow(2, n - 1);

      // Add to personal treasury and reset streak
      user.coins = (user.coins || 0) + personalCoins;
      user.streak = 0; // Reset streak
      await user.save();

      // Add to team treasury
      let teamMsg = '';
      if (user.squad && user.squad !== 'Unassigned') {
        let squad = await SquadHistory.findOne({ squadName: user.squad });
        if (!squad) {
          squad = new SquadHistory({ squadName: user.squad, coins: 0 });
        }
        squad.coins = (squad.coins || 0) + teamCoins;
        await squad.save();
        teamMsg = ` and \`${teamCoins.toLocaleString()}\` coins for **${user.squad}**!`;
      } else {
        teamMsg = ` (You are not in a squad, so no team coins were awarded).`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🪙 Coins Redeemed!')
        .setDescription(`You sacrificed your **${n}-day streak**!\n\nYou earned \`${personalCoins.toLocaleString()}\` coins for your personal treasury${teamMsg}`)
        .setColor('#eab308')
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /redeem-coins:', error);
      return interaction.editReply({ content: '❌ An error occurred while redeeming coins.' });
    }
  },
};
