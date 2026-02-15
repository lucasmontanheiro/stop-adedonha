# STOP / Adedonha — Link-Based Multiplayer 🎲✍️

A **free, serverless, mobile-first multiplayer STOP (Adedonha) game** where  
**each player uses their own device**, hosted entirely on **GitHub Pages**.

No login. No backend. No database.  
Just open a link, play, and have fun.

---

## ✨ Features

- 📱 **Mobile-First Design:** Optimized for a modern app-like experience on phones, centered on desktop.
- 🔗 **Room-based gameplay using shareable links:** No account needed.
- 🗂️ **Tabbed Interface:** Dedicated sections for "Config" and "Jogo" to keep the worksheet focused.
- ⏳ **Preparation Buffer:** 15-second warm-up countdown before the letter is revealed to everyone.
- 🔠 Same **letter, categories, and timer** for everyone.
- ⏱️ **Flexible Timer:** Play with a countdown or "Unlimited" (∞) mode.
- 🔒 **URL Obfuscation:** Game state is encoded in the URL to prevent "peeking" at the letter during the countdown.
- 🛑 **Any player can hit STOP** and end the round for all by sharing the link.
- 💾 Answers saved locally per player (privacy-friendly).
- 📋 One-tap **copy answers** to share in chat for scoring.
- 🆓 100% free hosting with GitHub Pages.

---

## 🎮 How to Play

### 1. Start a round
One player enters their name and clicks **“🚀 Iniciar Nova Rodada”**.  
A link is generated and copied automatically.

📤 Share that link in your group (WhatsApp, Discord, etc).

---

### 2. Join the round
Each player:
- Opens the link on their own device.
- The app automatically switches to the **Jogo** tab.
- Wait for the 15s preparation countdown (warm-up).

---

### 3. Play
Once the countdown ends:
- The **Letter** is revealed.
- Fill in the answers locally on your worksheet.
- The timer stays synced for everyone.

---

### 4. STOP!
Any player can press **STOP**.

What happens:
- The app generates a new **“ended round” link**.
- That link is shared in the group.
- When others open it, the round is immediately marked as ended.

---

### 5. Scoring
Each player taps **“📋 Copiar”**  
and pastes them into the chat.

Scoring is done socially (classic STOP rules):
- 10 points → unique answer
- 5 points → repeated answer
- 0 points → invalid or empty

---

## 🧠 How It Works (Tech Overview)

### 📁 Project Structure
The code is organized for clarity and maintainability:
- `index.html`: Main structure and UI views.
- `style.css`: Mobile-first styling and layout.
- `script.js`: Game logic, state management, and URL obfuscation.

---

### 🔗 Obfuscated URL State (Key Idea)

All shared game state is bundled and Base64-encoded into a single parameter:

`?p=eyJyb29tI...` (Decodes to: Room, Round, Letter, Cats, Timestamps)


This ensures players can't easily see the game letter in the address bar during the preparation phase.

---

### ⏱️ Time & Buffer Synchronization

Instead of simple timers, the app uses timestamps:
- `startsAt`: When the preparation buffer ends.
- `endsAt`: When the game timer expires.

Each device calculates remaining time using `Date.now()`.

Benefits:
- Late joiners sync correctly.
- Refreshing the page doesn’t break the countdown.
- Minor clock differences don’t impact the social experience.

---

### 🛑 STOP Without a Server

When someone hits STOP, they generate an authoritative "ended link" (`endedAt=<timestamp>`). Sharing this link effectively "freezes" the round for the whole group.

---

### 💾 LocalStorage (Per Player)

Each device stores locally:
- Player name and preferences.
- Answers for the current round.

Answers are **never uploaded anywhere**.

---

## 🛠️ Tech Stack

- **HTML5**
- **Modern CSS** (Mobile-first, Flexbox/Grid)
- **Vanilla JavaScript** (ES6+)
- **LocalStorage API**
- **Base64 Encoding** (for URL state)

No frameworks. No build step. No dependencies.

---

## 🚀 Deployment

1. Create a GitHub repository.
2. Add `index.html`, `style.css`, and `script.js` to the root.
3. Enable **GitHub Pages** (Settings → Pages).
4. Done 🎉

---

## ❤️ Why This Exists

STOP is a **social party game**. This project keeps that spirit with zero friction and maximum privacy.

---

## 📜 License

MIT — do whatever you want with it.
