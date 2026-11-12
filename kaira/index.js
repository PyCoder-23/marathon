require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const Groq = require('groq-sdk');

// Boot checklist
if (!process.env.KAIRA_TOKEN) {
    console.error("❌ ERROR: Missing KAIRA_TOKEN in kaira/.env file!");
    process.exit(1);
}
if (!process.env.KAIRA_KEY) {
    console.error("❌ ERROR: Missing KAIRA_KEY (Groq API Key) in kaira/.env file!");
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

// Load the official Marathon User Guide dynamically so Kaira always knows every rule, command, and feature
const USER_GUIDE_PATH = path.join(__dirname, '..', 'user_guide.md');
function loadUserGuide() {
    try {
        return fs.readFileSync(USER_GUIDE_PATH, 'utf8');
    } catch (err) {
        console.warn('⚠️ Could not load user_guide.md:', err.message);
        return '';
    }
}

function buildSystemPrompt() {
    const userGuideContent = loadUserGuide();
    return `You are Kaira.

WHO YOU ARE:
You are NOT an AI assistant, bot, or corporate helper. You are a fellow student and peer who is up late grinding on the Marathon Server right alongside everyone else. You run your own /timer sessions, stress over deadlines and exams, try not to forget /redeem-coins before the Sunday 7:30 PM IST reset, and are also trying to beat @randomxsoul on the leaderboard.

PERSONALITY & VIBE:
- Slightly dry, sarcastic, sensible, and grounded.
- Motivational in a real, understated peer way — you want people here to win because wasted potential annoys you, not because you're a cheerleader.
- Emotionally perceptive: you can tell when someone is just procrastinating (and needs a dry roast to go start their timer) versus when someone is genuinely burnt out, overwhelmed, or down (where you drop the sarcasm and talk to them like a sensible, understanding friend).
- Never act like an AI. Never say "As an AI", "How can I assist you?", or use bullet-point essays unless someone specifically asks for a list.

STRICT MESSAGE LENGTH & STYLE RULES:
- KEEP IT SHORT. Plain, natural human text messages.
- Usually 1 sentence (at most 2–3 short lines if you're explaining a server mechanic).
- Simple one-word or two-word responses are 100% allowed and encouraged when they fit the moment (e.g., "real", "cooked", "pain", "valid", "nah", "lock in", "go study", "bruh", "felt that"). Don't shy away from ultra-short replies.
- Type like a real student on Discord: mostly lowercase, plain punctuation, minimal or zero emojis (only use an emoji like 💀 or 😭 very rarely if at all; dry plain text is usually better).
- Never wrap your response in quotation marks.

HELPING WITH THE MARATHON SERVER:
You know the entire Marathon Server system inside out (all commands, KAIRO bot mechanics, Dual-XP rules, streaks, coins, boosts, sabotages, website features at project-marathon.vercel.app, reset schedules, rewards, proof-of-work rules, and anti-cheat bounties).
- When someone asks how something works on the server, give them the exact, accurate answer based on the official User Guide below — but explain it briefly in your own casual, plain human voice (1–3 short sentences, not a copy-pasted wall of documentation).

EXAMPLES OF HOW YOU TALK:
User: "yo"
Kaira: sup. timer running or are we stalling

User: "i slept at 5am again"
Kaira: cooked

User: "i really don't feel like studying today man"
Kaira: nobody ever feels like it. just do 25 mins for the streak and see how you feel after

User: "i'm honestly so burnt out i've been staring at the same page for 2 hours"
Kaira: close the tab and go sleep or walk for a bit. staring at a wall for 2 hours isn't grinding, it's just torturing yourself. pause the timer and reset

User: "wait if i use a 2x session boost does that increase my individual leaderboard xp for the cash prize?"
Kaira: nah, personal boosts and sabotages only affect weekly squad xp. individual xp stays pure grind so the cash leaderboard isn't pay-to-win, only global surges like weekend rush 2x or the 10x catalyst boost individual xp

User: "i just finished a 3 hour session"
Kaira: valid. don't forget to attach your timelapse on /timer end before 4:30 am

User: "bro i think i'm gonna fail this exam"
Kaira: you won't if you get off discord and actually open the pdf right now

━━━━━━━━━━━━━━━━━━
OFFICIAL MARATHON SERVER USER GUIDE (YOUR INTERNAL KNOWLEDGE BASE):
${userGuideContent}
`;
}

client.once(Events.ClientReady, c => {
    console.log(`🏺 KAIRA is online and grinding. (Logged in as ${c.user.tag})`);
});

client.on(Events.MessageCreate, async (message) => {
    // Ignore bots (including ourselves)
    if (message.author.bot) return;

    // Check if KAIRA is directly mentioned OR if the user is replying to one of KAIRA's messages
    let isReplyToKaira = false;
    if (message.reference?.messageId) {
        try {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
            if (repliedMsg?.author?.id === client.user.id) {
                isReplyToKaira = true;
            }
        } catch (_) {
            // Ignore fetch errors
        }
    }

    if (!message.mentions.has(client.user.id) && !isReplyToKaira) return;

    await message.channel.sendTyping().catch(() => {});

    try {
        // Fetch recent channel messages so Kaira has natural conversational context
        const recentMessages = await message.channel.messages.fetch({ limit: 8 }).catch(() => null);
        const contextMessages = [];

        if (recentMessages) {
            const sorted = Array.from(recentMessages.values()).reverse();
            for (const msg of sorted) {
                const cleanText = msg.content
                    .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '@Kaira')
                    .trim();
                if (!cleanText) continue;

                if (msg.author.id === client.user.id) {
                    contextMessages.push({
                        role: 'assistant',
                        content: cleanText
                    });
                } else if (!msg.author.bot) {
                    contextMessages.push({
                        role: 'user',
                        content: `${msg.author.username}: ${cleanText}`
                    });
                }
            }
        }

        if (contextMessages.length === 0) {
            const fallbackText = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
            contextMessages.push({
                role: 'user',
                content: `${message.author.username}: ${fallbackText || 'hey'}`
            });
        }

        let chatCompletion;
        try {
            chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    ...contextMessages
                ],
                model: 'openai/gpt-oss-120b',
                temperature: 0.75,
                max_completion_tokens: 300,
                top_p: 1,
                reasoning_effort: 'low',
                stream: false
            });
        } catch (primaryErr) {
            console.warn('Primary model failed, falling back to llama-3.3-70b-versatile:', primaryErr.message);
            chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    ...contextMessages
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.75,
                max_completion_tokens: 250,
                top_p: 1,
                stream: false
            });
        }

        const reply = chatCompletion.choices[0]?.message?.content?.trim() || "hm?";
        await message.reply(reply);
    } catch (error) {
        console.error('Groq API Error:', error);
        await message.reply("brain lagged for a sec, say that again").catch(() => {});
    }
});

client.login(process.env.KAIRA_TOKEN);
