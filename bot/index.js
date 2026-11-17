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
const { Client, GatewayIntentBits, Collection, Events, Partials, EmbedBuilder, MessageType } = require('discord.js');
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
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
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

const { connectDB, User, Session, Task, ActiveSession, GlobalConfig, BoardPost } = require('../database.js');

// --- CHANNEL & ROLE CONSTANTS ---
const HEAD_ADMIN_ID = '857145663947014164';
const HONEYPOT_CHANNEL_ID = '1570490244392943717';
const AIRPORT_CHANNEL_ID = '1420751016063799309';
const LINK_COMMAND_CHANNEL_ID = '1489536657701994496';
const STARBOARD_CHANNEL_ID = '1572333945088118927';
const SKULLBOARD_CHANNEL_ID = '1572333797469327502';
const ANTI_GHOST_PING_CHANNEL_ID = '1572338261957939251';
const POSITIVITY_CHANNEL_ID = '1501403557897703574';
const POSITIVITY_ROLE_ID = '1501403253043368066';
const BOARD_REACTION_THRESHOLD = 5;

// --- 1. AIRPORT WELCOME PROTOCOL ---
const recentlyWelcomedUsers = new Set();

async function sendAirportWelcome(userObj) {
  if (!userObj || userObj.bot) return;
  if (recentlyWelcomedUsers.has(userObj.id)) return;

  recentlyWelcomedUsers.add(userObj.id);
  setTimeout(() => recentlyWelcomedUsers.delete(userObj.id), 5 * 60 * 1000);

  try {
    const channel = await client.channels.fetch(AIRPORT_CHANNEL_ID);
    if (!channel) return;

    const avatarUrl = typeof userObj.displayAvatarURL === 'function'
      ? userObj.displayAvatarURL({ extension: 'png', size: 256 })
      : null;

    const embed = new EmbedBuilder()
      .setTitle('🌅 WELCOME TO PROJECT MARATHON')
      .setDescription(
        `Welcome aboard, <@${userObj.id}>! We are genuinely glad to have you here.\n\n` +
        `Greatness isn't built in a single burst of effort — it's forged through quiet, relentless daily consistency. Every focused session you put in here brings you one step closer to the person you are trying to become.\n\n` +
        `**🚀 How to Get Verified & Start Your Journey:**\n` +
        `1. Head over to <#${LINK_COMMAND_CHANNEL_ID}> and run \`/link\`.\n` +
        `2. Check your DMs for your unique 8-character code.\n` +
        `3. Enter the code at **https://project-marathon.vercel.app/join** to claim your **@member** role and get drafted into your Squad!\n\n` +
        `*It's not about the sprint; it's about the marathon. Let's build something extraordinary together!*`
      )
      .setColor('#00ff9f')
      .setTimestamp()
      .setFooter({ text: 'Marathon System • Discipline & Consistency' });

    if (avatarUrl) {
      embed.setThumbnail(avatarUrl);
    }

    await channel.send({
      content: `👋 Everyone welcome <@${userObj.id}> to **Marathon Server**!`,
      embeds: [embed]
    });
    console.log(`🛬 [Airport] Welcomed new member ${userObj.tag || userObj.username} (${userObj.id})`);
  } catch (err) {
    console.error('❌ [Airport Welcome Error]:', err);
  }
}

client.on(Events.GuildMemberAdd, async (member) => {
  await sendAirportWelcome(member.user);
});

// --- 3. ANTI-GHOST-PING CACHE & DETECTOR ---
// Map<messageId, { authorId, authorTag, authorAvatar, channelId, content, humanMentions, roleMentions, mentionsEveryone, createdAt }>
const recentPingMessages = new Map();

function cacheMessageIfPing(message) {
  if (!message.guild || message.author?.bot) return;
  if (message.channelId === HONEYPOT_CHANNEL_ID) return;

  const humanMentions = Array.from(message.mentions?.users?.values() || [])
    .filter(u => !u.bot && u.id !== message.author.id)
    .map(u => u.id);

  const roleMentions = Array.from(message.mentions?.roles?.values() || [])
    .map(r => r.id);

  const mentionsEveryone = Boolean(message.mentions?.everyone);

  if (humanMentions.length === 0 && roleMentions.length === 0 && !mentionsEveryone) {
    return;
  }

  recentPingMessages.set(message.id, {
    authorId: message.author.id,
    authorTag: message.author.tag || message.author.username,
    authorAvatar: typeof message.author.displayAvatarURL === 'function'
      ? message.author.displayAvatarURL({ extension: 'png' })
      : null,
    channelId: message.channelId,
    content: message.content || '',
    humanMentions,
    roleMentions,
    mentionsEveryone,
    createdAt: message.createdTimestamp || Date.now()
  });

  // Prune entries older than 24 hours to keep memory bounded
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [msgId, data] of recentPingMessages.entries()) {
    if (data.createdAt < cutoff) {
      recentPingMessages.delete(msgId);
    }
  }
}

client.on(Events.MessageDelete, async (message) => {
  try {
    if (message.channelId === HONEYPOT_CHANNEL_ID) return;

    const cached = recentPingMessages.get(message.id);
    recentPingMessages.delete(message.id);

    let authorId = cached?.authorId || message.author?.id;
    let authorTag = cached?.authorTag || message.author?.tag || message.author?.username || 'Unknown User';
    let authorAvatar = cached?.authorAvatar || (typeof message.author?.displayAvatarURL === 'function' ? message.author.displayAvatarURL({ extension: 'png' }) : null);
    let channelId = cached?.channelId || message.channelId;
    let content = cached ? cached.content : (message.content || '');

    if (!cached && message.author?.bot) return;

    const humanMentions = cached
      ? cached.humanMentions
      : Array.from(message.mentions?.users?.values() || [])
          .filter(u => !u.bot && u.id !== authorId)
          .map(u => u.id);

    const roleMentions = cached
      ? cached.roleMentions
      : Array.from(message.mentions?.roles?.values() || []).map(r => r.id);

    const mentionsEveryone = cached ? cached.mentionsEveryone : Boolean(message.mentions?.everyone);

    if (!authorId || (humanMentions.length === 0 && roleMentions.length === 0 && !mentionsEveryone)) {
      return;
    }

    const targetParts = [
      ...humanMentions.map(id => `<@${id}>`),
      ...roleMentions.map(id => `<@&${id}>`),
      ...(mentionsEveryone ? ['@everyone / @here'] : [])
    ];

    const logChannel = await client.channels.fetch(ANTI_GHOST_PING_CHANNEL_ID).catch(() => null);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🕵️ GHOST PING DETECTED')
      .setDescription(`A message containing a mention was deleted in <#${channelId}>!`)
      .addFields(
        { name: '👤 Ghost Pinger', value: `<@${authorId}> (\`${authorTag}\`)`, inline: true },
        { name: '🎯 Pinged', value: targetParts.join(', ').slice(0, 1024), inline: true },
        { name: '📍 Channel', value: `<#${channelId}>`, inline: true },
        { name: '💬 Deleted Message', value: content ? content.slice(0, 1024) : '*[Attachment / No text content]*', inline: false }
      )
      .setColor('#ff0055')
      .setTimestamp()
      .setFooter({ text: 'Marathon Security • Anti-Ghost-Ping Protocol' });

    if (authorAvatar) {
      embed.setThumbnail(authorAvatar);
    }

    await logChannel.send({
      content: `🚨 **Ghost Ping Alert!** <@${authorId}> ghost-pinged ${targetParts.join(', ')} in <#${channelId}>.`,
      embeds: [embed]
    });
    console.log(`🕵️ [Anti-Ghost-Ping] Logged ghost ping by ${authorTag} in #${channelId}`);
  } catch (err) {
    console.error('❌ [Anti-Ghost-Ping Error]:', err);
  }
});

// --- 4. DAILY POSITIVITY PROTOCOL HELPERS ---
async function broadcastPositivityMessage({ text, imageUrl, isTest = false }) {
  const channel = await client.channels.fetch(POSITIVITY_CHANNEL_ID);
  if (!channel) {
    throw new Error('Could not find the #positivity channel.');
  }

  const embed = new EmbedBuilder()
    .setTitle(isTest ? '☀️ DAILY POSITIVITY (TEST)' : '☀️ DAILY POSITIVITY')
    .setDescription(text || 'Wishing everyone a positive, peaceful, and fulfilling day ahead! ✨')
    .setColor('#00ff9f')
    .setTimestamp()
    .setFooter({ text: 'Marathon System • Daily Positivity' });

  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  await channel.send({
    content: `<@&${POSITIVITY_ROLE_ID}> **| DAILY DOSE OF POSITIVITY** ✨`,
    embeds: [embed]
  });
}

async function handleHeadAdminPositivityDM(message) {
  try {
    await connectDB();

    let stateDoc = await GlobalConfig.findOne({ key: 'positivity_prompt_state' });
    let state = client.positivityPromptState || stateDoc?.value || {
      mode: 'scheduled',
      pendingText: '',
      pendingImageUrl: '',
      requestedAt: Date.now()
    };

    const rawText = (message.content || '').trim();
    const attachment = message.attachments?.first();
    let incomingImageUrl = attachment ? attachment.url : '';

    // Allow cancelling a scheduled or pending post before 6:45 AM IST by sending "cancel post"
    if (/^cancel(\s+post)?$/i.test(rawText) && !incomingImageUrl) {
      const resetState = {
        mode: 'scheduled',
        pendingText: '',
        pendingImageUrl: '',
        requestedAt: Date.now()
      };
      client.positivityPromptState = resetState;

      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: resetState, updatedAt: new Date() },
        { upsert: true }
      );
      const deleted = await GlobalConfig.deleteOne({ key: 'next_positivity_payload' });

      await message.reply(
        deleted.deletedCount > 0
          ? '🚫 **Post Cancelled!** Your scheduled positive message for **6:45 AM IST** has been cancelled. (You can send a new message and image anytime before 6:45 AM, otherwise I will send a random positive message at 6:45 AM!)'
          : '🚫 **Cancelled!** Cleared any pending positive message draft. (If nothing new is sent before 6:45 AM IST, I will send a random positive message.)'
      );
      console.log('🚫 [Positivity] Head Admin cancelled the scheduled positivity post.');
      return;
    }

    // Also detect if an image URL was pasted directly in the text
    const urlMatch = rawText.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:\?\S*)?/i);
    let cleanedText = rawText;
    if (!incomingImageUrl && urlMatch) {
      incomingImageUrl = urlMatch[0];
      cleanedText = rawText.replace(urlMatch[0], '').trim();
    }

    const skipImage = /^(no image|skip|none)$/i.test(cleanedText);

    if (!skipImage && cleanedText) {
      state.pendingText = cleanedText;
    }
    if (incomingImageUrl) {
      state.pendingImageUrl = incomingImageUrl;
    }

    const hasText = Boolean(state.pendingText);
    const hasImage = Boolean(state.pendingImageUrl);

    // If both message text and image (or explicit 'no image') are ready:
    if (hasText && (hasImage || skipImage)) {
      const finalText = state.pendingText;
      const finalImageUrl = skipImage ? '' : state.pendingImageUrl;
      const currentMode = state.mode || 'scheduled';

      // Reset pending state back to scheduled for future messages
      const resetState = {
        mode: 'scheduled',
        pendingText: '',
        pendingImageUrl: '',
        requestedAt: Date.now()
      };
      client.positivityPromptState = resetState;
      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: resetState, updatedAt: new Date() },
        { upsert: true }
      );

      if (currentMode === 'test') {
        await broadcastPositivityMessage({
          text: finalText,
          imageUrl: finalImageUrl,
          isTest: true
        });
        await message.reply(
          `✅ **Noted & Sent!** Your positive message${finalImageUrl ? ' and image' : ''} have just been broadcasted to <#${POSITIVITY_CHANNEL_ID}>!`
        );
        console.log('☀️ [Positivity Test] Broadcasted DM payload immediately.');
        return;
      }

      // Scheduled mode: store for 6:45 AM IST
      await GlobalConfig.findOneAndUpdate(
        { key: 'next_positivity_payload' },
        {
          value: {
            text: finalText,
            imageUrl: finalImageUrl,
            savedAt: new Date().toISOString()
          },
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await message.reply(
        `✨ **Noted!** Your positive message${finalImageUrl ? ' and image' : ''} have been saved and locked in. I will send them to <#${POSITIVITY_CHANNEL_ID}> and ping <@&${POSITIVITY_ROLE_ID}> at **6:45 AM IST**!\n*(Reply \`cancel post\` anytime before 6:45 AM if you want to cancel it.)*`
      );
      console.log('☀️ [Positivity Scheduled] Locked in DM payload for 6:45 AM IST.');
      return;
    }

    // Save partial state if the user sent text first or image first
    client.positivityPromptState = state;
    await GlobalConfig.findOneAndUpdate(
      { key: 'positivity_prompt_state' },
      { value: state, updatedAt: new Date() },
      { upsert: true }
    );

    if (hasText && !hasImage) {
      await message.reply(
        '📝 **Message noted!** Now send me the **image** to attach with it (or reply `no image` if you want to send it without an image).'
      );
    } else if (!hasText && hasImage) {
      await message.reply(
        '🖼️ **Image noted!** Now send me the **positive message** text to go with it.'
      );
    }
  } catch (err) {
    console.error('❌ [Positivity DM Handler Error]:', err);
    await message.reply(`⚠️ Something went wrong while saving your positivity message: ${err.message}`).catch(() => {});
  }
}

// --- MESSAGE CREATE HANDLER (DMs, Airport Fallback, Ghost Ping Cache, Honeypot) ---
client.on(Events.MessageCreate, async (message) => {
  // Handle Discord system join message in #airport as a backup to GuildMemberAdd
  if (message.channelId === AIRPORT_CHANNEL_ID && message.type === MessageType.UserJoin && message.author) {
    await sendAirportWelcome(message.author);
    return;
  }

  if (message.author.bot) return;

  // Handle Head Admin DMs for the Positivity Protocol
  if (!message.guild) {
    if (message.author.id === HEAD_ADMIN_ID) {
      await handleHeadAdminPositivityDM(message);
    }
    return;
  }

  // Cache any message containing mentions for Anti-Ghost-Ping tracking
  if (message.channelId !== HONEYPOT_CHANNEL_ID) {
    cacheMessageIfPing(message);
    return;
  }

  // --- HONEYPOT CHANNEL ANTI-SPAM PROTOCOL ---
  console.log(`🍯 [Honeypot] Triggered by ${message.author.tag} (${message.author.id}) in channel ${HONEYPOT_CHANNEL_ID}`);

  // 1. Always delete the offending message immediately
  try {
    await message.delete();
  } catch (delError) {
    console.error('❌ [Honeypot] Failed to delete message:', delError.message);
  }

  // 2. Fetch member and check if the bot has hierarchy/permission power to ban them
  const member = message.member || await message.guild?.members.fetch(message.author.id).catch(() => null);

  if (member && member.bannable) {
    // Send ban notification DM BEFORE banning (since Discord blocks DMs once banned)
    try {
      await message.author.send(
        '🚫 **BANNED — HONEYPOT CHANNEL TRIGGERED**\n\n' +
        'You were banned from **Marathon Server** for sending a message in the honeypot channel, which is meant to catch spammers.\n\n' +
        'If you think this is a mistake, please contact **randomxsoul** on Discord.'
      );
    } catch (dmError) {
      console.log(`ℹ️ [Honeypot] Could not DM ${message.author.tag} before ban:`, dmError.message);
    }

    try {
      await member.ban({
        reason: 'Sent a message in the honeypot channel (meant to catch spammers).'
      });
      console.log(`🔨 [Honeypot] Successfully banned ${message.author.tag} (${message.author.id}).`);
      return;
    } catch (banError) {
      console.error(`❌ [Honeypot] Ban failed for ${message.author.tag}:`, banError.message);
      // Fall through to unbannable notification below if ban unexpectedly failed
    }
  }

  // 3. Fallback if the user cannot be banned (e.g. role hierarchy / admin / owner above the bot)
  try {
    await message.author.send(
      '⚠️ **MESSAGE DELETED — HONEYPOT CHANNEL**\n\n' +
      `Your message in <#${HONEYPOT_CHANNEL_ID}> was automatically deleted because it was sent in the **honeypot channel**, which is strictly meant to catch spammers (normal members are instantly banned for messaging there).`
    );
    console.log(`✉️ [Honeypot] Notified unbannable user ${message.author.tag} that their message was deleted.`);
  } catch (dmError) {
    console.log(`ℹ️ [Honeypot] Could not DM unbannable user ${message.author.tag}:`, dmError.message);
  }
});

// Keep bot alive — never let an unhandled rejection crash the process
process.on('unhandledRejection', (error) => {
  console.error('[Unhandled Rejection]', error);
});
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception]', error);
});


// --- 2. STARBOARD & SKULLBOARD LOGIC ---
const processingBoardLocks = new Set();

async function handleBoardReaction(reaction, boardType) {
  const msg = reaction.message;
  if (!msg || !msg.guild) return;

  // Never repost messages from the boards themselves or the honeypot channel
  if ([STARBOARD_CHANNEL_ID, SKULLBOARD_CHANNEL_ID, HONEYPOT_CHANNEL_ID].includes(msg.channelId)) {
    return;
  }

  const count = reaction.count || 0;
  if (count < BOARD_REACTION_THRESHOLD) return;

  const lockKey = `${boardType}:${msg.id}`;
  if (processingBoardLocks.has(lockKey)) return;
  processingBoardLocks.add(lockKey);

  try {
    await connectDB();

    const targetChannelId = boardType === 'star' ? STARBOARD_CHANNEL_ID : SKULLBOARD_CHANNEL_ID;
    const badgeEmoji = boardType === 'star' ? '⭐' : '💀';
    const embedColor = boardType === 'star' ? '#FFD700' : '#ff0055';
    const boardChannel = await client.channels.fetch(targetChannelId).catch(() => null);
    if (!boardChannel) return;

    const authorTag = msg.author?.tag || msg.author?.username || 'Unknown User';
    const authorAvatar = typeof msg.author?.displayAvatarURL === 'function'
      ? msg.author.displayAvatarURL({ extension: 'png' })
      : null;

    const descriptionParts = [];
    if (msg.content) {
      descriptionParts.push(msg.content);
    }
    descriptionParts.push(`\n🔗 **[Jump to Message](${msg.url})**`);

    const embed = new EmbedBuilder()
      .setAuthor({ name: authorTag, iconURL: authorAvatar || undefined })
      .setDescription(descriptionParts.join('\n').slice(0, 4096))
      .setColor(embedColor)
      .setTimestamp(msg.createdAt || new Date())
      .setFooter({ text: `Message ID: ${msg.id}` });

    // Attach image if the message has an image attachment or embed image
    const firstAttachment = msg.attachments?.find(att =>
      att.contentType?.startsWith('image/') || /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(att.url || '')
    ) || msg.attachments?.first();

    if (firstAttachment?.url) {
      embed.setImage(firstAttachment.url);
    } else if (msg.embeds?.[0]?.image?.url) {
      embed.setImage(msg.embeds[0].image.url);
    } else if (msg.embeds?.[0]?.thumbnail?.url) {
      embed.setImage(msg.embeds[0].thumbnail.url);
    }

    const headerContent = `${badgeEmoji} **${count}** | <#${msg.channelId}>`;

    const existingRecord = await BoardPost.findOne({
      originalMessageId: msg.id,
      boardType
    });

    if (existingRecord) {
      // Update existing board message with the new reaction count
      const existingBoardMsg = await boardChannel.messages.fetch(existingRecord.boardMessageId).catch(() => null);
      if (existingBoardMsg) {
        await existingBoardMsg.edit({ content: headerContent, embeds: [embed] });
      }
      return;
    }

    const sentMsg = await boardChannel.send({
      content: headerContent,
      embeds: [embed]
    });

    await BoardPost.create({
      originalMessageId: msg.id,
      boardType,
      boardMessageId: sentMsg.id,
      sourceChannelId: msg.channelId
    });

    console.log(`${badgeEmoji} [${boardType.toUpperCase()}BOARD] Posted message ${msg.id} (${count} reactions)`);
  } catch (err) {
    // Ignore duplicate key race errors if already created
    if (err.code !== 11000) {
      console.error(`❌ [${boardType}board Error]:`, err);
    }
  } finally {
    processingBoardLocks.delete(lockKey);
  }
}


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
      dmMessage: "💯 **POSITIVITY_SYNCED:** You are now enrolled in the daily positivity protocol. Wishing you bright energy every morning!",
      unreactDmMessage: "💯 **POSITIVITY_UNSYNCED:** You have opted out of the daily positivity protocol. We'll be here whenever you're ready to sync back up!"
    }
  }
};

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;
  console.log(`📡 Event: MessageReactionAdd | User: ${user.username} | Partial: ${reaction.partial}`);
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Failed to fetch reaction during add:', error);
      return;
    }
  }

  // Ensure the message is also fetched if it's a partial
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Failed to fetch message during reaction add:', error);
      return;
    }
  }

  const emojiName = reaction.emoji.name;
  const emojiHex = emojiName ? Buffer.from(emojiName).toString('hex') : 'null';
  console.log(`🔍 Reaction: "${emojiName}" | Hex: ${emojiHex} | ID: ${reaction.emoji.id} | Msg: ${reaction.message.id} | Count: ${reaction.count}`);

  // Check Starboard (⭐) & Skullboard (💀) triggers
  if (emojiName === '⭐' || emojiName === '🌟') {
    await handleBoardReaction(reaction, 'star');
  } else if (emojiName === '💀' || emojiName === '☠️') {
    await handleBoardReaction(reaction, 'skull');
  }

  // Check if we are monitoring this specific message for Reaction Roles
  const messageConfig = REACTION_ROLES_CONFIG[reaction.message.id];
  if (!messageConfig) {
    return;
  }

  // Find config by name, ID, or hex match (to be safe with unicode)
  let config = messageConfig[emojiName] || messageConfig[reaction.emoji.id];
  
  if (!config && emojiName) {
    // Fallback: check if any key in config matches the emoji name hex
    const targetHex = Buffer.from(emojiName).toString('hex');
    const matchKey = Object.keys(messageConfig).find(key => Buffer.from(key).toString('hex') === targetHex);
    if (matchKey) config = messageConfig[matchKey];
  }
  
  if (!config) {
    console.log(`ℹ️ Emoji "${reaction.emoji.name}" not found for msg ${reaction.message.id}. Configured: ${Object.keys(messageConfig).join(', ')}`);
    return;
  }

  console.log(`🎯 Match! Role: ${config.roleId} | Emoji Identifier: ${reaction.emoji.identifier}`);

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
    console.error('❌ [ReactionRoleAdd Error]:', error.message);
    if (error.code === 50013) {
      console.error('⚠️ PERMISSION_ERROR: Bot role might be below the target role in hierarchy.');
    }
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

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.error('Failed to fetch message during reaction remove:', error);
      return;
    }
  }

  const messageConfig = REACTION_ROLES_CONFIG[reaction.message.id];
  if (!messageConfig) return;

  const emojiName = reaction.emoji.name;
  let config = messageConfig[emojiName] || messageConfig[reaction.emoji.id];

  if (!config && emojiName) {
    const targetHex = Buffer.from(emojiName).toString('hex');
    const matchKey = Object.keys(messageConfig).find(key => Buffer.from(key).toString('hex') === targetHex);
    if (matchKey) config = messageConfig[matchKey];
  }

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
 * Daily Positivity Check-In: Every day at 8:00 PM IST, DM the Head Admin asking for
 * tomorrow's positive message and image.
 */
cron.schedule('0 20 * * *', async () => {
  console.log('🌙 [Scheduled Task] 8:00 PM IST — Prompting Head Admin for tomorrow\'s positivity message...');
  try {
    await connectDB();
    const stateValue = {
      mode: 'scheduled',
      pendingText: '',
      pendingImageUrl: '',
      requestedAt: Date.now()
    };
    client.positivityPromptState = stateValue;

    await GlobalConfig.findOneAndUpdate(
      { key: 'positivity_prompt_state' },
      { value: stateValue, updatedAt: new Date() },
      { upsert: true }
    );

    const adminUser = await client.users.fetch(HEAD_ADMIN_ID);
    if (adminUser) {
      await adminUser.send(
        '🌙 **DAILY POSITIVITY CHECK-IN (8:00 PM IST)**\n\n' +
        `Hey! Please send me tomorrow's **positive message** and **image** for <#${POSITIVITY_CHANNEL_ID}>.\n` +
        '*(You can send the message and image together, or one right after the other — I will broadcast it tomorrow at **6:45 AM IST**!)*'
      );
      console.log('✅ [Scheduled Task] Sent 8:00 PM positivity prompt DM to Head Admin.');
    }
  } catch (error) {
    console.error('❌ [Scheduled Task Error] Failed to DM Head Admin at 8:00 PM IST:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

/**
 * Daily Positivity Broadcast: Every day at 6:45 AM IST, send the Head Admin's queued
 * positive message and image to the #positivity channel and ping the positivity role.
 */
cron.schedule('45 6 * * *', async () => {
  console.log('☀️ [Scheduled Task] 6:45 AM IST — Sending Daily Positivity broadcast...');
  try {
    await connectDB();
    const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });

    if (savedDoc?.value?.text) {
      await broadcastPositivityMessage({
        text: savedDoc.value.text,
        imageUrl: savedDoc.value.imageUrl || '',
        isTest: false
      });
      await GlobalConfig.deleteOne({ key: 'next_positivity_payload' });
      console.log('✅ [Scheduled Task] Sent custom Daily Positivity message & cleared queue.');
    } else {
      // Fallback if no custom message was submitted before 6:45 AM (or if it was cancelled)
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      await broadcastPositivityMessage({
        text: `*"${randomQuote.text}"*\n— **${randomQuote.author}**`,
        imageUrl: '',
        isTest: false
      });
      console.log('ℹ️ [Scheduled Task] No custom DM message queued; sent random positive message.');
    }
  } catch (error) {
    console.error('❌ [Scheduled Task Error] Failed to send 6:45 AM positivity message:', error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

client.login(process.env.DISCORD_TOKEN);
