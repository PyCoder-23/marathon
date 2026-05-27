const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, TeamExchangeRequest, ExchangeCooldown } = require('../../database.js');

const TEAM_LEADER_ROLE_ID = '1500546046907125962';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('exchange-teams')
    .setDescription('Propose a team (squad) exchange with another member.')
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member you want to swap squads with')
        .setRequired(true)),

  async execute(interaction) {
    const initiator = interaction.user;
    const target = interaction.options.getUser('member');

    // Prevent self-exchanges
    if (initiator.id === target.id) {
      return interaction.reply({
        content: '❌ **ERROR:** You cannot exchange squads with yourself!',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      await connectDB();

      // 1. Check if initiator has the Team Leader role
      const initiatorMember = await interaction.guild.members.fetch(initiator.id).catch(() => null);
      if (initiatorMember && initiatorMember.roles.cache.has(TEAM_LEADER_ROLE_ID)) {
        return interaction.editReply({
          content: '❌ **ACCESS DENIED:** Team Leaders (users with the Team Leader role) cannot exchange their squads.'
        });
      }

      // 2. Check if target has the Team Leader role
      const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (!targetMember) {
        return interaction.editReply({
          content: '❌ **ERROR:** The specified member is not in this server.'
        });
      }
      if (targetMember.roles.cache.has(TEAM_LEADER_ROLE_ID)) {
        return interaction.editReply({
          content: '❌ **ACCESS DENIED:** You cannot exchange squads with a Team Leader.'
        });
      }

      // 3. Check if target has linked with the website
      const targetDoc = await User.findOne({ discordId: target.id });
      if (!targetDoc || !targetDoc.hasLinked) {
        return interaction.editReply({
          content: `❌ **ERROR:** **${target.username}** has not linked their Discord identity to the Marathon website yet. They must run \`/link\` first.`
        });
      }

      // 4. Check if initiator exists and has linked
      const initiatorDoc = await User.findOne({ discordId: initiator.id });
      if (!initiatorDoc || !initiatorDoc.hasLinked) {
        return interaction.editReply({
          content: '❌ **ERROR:** You must link your Discord identity to the Marathon website before exchanging squads. Run `/link` to start.'
        });
      }

      // 5. Check squad assignment validity
      const initiatorSquad = initiatorDoc.squad;
      const targetSquad = targetDoc.squad;

      if (!initiatorSquad || initiatorSquad === 'Unassigned') {
        return interaction.editReply({
          content: '❌ **ERROR:** You are not assigned to any squad yet.'
        });
      }

      if (!targetSquad || targetSquad === 'Unassigned') {
        return interaction.editReply({
          content: `❌ **ERROR:** **${target.username}** is not assigned to any squad yet.`
        });
      }

      // 6. Check if they are on different teams
      if (initiatorSquad === targetSquad) {
        return interaction.editReply({
          content: `❌ **ERROR:** You and **${target.username}** are already in the same squad (**${initiatorSquad}**)!`
        });
      }

      // 7. Check 7-day exchange cooldowns for both users
      const initiatorCooldown = await ExchangeCooldown.findOne({ discordId: initiator.id });
      if (initiatorCooldown) {
        const expiresTs = Math.floor(initiatorCooldown.cooldownUntil.getTime() / 1000);
        return interaction.editReply({
          content: `⏳ **COOLDOWN ACTIVE:** You were recently part of a squad exchange. You can initiate or participate in another exchange <t:${expiresTs}:R> (on <t:${expiresTs}:F>).`
        });
      }

      const targetCooldown = await ExchangeCooldown.findOne({ discordId: target.id });
      if (targetCooldown) {
        const expiresTs = Math.floor(targetCooldown.cooldownUntil.getTime() / 1000);
        return interaction.editReply({
          content: `⏳ **COOLDOWN ACTIVE:** **${target.username}** was recently part of a squad exchange and cannot be exchanged again until <t:${expiresTs}:R> (on <t:${expiresTs}:F>).`
        });
      }

      // 8. Check if there are any active exchange requests involving either user
      const existingRequest = await TeamExchangeRequest.findOne({
        $or: [
          { initiatorId: initiator.id },
          { targetId: initiator.id },
          { initiatorId: target.id },
          { targetId: target.id }
        ]
      });

      if (existingRequest) {
        return interaction.editReply({
          content: '⚠️ **PENDING REQUEST:** There is already an active squad exchange request involving either you or the target user. Please wait for it to expire (15 minutes) or be resolved.'
        });
      }

      // 9. Create the exchange request in database
      await TeamExchangeRequest.create({
        initiatorId: initiator.id,
        targetId: target.id,
        initiatorSquad,
        targetSquad
      });

      // 10. Send public embed with ping
      const exchangeEmbed = new EmbedBuilder()
        .setTitle('🔄 TEAM EXCHANGE PROTOCOL')
        .setDescription(`Attention <@${target.id}>! A squad exchange has been proposed.`)
        .addFields(
          { name: 'Initiator', value: `<@${initiator.id}>`, inline: true },
          { name: 'Current Squad', value: `**${initiatorSquad}**`, inline: true },
          { name: '\u200B', value: '\u200B', inline: false },
          { name: 'Target', value: `<@${target.id}>`, inline: true },
          { name: 'Current Squad', value: `**${targetSquad}**`, inline: true },
          { name: '━━━━━━━━━━━━━━━━━━━━━━━━━━', value: `To authorize this swap, <@${target.id}> must use \`/exchange-accept\`.\nTo decline, use \`/exchange-deny\`.\n\n*This request will automatically expire in 15 minutes.*` }
        )
        .setColor('#8B5CF6')
        .setThumbnail(target.displayAvatarURL({ extension: 'png' }))
        .setFooter({ text: 'Marathon Operations | Squad Swap Gate' })
        .setTimestamp();

      await interaction.editReply({
        content: `🔔 **Team Exchange Request sent to <@${target.id}>!**`,
        embeds: [exchangeEmbed]
      });

      // 11. Attempt to DM the target user to alert them
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('🔄 Inbound Team Exchange Request')
          .setDescription(`**${initiator.username}** wants to swap squads with you in the Marathon Server!`)
          .addFields(
            { name: 'Their Squad', value: `**${initiatorSquad}**`, inline: true },
            { name: 'Your Squad', value: `**${targetSquad}**`, inline: true },
            { name: 'Action Required', value: 'Go to the server and use `/exchange-accept` to accept, or `/exchange-deny` to decline.' }
          )
          .setColor('#8B5CF6')
          .setFooter({ text: 'This request will expire in 15 minutes.' });

        await target.send({ embeds: [dmEmbed] });
      } catch (dmErr) {
        console.log(`Could not send inbound request DM to target user ${target.username}:`, dmErr.message);
      }

    } catch (err) {
      console.error('Error in /exchange-teams:', err);
      return interaction.editReply({
        content: '❌ **ERROR:** An unexpected database error occurred while creating your request.'
      });
    }
  }
};
