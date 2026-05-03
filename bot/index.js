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
const { Client, GatewayIntentBits, Collection, Events, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const KairoMentor = require('./kairo_mentor.js');
const cron = require('node-cron');

const kairo = new KairoMentor(process.env.kairo_key);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
  allowedMentions: { parse: [], users: [], roles: [], repliedUser: false },
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


client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  // Debug: Log every message received (ignore bots)
  console.log(`📩 Message from ${message.author.username}: "${message.content}"`);

  if (!client.user || !message.mentions.has(client.user)) {
    // Debug: Log if bot was NOT mentioned
    if (client.user && message.content.includes(client.user.id)) {
      console.log("❓ Bot ID found in message but mentions.has() returned false.");
    }
    return;
  }

  console.log(`🤖 Kairo mentioned in ${message.channel.name}! Processing...`);

  try {
    // Remove mention tokens like <@123...> and clean prompt
    let prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

    if (!prompt) {
      console.log("空 prompt received.");
      return message.reply("👋 Hey there! Mention me and say something to start chatting.");
    }

    console.log(`🧠 Sending prompt to Gemini: "${prompt}"`);

    // Indicate typing status
    await message.channel.sendTyping();

    // Get response from Kairo
    const response = await kairo.chat(message.channel.id, message.author.username, prompt);

    console.log(`✅ Kairo response generated (${response.length} chars)`);

    // Discord message length limit check
    if (response.length > 2000) {
      const chunks = response.match(/[\s\S]{1,1900}/g) || [];
      for (const chunk of chunks) {
        await message.channel.send(chunk);
      }
    } else {
      await message.reply(response);
    }

  } catch (error) {
    console.error('❌ [Kairo Chat Error]', error);
    message.reply("⚠️ **KAIRO_ERROR:** I'm having a bit of trouble processing that, but I'm still here for you. Take a breath and let's keep going.");
  }
});

// --- REACTION ROLE LOGIC ---

// Configuration: Mapping emojis to Role IDs and DM Messages
// To use this, fill in the Message ID and the Emoji/Role mappings.
const REACTION_ROLES_CONFIG = {
  messageId: '1495600062796009583',
  roles: {
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

  // Check if we are monitoring this specific message (if configured)
  if (REACTION_ROLES_CONFIG.messageId && reaction.message.id !== REACTION_ROLES_CONFIG.messageId) return;

  const config = REACTION_ROLES_CONFIG.roles[reaction.emoji.name] || REACTION_ROLES_CONFIG.roles[reaction.emoji.id];
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

  if (REACTION_ROLES_CONFIG.messageId && reaction.message.id !== REACTION_ROLES_CONFIG.messageId) return;

  const config = REACTION_ROLES_CONFIG.roles[reaction.emoji.name] || REACTION_ROLES_CONFIG.roles[reaction.emoji.id];
  if (!config) return;

  try {
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(config.roleId);

    if (role && member.roles.cache.has(config.roleId)) {
      await member.roles.remove(role);
      console.log(`❌ Removed ${role.name} from ${user.username}`);

      try {
        await user.send(`The **${role.name}** role has been removed as you removed your reaction.`);
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

client.login(process.env.DISCORD_TOKEN);
