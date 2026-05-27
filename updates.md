# 📢 **Marathon Bot Updates – New Team Exchange System & Timer Enhancements**

---

## 🔄 New Team‑Exchange Workflow

We've added a **7‑day cooldown** to protect squad balance and prevent rapid swapping.

**How it works**
- Use `/exchange-teams @User` to propose a swap.
- The target must accept with `/exchange‑accept` or decline with `/exchange‑deny`.
- **Both participants** receive a 7‑day cooldown after a successful swap. While on cooldown they **cannot** initiate **or** be part of another exchange.
- If you attempt an exchange while on cooldown you’ll see a message like:
  > ⏳ **COOLDOWN ACTIVE:** You can initiate another exchange <t:1701234567:R> (on <t:1701234567:F>).
- Team Leaders (role ID `1500546046907125962`) are **blocked** from swapping.

**What you’ll see**
- Successful swaps embed a **cooldown timestamp** for both users.
- DMs to the initiator also contain the cooldown expiry.

---

## ⏱️ Timer (`/timer`) Enhancements

We’ve expanded proof submission and added smarter handling:
- **Proof types now include:** Video, PDF, Text, Link **and** images.
- At least **one proof of any type** is required – you no longer need to provide every type.
- If a proof exceeds Discord’s size limits, the timer **auto‑pauses** and the user receives a prompt to reduce the file size.
- UI now shows session status (`▶️ Running` or `⏸️ Paused`).
- Attachment slots reduced to **24 + 1 link** to stay within Discord’s 25‑option limit.

---

Feel free to try the new commands and let us know if you encounter any issues! 🎉
