# STOP / Adedonha PHP — Real-Time Multiplayer 🎲✍️

A **free, modern, and self-hosted** PHP implementation of the classic STOP (Adedonha) game.  
Designed for seamless real-time play across mobile and desktop devices without the need for external services or complex databases.

---

## ✨ Features

- 📱 **Mobile-Optimized:** Built for a smooth experience on phones with specific fixes for mobile browser caching and background power-saving modes.
- 🌐 **Real-Time Sync:** Uses high-precision server timestamps and network latency (RTT) calculation to keep everyone's countdown perfectly in sync.
- 🔑 **Room-Based Play:** No accounts needed. Just enter a Room Code and a name to join your friends instantly.
- ⏳ **Preparation Buffer:** A synchronized 15-second warm-up phase to ensure all players start typing at the exact same millisecond.
- 🛑 **Instant Global STOP:** Any player can end the round for the entire room. The server freezes all worksheets simultaneously.
- 📊 **Auto-Consolidation:** No more copying links. Answers are submitted to the room's central database and displayed side-by-side in the **Placar** tab.
- 🔒 **Secure & Private:** Includes input sanitization, XSS protection, and `.htaccess` rules to protect the local SQLite database.
- 🆓 **Self-Hosted & Free:** Runs on any standard PHP hosting (7.4+). Uses SQLite for lightweight, file-based data storage.

---

## 🎮 How to Play

### 1. Join a Room
Enter your name and any **Room Code** (e.g., `PIZZA123`). Share the code with your friends.

### 2. Configure the Round
Adjust categories, valid letters, and the timer (or set to "Unlimited"). Click **"🚀 Iniciar Rodada"** to begin.

### 3. The Countdown
Watch the 15s "Preparando..." timer. Once it hits zero, the letter is revealed, and the inputs appear for everyone.

### 4. STOP!
The first person to finish clicks **STOP**. This immediately ends the round for all players in that room.

### 5. Review Results
Click **"📤 Enviar Respostas"** to share your answers. Switch to the **"📊 Placar"** tab to see the comparison table and decide on the scores.

---

## 🛠️ Tech Stack

- **PHP 7.4+** (with SQLite3 extension enabled)
- **SQLite3** (High-precision `REAL` timestamps)
- **Vanilla JavaScript** (Fetch API, RTT-compensated polling, Visibility API)
- **Modern CSS** (Flexbox/Grid, Mobile-first)

---

## 🚀 Deployment

1.  **Upload:** Transfer the following files to a directory on your server:
    - `index.php`
    - `api.php`
    - `script.js`
    - `style.css`
    - `.htaccess`
2.  **Permissions:** Ensure the directory has **write permissions** (CHMOD `755` or `777`). PHP needs to create and update the `db.sqlite` file in this folder.
3.  **Play:** Open your browser at the folder's URL and start playing!

---

## 📜 License

MIT — Created for fun, free to use and modify.
