const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, TeamExchangeRequest } = require('../../database.js');

const SQUAD_ROLES = {
  'Zenith Sentinels': '1500526060146790642',
  'Apex Titans': '1500525530993131621',
  'Meridian Arbiters': '1500525923097645312',
  'Horizon Vanguards': '1500526258302357666'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exchange-accept')
    .setDescription('Accept your pending team exchange request.'),

  async execute(interaction) {
    const callerId = interaction.user.id;

    await interaction.deferReply();

    try {
      await connectDB();

      // 1. Find request where caller is target
      const request = await TeamExchangeRequest.findOne({ targetId: callerId });
      if (!request) {
        return interaction.editReply({
          content: '❌ **ERROR:** You do not have any pending team exchange requests to accept.'
        });
      }

      const { initiatorId, targetId, initiatorSquad, targetSquad } = request;

      // 2. Fetch guild members to perform role swaps
      const guild = interaction.guild;
      if (!guild) {
        return interaction.editReply({
          content: '❌ **ERROR:** This command must be executed inside the Discord server.'
        });
      }

      const initiatorMember = await guild.members.fetch(initiatorId).catch(() => null);
      const targetMember = await guild.members.fetch(targetId).catch(() => null);

      if (!initiatorMember) {
        await TeamExchangeRequest.deleteOne({ _id: request._id });
        return interaction.editReply({
          content: '❌ **ERROR:** The user who initiated the exchange request is no longer in this server. Request cleared.'
        });
      }

      // 3. Fetch both user documents in MongoDB
      const initiatorDoc = await User.findOne({ discordId: initiatorId });
      const targetDoc = await User.findOne({ discordId: targetId });

      if (!initiatorDoc || !targetDoc) {
        await TeamExchangeRequest.deleteOne({ _id: request._id });
        return interaction.editReply({
          content: '❌ **ERROR:** One of the participating members could not be found in the database. Request cleared.'
        });
      }

      // 4. Verify squads are still the same as when the request was made
      if (initiatorDoc.squad !== initiatorSquad || targetDoc.squad !== targetSquad) {
        await TeamExchangeRequest.deleteOne({ _id: request._id });
        return interaction.editReply({
          content: '⚠️ **EXCHANGE ABORTED:** The squad assignments have changed since the request was initiated. Request cleared.'
        });
      }

      // 5. Database update (swap squads)
      initiatorDoc.squad = targetSquad;
      targetDoc.squad = initiatorSquad;

      await initiatorDoc.save();
      await targetDoc.save();

      // 6. Delete the pending request
      await TeamExchangeRequest.deleteOne({ _id: request._id });

      // 7. Update Discord roles for both users
      let roleSwapStatus = '✅ Database updated & synced.';
      try {
        // Handle initiator role updates
        const oldInitiatorRole = SQUAD_ROLES[initiatorSquad];
        const newInitiatorRole = SQUAD_ROLES[targetSquad];

        if (oldInitiatorRole && initiatorMember.roles.cache.has(oldInitiatorRole)) {
          await initiatorMember.roles.remove(oldInitiatorRole);
        }
        if (newInitiatorRole && !initiatorMember.roles.cache.has(newInitiatorRole)) {
          await initiatorMember.roles.add(newInitiatorRole);
        }

        // Handle target role updates
        const oldTargetRole = SQUAD_ROLES[targetSquad];
        const newTargetRole = SQUAD_ROLES[initiatorSquad];

        if (oldTargetRole && targetMember.roles.cache.has(oldTargetRole)) {
          await targetMember.roles.remove(oldTargetRole);
        }
        if (newTargetRole && !targetMember.roles.cache.has(newTargetRole)) {
          await targetMember.roles.add(newTargetRole);
        }
      } catch (roleErr) {
        console.error('Failed to update roles during exchange:', roleErr);
        roleSwapStatus = '⚠️ Database updated, but could not update Discord roles automatically due to server hierarchy or permissions.';
      }

      // 8. Send rich success embed
      const successEmbed = new EmbedBuilder()
        .setTitle('🔄 SQUAD SWAP SUCCESSFUL')
        .setDescription(`The squad exchange request between <@${initiatorId}> and <@${targetId}> has been executed and synced.`)
        .addFields(
          { name: 'Member', value: `<@${initiatorId}>`, inline: true },
          { name: 'New Squad Assignment', value: `**${targetSquad}**`, inline: true },
          { name: '\u200B', value: '\u200B', inline: false },
          { name: 'Member', value: `<@${targetId}>`, inline: true },
          { name: 'New Squad Assignment', value: `**${initiatorSquad}**`, inline: true },
          { name: 'Sync Status', value: roleSwapStatus, inline: false }
        )
        .setColor('#00ff9f')
        .setThumbnail(targetMember.user.displayAvatarURL({ extension: 'png' }))
        .setFooter({ text: 'Marathon Operations | Database Synchronized' })
        .setTimestamp();

      await interaction.editReply({
        content: `🎉 **Squad Exchange Approved!**`,
        embeds: [successEmbed]
      });

      // 9. Alert initiator via DM
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('🎉 Squad Exchange Approved!')
          .setDescription(`**${interaction.user.username}** accepted your team exchange request.`)
          .addFields(
            { name: 'Your New Squad', value: `**${targetSquad}**` },
            { name: 'Status', value: 'Roles and web profile updated successfully.' }
          )
          .setColor('#00ff9f')
          .setTimestamp();

        await initiatorMember.user.send({ embeds: [dmEmbed] });
      } catch (dmErr) {
        console.log(`Could not send DM to initiator user ${initiatorMember.user.username}:`, dmErr.message);
      }

    } catch (err) {
      console.error('Error in /exchange-accept:', err);
      return interaction.editReply({
        content: '❌ **ERROR:** An unexpected database or API error occurred while processing the acceptance.'
      });
    }
  }
};
