const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, SquadHistory } = require('../../database.js');

const HEAD_ADMIN_ID = '857145663947014164';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-coins')
    .setDescription('Add or remove coins from a member or team treasury (Admin Only)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of coins to add (use negative to remove)')
        .setRequired(true))
    .addUserOption(option => 
      option.setName('member')
        .setDescription('The member to add/remove coins from'))
    .addStringOption(option =>
      option.setName('team')
        .setDescription('The team treasury to add/remove coins from')
        .addChoices(
          { name: 'Zenith Sentinels', value: 'Zenith Sentinels' },
          { name: 'Apex Titans', value: 'Apex Titans' },
          { name: 'Meridian Arbiters', value: 'Meridian Arbiters' },
          { name: 'Horizon Vanguards', value: 'Horizon Vanguards' }
        )),

  async execute(interaction) {
    // Admin check
    if (interaction.user.id !== HEAD_ADMIN_ID) {
      return interaction.reply({ 
        content: '🚫 This command is restricted to the **Head Admin** only.', 
        ephemeral: true 
      });
    }

    const member = interaction.options.getUser('member');
    const team = interaction.options.getString('team');
    const amount = interaction.options.getInteger('amount');

    if (!member && !team) {
      return interaction.reply({ 
        content: '❌ You must specify either a **member** or a **team**.', 
        ephemeral: true 
      });
    }

    if (member && team) {
      return interaction.reply({ 
        content: '❌ Please specify only one: either a member **OR** a team, not both.', 
        ephemeral: true 
      });
    }

    try {
      await connectDB();

      if (member) {
        const user = await User.findOne({ discordId: member.id });
        if (!user) {
          return interaction.reply({ 
            content: `❌ **${member.username}** is not registered in the system.`, 
            ephemeral: true 
          });
        }

        user.coins = (user.coins || 0) + amount;
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('💰 Treasury Update: Personal')
          .setDescription(`${amount >= 0 ? 'Added' : 'Removed'} \`${Math.abs(amount)}\` coins ${amount >= 0 ? 'to' : 'from'} **${member.username}**'s personal treasury.`)
          .addFields({ name: 'New Balance', value: `\`${user.coins}\` coins` })
          .setColor(amount >= 0 ? '#00ff9f' : '#ef4444')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (team) {
        // Upsert squad history
        let squad = await SquadHistory.findOne({ squadName: team });
        if (!squad) {
          squad = new SquadHistory({ squadName: team, coins: 0 });
        }

        squad.coins = (squad.coins || 0) + amount;
        await squad.save();

        const squadThemes = {
          'Zenith Sentinels': '#8B5CF6',
          'Apex Titans': '#06B6D4',
          'Meridian Arbiters': '#22C55E',
          'Horizon Vanguards': '#F97316'
        };

        const embed = new EmbedBuilder()
          .setTitle('🏛️ Treasury Update: Team')
          .setDescription(`${amount >= 0 ? 'Added' : 'Removed'} \`${Math.abs(amount)}\` coins ${amount >= 0 ? 'to' : 'from'} the **${team}** treasury.`)
          .addFields({ name: 'New Balance', value: `\`${squad.coins}\` coins` })
          .setColor(squadThemes[team] || '#ffffff')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in /add-coins:', error);
      return interaction.reply({ 
        content: '❌ An error occurred while updating the treasury.', 
        ephemeral: true 
      });
    }
  },
};
