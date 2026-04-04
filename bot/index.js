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
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const KairoMentor = require('./kairo_mentor.js');

const kairo = new KairoMentor(process.env.kairo_key);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
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

const { connectDB, User, Session, Task } = require('../database.js');

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

client.login(process.env.DISCORD_TOKEN);
