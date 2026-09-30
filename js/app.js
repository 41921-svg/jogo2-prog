/**
 * CAMISA11 — "Seu clube. Sua história."
 * js/app.js — APPLICATION CONTROLLER & INTERFACE MANAGER
 * 
 * Gerencia a navegação entre as 8 telas principais, orquestra modais,
 * toasts, onboarding inicial e vincula eventos ao Game Engine.
 */

const App = {
  currentTab: 'dashboard',
  draftClub: null,
  selectedExistingClub: null,
  selectedDifficulty: 'normal',

  // Inicialização Geral da Aplicação
  async init() {
    // 1. Inicializa o sintetizador de som se existir
    if (typeof SoundEngine !== 'undefined' && SoundEngine.init) {
      SoundEngine.init();
    }

    // 2. Inicializa o GameEngine e DataProvider
    const hasLoaded = await GameEngine.init();

    // 3. Conecta eventos do GameEngine à UI
    this.bindEngineEvents();

    // 4. Se houver save válido, entra diretamente no Dashboard; caso contrário, abre tela inicial
    if (hasLoaded && GameEngine.hasActiveCareer()) {
      this.onCareerReady();
    } else {
      this.openInitialScreen();
    }

    // 5. Configura atalhos e listeners de interface
    this.setupListeners();

    // 6. Auto-save periódico a cada 20 segundos se houver carreira ativa
    setInterval(() => {
      if (GameEngine.hasActiveCareer()) {
        GameEngine.save();
      }
    }, 20000);
  },

  // Vincula os eventos do motor do jogo às atualizações de interface
  bindEngineEvents() {
    GameEngine.on('careerStarted', (state) => {
      this.onCareerReady();
      this.showToast(`Bem-vindo ao ${state.club.name}! Sua jornada começa agora.`, 'gold');
    });

    GameEngine.on('careerLoaded', (state) => {
      this.updateHeader();
      this.renderCurrentTab();
    });

    GameEngine.on('saved', () => {
      // Notificação sutil se necessário
    });

    GameEngine.on('careerReset', () => {
      this.openInitialScreen();
      this.showToast('Carreira reiniciada com sucesso.', 'info');
    });
  },

  // Chamado quando o clube e a carreira estão prontos e carregados
  onCareerReady() {
    this.closeModal('modal-onboarding');
    this.updateHeader();
    this.switchTab('dashboard');
  },

  // Abre a Tela Inicial do Jogo (Welcome Screen)
  openInitialScreen() {
    this.openModal('modal-onboarding');
    this.showOnboardStep('welcome');

    // Verifica se há save para habilitar o botão Continuar
    const continueBtn = document.getElementById('onboard-btn-continue');
    if (continueBtn) {
      continueBtn.style.display = SaveSystem.hasSave() ? 'block' : 'none';
    }
  },

  // Alterna as etapas do Onboarding (welcome, choose_club, create_club, difficulty, start)
  showOnboardStep(stepId) {
    const steps = ['welcome', 'choose', 'create', 'difficulty', 'start', 'settings'];
    steps.forEach(s => {
      const el = document.getElementById(`onboard-step-${s}`);
      if (el) el.style.display = 'none';
    });

    const activeEl = document.getElementById(`onboard-step-${stepId}`);
    if (activeEl) {
      activeEl.style.display = 'block';
    }

    if (stepId === 'choose') {
      this.renderChooseClubsList();
    } else if (stepId === 'create') {
      this.initCreateClubDefaults();
    }
  },

  // Alterna entre as 8 Abas Principais (Regra 60)
  switchTab(tabId) {
    const validTabs = ['dashboard', 'squad', 'market', 'matches', 'competitions', 'tactics', 'ranking', 'career'];
    if (!validTabs.includes(tabId)) tabId = 'dashboard';

    this.currentTab = tabId;

    // Atualiza classes ativas na Sidebar Desktop
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Atualiza classes ativas na Barra Mobile
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Alterna a exibição das seções
    validTabs.forEach(t => {
      const pane = document.getElementById(`pane-${t}`);
      if (pane) {
        pane.classList.toggle('active', t === tabId);
      }
    });

    // Renderiza o conteúdo específico da aba ativa
    this.renderCurrentTab();

    // Rola para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Renderiza a aba atual
  renderCurrentTab() {
    if (!GameEngine.hasActiveCareer()) return;

    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'squad':
        if (typeof SquadView !== 'undefined' && SquadView.render) {
          SquadView.render();
        }
        break;
      case 'matches':
        this.renderMatchesTab();
        break;
      case 'competitions':
        this.renderCompetitionsTab();
        break;
      case 'tactics':
        this.renderTacticsTab();
        break;
      case 'market':
        if (typeof MarketView !== 'undefined' && MarketView.render) {
          MarketView.render();
        }
        break;
      case 'ranking':
        this.renderRankingTab();
        break;
      case 'career':
        this.renderCareerTab();
        break;
    }
  },

  // Atualiza as informações do Top Bar
  updateHeader() {
    if (!GameEngine.hasActiveCareer()) return;
    const club = GameEngine.state.club;
    const season = GameEngine.state.season;
    const finances = GameEngine.state.finances;

    // Escudo
    const badgeEl = document.getElementById('top-badge-container');
    if (badgeEl && typeof ClubManager !== 'undefined') {
      badgeEl.innerHTML = ClubManager.renderBadge(club, 36);
    }

    const brandIconEl = document.getElementById('brand-badge-icon');
    if (brandIconEl && typeof ClubManager !== 'undefined') {
      brandIconEl.innerHTML = ClubManager.renderBadge(club, 32);
    }

    // Nome
    const nameEl = document.getElementById('top-club-name');
    if (nameEl) nameEl.textContent = club.name;

    const brandNameEl = document.getElementById('brand-club-name');
    if (brandNameEl) brandNameEl.textContent = club.name;

    // Temporada
    const seasonEl = document.getElementById('top-season');
    if (seasonEl) seasonEl.textContent = `📅 Temporada ${season.year}`;

    // Orçamento Formatado
    const budgetEl = document.getElementById('top-budget');
    if (budgetEl) {
      budgetEl.textContent = this.formatCurrency(finances.budget);
    }

    // Força (OVR)
    const ovrEl = document.getElementById('top-ovr');
    if (ovrEl) {
      ovrEl.textContent = `⭐ ${club.ovr} OVR`;
    }
  },

  // Renderiza a tela de Dashboard (Início)
  renderDashboard() {
    const state = GameEngine.state;
    if (!state) return;

    const nextMatch = GameEngine.getNextMatch();
    const heroCard = document.getElementById('dash-next-match-card');

    if (heroCard && nextMatch) {
      const compTag = document.getElementById('dash-match-round-text');
      if (compTag) {
        compTag.textContent = `🏆 ${state.season.competitionName.toUpperCase()} · RODADA ${nextMatch.round} DE ${state.season.totalRounds}`;
      }

      // Mandante
      const homeName = document.getElementById('dash-home-name');
      if (homeName) homeName.textContent = nextMatch.homeClub.name;
      const homeOvr = document.getElementById('dash-home-ovr');
      if (homeOvr) homeOvr.textContent = `${nextMatch.homeClub.ovr} OVR`;
      const homeBadge = document.getElementById('dash-home-badge');
      if (homeBadge && typeof ClubManager !== 'undefined') {
        homeBadge.innerHTML = ClubManager.renderBadge(nextMatch.homeClub, 44);
      }

      // Visitante
      const awayName = document.getElementById('dash-away-name');
      if (awayName) awayName.textContent = nextMatch.awayClub.name;
      const awayOvr = document.getElementById('dash-away-ovr');
      if (awayOvr) awayOvr.textContent = `${nextMatch.awayClub.ovr} OVR`;
      const awayBadge = document.getElementById('dash-away-badge');
      if (awayBadge && typeof ClubManager !== 'undefined') {
        awayBadge.innerHTML = ClubManager.renderBadge(nextMatch.awayClub, 44);
      }
    }

    // Mini Tabela de Classificação
    this.renderMiniTable();
  },

  // Renderiza a mini-tabela no Dashboard
  renderMiniTable() {
    const tbody = document.getElementById('dash-mini-table-body');
    if (!tbody || !GameEngine.state || !GameEngine.state.standings) return;

    const standings = [...GameEngine.state.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const topList = standings.slice(0, 5);
    const userClubId = GameEngine.state.club.id;

    tbody.innerHTML = topList.map((row, idx) => {
      const isUser = row.clubId === userClubId;
      return `
        <tr class="${isUser ? 'highlight-user' : ''}">
          <td><strong>${idx + 1}º</strong></td>
          <td>${row.name}</td>
          <td><strong>${row.points}</strong></td>
          <td>${row.played}</td>
          <td>${row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference}</td>
        </tr>
      `;
    }).join('');
  },

  // Renderiza a aba de Partidas
  renderMatchesTab() {
    const state = GameEngine.state;
    if (!state) return;
    const nextMatch = GameEngine.getNextMatch();
    if (!nextMatch) return;

    const titleEl = document.getElementById('matches-comp-title');
    if (titleEl) {
      titleEl.textContent = `${state.season.competitionName} · Rodada ${nextMatch.round} de ${state.season.totalRounds}`;
    }

    const hName = document.getElementById('matches-home-name');
    if (hName) hName.textContent = nextMatch.homeClub.name;
    const hOvr = document.getElementById('matches-home-ovr');
    if (hOvr) hOvr.textContent = `${nextMatch.homeClub.ovr} OVR`;
    const hBadge = document.getElementById('matches-home-badge');
    if (hBadge && typeof ClubManager !== 'undefined') {
      hBadge.innerHTML = ClubManager.renderBadge(nextMatch.homeClub, 44);
    }

    const aName = document.getElementById('matches-away-name');
    if (aName) aName.textContent = nextMatch.awayClub.name;
    const aOvr = document.getElementById('matches-away-ovr');
    if (aOvr) aOvr.textContent = `${nextMatch.awayClub.ovr} OVR`;
    const aBadge = document.getElementById('matches-away-badge');
    if (aBadge && typeof ClubManager !== 'undefined') {
      aBadge.innerHTML = ClubManager.renderBadge(nextMatch.awayClub, 44);
    }
  },

  // Renderiza a aba de Competições e Tabela Oficial
  renderCompetitionsTab() {
    const tbody = document.getElementById('standings-table-body');
    if (!tbody || !GameEngine.state || !GameEngine.state.standings) return;

    const standings = [...GameEngine.state.standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const userClubId = GameEngine.state.club.id;
    tbody.innerHTML = standings.map((row, idx) => {
      const isUser = row.clubId === userClubId;
      return `
        <tr class="${isUser ? 'highlight-user' : ''}">
          <td><strong>${idx + 1}</strong></td>
          <td style="font-weight: 700;">${row.name}</td>
          <td><strong>${row.points}</strong></td>
          <td>${row.played}</td>
          <td>${row.won}</td>
          <td>${row.drawn}</td>
          <td>${row.lost}</td>
          <td>${row.goalsFor}</td>
          <td>${row.goalsAgainst}</td>
          <td>${row.goalDifference > 0 ? '+' + row.goalDifference : row.goalDifference}</td>
        </tr>
      `;
    }).join('');
  },

  // Renderiza a aba de Táticas
  renderTacticsTab() {
    if (typeof TacticsManager !== 'undefined' && TacticsManager.render) {
      TacticsManager.render();
    }
  },

  // Renderiza a aba de Ranking Global
  renderRankingTab() {
    const tbody = document.getElementById('ranking-table-body');
    if (!tbody) return;

    const allClubs = DataProvider.getAllClubs().sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
    tbody.innerHTML = allClubs.slice(0, 15).map((club, idx) => `
      <tr>
        <td><strong>${idx + 1}º</strong></td>
        <td>${club.name}</td>
        <td>${club.division.replace('brasileirao_', '').replace('_', ' ').toUpperCase()}</td>
        <td>⭐ ${club.ovr}</td>
        <td><strong>${club.reputation}</strong></td>
      </tr>
    `).join('');
  },

  // Renderiza a aba de Carreira
  renderCareerTab() {
    const state = GameEngine.state;
    if (!state) return;
    const m = state.manager;

    const nameEl = document.getElementById('career-mgr-name');
    if (nameEl) nameEl.textContent = m.name;

    const repEl = document.getElementById('career-mgr-rep');
    if (repEl) repEl.textContent = `${m.reputation}/100`;

    const titlesEl = document.getElementById('career-mgr-titles');
    if (titlesEl) titlesEl.textContent = m.titles;

    const matchesEl = document.getElementById('career-mgr-matches');
    if (matchesEl) matchesEl.textContent = m.matches;
  },

  chooseDivisionFilter: 'ALL',
  chooseSearchQuery: '',

  // Filtra clubes por divisão na tela inicial
  filterChooseClubs(divisionId) {
    this.chooseDivisionFilter = divisionId;
    const pills = document.querySelectorAll('#choose-division-pills button');
    pills.forEach(p => p.classList.toggle('active', p.dataset.div === divisionId));
    this.renderChooseClubsList();
  },

  // Busca clubes por texto digitado
  onClubSearchInput(query) {
    this.chooseSearchQuery = query;
    this.renderChooseClubsList();
  },

  // Renderiza lista de clubes disponíveis para seleção com filtros
  renderChooseClubsList() {
    const grid = document.getElementById('choose-clubs-grid');
    if (!grid) return;

    const clubs = DataProvider.searchClubs({
      division: this.chooseDivisionFilter,
      query: this.chooseSearchQuery
    });

    if (clubs.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted); grid-column: 1 / -1;">
          <p>Nenhum clube encontrado para o filtro aplicado.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = clubs.map(c => {
      const comp = DataProvider.getCompetition(c.division);
      const divName = comp ? comp.shortName : 'Nacional';
      return `
        <div class="choose-club-card" onclick="App.selectExistingClub('${c.id}')">
          <div class="choose-club-badge">${typeof ClubManager !== 'undefined' ? ClubManager.renderBadge(c, 44) : '⚽'}</div>
          <div class="choose-club-info">
            <h4>${c.name}</h4>
            <p>${c.city} - ${c.state} · 🏟️ ${c.stadium || 'Estádio'}</p>
            <div class="choose-club-specs">
              <span class="div-tag">${divName}</span>
              <span class="ovr-tag">⭐ ${c.ovr} OVR</span>
              <span style="color: var(--text-muted);">Rep: ${c.reputation}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Seleciona um clube existente
  selectExistingClub(clubId) {
    this.selectedExistingClub = clubId;
    this.draftClub = null;
    this.showOnboardStep('difficulty');
  },

  // Prepara valores padrão para criar um clube próprio
  initCreateClubDefaults() {
    this.draftClub = {
      name: 'CAMISA11 FC',
      shortName: 'C11',
      city: 'São Paulo',
      state: 'SP',
      primaryColor: '#0f172a',
      secondaryColor: '#10b981',
      badgeShape: 'shield',
      badgeSymbol: 'ball',
      division: 'brasileirao_serie_d'
    };
    this.updateCreateClubPreview();
  },

  // Atualiza pré-visualização do escudo criado
  updateCreateClubPreview() {
    const nameInput = document.getElementById('create-club-name');
    const shortInput = document.getElementById('create-club-short');
    const cityInput = document.getElementById('create-club-city');

    if (nameInput) this.draftClub.name = nameInput.value || 'CAMISA11 FC';
    if (shortInput) this.draftClub.shortName = shortInput.value || 'C11';
    if (cityInput) this.draftClub.city = cityInput.value || 'São Paulo';

    const preview = document.getElementById('create-badge-preview');
    if (preview && typeof ClubManager !== 'undefined') {
      preview.innerHTML = ClubManager.renderBadge(this.draftClub, 90);
    }
  },

  setCreateBadgeShape(shape) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.badgeShape = shape;
    this.updateCreateClubPreview();
  },

  setCreateBadgeSymbol(symbol) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.badgeSymbol = symbol;
    this.updateCreateClubPreview();
  },

  setCreateColor(type, color) {
    if (!this.draftClub) this.initCreateClubDefaults();
    if (type === 'primary') this.draftClub.primaryColor = color;
    if (type === 'secondary') this.draftClub.secondaryColor = color;
    this.updateCreateClubPreview();
  },

  submitCreatedClub() {
    this.selectedExistingClub = null;
    this.showOnboardStep('difficulty');
  },

  // Seleciona nível de dificuldade
  selectDifficulty(diff) {
    this.selectedDifficulty = diff;
    this.showOnboardStep('start');
    this.renderStartSummary();
  },

  // Mostra o resumo antes de dar o pontapé inicial
  renderStartSummary() {
    let club = null;
    if (this.selectedExistingClub) {
      club = DataProvider.getClub(this.selectedExistingClub);
    } else if (this.draftClub) {
      club = this.draftClub;
    }

    if (!club) return;

    const nameEl = document.getElementById('start-summary-club-name');
    if (nameEl) nameEl.textContent = club.name;

    const badgeEl = document.getElementById('start-summary-badge');
    if (badgeEl && typeof ClubManager !== 'undefined') {
      badgeEl.innerHTML = ClubManager.renderBadge(club, 64);
    }

    const budgetEl = document.getElementById('start-summary-budget');
    if (budgetEl) {
      const mult = this.selectedDifficulty === 'easy' ? 1.4 : this.selectedDifficulty === 'hard' ? 0.6 : 1.0;
      budgetEl.textContent = this.formatCurrency((club.budget || 5000000) * mult);
    }
  },

  // Lança a carreira
  launchCareer() {
    const target = this.selectedExistingClub || this.draftClub;
    GameEngine.startNewCareer(target, {
      difficulty: this.selectedDifficulty
    });
  },

  // --------------------------------------------------------------------------
  // MODAIS E TOASTS
  // --------------------------------------------------------------------------

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'gold' ? 'toast-gold' : ''}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  formatCurrency(val) {
    if (val === null || val === undefined) return 'R$ 0';
    return `R$ ${Number(val).toLocaleString('pt-BR')}`;
  },

  setupListeners() {
    // Tecla ESC fecha modais abertos
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
        modals.forEach(m => {
          if (m.id !== 'modal-onboarding' || GameEngine.hasActiveCareer()) {
            m.classList.add('hidden');
          }
        });
      }
    });

    // Botão de recomeçar
    const resetBtn = document.getElementById('btn-reset-career');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja recomeçar sua carreira? Todo o progresso salvo será apagado.')) {
          GameEngine.resetCareer();
        }
      });
    }
  }
};

// Aliases globais para compatibilidade com templates inline
window.App = App;
window.Game = App;

// Inicializa quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Exporta para Node.js (testes)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
