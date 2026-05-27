const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, TeamExchangeRequest } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exchange-deny')
    .setDescription('Decline your pending team exchange request.'),

  async execute(interaction) {
    const callerId = interaction.user.id;

    await interaction.deferReply();

    try {
      await connectDB();

      // 1. Find request where caller is target
      const request = await TeamExchangeRequest.findOne({ targetId: callerId });
      if (!request) {
        return interaction.editReply({
          content: '❌ **ERROR:** You do not have any pending team exchange requests to decline.'
        });
      }

      const { initiatorId, targetId } = request;

      // 2. Delete the request
      await TeamExchangeRequest.deleteOne({ _id: request._id });

      // 3. Reply publicly with embed
      const denyEmbed = new EmbedBuilder()
        .setTitle('❌ TEAM EXCHANGE DECLINED')
        .setDescription(`The squad swap request has been rejected.`)
        .addFields(
          { name: 'Initiator', value: `<@${initiatorId}>`, inline: true },
          { name: 'Target', value: `<@${targetId}>`, inline: true },
          { name: 'Status', value: `Decline received. No database or role modifications were executed.`, inline: false }
        )
        .setColor('#EF4444')
        .setFooter({ text: 'Marathon Operations | Request Terminated' })
        .setTimestamp();

      await interaction.editReply({
        content: `❌ **Squad Exchange Declined.**`,
        embeds: [denyEmbed]
      });

      // 4. Send polite DM to initiator
      try {
        const guild = interaction.guild;
        if (guild) {
          const initiatorMember = await guild.members.fetch(initiatorId).catch(() => null);
          if (initiatorMember) {
            const dmEmbed = new EmbedBuilder()
              .setTitle('❌ Team Exchange Declined')
              .setDescription(`**${interaction.user.username}** declined your squad exchange request.`)
              .setColor('#EF4444')
              .setTimestamp();

            await initiatorMember.user.send({ embeds: [dmEmbed] });
          }
        }
      } catch (dmErr) {
        console.log(`Could not send decline DM to initiator:`, dmErr.message);
      }

    } catch (err) {
      console.error('Error in /exchange-deny:', err);
      return interaction.editReply({
        content: '❌ **ERROR:** An unexpected database error occurred while declining the request.'
      });
    }
  }
};
