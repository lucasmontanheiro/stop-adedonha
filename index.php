<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
  <title>STOP / Adedonha Online — Jogo de Palavras Multiplayer Grátis</title>
  <meta name="description" content="Jogue STOP (Adedonha) online com amigos em tempo real. Grátis, sem cadastro e otimizado para celular. Crie sua sala e comece a jogar agora!">
  <meta name="keywords" content="stop online, adedonha online, jogo de palavras, multiplayer, grátis, brincadeira de stop">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-container">
    <h1>STOP / Adedonha</h1>

    <!-- View: Config -->
    <div id="view-config">
      <div class="muted">O melhor jogo de palavras online, grátis e em tempo real.</div>
      <div class="card">
        <div class="field-group">
          <label>Seu Nome</label>
          <input id="playerName" placeholder="Ex: Ana" />
        </div>

        <div class="field-group">
          <label>Código da Sala</label>
          <div style="display:flex; gap:8px;">
            <input id="roomId" placeholder="Ex: SALA123" />
            <button id="joinBtn" class="secondary" style="margin:0; width:auto; padding:0 12px;">Entrar</button>
          </div>
        </div>

        <div id="extraSettings" class="hidden">
          <div class="row">
            <div class="field-group">
              <label>Tempo (s)</label>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="number" id="seconds" min="10" max="600" step="5" />
                <label style="margin:0; white-space:nowrap; display:flex; align-items:center; gap:4px; text-transform:none; font-size:12px; font-weight:normal; color:var(--text);">
                  <input type="checkbox" id="noLimit" style="width:auto; margin:0;" /> Sem limite
                </label>
              </div>
            </div>
          </div>
          <div class="field-group">
            <label>Letras Válidas</label>
            <input id="alphabet" />
          </div>
          <div class="field-group">
            <label>Categorias (uma por linha)</label>
            <textarea id="categories" rows="5"></textarea>
          </div>
        </div>
        
        <div class="settings-toggle">
          <button id="toggleSettingsBtn" class="ghost">Configurações Avançadas ↓</button>
        </div>

        <div class="action-bar">
          <button class="primary" id="startRoundBtn">🚀 Iniciar Rodada</button>
          <button id="resetBtn" class="ghost" style="font-size:11px;">🗑️ Reset Local</button>
        </div>

        <div id="configPlayerList" class="player-list hidden">
          <h3>Jogadores na Sala</h3>
          <div class="players-wrap"></div>
        </div>
      </div>

      <!-- How to Play / SEO Section -->
      <div class="seo-section">
        <h2>Como Jogar STOP Online? 🎮</h2>
        <p>O <strong>STOP</strong> (também conhecido como <em>Adedonha</em> ou <em>Adedonha</em>) é o clássico jogo de palavras que agora você pode jogar direto no navegador, sem baixar nada!</p>
        
        <div class="instruction-steps">
          <div class="step">
            <span class="step-icon">1️⃣</span>
            <div><strong>Crie sua Sala:</strong> Escolha um nome e um código para sua sala e compartilhe com seus amigos.</div>
          </div>
          <div class="step">
            <span class="step-icon">2️⃣</span>
            <div><strong>Sorteie a Letra:</strong> O sistema sorteia uma letra e todos começam a preencher as categorias ao mesmo tempo.</div>
          </div>
          <div class="step">
            <span class="step-icon">3️⃣</span>
            <div><strong>Dê o STOP:</strong> Seja o mais rápido! O primeiro a terminar clica em STOP para encerrar a rodada de todos.</div>
          </div>
          <div class="step">
            <span class="step-icon">4️⃣</span>
            <div><strong>Compare e Pontue:</strong> Veja as respostas de todos lado a lado no Placar e decida quem ganhou.</div>
          </div>
        </div>

        <div class="marketing-blurb">
          <h3>Por que jogar aqui?</h3>
          <ul>
            <li>✨ <strong>100% Grátis:</strong> Sem anúncios intrusivos ou cobranças.</li>
            <li>🚀 <strong>Tempo Real:</strong> Sincronização instantânea entre todos os jogadores.</li>
            <li>📱 <strong>Mobile First:</strong> Funciona perfeitamente no Android, iPhone e PC.</li>
            <li>🔒 <strong>Privacidade:</strong> Sem necessidade de login ou cadastro.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- View: Game -->
    <div id="view-game" class="hidden">
      <div class="card">
        <div class="game-stats">
          <div class="stat-pill">
            <span class="stat-label">Rodada</span>
            <span id="roundNum" class="stat-value">—</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Letra</span>
            <span id="letter" class="stat-value big">—</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Tempo</span>
            <span id="timeLeft" class="stat-value">—</span>
          </div>
        </div>
        <div style="text-align: center;">
          <span id="status" class="status-badge">SEM RODADA</span>
        </div>
      </div>

      <div class="card" id="playCard">
        <h2 id="sheetTitle" style="text-align: center; margin-bottom: 16px;">Sua Planilha</h2>
        
        <div id="notInRound" class="muted" style="padding: 20px 0;">
          Aguardando início da rodada...
        </div>

        <div id="inputsWrap" class="hidden"></div>

        <div id="gameActions" class="action-bar hidden">
          <button class="primary" id="stopBtn" style="background: var(--accent-warn);">🛑 STOP!</button>
          
          <div id="postGameActions" class="hidden">
            <button id="submitBtn" class="primary" style="margin-bottom: 8px;">📤 Enviar Respostas</button>
            <div class="row" style="margin-bottom: 0;">
              <button id="revealBtn" class="secondary">✨ Ver Texto</button>
              <button id="goToCompareBtn" class="secondary">📊 Ver Placar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View: Placar (Comparison) -->
    <div id="view-compare" class="hidden">
      <div class="card">
        <h2 style="text-align: center; margin-bottom: 4px;">Comparação</h2>
        <div class="muted" id="compareMuted">Aguardando respostas dos jogadores...</div>
        
        <div class="compare-table-wrap">
          <table id="compareTable">
            <thead><tr id="compareHead"></tr></thead>
            <tbody id="compareBody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View: Reveal (Full screen overlay style) -->
    <div class="card hidden" id="revealCard">
      <h2>Resumo da Rodada</h2>
      <div class="answers" id="answersOut"></div>
      <div class="action-bar">
        <button id="backBtn" class="primary">Voltar ao Jogo</button>
      </div>
    </div>
  </div>

  <nav class="tab-bar" id="tabBar">
    <button class="tab-btn active" id="btn-tab-config">
      <span>⚙️</span> Config
    </button>
    <button class="tab-btn" id="btn-tab-game">
      <span>✍️</span> Jogo
    </button>
    <button class="tab-btn" id="btn-tab-compare">
      <span>📊</span> Placar
    </button>
  </nav>

  <script src="script.js"></script>
</body>
</html>
