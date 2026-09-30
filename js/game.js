/**
 * CAMISA11 — "Seu clube. Sua história."
 * js/game.js — GAME ENGINE (Núcleo do Motor do Jogo)
 * 
 * Orquestrador central que desacopla as regras do jogo e a simulação da interface visual.
 * Emite eventos padronizados para atualização da UI.
 */

const _getSaveSystem = () => {
  if (typeof SaveSystem !== 'undefined') return SaveSystem;
  if (typeof require !== 'undefined') {
    try { return require('./save.js'); } catch (e) { return null; }
  }
  return null;
};

const GameEngine = {
  state: null,
  listeners: {},

  // Inicializa o motor do jogo
  async init() {
    await DataProvider.init();

    // Tenta carregar carreira salva
    const saveSys = _getSaveSystem();
    const saved = saveSys ? saveSys.loadGame() : null;
    if (saved && saved.club) {
      this.state = saved;
      this.emit('careerLoaded', this.state);
      return true;
    }

    return false;
  },

  // Sistema de Eventos (Event Bus)
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  },

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`GameEngine.emit: Erro no listener do evento '${event}':`, err);
      }
    });
  },

  // Verifica se há carreira ativa na memória ou save
  hasActiveCareer() {
    return Boolean(this.state && this.state.club && this.state.club.id);
  },

  // Inicia uma nova carreira com clube escolhido ou criado
  startNewCareer(clubIdOrCustomData, options = {}) {
    let club = null;

    if (typeof clubIdOrCustomData === 'string') {
      // Clube existente selecionado
      club = DataProvider.getClub(clubIdOrCustomData);
      if (!club) {
        throw new Error(`Clube não encontrado para o ID: ${clubIdOrCustomData}`);
      }
    } else if (typeof clubIdOrCustomData === 'object') {
      // Clube personalizado criado pelo usuário
      club = DataProvider.createClub(clubIdOrCustomData);
    } else {
      throw new Error('Parâmetro de clube inválido para iniciar carreira.');
    }

    // Carrega ou gera o elenco inicial
    const squad = DataProvider.getTeamPlayers(club.id);

    // Estrutura de dados da Carreira
    const competitionId = options.competitionId || club.division || 'brasileirao_serie_a';
    const comp = DataProvider.getCompetition(competitionId);

    // Ajusta o orçamento inicial de acordo com o desafio selecionado
    const difficultyMultiplier = options.difficulty === 'easy' ? 1.4 : options.difficulty === 'hard' ? 0.6 : 1.0;
    const initialBudget = Math.round((club.budget || 5000000) * difficultyMultiplier);

    this.state = {
      version: 1,
      createdAt: new Date().toISOString(),
      club: Object.assign({}, club, { budget: initialBudget }),
      difficulty: options.difficulty || 'normal',
      manager: {
        name: options.managerName || 'Treinador Camisa11',
        nationality: 'Brasil',
        reputation: options.difficulty === 'easy' ? 70 : options.difficulty === 'hard' ? 50 : 60,
        titles: 0,
        seasons: 1,
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0
      },
      season: {
        year: 2026,
        currentRound: 1,
        totalRounds: comp ? comp.rounds : 38,
        competitionId: competitionId,
        competitionName: comp ? comp.name : 'Campeonato Brasileiro',
        isFinished: false
      },
      squad: squad,
      finances: {
        budget: initialBudget,
        wageBudget: club.wageBudget || Math.round(initialBudget * 0.25),
        revenueMatchday: 0,
        expensesWages: 0
      },
      tactics: {
        formation: '4-3-3',
        mentality: 'EQUILIBRADA',
        pressing: 'NORMAL',
        tempo: 'NORMAL',
        defensiveLine: 'NORMAL'
      },
      standings: [],
      fixtures: [],
      history: []
    };

    // Gera tabela e rodadas iniciais para a competição
    this.setupCompetitionSeason(competitionId);

    // Salva imediatamente a carreira inicializada
    this.save();
    this.emit('careerStarted', this.state);

    return this.state;
  },

  // Configura a temporada e participantes da liga
  setupCompetitionSeason(competitionId) {
    const comp = DataProvider.getCompetition(competitionId);
    let leagueClubs = DataProvider.getLeagueTeams(competitionId);

    // Garante que o clube do jogador esteja entre os participantes
    if (!leagueClubs.find(c => c.id === this.state.club.id)) {
      leagueClubs = [this.state.club, ...leagueClubs];
    }

    // Se faltarem clubes para atingir o número configurado na competição, completa dinamicamente
    const needed = (comp ? comp.teamsCount : 20) - leagueClubs.length;
    for (let i = 0; i < needed; i++) {
      const dummyId = `gen_club_${competitionId}_${i + 1}`;
      const dummyClub = DataProvider.createClub({
        id: dummyId,
        name: `Clube ${i + 1}`,
        shortName: `C${i + 1}`,
        division: competitionId,
        ovr: Math.max(60, this.state.club.ovr + Math.floor(Math.random() * 9) - 4),
        budget: 4000000
      });
      leagueClubs.push(dummyClub);
    }

    // Inicializa a Tabela de Classificação
    this.state.standings = leagueClubs.map(c => ({
      clubId: c.id,
      name: c.name,
      shortName: c.shortName,
      ovr: c.ovr,
      primaryColor: c.primaryColor,
      secondaryColor: c.secondaryColor,
      badgeShape: c.badgeShape,
      badgeSymbol: c.badgeSymbol,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    }));

    // Gera o Calendário de Rodadas (Round-Robin)
    this.state.fixtures = this.generateRoundRobinFixtures(leagueClubs);
  },

  // Gerador de Calendário Algorítmico (Turno e Returno)
  generateRoundRobinFixtures(clubs) {
    const list = [...clubs];
    if (list.length % 2 !== 0) {
      list.push({ id: 'bye', name: 'Folga' });
    }

    const n = list.length;
    const rounds = (n - 1) * 2; // Turno e Returno
    const half = n / 2;
    const allFixtures = [];

    // Turno
    for (let round = 0; round < n - 1; round++) {
      const matches = [];
      for (let i = 0; i < half; i++) {
        const home = list[i];
        const away = list[n - 1 - i];
        if (home.id !== 'bye' && away.id !== 'bye') {
          matches.push({
            homeId: home.id,
            awayId: away.id,
            played: false,
            homeGoals: null,
            awayGoals: null
          });
        }
      }
      allFixtures.push({ round: round + 1, matches });
      // Rotação dos times mantendo o primeiro fixo
      const temp = list[n - 1];
      for (let j = n - 1; j > 1; j--) {
        list[j] = list[j - 1];
      }
      list[1] = temp;
    }

    // Returno (inverte mandos de campo)
    for (let round = 0; round < n - 1; round++) {
      const returnMatches = allFixtures[round].matches.map(m => ({
        homeId: m.awayId,
        awayId: m.homeId,
        played: false,
        homeGoals: null,
        awayGoals: null
      }));
      allFixtures.push({ round: n - 1 + round + 1, matches: returnMatches });
    }

    return allFixtures;
  },

  // Obtém o próximo confronto do clube do jogador
  getNextMatch() {
    if (!this.state || !this.state.fixtures) return null;
    const curRound = this.state.season.currentRound;
    const roundData = this.state.fixtures.find(f => f.round === curRound);
    if (!roundData) return null;

    const userMatch = roundData.matches.find(
      m => m.homeId === this.state.club.id || m.awayId === this.state.club.id
    );

    if (!userMatch) return null;

    const homeClub = DataProvider.getClub(userMatch.homeId) || this.state.club;
    const awayClub = DataProvider.getClub(userMatch.awayId) || this.state.club;

    return {
      round: curRound,
      match: userMatch,
      homeClub,
      awayClub,
      isUserHome: userMatch.homeId === this.state.club.id
    };
  },

  // Salva o estado no LocalStorage
  save() {
    if (this.state) {
      const saveSys = _getSaveSystem();
      if (saveSys) saveSys.saveGame(this.state);
      this.emit('saved', this.state);
    }
  },

  // Exclui a carreira atual
  resetCareer() {
    const saveSys = _getSaveSystem();
    if (saveSys) saveSys.deleteSave();
    this.state = null;
    this.emit('careerReset');
  }
};

// Exporta para Node.js (testes) ou Window (Navegador)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
}
