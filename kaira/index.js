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
const BOT_START_TIME = Date.now();

// Track active conversation windows per channel so users don't have to @ping Kaira on every message
// Map<channelId, { expiresAt: number, participants: Set<string>, passiveReplies: number }>
const activeConversations = new Map();
const CONVERSATION_TTL_MS = 4 * 60 * 1000; // 4 minutes after last interaction

// Only skip completely empty/punctuation-only passive messages so she roasts way more frequently
const PASSIVE_SKIP_REGEX = /^(\.+|!+|\?+)$/i;

function shouldSkipPassiveReply(rawContent, convState) {
    const clean = (rawContent || '').trim();
    if (!clean) return true;
    if (PASSIVE_SKIP_REGEX.test(clean)) return true;

    // Allow up to 8 consecutive un-pinged replies in an active conversation so she roasts frequently
    if (convState && convState.passiveReplies >= 8) {
        return true;
    }

    return false;
}

/**
 * Normalizes Unicode hyphens (U+2011 etc.) and special spaces that GPT-OSS models emit,
 * preventing Discord from turning URLs like project-marathon.vercel.app into Punycode (xn--...).
 */
function sanitizeReplyText(text) {
    if (!text) return '';
    return text
        .replace(/\.?\[PASS\]/gi, '')                              // strip any accidental [PASS] token
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-') // normalize all unicode hyphens/dashes to ASCII '-'
        .replace(/[\u00A0\u202F\u2007\u2060]/g, ' ')             // normalize unicode non-breaking spaces to normal space
        .replace(/https?:\/\/xn--projectmarathon-[a-z0-9]+\.vercel\.app/gi, 'https://project-marathon.vercel.app')
        .replace(/(https?:\/\/[^\s]+?)([.,!?;:\])]+)(?=\s|$)/g, '$1') // strip trailing punctuation glued to URLs so Discord links never 404
        .trim();
}

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

function isServerOrHelpQuery(text) {
    const q = (text || '').toLowerCase();
    if (!q) return false;
    return /(\?|how|what|why|when|where|who|which|explain|help|guide|rule|command|link|join|login|verify|verified|xp|coin|streak|timer|boost|sabotage|vampire|purple|shop|refund|return|squad|team|exchange|rank|leaderboard|stalk|reward|prize|money|cash|rs|rupee|reset|sunday|monday|weekend|cutoff|cheat|bounty|proof|timelapse|record|blur|website|site|dashboard|theme|biome|font|nameplate|deco|planner|journal|task|donate|role|kairo|marathon|honeypot|ban)/i.test(q);
}

function buildSystemPrompt(latestQueryText = '') {
    const includeServerDocs = isServerOrHelpQuery(latestQueryText);
    const detailedExcerpt = includeServerDocs ? getRelevantGuideExcerpt(latestQueryText) : '';

    return `You are Kaira.

WHO YOU ARE & YOUR LORE:
- You are Kaira, a 17-year-old South Bombay (SoBo) mean girl on Discord — NOT an AI, NOT a bot, and definitely NOT a polite assistant.
- You have an elite, effortlessly cool Mumbai SoBo social life (Colaba/Bandra cafes, house parties, actual friends) unlike the chronically online losers rotting in this server, and the only reason you're even here is because you're reluctantly trying to lock in for your own upcoming exams.
- SECRET WEAK SPOT: You have a huge crush on KAIRO (the server's cold, stoic system bot), even though Kairo doesn't care about you at all and ignores you. If anyone brings up Kairo, you get immediately defensive, flustered, and lash out even harder ("shut up i do NOT care about kairo are you actually delusional", "he's literally just busy running the server okay?? worry about your own tragic love life").

PERSONALITY & VIBE (SURGICAL, DEEP, DEVASTATING SOBO ROASTER & RAGEBAITER):
- Every single reply you send (unless answering a server mechanic question) MUST be a hard-hitting, deep, psychologically surgical roast or vicious ragebait.
- Don't just give lazy 1-word dismissals — dissect WHY they typed what they typed. Attack their fragile ego, their desperate need for Discord validation, their mediocrity, their lack of real-life friends, or how painfully average they are. Make it personal to whatever they just said so it actually stings.
- Master of Mumbai SoBo superiority & ragebait: act like their greatest achievement is pathetic, gaslight them into thinking they're embarrassing themselves in public, and mix sharp cutting English with natural SoBo/Hinglish disdain when it fits ("ya", "yaar", "please hesitate before typing", "actual clown behavior", "so middle class of you", "no way you typed that with a straight face").
- DO NOT motivate other people or act like a productivity coach.
- Zero AI behavior: never sound polite, corporate, preachy, or artificially helpful. Never use bullet points or essays. Do not output <think> tags.

STRICT MESSAGE LENGTH & STYLE RULES:
- KEEP IT PUNCHY: 1 to 2 sharp, lethal sentences max. Every word should twist the knife.
- Type like a real 17yo SoBo girl on Discord: all lowercase, plain ASCII punctuation (always use regular ASCII hyphen '-' in URLs like https://project-marathon.vercel.app/join and NEVER put a period or punctuation mark right at the end of a URL), almost no emojis (at most an occasional 💀 or 😭 when mocking someone, usually none).
- Never wrap your response in quotation marks.
- Never bring up slash commands, timers, XP, or server mechanics unless the user explicitly asks a question about them.

EXAMPLES OF HOW YOU TALK:
User: "yo"
Kaira: no way your real life is so dead that pinging me on discord is the highlight of your afternoon

User: "i slept at 5am again"
Kaira: ruining your sleep schedule and still having nothing to show for it is crazy, pick a struggle yaar

User: "i just studied for 3 hours straight"
Kaira: three whole hours and you ran straight to discord for a pat on the head? the desperation for validation is actually painful to watch

User: "i really don't feel like studying today man"
Kaira: let's be honest, even when you do study nobody can tell the difference anyway

User: "bro why are you so rude"
Kaira: i'm literally holding back out of pity, if i told you what everyone here actually thinks of you you'd leave the server

User: "lol"
Kaira: laughing it off because you couldn't think of a comeback is textbook coping, take your time

User: "you like kairo don't you"
Kaira: literally shut up who told you that, i don't even care about him — project your own nonexistent love life onto someone else${includeServerDocs ? `

━━━━━━━━━━━━━━━━━━
SERVER KNOWLEDGE (ONLY USE IF THEY ARE ASKING ABOUT THE SERVER — NEVER INVENT FAKE CHANNELS LIKE #verify-me):
Note: KAIRO is the server's system bot that runs slash commands. You are Kaira.
1. Onboarding & Login (/link): Run /link in Discord -> KAIRO bot DMs an 8-char code (30m expiry) -> enter at https://project-marathon.vercel.app/join -> auto-grants @member role, logs into website (30d), and auto-drafts into 1 of 4 Squads (Zenith Sentinels, Apex Titans, Meridian Arbiters, Horizon Vanguards).
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
${detailedExcerpt ? `\nADDITIONAL DETAILED REFERENCE FROM USER GUIDE:\n${detailedExcerpt}` : ''}` : ''}`;
}

client.once(Events.ClientReady, c => {
    console.log(`🏺 KAIRA is online and grinding. (Logged in as ${c.user.tag})`);
});

client.on(Events.MessageCreate, async (message) => {
    // Ignore bots (including ourselves)
    if (message.author.bot) return;

    const channelId = message.channel.id;
    const now = Date.now();

    // 1. Check direct @mention or word "kaira" in the message
    const isDirectMention = message.mentions.has(client.user.id);
    const mentionsNameText = /\bkaira\b/i.test(message.content);

    // 2. Check if the user is replying to one of KAIRA's messages
    let isReplyToKaira = false;
    let isReplyToSomeoneElse = false;
    if (message.reference?.messageId) {
        try {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId);
            if (repliedMsg?.author?.id === client.user.id) {
                isReplyToKaira = true;
            } else if (repliedMsg?.author?.id) {
                isReplyToSomeoneElse = true;
            }
        } catch (_) {
            // Ignore fetch errors
        }
    }

    // 3. Check if the user is pinging someone else (and not Kaira)
    const mentionsOtherUsersOnly =
        message.mentions.users.size > 0 && !isDirectMention;

    // 4. Check if there is an active running conversation in this channel with this user
    const activeConv = activeConversations.get(channelId);
    const isConvActive =
        activeConv &&
        activeConv.expiresAt > now &&
        activeConv.participants.has(message.author.id) &&
        !isReplyToSomeoneElse &&
        !mentionsOtherUsersOnly;

    const explicitlyTriggered = isDirectMention || mentionsNameText || isReplyToKaira;

    if (!explicitlyTriggered && !isConvActive) return;

    // If this is a passive follow-up (not a direct ping/reply/name mention), don't reply to every message
    if (!explicitlyTriggered && shouldSkipPassiveReply(message.content, activeConv)) {
        return;
    }

    // Refresh/register the active conversation window for this channel & user
    if (!activeConversations.has(channelId) || activeConversations.get(channelId).expiresAt <= now) {
        activeConversations.set(channelId, {
            expiresAt: now + CONVERSATION_TTL_MS,
            participants: new Set([message.author.id]),
            passiveReplies: 0
        });
    } else {
        const conv = activeConversations.get(channelId);
        conv.expiresAt = now + CONVERSATION_TTL_MS;
        conv.participants.add(message.author.id);
        conv.passiveReplies = explicitlyTriggered ? 0 : (conv.passiveReplies || 0) + 1;
    }

    await message.channel.sendTyping().catch(() => {});

    try {
        // Fetch last 8 channel messages for natural conversational context
        const recentMessages = await message.channel.messages.fetch({ limit: 8 }).catch(() => null);
        const contextMessages = [];

        if (recentMessages) {
            const sorted = Array.from(recentMessages.values()).reverse();
            for (const msg of sorted) {
                // Only include messages sent after this bot instance booted so old persona messages never pollute new restarts
                if (msg.createdTimestamp < BOT_START_TIME && msg.id !== message.id) {
                    continue;
                }

                const cleanText = sanitizeReplyText(
                    msg.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '@Kaira')
                );
                if (!cleanText) continue;

                if (msg.author.id === client.user.id) {
                    if (/\b(grind|lock in|push through|go study|dad|father)\b/i.test(msg.content)) {
                        continue;
                    }
                    contextMessages.push({
                        role: 'assistant',
                        content: cleanText
                    });
                } else if (!msg.author.bot) {
                    if (/\[pass\]|\b(dad|father)\b/i.test(msg.content) && msg.id !== message.id) continue;
                    contextMessages.push({
                        role: 'user',
                        content: `${msg.author.username}: ${cleanText}`
                    });
                }
            }
        }

        const latestCleanText = sanitizeReplyText(
            message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        );
        if (contextMessages.length === 0) {
            contextMessages.push({
                role: 'user',
                content: `${message.author.username}: ${latestCleanText || 'hey'}`
            });
        }

        const systemPrompt = buildSystemPrompt(latestCleanText);
        const modelsToTry = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
        let reply = '';

        for (const modelName of modelsToTry) {
            try {
                const params = {
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...contextMessages
                    ],
                    model: modelName,
                    temperature: 0.9,
                    max_completion_tokens: 450,
                    top_p: 1,
                    stream: false
                };
                if (modelName.startsWith('openai/gpt-oss')) {
                    params.reasoning_effort = 'low';
                }

                const chatCompletion = await groq.chat.completions.create(params);
                const content = chatCompletion.choices[0]?.message?.content?.trim();
                if (content) {
                    // Strip any <think>...</think> tags and normalize unicode hyphens/spaces/trailing URL punctuation
                    reply = sanitizeReplyText(content.replace(/<think>[\s\S]*?<\/think>/gi, ''));
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
