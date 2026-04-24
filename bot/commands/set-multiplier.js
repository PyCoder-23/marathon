const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, GlobalConfig } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';
const MOD_ROLE_ID = '1496597244823076916';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-multiplier')
    .setDescription('MOD COMMAND: Update the XP multiplier for all sessions.')
    .addNumberOption(option => 
      option.setName('value')
        .setDescription('The multiplier value (e.g., 1.5 for 50% more XP).')
        .setRequired(true)),

  async execute(interaction) {
    const isMod = interaction.member?.roles.cache.has(MOD_ROLE_ID);
    const isHeadAdmin = interaction.user.id === HEAD_ADMIN_ID;

    if (!isHeadAdmin && !isMod) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** Only Moderators can adjust the XP surge parameters.', 
        ephemeral: true 
      });
    }

    const value = interaction.options.getNumber('value');

    if (value <= 0) {
      return interaction.reply({ content: '❌ **ERROR:** Multiplier must be greater than 0.', ephemeral: true });
    }

    try {
      await interaction.deferReply();
      await connectDB();

      // Upsert the multiplier config
      await GlobalConfig.findOneAndUpdate(
        { key: 'xp_multiplier' },
        { value: value, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      const embed = new EmbedBuilder()
        .setTitle('🔥 XP SURGE ACTIVATED')
        .setDescription(`The Marathon XP protocols have been recalibrated! All future sessions will now receive a **${value}x** multiplier.`)
        .addFields(
          { name: 'Updated By', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'New Multiplier', value: `\`${value}x\``, inline: true },
          { name: 'Status', value: '⚡ Active Globally', inline: true }
        )
        .setColor('#00ff9f')
        .setThumbnail('https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z2NGZ5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5Z2Z5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxVfFESM3q8/giphy.gif')
        .setTimestamp()
        .setFooter({ text: 'Performance Protocol: Surge' });

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('[Set-Multiplier Error]', error);
      return interaction.editReply({ content: '❌ **SYSTEM_FAULT:** Failed to update XP multiplier in the central database.' });
    }
  },
};
