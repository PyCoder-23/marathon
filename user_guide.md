# 🏃‍♂️ PROJECT MARATHON — THE COMPLETE MASTER USER GUIDE & DOCUMENTATION

> **_"Discipline is choosing between what you want now and what you want most."_**
>
> Welcome to **Project Marathon** — a gamified productivity, study, and accountability ecosystem built for ambitious students, developers, and creators.
>
> Our system combines **4 interconnected pillars**:
> 1. 🤖 **KAIRO (`𝙺ΛIЯØ`)** — Our tactical Discord operations bot that tracks your study timers, proof of work, streaks, coins, squads, boosts, and sabotages.
> 2. 🌐 **The Marathon Website (`https://project-marathon.vercel.app`)** — Your personal Web Command Center featuring your HUD Dashboard, Store, Cosmetics, Live Leaderboards, Squad HQ, Interactive Calendar, Printable A4 PDF Planners, Encrypted Journal, Daily Tasks, and Timelapse Recorder.
> 3. 🧠 **KAIRA (`@KAIRA`)** — Our resident AI companion in Discord who keeps you company, answers questions, and roasts you when you procrastinate.
> 4. 🏆 **Real Weekly Cash Rewards & Squad Warfare** — Compete solo for real money and as a Squad for server dominance and a permanent place in `#hall-of-fame`.

---

# 📌 PART 1: GETTING STARTED — ACCOUNT LINKING & SQUAD DRAFTING

Before you can use **any** bot command in Discord (every command except `/link` is locked for unlinked users) or log into the website, you must link your Discord account.

### 🔹 How to Link Your Account (`/link` ➔ Website `/join`)
1. **Run `/link` in Discord:**
   - Go to any bot command channel in the Marathon Discord server and type:
     `/link`
2. **Copy Your 8-Character Code from DMs:**
   - **KAIRO** will immediately send you a private Direct Message with a unique **8-character one-time code** (e.g., `A7F9K2M4`).
   - ⏳ *This code is valid for **30 minutes**.*
   - ⚠️ *If KAIRO says it couldn't DM you, enable **"Allow direct messages from server members"** in your Discord Privacy Settings for this server and run `/link` again.*
3. **Enter the Code on the Website:**
   - Open **[https://project-marathon.vercel.app/join](https://project-marathon.vercel.app/join)** *(or click **"Access Community"** / **"Start Training"** on the homepage)*.
   - Paste your **8-character code** into the terminal box and click **Synchronize Identity**.
4. **What Happens Automatically When You Link:**
   - ✅ **Server Verification:** Confirms you are inside the Marathon Discord server and assigns you the verified **`@member`** role.
   - 🛡️ **Automatic Squad Draft:** Drafts you into one of the **4 Faction Squads** and gives you your **Discord Squad Role** *(the system automatically assigns you to the squad with the lowest active Weekly Squad XP—or lowest member count on a tie—to keep teams 100% balanced)*:
     - 🟣 **Zenith Sentinels** — *"None Stand Above."* (Violet `#8B5CF6`)
     - 🔵 **Apex Titans** — *"The Peak is Our Domain."* (Cyan `#06B6D4`)
     - 🟢 **Meridian Arbiters** — *"Control the Center, Rule the Field."* (Green `#22C55E`)
     - 🟠 **Horizon Vanguards** — *"No Limit. No End."* (Orange `#F97316`)
   - 🖥️ **Web Session Unlocked:** Logs your browser into the Marathon Website for **30 days** and sends a Welcome DM from KAIRO.
   - 💤 **Re-linking After 30 Days (`DASHBOARD_SLEEP_MODE`):** If you don't visit the website for over 30 days, your web dashboard enters **Sleep Mode** for security. Simply click **Disconnect**, run `/link` again in Discord, and enter the new code to wake it back up without losing any data!

---

# 🗓️ PART 2: WEEKLY CHALLENGE SCHEDULE & RESET TIMINGS (IST)

All server schedules run on **Indian Standard Time (IST / UTC+5:30)**.

### 🔹 1. The Weekly Challenge Cycle (`Monday` ➔ `Sunday 7:30 PM IST`)
- **📢 Monday Kickoff:** Every **Monday**, the new Weekly Challenge officially begins with a server announcement.
- **⚡ Weekend Rush (`Friday 7:30 PM IST` ➔ `Sunday 7:30 PM IST`):**
  - Every Friday evening at **7:30 PM IST**, **Weekend Rush** turns on automatically for the final 48 hours of the week.
  - During Weekend Rush, **every session ended earns an automatic `2x XP` multiplier** on **both** your Individual Weekly XP and your Weekly Squad XP!
- **🚨 Weekly Hard Reset (`Every Sunday at 7:30 PM IST`):**
  - Automated countdown warnings ping `@Reset Reminders` (`🔔`) in the reminders channel at:
    - **7:00 PM IST** *(30 minutes remaining!)*
    - **7:20 PM IST** *(10 minutes remaining!)*
  - At **7:30 PM IST**, the weekly challenge ends and the **Hard Reset** is executed.
  - ⚠️ **CRITICAL RULE:** You **must** end any running `/timer` and run `/redeem-coins` to cash in your streak **BEFORE 7:30 PM IST on Sunday**, or they will be wiped in the reset!

### 🔹 2. Daily Session Cutoff (`Every Day at 4:30 AM IST`, Tuesday–Sunday)
- A single **"Marathon Day"** (for daily streaks and daily boosts) runs from **4:30 AM IST to 4:30 AM IST the next morning**.
- **4:00 AM IST Warning:** KAIRO sends a 30-minute warning ping to `@Reset Reminders` (`🔔`).
- **4:30 AM IST Auto-Termination:** Any `/timer` session that is still `Running` or `Paused` at 4:30 AM IST is **automatically terminated and deleted (`0 XP`)**. This prevents anyone from leaving a timer running overnight while sleeping.
- *Note: There is no 4:30 AM reset on Monday morning because the Weekly Hard Reset already happens on Sunday at 7:30 PM IST.*

### 🔹 3. Daily Morning Motivation (`Every Day at 8:00 AM IST`)
- Every morning at **8:00 AM IST**, KAIRO broadcasts the **Daily Motivation Protocol** quote in `#motivation` and pings members who have the **Daily Motivation (`💯`)** reaction role.

### 🔹 4. What Resets on Sunday 7:30 PM vs. What Stays Forever
- 🔄 **WIPED EVERY SUNDAY AT 7:30 PM IST:**
  - Weekly Individual XP (`weeklyXp`)
  - Weekly Squad XP (`weeklySquadXp`)
  - Current Daily Streak (`streak`) & Streak Protection (`streakProtection`)
  - Active/Paused Timers & Weekly Session Logs
  - Active Personal & Squad Multipliers (`2x Weekly Rush`, `Weekend Rush Amplifier`, `Squad Contribution Booster`, `XP Generator`)
  - Sabotage Statuses (`Purple Fever` infection counter & `Anti-Viral Shield` timer)
  - Active Tasks in the `/tasks` checklist
- 💎 **PERMANENT (NEVER WIPED):**
  - **All-Time Total XP (`xp`)**
  - **Personal Coins (`coins`)**
  - **Squad Treasury Coins**
  - **Squad All-Time Wins & Squad Win Streaks**
  - **All Purchased Shop Cosmetics, Themes & Inventory Items** *(including unused Boosts sitting in your inventory!)*
  - **Journal of Records Entries (`/journal`)**
  - **Grid Planner Calendar Events (`/planner`)**

---

# 🏆 PART 3: REWARDS, MONETARY PRIZES, BOUNTIES & HALL OF FAME

> ⚠️ **Disclaimer:** *All rewards and prize structures are **subject to change** at the administration's discretion.*

### 💸 1. Weekly Cash Rewards *(Unlocked when >10 participants compete)*
Whenever **more than 10 active participants** compete in the weekly challenge, real monetary prizes are awarded based on the **Weekly Individual XP Leaderboard**:
- 🥇 **1st Place (Individual Winner):** **`₹300`**
- 🥈 **2nd Place (Individual Runner-Up):** **`₹200`**
- 🥉 **3rd Place (Individual 3rd Place):** **`₹100`**
- ⚔️ **Boss Bounty — Beat `@randomxsoul`:** **`₹20`** is awarded to **every single participant** who finishes the week with more Weekly Individual XP than **@randomxsoul** on Discord!

### 👑 2. Special Roles & `#hall-of-fame` Immortalization
- **🎖️ Exclusive Winner Roles:**
  - The **#1 Individual Winner** receives a special Champion role on Discord for the week.
  - The **#1 Winning Squad** (highest combined active Weekly Squad XP) earns the Winning Squad role for its operatives.
- **🏛️ Permanent Mention in `#hall-of-fame`:**
  - Both the **Individual Winner** and the **Winning Squad** are permanently recorded and mentioned in the **`#hall-of-fame`** channel!

### 🕒 3. Reward Payout Timeline
- Winners usually receive their cash rewards and roles on **Sunday itself** (shortly after the 7:30 PM IST reset) or by **Monday EOD (End of Day)**.

### 🎉 4. Special High-Reward Server Events
- Beyond standard weekly cycles, **special events and tournaments** may be organized within the Marathon Server in the future featuring **even larger monetary rewards than usual**! Make sure to grab the **Events (`🎉`)** reaction role so you never miss an announcement.

---

# 🤖 PART 4: COMPLETE DISCORD BOT COMMAND REFERENCE (ALL 23 COMMANDS)

Every slash command is powered by **KAIRO (`𝙺ΛIЯØ`)**. Here is the complete breakdown of every command in the system:

---

## ⏱️ A. STUDY TIMER & PROOF OF WORK COMMANDS (`/timer`)

### 1. `/timer start`
- Starts a new focus session and records your start timestamp.
- You cannot start a new timer if you already have one running or paused.

### 2. `/timer pause`
- Pauses your currently running session, banks the exact milliseconds you have worked so far, and displays your **Elapsed Time (`Xh Ym`)**, **Potential Individual XP**, and **Potential Squad XP**.
- Use this whenever you take a break so you don't record AFK time!

### 3. `/timer resume`
- Resumes a paused timer, continues accumulating time from where you left off, and displays your current **Elapsed Time (`Xh Ym`)**, **Potential Individual XP**, and **Potential Squad XP**.

### 4. `/timer view`
- Shows an instant status card of your current session without stopping it:
  - **Status:** `Running` or `Paused`
  - **Elapsed Time:** `Xh Ym`
  - **Potential Individual XP:** How much Individual XP you will earn if you end right now.
  - **Potential Squad XP:** How much Squad XP you will earn right now (including all active personal/squad boosts!).

### 5. `/timer quit`
- Permanently cancels and deletes your current active or paused timer without awarding any XP (`0 XP`).

### 6. `/timer end [link] [proof1] [proof2] ... [proof24]`
- Ends your session, verifies your **Proof of Work**, posts your session log to `#proof-of-work` (`1488212420064317500`), updates your Daily Streak, and awards your **Individual XP** and **Squad XP**!
- **📸 Mandatory Proof of Work Rules:**
  - You **MUST** attach at least **1 file** (`proof1` through `proof24` — up to **24 files** in a single session!) **OR** provide a valid `http://` / `https://` URL in the `link` option.
  - **Allowed File Formats:** Images (`PNG`, `JPG`, `WEBP`, `GIF`), Videos (`MP4`, `WEBM`, `MOV`), PDFs (`.pdf`), or Text files (`.txt`, `.md`, etc.).
  - **File Size Limit:** Maximum **25 MB per file** and **25 MB total** across all attached files.
  - **Screen-Based Work Rule:** If your work is on a screen (coding, reading PDFs, lectures, design), you should record a timelapse using our official **Session Timelapse Recorder** (`https://project-marathon.vercel.app/timelapse` / `https://sessionrecorder.vercel.app/`) at **`>30x` speed** and **`360p–480p` quality**.
  - 🛡️ **Auto-Pause Safety Net:** If you forget to attach proof, provide an invalid link, attach a file over 25 MB, or if Discord fails to upload your file, **KAIRO will NOT delete your session!** Instead, KAIRO **automatically pauses your timer** and saves your accumulated time so you can compress your video or grab your link and run `/timer end` again safely!

---

## 📊 B. RANKINGS, SQUADS & INTELLIGENCE COMMANDS

### 7. `/rank`
- Displays your personal Rank Card containing:
  - Your **Weekly Individual XP**, **All-Time Total XP**, **Current Leaderboard Rank (`#X`)**, and **Current Streak (`🔥 X days`)**.
  - A live **Top 3 Leaderboard Podium** (`🥇 #1`, `🥈 #2`, `🥉 #3`) so you can see exactly how much XP you need to reach the prize zone.

### 8. `/leaderboard`
- Opens the interactive **Weekly Individual XP Leaderboard** (sorted highest to lowest by `weeklyXp`, then `xp`).
- Shows **10 operatives per page** with their Rank, Username, Weekly XP, Total XP, and Streak.
- Includes interactive **`⏮️ First`**, **`◀️ Prev`**, **`▶️ Next`**, and **`⏭️ Last`** pagination buttons (active for 5 minutes).

### 9. `/active`
- Opens a live, paginated **Active Sessions Board** showing every member on the server who is currently in a **`🟢 Running`** or **`🟡 Paused`** `/timer` session, along with their live elapsed time (`Xh Ym`).

### 10. `/squad-status`
- Displays your personal Squad Operative Card:
  - Your assigned **Squad Name** & Squad Color.
  - Your **Weekly Individual XP**, **Weekly Squad XP**, **Total XP**, and **Streak**.
  - Your **Squad Qualification Status**: Shows whether you have crossed the **`100 Weekly Squad XP`** threshold required for your Squad XP to count toward your Squad's leaderboard total!

### 11. `/squad-leaderboard`
- Displays the live **Squad Standings** for all 4 Squads (*Zenith Sentinels, Apex Titans, Meridian Arbiters, Horizon Vanguards*):
  - Ranked `#1` to `#4` (`🥇`, `🥈`, `🥉`, `4.`).
  - Shows **Total Active Squad XP** (sum of `weeklySquadXp` of all members in that squad who have $\ge 100$ Weekly Squad XP).
  - Shows **Active Members / Total Members** for each squad.

### 12. `/stalk [target:@user] [team:<squad_name>]`
- Our deep-scan intelligence command! You must choose **either** `target` (to inspect a user) **OR** `team` (to inspect a squad):
  - **👤 Mode 1: `/stalk target:@user` (Operative Dossier)**
    - Shows the user's **Squad**, **Global Rank (`#X`)**, **Squad Rank (`#X`)**, **Weekly Individual XP**, **Weekly Squad XP**, **XP (Last 24h)**, **All-Time Total XP**, **Current Streak**, **Personal Coins (`🪙`)**, **Completed Tasks (`✅`)**, **Total Recorded Sessions (`⏱️`)**, and their **Complete Categorized Inventory** (*Nameplates, PFP Decorations, Username Fonts, Global Themes, and Boosts with exact item counts like `x2`, `x3`*).
  - **🛡️ Mode 2: `/stalk team:<squad_name>` (Squad Dossier)**
    - Shows the Squad's **Team Treasury (`🪙 coins`)**, **All-Time Weekly Wins (`🏆`)**, **Current Win Streak (`⚡`)**, **Total Combined All-Time XP**, **Weekly Squad XP** (both *Active $\ge 100$ XP* and *Total Unfiltered*), **XP (Last 24h)**, **Operative Count** (*Active / Total*), and the **Current Squad MVP**!

---

## 💰 C. STREAK REDEMPTION & COIN TRANSFER COMMANDS

### 13. `/redeem-coins`
- Cashes in your current **Daily Streak (`n` days)** for **Coins**, and **resets your streak back to `0`** so you can immediately start building a new streak!
- **Exponential Coin Formula:**
  - `Total Coins Generated = 50 × 2^(n - 1)`
  - **`70%` goes to your Personal Wallet:** `35 × 2^(n - 1)`
  - **`30%` goes to your Squad's Treasury (Squad Tax):** `15 × 2^(n - 1)`
- **Exact Payout Breakdown by Streak Length:**
  - 🔥 **1-Day Streak:** `50 Total` ➔ **`35 Personal Coins`** + `15 Squad Coins`
  - 🔥 **2-Day Streak:** `100 Total` ➔ **`70 Personal Coins`** + `30 Squad Coins`
  - 🔥 **3-Day Streak:** `200 Total` ➔ **`140 Personal Coins`** + `60 Squad Coins`
  - 🔥 **4-Day Streak:** `400 Total` ➔ **`280 Personal Coins`** + `120 Squad Coins`
  - 🔥 **5-Day Streak:** `800 Total` ➔ **`560 Personal Coins`** + `240 Squad Coins`
  - 🔥 **6-Day Streak:** `1,600 Total` ➔ **`1,120 Personal Coins`** + `480 Squad Coins`
  - 🔥 **7-Day Streak:** `3,200 Total` ➔ **`2,240 Personal Coins`** + `960 Squad Coins`
- ⚠️ *Remember: Unredeemed streaks are wiped during the Sunday 7:30 PM IST Hard Reset, so always redeem before Sunday 7:30 PM!*

### 14. `/send-coins` (2 Subcommands)
- **`/send-coins user amount:<integer> target:@user`**
  - Transfers personal coins from your wallet to another registered member (minimum `1` coin; you cannot send coins to yourself or bots).
  - ☣️ **Purple Fever Contagion Mechanic:** If you are currently infected with **Purple Fever** (`purpleFeverCount > 0`), sending coins to another user will **infect them** and instantly deduct **`50 Weekly Squad XP`** from the recipient (unless they have an active **Anti-Viral Shield**, which blocks the XP loss while still consuming 1 charge of your infection!).
- **`/send-coins squad amount:<integer> squad_name:<squad>`**
  - Donates personal coins from your wallet directly into any Squad's **Team Treasury** (*Zenith Sentinels, Apex Titans, Meridian Arbiters, or Horizon Vanguards*).

---

## 🤝 D. SQUAD EXCHANGE (TEAM SWAP) COMMANDS

Want to switch squads with a friend on another team? You can do a **1-for-1 trade**:

### 15. `/exchange-teams member:@user`
- Sends a formal Squad Swap request to `@user` (expires in **15 minutes**).
- **Strict Eligibility Requirements (Checked Automatically):**
  1. Neither you nor the target user can hold the **Team Leader** role (`1500547163628114084`).
  2. Both users must be linked and assigned to **different** squads.
  3. Both users must have **`> 0` Weekly Individual XP** in the current weekly cycle.
  4. Neither user can be on a **7-day Exchange Cooldown** from a previous swap.
  5. Neither user can already have an active pending exchange request.

### 16. `/exchange-accept`
- Run by the invited user within **15 minutes** to accept the swap.
- Automatically swaps both users' `squad` in the database, swaps their **Discord Squad Roles**, and places both users on a **7-day Exchange Cooldown**.

### 17. `/exchange-deny`
- Run by the invited user to reject and cancel a pending swap request immediately.

---

## 🚀 E. BOOST & SABOTAGE ACTIVATION COMMAND (`/use-boost`)

### 18. `/use-boost <subcommand> [target:@user]`
After purchasing any **Performance Boost** or **Sabotage** from the Web Store (`https://project-marathon.vercel.app/shop`), activate it in Discord using `/use-boost`. Using a boost consumes `1` copy of that item from your inventory:

#### 🔹 Personal & Session Multipliers (Affects Your Weekly Squad XP)
- **`/use-boost 1-5x-hour`** *(Requires `1.5x XP Hour Boost` — `120 Coins`)*
  - Must be used while you have an active `/timer` running or paused.
  - Multiplies the Squad XP earned during the **first 60 minutes** of your current session by **`1.5x`** (any minutes beyond 60m earn standard rate).
- **`/use-boost 2x-session`** *(Requires `2x XP Session Boost` — `200 Coins`)*
  - Must be used while you have an active `/timer` running or paused.
  - Multiplies the Squad XP of your **entire current session** by **`2x`**!
- **`/use-boost 2x-day`** *(Requires `2x XP Daily Rush` — `500 Coins`)*
  - Gives you a **`2x` personal Squad XP multiplier** on all sessions you complete during the current Marathon day (until the next **4:30 AM IST** daily reset).
- **`/use-boost weekend-rush`** *(Requires `Weekend Rush Amplifier` — `400 Coins`)*
  - Can **only** be activated during **Weekend Rush** (Friday 7:30 PM IST – Sunday 7:30 PM IST).
  - Grants an additional **`1.5x` personal Squad XP multiplier** on top of the 2x Weekend Rush (for a combined `3x` before other boosts!) until Sunday 7:30 PM IST.
- **`/use-boost 2x-week`** *(Requires `2x XP Weekly Rush` — `3,000 Coins`)*
  - Grants a permanent **`2x` personal Squad XP multiplier** on every session you complete for the **entire week** until the Sunday 7:30 PM IST hard reset!

#### 🔹 Streak & Defense Buffs
- **`/use-boost streak-protection`** *(Requires `Streak Protection` — `250 Coins`)*
  - Activates a shield on your Daily Streak. If you miss a single day of studying, your streak will **freeze instead of resetting to 0**, consuming the shield automatically!
- **`/use-boost anti-viral`** *(Requires `Anti-Viral` — `600 Coins`)*
  - Activates a **24-hour immunity shield** (`antiViralUntil`). For the next 24 hours, you are **100% immune** to **Sabotage**, **Mini-Sabotage**, **Purple Fever**, and **Vampire** attacks!

#### 🔹 Squad-Wide & Server-Wide Multipliers
- **`/use-boost squad-boost`** *(Requires `Squad Contribution Booster` — `750 Coins`)*
  - Increases your **entire Squad's multiplier by `1.2x`** for all members of your squad until the next **4:30 AM IST** daily reset!
- **`/use-boost xp-generator`** *(Requires `XP Generator` — `10,000 Coins`)*
  - Activates your Squad's **XP Generator**, giving **every member of your Squad a `2x` Squad XP multiplier** for the **rest of the week** (until the Sunday 7:30 PM IST hard reset)! *(Stacks with `squad-boost` for `2.4x`!)*
- **`/use-boost 10x-global`** *(Requires `The Global Catalyst` — `7,500 Coins`)*
  - **ANONYMOUSLY** triggers a **server-wide `10x` Global XP Surge for 1 full hour**!
  - KAIRO replies to you privately (ephemerally) so nobody knows who triggered it unless you tell them.
  - Anyone on the server who ends a session during that 60-minute window gets **`10x` Individual Weekly XP AND `10x` Weekly Squad XP**!

#### 🔹 Offensive Sabotages (Damages Target's Weekly Squad XP Only!)
> *Note: You cannot sabotage yourself, and you cannot sabotage anyone who has an active **Anti-Viral Shield**. Sabotages **only** reduce the target's `weeklySquadXp` — they never reduce `weeklyXp` (Individual Leaderboard XP).*
- **`/use-boost mini-sabotage target:@user`** *(Requires `Mini-Sabotage` — `75 Coins`)*
  - Instantly deducts **`50 Weekly Squad XP`** from `@user` (minimum 0).
- **`/use-boost purple-fever target:@user`** *(Requires `Purple Fever` — `450 Coins`)*
  - Instantly deducts **`200 Weekly Squad XP`** from `@user` **AND** infects them with **3 charges of Purple Fever** (`purpleFeverCount = 3`).
  - The next **3 people** `@user` sends coins to via `/send-coins user` will also lose **`50 Weekly Squad XP`** each!
- **`/use-boost vampire target:@user`** *(Requires `Vampire` — `4,000 Coins`)*
  - A kamikaze blood-sacrifice attack: **cuts `@user`'s Weekly Squad XP in HALF (`50%`)**, at the cost of **resetting YOUR OWN Weekly Squad XP to `0`**!
- **`/use-boost sabotage target:@user`** *(Requires `Sabotage` — `5,000 Coins`)*
  - The ultimate weapon: **instantly cuts `@user`'s Weekly Squad XP in HALF (`50%`)** with **zero penalty** to yourself!

---

## 🛡️ F. MODERATOR & HEAD ADMIN COMMANDS (STAFF REFERENCE)

For transparency, these 9 administrative commands are restricted to **Moderators** and the **Head Admin**:
- **19. `/set-multiplier value:<number>`** *(Mod / Head Admin)* — Sets the global server XP multiplier (e.g., `1.5`, `2`, `3`) and broadcasts an **XP SURGE ACTIVATED** announcement embed.
- **20. `/set-xp target:@user amount:<integer>`** *(Mod / Head Admin)* — Sets a user's `xp`, `weeklyXp`, and `weeklySquadXp` to a specific value and posts a public synchronization log.
- **21. `/set-squad user:@user squad:<squad_name>`** *(Mod / Head Admin)* — Manually moves a user to *Zenith Sentinels, Apex Titans, Meridian Arbiters, Horizon Vanguards,* or *Unassigned* and updates their Discord Squad role.
- **22. `/hard-reset`** *(Mod / Head Admin)* — Executes the Sunday 7:30 PM IST Weekly System Wipe (resets all weekly XP, squad XP, streaks, active timers, weekly sessions, tasks, and temporary boosts).
- **23. `/add-coins amount:<integer> [member:@user] [team:<squad>]`** *(Head Admin Only)* — Adds or removes coins (using negative numbers) from a user's personal balance or a Squad's Team Treasury.
- **24. `/award-item target:@user item_id:<id>`** *(Head Admin Only)* — Grants any shop item or boost directly into a user's inventory by its ID (e.g., `bst-2x-sess`, `np-dragon`, `thm-malevolent-shrine`).
- **25. `/randomize-squads`** *(Head Admin Only)* — Shuffles all registered users (Fisher-Yates algorithm) and evenly redistributes them across the 4 Squads while updating all Discord Squad roles.
- **26. `/wipe-user target:@user`** *(Head Admin Only)* — Resets a user's inventory, equipped items, coins, streak, and active personal multipliers back to factory defaults.
- **27. `/test-motivation`** *(Head Admin Only)* — Fires a test broadcast of the Daily Motivation quote embed to `#motivation`.

---

# ⚡ PART 5: HOW XP & THE DUAL-XP ENGINE WORK

Understanding the difference between **Individual XP** and **Squad XP** is essential to winning both cash prizes and squad wars.

### 🔹 1. The 25-Minute Rule & Base Rate
- **Under 25 Minutes:** `0 XP` (Sessions under 25 minutes do not award XP and do not advance your daily streak).
- **25 Minutes or Longer:** Base XP is **`0.8 XP per minute`** (`Minutes × 4 / 5`):
  - `25 minutes` ➔ **20 Base XP**
  - `45 minutes` ➔ **36 Base XP**
  - `60 minutes (1 hour)` ➔ **48 Base XP**
  - `90 minutes (1.5 hours)` ➔ **72 Base XP**
  - `120 minutes (2 hours)` ➔ **96 Base XP**
  - `125 minutes (2h 5m)` ➔ **100 Base XP** *(Unlocks Active Squad Status!)*

### 🔹 2. Track 1: Individual Weekly XP (`weeklyXp`) — *100% Fair Grind*
```txt
Individual XP = round( Minutes × 0.8 × GlobalMultiplier × WeekendRush )
```
- **What it counts toward:** Your rank on `/leaderboard`, the **Weekly Cash Prizes (₹300 / ₹200 / ₹100)**, the **₹20 `@randomxsoul` Bounty**, and your **All-Time Total XP (`xp`)**.
- **Why it is 100% fair:** Personal shop boosts (`2x Session`, `2x Daily`, `2x Weekly`, `1.5x Hour`, `Weekend Rush Amplifier`, `Squad Boost`, `XP Generator`) and enemy sabotages (`Sabotage`, `Mini-Sabotage`, `Purple Fever`, `Vampire`) **NEVER affect your Individual Weekly XP!** Only server-wide events that apply equally to everyone (**Weekend Rush `2x`**, **`/set-multiplier`**, or **The Global Catalyst `10x`**) multiply this track.

### 🔹 3. Track 2: Weekly Squad XP (`weeklySquadXp`) — *Full Tactical Chaos*
```txt
Squad XP = round( Minutes × 0.8 × GlobalMultiplier × SessionBoost × PersonalBoosts × SquadBoosts × HourBoost × WeekendRush )
```
- **What it counts toward:** Your Squad's total score on `/squad-leaderboard` and the website's `/squads` page!
- **All Multipliers Stack Multiplicatively:**
  - `GlobalMultiplier`: `1x` (or `10x` if *The Global Catalyst* is active, or custom admin surge)
  - `SessionBoost`: `2x` if `/use-boost 2x-session` is active on your timer
  - `PersonalBoosts`: Stacks `2x Daily Rush` (`×2`), `2x Weekly Rush` (`×2`), and `Weekend Rush Amplifier` (`×1.5` during weekends)
  - `SquadBoosts`: Stacks `Squad Contribution Booster` (`×1.2`) and `XP Generator` (`×2` = `2.4x` combined!)
  - `HourBoost`: `1.5x` on the first 60 minutes of your session if `/use-boost 1-5x-hour` is active
  - `WeekendRush`: Automatic `2x` every Friday 7:30 PM – Sunday 7:30 PM IST
- **🎯 The `100 Squad XP` Active Contributor Rule:**
  - On `/squad-leaderboard` and the website's `/squads` page, a squad's total score is the sum of `weeklySquadXp` from **Active Members only**.
  - To become an **Active Member** for the week, you must reach **`100 Weekly Squad XP`**. The moment you hit `100 Squad XP`, all of your Squad XP is unlocked and added to your team's total!

---

# 🌐 PART 6: THE MARATHON WEBSITE — COMPLETE FEATURE-BY-FEATURE GUIDE

The official web platform at **[https://project-marathon.vercel.app](https://project-marathon.vercel.app)** is a full productivity suite and cosmetic ecosystem synchronized in real time with Discord.

---

## 🧭 1. Top Navigation Bar, Profile Dropdown & Theme Audio Player
- **Primary Navigation Links:** Quick-switch between **Dashboard (`/dashboard`)**, **Shop (`/shop`)**, **Leaderboard (`/leaderboard`)**, **Squads (`/squads`)**, and **Timelapse (`/timelapse`)**.
- **🔊 Dynamic Theme Audio Button (`Volume2` / `VolumeX` icon):**
  - Whenever you equip any **Biome Theme** or **Anime Series Theme**, an interactive **Speaker Button** appears in the top-right navbar!
  - Click it anytime to play or pause the theme's custom looping ambient soundtrack.
- **👤 Profile Badge Dropdown Menu (Top Right):**
  - Displays your Discord Avatar and Username. Clicking it opens the tactical menu:
    - **⚡ My Profile (`/profile/me`)**
    - **📋 Planner (`/planner`)**
    - **🗓️ Printable Planners (`/planners`)**
    - **📖 Journal (`/journal`)**
    - **✅ Tasks (`/tasks`)**
    - **❤️ Donate to Server (`/donate`)**
    - **🚪 Disconnect** *(Logs out of your current browser session)*

---

## 📡 2. Tactical HUD Dashboard (`/dashboard`)
Your personal mission control center once logged in:
- **Live Operational Header:** Greets you by username, displays your **Squad Badge & Current Squad Rank (`🛡️ Squad Name • Rank #X`)**, a live **24-hour Digital Clock (`HH:MM:SS`)**, and your **All-Time Total XP Badge**.
- **3 Primary Analytics Cards:**
  1. **`INDIVIDUAL_WEEKLY_XP`** — Your pure weekly grind score for the cash leaderboard.
  2. **`WEEKLY_SQUAD_XP`** — Your boosted weekly score for your Squad (glows in your Squad's signature neon color).
  3. **`TOTAL_RECORDS`** — Total number of study sessions you have completed this cycle.
- **`WEEKLY_OBJECTIVE_STATUS` Progress Bar:**
  - Tracks your progress from `0%` to `100%` toward the **`1,000 Weekly XP`** benchmark milestone.
- **`RECENT_TRANSMISSIONS` Feed:**
  - Lists your latest completed `/timer` sessions showing exact **Duration (`Xm Recorded`)** and **XP Gained (`+X XP GAIN`)**.
- **`QUICK_COMMAND_LINE` Sidebar:**
  - One-click terminal shortcuts to **OPEN_TARGETS (`/tasks`)**, **OPEN_CHRONICLES (`/journal`)**, and **OPEN_GRID_PLANNER (`/planner`)**.

---

## 🏆 3. Web Individual Leaderboard (`/leaderboard`)
- **Live Weekly Rankings:** Displays all active grinders sorted by **Weekly Individual XP**.
- **`YOUR_RANK` Badge:** Automatically highlights your personal rank (`#X`) at the top right if you are logged in.
- **Top 3 Podium Icons:**
  - `#1` — 👑 **Gold Crown** (`#ffd700`)
  - `#2` — 🏆 **Silver Trophy** (`#c0c0c0`)
  - `#3` — 🏆 **Bronze Trophy** (`#cd7f32`)
- **Live Cosmetic Rendering:** Every row on the web leaderboard dynamically renders the user's equipped **Nameplate border (`DecoratedRow`)**, **Animated Avatar Ring (`DecoratedAvatar`)**, and **Custom Username Typography (`DecoratedName`)**, alongside their **Streak (`🔥 Xd`)**, **Weekly XP**, and **Total XP**.
- **Clickable Profiles:** Click on **any user's name** on the leaderboard to open their full **Operative Profile Dossier (`/profile/[discordId]`)**!

---

## 🛡️ 4. Squads Overview (`/squads`) & Squad HQ Pages (`/squads/[squadName]`)

### 🔹 Squads Leaderboard (`/squads`)
- Auto-refreshes every **30 seconds** with live standings of all 4 factions.
- Displays each Squad's **Rank (`#1`–`#4`)**, **Active / Total Members**, **Combined Active Weekly Squad XP**, and their current **League Tier Badge**:
  - 💎 ** Rank #1:** **`DIAMOND`** League
  - 🥇 **Rank #2:** **`GOLD`** League
  - 🥈 **Rank #3:** **`SILVER`** League
  - 🥉 **Rank #4:** **`BRONZE`** League

### 🔹 Individual Squad Headquarters (`/squads/Zenith%20Sentinels`, etc.)
Click on any Squad card on `/squads` to enter that faction's dedicated HQ page:
- **Faction Banner & Lore:** Displays the Squad's emblem, official Motto, lore description, and 3 live team stat cards:
  - **Total Weekly XP**
  - **Active Members (`Active / Total`)**
  - **Average XP per Active Member (`Avg XP/Member`)**
- **🔥 Live Rivalry Gap Banner:**
  - If your squad is **#1**, it shows: *"🔥 You are **ahead** of [Rank #2 Squad] by **X XP**"*
  - If your squad is **#2, #3, or #4**, it shows: *"⚠️ You are **behind** [Squad Above You] by **X XP**"* so your team knows the exact XP needed to overtake them!
- **🏅 Top 3 Contributors & MVP Showcase:**
  - Highlights the Squad's **Top 3 Grinders** at the top of the page, crowning the `#1` contributor with a glowing **`MVP` Badge**!
- **📋 Full Squad Roster (Active vs. Inactive Split):**
  - Lists every member of the squad with their equipped Nameplates, PFP Rings, Fonts, Streak, and Squad XP, clearly separated into **Active Contributors ($\ge 100$ XP)** and **Inactive Operatives ($< 100$ XP)**.

---

## 🕵️ 5. Operative Profile Dossier (`/profile/me` & `/profile/[discordId]`)
Accessible via **Navbar ➔ My Profile** or by clicking any user on the Leaderboard / Squad Roster:
- **Identity Header:** Large `100px` **Decorated Avatar**, **Decorated Username**, **Discord ID**, **Member Since [Month Year]**, and **Squad + Squad Rank Badge**.
- **6 Live Stat Boxes:**
  1. 🏆 **Current Rank (`#X`)**
  2. ⚡ **Weekly XP**
  3. 🚀 **Weekly Squad XP**
  4. ⭐ **Day Streak**
  5. 🎯 **Tasks Done** *(Total tasks checked off in `/tasks`)*
  6. 🛍️ **Coins** *(Current personal coin balance)*
- **🎒 `AGENT_INVENTORY` Grid:**
  - Displays every item owned by the operative, grouped with quantity badges (`x2`, `x3`, etc.) and labeled as **`DECORATION`** or **`BOOST`**.

---

## 🛒 6. The Marathon Store (`/shop`) — Complete 64-Item Catalog

At **[https://project-marathon.vercel.app/shop](https://project-marathon.vercel.app/shop)**, you can spend your Personal Coins across **5 Store Sections**.
- **How Equipping Works:** For **Nameplates**, **PFP Decorations**, **Username Fonts**, and **Global Themes**, click any item you own and click **Equip**. Only 1 item per category is equipped at a time (clicking an already-equipped item unequips it back to Default).
- **How Boosts Work:** Purchasing a **Performance Boost** adds it to your inventory (you can buy multiple copies!). You then activate it inside Discord using `/use-boost`.

### 🖼️ Section 1: Nameplates (13 Items)
Customizes your row card background and border on the Leaderboard, Squad Roster, and Profile:
- **`Standard Issue`** (`np-default`) — `0 Coins` • *Common* (Default)
- **`Neon Frame`** (`np-neon`) — `50 Coins` • *Uncommon* — Vibrant pulsing neon border.
- **`Diamond Pulse`** (`np-diamond`) — `120 Coins` • *Rare* — Crystalline brilliance that radiates status.
- **`Infernal Glow`** (`np-infernal`) — `250 Coins` • *Epic* — Forged in the depths of the competitive grind.
- **`Quantum Border`** (`np-quantum`) — `300 Coins` • *Epic* — Shifting boundary of subatomic particles.
- **`Phantom Shift`** (`np-phantom`) — `350 Coins` • *Epic* — Ghostly border that fades in and out of reality.
- **`Celestial Aura`** (`np-celestial`) — `350 Coins` • *Epic* — Blessed by the gods of productivity.
- **`Glitched Matrix`** (`np-glitch`) — `400 Coins` • *Legendary* — Corrupted stream of raw data packets.
- **`Zenith Crown`** (`np-zenith`) — `500 Coins` • *Legendary* — Ultimate symbol of peak performance.
- **`Titan Core`** (`np-titan`) — `650 Coins` • *Legendary* — Raw power of a planetary engine.
- **`Arcane Sigil`** (`np-arcane`) — `800 Coins` • *Legendary* — Mystical runes that protect your focus.
- **`Cosmic Void`** (`np-space-legendary`) — `1,000 Coins` • *Legendary* — Deep space boundary adorned with stars and a crescent moon.
- **`Dragon Soul`** (`np-dragon`) — `1,200 Coins` • *Mythic* — The fiery breath of a focus legend.

### 💫 Section 2: Identity Deco / PFP Decorations (12 Items)
Animated rings and halos rendered around your Discord avatar on the website:
- **`Basic Circle`** (`pfp-default`) — `0 Coins` • *Common* (Default)
- **`Electric Ring`** (`pfp-electric`) — `100 Coins` • *Uncommon* — High-voltage energy circling your avatar.
- **`Crown Orbit`** (`pfp-crown`) — `150 Coins` • *Rare* — Spinning crown of orbital satellites.
- **`Holographic Halo`** (`pfp-holographic`) — `300 Coins` • *Epic* — Futuristic projection of digital light.
- **`Frost Nova`** (`pfp-frost`) — `400 Coins` • *Epic* — Sub-zero temperatures to keep you cool.
- **`Firestorm Border`** (`pfp-firestorm`) — `450 Coins` • *Epic* — Licking flames of pure passion.
- **`Corrupted Signal`** (`pfp-corrupted`) — `500 Coins` • *Legendary* — Static and noise from the outer rim.
- **`Golden Pulse`** (`pfp-golden`) — `600 Coins` • *Legendary* — The heartbeat of a champion.
- **`Digital Wings`** (`pfp-wings`) — `650 Coins` • *Legendary* — Flight data processed in real-time.
- **`Obsidian Shards`** (`pfp-obsidian`) — `700 Coins` • *Legendary* — Dark volcanic glass revolving in harmony.
- **`Cosmic Reactor`** (`pfp-cosmic`) — `1,000 Coins` • *Mythic* — The power of a dying star, contained.
- **`Void Singularity`** (`pfp-void`) — `1,500 Coins` • *Mythic* — The absolute zero of distractions.

### 🔤 Section 3: Typography / Username Fonts (18 Items)
Changes the font family of your username across all leaderboards, rosters, and profile cards:
- **`Monospace Standard`** (`fnt-default` — *JetBrains Mono*) — `0 Coins` • *Common*
- **`Open Sans Clean`** (`fnt-open`) — `75 Coins` • *Uncommon*
- **`Inter Modern`** (`fnt-inter`) — `80 Coins` • *Uncommon*
- **`Roboto Steel`** (`fnt-roboto`) — `85 Coins` • *Uncommon*
- **`Montserrat Bold`** (`fnt-montserrat`) — `90 Coins` • *Uncommon*
- **`Lato Smooth`** (`fnt-lato`) — `95 Coins` • *Uncommon*
- **`Oswald Compressed`** (`fnt-oswald`) — `100 Coins` • *Uncommon*
- **`Source Code`** (`fnt-source` — *Source Code Pro*) — `110 Coins` • *Uncommon*
- **`Bebas Vanguard`** (`fnt-bebas` — *Bebas Neue*) — `250 Coins` • *Rare*
- **`Playfair Royal`** (`fnt-playfair` — *Playfair Display*) — `280 Coins` • *Rare*
- **`Space Grotesk`** (`fnt-space`) — `300 Coins` • *Rare*
- **`Syne Artistic`** (`fnt-syne`) — `320 Coins` • *Rare*
- **`Orbitron Command`** (`fnt-orbitron`) — `550 Coins` • *Epic*
- **`Righteous Wave`** (`fnt-righteous`) — `600 Coins` • *Epic*
- **`Cinzel Decorative`** (`fnt-cinzel`) — `650 Coins` • *Epic*
- **`Uncial Antiqua`** (`fnt-uncial`) — `900 Coins` • *Legendary*
- **`Press Start Retro`** (`fnt-press` — *8-bit Pixel Font*) — `950 Coins` • *Legendary*
- **`Metal Mania`** (`fnt-metal` — *Dark Prestige Font*) — `1,500 Coins` • *Mythic*

### 🚀 Section 4: Performance Boosts & Sabotages (14 Items)
Purchased here in `/shop` and triggered in Discord via `/use-boost`:
- **`Mini-Sabotage`** (`bst-mini-sabotage`) — `75 Coins` • *Uncommon*
- **`1.5x XP Hour Boost`** (`bst-1.5x-hour`) — `120 Coins` • *Rare*
- **`2x XP Session Boost`** (`bst-2x-sess`) — `200 Coins` • *Rare*
- **`Streak Protection`** (`bst-streak-prot`) — `250 Coins` • *Epic*
- **`Weekend Rush Amplifier`** (`bst-wr-amp`) — `400 Coins` • *Legendary*
- **`Purple Fever`** (`bst-purple-fever`) — `450 Coins` • *Epic*
- **`2x XP Daily Rush`** (`bst-2x-day`) — `500 Coins` • *Legendary*
- **`Anti-Viral`** (`bst-anti-viral`) — `600 Coins` • *Legendary*
- **`Squad Contribution Booster`** (`bst-sq-boost`) — `750 Coins` • *Mythic*
- **`2x XP Weekly Rush`** (`bst-2x-week`) — `3,000 Coins` • *Mythic*
- **`Vampire`** (`bst-vampire`) — `4,000 Coins` • *Mythic*
- **`Sabotage`** (`bst-sabotage`) — `5,000 Coins` • *Mythic*
- **`The Global Catalyst`** (`bst-10x-global`) — `7,500 Coins` • *Ascendant*
- **`XP Generator`** (`bst-xp-generator`) — `10,000 Coins` • *Ascendant*

### 🌌 Section 5: Global Themes (17 Items Across 4 Tiers)
Transforms the entire website's color palette, logos, backgrounds, cursors, and ambient audio:
1. **Classics:**
   - **`Neon Matrix`** (`thm-default`) — `0 Coins` • *Common* (Standard dark neon green interface)
   - **`White Mode`** (`thm-white-mode`) — `250 Coins` • *Uncommon* (Clean daylight interface + white logo)
2. **Shades (`500 Coins` each • *Rare*):**
   - **`Neon Blue Shade`** (`thm-neon-blue`)
   - **`Neon Cyan Shade`** (`thm-neon-cyan`)
   - **`Neon Yellow Shade`** (`thm-neon-yellow`)
   - **`Neon Pink Shade`** (`thm-neon-pink`)
   - **`Neon Violet Shade`** (`thm-neon-violet`)
   - **`Neon Orange Shade`** (`thm-neon-orange`)
   - **`Neon Red Shade`** (`thm-neon-red`)
3. **Biomes (`750 Coins` each • *Epic* — Includes Custom Ambient Audio Loop 🔊):**
   - **`Abyssal Waters`** (`thm-abyssal-waters`) — Deep oceanic bioluminescent cyan UI + underwater ambient audio.
   - **`Scorched Sands`** (`thm-scorched-sands`) — Golden-hour desert heat UI + desert wind ambient audio.
   - **`Cosmic Void`** (`thm-cosmic-void`) — Deep nebular violet starry expanse UI + space ambient audio.
   - **`Arctic Tundra`** (`thm-arctic-tundra`) — Frostbitten icy blue/slate UI + arctic wind ambient audio.
   - **`Emerald Canopy`** (`thm-emerald-canopy`) — Lush rainforest green UI + forest nature ambient audio.
   - **`Timberline Range`** (`thm-timberline-range`) — Earthy mountain brown & mossy green UI + mountain ambient audio.
4. **Anime Series (*Legendary* — Full Visual Overhaul + Soundtrack + Interactive Companion):**
   - 🌸 **`Wisteria - Kimetsu No Yaiba (Demon Slayer)`** (`thm-demon-slayer`) — **`2,500 Coins`**
     - Wisteria purple & moonlit shadow interface with custom Demon Slayer Marathon logo.
     - Custom **Demon Slayer soundtrack** (`ds_music.mp3`) controllable from the Navbar.
     - Custom **Nichirin / Demon Slayer mouse cursor** (`ds_mouse.png`).
     - Animated **falling wisteria petals**, glowing **Water Breathing ripples**, and an **interactive Tanjiro companion** in the bottom-left corner who speaks manga dialogue bubbles (*"I'll save you!"*, *"You're not alone!"*, *"We can do it!"*) when hovered!
   - ⛩️ **`Malevolent Shrine - Jujutsu Kaisen`** (`thm-malevolent-shrine`) — **`3,000 Coins`**
     - Full **Domain Expansion: Malevolent Shrine** crimson-and-black interface with `両面宿儺` (Ryomen Sukuna) vertical Kanji banner and custom `Katsuha` typography on the homepage.
     - Custom **Malevolent Shrine soundtrack** (`jjkms_music.mp3`) controllable from the Navbar.
     - Animated **rising fire embers** across the screen and an **interactive Ryomen Sukuna companion** in the bottom-right corner who taunts you (*"Go Grind! you weak human!"*) when hovered!

---

## 🔄 7. Store Returns & 100% Refund Center (`/shop/returns`)
Accessible via **[https://project-marathon.vercel.app/shop/returns](https://project-marathon.vercel.app/shop/returns)**:
- **How Refunds Work:** If you buy a Cosmetic or Global Theme and decide you don't want it, you can return it for a **100% full refund of your coins**!
- **Strict Refund Eligibility Rules:**
  - ✅ **Returnable:** Any paid Nameplate, PFP Decoration, Username Font, or Theme that you have **NEVER equipped** (`equippedHistory` does not contain the item ID).
  - ❌ **Non-Refundable (Shown under "Ineligible Items"):**
    1. **Performance Boosts & Sabotages** (*Boosts are non-refundable immediately upon purchase*).
    2. **Previously Equipped Cosmetics/Themes** (*The moment you click "Equip" on a cosmetic or theme even once, it is permanently bound to your `equippedHistory` and cannot be refunded*).
    3. **Free/Default Items (`0 Coins`)**.

---

## 📅 8. Interactive Grid Planner (`/planner`)
Accessible at **[https://project-marathon.vercel.app/planner](https://project-marathon.vercel.app/planner)**:
- **3 Calendar Views:** Switch seamlessly between **Month View**, **Week View (24-hour time grid)**, and **Day View (hourly schedule)**, with **`<` / `>`** date navigation and a **`Today`** quick-jump button.
- **Creating & Editing Time Blocks:**
  - Click **`+ New Event`** or click directly on any day/hour cell in the grid.
  - Set your **Event Title**, **Date (`YYYY-MM-DD`)**, **Start Time (`HH:MM`)**, **End Time (`HH:MM`)**, **Description/Notes**, and choose from **5 Tactical Color Accents** (Neon Green `#00ff9f`, Blue `#3b82f6`, Red `#ef4444`, Gold `#eab308`, or Purple `#a855f7`).
  - Click any existing event block to edit its details or delete it with the **Trash** button.
  - All events are saved to your MongoDB account and persist across weekly resets!

---

## 🖨️ 9. Printable A4 Planners Studio (`/planners`)
Accessible at **[https://project-marathon.vercel.app/planners](https://project-marathon.vercel.app/planners)**:
 prefer planning on paper or exporting clean PDF sheets? Choose from **3 two-page A4 templates**:
1. **🕒 Daily Focus (2-Page Spread):**
   - **Page 1 (Start Strong):** Hour-by-hour schedule from **5 AM to 4 PM**, plus boxes for **Top Priorities**, **Quick Wins**, and **Morning Intention**.
   - **Page 2 (Reflect & Recover):** Hour-by-hour schedule from **5 PM to 4 AM**, plus a **6-item Daily Habit Tracker**, **Brain Dump / Ideas**, and **Evening Reflection**.
2. **📋 Weekly Tracker (2-Page Spread):**
   - **Page 1 (Weekly Planner):** 7-day layout (Monday–Sunday auto-dated from your chosen start date) + **To-Do List**, **Goals for the Week**, and **Priorities**.
   - **Page 2 (Weekly Tracker):** A **10-row M–T–W–T–F–S–S Weekly Habit Tracker Grid**, **Major Projects / Milestones**, **Notes**, and **Weekly Reflections & Gratitude**.
3. **🗓️ Monthly Planner & Review (2-Page Spread):**
   - **Page 1 (Monthly Calendar):** Auto-generated Monday-start monthly calendar grid + **Key Deadlines** and **Monthly Focus**.
   - **Page 2 (Monthly Review):** **Primary Goals**, **Major Projects**, **Notes & Observations**, **Growth Areas**, and a **5-Pillar Monthly Rating Bar** (*Discipline, Focus, Wellbeing, Social, Learning*).
- **How to Edit & Export:**
  - Pick your **Start Date / Week Beginning** at the top.
  - **Type directly onto the A4 pages on your screen** (every text box, header, and habit row is interactive `contentEditable`!), **OR** leave it blank to write by hand after printing.
  - Click **`Download as PDF`** to open your system print dialog and save a crisp, distraction-free A4 PDF!

---

## 📓 10. Journal of Records (`/journal`)
Accessible at **[https://project-marathon.vercel.app/journal](https://project-marathon.vercel.app/journal)**:
- **Distraction-Free Writing Studio:** Click **`+ COMPOSE_NEW`** to open the full-screen journal editor.
- **8 Mood Tags:** Tag every entry with your current mental state, each with its own icon and color badge:
  - 😄 **Great** (`#00ff9f`)
  - 🔥 **Focused** (`#f87171`)
  - ⚡ **Productive** (`#60a5fa`)
  - 🌙 **Reflective** (`#c084fc`)
  - ☕ **Exhausted** (`#fcd34d`)
  - ☀️ **Inspired** (`#fb923c`)
  - 👻 **Struggling** (`#94a3b8`)
  - 🚨 **Angry** (`#ef4444`)
- **Live Metrics & Storage:** Supports up to **12,000 characters** (~1,500–1,800 words) per entry with a live **Word Count** and **Character Counter (`X / 12000 CH`)**.
- **Search & Reader View:** Use the **`Query archives...`** search bar to filter past entries by title or content. Click any card to read it in full screen, **Copy** the text to your clipboard in one click, or **Delete** the entry.

---

## ✅ 11. Tasks Protocol (`/tasks`)
Accessible at **[https://project-marathon.vercel.app/tasks](https://project-marathon.vercel.app/tasks)**:
- Type any actionable goal into **`ENTER_NEW_TASK...`** and click **`+ Add Target`**.
- Click a task to check/uncheck it, or click **`×`** to delete it.
- **Stat Integration:** Every completed task counts toward the **`Tasks Done`** stat displayed on your **Web Profile (`/profile/me`)** and your Discord **`/stalk`** card!

---

## 🎥 12. Session Timelapse Studio (`/timelapse`)
Accessible at **[https://project-marathon.vercel.app/timelapse](https://project-marathon.vercel.app/timelapse)**:
- Click **`Launch Recorder`** to open the dedicated web recorder (**[https://sessionrecorder.vercel.app/](https://sessionrecorder.vercel.app/)**).
- Built specifically for Marathon's Proof of Work verification:
  - Record your screen or webcam at **`> 30x` speed**.
  - Use **`360p – 480p` resolution** so even a 3-hour study session exports as a tiny video file well under Discord's **25 MB** upload limit for `/timer end`!

---

## ❤️ 13. Support, Donations & Official Links (`/donate`, `/about`, `/contact`)
- **Donate to the Server (`/donate`):**
  - 100% of community donations go directly toward **Server Boosts**, **Custom Server Tags**, **Infrastructure**, and **increasing the Weekly Cash Prize Pools & Special Event Rewards**!
  - You can contribute anytime by scanning the QR code on `/donate` or sending via UPI to: **`harleen.mit@oksbi`**.
- **About (`/about`), Privacy (`/privacy`) & Terms (`/terms`):** Learn about the Marathon philosophy, data privacy, and platform rules.
- **Contact & Socials (`/contact`):**
  - 📧 **Email:** `marathonxserver@gmail.com`
  - 💬 **Discord Invite:** `https://discord.gg/FEKt8rADQu`
  - 🔗 **LinkedIn:** `https://www.linkedin.com/company/marathon-server/`
  - ▶️ **YouTube:** `https://www.youtube.com/@marathon-server`

---

# 🔔 PART 7: REACTION ROLES & KAIRA AI COMPANION

### 🎭 1. Self-Assignable Reaction Roles
Find the **Reaction Roles** embed in the server and react with the emojis below to toggle channels and notifications:
- 🎮 **`Off-Topic`** — Unlocks casual hangouts, gaming, music, and meme channels.
- 🧑‍🎓 **`College Hub`** — Unlocks college admissions, academics, and student advice channels.
- 🎉 **`Events`** — Pings you for special server competitions, high-prize tournaments, and giveaways.
- 🌟 **`Opportunities`** — Pings you when internships, hackathons, or study resources are posted in `#opportunities`.
- 🔔 **`Reset Reminders`** — **HIGHLY RECOMMENDED!** Pings you **30 minutes before the 4:30 AM IST daily cutoff** and **30m & 10m before the Sunday 7:30 PM IST Weekly Hard Reset** so you never lose an active timer or forget to `/redeem-coins`!
- 💯 **`Daily Motivation`** — Pings you every morning at **8:00 AM IST** with the daily motivational quote.

### 🧠 2. KAIRA — The Server AI Companion (`@KAIRA`)
- Want someone to talk to during a late-night study break, need advice, or want to get roasted out of procrastination?
- Simply **mention `@KAIRA` or reply to her messages** in any chat channel! She remembers recent conversation context in the channel and will keep you sharp and accountable.

---

# ⚖️ PART 8: ACTIVE SESSION RULES, COMMUNITY VERIFICATION & ANTI-CHEAT PROTOCOL

To keep the weekly cash prizes, squad wars, and `#hall-of-fame` 100% fair and authentic, every operative must follow the **Active Session & Proof of Work Rules** below.

### 🖥️ 1. Web / Screen-Based Work Rules (Mandatory Screen Recording)
- For **any web-based or computer-based work** (coding, online lectures, digital reading, design, research, assignments, etc.), you **MUST screen-record the entirety of your work session** as a timelapse using **[project-marathon.vercel.app/timelapse](https://project-marathon.vercel.app/timelapse)** (`https://sessionrecorder.vercel.app/`) and upload the video when running `/timer end`.
- 🔒 **Privacy Option:** If you are working on sensitive or private material, **you may choose to blur your screen** — as long as the timelapse clearly demonstrates continuous active work across the entire duration of your session.

### 📝 2. Offline / Desk-Based Work Rules
- For **any offline work** (handwritten notes, physical textbooks, problem-solving on paper, exam prep, etc.):
  - **Recommended:** Send a **camera timelapse** of yourself working at your desk.
  - **Camera-Shy / Privacy Alternative:** If you are uncomfortable recording yourself on camera, you must **upload as much comprehensive proof as possible** to prove that you genuinely worked for the full duration of the session. This should include **multiple clear photos of your handwritten notes, solved pages, PDFs, study plans, rough work, and progress snapshots** (remember: `/timer end` lets you attach up to **24 files** in a single submission!).

### 🕵️‍♂️ 3. Community Verification & The Anti-Cheat Bounty (`+25 XP` & More!)
- **Community-Driven Accountability:** Every `/timer end` submission is posted publicly in `#proof-of-work`. The entire community is **encouraged to help review and verify** other operatives' proof of work!
- 🎯 **Whistleblower Bounty Reward:**
  - For **any confirmed report of cheating** (e.g., fake/looped timelapses, AFK timers, reused old photos/videos, inflated time without matching work, or fabricated proof), the member who reports it is **guaranteed a minimum reward of `+25 XP`**!
  - **Even higher XP rewards** (and bonuses) may be granted depending on the severity and complexity of the catch.

### 🚫 4. Penalties for Cheating
- **First Offense:** Immediate **disqualification from the current running weekly competition** (and forfeiture of any weekly rewards/bounties).
- **Repeat Offenses:** Repeatedly attempting to cheat or bypass the Proof of Work system will result in **permanent kicks or ban** from the Marathon Server.

---

# 🚀 QUICK-START CHECKLIST FOR NEW OPERATIVES

1. Run **`/link`** in Discord ➔ Copy the 8-character code from your DMs ➔ Enter it at **[project-marathon.vercel.app/join](https://project-marathon.vercel.app/join)** to get your `@member` role, your **Squad**, and your **Web Dashboard**.
2. React with **`🔔` (Reset Reminders)**, **`🎉` (Events)**, and **`💯` (Daily Motivation)** in the Reaction Roles channel.
3. Open **[project-marathon.vercel.app/timelapse](https://project-marathon.vercel.app/timelapse)** if you are doing screen work, then run **`/timer start`** in Discord.
4. Study for **at least 25 minutes**, then run **`/timer end`** with your timelapse video, photo, PDF, or work link attached.
5. Hit **`100 Weekly Squad XP`** to activate your score for your Squad, climb the Individual Leaderboard to beat **`@randomxsoul`** and reach the **Top 3 Cash Prize Zone**, and **always run `/redeem-coins` before Sunday at 7:30 PM IST**!
