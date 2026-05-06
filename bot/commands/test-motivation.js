const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const quotes = require('../quotes.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test-motivation')
    .setDescription('ADMIN COMMAND: Test the daily motivation message.'),

  async execute(interaction) {
    // Only allow head admin
    const HEAD_ADMIN_ID = '857145663947014164';
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({ content: '🚫 **ACCESS DENIED:** Only the Head Admin can trigger system tests.', ephemeral: true });
    }

    const MOTIVATION_CHANNEL_ID = '1501403557897703574';
    const MOTIVATION_ROLE_ID = '1501403253043368066';

    try {
      await interaction.deferReply({ ephemeral: true });

      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const quote = quotes[dayOfYear % quotes.length];
      
      const embed = new EmbedBuilder()
        .setTitle('🌅 DAILY_MOTIVATION_PROTOCOL (TEST)')
        .setDescription(`*"${quote.text}"*`)
        .addFields({ name: '— Author', value: `**${quote.author}**` })
        .setColor('#ff0055')
        .setTimestamp()
        .setFooter({ text: 'Marathon System: Momentum' });

      const channel = await interaction.client.channels.fetch(MOTIVATION_CHANNEL_ID);
      if (channel) {
        await channel.send({ 
          content: `<@&${MOTIVATION_ROLE_ID}> **| SET THE TONE FOR THE DAY**`, 
          embeds: [embed] 
        });
        return interaction.editReply({ content: '✅ **TEST_SUCCESS:** Motivation message sent to the channel.' });
      } else {
        return interaction.editReply({ content: '❌ **TEST_FAILURE:** Could not find the motivation channel.' });
      }
    } catch (error) {
      console.error('[Test-Motivation Error]', error);
      return interaction.editReply({ content: `❌ **SYSTEM_ERROR:** ${error.message}` });
    }
  },
};
