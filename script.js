(() => {
  const el = (id) => document.getElementById(id);

  // ======== Tabs ========
  const views = {
    config: el("view-config"),
    game: el("view-game")
  };
  const tabBtns = {
    config: el("btn-tab-config"),
    game: el("btn-tab-game")
  };

  function switchTab(tabId) {
    if (el("revealCard").classList.contains("hidden") === false) {
      backReveal();
    }
    Object.keys(views).forEach(k => {
      views[k].classList.toggle("hidden", k !== tabId);
      tabBtns[k].classList.toggle("active", k === tabId);
    });
  }

  tabBtns.config.addEventListener("click", () => switchTab("config"));
  tabBtns.game.addEventListener("click", () => switchTab("game"));

  // ======== Settings UI Toggle ========
  const toggleSettingsBtn = el("toggleSettingsBtn");
  const extraSettings = el("extraSettings");
  let settingsVisible = false;

  toggleSettingsBtn.addEventListener("click", () => {
    settingsVisible = !settingsVisible;
    extraSettings.classList.toggle("hidden", !settingsVisible);
    toggleSettingsBtn.textContent = settingsVisible ? "Fechar Configurações ↑" : "Configurações Avançadas ↓";
  });

  // ======== Local persistence ========
  const storeKey = "stop_linkroom_v1";
  const loadLocal = () => {
    try { return JSON.parse(localStorage.getItem(storeKey)) ?? {}; }
    catch { return {}; }
  };
  const saveLocal = (obj) => localStorage.setItem(storeKey, JSON.stringify(obj));

  const defaults = {
    playerName: "",
    roomId: "",
    seconds: 60,
    noLimit: false,
    alphabet: "ABCDEFGHILMNOPQRSTUVXZJ",
    categories: ["Nome", "Animal", "Cidade", "Objeto", "Comida", "Profissão"]
  };

  let roundState = null;
  let timer = null;

  // ======== UI refs ========
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
  const revealCard = el("revealCard");
  const answersOut = el("answersOut");
  const tabBar = el("tabBar");

  // ======== Helpers ========
  function normalizeCategory(s) { return s.trim().replace(/\s+/g, " "); }
  function encodeCats(cats) { return encodeURIComponent(cats.join("|")); }
  function decodeCats(raw) {
    if (!raw) return null;
    return decodeURIComponent(raw).split("|").map(normalizeCategory).filter(Boolean);
  }
  function pickLetter(alphabet) {
    const alpha = (alphabet || "").replace(/[^A-Za-zÀ-ÿ]/g, "").toUpperCase();
    if (!alpha.length) return "A";
    return alpha[Math.floor(Math.random() * alpha.length)];
  }
  function nowMs() { return Date.now(); }

  function setStatus(text, kind) {
    statusEl.textContent = text.toUpperCase();
    statusEl.className = "status-badge";
    if (kind) statusEl.classList.add(kind);
  }

  function clearTimer() { if (timer) clearInterval(timer); timer = null; }

  function getAnswersKey() {
    const room = roundState?.room || roomIdEl.value.trim();
    const round = roundState?.round || "0";
    return `stop_answers_${room}_${round}`;
  }

  function loadAnswers() {
    try { return JSON.parse(localStorage.getItem(getAnswersKey())) ?? {}; }
    catch { return {}; }
  }

  function saveAnswers(ans) { localStorage.setItem(getAnswersKey(), JSON.stringify(ans)); }

  function buildInputs() {
    inputsWrap.innerHTML = "";
    const cats = (roundState?.cats || []).map(normalizeCategory).filter(Boolean);
    const answers = loadAnswers();
    const grid = document.createElement("div");
    grid.className = "grid";

    cats.forEach((cat) => {
      const item = document.createElement("div");
      item.className = "input-item";
      const label = document.createElement("label");
      label.textContent = cat;
      const input = document.createElement("input");
      input.placeholder = roundState?.letter ? `Começa com "${roundState.letter}"…` : "";
      input.value = answers[cat] ?? "";
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

  function computeTimeLeft() {
    if (!roundState?.endsAt) return null;
    const end = Number(roundState.endedAt || roundState.endsAt);
    return Math.max(0, Math.ceil((end - nowMs()) / 1000));
  }

  function renderRoundHeader() {
    if (!roundState) {
      roundNumEl.textContent = "—"; letterEl.textContent = "—"; timeLeftEl.textContent = "—";
      setStatus("Sem rodada");
      inputsWrap.classList.add("hidden"); gameActions.classList.add("hidden"); notInRound.classList.remove("hidden");
      return;
    }

    const now = nowMs();
    const startsAt = roundState.startsAt || 0;
    const isPreparing = now < startsAt;

    if (isPreparing) {
      const prepLeft = Math.ceil((startsAt - now) / 1000);
      roundNumEl.textContent = String(roundState.round);
      letterEl.textContent = "⏳";
      timeLeftEl.textContent = prepLeft + "s";
      setStatus("Preparando...", "warn");
      inputsWrap.classList.add("hidden");
      gameActions.classList.add("hidden");
      notInRound.classList.add("hidden");
      return;
    }

    roundNumEl.textContent = String(roundState.round);
    letterEl.textContent = roundState.letter;
    const left = computeTimeLeft();

    if (roundState.endsAt) {
      timeLeftEl.textContent = (left ?? "—") + "s";
    } else {
      timeLeftEl.textContent = "∞";
    }

    const ended = Boolean(roundState.endedAt) || (roundState.endsAt && left === 0);
    if (ended) setStatus("Encerrada", "warn"); else setStatus("Em jogo", "ok");
    inputsWrap.classList.remove("hidden"); gameActions.classList.remove("hidden"); notInRound.classList.add("hidden");
  }

  function startTicking() {
    clearTimer();
    timer = setInterval(() => {
      if (!roundState) return;

      const now = nowMs();
      const startsAt = roundState.startsAt || 0;
      const isPreparing = now < startsAt;

      if (isPreparing) {
        const prepLeft = Math.ceil((startsAt - now) / 1000);
        letterEl.textContent = "⏳";
        timeLeftEl.textContent = prepLeft + "s";
        setStatus("Preparando...", "warn");
        return;
      }

      const left = computeTimeLeft();

      // If we just finished preparing, we might need to reveal inputs
      if (inputsWrap.classList.contains("hidden") && !Boolean(roundState.endedAt)) {
        renderRoundHeader();
      }

      if (roundState.endsAt) {
        timeLeftEl.textContent = (left ?? "—") + "s";
      } else {
        timeLeftEl.textContent = "∞";
      }

      if (Boolean(roundState.endedAt) || (roundState.endsAt && left === 0)) {
        setStatus("Encerrada", "warn");
      }
    }, 250);
  }

  // ======== URL Obfuscation Helpers ========
  function pack(obj) {
    try {
      const str = JSON.stringify(obj);
      // Using btoa(unescape(encodeURIComponent())) for UTF-8 support
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) { return null; }
  }

  function unpack(str) {
    try {
      // Using decodeURIComponent(escape(atob())) for UTF-8 support
      const decoded = decodeURIComponent(escape(atob(str)));
      return JSON.parse(decoded);
    } catch (e) { return null; }
  }

  function getUrlRoundState() {
    const u = new URL(location.href);
    const p = u.searchParams.get("p");

    // New packed format
    if (p) {
      const st = unpack(p);
      if (st && st.room && st.round && st.letter && st.cats) return st;
    }

    // Fallback for old/legacy parameters
    const room = u.searchParams.get("room"), round = u.searchParams.get("round"), letter = u.searchParams.get("letter"),
          catsRaw = u.searchParams.get("cats"), endsAt = u.searchParams.get("endsAt"), endedAt = u.searchParams.get("endedAt"),
          startsAt = u.searchParams.get("startsAt");
    if (!room || !round || !letter || !catsRaw) return null;
    return { room, round: Number(round), letter, cats: decodeCats(catsRaw) || defaults.categories,
             startsAt: startsAt ? Number(startsAt) : null,
             endsAt: endsAt ? Number(endsAt) : null, endedAt: endedAt ? Number(endedAt) : null };
  }

  function setUrlFromState(st) {
    const u = new URL(location.href);
    // Clear old parameters
    ["room", "round", "letter", "cats", "startsAt", "endsAt", "endedAt"].forEach(k => u.searchParams.delete(k));

    const p = pack(st);
    if (p) u.searchParams.set("p", p);
    history.replaceState(null, "", u.toString());
  }

  function makeShareLink(st) {
    const u = new URL(location.href);
    ["room", "round", "letter", "cats", "startsAt", "endsAt", "endedAt"].forEach(k => u.searchParams.delete(k));

    const p = pack(st);
    if (p) u.searchParams.set("p", p);
    return u.toString();
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
      ta.select(); const ok = document.execCommand("copy"); document.body.removeChild(ta); return ok;
    }
  }

  function answersToText() {
    const name = (playerNameEl.value || "").trim() || "Jogador";
    const cats = (roundState?.cats || defaults.categories);
    const answers = loadAnswers();
    const lines = [`👤 ${name}
📍 Sala ${roundState?.room}
🔢 Rodada ${roundState?.round}
🔠 Letra: ${roundState?.letter}`, ""];
    for (const cat of cats) { lines.push(`${cat}: ${(answers[cat] ?? "").trim() || "—"}`); }
    return lines.join("
");
  }

  // ======== Actions ========
  function applyCategoriesFromTextarea() {
    const cats = categoriesEl.value.split("
").map(normalizeCategory).filter(Boolean);
    const local = loadLocal(); local.categories = cats.length ? cats : defaults.categories; saveLocal(local);
  }

  function joinFromUrl() {
    const st = getUrlRoundState();
    roundState = st;
    if (roundState) {
      roomIdEl.value = roundState.room;
      categoriesEl.value = (roundState.cats || []).join("
");
      buildInputs();
      renderRoundHeader();
      startTicking();
      switchTab("game");
    } else {
      roundState = null;
      renderRoundHeader();
      clearTimer();
      switchTab("config");
    }
  }

  async function startNewRound() {
    const local = loadLocal();
    const room = (roomIdEl.value || "").trim() || randomRoomCode();
    const seconds = Math.max(10, Math.min(600, Number(secondsEl.value || defaults.seconds)));
    const alphabet = String(alphabetEl.value || defaults.alphabet).toUpperCase();
    const cats = (categoriesEl.value || "").split("
").map(normalizeCategory).filter(Boolean);
    const categories = cats.length ? cats : (local.categories || defaults.categories);
    const currentRound = (roundState?.room === room) ? (Number(roundState.round) + 1) : 1;
    const useTimer = !noLimitEl.checked;
    const now = nowMs();
    const preparationMs = 15000;

    roundState = {
      room,
      round: currentRound,
      letter: pickLetter(alphabet),
      cats: categories,
      startsAt: now + preparationMs,
      endsAt: useTimer ? (now + preparationMs + seconds * 1000) : null,
      endedAt: null
    };

    saveLocal({
      ...defaults,
      ...local,
      roomId: room,
      seconds,
      noLimit: noLimitEl.checked,
      alphabet,
      categories,
      playerName: playerNameEl.value || local.playerName || ""
    });

    setUrlFromState(roundState);
    roomIdEl.value = room;
    localStorage.removeItem(getAnswersKey());
    buildInputs();
    renderRoundHeader();
    startTicking();
    switchTab("game");
    const link = makeShareLink(roundState);
    await copyText(link);
    alert("Link da rodada copiado!");
  }

  function randomRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = ""; for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  async function stopRoundGenerateEndedLink() {
    if (!roundState) return;
    const isEnded = roundState.endedAt || (roundState.endsAt && computeTimeLeft() === 0);
    if (isEnded) {
      await copyText(makeShareLink(roundState));
      alert("Rodada já encerrada. Link copiado."); return;
    }
    roundState.endedAt = nowMs();
    setUrlFromState(roundState);
    renderRoundHeader();
    await copyText(makeShareLink(roundState));
    alert("STOP! Link encerrado copiado.");
  }

  async function copyMyAnswers() {
    if (!roundState) return;
    const ok = await copyText(answersToText());
    alert(ok ? "Copiado!" : "Erro ao copiar.");
  }

  function revealForChat() {
    if (!roundState) return;
    answersOut.textContent = answersToText();
    revealCard.classList.remove("hidden");
    views.config.classList.add("hidden");
    views.game.classList.add("hidden");
    tabBar.classList.add("hidden");
  }

  function backReveal() {
    revealCard.classList.add("hidden");
    tabBar.classList.remove("hidden");
    switchTab("game");
  }

  function resetLocal() {
    if(!confirm("Resetar preferências?")) return;
    localStorage.removeItem(storeKey);
    saveLocal({ ...defaults });
    hydrateFromLocal();
  }

  function hydrateFromLocal() {
    const local = { ...defaults, ...loadLocal() };
    playerNameEl.value = local.playerName || "";
    roomIdEl.value = local.roomId || "";
    secondsEl.value = local.seconds || defaults.seconds;
    noLimitEl.checked = !!local.noLimit;
    alphabetEl.value = local.alphabet || defaults.alphabet;
    categoriesEl.value = (local.categories || defaults.categories).join("
");
  }

  function savePrefsOnChange() {
    const local = { ...defaults, ...loadLocal() };
    local.playerName = playerNameEl.value || "";
    local.roomId = roomIdEl.value || "";
    local.seconds = Math.max(10, Math.min(600, Number(secondsEl.value || defaults.seconds)));
    local.noLimit = noLimitEl.checked;
    local.alphabet = String(alphabetEl.value || defaults.alphabet).toUpperCase();
    saveLocal(local);
  }

  el("applyCategoriesBtn").addEventListener("click", () => { applyCategoriesFromTextarea(); alert("Categorias salvas!"); });
  el("startRoundBtn").addEventListener("click", startNewRound);
  el("joinBtn").addEventListener("click", joinFromUrl);
  el("stopBtn").addEventListener("click", stopRoundGenerateEndedLink);
  el("copyBtn").addEventListener("click", copyMyAnswers);
  el("revealBtn").addEventListener("click", revealForChat);
  el("backBtn").addEventListener("click", backReveal);
  el("resetBtn").addEventListener("click", resetLocal);
  playerNameEl.addEventListener("change", savePrefsOnChange);
  roomIdEl.addEventListener("change", savePrefsOnChange);
  secondsEl.addEventListener("change", savePrefsOnChange);
  noLimitEl.addEventListener("change", savePrefsOnChange);
  alphabetEl.addEventListener("change", savePrefsOnChange);

  hydrateFromLocal();
  joinFromUrl();
})();
