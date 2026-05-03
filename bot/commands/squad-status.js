const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('squad-status')
    .setDescription('Check your current squad assignment and stats.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      await connectDB();
      const user = await User.findOne({ discordId: userId });

      if (!user) {
        return interaction.reply({ content: '🚫 You are not registered in the Marathon system. Please use `/link` first.', ephemeral: true });
      }

      if (!user.squad || user.squad === 'Unassigned') {
        return interaction.reply({ content: '❓ You are not assigned to a squad yet. You will be assigned when you link your account or when an admin sets it.', ephemeral: true });
      }

      const squadThemes = {
        'Zenith Sentinels': '#8B5CF6', // Violet
        'Apex Titans': '#06B6D4',      // Cyan
        'Meridian Arbiters': '#22C55E', // Green
        'Horizon Vanguards': '#F97316' // Orange
      };

      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Squad Status: ${user.squad}`)
        .setColor(squadThemes[user.squad] || '#ffffff')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '👤 Username', value: user.username, inline: true },
          { name: '✨ Weekly XP', value: `\`${user.weeklyXp} XP\``, inline: true },
          { name: '📈 Total XP', value: `\`${user.xp} XP\``, inline: true },
          { name: '🔥 Streak', value: `\`${user.streak} days\``, inline: true }
        )
        .setFooter({ text: user.weeklyXp >= 100 ? '✅ Active Member (Contributing to Squad)' : '❌ Inactive Member (Needs 100 XP to contribute)' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /squad-status:', error);
      return interaction.reply({ content: '❌ Database error occurred.', ephemeral: true });
    }
  },
};
