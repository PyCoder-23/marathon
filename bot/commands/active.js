const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { connectDB, ActiveSession, User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('active')
    .setDescription('Displays all agents currently in an active session.'),

  async execute(interaction) {
    try {
      await connectDB();

      const activeSessions = await ActiveSession.find({});

      if (activeSessions.length === 0) {
        return interaction.reply({ 
          content: 'There are no active or paused sessions running right now. Run `/timer start` to begin!', 
          ephemeral: true 
        });
      }

      // We need to fetch User details to get their usernames
      const allUsers = await User.find({ discordId: { $in: activeSessions.map(s => s.discordId) } });

      const sessionsWithUser = activeSessions.map(session => {
        const user = allUsers.find(u => u.discordId === session.discordId);
        const username = user ? user.username : "Unknown Agent";
        
        let currentMs = session.totalMs;
        // Only accumulate new time if they are actually running (not paused)
        if (!session.paused) {
          currentMs += (Date.now() - session.startTime);
        }

        return {
          username,
          currentMs,
          paused: session.paused
        };
      });

      // Sort by longest running session descending
      sessionsWithUser.sort((a, b) => b.currentMs - a.currentMs);

      const formatTime = (ms) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        if (hours > 0) {
            return `${hours} hr ${minutes} mins`;
        }
        return `${minutes} mins`;
      };

      const perPage = 10;
      const maxPage = Math.ceil(sessionsWithUser.length / perPage) || 1;
      let currentPage = 1;

      const generateEmbed = (page) => {
        const start = (page - 1) * perPage;
        const currentChunk = sessionsWithUser.slice(start, start + perPage);

        let description = '';
        currentChunk.forEach((s) => {
          const statusIcon = s.paused ? '⏸️' : '▶️';
          description += `${statusIcon} **${s.username}** - ${formatTime(s.currentMs)}\n`;
        });

        return new EmbedBuilder()
          .setTitle(`🔥 ACTIVE SESSIONS`)
          .setDescription(description)
          .setColor('#f87171') // Distinct action color
          .setFooter({ text: `Page ${page} of ${maxPage} • MARATHON HUD` })
          .setTimestamp();
      };

      const generateComponents = (page) => {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('act_first')
              .setEmoji('⏮️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId('act_prev')
              .setEmoji('◀️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId('act_next')
              .setEmoji('▶️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === maxPage),
            new ButtonBuilder()
              .setCustomId('act_last')
              .setEmoji('⏭️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === maxPage)
          );
        return [row];
      };

      const response = await interaction.reply({
        embeds: [generateEmbed(currentPage)],
        components: maxPage > 1 ? generateComponents(currentPage) : [],
        fetchReply: true
      });

      if (maxPage === 1) return; // No pagination tracking needed if only 1 page

      const collector = response.createMessageComponentCollector({ time: 60000 * 5 }); // 5 mins max

      collector.on('collect', async i => {
        // Ensure only the user who ran the command can change pages
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'These buttons are only for the user who ran the command!', ephemeral: true });
        }

        if (i.customId === 'act_first') currentPage = 1;
        else if (i.customId === 'act_prev') currentPage--;
        else if (i.customId === 'act_next') currentPage++;
        else if (i.customId === 'act_last') currentPage = maxPage;

        await i.update({
          embeds: [generateEmbed(currentPage)],
          components: generateComponents(currentPage)
        });
      });

      collector.on('end', async () => {
        try {
          const disabledComponents = generateComponents(currentPage);
          disabledComponents[0].components.forEach(c => c.setDisabled(true));
          await interaction.editReply({ components: disabledComponents });
        } catch (e) {
            // Ignored, message may have been deleted by user manually
        }
      });

    } catch (error) {
      console.error('Active command error:', error);
      return interaction.reply({ content: '❌ Database error occurred while fetching active sessions.', ephemeral: true });
    }
  },
};
