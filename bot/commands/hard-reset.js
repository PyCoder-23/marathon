const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User, Session, Task, ActiveSession, SquadHistory } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hard-reset')
    .setDescription('PROHIBITED COMMAND: Wipe all weekly XP, sessions, and tasks (Admin only).'),

  async execute(interaction) {
    const MOD_ROLE_ID = '1496597244823076916';
    const isMod = interaction.member?.roles.cache.has(MOD_ROLE_ID);

    if (interaction.user.id !== HEAD_ADMIN_ID && !isMod) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** This command is strictly reserved for Moderators and the Head Admin.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      await connectDB();

      console.log('🧹 [ADMIN] Manual System Wipe initiated by', interaction.user.tag);

      // 0. Calculate Winning Squad before reset
      const squadStats = await User.aggregate([
        { $match: { squad: { $ne: 'Unassigned', $exists: true } } },
        { 
          $group: {
            _id: '$squad',
            squadXp: { $sum: { $cond: [{ $gte: ['$weeklyXp', 100] }, '$weeklyXp', 0] } }
          }
        },
        { $sort: { squadXp: -1 } }
      ]);

      let winnerText = 'No winner this week.';
      if (squadStats.length > 0 && squadStats[0].squadXp > 0) {
        const winningSquad = squadStats[0]._id;
        winnerText = `🏆 **${winningSquad}** wins this cycle with ${squadStats[0].squadXp} XP!`;
        
        // Update winner
        await SquadHistory.findOneAndUpdate(
          { squadName: winningSquad },
          { 
            $inc: { winStreak: 1, allTimeWins: 1 },
            $set: { lastWinDate: new Date() }
          },
          { upsert: true }
        );

        // Reset streaks for losers
        const losingSquads = squadStats.slice(1).map(s => s._id);
        if (losingSquads.length > 0) {
          await SquadHistory.updateMany(
            { squadName: { $in: losingSquads } },
            { $set: { winStreak: 0 } }
          );
        }
      }

      // 1. Reset all Weekly XP (Lifetime XP & streaks are preserved)
      const userRes = await User.updateMany({}, { $set: { weeklyXp: 0 } });

      // 2. Clear all activity-related documents
      const sessionRes = await Session.deleteMany({});
      const taskRes = await Task.deleteMany({});
      
      // 3. Clear all active sessions in DB
      const activeRes = await ActiveSession.deleteMany({});

      return interaction.editReply({ 
        content: `✅ **SYSTEM_WIPE_COMPLETE**\n\n${winnerText}\n\n- **Xp Resets:** ${userRes.modifiedCount}\n- **Sessions Purged:** ${sessionRes.deletedCount}\n- **Tasks Purged:** ${taskRes.deletedCount}\n- **Active Timers Terminated:** ${activeRes.deletedCount}\n\nThe new cycle has been manually initialized.`
      });

    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: '❌ **PROTOCOL_ERROR:** Failed to execute manual wipe sequence.' });
    }
  },
};
