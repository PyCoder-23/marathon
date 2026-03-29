const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User, Session, Task } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hard-reset')
    .setDescription('PROHIBITED COMMAND: Wipe all weekly XP, sessions, and tasks (Admin only).'),

  async execute(interaction) {
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({ content: '🚫 **ACCESS DENIED:** This command is strictly reserved for the Head Admin.', ephemeral: true });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      await connectDB();

      console.log('🧹 [ADMIN] Manual System Wipe initiated by', interaction.user.tag);

      // 1. Reset all Weekly XP (Lifetime XP & streaks are preserved)
      const userRes = await User.updateMany({}, { $set: { weeklyXp: 0 } });

      // 2. Clear all activity-related documents
      const sessionRes = await Session.deleteMany({});
      const taskRes = await Task.deleteMany({});

      return interaction.editReply({ 
        content: `✅ **SYSTEM_WIPE_COMPLETE**\n- **Xp Resets:** ${userRes.modifiedCount}\n- **Sessions Purged:** ${sessionRes.deletedCount}\n- **Tasks Purged:** ${taskRes.deletedCount}\n\nThe new cycle has been manually initialized.`
      });

    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: '❌ **PROTOCOL_ERROR:** Failed to execute manual wipe sequence.' });
    }
  },
};
