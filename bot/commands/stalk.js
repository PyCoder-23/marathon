const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, Session, Task, SquadHistory } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stalk')
    .setDescription('View another user\'s or team\'s profile statistics.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user you want to stalk')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('team')
        .setDescription('The team you want to stalk')
        .setRequired(false)
        .addChoices(
          { name: 'Zenith Sentinels', value: 'Zenith Sentinels' },
          { name: 'Apex Titans', value: 'Apex Titans' },
          { name: 'Meridian Arbiters', value: 'Meridian Arbiters' },
          { name: 'Horizon Vanguards', value: 'Horizon Vanguards' }
        )),
        
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const targetTeam = interaction.options.getString('team');

    if (!targetUser && !targetTeam) {
      return interaction.reply({ content: '🚫 Please specify either a `target` user or a `team` to stalk.', ephemeral: true });
    }

    if (targetUser && targetTeam) {
      return interaction.reply({ content: '🚫 Please specify either a `target` user OR a `team`, not both.', ephemeral: true });
    }

    if (targetTeam) {
      try {
        await connectDB();
        
        const squadHistory = await SquadHistory.findOne({ squadName: targetTeam });
        const memberCount = await User.countDocuments({ squad: targetTeam });
        
        const xpStats = await User.aggregate([
          { $match: { squad: targetTeam } },
          { $group: { 
              _id: null, 
              totalXp: { $sum: "$xp" }, 
              weeklySquadXp: { $sum: "$weeklySquadXp" } 
            } 
          }
        ]);
        
        const totalXp = xpStats.length > 0 ? xpStats[0].totalXp : 0;
        const weeklyXp = xpStats.length > 0 ? xpStats[0].weeklySquadXp : 0;
        
        const topMember = await User.findOne({ squad: targetTeam }).sort({ weeklySquadXp: -1 });
        const topMemberText = topMember ? `${topMember.username} (${(topMember.weeklySquadXp || 0).toLocaleString()} XP)` : '`None`';

        const embed = new EmbedBuilder()
          .setTitle(`🛡️ TEAM PROFILE: ${targetTeam.toUpperCase()}`)
          .setDescription(`\`STATUS: ACTIVE\` | \`MEMBERS: ${memberCount}\``)
          .addFields(
            { name: 'Team Treasury', value: `\`${(squadHistory?.coins || 0).toLocaleString()} Coins\``, inline: true },
            { name: 'All-Time Wins', value: `\`${squadHistory?.allTimeWins || 0}\``, inline: true },
            { name: 'Current Win Streak', value: `\`${squadHistory?.winStreak || 0}\``, inline: true },
            { name: 'Total XP', value: `\`${totalXp.toLocaleString()} XP\``, inline: true },
            { name: 'Weekly Squad XP', value: `\`${weeklyXp.toLocaleString()} XP\``, inline: true },
            { name: 'Current MVP', value: topMemberText, inline: true }
          )
          .setColor('#ffaa00')
          .setTimestamp()
          .setFooter({ text: 'MARATHON SYSTEM | Team Profile' });

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        return interaction.reply({ content: '❌ Database error occurred while fetching team profile.', ephemeral: true });
      }
    }

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
         const allSquadUsers = await User.find({ squad: userDoc.squad }).sort({ weeklySquadXp: -1 });
         const squadRank = allSquadUsers.findIndex(u => u.discordId === discordId) + 1;
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
      let displayStreak = userDoc.streak ?? 0;
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
            displayStreak = 0;
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
          { name: 'Weekly Squad XP', value: `\`${(userDoc.weeklySquadXp || 0).toLocaleString()} XP\``, inline: true },
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
