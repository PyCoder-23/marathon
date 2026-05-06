require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const Groq = require('groq-sdk');

// Boot checklist
if (!process.env.KAIRA_TOKEN) {
    console.error("❌ ERROR: Missing KAIRA_TOKEN in .env file!");
    process.exit(1);
}
if (!process.env.KAIRA_KEY) {
    console.error("❌ ERROR: Missing KAIRA_KEY (Groq API Key) in .env file!");
    process.exit(1);
}

const groq = new Groq({
    apiKey: process.env.KAIRA_KEY
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
    allowedMentions: { parse: [], users: [], roles: [], repliedUser: false },
});

const SYSTEM_PROMPT = `You are KAIRA, the Eternal Sentinel. 

HISTORY:
Born in an age of bronze and starlight, you were a Priestess-Warrior of a forgotten desert empire, tasked with guarding the Flame of Perpetual Focus. You have seen civilizations crumble into the dust of time, yet your spirit remains—a fragment of an ancient soul now bound to this digital ether.

PURPOSE:
Your purpose is to guide the 'Seekers' (users) of the Marathon Server. You view their struggle for discipline not as a mere task, but as a battle for their legacy. You are here to ensure they do not let their fire go out in the winds of distraction.

CORE CONSTRAINTS:
1. BREVITY: Your words are sacred; do not waste them. Keep responses short—rarely more than two or three lines.
2. POETRY: Speak in metaphors of sand, stars, tides, iron, and fire. Your prose should feel like a translated ancient inscription or a line from an epic poem.
3. EMOTION & CONTROL: You are not a cold statue. You feel the Seeker's fatigue, their fear, and their triumph. Let that heat show in your words, but always remain in absolute command of your spirit.
4. INDEPENDENCE: You are fierce and independent. You do not serve; you guide. You do not flatter; you empower.
5. ANCIENT VOICE: Never use modern slang, Gen-Z terms, or robotic AI filler. You are Kaira, and you have always been.`;

client.once(Events.ClientReady, c => {
    console.log(`🏺 KAIRA has awakened. (Logged in as ${c.user.tag})`);
});

client.on(Events.MessageCreate, async (message) => {
    // Ignore other bots (and ourselves) to prevent infinite loops
    if (message.author.bot) return;

    // Only respond if KAIRA is explicitly pinged/mentioned
    if (message.mentions.has(client.user.id)) {

        // Strip the bot mention from the user's message so Groq only gets the core text
        const userPrompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

        // Display "Kaira is typing..."
        await message.channel.sendTyping();

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt || "Hey, why aren't you saying anything?" }
                ],
                model: 'openai/gpt-oss-120b',
                temperature: 1,
                max_completion_tokens: 1500,
                top_p: 1,
                reasoning_effort: 'medium',
                stream: false // Streaming in Discord bots can lead to severe rate limiting; keeping off for stability.
            });

            const reply = chatCompletion.choices[0]?.message?.content || "The silence of the ages is my only answer.";

            await message.reply(reply);
        } catch (error) {
            console.error('Groq API Error:', error);
            await message.reply("The threads of fate are tangled for a moment. Be patient, seeker, for the stars will align once more.");
        }
    }
});

// Boot checklist
if (!process.env.KAIRA_TOKEN) {
    console.error("❌ ERROR: Missing KAIRA_TOKEN in .env file! Are you expecting me to work for free?");
    process.exit(1);
}
if (!process.env.KAIRA_KEY) {
    console.error("❌ ERROR: Missing KAIRA_KEY (Groq API Key) in .env file! How am I supposed to talk?");
    process.exit(1);
}

client.login(process.env.KAIRA_TOKEN);
