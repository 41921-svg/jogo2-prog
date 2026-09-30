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

    // Renderiza o Logo Oficial CAMISA11
    const logoHolder = document.getElementById('welcome-brand-logo');
    if (logoHolder && typeof ClubManager !== 'undefined' && ClubManager.renderCamisa11Logo) {
      logoHolder.innerHTML = ClubManager.renderCamisa11Logo(76);
    }

    // Verifica se há save ativo para exibir o Card de Continuar e o botão rápido
    const hasSave = SaveSystem.hasSave();
    const continueBtn = document.getElementById('onboard-btn-continue');
    const activeCard = document.getElementById('welcome-active-career-card');

    if (hasSave) {
      const savedData = SaveSystem.loadGame();
      if (savedData && savedData.club) {
        if (continueBtn) continueBtn.style.display = 'block';

        if (activeCard) {
          activeCard.style.display = 'flex';
          const clubBadgeEl = document.getElementById('welcome-active-badge');
          if (clubBadgeEl && typeof ClubManager !== 'undefined') {
            clubBadgeEl.innerHTML = ClubManager.renderBadge(savedData.club, 48);
          }
          const clubNameEl = document.getElementById('welcome-active-club-name');
          if (clubNameEl) clubNameEl.textContent = savedData.club.name;

          const metaEl = document.getElementById('welcome-active-meta');
          if (metaEl) {
            const yr = savedData.season ? savedData.season.year : 2026;
            const rd = savedData.season ? savedData.season.currentRound : 1;
            const ovr = savedData.club.ovr || 70;
            metaEl.textContent = `Temporada ${yr} · Rodada ${rd} · ⭐ ${ovr} OVR`;
          }
        }
      }
    } else {
      if (continueBtn) continueBtn.style.display = 'none';
      if (activeCard) activeCard.style.display = 'none';
    }
  },

  // Alterna as etapas do Onboarding (welcome, choose, create, difficulty, start, settings)
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
    } else if (stepId === 'settings') {
      this.refreshSettingsUI();
    }
  },

  // Solicita confirmação para iniciar nova carreira caso já exista save
  promptNewCareer() {
    if (SaveSystem.hasSave()) {
      const confirmNew = confirm('Você já possui uma carreira salva. Deseja iniciar uma nova história? (Seu save anterior será substituído ao iniciar a nova temporada)');
      if (!confirmNew) return;
    }
    this.showOnboardStep('choose');
  },

  // Abre a tela de configurações (Regras 3 e 92)
  openSettings() {
    this.openModal('modal-onboarding');
    this.showOnboardStep('settings');
  },

  // Retorna para o menu principal com auto-save prévio
  returnToMainMenu() {
    if (GameEngine.hasActiveCareer()) {
      GameEngine.save();
    }
    this.openInitialScreen();
    this.showToast('Menu principal carregado.', 'info');
  },

  // Fecha a tela de configurações e retorna ao menu de boas-vindas ou ao jogo
  closeSettings() {
    if (GameEngine.hasActiveCareer()) {
      this.closeModal('modal-onboarding');
    } else {
      this.showOnboardStep('welcome');
    }
  },

  // Atualiza os controles visuais de configurações com base no estado real
  refreshSettingsUI() {
    const s = SaveSystem.loadSettings();

    // Toggle Áudio
    const audioBtn = document.getElementById('settings-audio-toggle');
    if (audioBtn) {
      const isEnabled = typeof SoundEngine !== 'undefined' ? SoundEngine.enabled : (s.soundEnabled !== false);
      audioBtn.classList.toggle('active', isEnabled);
      audioBtn.textContent = isEnabled ? 'LIGADO' : 'DESLIGADO';
    }

    // Volume Slider
    const volSlider = document.getElementById('settings-volume-slider');
    const volLabel = document.getElementById('settings-volume-label');
    if (volSlider && volLabel) {
      const vol = typeof SoundEngine !== 'undefined' ? Math.round(SoundEngine.volume * 100) : 70;
      volSlider.value = vol;
      volLabel.textContent = `${vol}%`;
    }

    // Status do Save
    const saveStatus = document.getElementById('settings-save-status');
    if (saveStatus) {
      if (SaveSystem.hasSave()) {
        const saved = SaveSystem.loadGame();
        const dateStr = saved.savedAt ? new Date(saved.savedAt).toLocaleString('pt-BR') : 'Data desconhecida';
        saveStatus.textContent = `Carreira: ${saved.club.name} · Salvo em: ${dateStr}`;
      } else {
        saveStatus.textContent = 'Nenhuma carreira salva no navegador.';
      }
    }
  },

  // Alterna som nas configurações
  toggleSoundSettings() {
    if (typeof SoundEngine !== 'undefined') {
      const state = SoundEngine.toggle();
      if (state && SoundEngine.playWhistle) {
        SoundEngine.playWhistle();
      }
    }
    this.refreshSettingsUI();
  },

  // Altera volume nas configurações
  onVolumeChange(val) {
    if (typeof SoundEngine !== 'undefined') {
      SoundEngine.setVolume(val / 100);
    }
    const volLabel = document.getElementById('settings-volume-label');
    if (volLabel) volLabel.textContent = `${val}%`;
  },

  // Altera velocidade padrão da simulação
  onSimSpeedChange(val) {
    const s = SaveSystem.loadSettings();
    s.simSpeed = Number(val);
    SaveSystem.saveSettings(s);
    this.showToast(`Velocidade de simulação ajustada para ${val}x`, 'info');
  },

  // Exporta save para download e cópia para área de transferência
  exportSaveFile() {
    const json = SaveSystem.exportSave();
    if (!json) {
      this.showToast('Nenhum save existente para exportar.', 'error');
      return;
    }

    // Copia para área de transferência se suportado
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).catch(() => {});
    }

    // Aciona download do arquivo JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camisa11_save_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Save baixado e copiado para a área de transferência!', 'gold');
  },

  // Importa save a partir de texto colado
  promptImportSave() {
    const pasted = prompt('Cole aqui o texto JSON do seu save exportado:');
    if (!pasted || !pasted.trim()) return;

    const ok = SaveSystem.importSave(pasted.trim());
    if (ok) {
      this.showToast('Save importado com sucesso! Carregando...', 'gold');
      setTimeout(() => {
        location.reload();
      }, 800);
    } else {
      this.showToast('Falha ao importar save. Verifique a formatação do arquivo.', 'error');
    }
  },

  // Apaga a carreira salva com confirmação de segurança
  deleteSaveData() {
    if (!SaveSystem.hasSave()) {
      this.showToast('Não há carreira salva para apagar.', 'info');
      return;
    }

    const conf = confirm('ATENÇÃO: Você realmente deseja apagar a carreira salva? Todos os títulos, dados e histórico serão permanentemente excluídos.');
    if (!conf) return;

    SaveSystem.deleteSave();
    if (GameEngine.state) GameEngine.state = null;
    this.refreshSettingsUI();
    this.showOnboardStep('welcome');
    this.showToast('Carreira apagada com sucesso.', 'info');
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
  chooseStateFilter: 'ALL',
  chooseSearchQuery: '',

  // Filtra clubes por divisão na tela de seleção (Regra 4)
  filterChooseClubs(divisionId) {
    this.chooseDivisionFilter = divisionId;
    const pills = document.querySelectorAll('#choose-division-pills button');
    pills.forEach(p => p.classList.toggle('active', p.dataset.div === divisionId));
    this.renderChooseClubsList();
  },

  // Filtra clubes por estado
  onClubStateFilter(stateUf) {
    this.chooseStateFilter = stateUf;
    this.renderChooseClubsList();
  },

  // Busca clubes por texto digitado
  onClubSearchInput(query) {
    this.chooseSearchQuery = query;
    this.renderChooseClubsList();
  },

  // Renderiza lista de clubes disponíveis para seleção com filtros (Regra 4)
  renderChooseClubsList() {
    const grid = document.getElementById('choose-clubs-grid');
    if (!grid) return;

    const clubs = DataProvider.searchClubs({
      division: this.chooseDivisionFilter,
      state: this.chooseStateFilter,
      query: this.chooseSearchQuery
    });

    if (clubs.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 36px 12px; color: var(--text-muted); grid-column: 1 / -1;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
          <p style="font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Nenhum clube encontrado</p>
          <p style="font-size: 0.8rem;">Tente ajustar os filtros de divisão, estado ou limpar a pesquisa.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = clubs.map(c => {
      const comp = DataProvider.getCompetition(c.division);
      const divName = comp ? comp.shortName : (c.division || 'Nacional');
      const sigla = c.sigla || c.shortName || '';
      return `
        <div class="choose-club-card" onclick="App.selectExistingClub('${c.id}')">
          <div class="choose-club-badge">${typeof ClubManager !== 'undefined' ? ClubManager.renderBadge(c, 48) : '⚽'}</div>
          <div class="choose-club-info">
            <div style="display:flex; justify-content:space-between; align-items:center; gap: 6px;">
              <h4 style="margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.name}</h4>
              <span style="font-size:0.75rem; font-weight:900; color:var(--accent); background:var(--accent-subtle); padding:2px 6px; border-radius:var(--radius-sm);">${sigla}</span>
            </div>
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

  // Prepara valores padrão para criar um clube próprio (Regra 5)
  initCreateClubDefaults() {
    this.draftClub = {
      name: 'Camisa11 Futebol Clube',
      shortName: 'Camisa11',
      sigla: 'C11',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      primaryColor: '#0f172a',
      secondaryColor: '#10b981',
      tertiaryColor: '#f8fafc',
      badgeShape: 'shield',
      badgePattern: 'solid',
      badgeSymbol: 'ball',
      division: 'brasileirao_serie_d',
      ovr: 64,
      budget: 2500000,
      reputation: 45,
      capacity: 10000
    };

    const nameInput = document.getElementById('create-club-name');
    if (nameInput) nameInput.value = this.draftClub.name;
    const shortInput = document.getElementById('create-club-shortname');
    if (shortInput) shortInput.value = this.draftClub.shortName;
    const siglaInput = document.getElementById('create-club-sigla');
    if (siglaInput) siglaInput.value = this.draftClub.sigla;
    const cityInput = document.getElementById('create-club-city');
    if (cityInput) cityInput.value = this.draftClub.city;
    const stateInput = document.getElementById('create-club-state');
    if (stateInput) stateInput.value = this.draftClub.state;

    const col1 = document.getElementById('create-color-primary');
    if (col1) col1.value = this.draftClub.primaryColor;
    const col2 = document.getElementById('create-color-secondary');
    if (col2) col2.value = this.draftClub.secondaryColor;
    const col3 = document.getElementById('create-color-tertiary');
    if (col3) col3.value = this.draftClub.tertiaryColor;

    this.renderShapeOptions();
    this.renderPatternOptions();
    this.renderSymbolOptions();
    this.updateCreateClubPreview();
  },

  // Renderiza opções interativas de modelo do escudo/emblema
  renderShapeOptions() {
    const grid = document.getElementById('create-shapes-grid');
    if (!grid || typeof ClubManager === 'undefined') return;

    const shapes = ClubManager.getShapeOptions();
    grid.innerHTML = shapes.map(s => {
      const isActive = this.draftClub && this.draftClub.badgeShape === s.id;
      const previewClub = {
        primaryColor: this.draftClub.primaryColor,
        secondaryColor: this.draftClub.secondaryColor,
        tertiaryColor: this.draftClub.tertiaryColor,
        badgeShape: s.id,
        badgePattern: this.draftClub.badgePattern,
        badgeSymbol: this.draftClub.badgeSymbol,
        sigla: this.draftClub.sigla
      };
      return `
        <div class="badge-option-btn ${isActive ? 'active' : ''}" onclick="App.setCreateBadgeShape('${s.id}')" title="${s.name}">
          ${ClubManager.renderBadge(previewClub, 38)}
          <span>${s.name}</span>
        </div>
      `;
    }).join('');
  },

  // Renderiza opções interativas de padrão do emblema (Patterns)
  renderPatternOptions() {
    const grid = document.getElementById('create-patterns-grid');
    if (!grid || typeof ClubManager === 'undefined') return;

    const patterns = ClubManager.getPatternOptions();
    grid.innerHTML = patterns.map(p => {
      const isActive = this.draftClub && this.draftClub.badgePattern === p.id;
      const previewClub = {
        primaryColor: this.draftClub.primaryColor,
        secondaryColor: this.draftClub.secondaryColor,
        tertiaryColor: this.draftClub.tertiaryColor,
        badgeShape: this.draftClub.badgeShape,
        badgePattern: p.id,
        badgeSymbol: this.draftClub.badgeSymbol,
        sigla: this.draftClub.sigla
      };
      return `
        <div class="badge-option-btn ${isActive ? 'active' : ''}" onclick="App.setCreateBadgePattern('${p.id}')" title="${p.name}">
          ${ClubManager.renderBadge(previewClub, 38)}
          <span>${p.name}</span>
        </div>
      `;
    }).join('');
  },

  // Renderiza opções interativas de símbolo do escudo/emblema
  renderSymbolOptions() {
    const grid = document.getElementById('create-symbols-grid');
    if (!grid || typeof ClubManager === 'undefined') return;

    const symbols = ClubManager.getSymbolOptions();
    grid.innerHTML = symbols.map(sym => {
      const isActive = this.draftClub && this.draftClub.badgeSymbol === sym.id;
      const previewClub = {
        primaryColor: this.draftClub.primaryColor,
        secondaryColor: this.draftClub.secondaryColor,
        tertiaryColor: this.draftClub.tertiaryColor,
        badgeShape: this.draftClub.badgeShape,
        badgePattern: this.draftClub.badgePattern,
        badgeSymbol: sym.id,
        sigla: this.draftClub.sigla
      };
      return `
        <div class="badge-option-btn ${isActive ? 'active' : ''}" onclick="App.setCreateBadgeSymbol('${sym.id}')" title="${sym.name}">
          ${ClubManager.renderBadge(previewClub, 38)}
          <span>${sym.name}</span>
        </div>
      `;
    }).join('');
  },

  setCreateBadgeShape(shape) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.badgeShape = shape;
    this.renderShapeOptions();
    this.renderPatternOptions();
    this.renderSymbolOptions();
    this.updateCreateClubPreview();
  },

  setCreateBadgePattern(pattern) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.badgePattern = pattern;
    this.renderPatternOptions();
    this.renderShapeOptions();
    this.renderSymbolOptions();
    this.updateCreateClubPreview();
  },

  setCreateBadgeSymbol(symbol) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.badgeSymbol = symbol;
    this.renderSymbolOptions();
    this.updateCreateClubPreview();
  },

  setCreateColor(type, color) {
    if (!this.draftClub) this.initCreateClubDefaults();
    if (type === 'primary') {
      this.draftClub.primaryColor = color;
      const el = document.getElementById('create-color-primary');
      if (el) el.value = color;
    } else if (type === 'secondary') {
      this.draftClub.secondaryColor = color;
      const el = document.getElementById('create-color-secondary');
      if (el) el.value = color;
    } else if (type === 'tertiary') {
      this.draftClub.tertiaryColor = color;
      const el = document.getElementById('create-color-tertiary');
      if (el) el.value = color;
    }

    this.renderShapeOptions();
    this.renderPatternOptions();
    this.renderSymbolOptions();
    this.updateCreateClubPreview();
  },

  setCreateDivision(division) {
    if (!this.draftClub) this.initCreateClubDefaults();
    this.draftClub.division = division;

    let defOvr = 64;
    let defRep = 45;
    let defBudget = 2500000;
    let defCap = 10000;

    if (division === 'brasileirao_serie_a') {
      defOvr = 76;
      defRep = 75;
      defBudget = 12000000;
      defCap = 32000;
    } else if (division === 'brasileirao_serie_b') {
      defOvr = 72;
      defRep = 65;
      defBudget = 6500000;
      defCap = 20000;
    } else if (division === 'brasileirao_serie_c') {
      defOvr = 68;
      defRep = 55;
      defBudget = 4000000;
      defCap = 14000;
    }

    this.draftClub.ovr = defOvr;
    this.draftClub.budget = defBudget;
    this.draftClub.reputation = defRep;
    this.draftClub.capacity = defCap;

    const cards = document.querySelectorAll('#create-divisions-grid .starting-div-card');
    cards.forEach(c => {
      c.classList.toggle('active', c.dataset.div === division);
    });

    this.updateCreateClubPreview();
  },

  updateCreateClubPreview() {
    if (!this.draftClub) return;

    const nameInput = document.getElementById('create-club-name');
    const shortInput = document.getElementById('create-club-shortname');
    const siglaInput = document.getElementById('create-club-sigla');
    const cityInput = document.getElementById('create-club-city');
    const stateInput = document.getElementById('create-club-state');

    if (nameInput && nameInput.value.trim()) this.draftClub.name = nameInput.value.trim();
    if (shortInput && shortInput.value.trim()) this.draftClub.shortName = shortInput.value.trim();
    if (siglaInput && siglaInput.value.trim()) this.draftClub.sigla = siglaInput.value.trim().toUpperCase().slice(0, 4);
    if (cityInput && cityInput.value.trim()) this.draftClub.city = cityInput.value.trim();
    if (stateInput) this.draftClub.state = stateInput.value;

    const preview = document.getElementById('create-badge-preview');
    if (preview && typeof ClubManager !== 'undefined') {
      preview.innerHTML = ClubManager.renderBadge(this.draftClub, 88);
    }

    const prevName = document.getElementById('create-preview-name');
    if (prevName) prevName.textContent = this.draftClub.name;

    const prevMeta = document.getElementById('create-preview-meta');
    if (prevMeta) prevMeta.textContent = `${this.draftClub.city} - ${this.draftClub.state} · ${this.draftClub.country}`;

    const divComp = DataProvider.getCompetition(this.draftClub.division);
    const divShort = divComp ? divComp.shortName : 'Série D';

    const prevDiv = document.getElementById('create-preview-div');
    if (prevDiv) prevDiv.textContent = divShort;

    const prevOvr = document.getElementById('create-preview-ovr');
    if (prevOvr) prevOvr.textContent = `⭐ ${this.draftClub.ovr} OVR`;

    const prevBud = document.getElementById('create-preview-budget');
    if (prevBud) prevBud.textContent = `💰 ${this.formatCurrency(this.draftClub.budget)}`;

    const prevStad = document.getElementById('create-preview-stadium');
    if (prevStad) prevStad.textContent = `🏟️ Arena ${this.draftClub.shortName}`;

    const autoStad = document.getElementById('auto-gen-stadium');
    if (autoStad) {
      const cap = this.draftClub.capacity || 10000;
      autoStad.textContent = `Arena ${this.draftClub.shortName} (${cap.toLocaleString('pt-BR')} lug.)`;
    }

    const autoCal = document.getElementById('auto-gen-calendar');
    if (autoCal) {
      autoCal.textContent = `38 rodadas na ${divShort} + Estadual ${this.draftClub.state}`;
    }
  },

  submitCreatedClub() {
    const nameInput = document.getElementById('create-club-name');
    const shortInput = document.getElementById('create-club-shortname');
    const siglaInput = document.getElementById('create-club-sigla');
    const cityInput = document.getElementById('create-club-city');

    if (!nameInput || !nameInput.value.trim()) {
      this.showToast('Por favor, digite o nome do seu clube.', 'error');
      return;
    }
    if (!shortInput || !shortInput.value.trim()) {
      this.showToast('Por favor, informe o nome curto do clube.', 'error');
      return;
    }
    if (!siglaInput || !siglaInput.value.trim()) {
      this.showToast('Por favor, informe a sigla (3 ou 4 letras).', 'error');
      return;
    }
    if (!cityInput || !cityInput.value.trim()) {
      this.showToast('Por favor, informe a cidade sede do clube.', 'error');
      return;
    }

    this.updateCreateClubPreview();
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
