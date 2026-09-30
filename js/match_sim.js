/**
 * CAMISA11 — Football Career & Manager
 * match_sim.js — Coordenador da Partida: Relógio Acelerado, Agendador de Highlights,
 * Pausa Tática, Substituições, Drenagem de Energia e Simulação Instantânea
 */

const MatchSimulator = {
  currentMatch: null,
  simTimer: null,
  minute: 0,
  second: 0,
  isPaused: false,
  speed: 1, // 1x ou 2x
  inHighlight: false,
  plannedHighlights: [],
  matchStats: {
    homeScore: 0,
    awayScore: 0,
    homeShots: 0,
    awayShots: 0,
    possessionHome: 52,
    goalsTimeline: [],
    fouls: 0,
    yellowCards: 0
  },
  onMatchComplete: null,

  // Inicia a partida jogável com Highlights
  startPlayableMatch(matchData, userClub, rivalClub, userSquad, onComplete) {
    this.currentMatch = {
      ...matchData,
      userClub,
      rivalClub,
      isUserHome: matchData.homeId === userClub.id
    };
    this.onMatchComplete = onComplete;
    this.minute = 0;
    this.second = 0;
    this.isPaused = false;
    this.inHighlight = false;

    // Reseta estatísticas da partida
    this.matchStats = {
      homeScore: 0,
      awayScore: 0,
      homeShots: 0,
      awayShots: 0,
      possessionHome: 50,
      goalsTimeline: [],
      fouls: 0,
      yellowCards: 0
    };

    // Agenda entre 3 e 5 momentos-chave durante os 90 minutos
    this.scheduleHighlights(userClub, rivalClub);

    // Atualiza a interface da partida
    this.updateScoreboardUI();
    this.updateTicker('A partida começou! Rola a bola no estádio.');

    // Inicia o loop de simulação acelerada
    this.runSimLoop();
  },

  // Agenda os momentos em que a simulação irá pausar para o jogador assumir o controle
  scheduleHighlights(userClub, rivalClub) {
    this.plannedHighlights = [];
    const count = Math.floor(Math.random() * 3) + 3; // 3 a 5 lances

    // Minutos aleatórios bem distribuídos (ex: 18', 37', 56', 74', 88')
    const step = Math.floor(80 / count);
    const scenarios = ['wing_attack', 'counter_attack', 'edge_box', 'breakaway', 'corner', 'freekick'];

    // Vantagem de força da equipe
    const mentality = TacticsManager.mentality;
    const ovrDiff = userClub.ovr - rivalClub.ovr;

    for (let i = 0; i < count; i++) {
      const min = Math.min(88, Math.floor((i + 1) * step + (Math.random() * 6 - 3)));

      // Determina se o lance é ofensivo ou defensivo
      let isDefensive = false;
      let defChance = 0.35 - (ovrDiff * 0.02);
      if (mentality === 'DEFENSIVA') defChance -= 0.12;
      if (mentality === 'OFENSIVA') defChance += 0.15;

      if (Math.random() < defChance && i > 0) {
        isDefensive = true;
      }

      const scenario = isDefensive ? 'defense' : scenarios[Math.floor(Math.random() * scenarios.length)];
      this.plannedHighlights.push({ minute: min, scenario, triggered: false });
    }
  },

  // Loop do relógio rápido da partida (~60 a 90 segundos reais)
  runSimLoop() {
    clearInterval(this.simTimer);
    const intervalMs = this.speed === 2 ? 140 : 250;

    this.simTimer = setInterval(() => {
      if (this.isPaused || this.inHighlight) return;

      this.minute++;
      this.second = Math.floor(Math.random() * 60);

      // Flutuação realista da posse de bola
      const bias = (this.currentMatch.userClub.ovr - this.currentMatch.rivalClub.ovr) * 0.4;
      this.matchStats.possessionHome = Math.max(35, Math.min(65, Math.round(50 + bias + (Math.random() * 8 - 4))));

      // Drenagem leve de energia dos titulares ao longo da partida
      if (this.minute % 15 === 0) {
        this.drainSquadEnergy();
      }

      // Narração periódica de lances simulados
      if (this.minute % 12 === 0) {
        this.generateAmbientCommentary();
      }

      this.updateScoreboardUI();

      // Checa se atingiu o minuto de um highlight planejado
      const nextHl = this.plannedHighlights.find(h => !h.triggered && h.minute <= this.minute);
      if (nextHl) {
        nextHl.triggered = true;
        this.triggerHighlight(nextHl.scenario);
        return;
      }

      // Fim dos 90 minutos
      if (this.minute >= 90) {
        this.endMatch();
      }
    }, intervalMs);
  },

  // Dispara o momento jogável no Canvas
  triggerHighlight(scenario) {
    this.inHighlight = true;
    const isDef = scenario === 'defense';

    // Alerta visual de momento-chave
    const alertEl = document.getElementById('match-highlight-alert');
    if (alertEl) {
      alertEl.textContent = isDef ? '⚠️ MOMENTO DEFENSIVO!' : '⚡ MOMENTO-CHAVE!';
      alertEl.className = isDef ? 'highlight-alert def' : 'highlight-alert atk';
      alertEl.style.display = 'block';
      setTimeout(() => {
        alertEl.style.display = 'none';
      }, 1200);
    }

    this.updateTicker(isDef ? 'Atenção! O adversário avança com perigo!' : 'Boa jogada construída! Você assume o controle!');

    // Pega titulares atuais
    const starters = Game.state.squad.filter(p => p.isStarter);

    // Inicia o motor gráfico 2D
    MatchCanvas.startHighlight(
      scenario,
      this.currentMatch.userClub,
      this.currentMatch.rivalClub,
      starters,
      (result) => {
        this.handleHighlightResult(result);
      }
    );
  },

  // Processa o resultado do highlight e retoma a simulação
  handleHighlightResult(result) {
    this.inHighlight = false;

    if (result.isUserGoal) {
      if (this.currentMatch.isUserHome) {
        this.matchStats.homeScore++;
        this.matchStats.homeShots++;
      } else {
        this.matchStats.awayScore++;
        this.matchStats.awayShots++;
      }
      const scorerName = result.scorer ? result.scorer.name : 'Camisa11';
      this.matchStats.goalsTimeline.push({
        minute: this.minute,
        scorer: scorerName,
        isUser: true
      });
      this.updateTicker(`⚽ GOOOOOOL! ${scorerName} marca aos ${this.minute}'!`);
    } else if (result.isRivalGoal) {
      if (this.currentMatch.isUserHome) {
        this.matchStats.awayScore++;
        this.matchStats.awayShots++;
      } else {
        this.matchStats.homeScore++;
        this.matchStats.homeShots++;
      }
      this.matchStats.goalsTimeline.push({
        minute: this.minute,
        scorer: `${this.currentMatch.rivalClub.name}`,
        isUser: false
      });
      this.updateTicker(`Gol do adversário aos ${this.minute}'.`);
    } else {
      if (this.currentMatch.isUserHome) {
        this.matchStats.homeShots++;
      } else {
        this.matchStats.awayShots++;
      }
      this.updateTicker('A jogada se encerrou. O jogo segue acelerado!');
    }

    this.updateScoreboardUI();

    // Se já passou dos 90 minutos, encerra a partida
    if (this.minute >= 90) {
      setTimeout(() => this.endMatch(), 800);
    }
  },

  // Gera comentários dinâmicos para a simulação
  generateAmbientCommentary() {
    const comments = [
      'Disputa acirrada no círculo central.',
      'A torcida canta e empurra a equipe!',
      'Goleiro adversário sai para afastar o perigo.',
      'Troca rápida de passes na intermediária.',
      'Defesa bem postada afasta o cruzamento.',
      'Marcação alta surte efeito na recuperação da posse.'
    ];
    this.updateTicker(comments[Math.floor(Math.random() * comments.length)]);
  },

  // Drena energia dos atletas em campo
  drainSquadEnergy() {
    const drain = TacticsManager.pressing === 'ALTA' ? 4 : TacticsManager.pressing === 'BAIXA' ? 2 : 3;
    if (Game.state && Game.state.squad) {
      Game.state.squad.forEach(p => {
        if (p.isStarter) {
          p.energy = Math.max(35, p.energy - drain);
        }
      });
    }
  },

  // Atualiza o placar e cronômetro na tela da partida
  updateScoreboardUI() {
    const scoreEl = document.getElementById('match-live-score');
    const clockEl = document.getElementById('match-live-clock');
    const possBarEl = document.getElementById('match-possession-bar');

    if (scoreEl) {
      scoreEl.textContent = `${this.matchStats.homeScore} × ${this.matchStats.awayScore}`;
    }
    if (clockEl) {
      const secFormatted = this.second < 10 ? '0' + this.second : this.second;
      clockEl.textContent = `${this.minute}:${secFormatted}`;
    }
    if (possBarEl) {
      possBarEl.style.width = `${this.matchStats.possessionHome}%`;
    }
  },

  // Atualiza o ticker narrativo
  updateTicker(text) {
    const tickerEl = document.getElementById('match-live-ticker');
    if (tickerEl) {
      tickerEl.textContent = text;
    }
  },

  // Pausa ou retoma a simulação
  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  },

  // Alterna velocidade (1x ou 2x)
  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    this.runSimLoop();
    return this.speed;
  },

  // Simulação instantânea completa sem precisar jogar os highlights
  simulateInstantly(matchData, userClub, rivalClub, userSquad) {
    const isUserHome = matchData.homeId === userClub.id;
    const userOvr = ClubManager.calculateTeamOvr(userSquad);
    const rivalOvr = rivalClub.ovr;

    // Vantagem de mando de campo e mentalidade
    let effectiveUserOvr = userOvr + (isUserHome ? 2 : -1);
    if (TacticsManager.mentality === 'OFENSIVA') effectiveUserOvr += 1;

    const result = SeasonManager.calculateAiMatch(
      isUserHome ? effectiveUserOvr : rivalOvr,
      isUserHome ? rivalOvr : effectiveUserOvr
    );

    // Geração de histórico de gols
    const goalsTimeline = [];
    const userGoals = isUserHome ? result.homeScore : result.awayScore;
    const rivalGoals = isUserHome ? result.awayScore : result.homeScore;

    const attackers = userSquad.filter(p => p.isStarter);
    for (let i = 0; i < userGoals; i++) {
      const scorer = attackers[Math.floor(Math.random() * attackers.length)];
      goalsTimeline.push({
        minute: Math.floor(Math.random() * 85) + 5,
        scorer: scorer.name,
        isUser: true
      });
    }

    for (let i = 0; i < rivalGoals; i++) {
      goalsTimeline.push({
        minute: Math.floor(Math.random() * 85) + 5,
        scorer: rivalClub.name,
        isUser: false
      });
    }

    goalsTimeline.sort((a, b) => a.minute - b.minute);

    // Drena energia proporcionalmente
    userSquad.forEach(p => {
      if (p.isStarter) {
        p.energy = Math.max(40, p.energy - 18);
      }
    });

    return {
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      isUserHome,
      goalsTimeline
    };
  },

  // Final da partida
  endMatch() {
    clearInterval(this.simTimer);
    SoundEngine.playWhistle(true);

    const isUserHome = this.currentMatch.isUserHome;
    const userScore = isUserHome ? this.matchStats.homeScore : this.matchStats.awayScore;
    const rivalScore = isUserHome ? this.matchStats.awayScore : this.matchStats.homeScore;

    let resultStatus = 'DRAW';
    if (userScore > rivalScore) resultStatus = 'WIN';
    else if (userScore < rivalScore) resultStatus = 'LOSS';

    // Cálculo financeiro de bilheteria e premiação
    const capacity = this.currentMatch.userClub.stadiumCapacity || 10000;
    const crowd = Math.round(capacity * (0.65 + Math.random() * 0.35));
    const ticketRevenue = isUserHome ? Math.round(crowd * 25) : 0;
    const winBonus = resultStatus === 'WIN' ? 45000 : resultStatus === 'DRAW' ? 15000 : 5000;
    const totalMatchMoney = ticketRevenue + winBonus;

    // Atualiza saldo financeiro e reputação
    this.currentMatch.userClub.budget += totalMatchMoney;
    const repGain = resultStatus === 'WIN' ? 2 : resultStatus === 'LOSS' ? -1 : 0;
    if (Game.state && Game.state.manager) {
      Game.state.manager.reputation = Math.max(10, Math.min(100, Game.state.manager.reputation + repGain));
      Game.state.manager.matches++;
      if (resultStatus === 'WIN') Game.state.manager.wins++;
    }

    // Notifica conclusão da partida
    if (this.onMatchComplete) {
      this.onMatchComplete({
        homeScore: this.matchStats.homeScore,
        awayScore: this.matchStats.awayScore,
        userScore,
        rivalScore,
        resultStatus,
        goalsTimeline: this.matchStats.goalsTimeline,
        crowd,
        ticketRevenue,
        winBonus,
        totalMatchMoney,
        repGain
      });
    }
  }
};
