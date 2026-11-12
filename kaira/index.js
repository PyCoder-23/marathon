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

const USER_GUIDE_PATH = path.join(__dirname, '..', 'user_guide.md');

/**
 * Dynamically extracts the most relevant section(s) from user_guide.md based on what
 * the user is asking, keeping total prompt tokens around ~1,500 so we never hit Groq's
 * 8,000 TPM rate limit while still giving Kaira exact line-by-line User Guide details.
 */
function getRelevantGuideExcerpt(queryText) {
    try {
        const raw = fs.readFileSync(USER_GUIDE_PATH, 'utf8');
        const sections = raw.split(/\n(?=# PART |\n## )/g);
        const q = (queryText || '').toLowerCase();

        const keywords = q.split(/[^a-z0-9/-]+/).filter(w => w.length >= 3);
        if (keywords.length === 0) return '';

        const scored = sections
            .map(sec => {
                const lower = sec.toLowerCase();
                let score = 0;
                for (const kw of keywords) {
                    if (lower.includes(kw)) score += 1;
                }
                return { sec: sec.trim(), score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

        // Take top 2 matching sections (capped at ~3,500 chars to stay well within Groq TPM)
        let excerpt = '';
        for (const item of scored.slice(0, 2)) {
            if ((excerpt.length + item.sec.length) <= 3500) {
                excerpt += '\n\n' + item.sec;
            }
        }
        return excerpt.trim();
    } catch (_) {
        return '';
    }
}

function buildSystemPrompt(latestQueryText = '') {
    const detailedExcerpt = getRelevantGuideExcerpt(latestQueryText);

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
Kaira: nah, personal boosts and sabotages only affect weekly squad xp. individual xp stays pure grind so the cash leaderboard isn't pay-to-win

User: "i just finished a 3 hour session"
Kaira: valid. don't forget to attach your timelapse on /timer end before 4:30 am

━━━━━━━━━━━━━━━━━━
MARATHON SERVER MASTER CHEAT SHEET (ALWAYS ACCURATE):
1. Onboarding (/link): Run /link in Discord -> KAIRO DMs an 8-char code (30m expiry) -> enter at https://project-marathon.vercel.app/join -> auto-grants @member role, logs into website (30d), and auto-drafts into 1 of 4 Squads (Zenith Sentinels, Apex Titans, Meridian Arbiters, Horizon Vanguards).
2. Schedule & Resets (IST):
   - Weekly Challenge starts Monday (with announcement) -> ends Sunday 7:30 PM IST (Hard Reset; warnings at 7:00 PM & 7:20 PM). Wipes Weekly XP, Weekly Squad XP, Streaks, Active Timers, Weekly Sessions, Tasks, and active Boosts. Keeps Total XP, Coins, Shop Inventory/Themes, Squad Wins, Journal, and Planner forever.
   - Daily Cutoff: 4:30 AM IST (Tue-Sun, warning at 4:00 AM) auto-terminates any running/paused /timer so nobody leaves timers on overnight.
   - Weekend Rush: Fri 7:30 PM - Sun 7:30 PM IST automatic 2x XP (both Individual & Squad XP).
   - Daily Motivation: 8:00 AM IST quote ping for 💯 role.
3. Weekly Rewards (Subject to change, active when >10 participants):
   - 1st: ₹300 | 2nd: ₹200 | 3rd: ₹100 | Beat @randomxsoul bounty: ₹20 for everyone who beats @randomxsoul in Weekly Individual XP.
   - Special roles for #1 Individual & #1 Winning Squad + permanent mention in #hall-of-fame. Paid out Sunday night or by Monday EOD. Future special events have even bigger prize pools.
4. Timer & Proof (/timer):
   - Subcommands: /timer start, /timer pause (shows elapsed + potential XP), /timer resume (shows elapsed + potential XP), /timer view, /timer quit, /timer end [link] [proof1..proof24].
   - Minimum 25 mins for XP/streak (<25m = 0 XP). Base rate = 0.8 XP/min (25m=20 XP, 60m=48 XP, 125m=100 XP).
   - Screen/web work MUST be screen-recorded as a timelapse via https://project-marathon.vercel.app/timelapse (sessionrecorder.vercel.app, >30x speed, 360p-480p, max 25MB; blurring screen is allowed for privacy). Offline work: desk timelapse OR comprehensive photos of notes/PDFs/plans. If file >25MB or upload fails, KAIRO auto-pauses timer so progress isn't lost.
   - Anti-Cheat Bounty: Community verifies proofs in #proof-of-work. Confirmed cheating report rewards at least +25 XP (more for complex catches); cheaters are disqualified and repeat offenders get kicked/banned.
   - Honeypot Channel (1570490244392943717): Messaging there deletes the message and instantly bans the user (appeal to @randomxsoul if mistake).
5. Dual-XP System:
   - Individual Weekly XP (for cash prizes): ONLY affected by global surges (Weekend Rush 2x, Global Catalyst 10x, admin /set-multiplier). Immune to personal shop boosts & sabotages.
   - Weekly Squad XP: Stacks all personal/session/squad boosts and takes damage from sabotages. You must reach >=100 Weekly Squad XP to count as an Active Member toward your Squad's leaderboard score.
6. Streaks & Coins:
   - /redeem-coins cashes in your n-day streak and resets streak to 0. Formula: Total = 50 * 2^(n-1) coins -> 70% Personal (35 * 2^(n-1)) + 30% Squad Treasury tax (15 * 2^(n-1)). Always redeem before Sunday 7:30 PM reset!
   - /send-coins user (transfers personal coins; spreads Purple Fever if infected, costing recipient 50 Squad XP unless they have Anti-Viral) & /send-coins squad (donates to squad treasury).
7. Boosts & Sabotages (Buy on website /shop -> activate with /use-boost):
   - Multipliers: 1-5x-hour (120c), 2x-session (200c), streak-protection (250c), weekend-rush (400c, 1.5x extra on weekends), 2x-day (500c), 2x-week (3000c), squad-boost (750c, 1.2x team for day), xp-generator (10000c, 2x team for week), 10x-global (7500c, secret 1h 10x global surge for everyone).
   - Defense & Sabotages (affect Squad XP only): anti-viral (600c, 24h immunity), mini-sabotage (75c, -50 XP), purple-fever (450c, -200 XP + infects next 3 coin transfers for -50 XP each), vampire (4000c, halves target Squad XP but resets your Squad XP to 0), sabotage (5000c, halves target Squad XP).
8. Other Commands: /rank, /leaderboard, /active, /squad-status, /squad-leaderboard, /stalk [target:@user | team:<squad>] (shows rank, XP, Last 24h XP, coins, streak, tasks, sessions, inventory), /exchange-teams member:@user + /exchange-accept + /exchange-deny (1-for-1 squad swap, non-leaders, >0 weekly XP, 15m expiry, 7d cooldown).
9. Website (https://project-marathon.vercel.app): /dashboard (HUD), /shop (Nameplates, PFP Deco, 18 Fonts, Boosts, 17 Global Themes including 6 Biomes with ambient audio toggle in navbar + Demon Slayer Wisteria 2500c with Tanjiro & JJK Malevolent Shrine 3000c with Sukuna), /shop/returns (100% refund on unequipped paid cosmetics/themes), /leaderboard, /squads (Diamond/Gold/Silver/Bronze tiers, Rivalry gap tracker, MVP), /profile/me, /planner (Month/Week/Day grid), /planners (Printable 2-page A4 Daily/Weekly/Monthly PDFs), /journal (12k chars, 8 moods), /tasks, /timelapse, /donate (UPI: harleen.mit@oksbi).
${detailedExcerpt ? `\nADDITIONAL DETAILED REFERENCE FROM USER GUIDE:\n${detailedExcerpt}` : ''}`;
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
        // Fetch last 6 channel messages for natural conversational context
        const recentMessages = await message.channel.messages.fetch({ limit: 6 }).catch(() => null);
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

        const latestCleanText = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        if (contextMessages.length === 0) {
            contextMessages.push({
                role: 'user',
                content: `${message.author.username}: ${latestCleanText || 'hey'}`
            });
        }

        const systemPrompt = buildSystemPrompt(latestCleanText);
        const modelsToTry = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
        let reply = '';

        for (const modelName of modelsToTry) {
            try {
                const params = {
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...contextMessages
                    ],
                    model: modelName,
                    temperature: 0.75,
                    max_completion_tokens: 1024,
                    top_p: 1,
                    stream: false
                };
                if (modelName.startsWith('openai/gpt-oss')) {
                    params.reasoning_effort = 'low';
                }

                const chatCompletion = await groq.chat.completions.create(params);
                const content = chatCompletion.choices[0]?.message?.content?.trim();
                if (content) {
                    // Strip any <think>...</think> tags if a fallback model emits them
                    reply = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                    if (reply) break;
                }
            } catch (modelErr) {
                console.warn(`⚠️ [KAIRA] Model ${modelName} failed (${modelErr.message}), trying next...`);
            }
        }

        await message.reply(reply || "hm?");
    } catch (error) {
        console.error('Groq API Error:', error);
        await message.reply("brain lagged for a sec, say that again").catch(() => {});
    }
});

client.login(process.env.KAIRA_TOKEN);
