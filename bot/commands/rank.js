const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your current standing on the weekly leaderboard.'),

  async execute(interaction) {
    try {
      await connectDB();

      // Get all users sorted by weeklyXp to calculate ranks
      const allUsers = await User.find({}).sort({ weeklyXp: -1 });
      const userRank = allUsers.findIndex(u => u.discordId === interaction.user.id) + 1;
      const userDoc = allUsers.find(u => u.discordId === interaction.user.id);

      if (!userDoc) {
        return interaction.reply({ 
          content: '❌ **ERROR:** You are not in the Marathon database. Please link your account first.', 
          ephemeral: true 
        });
      }

      // Get Top 3 for context
      const top3 = allUsers.slice(0, 3);
      let podiumText = '';
      const medals = ['🥇', '🥈', '🥉'];
      
      top3.forEach((u, i) => {
        podiumText += `${medals[i]} **${u.username}** — \`${u.weeklyXp || 0} XP\`\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle(`🏆 WEEKLY RANKINGS`)
        .setDescription(`Current operational cycle standings.`)
        .addFields(
          { name: 'Your Position', value: `#**${userRank}** / ${allUsers.length}`, inline: true },
          { name: 'Weekly XP', value: `\`${userDoc.weeklyXp || 0} XP\``, inline: true },
          { name: 'Streak', value: `\`${userDoc.streak}d\``, inline: true },
          { name: '━━━━━━━━━━━━━━', value: '**CURRENT TOP 3**' },
          { name: '\u200B', value: podiumText || 'No agents active yet this cycle.' }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setColor('#00ff9f')
        .setFooter({ text: 'MARATHON HUD | Weekly Cycle Status' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Database error occurred while fetching rankings.', ephemeral: true });
    }
  },
};
