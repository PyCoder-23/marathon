const { SlashCommandBuilder } = require('discord.js');
const { connectDB, User } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';
const MOD_ROLE_ID = '1421059467088363580';

const SQUAD_ROLES = {
  'Zenith Sentinels': '1500526060146790642',
  'Apex Titans': '1500525530993131621',
  'Meridian Arbiters': '1500525923097645312',
  'Horizon Vanguards': '1500526258302357666',
  'Unassigned': null
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-squad')
    .setDescription('MOD ONLY: Manually reassign a user to a squad.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to reassign')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('squad')
        .setDescription('The squad to assign them to')
        .setRequired(true)
        .addChoices(
          { name: 'Zenith Sentinels', value: 'Zenith Sentinels' },
          { name: 'Apex Titans', value: 'Apex Titans' },
          { name: 'Meridian Arbiters', value: 'Meridian Arbiters' },
          { name: 'Horizon Vanguards', value: 'Horizon Vanguards' },
          { name: 'Unassigned', value: 'Unassigned' }
        )),

  async execute(interaction) {
    const isMod = interaction.member?.roles.cache.has(MOD_ROLE_ID);

    if (interaction.user.id !== HEAD_ADMIN_ID && !isMod) {
      return interaction.reply({ 
        content: '🚫 **ACCESS DENIED:** You do not have permission to reassign squads.', 
        ephemeral: true 
      });
    }

    const targetUser = interaction.options.getUser('user');
    const newSquad = interaction.options.getString('squad');

    await interaction.deferReply({ ephemeral: true });

    try {
      await connectDB();
      const userDoc = await User.findOne({ discordId: targetUser.id });

      if (!userDoc) {
        return interaction.editReply({ content: '❌ Target user is not registered in the Marathon system.' });
      }

      const oldSquad = userDoc.squad;
      
      if (oldSquad === newSquad) {
        return interaction.editReply({ content: `⚠️ ${targetUser.username} is already in **${newSquad}**.` });
      }

      userDoc.squad = newSquad;
      await userDoc.save();

      // Attempt to update Discord roles
      try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        // Remove old role
        if (oldSquad && SQUAD_ROLES[oldSquad]) {
          await member.roles.remove(SQUAD_ROLES[oldSquad]);
        }

        // Add new role
        if (newSquad && SQUAD_ROLES[newSquad]) {
          await member.roles.add(SQUAD_ROLES[newSquad]);
        }
      } catch (roleErr) {
        console.error('Failed to update squad roles on Discord:', roleErr);
        return interaction.editReply({ 
          content: `✅ Database updated: **${targetUser.username}** moved from **${oldSquad}** to **${newSquad}**.\n⚠️ Note: Could not update Discord roles automatically.` 
        });
      }

      console.log(`[ADMIN] ${interaction.user.tag} reassigned ${targetUser.username} from ${oldSquad} to ${newSquad}`);

      return interaction.editReply({ 
        content: `✅ Successfully reassigned **${targetUser.username}** to **${newSquad}**.` 
      });

    } catch (error) {
      console.error('Error in /set-squad:', error);
      return interaction.editReply({ content: '❌ Database error occurred.' });
    }
  },
};
