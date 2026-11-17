const { SlashCommandBuilder } = require('discord.js');
const { connectDB, GlobalConfig } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test-motivation')
    .setDescription('ADMIN COMMAND: Trigger the Daily Positivity DM prompt and broadcast immediately.'),

  async execute(interaction) {
    const HEAD_ADMIN_ID = '857145663947014164';
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({
        content: '🚫 **ACCESS DENIED:** Only the Head Admin can trigger positivity broadcasts.',
        ephemeral: true
      });
    }

    const POSITIVITY_CHANNEL_ID = '1501403557897703574';

    try {
      await interaction.deferReply({ ephemeral: true });
      await connectDB();

      const stateValue = {
        mode: 'test', // 'test' sends immediately upon receiving DM + color; 'scheduled' saves for 6:45 AM IST
        pendingText: '',
        pendingImageUrl: '',
        pendingColor: '',
        awaitingColor: false,
        awaitingColorEdit: false,
        requestedAt: Date.now()
      };

      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: stateValue, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      if (interaction.client) {
        interaction.client.positivityPromptState = stateValue;
      }

      await interaction.user.send(
        '☀️ **POSITIVITY PROTOCOL — TEST MODE**\n\n' +
        `Please reply here in DMs with the **positive message** and **image** you want me to send to <#${POSITIVITY_CHANNEL_ID}>.\n` +
        '*(You can attach the image and text in the same message, or send them one right after the other!)*'
      );

      return interaction.editReply({
        content: `📩 **DM SENT:** Check your DMs! As soon as you send me the positive message and image there, I will broadcast it to <#${POSITIVITY_CHANNEL_ID}>.`
      });
    } catch (error) {
      console.error('[Test-Motivation Error]', error);
      return interaction.editReply({ content: `❌ **SYSTEM_ERROR:** ${error.message}` });
    }
  },
};
