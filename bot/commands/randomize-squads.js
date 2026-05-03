const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

const SQUADS = [
  { name: 'Zenith Sentinels', roleId: '1500526060146790642' },
  { name: 'Apex Titans', roleId: '1500525530993131621' },
  { name: 'Meridian Arbiters', roleId: '1500525923097645312' },
  { name: 'Horizon Vanguards', roleId: '1500526258302357666' }
];

const ALL_ROLE_IDS = SQUADS.map(s => s.roleId);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomize-squads')
    .setDescription('HEAD ADMIN ONLY: Randomize and evenly distribute all users into new squads.'),

  async execute(interaction) {
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** Only the Head Admin can run this command.', 
        ephemeral: true 
      });
    }

    await interaction.deferReply({ ephemeral: false });

    try {
      await connectDB();
      const users = await User.find({});
      
      if (users.length === 0) {
        return interaction.editReply({ content: 'No registered users found.' });
      }

      await interaction.editReply({ content: `🔄 **Starting Squad Randomization for ${users.length} users...** This may take a minute.` });

      // Shuffle array (Fisher-Yates)
      for (let i = users.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [users[i], users[j]] = [users[j], users[i]];
      }

      const guild = interaction.guild;
      if (!guild) {
         return interaction.editReply({ content: '❌ Must be run in a server.' });
      }

      let successCount = 0;
      let failCount = 0;

      // Distribute evenly
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const assignedSquad = SQUADS[i % SQUADS.length];
        
        user.squad = assignedSquad.name;
        await user.save();

        try {
          // Update Discord Roles
          const member = await guild.members.fetch(user.discordId).catch(() => null);
          if (member) {
            // Remove old squad roles
            const rolesToRemove = member.roles.cache.filter(role => ALL_ROLE_IDS.includes(role.id) && role.id !== assignedSquad.roleId);
            if (rolesToRemove.size > 0) {
              await member.roles.remove(rolesToRemove);
            }
            // Add new squad role
            if (!member.roles.cache.has(assignedSquad.roleId)) {
              await member.roles.add(assignedSquad.roleId);
            }
            successCount++;
          } else {
            // User not in server
            failCount++;
          }
        } catch (e) {
          console.error(`Failed to update roles for ${user.username}:`, e);
          failCount++;
        }
      }

      return interaction.editReply({ 
        content: `✅ **Randomization Complete!**\n\n- **Users processed:** ${users.length}\n- **Successfully updated roles:** ${successCount}\n- **Could not update roles (not in server/error):** ${failCount}\n\nAll database entries have been updated.`
      });

    } catch (error) {
      console.error('Error in /randomize-squads:', error);
      return interaction.editReply({ content: '❌ Database error occurred during randomization.' });
    }
  },
};
