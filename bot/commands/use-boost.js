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
    )
    .addSubcommand(sub =>
      sub.setName('mini-sabotage')
        .setDescription('Target someone and deduct 50 XP from them. (Team Only)')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to sabotage')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('purple-fever')
        .setDescription('Sabotage a target. They lose 200 XP and infect people they send coins to. (Team Only)')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to infect')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('anti-viral')
        .setDescription('Protects you from any kind of sabotage for 24 hours. (Team Only)')
    )
    .addSubcommand(sub =>
      sub.setName('vampire')
        .setDescription('Reduce another user\'s total XP by half, but your own XP gets reset to 0. (Team Only)')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The user to siphon XP from')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('xp-generator')
        .setDescription('Doubles the XP multiplier for your entire squad until Sunday hard reset. (Team Only)')
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

      const teamOnlyBoosts = ['mini-sabotage', 'purple-fever', 'anti-viral', 'vampire', 'xp-generator'];
      if (teamOnlyBoosts.includes(sub)) {
        if (!user.squad || user.squad === 'Unassigned') {
          return interaction.editReply({ content: '❌ **ERROR:** This is a team-only boost and can only be used by members assigned to a squad!' });
        }
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

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        if (targetData.antiViralUntil && targetData.antiViralUntil > new Date()) {
          const embed = new EmbedBuilder()
            .setTitle('🛡️ Sabotage Neutralized!')
            .setDescription(`You tried to use a **Sabotage** on <@${targetUser.id}>, but their **Anti-Viral Shield** protected them!`)
            .setColor('#3b82f6')
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        targetData.weeklySquadXp = Math.floor((targetData.weeklySquadXp || 0) / 2);
        await targetData.save();

        const embed = new EmbedBuilder()
          .setTitle('🗡️ Sabotage Successful!')
          .setDescription(`You have successfully sabotaged <@${targetUser.id}>!\n\nTheir weekly Squad XP has been immediately cut in half. Ruthless.`)
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

      if (sub === 'mini-sabotage') {
        const targetUser = interaction.options.getUser('target');

        if (targetUser.id === interaction.user.id) {
          return interaction.editReply({ content: '❌ You cannot sabotage yourself!' });
        }

        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-mini-sabotage');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Mini-Sabotage** boost. You can purchase one from the shop!' });
        }

        const targetData = await User.findOne({ discordId: targetUser.id });
        if (!targetData) {
          return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
        }

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        if (targetData.antiViralUntil && targetData.antiViralUntil > new Date()) {
          const embed = new EmbedBuilder()
            .setTitle('🛡️ Sabotage Neutralized!')
            .setDescription(`You tried to use a **Mini-Sabotage** on <@${targetUser.id}>, but their **Anti-Viral Shield** protected them!`)
            .setColor('#3b82f6')
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        targetData.weeklySquadXp = Math.max(0, (targetData.weeklySquadXp || 0) - 50);
        await targetData.save();

        const embed = new EmbedBuilder()
          .setTitle('🗡️ Mini-Sabotage Successful!')
          .setDescription(`You have successfully sabotaged <@${targetUser.id}>!\n\nThey have lost **50 weekly Squad XP** on the squad leaderboard.`)
          .setColor('#ef4444')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'purple-fever') {
        const targetUser = interaction.options.getUser('target');

        if (targetUser.id === interaction.user.id) {
          return interaction.editReply({ content: '❌ You cannot sabotage yourself!' });
        }

        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-purple-fever');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Purple Fever** boost. You can purchase one from the shop!' });
        }

        const targetData = await User.findOne({ discordId: targetUser.id });
        if (!targetData) {
          return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
        }

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        if (targetData.antiViralUntil && targetData.antiViralUntil > new Date()) {
          const embed = new EmbedBuilder()
            .setTitle('🛡️ Sabotage Neutralized!')
            .setDescription(`You tried to infect <@${targetUser.id}> with **Purple Fever**, but their **Anti-Viral Shield** protected them!`)
            .setColor('#3b82f6')
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        targetData.weeklySquadXp = Math.max(0, (targetData.weeklySquadXp || 0) - 200);
        targetData.purpleFeverCount = 3;
        await targetData.save();

        const embed = new EmbedBuilder()
          .setTitle('🤢 Purple Fever Outbreak!')
          .setDescription(`You have successfully infected <@${targetUser.id}> with **Purple Fever**!\n\nThey have lost **200 weekly Squad XP** on the squad leaderboard and are now highly contagious. The next 3 people they send coins to will also lose **50 weekly Squad XP** each!`)
          .setColor('#8b5cf6')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'anti-viral') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-anti-viral');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own an **Anti-Viral** boost. You can purchase one from the shop!' });
        }

        user.antiViralUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('🛡️ Anti-Viral Shield Activated!')
          .setDescription(`You have successfully activated the **Anti-Viral** shield!\n\nYou are immune to all kinds of sabotage for the next **24 hours**!`)
          .setColor('#10b981')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'vampire') {
        const targetUser = interaction.options.getUser('target');

        if (targetUser.id === interaction.user.id) {
          return interaction.editReply({ content: '❌ You cannot target yourself!' });
        }

        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-vampire');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own a **Vampire** boost. You can purchase one from the shop!' });
        }

        const targetData = await User.findOne({ discordId: targetUser.id });
        if (!targetData) {
          return interaction.editReply({ content: '❌ The target user is not registered in the system.' });
        }

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        
        // Sender's weekly squad XP is reset to 0
        user.weeklySquadXp = 0;
        await user.save();

        if (targetData.antiViralUntil && targetData.antiViralUntil > new Date()) {
          const embed = new EmbedBuilder()
            .setTitle('🛡️ Vampire Blocked!')
            .setDescription(`You tried to siphon XP from <@${targetUser.id}> using **Vampire**, but their **Anti-Viral Shield** protected them! However, your weekly squad XP was still reset to 0 in the process. Devastating.`)
            .setColor('#dc2626')
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        // Halve target's weekly squad XP
        targetData.weeklySquadXp = Math.floor((targetData.weeklySquadXp || 0) / 2);
        await targetData.save();

        const embed = new EmbedBuilder()
          .setTitle('🩸 Siphoned!')
          .setDescription(`You have successfully used **Vampire** on <@${targetUser.id}>!\n\nTheir weekly squad XP has been halved! Your own weekly squad XP was reset to 0.`)
          .setColor('#dc2626')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === 'xp-generator') {
        const inventory = user.inventory || [];
        const itemIndex = inventory.indexOf('bst-xp-generator');
        if (itemIndex === -1) {
          return interaction.editReply({ content: '❌ You do not own an **XP Generator** boost. You can purchase one from the shop!' });
        }

        let squadInfo = await SquadHistory.findOne({ squadName: user.squad });
        if (!squadInfo) {
          squadInfo = await SquadHistory.create({ squadName: user.squad });
        }

        squadInfo.xpGeneratorActive = true;
        await squadInfo.save();

        inventory.splice(itemIndex, 1);
        user.inventory = inventory;
        user.markModified('inventory');
        await user.save();

        const embed = new EmbedBuilder()
          .setTitle('⚡ XP Generator Online!')
          .setDescription(`You have successfully activated the **XP Generator** for **${user.squad}**!\n\nYour entire squad's XP multiplier is now **DOUBLED** until the next Sunday weekly hard reset!`)
          .setColor('#f59e0b')
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Error in /use-boost:', error);
      return interaction.editReply({ content: '❌ An error occurred while trying to use the boost.' });
    }
  },
};
