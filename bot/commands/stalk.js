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

      const embed = new EmbedBuilder()
        .setTitle(`👤 PROFILE: ${userDoc.username.toUpperCase()}`)
        .setDescription(`\`STATUS: RUNNING\` | \`ID: ${discordId}\``)
        .addFields(
          { name: 'Rank', value: `#**${rank}**`, inline: true },
          { name: 'Weekly XP', value: `\`${(userDoc.weeklyXp || 0).toLocaleString()} XP\``, inline: true },
          { name: 'Streak', value: `\`${userDoc.streak} Days\``, inline: true },
          { name: 'Total XP', value: `\`${userDoc.xp.toLocaleString()} XP\``, inline: true },
          { name: 'Tasks Completed', value: `\`${completedTasks}\``, inline: true },
          { name: 'Sessions Done', value: `\`${totalSessions}\``, inline: true }
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
