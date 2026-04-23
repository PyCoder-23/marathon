const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { connectDB, User } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-xp')
    .setDescription('ADMIN COMMAND: Set the XP for a specific user.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user whose XP you want to set.')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('The absolute XP value to set.')
        .setRequired(true)),

  async execute(interaction) {
    // Permission check: Head Admin or Moderator role
    const MOD_ROLE_ID = '1496597244823076916';
    const isMod = interaction.member?.roles.cache.has(MOD_ROLE_ID);
    
    if (interaction.user.id !== HEAD_ADMIN_ID && !isMod) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** This command is strictly reserved for Moderators and the Head Admin.', 
        ephemeral: true 
      });
    }

    const targetUser = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');

    try {
      await interaction.deferReply(); // Removed ephemeral: true to make it public
      await connectDB();

      // Find user in database
      const userRecord = await User.findOne({ discordId: targetUser.id });

      if (!userRecord) {
        return interaction.editReply({ 
          content: `❌ **USER_NOT_FOUND:** <@${targetUser.id}> is not registered in the Marathon system.` 
        });
      }

      // Update XP
      const oldXp = userRecord.xp;
      userRecord.xp = amount;
      userRecord.weeklyXp = amount;
      
      await userRecord.save();

      console.log(`💾 [ADMIN] XP Update: ${targetUser.tag} (${oldXp} -> ${amount}) by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setTitle('⚡ XP Update Synchronized')
        .setDescription(`Successfully modified XP profile for <@${targetUser.id}>.`)
        .addFields(
          { name: 'User', value: `<@${targetUser.id}>`, inline: true }, // Changed to mention for visibility
          { name: 'Previous XP', value: `${oldXp}`, inline: true },
          { name: 'New XP', value: `${amount}`, inline: true },
          { name: 'Status', value: '✅ Synced with Database & Web', inline: false }
        )
        .setColor('#ffaa00')
        .setTimestamp()
        .setFooter({ text: 'Administrative Action' });

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('[Set-XP Error]', error);
      return interaction.editReply({ content: '❌ **PROTOCOL_ERROR:** Failed to synchronize XP update with the central database.' });
    }
  },
};
