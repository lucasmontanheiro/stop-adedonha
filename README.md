# STOP / Adedonha — Link-Based Multiplayer 🎲✍️

A **free, serverless, multiplayer STOP (Adedonha) game** where  
**each player uses their own device**, hosted entirely on **GitHub Pages**.

No login. No backend. No database.  
Just open a link, play, and have fun.

---

## ✨ Features

- 📱 **Each player on their own phone or computer**
- 🔗 **Room-based gameplay using shareable links**
- 🔠 Same **letter, categories, and timer** for everyone
- 🛑 **Any player can hit STOP** and end the round for all
- ⏱️ Timer stays synced even if someone joins late
- 💾 Answers saved locally per player (privacy-friendly)
- 📋 One-tap **copy answers** to share in chat for scoring
- 🆓 100% free hosting with GitHub Pages

---

## 🎮 How to Play

### 1. Start a round
One player clicks **“Iniciar nova rodada”**.  
A link is generated and copied automatically.

📤 Share that link in your group (WhatsApp, Discord, etc).

---

### 2. Join the round
Each player:
- Opens the link on their own device
- Fills in the answers locally

Everyone sees:
- The same letter
- The same categories
- The same countdown timer

---

### 3. STOP!
Any player can press **STOP**.

What happens:
- The app generates a new **“ended round” link**
- That link is shared in the group
- When others open it, the round is immediately marked as ended

(No servers — the link *is* the source of truth.)

---

### 4. Scoring
Each player taps **“Copiar minhas respostas”**  
and pastes them into the chat.

Scoring is done socially (classic STOP rules):
- 10 points → unique answer
- 5 points → repeated answer
- 0 points → invalid or empty

---

## 🧠 How It Works (Tech Overview)

### 🌐 Hosting
- **GitHub Pages**
- Static site only (`index.html`)
- No backend, no API, no database

---

### 🔗 URL-Based Multiplayer (Key Idea)

All shared game state lives in the URL:

?room=ABCD12
&round=2
&letter=M
&cats=Nome|Animal|Cidade
&endsAt=1700000000000


When a player opens the link, their browser:
- Reads the parameters
- Reconstructs the exact same round locally

This is how players stay in sync **without any server**.

---

### ⏱️ Time Synchronization

Instead of “start a 60s timer”, the app uses:

endsAt = current time + duration


Each device calculates remaining time using `Date.now()`.

Benefits:
- Late joiners sync correctly
- Refreshing the page doesn’t break the timer
- Minor clock differences don’t matter

---

### 🛑 STOP Without a Server

When someone hits STOP:
- A new link is generated with `endedAt=<timestamp>`
- That link represents the authoritative end of the round
- Sharing the link ends the round for everyone

This keeps everything:
- Deterministic
- Transparent
- Serverless

---

### 💾 LocalStorage (Per Player)

Each device stores locally:
- Player name
- Preferences
- Answers for the current round

Answers are **never uploaded anywhere**.  
Sharing is explicit and manual (copy → paste).

---

## 🛠️ Tech Stack

- **HTML** — structure
- **CSS** — layout & styling
- **Vanilla JavaScript** — game logic
- **LocalStorage** — local persistence
- **URL parameters** — multiplayer state

No frameworks. No build step. No dependencies.

---

## 🚀 Deployment

1. Create a GitHub repository
2. Add `index.html` to the root
3. Enable **GitHub Pages**:
   - Settings → Pages
   - Source: `main` branch / root
4. Done 🎉

Your game will be live at:

https://<username>.github.io/<repo-name>/


---

## 🧩 Limitations (By Design)

- Not real-time push (no automatic STOP without link sharing)
- No cheat prevention
- Manual scoring

These trade-offs keep the project:
- Free
- Simple
- Extremely reliable

---

## 🔮 Possible Future Upgrades

- Real-time multiplayer with Firebase or Supabase
- Automatic scoring
- Host-only STOP
- Player list & scoreboard
- Language presets (PT/EN/ES)

---

## 📜 License

MIT — do whatever you want with it.

---

## ❤️ Why This Exists

STOP is a **social party game**.
This project keeps that spirit:
- Minimal tech
- Maximum playability
- Zero friction

If it takes more than one link to start playing,
it’s already too complicated 😉