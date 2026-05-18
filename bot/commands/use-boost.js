const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { connectDB, User, ActiveSession, SquadHistory, GlobalConfig } = require('../../database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('use-boost')
    .setDescription('Consume a boost from your inventory.')
    .addSubcommand(sub => 
      sub.setName('2x-session')
         .setDescription('Apply a 2x XP boost to your currently active session.')
    )
    .addSubcommand(sub =>
      sub.setName('1-5x-hour')
         .setDescription('Apply a 1.5x XP boost for the first hour of your active session.')
    )
    .addSubcommand(sub =>
      sub.setName('streak-protection')
         .setDescription('Activate Streak Protection to save your streak if you miss a day.')
    )
    .addSubcommand(sub =>
      sub.setName('weekend-rush')
         .setDescription('Activate the Weekend Rush Amplifier (Friday 7:30 PM - Sunday 7:30 PM).')
    )
    .addSubcommand(sub =>
      sub.setName('2x-day')
         .setDescription('Activate 2x XP Daily Rush for the rest of the current day (until 4:30 AM).')
    )
    .addSubcommand(sub =>
      sub.setName('squad-boost')
         .setDescription('Activate a 1.2x XP multiplier for your entire squad for the current day.')
    )
    .addSubcommand(sub =>
      sub.setName('10x-global')
         .setDescription('Secretly trigger a 10x GLOBAL XP multiplier for 1 hour. Be careful.')
    )
    .addSubcommand(sub =>
      sub.setName('sabotage')
         .setDescription('Target someone and instantly halve their weekly XP.')
         .addUserOption(option => 
            option.setName('target')
                  .setDescription('The user to sabotage')
                  .setRequired(true)
         )
    )
    .addSubcommand(sub =>
      sub.setName('2x-week')
         .setDescription('Activate a permanent 2x XP multiplier for the rest of the week (until hard reset).')
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    const discordId = interaction.user.id;

    try {
      await connectDB();
      const user = await User.findOne({ discordId });

      if (!user) {
        return interaction.editReply({ content: '❌ You must join the Marathon server first.' });
      }

      if (sub === '2x-session') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-2x-sess');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **2x XP Session Boost**. You can purchase one from the shop!' });
        }

        const session = await ActiveSession.findOne({ discordId });
        if (!session) {
          return interaction.editReply({ content: '❌ You must have an **active session** to use this boost. Start your timer first!' });
        }

        session.multiplier = (session.multiplier || 1) * 2;
        await session.save();

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🔥 Boost Activated!')
          .setDescription('You have successfully applied the **2x XP Session Boost** to your current session!\n\nKeep focused, because everything you earn this session is now worth double!')
          .setColor('#00ff9f')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === '1-5x-hour') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-1.5x-hour');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **1.5x XP Hour Boost**. You can purchase one from the shop!' });
        }

        const session = await ActiveSession.findOne({ discordId });
        if (!session) {
          return interaction.editReply({ content: '❌ You must have an **active session** to use this boost. Start your timer first!' });
        }

        session.hourBoost = true;
        session.hourBoostMultiplier = (session.hourBoostMultiplier || 1) * 1.5;
        await session.save();

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('⚡ Boost Activated!')
          .setDescription('You have successfully applied the **1.5x XP Hour Boost** to your current session!\n\nFor up to exactly **1 Hour** (60 minutes) of this session, you will earn 1.5x XP!')
          .setColor('#3b82f6')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'streak-protection') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-streak-prot');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Streak Protection**. You can purchase one from the shop!' });
        }

        if (user.streakProtection) {
          return interaction.editReply({ content: '❌ You already have an active Streak Protection! It will remain active until you miss a day.' });
        }

        user.streakProtection = true;

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🛡️ Protection Activated!')
          .setDescription('You have successfully applied **Streak Protection**!\n\nYour streak is now protected from a single missed day. If you miss a day, it will simply freeze instead of resetting!')
          .setColor('#eab308')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'weekend-rush') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-wr-amp');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Weekend Rush Amplifier**. You can purchase one from the shop!' });
        }

        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeString = hours + (minutes / 60);

        let isWeekendRush = false;
        if (day === 5 && timeString >= 19.5) isWeekendRush = true;
        if (day === 6) isWeekendRush = true;
        if (day === 0 && timeString < 19.5) isWeekendRush = true;

        if (!isWeekendRush) {
          return interaction.editReply({ content: '❌ The **Weekend Rush Amplifier** can only be activated between Friday 7:30 PM and Sunday 7:30 PM.' });
        }

        user.weekendRushMultiplier = (user.weekendRushMultiplier || 1) * 1.5;

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🚀 Weekend Rush Activated!')
          .setDescription('You have successfully applied the **Weekend Rush Amplifier**!\n\nAll your sessions will automatically earn a personal **1.5x XP** multiplier until the next weekly hard reset. Make the most of this weekend!')
          .setColor('#8b5cf6')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === '2x-day') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-2x-day');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **2x XP Daily Rush**. You can purchase one from the shop!' });
        }

        const getSessionDate = (date) => {
          const d = new Date(date);
          d.setHours(d.getHours() - 4);
          d.setMinutes(d.getMinutes() - 30);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        if (user.dailyRushDate && getSessionDate(new Date()).getTime() === getSessionDate(user.dailyRushDate).getTime()) {
          user.dailyRushMultiplier = (user.dailyRushMultiplier || 1) * 2;
        } else {
          user.dailyRushDate = new Date();
          user.dailyRushMultiplier = 2;
        }

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('⚡ Daily Rush Activated!')
          .setDescription('You have successfully applied the **2x XP Daily Rush**!\n\nAll your sessions will earn a personal **2x XP** multiplier for the rest of today (until the 4:30 AM session reset).')
          .setColor('#eab308')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'squad-boost') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-sq-boost');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Squad Contribution Booster**. You can purchase one from the shop!' });
        }

        if (!user.squad || user.squad === 'Unassigned') {
          return interaction.editReply({ content: '❌ You must be assigned to a Squad to use this boost!' });
        }

        let squadInfo = await SquadHistory.findOne({ squadName: user.squad });
        if (!squadInfo) {
          squadInfo = await SquadHistory.create({ squadName: user.squad });
        }

        const getSessionDate = (date) => {
          const d = new Date(date);
          d.setHours(d.getHours() - 4);
          d.setMinutes(d.getMinutes() - 30);
          d.setHours(0, 0, 0, 0);
          return d;
        };

        if (squadInfo.boostDate && getSessionDate(new Date()).getTime() === getSessionDate(squadInfo.boostDate).getTime()) {
          squadInfo.squadMultiplier = (squadInfo.squadMultiplier || 1) * 1.2;
        } else {
          squadInfo.boostDate = new Date();
          squadInfo.squadMultiplier = 1.2;
        }
        await squadInfo.save();

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🛡️ Squad Boost Activated!')
          .setDescription(`You have successfully applied the **Squad Contribution Booster** for **${user.squad}**!\n\nAll members of your squad will earn a **1.2x XP** multiplier for the rest of today (until the 4:30 AM reset).`)
          .setColor('#ff4757')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === '10x-global') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-10x-global');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own **The Global Catalyst**. You can purchase it from the shop!' });
        }

        const oneHourFromNow = Date.now() + 60 * 60 * 1000;
        await GlobalConfig.findOneAndUpdate(
           { key: 'global_10x_end_time' },
           { value: oneHourFromNow, updatedAt: new Date() },
           { upsert: true, new: true }
        );

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🩸 The Catalyst has been triggered.')
          .setDescription('You have secretly unleashed the **10x Global Multiplier**!\n\nFor exactly **1 Hour** from right now, anyone who ends a session will receive 10x XP. Keep this secret to yourself, or share it with your squad.')
          .setColor('#dc2626')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'sabotage') {
        const targetUser = interaction.options.getUser('target');
        
        if (targetUser.id === interaction.user.id) {
           return interaction.editReply({ content: '❌ You cannot sabotage yourself!' });
        }

        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-sabotage');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Sabotage** boost. You can purchase one from the shop!' });
        }

        const targetData = await User.findOne({ discordId: targetUser.id });
        if (!targetData) {
          return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
        }

        targetData.weeklyXp = Math.floor(targetData.weeklyXp / 2);
        await targetData.save();

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🗡️ Sabotage Successful!')
          .setDescription(`You have successfully sabotaged <@${targetUser.id}>!\n\nTheir weekly XP has been immediately cut in half. Ruthless.`)
          .setColor('#000000')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === '2x-week') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-2x-week');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **2x XP Weekly Rush**. You can purchase one from the shop!' });
        }

        user.weeklyRushMultiplier = (user.weeklyRushMultiplier || 1) * 2;

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🚀 Weekly Rush Activated!')
          .setDescription('You have successfully applied the **2x XP Weekly Rush**!\n\nAll your sessions will automatically earn a personal **2x XP** multiplier until the next weekly hard reset.')
          .setColor('#ef4444')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in /use-boost:', error);
      return interaction.editReply({ content: '❌ An error occurred while trying to use the boost.' });
    }
  },
};
