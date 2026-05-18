const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wipe-user')
    .setDescription("Wipe a user's inventory, items, and coins (Head Admin only).")
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to wipe')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** This command is strictly reserved for the Head Admin.', 
        ephemeral: true 
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      await connectDB();

      const targetUser = interaction.options.getUser('target');

      const user = await User.findOne({ discordId: targetUser.id });
      if (!user) {
        return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
      }

      user.inventory = [];
      user.equippedHistory = [];
      user.equippedItems = ['np-default', 'pfp-default', 'fnt-default'];
      user.coins = 0;
      user.streakProtection = false;
      user.weekendRushMultiplier = 1;
      user.weeklyRushMultiplier = 1;
      user.dailyRushMultiplier = 1;
      user.dailyRushDate = null;
      
      user.markModified('inventory');
      user.markModified('equippedHistory');
      user.markModified('equippedItems');
      
      await user.save();

      return interaction.editReply({ 
        content: `✅ Successfully wiped all items, inventory, and coins from <@${targetUser.id}>. They have been reset to defaults.`
      });

    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: '❌ An error occurred while wiping the user.' });
    }
  },
};
