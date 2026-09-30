/**
 * CAMISA11 — Football Career & Manager
 * season.js — Calendário de 18 Rodadas, Simulação de Liga, Tabela de Classificação e Evolução de Temporadas
 */

const SeasonManager = {
  currentSeasonYear: 2026,
  currentRound: 1,
  totalRounds: 18,
  fixtures: [],
  standings: [],
  seasonFinished: false,

  // Inicializa o campeonato com os 10 clubes da divisão atual
  initSeason(divisionClubs, userClubId, seasonYear = 2026) {
    this.currentSeasonYear = seasonYear;
    this.currentRound = 1;
    this.seasonFinished = false;

    // Inicializa a tabela de classificação
    this.standings = divisionClubs.map(c => ({
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
      goalDiff: 0,
      points: 0
    }));

    // Gera o calendário oficial de 18 rodadas (Turno e Returno com algoritmo Round-Robin)
    this.fixtures = this.generateRoundRobinSchedule(divisionClubs);
  },

  // Algoritmo Round-Robin para gerar 18 rodadas perfeitas para 10 clubes
  generateRoundRobinSchedule(clubs) {
    const list = [...clubs];
    const n = list.length; // 10
    const rounds = [];
    const numRoundsTurno = n - 1; // 9 rodadas

    // Turno (Rodadas 1 a 9)
    for (let r = 0; r < numRoundsTurno; r++) {
      const roundMatches = [];
      for (let i = 0; i < n / 2; i++) {
        const homeIdx = (r + i) % (n - 1);
        let awayIdx = (n - 1 - i + r) % (n - 1);
        if (i === 0) awayIdx = n - 1;

        // Alterna mando de campo para equilíbrio
        const home = (r % 2 === 0) ? list[homeIdx] : list[awayIdx];
        const away = (r % 2 === 0) ? list[awayIdx] : list[homeIdx];

        roundMatches.push({
          homeId: home.id,
          homeName: home.name,
          homeOvr: home.ovr,
          homeColor: home.primaryColor,
          awayId: away.id,
          awayName: away.name,
          awayOvr: away.ovr,
          awayColor: away.primaryColor,
          homeScore: null,
          awayScore: null,
          played: false
        });
      }
      rounds.push(roundMatches);
    }

    // Returno (Rodadas 10 a 18) com mandos invertidos
    for (let r = 0; r < numRoundsTurno; r++) {
      const returnoMatches = rounds[r].map(m => ({
        homeId: m.awayId,
        homeName: m.awayName,
        homeOvr: m.awayOvr,
        homeColor: m.awayColor,
        awayId: m.homeId,
        awayName: m.homeName,
        awayOvr: m.homeOvr,
        awayColor: m.homeColor,
        homeScore: null,
        awayScore: null,
        played: false
      }));
      rounds.push(returnoMatches);
    }

    return rounds;
  },

  // Retorna o confronto do clube do usuário na rodada atual
  getUserMatch(roundNum, userClubId) {
    if (roundNum > this.totalRounds) return null;
    const roundMatches = this.fixtures[roundNum - 1];
    if (!roundMatches) return null;
    return roundMatches.find(m => m.homeId === userClubId || m.awayId === userClubId);
  },

  // Simula todos os outros jogos da rodada que não envolvem o jogador
  simulateRestOfRound(roundNum, userClubId) {
    const roundMatches = this.fixtures[roundNum - 1];
    if (!roundMatches) return;

    roundMatches.forEach(match => {
      // Ignora o jogo do jogador (já jogado ou simulado pelo motor)
      if (match.played) return;
      if (match.homeId === userClubId || match.awayId === userClubId) return;

      const result = this.calculateAiMatch(match.homeOvr, match.awayOvr);
      match.homeScore = result.homeScore;
      match.awayScore = result.awayScore;
      match.played = true;

      this.updateStandingsRecord(match.homeId, match.homeScore, match.awayScore);
      this.updateStandingsRecord(match.awayId, match.awayScore, match.homeScore);
    });

    this.sortStandings();
  },

  // Registra o resultado do jogo do usuário
  recordUserMatchResult(roundNum, userClubId, homeScore, awayScore) {
    const match = this.getUserMatch(roundNum, userClubId);
    if (!match) return;

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.played = true;

    this.updateStandingsRecord(match.homeId, homeScore, awayScore);
    this.updateStandingsRecord(match.awayId, awayScore, homeScore);

    // Simula os demais jogos da rodada
    this.simulateRestOfRound(roundNum, userClubId);

    // Avança rodada se não for a última
    if (this.currentRound >= this.totalRounds) {
      this.seasonFinished = true;
    } else {
      this.currentRound++;
    }
  },

  // Calcula resultado simulado realista entre dois clubes com base em OVR e mando
  calculateAiMatch(homeOvr, awayOvr) {
    // Vantagem do mandante: +2 OVR efetivo
    const diff = (homeOvr + 2) - awayOvr;

    let homeChance = 0.38 + (diff * 0.035);
    let drawChance = 0.28;
    homeChance = Math.max(0.15, Math.min(0.75, homeChance));

    const roll = Math.random();
    let homeScore = 0;
    let awayScore = 0;

    if (roll < homeChance) {
      // Vitória Mandante
      homeScore = Math.floor(Math.random() * 3) + 1;
      awayScore = Math.floor(Math.random() * homeScore);
    } else if (roll < homeChance + drawChance) {
      // Empate
      const drawGoals = Math.random() < 0.35 ? 0 : Math.random() < 0.75 ? 1 : 2;
      homeScore = drawGoals;
      awayScore = drawGoals;
    } else {
      // Vitória Visitante
      awayScore = Math.floor(Math.random() * 3) + 1;
      homeScore = Math.floor(Math.random() * awayScore);
    }

    return { homeScore, awayScore };
  },

  // Atualiza um clube na tabela de classificação
  updateStandingsRecord(clubId, gf, ga) {
    const entry = this.standings.find(s => s.clubId === clubId);
    if (!entry) return;

    entry.played++;
    entry.goalsFor += gf;
    entry.goalsAgainst += ga;
    entry.goalDiff = entry.goalsFor - entry.goalsAgainst;

    if (gf > ga) {
      entry.won++;
      entry.points += 3;
    } else if (gf === ga) {
      entry.drawn++;
      entry.points += 1;
    } else {
      entry.lost++;
    }
  },

  // Ordena a tabela por Pontos > SG > GP > Vitórias
  sortStandings() {
    this.standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return b.won - a.won;
    });
  },

  // Processa o final de temporada: premiações, evolução de atletas e transição
  processSeasonEnd(userClub, userSquad, manager) {
    this.sortStandings();
    const userRank = this.standings.findIndex(s => s.clubId === userClub.id) + 1;

    let prizeMoney = 0;
    let reputationDelta = 0;
    let isChampion = userRank === 1;
    let isPromoted = userRank <= 2;
    let isRelegated = userRank >= 9;

    // Premiação financeira por colocação
    if (userRank === 1) {
      prizeMoney = 10000000;
      reputationDelta = 12;
      userClub.titles++;
      manager.trophies++;
    } else if (userRank === 2) {
      prizeMoney = 7000000;
      reputationDelta = 8;
    } else if (userRank <= 4) {
      prizeMoney = 4500000;
      reputationDelta = 4;
    } else if (userRank <= 8) {
      prizeMoney = 2500000;
      reputationDelta = 1;
    } else {
      prizeMoney = 1000000;
      reputationDelta = -4;
    }

    userClub.budget += prizeMoney;
    manager.reputation = Math.max(10, Math.min(100, manager.reputation + reputationDelta));

    // Evolução e Envelhecimento dos Atletas
    const evolutions = [];
    userSquad.forEach(player => {
      player.age++;
      let change = 0;

      if (player.age <= 21) {
        // Jovens evoluem muito (+1 a +4 OVR)
        change = Math.floor(Math.random() * 3) + 1;
        if (Math.random() < 0.25) change += 1;
      } else if (player.age <= 28) {
        // Auge do jogador (-1 a +2 OVR)
        change = Math.floor(Math.random() * 3) - 1;
      } else if (player.age >= 32) {
        // Declínio de veteranos (-2 a 0 OVR)
        change = -(Math.floor(Math.random() * 2) + 1);
      }

      player.ovr = Math.max(50, Math.min(95, player.ovr + change));
      player.value = ClubManager.calculatePlayerValue(player.ovr, player.age, player.potential);
      player.energy = 100; // Recuperação completa para a nova temporada

      if (change !== 0) {
        evolutions.push({ name: player.name, pos: player.pos, change, newOvr: player.ovr });
      }
    });

    // Novos Jovens da Categoria de Base (Novos Talentos)
    const youthTalents = [
      ClubManager.createPlayer('ATA', Math.max(60, userClub.ovr - 5), 17),
      ClubManager.createPlayer('MEI', Math.max(60, userClub.ovr - 4), 18)
    ];

    youthTalents.forEach(yt => {
      userSquad.push(yt);
    });

    return {
      seasonYear: this.currentSeasonYear,
      userRank,
      isChampion,
      isPromoted,
      isRelegated,
      prizeMoney,
      reputationDelta,
      evolutions,
      youthTalents
    };
  },

  // Inicia a próxima temporada
  startNextSeason(divisionClubs, userClubId) {
    this.currentSeasonYear++;
    this.currentRound = 1;
    this.seasonFinished = false;
    this.initSeason(divisionClubs, userClubId, this.currentSeasonYear);
  }
};
