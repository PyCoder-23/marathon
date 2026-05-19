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
      let currentStreak = user.streak ?? 0;
      
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
      
      // If they missed a day, their streak is dead (0)
      if (diffDays > 1) {
        if (!(user.streakProtection && diffDays === 2)) {
          currentStreak = 0;
        }
      }

      if (currentStreak === 0) {
         return interaction.editReply({ content: '❌ Your streak is currently 0. Complete a session to start a new streak before redeeming!' });
      }

      // Calculate rewards based on current streak (n)
      const n = currentStreak;
      const totalCoins = 50 * Math.pow(2, n - 1);
      const teamCoins = 15 * Math.pow(2, n - 1);
      const personalCoins = 35 * Math.pow(2, n - 1);

      // Add to personal treasury and reset streak
      user.coins = (user.coins || 0) + personalCoins;
      user.streak = 0; // Reset streak
      await user.save();

      // Add to team treasury
      let hasSquad = user.squad && user.squad !== 'Unassigned';
      if (hasSquad) {
        let squad = await SquadHistory.findOne({ squadName: user.squad });
        if (!squad) {
          squad = new SquadHistory({ squadName: user.squad, coins: 0 });
        }
        squad.coins = (squad.coins || 0) + teamCoins;
        await squad.save();
      }

      let description = '';
      if (hasSquad) {
        description = `You have redeemed a total of **${totalCoins.toLocaleString()}** coins, out of which **${teamCoins.toLocaleString()}** have gone to your team as taxes (make sure that they use the money for good), and that saves you a total of **${personalCoins.toLocaleString()}** which will be added directly to your bank account.\n\n*Streak reset to 0.*`;
      } else {
        description = `You have redeemed a total of **${totalCoins.toLocaleString()}** coins, out of which **${teamCoins.toLocaleString()}** have gone to taxes (lost since you are not in a squad), and that saves you a total of **${personalCoins.toLocaleString()}** which will be added directly to your bank account.\n\n*Streak reset to 0.*`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🪙 Coins Redeemed!')
        .setDescription(description)
        .setColor('#eab308')
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /redeem-coins:', error);
      return interaction.editReply({ content: '❌ An error occurred while redeeming coins.' });
    }
  },
};
