# 🤖 Marathon Discord Bot: Comprehensive Setup Guide

This guide will walk you through the entire process of setting up, configuring, and running the **Marathon Discord Bot** to work in tandem with your futuristic website.

---

## 🏗️ Phase 1: Create your Discord Application

### 1.1: Initialize via Developer Portal
1.  Navigate to the **[Discord Developer Portal](https://discord.com/developers/applications)**.
2.  Log in and click the **"New Application"** button (top-right).
3.  **Name**: `Marathon Bot` (or your preferred name) and click **Create**.

### 1.2: Configure the Bot User
1.  Go to the **"Bot"** tab on the left sidebar.
2.  **Reset Token** (or **Copy Token**) and save it safely. This is your `DISCORD_TOKEN`.
3.  **Privileged Gateway Intents**: Scroll down and enable these three (CRITICAL):
    -   `Presence Intent`
    -   `Server Members Intent`
    -   `Message Content Intent`
4.  Click **Save Changes**.

---

## 🔗 Phase 2: Invite Bot to your Server

### 2.1: Generate Invite URL
1.  Go to **"OAuth2"** -> **"URL Generator"**.
2.  **Scopes**: Check `bot` and `applications.commands`.
3.  **Bot Permissions**: Check `Administrator` (for testing convenience) or manually select:
    -   `Send Messages`
    -   `Embed Links`
    -   `Attach Files`
    -   `Manage Channels`
4.  **Copy the URL** generated at the bottom.

### 2.2: Authorize
1.  Paste the URL into your browser.
2.  Select the server you want the bot to join and click **Authorize**.

---

## ⚙️ Phase 3: Local Configuration

### 3.1: Environment Variables
1.  Open your project directory and navigate to the `/bot` folder.
2.  Create a file named **`.env`**.
3.  Add the following keys (replace with your actual data):
    ```env
    DISCORD_TOKEN=your_bot_token_from_portal
    CLIENT_ID=your_application_id (Found under "General Information")
    GUILD_ID=your_discord_server_id
    ```
    > [!TIP]
    > To get your **GUILD_ID**, right-click your server icon in Discord and select **"Copy Server ID"** (Requires Discord Developer Mode enabled in Settings -> Advanced).

### 3.2: Install Dependencies
Run the following in your terminal:
```bash
cd bot
npm install
```

---

## 🚀 Phase 4: Launch & Deploy

### 4.1: Register Slash Commands
Slash commands like `/start`, `/end`, and `/signup` must be "deployed" to Discord before they appear in your server:
```bash
node deploy-commands.js
```

### 4.2: Start the Bot
Now, launch the bot's heart:
```bash
node index.js
```
The bot should now show a "System Online" message in your terminal and appear as **online** in your Discord server.

---

## 🧪 Phase 5: Testing the Integration

### Sign-Up Verification
1.  Run `/signup` in your Discord server.
2.  The bot will send you a **Direct Message (DM)** with a **6-digit code**.
3.  Open [Signup Page](http://localhost:3000/signup) on the website and enter the code to verify your identity.

### Session Lifecycle
1.  Run `/start` to begin your study session.
2.  Run `/end` when you're done. The bot will prompt you to **upload an image attachment** as proof of work.
3.  Submissions will be automatically logged in the `#proof-of-work` channel.

---

### ⚠️ Troubleshooting
-   **Commands aren't appearing?** Ensure you ran `node deploy-commands.js` and wait up to 5 minutes for Discord to globalize them.
-   **Bot isn't responding?** Check if `Message Content Intent` is enabled in the Developer Portal.
-   **Website won't let you in?** Ensure the **Username** on the website exactly matches your **Discord Username** (it's case-sensitive!).

---

> [!NOTE]
> For any design refinements or logic tweaks, please reach out to the project admin.
