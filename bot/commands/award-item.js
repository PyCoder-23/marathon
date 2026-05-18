const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('award-item')
    .setDescription('Award an item to a user (Head Admin only).')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to award the item to')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('item_id')
        .setDescription('The ID of the item to award (e.g. bst-2x-sess, np-infernal)')
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
      const itemId = interaction.options.getString('item_id');

      const user = await User.findOne({ discordId: targetUser.id });
      if (!user) {
        return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
      }

      const inventory = user.inventory || [];
      inventory.push(itemId);
      user.inventory = inventory;
      user.markModified('inventory');
      
      await user.save();

      return interaction.editReply({ 
        content: `✅ Successfully awarded **${itemId}** to <@${targetUser.id}>!`
      });

    } catch (error) {
      console.error(error);
      return interaction.editReply({ content: '❌ An error occurred while awarding the item.' });
    }
  },
};
