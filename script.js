(() => {
  const el = (id) => document.getElementById(id);

  // ======== State ========
  let roomState = null; // From server: { room: {code, round, letter, categories, starts_at, ends_at, ended_at, status}, players: [...] }
  let lastSync = 0;
  let pollingTimer = null;
  let localTimer = null;
  let serverTimeOffset = 0;

  const defaults = {
    playerName: "",
    roomId: "",
    seconds: 60,
    noLimit: false,
    alphabet: "ABCDEFGHILMNOPQRSTUVXZJ",
    categories: ["Nome", "Animal", "Cidade", "Objeto", "Comida", "Profissão"]
  };

  const storeKey = "stop_php_v1";
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(storeKey)) ?? {}; }
    catch { return {}; }
  };
  const saveLocal = (obj) => localStorage.setItem(storeKey, JSON.stringify(obj));

  function getAnswersKey() {
    const rc = roomState?.room?.code || el("roomId").value.trim();
    const rd = roomState?.room?.round || 0;
    return `stop_ans_${rc}_${rd}`;
  }
  const loadAnswers = () => {
    try { return JSON.parse(localStorage.getItem(getAnswersKey())) ?? {}; }
    catch { return {}; }
  };
  const saveAnswers = (ans) => localStorage.setItem(getAnswersKey(), JSON.stringify(ans));

  // ======== UI Refs ========
  const views = { config: el("view-config"), game: el("view-game"), compare: el("view-compare") };
  const tabBtns = { config: el("btn-tab-config"), game: el("btn-tab-game"), compare: el("btn-tab-compare") };
  
  const playerNameEl = el("playerName");
  const roomIdEl = el("roomId");
  const secondsEl = el("seconds");
  const noLimitEl = el("noLimit");
  const alphabetEl = el("alphabet");
  const categoriesEl = el("categories");

  const roundNumEl = el("roundNum");
  const letterEl = el("letter");
  const timeLeftEl = el("timeLeft");
  const statusEl = el("status");

  const inputsWrap = el("inputsWrap");
  const notInRound = el("notInRound");
  const gameActions = el("gameActions");
  const stopBtn = el("stopBtn");
  const postGameActions = el("postGameActions");
  
  const configPlayerList = el("configPlayerList");
  const configPlayersWrap = configPlayerList.querySelector(".players-wrap");
  const compareMuted = el("compareMuted");

  // ======== Helpers ========
  const nowMs = () => Date.now() + serverTimeOffset;
  const normalizeCategory = (s) => s.trim().replace(/\s+/g, " ");
  const randomRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  const pickLetter = (alphabet) => {
    const alpha = (alphabet || "").replace(/[^A-Z]/g, "").toUpperCase();
    return alpha.length ? alpha[Math.floor(Math.random() * alpha.length)] : "A";
  };

  function setStatus(text, kind) {
    statusEl.textContent = text.toUpperCase();
    statusEl.className = "status-badge";
    if (kind) statusEl.classList.add(kind);
  }

  // ======== Tabs ========
  function switchTab(tabId) {
    if (!el("revealCard").classList.contains("hidden")) backReveal();
    Object.keys(views).forEach(k => {
      views[k].classList.toggle("hidden", k !== tabId);
      tabBtns[k].classList.toggle("active", k === tabId);
    });
    if (tabId === "compare") renderCompareTable();
  }
  Object.keys(tabBtns).forEach(k => tabBtns[k].addEventListener("click", () => switchTab(k)));

  // ======== API ========
  async function api(action, params = {}) {
    const rc = params.room_code || roomIdEl.value.trim();
    const pn = params.player_name || playerNameEl.value.trim();
    const url = new URL("api.php", location.href);
    url.searchParams.set("action", action);
    url.searchParams.set("room_code", rc);
    url.searchParams.set("player_name", pn);
    url.searchParams.set("_t", Date.now()); // Cache buster

    const opts = { method: "GET" };
    if (params.body) {
      opts.method = "POST";
      opts.body = new FormData();
      for (const k in params.body) opts.body.append(k, params.body[k]);
    }

    try {
      const resp = await fetch(url, opts);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  }

  // ======== Core Logic ========
  async function sync() {
    const rc = roomIdEl.value.trim();
    if (!rc) return;

    const startFetch = Date.now();
    const data = await api("status");
    if (!data) return;

    if (data.server_time) {
      const endFetch = Date.now();
      const rtt = endFetch - startFetch;
      // Assume the server time was captured exactly in the middle of the request
      serverTimeOffset = (data.server_time - (endFetch - rtt / 2));
    }

    const oldStatus = roomState?.room?.status;
    const oldRound = roomState?.room?.round;
    roomState = data;

    // Detection of state changes
    if (oldStatus !== roomState.room.status || oldRound !== roomState.room.round) {
      if (roomState.room.status === 'playing' && oldStatus !== 'playing') {
        switchTab("game");
      }
      buildInputs(roomState.room.status === 'ended');
    }

    renderUI();
  }

  function renderUI() {
    if (!roomState) return;

    const room = roomState.room;
    const players = roomState.players;

    // Update Config View
    if (room.code) {
      configPlayerList.classList.remove("hidden");
      configPlayersWrap.innerHTML = "";
      players.forEach(p => {
        const span = document.createElement("span");
        span.className = "player-tag online";
        span.textContent = p.name;
        configPlayersWrap.appendChild(span);
      });
    }

    // Update Game Stats
    roundNumEl.textContent = room.round || "—";
    
    const now = nowMs();
    const isPreparing = room.starts_at && now < room.starts_at;
    const isEnded = room.status === 'ended' || (room.ends_at && now >= room.ends_at);

    if (isPreparing) {
      const left = Math.ceil((room.starts_at - now) / 1000);
      letterEl.textContent = "⏳";
      timeLeftEl.textContent = left + "s";
      setStatus("Preparando...", "warn");
      inputsWrap.classList.add("hidden");
      gameActions.classList.add("hidden");
      notInRound.classList.add("hidden");
    } else if (room.status === 'playing' && !isEnded) {
      letterEl.textContent = room.letter;
      if (room.ends_at) {
        const left = Math.max(0, Math.ceil((room.ends_at - now) / 1000));
        timeLeftEl.textContent = left + "s";
      } else {
        timeLeftEl.textContent = "∞";
      }
      setStatus("Em jogo", "ok");
      inputsWrap.classList.remove("hidden");
      gameActions.classList.remove("hidden");
      stopBtn.classList.remove("hidden");
      postGameActions.classList.add("hidden");
      notInRound.classList.add("hidden");
    } else if (isEnded) {
      letterEl.textContent = room.letter;
      timeLeftEl.textContent = "0s";
      setStatus("Encerrada", "warn");
      inputsWrap.classList.remove("hidden");
      gameActions.classList.remove("hidden");
      stopBtn.classList.add("hidden");
      postGameActions.classList.remove("hidden");
      notInRound.classList.add("hidden");
    } else {
      roundNumEl.textContent = "—"; letterEl.textContent = "—"; timeLeftEl.textContent = "—";
      setStatus("Sem rodada");
      inputsWrap.classList.add("hidden");
      gameActions.classList.add("hidden");
      notInRound.classList.remove("hidden");
    }

    if (views.compare.classList.contains("hidden") === false) {
      renderCompareTable();
    }
  }

  function buildInputs(readOnly = false) {
    inputsWrap.innerHTML = "";
    const cats = roomState?.room?.categories || [];
    const answers = loadAnswers();
    const grid = document.createElement("div");
    grid.className = "grid";

    cats.forEach((cat) => {
      const item = document.createElement("div");
      item.className = "input-item";
      const label = document.createElement("label");
      label.textContent = cat;
      const input = document.createElement("input");
      input.placeholder = roomState?.room?.letter ? `Começa com "${roomState.room.letter}"…` : "";
      input.value = answers[cat] ?? "";
      if (readOnly) input.disabled = true;

      input.addEventListener("input", () => {
        const next = loadAnswers();
        next[cat] = input.value;
        saveAnswers(next);
      });
      item.appendChild(label);
      item.appendChild(input);
      grid.appendChild(item);
    });
    inputsWrap.appendChild(grid);
  }

  function renderCompareTable() {
    if (!roomState) return;
    const cats = roomState.room.categories;
    const myName = playerNameEl.value.trim() || "Eu";
    const playersWithAnswers = roomState.players.filter(p => p.answers);

    if (playersWithAnswers.length === 0) {
      compareMuted.classList.remove("hidden");
      el("compareTable").classList.add("hidden");
      return;
    }
    compareMuted.classList.add("hidden");
    el("compareTable").classList.remove("hidden");

    const head = el("compareHead");
    const body = el("compareBody");
    head.innerHTML = "<th>Categoria</th>";
    
    playersWithAnswers.forEach(p => {
      const th = document.createElement("th");
      th.textContent = p.name + (p.name === myName ? " (Você)" : "");
      head.appendChild(th);
    });

    body.innerHTML = "";
    cats.forEach(cat => {
      const tr = document.createElement("tr");
      const tdCat = document.createElement("td");
      tdCat.textContent = cat;
      tr.appendChild(tdCat);
      
      playersWithAnswers.forEach(p => {
        const td = document.createElement("td");
        td.textContent = (p.answers && p.answers[cat]) || "—";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  // ======== Actions ========
  async function joinRoom() {
    const name = playerNameEl.value.trim();
    const rc = roomIdEl.value.trim();
    if (!name || !rc) return alert("Preencha nome e código da sala!");
    
    const data = await api("join");
    if (data) {
      saveLocal({ ...loadLocal(), playerName: name, roomId: rc });
      startPolling();
      sync();
    }
  }

  async function startNewRound() {
    const name = playerNameEl.value.trim();
    let rc = roomIdEl.value.trim();
    if (!name) return alert("Preencha seu nome!");
    if (!rc) {
      rc = randomRoomCode();
      roomIdEl.value = rc;
    }

    // Join first
    await api("join");

    const seconds = Math.max(10, Math.min(600, Number(secondsEl.value || defaults.seconds)));
    const alphabet = String(alphabetEl.value || defaults.alphabet).toUpperCase();
    const cats = categoriesEl.value.split("\n").map(normalizeCategory).filter(Boolean);
    const finalCats = cats.length ? cats : defaults.categories;
    const currentRound = (roomState?.room?.code === rc) ? (Number(roomState.room.round) + 1) : 1;

    const body = {
      letter: pickLetter(alphabet),
      seconds: seconds,
      categories: finalCats.join("|"),
      round: currentRound,
      noLimit: noLimitEl.checked
    };

    const data = await api("start", { body });
    if (data) {
      localStorage.removeItem(getAnswersKey());
      startPolling();
      sync();
    }
  }

  async function stopRound() {
    await api("stop");
    sync();
  }

  async function submitAnswers() {
    const ans = JSON.stringify(loadAnswers());
    const data = await api("submit", { body: { answers: ans } });
    if (data) {
      alert("Respostas enviadas!");
      switchTab("compare");
    }
  }

  function startPolling() {
    if (pollingTimer) clearInterval(pollingTimer);
    pollingTimer = setInterval(sync, 2500);
    
    if (localTimer) clearInterval(localTimer);
    localTimer = setInterval(renderUI, 500);
  }

  // ======== UI Events ========
  el("joinBtn").addEventListener("click", joinRoom);
  el("startRoundBtn").addEventListener("click", startNewRound);
  el("stopBtn").addEventListener("click", stopRound);
  el("submitBtn").addEventListener("click", submitAnswers);
  el("revealBtn").addEventListener("click", () => {
    const name = playerNameEl.value.trim() || "Jogador";
    const cats = roomState?.room?.categories || [];
    const ans = loadAnswers();
    let txt = `👤 ${name}\n📍 Sala ${roomState?.room?.code}\n🔢 Rodada ${roomState?.room?.round}\n🔠 Letra: ${roomState?.room?.letter}\n\n`;
    cats.forEach(c => txt += `${c}: ${ans[c] || "—"}\n`);
    el("answersOut").textContent = txt;
    el("revealCard").classList.remove("hidden");
    el("tabBar").classList.add("hidden");
  });
  el("backBtn").addEventListener("click", backReveal);
  el("resetBtn").addEventListener("click", () => {
    if (confirm("Resetar preferências locais?")) {
      localStorage.clear();
      location.reload();
    }
  });

  function backReveal() {
    el("revealCard").classList.add("hidden");
    el("tabBar").classList.remove("hidden");
  }

  // Settings Toggle
  el("toggleSettingsBtn").addEventListener("click", () => {
    const hidden = el("extraSettings").classList.toggle("hidden");
    el("toggleSettingsBtn").textContent = hidden ? "Configurações Avançadas ↓" : "Fechar Configurações ↑";
  });

  // Init
  const local = { ...defaults, ...loadLocal() };
  playerNameEl.value = local.playerName;
  roomIdEl.value = local.roomId;
  secondsEl.value = local.seconds;
  noLimitEl.checked = local.noLimit;
  alphabetEl.value = local.alphabet;
  categoriesEl.value = local.categories.join("\n");

  // Resync when tab becomes visible (handles mobile sleep/tab switch)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      sync();
    }
  });

  if (local.roomId && local.playerName) {
    startPolling();
    sync();
  }

})();
