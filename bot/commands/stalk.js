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

      const embed = new EmbedBuilder()
        .setTitle(`👤 PROFILE: ${userDoc.username.toUpperCase()}`)
        .setDescription(`\`ID: ${discordId}\``)
        .addFields(
          { name: 'Total XP', value: `\`${userDoc.xp.toLocaleString()} XP\``, inline: true },
          { name: 'Streak', value: `\`${userDoc.streak} Days\``, inline: true },
          { name: 'Tasks Completed', value: `\`${completedTasks}\``, inline: true },
          { name: 'Sessions Done', value: `\`${totalSessions}\``, inline: true }
        )
        .setThumbnail(userDoc.avatar || targetUser.displayAvatarURL({ extension: 'png' }))
        .setColor('#00ff9f')
        .setTimestamp()
        .setFooter({ text: 'MARATHON SYSTEM' });

      return interaction.reply({ embeds: [embed] });

    } catch (dbError) {
      console.error(dbError);
      return interaction.reply({ content: '❌ Database error occurred while fetching profile.', ephemeral: true });
    }
  },
};
