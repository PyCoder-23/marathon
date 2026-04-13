const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { connectDB, User } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top agents on the Marathon Server.'),

  async execute(interaction) {
    try {
      await connectDB();

      // Get all users sorted by weeklyXp desc
      const allUsers = await User.find({}).sort({ weeklyXp: -1 });

      if (allUsers.length === 0) {
        return interaction.reply({ 
          content: 'The database is currently empty. No active agents found.', 
          ephemeral: true 
        });
      }

      const perPage = 10;
      const maxPage = Math.ceil(allUsers.length / perPage) || 1;
      let currentPage = 1;

      const generateEmbed = (page) => {
        const start = (page - 1) * perPage;
        const currentChunk = allUsers.slice(start, start + perPage);

        let description = '';
        currentChunk.forEach((u, index) => {
          const rank = start + index + 1;
          let rankDisplay = `\`#${rank}\``;
          if (rank === 1) rankDisplay = '🥇';
          else if (rank === 2) rankDisplay = '🥈';
          else if (rank === 3) rankDisplay = '🥉';

          description += `${rankDisplay} **${u.username}** — \`${u.weeklyXp || 0} XP\` (Streak: \`${u.streak || 0}d\`)\n`;
        });

        return new EmbedBuilder()
          .setTitle(`🏆 WEEKLY LEADERBOARD`)
          .setDescription(description)
          .setColor('#00ff9f')
          .setFooter({ text: `Page ${page} of ${maxPage} • MARATHON HUD` })
          .setTimestamp();
      };

      const generateComponents = (page) => {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('lb_first')
              .setEmoji('⏮️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId('lb_prev')
              .setEmoji('◀️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId('lb_next')
              .setEmoji('▶️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === maxPage),
            new ButtonBuilder()
              .setCustomId('lb_last')
              .setEmoji('⏭️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(page === maxPage)
          );
        return [row];
      };

      // Initial Reply
      const response = await interaction.reply({
        embeds: [generateEmbed(currentPage)],
        components: generateComponents(currentPage),
        fetchReply: true
      });

      // Collector for pagination buttons
      const collector = response.createMessageComponentCollector({ time: 60000 * 5 }); // 5 minutes

      collector.on('collect', async i => {
        // Ensure only the user who ran the command can change pages
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'These buttons are only for the user who ran the command!', ephemeral: true });
        }

        if (i.customId === 'lb_first') currentPage = 1;
        else if (i.customId === 'lb_prev') currentPage--;
        else if (i.customId === 'lb_next') currentPage++;
        else if (i.customId === 'lb_last') currentPage = maxPage;

        await i.update({
          embeds: [generateEmbed(currentPage)],
          components: generateComponents(currentPage)
        });
      });

      collector.on('end', async () => {
        // Disable buttons when time runs out to clean up UI
        try {
          const disabledComponents = generateComponents(currentPage);
          disabledComponents[0].components.forEach(c => c.setDisabled(true));
          await interaction.editReply({ components: disabledComponents });
        } catch (e) {
          // Message might have been deleted, ignore
        }
      });

    } catch (error) {
      console.error('Leaderboard command error:', error);
      return interaction.reply({ content: '❌ Database error occurred while fetching the leaderboard.', ephemeral: true });
    }
  },
};
