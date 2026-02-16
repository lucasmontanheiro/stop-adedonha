# STOP / Adedonha — Link-Based Multiplayer 🎲✍️

A **free, serverless, mobile-first multiplayer STOP (Adedonha) game** where  
**each player uses their own device**, hosted entirely on **GitHub Pages**.

No login. No backend. No database.  
Just open a link, play, and have fun.

---

## ✨ Features

- 📱 **Mobile-First Design:** Optimized for a modern app-like experience on phones, centered on desktop.
- 🔗 **Room-based gameplay using shareable links:** No account needed.
- 🗂️ **Tabbed Interface:** Dedicated sections for "Config", "Jogo", and "Placar".
- ⏳ **Preparation Buffer:** 15-second warm-up countdown before the letter is revealed.
- ⏱️ **Flexible Timer:** Play with a countdown or "Unlimited" (∞) mode.
- 🔒 **URL Obfuscation:** Game state is encoded in the URL to prevent "peeking" at the letter.
- 🛑 **Serverless STOP:** Any player can end the round for the whole group.
- 📊 **Answer Consolidation:** One-tap to share your answers via link; the host can consolidate everyone's results side-by-side.
- 💾 **Privacy-First:** Answers are saved locally and only shared when you explicitly click "Enviar".
- 🆓 **100% Free:** Hosted entirely as a static site on GitHub Pages.

---

## 🎮 How to Play

### 1. Start a round
One player enters their name and clicks **“🚀 Iniciar Nova Rodada”**.  
A link is generated and copied automatically. 📤 Share it in your group.

### 2. Join & Warm-up
Each player opens the link. The app switches to the **Jogo** tab.  
Wait for the **15s preparation countdown**—this ensures everyone is ready at the same time.

### 3. Play
Once the letter is revealed, fill in the answers. The worksheet is private to your device.

### 4. STOP!
Any player can press **STOP**. This generates an "ended round" link. Share it in the group to freeze the worksheet for everyone.

### 5. Consolidate & Score
- **Players:** Click **"📤 Enviar para o Grupo"**. This copies a link containing your answers.
- **Host:** Click every link shared by the players in your group chat. The app will notify you: *"Respostas de [Nome] importadas!"*.
- **Review:** Go to the **"📊 Placar"** tab to see everyone's answers side-by-side for final scoring.

---

## 🧠 How It Works (Tech Overview)

### 📁 Project Structure
- `index.html`: UI views (Config, Jogo, Placar, Reveal).
- `style.css`: Mobile-first styling and layout.
- `script.js`: Game logic, state management, and Base64 obfuscation.

### 🔗 Obfuscated URL State
All shared game state is bundled and Base64-encoded:
`?p=eyJyb29tI...`
When sharing answers, the player's results are added to this object, allowing peer-to-peer data transfer without a database.

### ⏱️ Time & Buffer Synchronization
The app uses universal timestamps (`startsAt`, `endsAt`) and `Date.now()`. This keeps late joiners and preparation buffers perfectly synced across devices.

### 💾 LocalStorage (Per Player)
Answers and preferences are stored locally. Consistently clicking peer links accumulates their answers in your local `Placar` for that specific room and round.

---

## 🛠️ Tech Stack

- **HTML5 / Modern CSS** (Flexbox & Grid)
- **Vanilla JavaScript** (Zero dependencies)
- **LocalStorage API**
- **Base64 Encoding**

---

## 🚀 Deployment

1. Create a GitHub repository.
2. Add `index.html`, `style.css`, and `script.js` to the root.
3. Enable **GitHub Pages** (Settings → Pages).
4. Done 🎉

---

## ❤️ Why This Exists

STOP is a social game. This project keeps that spirit alive with zero friction, zero cost, and zero data tracking.

---

## 📜 License

MIT — do whatever you want with it.
