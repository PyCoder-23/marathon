const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, AuthCode } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to the Marathon website.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const avatar = interaction.user.displayAvatarURL({ extension: 'png' });

    // Generate a unique 8-character linking code
    const linkingCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      await connectDB();
      
      // Upsert the user into the DB
      await User.findOneAndUpdate(
        { discordId: userId },
        { username, avatar },
        { upsert: true, new: true }
      );

      // Clean up any old auth codes for this user to avoid clutter
      await AuthCode.deleteMany({ discordId: userId });

      // Insert the new code
      await AuthCode.create({ code: linkingCode, discordId: userId });

    } catch (dbError) {
      console.error(dbError);
      return interaction.reply({ content: '❌ Database error occurred while linking. Please try again later.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔗 Account Linking Protocol')
      .setDescription(`To unlock full features on the Marathon dashboard, use the code below to link your identity:\n\n# **\`${linkingCode}\`**`)
      .addFields(
        { name: 'How to use', value: '1. Open the Marathon website.\n2. Click "Join Camp".\n3. Enter the code in the verification section.', inline: false }
      )
      .setColor('#00ff9f')
      .setTimestamp()
      .setFooter({ text: 'This code is for one-time use.' });

    await interaction.reply({ content: 'I have sent your linking code via DM!', ephemeral: true });

    try {
      await interaction.user.send({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: 'I could not send you a DM. Please enable DMs from server members.', ephemeral: true });
    }
  },
};
