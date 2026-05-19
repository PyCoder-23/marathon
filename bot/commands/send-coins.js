const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, SquadHistory } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-coins')
    .setDescription('Send coins to another user or to a squad treasury.')
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('Send coins to another user.')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount of coins to send')
            .setRequired(true)
        )
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to receive the coins')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('squad')
        .setDescription('Send coins to a squad treasury.')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount of coins to send')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('squad_name')
            .setDescription('The squad to receive the coins')
            .setRequired(true)
            .addChoices(
              { name: 'Zenith Sentinels', value: 'Zenith Sentinels' },
              { name: 'Apex Titans', value: 'Apex Titans' },
              { name: 'Meridian Arbiters', value: 'Meridian Arbiters' },
              { name: 'Horizon Vanguards', value: 'Horizon Vanguards' }
            )
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger('amount');
    const discordId = interaction.user.id;

    if (amount <= 0) {
      return interaction.editReply({ content: '❌ Amount must be a positive integer.' });
    }

    try {
      await connectDB();
      const sender = await User.findOne({ discordId });
      if (!sender) {
        return interaction.editReply({ content: '❌ You must join the Marathon server first.' });
      }

      if ((sender.coins || 0) < amount) {
        return interaction.editReply({ content: `❌ You do not have enough coins! You only have **${(sender.coins || 0).toLocaleString()}** coins.` });
      }

      if (sub === 'user') {
        const targetUser = interaction.options.getUser('target');
        if (targetUser.id === discordId) {
          return interaction.editReply({ content: '❌ You cannot send coins to yourself!' });
        }

        const receiver = await User.findOne({ discordId: targetUser.id });
        if (!receiver) {
          return interaction.editReply({ content: '❌ The target user is not registered in the Marathon system.' });
        }

        // Deduct and add
        sender.coins -= amount;
        receiver.coins = (receiver.coins || 0) + amount;

        await sender.save();
        await receiver.save();

        const embed = new EmbedBuilder()
          .setTitle('🪙 Coins Transferred!')
          .setDescription(`You successfully sent **${amount.toLocaleString()}** coins to <@${targetUser.id}>!\n\nYour remaining balance: **${sender.coins.toLocaleString()}** coins.`)
          .setColor('#eab308')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'squad') {
        const squadName = interaction.options.getString('squad_name');
        
        let squad = await SquadHistory.findOne({ squadName });
        if (!squad) {
          squad = new SquadHistory({ squadName, coins: 0 });
        }

        sender.coins -= amount;
        squad.coins = (squad.coins || 0) + amount;

        await sender.save();
        await squad.save();

        const embed = new EmbedBuilder()
          .setTitle('🪙 Squad Treasury Contribution!')
          .setDescription(`You successfully contributed **${amount.toLocaleString()}** coins to **${squadName}**'s treasury!\n\nYour remaining balance: **${sender.coins.toLocaleString()}** coins.`)
          .setColor('#3b82f6')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in /send-coins:', error);
      return interaction.editReply({ content: '❌ An error occurred while sending coins.' });
    }
  }
};
