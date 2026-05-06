const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('MARATHON_BOT_STATUS: ACTIVE');
});

app.listen(port, () => {
  console.log(`📡 Keep-alive server running on port ${port}`);
});

require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events, Partials, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const quotes = require('./quotes.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath);
}

// Load commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // Auth gate: all commands except /link require hasLinked = true
    if (interaction.commandName !== 'link') {
      const { connectDB, User } = require('../database.js');
      await connectDB();
      const userRecord = await User.findOne({ discordId: interaction.user.id });

      if (!userRecord || !userRecord.hasLinked) {
        return interaction.reply({
          content: '🚫 **ACCESS DENIED:** You must link your Discord identity to the Marathon website before using commands.\n\nRun `/link` to generate your key, then enter it at the website.',
          ephemeral: true
        });
      }
    }

    await command.execute(interaction);

  } catch (error) {
    console.error('[Command Error]', error);
    // Guard against double-acknowledge crashes
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '⚠️ An error occurred while running this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: '⚠️ An error occurred while running this command.', ephemeral: true });
      }
    } catch (replyError) {
      console.error('[Reply Error] Could not send error message:', replyError);
    }
  }
});

const { connectDB, User, Session, Task, ActiveSession } = require('../database.js');

// HEAD_ADMIN_ID: 857145663947014164

// Note: Multi-cycle automated wipes have been disabled in favor of the manual /hard-reset admin command.

// Keep bot alive — never let an unhandled rejection crash the process
process.on('unhandledRejection', (error) => {
  console.error('[Unhandled Rejection]', error);
});
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
});


// --- REACTION ROLE LOGIC ---

// Configuration: Mapping Message IDs -> Emojis -> Role IDs and DM Messages
const REACTION_ROLES_CONFIG = {
  '1495600062796009583': {
    '🎮': {
      roleId: '1491359226784645150',
      dmMessage: "✅ You now have access to the **Off-Topic** channels! Feel free to discuss gaming, music, memes, and more."
    },
    '🧑‍🎓': {
      roleId: '1491359288956944424',
      dmMessage: "✅ Welcome to the **College Hub**! You can now access channels for college applications and peer advice."
    },
    '🎉': {
      roleId: '1491868129381453976',
      dmMessage: "✅ You've joined the **Events** category! I'll ping you about upcoming server competitions and giveaways."
    },
    '🌟': {
      roleId: '1491868186101157948',
      dmMessage: "✅ You are now tracking **Opportunities**! You'll be notified of sharable opportunities in the #opportunities channel."
    },
    '🔔': {
      roleId: '1491868582684917962',
      dmMessage: "🔔 You've enabled **Reset Reminders**! I'll ping you before daily session terminations and the weekly hard reset."
    }
  },
  '1501402879942983740': {
    '💯': {
      roleId: '1501403253043368066',
      dmMessage: "💯 **MOTIVATION_SYNCED:** You are now enrolled in the daily motivational protocol. Get ready to crush your goals!",
      unreactDmMessage: "💯 **MOTIVATION_UNSYNCED:** You have opted out of the daily motivation protocol. We'll be here when you're ready to sync back up!"
    }
  }
};

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  // Handle partials (ensure we can see reactions on old messages)
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Failed to fetch reaction during add:', error);
      return;
    }
  }

  // Check if we are monitoring this specific message
  const messageConfig = REACTION_ROLES_CONFIG[reaction.message.id];
  if (!messageConfig) return;

  const config = messageConfig[reaction.emoji.name] || messageConfig[reaction.emoji.id];
  if (!config) return;

  try {
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(config.roleId);

    if (role && !member.roles.cache.has(config.roleId)) {
      await member.roles.add(role);
      console.log(`✅ Assigned ${role.name} to ${user.username}`);

      // Send custom DM
      if (config.dmMessage) {
        try {
          await user.send(config.dmMessage);
        } catch (dmError) {
          console.log(`Could not send DM to ${user.username}:`, dmError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in ReactionRoleAdd:', error);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Failed to fetch reaction during remove:', error);
      return;
    }
  }

  const messageConfig = REACTION_ROLES_CONFIG[reaction.message.id];
  if (!messageConfig) return;

  const config = messageConfig[reaction.emoji.name] || messageConfig[reaction.emoji.id];
  if (!config) return;

  try {
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(config.roleId);

    if (role && member.roles.cache.has(config.roleId)) {
      await member.roles.remove(role);
      console.log(`❌ Removed ${role.name} from ${user.username}`);

      try {
        const dm = config.unreactDmMessage || `The **${role.name}** role has been removed as you removed your reaction.`;
        await user.send(dm);
      } catch (dmError) {
        // Ignore DM errors on removal
      }
    }
  } catch (error) {
    console.error('Error in ReactionRoleRemove:', error);
  }
});

// --- SCHEDULED TASKS ---

const REMINDER_CHANNEL_ID = '1500504969684455464';
const NOTIFICATION_ROLE_ID = '1491868582684917962';

/**
 * Helper to send scheduled pings to the reminder channel
 */
async function sendReminder(message) {
  try {
    const channel = await client.channels.fetch(REMINDER_CHANNEL_ID);
    if (channel) {
      await channel.send(`<@&${NOTIFICATION_ROLE_ID}> ${message}`);
    }
  } catch (error) {
    console.error('❌ [Scheduled Task Error] Failed to send reminder:', error);
  }
}

/**
 * Terminate all active sessions every day at 4:30 AM IST (except Monday).
 * 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday
 */
cron.schedule('30 4 * * 0,2,3,4,5,6', async () => {
  console.log('⏰ [Scheduled Task] Terminating all active sessions (4:30 AM IST)...');
  try {
    await connectDB();
    const result = await ActiveSession.deleteMany({});
    console.log(`✅ [Scheduled Task] Successfully terminated ${result.deletedCount} sessions.`);
  } catch (error) {
    console.error('❌ [Scheduled Task Error] Failed to terminate sessions:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

/**
 * Daily Reset Warning: 30 minutes before termination (4:00 AM IST)
 */
cron.schedule('0 4 * * 0,2,3,4,5,6', () => {
  console.log('⏰ [Scheduled Task] Sending Daily Reset Warning...');
  sendReminder("⚠️ **DAILY_RESET_WARNING:** All active sessions will be terminated in **30 minutes** (at 4:30 AM IST). Please wrap up your sessions and submit proof!");
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

/**
 * Weekly Reset Warning: 30 minutes before hard reset (Sunday 7:00 PM IST)
 */
cron.schedule('0 19 * * 0', () => {
  console.log('⏰ [Scheduled Task] Sending Weekly Reset Warning (30m)...');
  sendReminder("⏳ **WEEKLY_WIPE_PROTOCOL:** 30 minutes remaining until the weekly hard reset! All weekly XP, sessions, and tasks will be cleared at 7:30 PM IST.");
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

/**
 * Weekly Reset Warning: 10 minutes before hard reset (Sunday 7:20 PM IST)
 */
cron.schedule('20 19 * * 0', () => {
  console.log('⏰ [Scheduled Task] Sending Weekly Reset Warning (10m)...');
  sendReminder("🚨 **CRITICAL_REMINDER:** Only 10 minutes left before the system wipe! This is your final chance to submit your work.");
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

/**
 * Daily Motivation: Send a unique quote to the motivation channel every day at 8:00 AM IST
 */
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ [Scheduled Task] Sending Daily Motivation...');
  const MOTIVATION_CHANNEL_ID = '1501403557897703574';
  const MOTIVATION_ROLE_ID = '1501403253043368066';
  
  try {
    const channel = await client.channels.fetch(MOTIVATION_CHANNEL_ID);
    if (channel) {
      // Pick a quote based on the day of the year to ensure uniqueness
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const quote = quotes[dayOfYear % quotes.length];
      
      const embed = new EmbedBuilder()
        .setTitle('🌅 DAILY_MOTIVATION_PROTOCOL')
        .setDescription(`*"${quote.text}"*`)
        .addFields({ name: '— Author', value: `**${quote.author}**` })
        .setColor('#ff0055')
        .setTimestamp()
        .setFooter({ text: 'Marathon System: Momentum' });

      await channel.send({ 
        content: `<@&${MOTIVATION_ROLE_ID}> **| SET THE TONE FOR THE DAY**`, 
        embeds: [embed] 
      });
    }
  } catch (error) {
    console.error('❌ [Scheduled Task Error] Failed to send daily motivation:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

client.login(process.env.DISCORD_TOKEN);
