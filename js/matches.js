/**
 * CAMISA11 — Football Tycoon
 * matches.js — Simulador de Partidas, Animação do Campo 2D, Narração em Tempo Real e Pós-Jogo
 */

const MatchEngine = {
  activeMatch: null,
  simInterval: null,
  isPaused: false,
  speed: 1, // 1x, 2x, 5x, ou 0 para pular

  // Lista de clubes adversários fictícios e inspirados organizados por divisões
  opponentsDatabase: {
    estadual: [
      { name: 'União da Mata', ovr: 52, primaryColor: '#2e7d32', secondaryColor: '#ffffff' },
      { name: 'Vila Operária EC', ovr: 54, primaryColor: '#c62828', secondaryColor: '#ffffff' },
      { name: 'Paulistano AC', ovr: 55, primaryColor: '#1565c0', secondaryColor: '#ffffff' },
      { name: 'Estrela Vermelha FC', ovr: 56, primaryColor: '#d32f2f', secondaryColor: '#ffeb3b' },
      { name: 'Real Serrano', ovr: 58, primaryColor: '#455a64', secondaryColor: '#00e676' },
      { name: 'Metropolitano', ovr: 60, primaryColor: '#6a1b9a', secondaryColor: '#ffffff' }
    ],
    nacional_b: [
      { name: 'Atlético Fronteira', ovr: 62, primaryColor: '#e65100', secondaryColor: '#000000' },
      { name: 'Porto Seguro FC', ovr: 64, primaryColor: '#0277bd', secondaryColor: '#ffffff' },
      { name: 'Ferroviário Central', ovr: 65, primaryColor: '#4e342e', secondaryColor: '#ffffff' },
      { name: 'Horizonte Esporte', ovr: 67, primaryColor: '#00838f', secondaryColor: '#ffffff' },
      { name: 'Cuiabá do Sul', ovr: 68, primaryColor: '#2e7d32', secondaryColor: '#fdd835' },
      { name: 'Guarani da Serra', ovr: 70, primaryColor: '#1b5e20', secondaryColor: '#ffffff' }
    ],
    nacional_a: [
      { name: 'Flamengo da Guanabara', ovr: 78, primaryColor: '#c62828', secondaryColor: '#212121' },
      { name: 'Palmeiras Imperial', ovr: 79, primaryColor: '#1b5e20', secondaryColor: '#ffffff' },
      { name: 'São Paulo Metrópole', ovr: 77, primaryColor: '#ffffff', secondaryColor: '#c62828' },
      { name: 'Galo Mineiro', ovr: 76, primaryColor: '#212121', secondaryColor: '#ffffff' },
      { name: 'Internacional Pampeano', ovr: 75, primaryColor: '#d32f2f', secondaryColor: '#ffffff' },
      { name: 'Grêmio Tricolor', ovr: 76, primaryColor: '#0288d1', secondaryColor: '#212121' },
      { name: 'Corinthians Paulista', ovr: 77, primaryColor: '#ffffff', secondaryColor: '#212121' }
    ],
    continental: [
      { name: 'Boca da Prata', ovr: 80, primaryColor: '#0d47a1', secondaryColor: '#ffeb3b' },
      { name: 'River Monumental', ovr: 81, primaryColor: '#ffffff', secondaryColor: '#d32f2f' },
      { name: 'Olímpia Andino', ovr: 78, primaryColor: '#ffffff', secondaryColor: '#212121' },
      { name: 'Peñarol Carbonero', ovr: 79, primaryColor: '#fbc02d', secondaryColor: '#212121' },
      { name: 'Atlético Nacional Verde', ovr: 77, primaryColor: '#2e7d32', secondaryColor: '#ffffff' }
    ],
    mundial: [
      { name: 'Real Realeza', ovr: 89, primaryColor: '#ffffff', secondaryColor: '#ffc107' },
      { name: 'Manchester Sky', ovr: 90, primaryColor: '#4fc3f7', secondaryColor: '#ffffff' },
      { name: 'Baviera Munique', ovr: 88, primaryColor: '#c62828', secondaryColor: '#ffffff' },
      { name: 'Paris Saint-Luxe', ovr: 87, primaryColor: '#1a237e', secondaryColor: '#d32f2f' }
    ]
  },

  // Retorna um adversário apropriado para a competição atual do clube
  generateOpponent(competitionId, clubRivalName, isDerby = false) {
    if (isDerby && clubRivalName) {
      return {
        name: clubRivalName,
        ovr: Math.max(54, Math.round(PlayerDB.calculateTeamRating(Game.state.squad.players, true) + (Math.random() * 4 - 2))),
        primaryColor: '#e53935',
        secondaryColor: '#ffffff',
        isRival: true
      };
    }

    const pool = this.opponentsDatabase[competitionId] || this.opponentsDatabase.estadual;
    const opp = pool[Math.floor(Math.random() * pool.length)];
    return {
      ...opp,
      isRival: opp.name === clubRivalName
    };
  },

  // Inicia uma nova partida
  setupMatch(homeTeam, awayTeam, isHome = true, competition = 'Taça Regional', onEventCallback, onFinishCallback) {
    const homeOvr = isHome ? homeTeam.ovr : awayTeam.ovr;
    const awayOvr = isHome ? awayTeam.ovr : homeTeam.ovr;

    // Fator mando de campo dá leve vantagem ao mandante (+2 OVR)
    const effectiveHomeOvr = homeOvr + (isHome ? 2 : 0);
    const effectiveAwayOvr = awayOvr + (!isHome ? 2 : 0);

    this.activeMatch = {
      homeTeam: isHome ? homeTeam : awayTeam,
      awayTeam: isHome ? awayTeam : homeTeam,
      isUserHome: isHome,
      userTeam: isHome ? homeTeam : awayTeam,
      oppTeam: isHome ? awayTeam : homeTeam,
      competition: competition,
      effectiveHomeOvr: effectiveHomeOvr,
      effectiveAwayOvr: effectiveAwayOvr,
      homeScore: 0,
      awayScore: 0,
      currentMinute: 0,
      events: [],
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      ballPos: { x: 50, y: 50 }, // Porcentagem no campo (X: 0 gol mandante, 100 gol visitante)
      onEvent: onEventCallback,
      onFinish: onFinishCallback,
      isFinished: false
    };

    return this.activeMatch;
  },

  // Avança a simulação minuto a minuto
  startSimulation(speed = 1) {
    if (!this.activeMatch) return;
    this.speed = speed;
    this.isPaused = false;

    if (this.simInterval) clearInterval(this.simInterval);

    // Se velocidade for 0 (Pular direto para o final)
    if (speed === 0) {
      while (this.activeMatch.currentMinute < 90) {
        this.stepMinute(true);
      }
      this.finishMatch();
      return;
    }

    // Intervalo de tempo baseado na velocidade (1x = 120ms/minuto, 2x = 60ms, 5x = 24ms)
    const tickTime = Math.max(15, Math.round(100 / this.speed));

    this.simInterval = setInterval(() => {
      if (this.isPaused) return;

      this.stepMinute(false);

      if (this.activeMatch.currentMinute >= 90) {
        clearInterval(this.simInterval);
        this.finishMatch();
      }
    }, tickTime);
  },

  // Simula 1 minuto de jogo
  stepMinute(silent = false) {
    const match = this.activeMatch;
    if (!match || match.isFinished) return;

    match.currentMinute += 1;

    // Dinâmica de movimentação da bola no campo (X varia de 10% a 90%)
    const ovrDiff = (match.effectiveHomeOvr - match.effectiveAwayOvr);
    const homeAttackBias = 0.5 + (ovrDiff * 0.015);
    const movesHome = Math.random() < homeAttackBias;

    // Movimento orgânico da bola
    const deltaX = (movesHome ? 1 : -1) * (Math.random() * 14 + 2);
    match.ballPos.x = Math.max(8, Math.min(92, match.ballPos.x + deltaX));
    match.ballPos.y = Math.max(15, Math.min(85, match.ballPos.y + (Math.random() * 20 - 10)));

    // Atualiza posse de bola gradativamente
    const currentHomePoss = Math.round(50 + (ovrDiff * 1.5) + (Math.random() * 6 - 3));
    match.possession.home = Math.max(30, Math.min(70, currentHomePoss));
    match.possession.away = 100 - match.possession.home;

    // Lances de perigo e gols (aproximadamente a cada 6 a 12 minutos)
    const actionRoll = Math.random();

    // Chance de lance perigoso no terço final do campo
    if (match.ballPos.x > 78) {
      // Mandante atacando com perigo
      if (actionRoll < 0.22) {
        match.shots.home += 1;
        this.handleDangerPlay(true, match, silent);
      }
    } else if (match.ballPos.x < 22) {
      // Visitante atacando com perigo
      if (actionRoll < 0.22) {
        match.shots.away += 1;
        this.handleDangerPlay(false, match, silent);
      }
    } else {
      // Lances gerais no meio campo (cartão, desarme)
      if (actionRoll < 0.035) {
        this.handleMidfieldEvent(match, silent);
      }
    }

    if (!silent && match.onEvent) {
      match.onEvent(match, null);
    }
  },

  // Processa lances perigosos na área
  handleDangerPlay(isHomeAttack, match, silent) {
    const attackingTeam = isHomeAttack ? match.homeTeam : match.awayTeam;
    const defendingTeam = isHomeAttack ? match.awayTeam : match.homeTeam;
    const userIsAttacking = isHomeAttack === match.isUserHome;

    if (isHomeAttack) match.shotsOnTarget.home += 1;
    else match.shotsOnTarget.away += 1;

    // Probabilidade de gol no chute ao gol (~28% a 38% baseado em OVR)
    const attackerOvr = isHomeAttack ? match.effectiveHomeOvr : match.effectiveAwayOvr;
    const defenderOvr = isHomeAttack ? match.effectiveAwayOvr : match.effectiveHomeOvr;
    const goalProb = 0.30 + ((attackerOvr - defenderOvr) * 0.012);

    let event = null;

    if (Math.random() < goalProb) {
      // GOOOOOOOL!
      if (isHomeAttack) match.homeScore += 1;
      else match.awayScore += 1;

      // Pega nome do autor do gol se for o time do usuário
      let scorerName = 'Atacante';
      if (userIsAttacking && Game.state?.squad?.players) {
        const starPlayers = Game.state.squad.players.filter(p => p.isStarter && (p.area === 'ataque' || p.area === 'meio'));
        const scorer = starPlayers.length > 0 ? starPlayers[Math.floor(Math.random() * starPlayers.length)] : null;
        if (scorer) {
          scorer.stats.goals += 1;
          scorerName = scorer.name;
        }
      } else {
        const oppScorers = ['Goleador', 'Artilheiro', 'Camisa 9', 'Capitão', 'Ponta Veloz'];
        scorerName = oppScorers[Math.floor(Math.random() * oppScorers.length)];
      }

      event = {
        type: 'goal',
        minute: match.currentMinute,
        team: attackingTeam.name,
        isUser: userIsAttacking,
        text: `⚽ ${match.currentMinute}' GOOOOL do ${attackingTeam.name}! (${scorerName}) Placar: ${match.homeScore} × ${match.awayScore}`
      };

      // Toca som de gol se for o clube do usuário!
      if (userIsAttacking && window.AudioSynth) {
        window.AudioSynth.playGoal();
      }

      // Reinicia bola no centro do campo
      match.ballPos.x = 50;
      match.ballPos.y = 50;
    } else {
      // Defesa espetacular ou na trave
      const saveTexts = [
        `🧤 ${match.currentMinute}' Grande defesa do goleiro do ${defendingTeam.name}!`,
        `💥 ${match.currentMinute}' Na traaave! O chute do ${attackingTeam.name} explodiu no travessão!`,
        `🛡️ ${match.currentMinute}' Corte providencial da zaga no momento do chute!`
      ];
      event = {
        type: 'save',
        minute: match.currentMinute,
        team: defendingTeam.name,
        isUser: !userIsAttacking,
        text: saveTexts[Math.floor(Math.random() * saveTexts.length)]
      };
    }

    match.events.unshift(event);
    if (!silent && match.onEvent) {
      match.onEvent(match, event);
    }
  },

  // Eventos de meio-campo (faltas, cartões)
  handleMidfieldEvent(match, silent) {
    const isHome = Math.random() < 0.5;
    const team = isHome ? match.homeTeam : match.awayTeam;
    const userTeam = isHome === match.isUserHome;

    const event = {
      type: 'card',
      minute: match.currentMinute,
      team: team.name,
      isUser: userTeam,
      text: `🟨 ${match.currentMinute}' Cartão amarelo para jogador do ${team.name} após falta tática.`
    };

    match.events.unshift(event);
    if (!silent && match.onEvent) {
      match.onEvent(match, event);
    }
  },

  // Finaliza a partida e processa resultados
  finishMatch() {
    const match = this.activeMatch;
    if (!match) return;

    match.isFinished = true;
    if (this.simInterval) clearInterval(this.simInterval);

    const userWon = match.isUserHome 
      ? match.homeScore > match.awayScore 
      : match.awayScore > match.homeScore;
    const isDraw = match.homeScore === match.awayScore;

    // Som de apito final
    if (window.AudioSynth) {
      window.AudioSynth.playWhistle();
      if (userWon) window.AudioSynth.playFanfare();
    }

    if (match.onFinish) {
      match.onFinish(match, {
        userWon,
        isDraw,
        userScore: match.isUserHome ? match.homeScore : match.awayScore,
        oppScore: match.isUserHome ? match.awayScore : match.homeScore
      });
    }
  }
};

window.MatchEngine = MatchEngine;
