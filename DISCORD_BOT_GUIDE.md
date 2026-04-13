# 🤖 Marathon Twin-Bot Protocol: Setup Guide

This guide will walk you through setting up both **KAIRO** (The Disciplined Mentor) and **KAIRA** (The Sarcastic Teenager).

---

## 🏗️ Phase 1: Create your Discord Applications

You need to create **two** separate applications in the [Discord Developer Portal](https://discord.com/developers/applications).

### 1.1: Initialize KAIRO (Main Bot)
1.  **New Application** -> Name: `KAIRO`.
2.  Go to **Bot** tab -> **Reset Token** -> Copy this as `DISCORD_TOKEN`.
3.  **Enable Intents** (CRITICAL):
    - `Presence Intent`
    - `Server Members Intent`
    - `Message Content Intent`
4.  **Invite Scopes**: `OAuth2` -> `URL Generator`. Select `bot` and `applications.commands`.
5.  **Permissions**: `Administrator` (or `Manage Roles`, `Manage Channels`, `Send Messages`, `Embed Links`, `Attach Files`).

### 1.2: Initialize KAIRA (AI Bot)
1.  **New Application** -> Name: `KAIRA`.
2.  Go to **Bot** tab -> **Reset Token** -> Copy this as `KAIRA_TOKEN`.
3.  **Enable Intents**:
    - `Message Content Intent`
4.  **Invite Scopes**: Same as above (only `bot` scope needed if she has no slash commands).

---

## ⚙️ Phase 2: Configuration & Environment

You need to set up your `.env` variables to bridge the bots to the servers.

### 2.1: Main Project Variables
In your root `.env` or `/bot/.env`, ensure these are present:
```env
# KAIRO (Main Bot)
DISCORD_TOKEN=your_kairo_token
CLIENT_ID=kairo_application_id
GUILD_ID=your_server_id
kairo_key=your_gemini_api_key
MEMBER_ROLE_NAME=member

# KAIRA (AI Bot)
KAIRA_TOKEN=your_kaira_token
KAIRA_KEY=your_groq_api_key
```

> [!TIP]
> To get your **GUILD_ID**, right-click your server icon in Discord and select **"Copy Server ID"**.

---

## 🚀 Phase 3: Deployment

### 3.1: Deploy KAIRO (Functional Bot)
KAIRO uses slash commands which must be registered with Discord.
```bash
cd bot
npm install
node deploy-commands.js
```

### 3.2: Deploy KAIRA (Responsive Bot)
KAIRA is purely responsive and uses the Groq Llama 3 model to talk.
```bash
cd kaira
npm install
```

---

## 🏃‍♂️ Phase 4: Running the Bots (PM2)

To keep both bots running 24/7 on your server, use **PM2**.

```bash
# Start KAIRO
cd bot
pm2 start index.js --name "kairo"

# Start KAIRA
cd ../kaira
pm2 start index.js --name "kaira"

# Save the processes for server reboots
pm2 save
```

---

## 🧪 Phase 5: Testing the Operations

### 🔗 Linking your Account
1.  Run `/link` in Discord.
2.  Check your **DMs** for the 8-character code.
3.  Enter the code on the **Marathon Website** to sync your profile.

### ⏱️ Using the Timer (KAIRO)
- `/timer start`: Start your focus clock.
- `/timer view`: Check elapsed time and **potential XP**.
- `/timer end`: Finish and upload proof (Required).

### 🏆 Checking Rankings
- `/rank`: See your own standing.
- `/leaderboard`: Interactive list of top 10 agents.
- `/active`: Live list of who is currently working.

### 🙄 Talking to KAIRA
- Simply **ping @KAIRA** in any channel and ask her something. Be prepared for attitude.

---

### ⚠️ Troubleshooting
- **Commands missing?** Wait 5 mins after running `node deploy-commands.js` and restart your Discord client (`Cmd+R`).
- **KAIRA not responding?** Ensure your `KAIRA_KEY` (Groq) is valid and she has `Message Content Intent` enabled in the portal.
- **XP not counting?** Remember: Sessions under 25 minutes grant **0 XP**. Stay disciplined!
