const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, Session, Task } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stalk')
    .setDescription('View another user\'s profile statistics.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user you want to stalk')
        .setRequired(true)),
        
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const discordId = targetUser.id;

    try {
      await connectDB();
      const userDoc = await User.findOne({ discordId });

      if (!userDoc) {
        return interaction.reply({ content: `🚫 **${targetUser.username}** has not joined the Marathon server yet.`, ephemeral: true });
      }

      const totalSessions = await Session.countDocuments({ discordId });
      const completedTasks = await Task.countDocuments({ discordId, isCompleted: true });

      // Calculate Rank
      const allUsers = await User.find({}).sort({ weeklyXp: -1 });
      const rank = allUsers.findIndex(u => u.discordId === discordId) + 1;

      // Calculate Squad Rank
      let squadText = '`Unassigned`';
      if (userDoc.squad && userDoc.squad !== 'Unassigned') {
         const squadUsers = allUsers.filter(u => u.squad === userDoc.squad);
         const squadRank = squadUsers.findIndex(u => u.discordId === discordId) + 1;
         squadText = `**${userDoc.squad}** (#${squadRank} in squad)`;
      }

      // Group inventory items
      const inventory = userDoc.inventory || [];
      const itemCounts = {};
      inventory.forEach(id => {
        itemCounts[id] = (itemCounts[id] || 0) + 1;
      });

      const formatItemName = (id) => {
        // Simple mapping for common items to look better
        const names = {
          'np-default': 'Standard Nameplate',
          'pfp-default': 'Basic PFP Border',
          'fnt-default': 'Monospace Font',
          'bst-2x-sess': '2x XP Boost (Session)',
          'bst-1.5x-hour': '1.5x XP Boost (Hour)',
          'bst-2x-day': '2x XP Daily Rush',
          'bst-streak-prot': 'Streak Protection'
        };
        if (names[id]) return names[id];
        
        // Fallback: clean up the ID
        return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };

      const inventoryText = Object.entries(itemCounts).map(([id, count]) => {
        const name = formatItemName(id);
        return `• ${name}${count > 1 ? ` **(x${count})**` : ''}`;
      }).join('\n') || '`Empty Inventory`';

      // Dynamically calculate display streak
      let displayStreak = userDoc.streak ?? 1;
      if (userDoc.lastActive) {
        const getSessionDate = (date) => {
          const d = new Date(date);
          d.setHours(d.getHours() - 4);
          d.setMinutes(d.getMinutes() - 30);
          d.setHours(0, 0, 0, 0);
          return d;
        };
        const currentSession = getSessionDate(new Date());
        const lastSession = getSessionDate(userDoc.lastActive);
        const diffDays = Math.round((currentSession.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          if (!(userDoc.streakProtection && diffDays === 2)) {
            displayStreak = 1;
          }
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`👤 PROFILE: ${userDoc.username.toUpperCase()}`)
        .setDescription(`\`STATUS: RUNNING\` | \`ID: ${discordId}\``)
        .addFields(
          { name: 'Squad', value: squadText, inline: false },
          { name: 'Global Rank', value: `#**${rank}**`, inline: true },
          { name: 'Weekly XP', value: `\`${(userDoc.weeklyXp || 0).toLocaleString()} XP\``, inline: true },
          { name: 'Personal Treasury', value: `\`${(userDoc.coins || 0).toLocaleString()} Coins\``, inline: true },
          { name: 'Total XP', value: `\`${userDoc.xp.toLocaleString()} XP\``, inline: true },
          { name: 'Streak', value: `\`${displayStreak} Days\``, inline: true },
          { name: 'Tasks Completed', value: `\`${completedTasks}\``, inline: true },
          { name: 'Sessions Done', value: `\`${totalSessions}\``, inline: true },
          { name: '🎒 Inventory', value: inventoryText, inline: false }
        )
        .setThumbnail(userDoc.avatar || targetUser.displayAvatarURL({ extension: 'png' }))
        .setColor('#00ff9f')
        .setTimestamp()
        .setFooter({ text: 'MARATHON SYSTEM | Agent Profile' });

      return interaction.reply({ embeds: [embed] });

    } catch (dbError) {
      console.error(dbError);
      return interaction.reply({ content: '❌ Database error occurred while fetching profile.', ephemeral: true });
    }
  },
};
