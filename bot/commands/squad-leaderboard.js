const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('squad-leaderboard')
    .setDescription('View the current Marathon Squads leaderboard.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      await connectDB();
      
      const squadStats = await User.aggregate([
        { $match: { squad: { $ne: 'Unassigned', $exists: true } } },
        { 
          $group: {
            _id: '$squad',
            totalMembers: { $sum: 1 },
            activeMembers: {
              $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, 1, 0] }
            },
            squadXp: {
              $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, '$weeklyXp', 0] }
            }
          }
        },
        { $sort: { squadXp: -1 } }
      ]);

      const embed = new EmbedBuilder()
        .setTitle('🏆 Marathon Squad Leaderboard')
        .setDescription('Weekly XP accumulated by active members (≥100 XP).')
        .setColor('#FFD700')
        .setTimestamp();

      const medals = ['🥇', '🥈', '🥉', '🎖️'];

      if (squadStats.length === 0) {
        embed.addFields({ name: 'No Data', value: 'No squads have accumulated active XP yet.' });
      } else {
        squadStats.forEach((squad, index) => {
          embed.addFields({ 
            name: `${medals[index] || '🔹'} ${squad._id}`, 
            value: `**XP:** \`${squad.squadXp}\` | **Active Members:** \`${squad.activeMembers}\` / \`${squad.totalMembers}\``,
            inline: false 
          });
        });
      }

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in /squad-leaderboard:', error);
      return interaction.editReply({ content: '❌ Database error occurred.' });
    }
  },
};
