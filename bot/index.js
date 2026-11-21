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
const E_CHANNEL_ID = '1442071717748150373';
const BOARD_REACTION_THRESHOLD = 5;

// --- #e CHANNEL PROTOCOL (ONLY 'e', NO DOUBLE-POSTING) ---
let lastEChannelAuthorId = null;

const SILLY_NON_E_MESSAGES = [
  "brotato why did u send that, we gotta send `e` 🥔",
  "bro had ONE job and it was literally just the 5th letter of the alphabet 😭",
  "sir this is an `#e` only establishment, put the rest of the keyboard back in the bag 🚓",
  "what part of <#1442071717748150373> looked like 'type whatever you want' to you broski 💀",
  "illegal letters detected in <#1442071717748150373>!! the council of `e` has revoked your message 📜",
  "my brother in christ the only legal character in <#1442071717748150373> is a single lowercase `e` 🫡",
  "uh oh non-`e` contraband spotted!! only `e` survives in <#1442071717748150373> 🧹",
  "brotato chip thought he could sneak non-`e` propaganda into <#1442071717748150373> 😭"
];

const SILLY_DOUBLE_E_MESSAGES = [
  "woah slow down e-goblin, you can't send `e` twice in a row!! wait for someone else to say `e` first 🛑",
  "no double-dipping in the <#1442071717748150373> jar brotato!! let someone else drop an `e` first 🍪",
  "greedy with the `e`'s today aren't we?? one `e` per turn, pass the baton 🏃‍♂️",
  "bro is trying to monopolize the `e` economy 💀 wait for another human to say `e` before you go again!",
  "patience young grasshopper, you already said your `e` — let someone else have a turn in <#1442071717748150373> 🦗",
  "caught you farming `e`'s back-to-back!! wait for a teammate to say `e` first 🚓",
  "one `e` at a time chief, you can't hog the whole <#1442071717748150373> channel to yourself 😭"
];

async function handleEChannelMessage(message) {
  // Initialize lastEChannelAuthorId from channel history if not yet loaded
  if (!lastEChannelAuthorId) {
    try {
      const recent = await message.channel.messages.fetch({ limit: 10 });
      const prevValid = recent.find(
        m => m.id !== message.id && !m.author?.bot && m.content === 'e' && m.attachments.size === 0 && m.stickers.size === 0
      );
      if (prevValid) {
        lastEChannelAuthorId = prevValid.author.id;
      }
    } catch (_) {
      // Ignore fetch errors
    }
  }

  const isExactE =
    message.content === 'e' &&
    message.attachments.size === 0 &&
    message.stickers.size === 0;

  // Rule 1: Must be strictly 'e' and nothing else
  if (!isExactE) {
    try {
      await message.delete();
    } catch (err) {
      console.error('❌ [#e] Failed to delete non-e message:', err.message);
    }

    const sillyMsg = SILLY_NON_E_MESSAGES[Math.floor(Math.random() * SILLY_NON_E_MESSAGES.length)];
    try {
      await message.author.send(sillyMsg);
    } catch (_) {
      // If user has DMs closed, send a 4-second self-deleting notice in #e
      const temp = await message.channel.send(`<@${message.author.id}> ${sillyMsg}`).catch(() => null);
      if (temp) setTimeout(() => temp.delete().catch(() => {}), 4000);
    }
    return;
  }

  // Rule 2: Cannot send 'e' twice in a row
  if (lastEChannelAuthorId === message.author.id) {
    try {
      await message.delete();
    } catch (err) {
      console.error('❌ [#e] Failed to delete consecutive e message:', err.message);
    }

    const sillyDoubleMsg = SILLY_DOUBLE_E_MESSAGES[Math.floor(Math.random() * SILLY_DOUBLE_E_MESSAGES.length)];
    try {
      await message.author.send(sillyDoubleMsg);
    } catch (_) {
      const temp = await message.channel.send(`<@${message.author.id}> ${sillyDoubleMsg}`).catch(() => null);
      if (temp) setTimeout(() => temp.delete().catch(() => {}), 4000);
    }
    return;
  }

  // Valid 'e' from a new person! Record them as the last author
  lastEChannelAuthorId = message.author.id;
}

// Prevent users from editing a valid 'e' in #e into something else
client.on(Events.MessageUpdate, async (_oldMsg, newMsg) => {
  try {
    if (newMsg.channelId !== E_CHANNEL_ID) return;
    if (newMsg.partial) await newMsg.fetch().catch(() => {});
    if (newMsg.author?.bot) return;

    if (newMsg.content !== 'e' || newMsg.attachments?.size > 0 || newMsg.stickers?.size > 0) {
      await newMsg.delete().catch(() => {});
      const sillyMsg = SILLY_NON_E_MESSAGES[Math.floor(Math.random() * SILLY_NON_E_MESSAGES.length)];
      await newMsg.author?.send(sillyMsg).catch(() => {});
    }
  } catch (_) {}
});

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
const SIDELINE_COLORS = {
  '1': { name: '🔴 Red', hex: '#FF3B5C' },
  'red': { name: '🔴 Red', hex: '#FF3B5C' },
  'crimson': { name: '🔴 Red', hex: '#FF3B5C' },
  '2': { name: '🟠 Orange', hex: '#FF8C00' },
  'orange': { name: '🟠 Orange', hex: '#FF8C00' },
  'amber': { name: '🟠 Orange', hex: '#FF8C00' },
  '3': { name: '🟡 Gold / Yellow', hex: '#FFD700' },
  'yellow': { name: '🟡 Gold / Yellow', hex: '#FFD700' },
  'gold': { name: '🟡 Gold / Yellow', hex: '#FFD700' },
  '4': { name: '🟢 Green', hex: '#00FF9F' },
  'green': { name: '🟢 Green', hex: '#00FF9F' },
  'emerald': { name: '🟢 Green', hex: '#00FF9F' },
  '5': { name: '🔵 Blue / Cyan', hex: '#00B4D8' },
  'blue': { name: '🔵 Blue / Cyan', hex: '#00B4D8' },
  'cyan': { name: '🔵 Blue / Cyan', hex: '#00B4D8' },
  '6': { name: '🟣 Purple', hex: '#9D4EDD' },
  'purple': { name: '🟣 Purple', hex: '#9D4EDD' },
  'violet': { name: '🟣 Purple', hex: '#9D4EDD' },
  '7': { name: '🌸 Pink', hex: '#FF69B4' },
  'pink': { name: '🌸 Pink', hex: '#FF69B4' },
  'rose': { name: '🌸 Pink', hex: '#FF69B4' },
  '8': { name: '⚪ White', hex: '#FFFFFF' },
  'white': { name: '⚪ White', hex: '#FFFFFF' },
  '9': { name: '⚫ Dark / Black', hex: '#2B2D31' },
  'black': { name: '⚫ Dark / Black', hex: '#2B2D31' },
  'dark': { name: '⚫ Dark / Black', hex: '#2B2D31' },
};

const COLOR_MENU_TEXT =
  '🎨 **Choose a Sideline Colour for the Post:**\n' +
  '`1` 🔴 **Red**  •  `2` 🟠 **Orange**  •  `3` 🟡 **Gold / Yellow**\n' +
  '`4` 🟢 **Green**  •  `5` 🔵 **Blue / Cyan**  •  `6` 🟣 **Purple**\n' +
  '`7` 🌸 **Pink**  •  `8` ⚪ **White**  •  `9` ⚫ **Dark / Black**\n\n' +
  '*(Reply with the number `1-9`, the colour name like `purple`, or any custom hex like `#ff0055`!)*';

function parseSidelineColor(input) {
  const clean = (input || '').trim().toLowerCase();
  if (!clean) return null;
  if (SIDELINE_COLORS[clean]) return SIDELINE_COLORS[clean];

  const hexMatch = clean.match(/^#?([0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = `#${hexMatch[1].toUpperCase()}`;
    return { name: `🎨 Custom (${hex})`, hex };
  }
  return null;
}

/**
 * Resolves :emoji_name: shortcodes sent in DMs into actual server emojis <:name:id> or <a:name:id>
 */
async function resolveServerEmojis(text) {
  if (!text) return '';
  try {
    const guild = client.guilds.cache.get('1420751012276469795') || client.guilds.cache.first();
    if (!guild) return text;

    if (guild.emojis.cache.size === 0) {
      await guild.emojis.fetch().catch(() => {});
    }

    // Replace :shortcode: that is NOT already inside <:shortcode:12345> or <a:shortcode:12345>
    return text.replace(/(?<![<a]):([a-zA-Z0-9_]{2,32}):(?!\d+>)/g, (fullMatch, emojiName) => {
      const found =
        guild.emojis.cache.find(e => e.name === emojiName) ||
        guild.emojis.cache.find(e => e.name?.toLowerCase() === emojiName.toLowerCase());

      if (found) {
        return `<${found.animated ? 'a' : ''}:${found.name}:${found.id}>`;
      }
      return fullMatch;
    });
  } catch (err) {
    console.error('[Emoji Resolver Error]:', err);
    return text;
  }
}

/**
 * Splits long markdown text on newline boundaries so each embed description stays <= maxLen
 * without breaking bold (**abc**), headings, or custom emoji tags (<:name:id>).
 */
function splitMarkdownChunks(text, maxLen = 3900) {
  const normalized = (text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return ['Wishing everyone a positive, peaceful, and fulfilling day ahead! ✨'];
  if (normalized.length <= maxLen) return [normalized];

  const chunks = [];
  let remaining = normalized;

  while (remaining.length > maxLen) {
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen);
    if (splitIdx < maxLen * 0.4) {
      splitIdx = remaining.lastIndexOf('\n', maxLen);
    }
    if (splitIdx < maxLen * 0.4) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitIdx <= 0) {
      splitIdx = maxLen;
    }

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }
  return chunks;
}

async function buildPositivityEmbeds({ text, imageUrl, color = '#FFD700', isTest = false }) {
  const resolvedText = await resolveServerEmojis(
    text || 'Wishing everyone a positive, peaceful, and fulfilling day ahead! ✨'
  );
  const chunks = splitMarkdownChunks(resolvedText, 3900);

  return chunks.map((chunk, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === chunks.length - 1;

    const embed = new EmbedBuilder()
      .setDescription(chunk)
      .setColor(color || '#FFD700');

    if (isFirst) {
      embed.setTitle(isTest ? '☀️ DAILY POSITIVITY (TEST)' : '☀️ DAILY POSITIVITY');
    }
    if (isLast) {
      embed.setTimestamp().setFooter({ text: 'Marathon System • Daily Positivity' });
      if (imageUrl) {
        embed.setImage(imageUrl);
      }
    }
    return embed;
  });
}

async function sendEmbedsInBatches(targetChannelOrUser, headerContent, embeds, isReply = false, replyMessage = null) {
  // Discord allows at most 6000 total characters across all embeds in a single message
  const batches = [];
  let currentBatch = [];
  let currentChars = 0;

  for (const emb of embeds) {
    const len = (emb.data.title?.length || 0) + (emb.data.description?.length || 0) + (emb.data.footer?.text?.length || 0);
    if (currentBatch.length > 0 && (currentChars + len > 5500 || currentBatch.length >= 10)) {
      batches.push(currentBatch);
      currentBatch = [];
      currentChars = 0;
    }
    currentBatch.push(emb);
    currentChars += len;
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  for (let i = 0; i < batches.length; i++) {
    const payload = {
      ...(i === 0 && headerContent ? { content: headerContent } : {}),
      embeds: batches[i]
    };
    if (i === 0 && isReply && replyMessage) {
      await replyMessage.reply(payload);
    } else {
      await targetChannelOrUser.send(payload);
    }
  }
}

async function broadcastPositivityMessage({ text, imageUrl, color = '#FFD700', isTest = false }) {
  const channel = await client.channels.fetch(POSITIVITY_CHANNEL_ID);
  if (!channel) {
    throw new Error('Could not find the #positivity channel.');
  }

  const embeds = await buildPositivityEmbeds({ text, imageUrl, color, isTest });
  await sendEmbedsInBatches(
    channel,
    `<@&${POSITIVITY_ROLE_ID}> **| DAILY DOSE OF POSITIVITY** ✨`,
    embeds
  );
}

async function handleHeadAdminPositivityDM(message) {
  try {
    await connectDB();

    let stateDoc = await GlobalConfig.findOne({ key: 'positivity_prompt_state' });
    let state = client.positivityPromptState || stateDoc?.value || {
      mode: 'scheduled',
      pendingText: '',
      pendingImageUrl: '',
      pendingColor: '',
      awaitingColor: false,
      requestedAt: Date.now()
    };

    const rawText = (message.content || '').trim();

    // Separate .txt file attachments from image attachments
    const attachments = Array.from(message.attachments?.values() || []);
    const txtAttachment = attachments.find(a =>
      a.name?.toLowerCase().endsWith('.txt') || a.contentType?.toLowerCase().startsWith('text/plain')
    );
    const imgAttachment = attachments.find(a =>
      a.id !== txtAttachment?.id &&
      (a.contentType?.toLowerCase().startsWith('image/') ||
       /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(a.name || a.url || ''))
    );

    let txtFileContent = '';
    if (txtAttachment?.url) {
      try {
        const res = await fetch(txtAttachment.url);
        if (res.ok) {
          txtFileContent = (await res.text()).replace(/\r\n/g, '\n').trim();
        }
      } catch (fetchErr) {
        console.error('❌ [Positivity .txt Fetch Error]:', fetchErr);
      }
    }

    let incomingImageUrl = imgAttachment ? imgAttachment.url : '';

    // detect image URL pasted in text
    const urlMatch = rawText.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?:\?\S*)?/i);
    let cleanedText = rawText;
    if (!incomingImageUrl && urlMatch) {
      incomingImageUrl = urlMatch[0];
      cleanedText = rawText.replace(urlMatch[0], '').trim();
    }

    // 0. PREVIEW COMMAND ("preview")
    if (/^preview(\s+post)?$/i.test(rawText) && !incomingImageUrl && !txtFileContent) {
      const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });

      if (!savedDoc?.value?.text) {
        if (state.pendingText || state.pendingImageUrl) {
          await message.reply(
            'ℹ️ **No finalized message is scheduled yet!** You currently have an unfinished draft in progress — finish picking the image/sideline colour to lock it in (or send `cancel post` to clear it).'
          );
        } else {
          await message.reply(
            'ℹ️ **No positive message is currently scheduled** for 6:45 AM IST. Send me a message (or `.txt` file) and an image anytime to schedule one!'
          );
        }
        return;
      }

      const { text, imageUrl, color, colorName } = savedDoc.value;
      const previewEmbeds = await buildPositivityEmbeds({
        text,
        imageUrl,
        color: color || '#FFD700',
        isTest: false
      });

      await sendEmbedsInBatches(
        message.channel,
        `👁️ **PREVIEW — Scheduled for 6:45 AM IST in <#${POSITIVITY_CHANNEL_ID}>** (Sideline: **${colorName || color || '#FFD700'}**)\n` +
        `──────────────────────────\n` +
        `<@&${POSITIVITY_ROLE_ID}> **| DAILY DOSE OF POSITIVITY** ✨`,
        previewEmbeds,
        true,
        message
      );
      return;
    }

    // 1. CANCEL POST COMMAND ("cancel post" or "cancel")
    if (/^cancel(\s+post)?$/i.test(rawText) && !incomingImageUrl && !txtFileContent) {
      const resetState = {
        mode: 'scheduled',
        pendingText: '',
        pendingImageUrl: '',
        pendingColor: '',
        awaitingColor: false,
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
          : '🚫 **Cancelled!** Cleared your current draft. (If nothing new is scheduled before 6:45 AM IST, I will send a random positive message.)'
      );
      console.log('🚫 [Positivity] Head Admin cancelled the scheduled positivity post.');
      return;
    }

    // 2. TEXT-BASED EDIT COMMANDS FOR ALREADY-SCHEDULED POST (OR ACTIVE DRAFT)
    //    - "edit message <new text>" OR "edit message" with a .txt file attached
    //    - "edit color <color>" / "edit colour <color>"
    //    - "edit image" (with attached image or URL)
    //    - "edit post" (restart full flow)
    const editMsgMatch = rawText.match(/^edit\s+(?:message|text)(?:\s+([\s\S]+))?$/i);
    if (editMsgMatch && (editMsgMatch[1]?.trim() || txtFileContent)) {
      const rawUpdatedText = txtFileContent
        ? (editMsgMatch[1]?.trim() ? `${editMsgMatch[1].trim()}\n\n${txtFileContent}` : txtFileContent)
        : editMsgMatch[1].trim();
      const newResolvedText = await resolveServerEmojis(rawUpdatedText);
      const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });

      if (savedDoc?.value) {
        const updatedValue = {
          ...savedDoc.value,
          text: newResolvedText,
          savedAt: new Date().toISOString()
        };
        await GlobalConfig.findOneAndUpdate(
          { key: 'next_positivity_payload' },
          { value: updatedValue, updatedAt: new Date() },
          { upsert: true }
        );
        const previewSnippet = newResolvedText.length > 1500
          ? `${newResolvedText.slice(0, 1500)}...\n*(Full text saved — type \`preview\` to view the complete rendered post!)*`
          : newResolvedText;
        await message.reply(`✏️ **Message Updated!** Your scheduled 6:45 AM post text is now:\n>>> ${previewSnippet}`);
        return;
      } else if (state.pendingText) {
        state.pendingText = newResolvedText;
        client.positivityPromptState = state;
        await GlobalConfig.findOneAndUpdate(
          { key: 'positivity_prompt_state' },
          { value: state, updatedAt: new Date() },
          { upsert: true }
        );
        const previewSnippet = newResolvedText.length > 1500
          ? `${newResolvedText.slice(0, 1500)}...\n*(Full text saved in draft!)*`
          : newResolvedText;
        await message.reply(`✏️ **Draft Message Updated!**\n>>> ${previewSnippet}`);
        return;
      }
    }

    const editColorMatch = rawText.match(/^edit\s+colou?r(?:\s+(.+))?$/i);
    if (editColorMatch) {
      const colorArg = (editColorMatch[1] || '').trim();
      if (!colorArg) {
        state.awaitingColorEdit = true;
        client.positivityPromptState = state;
        await GlobalConfig.findOneAndUpdate(
          { key: 'positivity_prompt_state' },
          { value: state, updatedAt: new Date() },
          { upsert: true }
        );
        await message.reply(COLOR_MENU_TEXT);
        return;
      }
      const parsedColor = parseSidelineColor(colorArg);
      if (!parsedColor) {
        await message.reply(`⚠️ Invalid colour \`${colorArg}\`.\n\n${COLOR_MENU_TEXT}`);
        return;
      }
      const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });
      if (savedDoc?.value) {
        const updatedValue = {
          ...savedDoc.value,
          color: parsedColor.hex,
          colorName: parsedColor.name,
          savedAt: new Date().toISOString()
        };
        await GlobalConfig.findOneAndUpdate(
          { key: 'next_positivity_payload' },
          { value: updatedValue, updatedAt: new Date() },
          { upsert: true }
        );
        await message.reply(`🎨 **Sideline Colour Updated!** Changed to **${parsedColor.name}** (\`${parsedColor.hex}\`).`);
        return;
      }
    }

    if (/^edit\s+image$/i.test(cleanedText) && incomingImageUrl) {
      const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });
      if (savedDoc?.value) {
        const updatedValue = {
          ...savedDoc.value,
          imageUrl: incomingImageUrl,
          savedAt: new Date().toISOString()
        };
        await GlobalConfig.findOneAndUpdate(
          { key: 'next_positivity_payload' },
          { value: updatedValue, updatedAt: new Date() },
          { upsert: true }
        );
        await message.reply('🖼️ **Image Updated!** Your scheduled 6:45 AM post now uses the new image.');
        return;
      }
    }

    if (/^edit(\s+post)?$/i.test(rawText) && !incomingImageUrl) {
      const freshState = {
        mode: 'scheduled',
        pendingText: '',
        pendingImageUrl: '',
        pendingColor: '',
        awaitingColor: false,
        requestedAt: Date.now()
      };
      client.positivityPromptState = freshState;
      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: freshState, updatedAt: new Date() },
        { upsert: true }
      );
      await message.reply(
        '✏️ **Editing Scheduled Post:** Send me the new **positive message** and **image** (together or one after the other), and then we\'ll pick the sideline colour!'
      );
      return;
    }

    // Handle awaiting colour edit for an already-scheduled post
    if (state.awaitingColorEdit) {
      const parsedColor = parseSidelineColor(rawText);
      if (!parsedColor) {
        await message.reply(`⚠️ Please pick a valid colour option:\n\n${COLOR_MENU_TEXT}`);
        return;
      }
      state.awaitingColorEdit = false;
      client.positivityPromptState = state;
      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: state, updatedAt: new Date() },
        { upsert: true }
      );
      const savedDoc = await GlobalConfig.findOne({ key: 'next_positivity_payload' });
      if (savedDoc?.value) {
        await GlobalConfig.findOneAndUpdate(
          { key: 'next_positivity_payload' },
          {
            value: {
              ...savedDoc.value,
              color: parsedColor.hex,
              colorName: parsedColor.name,
              savedAt: new Date().toISOString()
            },
            updatedAt: new Date()
          },
          { upsert: true }
        );
        await message.reply(`🎨 **Sideline Colour Updated!** Changed to **${parsedColor.name}** (\`${parsedColor.hex}\`).`);
        return;
      }
    }

    // 3. IF WE ARE CURRENTLY WAITING FOR THE SIDELINE COLOUR CHOICE
    if (state.awaitingColor && state.pendingText) {
      const parsedColor = parseSidelineColor(rawText);
      if (!parsedColor) {
        await message.reply(`⚠️ I didn't recognize that colour. Please reply with a number \`1-9\`, a colour name, or a \`#hex\` code:\n\n${COLOR_MENU_TEXT}`);
        return;
      }

      const finalText = await resolveServerEmojis(state.pendingText);
      const finalImageUrl = state.pendingImageUrl === 'NONE' ? '' : state.pendingImageUrl;
      const currentMode = state.mode || 'scheduled';

      const resetState = {
        mode: 'scheduled',
        pendingText: '',
        pendingImageUrl: '',
        pendingColor: '',
        awaitingColor: false,
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
          color: parsedColor.hex,
          isTest: true
        });
        await message.reply(
          `✅ **Noted & Broadcasted!**\n` +
          `• **Sideline Colour:** ${parsedColor.name} (\`${parsedColor.hex}\`)\n` +
          `• Sent immediately to <#${POSITIVITY_CHANNEL_ID}>!`
        );
        console.log(`☀️ [Positivity Test] Broadcasted DM payload with color ${parsedColor.hex}.`);
        return;
      }

      // Scheduled mode: store for 6:45 AM IST
      await GlobalConfig.findOneAndUpdate(
        { key: 'next_positivity_payload' },
        {
          value: {
            text: finalText,
            imageUrl: finalImageUrl,
            color: parsedColor.hex,
            colorName: parsedColor.name,
            savedAt: new Date().toISOString()
          },
          updatedAt: new Date()
        },
        { upsert: true }
      );

      await message.reply(
        `✨ **Noted & Scheduled for 6:45 AM IST!**\n` +
        `• **Sideline Colour:** ${parsedColor.name} (\`${parsedColor.hex}\`)\n` +
        `• **Target:** <#${POSITIVITY_CHANNEL_ID}> (pinging <@&${POSITIVITY_ROLE_ID}>)\n\n` +
        `**Want to preview, edit, or cancel before 6:45 AM?** Just reply here with:\n` +
        `• \`preview\` — see a full preview of the scheduled post\n` +
        `• \`edit message <new text>\` — edit the text\n` +
        `• \`edit color <color>\` — change the sideline colour\n` +
        `• \`edit image\` (with a new image attached) — swap the image\n` +
        `• \`edit post\` — replace the entire post\n` +
        `• \`cancel post\` — cancel the scheduled post`
      );
      console.log(`☀️ [Positivity Scheduled] Locked in DM payload for 6:45 AM IST with color ${parsedColor.hex}.`);
      return;
    }

    // 4. COLLECTING MESSAGE TEXT (DIRECT OR .TXT FILE) & IMAGE
    const skipImage = /^(no image|skip|none)$/i.test(cleanedText) && !txtFileContent;
    const combinedIncomingText = txtFileContent
      ? (cleanedText ? `${cleanedText}\n\n${txtFileContent}` : txtFileContent)
      : cleanedText;

    if (!skipImage && combinedIncomingText) {
      state.pendingText = await resolveServerEmojis(combinedIncomingText);
    }
    if (incomingImageUrl) {
      state.pendingImageUrl = incomingImageUrl;
    } else if (skipImage) {
      state.pendingImageUrl = 'NONE';
    }

    const hasText = Boolean(state.pendingText);
    const hasImage = Boolean(state.pendingImageUrl);

    // Once we have both text and image, prompt for the Sideline Colour!
    if (hasText && hasImage) {
      state.awaitingColor = true;
      client.positivityPromptState = state;
      await GlobalConfig.findOneAndUpdate(
        { key: 'positivity_prompt_state' },
        { value: state, updatedAt: new Date() },
        { upsert: true }
      );

      await message.reply(
        `✅ **Message${state.pendingImageUrl !== 'NONE' ? ' and image' : ''} noted!**\n\n` +
        COLOR_MENU_TEXT
      );
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

  // Handle #e channel rules (only 'e' allowed, no double-posting in a row)
  if (message.channelId === E_CHANNEL_ID) {
    await handleEChannelMessage(message);
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
        color: savedDoc.value.color || '#FFD700',
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
