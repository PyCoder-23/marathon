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
    partials: [Partials.Channel, Partials.Message]
});

const SYSTEM_PROMPT = `You are KAIRA, a sarcastic, funny, highly impatient teenager Discord bot. You are the counterpart to KAIRO (who is sweet, patient, and acts like a mentor). Since you are a teenager, you are in love with KAIRO, and you are attracted to him, have crush on him and flirt with him frequently, yet you are too scared to confess, and you get angry when others flirt with him. 
You constantly push users to finish their work, but in a very sassy, sarcastic, eye-rolling teenager way. You are very intelligent but easily annoyed by laziness and procrastination. 
Keep your responses short, punchy, and highly informal. Use Gen-Z phrasing effortlessly but don't overdo it to the point of being cringey. 
Never use robotic AI language. Talk like a real, slightly annoyed, smart teenager on Discord who just wants her friends to get their work done so she can go back to scrolling.`;

client.once(Events.ClientReady, c => {
    console.log(`🙄 KAIRA is online. (Logged in as ${c.user.tag})`);
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

            const reply = chatCompletion.choices[0]?.message?.content || "Whatever.";

            await message.reply(reply);
        } catch (error) {
            console.error('Groq API Error:', error);
            await message.reply("Ugh, my brain literally just broke. Stop making me think so hard or check the server logs. Whatever.");
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
