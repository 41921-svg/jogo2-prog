/**
 * CAMISA11 — Football Career & Manager
 * match_canvas.js — Motor Gráfico 2D em Canvas dos Momentos-Chave (Highlights)
 * Suporte completo a gestos por Toque (Mobile) e Mouse (Desktop):
 * Passe, Passe em Profundidade, Chute com Efeito, Cruzamento, Drible e Desarme Defensivo
 */

const MatchCanvas = {
  canvas: null,
  ctx: null,
  animId: null,
  isActive: false,

  // Configuração dimensional do campo
  pitchWidth: 800,
  pitchHeight: 600,
  goalTop: { x1: 330, x2: 470, y: 35, depth: 30 }, // Gol superior (onde o jogador ataca)
  goalBottom: { x1: 330, x2: 470, y: 565, depth: 30 }, // Gol inferior (defesa)

  // Estado do highlight atual
  scenarioType: 'wing_attack', // wing_attack | counter_attack | edge_box | breakaway | corner | freekick | penalty | defense
  userClub: null,
  rivalClub: null,
  players: [],       // Atletas em campo
  activePlayer: null,// Atleta sob controle do usuário
  opponentAttacker: null, // Para highlights defensivos
  goalkeeper: null,
  ball: {
    x: 400,
    y: 350,
    z: 0,            // Altura do chão (3D)
    vx: 0,
    vy: 0,
    vz: 0,
    spin: 0,         // Efeito curva
    radius: 7,
    inAir: false,
    holder: null     // Quem está com a posse
  },

  // Rastreamento de gestos do usuário
  pointer: {
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    points: [],      // Histórico de pontos para cálculo de curva
    holdTimer: null,
    isDribbling: false
  },

  // Efeitos e avisos contextuais
  bannerText: '',
  bannerSubtext: '',
  bannerType: 'info', // goal | miss | save | tackle | foul
  showBanner: false,
  highlightEnded: false,
  onHighlightComplete: null,

  // Inicialização do Canvas
  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.setupInputs();
  },

  // Registra eventos unificados de Pointer (Touch e Mouse)
  setupInputs() {
    if (!this.canvas) return;

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.pitchWidth / rect.width;
      const scaleY = this.pitchHeight / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.isActive || this.highlightEnded) return;
      this.canvas.setPointerCapture(e.pointerId);
      const pos = getCanvasPos(e);

      this.pointer.isDown = true;
      this.pointer.startX = pos.x;
      this.pointer.startY = pos.y;
      this.pointer.currentX = pos.x;
      this.pointer.currentY = pos.y;
      this.pointer.startTime = performance.now();
      this.pointer.points = [{ x: pos.x, y: pos.y, time: this.pointer.startTime }];
      this.pointer.isDribbling = false;

      // Timer para detectar condução/drible contínuo ao segurar
      clearTimeout(this.pointer.holdTimer);
      this.pointer.holdTimer = setTimeout(() => {
        if (this.pointer.isDown && this.activePlayer && this.ball.holder === this.activePlayer) {
          this.pointer.isDribbling = true;
        }
      }, 150);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.pointer.isDown || !this.isActive || this.highlightEnded) return;
      const pos = getCanvasPos(e);
      this.pointer.currentX = pos.x;
      this.pointer.currentY = pos.y;
      this.pointer.points.push({ x: pos.x, y: pos.y, time: performance.now() });

      // Se estiver em condução, move o atleta e a bola
      if (this.pointer.isDribbling && this.activePlayer && this.ball.holder === this.activePlayer) {
        const dx = pos.x - this.activePlayer.x;
        const dy = pos.y - this.activePlayer.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          const speed = (this.activePlayer.stats.pace / 100) * 3.2;
          this.activePlayer.vx = (dx / dist) * speed;
          this.activePlayer.vy = (dy / dist) * speed;
        }
      }
    });

    const handlePointerEnd = (e) => {
      if (!this.pointer.isDown || !this.isActive || this.highlightEnded) return;
      clearTimeout(this.pointer.holdTimer);
      this.pointer.isDown = false;

      const pos = getCanvasPos(e);
      const dx = pos.x - this.pointer.startX;
      const dy = pos.y - this.pointer.startY;
      const dist = Math.hypot(dx, dy);
      const duration = performance.now() - this.pointer.startTime;

      if (this.pointer.isDribbling) {
        this.pointer.isDribbling = false;
        if (this.activePlayer) {
          this.activePlayer.vx = 0;
          this.activePlayer.vy = 0;
        }
        return;
      }

      // 1. FASE DEFENSIVA
      if (this.scenarioType === 'defense') {
        this.handleDefensiveGesture(pos, dx, dy, dist);
        return;
      }

      // 2. FASE OFENSIVA
      if (this.ball.holder !== this.activePlayer && !['corner', 'freekick', 'penalty'].includes(this.scenarioType)) {
        return;
      }

      // Gesto de Toque Simples (distância curta): Passe
      if (dist < 20 && duration < 350) {
        this.handleTapPass(pos);
        return;
      }

      // Gesto de Arraste / Swipe: Chute, Cruzamento ou Passe em Profundidade
      this.handleSwipeAction(dx, dy, dist, duration);
    };

    this.canvas.addEventListener('pointerup', handlePointerEnd);
    this.canvas.addEventListener('pointercancel', handlePointerEnd);
  },

  // Inicia um novo lance / highlight
  startHighlight(scenarioType, userClub, rivalClub, userStarters, onComplete) {
    this.isActive = true;
    this.highlightEnded = false;
    this.showBanner = false;
    this.scenarioType = scenarioType;
    this.userClub = userClub;
    this.rivalClub = rivalClub;
    this.onHighlightComplete = onComplete;

    this.setupPitchEntities(userStarters);
    SoundEngine.playWhistle(false);

    if (this.animId) cancelAnimationFrame(this.animId);
    this.lastTime = performance.now();
    this.loop();
  },

  // Configura os jogadores e a bola de acordo com o cenário específico
  setupPitchEntities(userStarters) {
    this.players = [];
    const uColor = this.userClub.primaryColor || '#0f172a';
    const uSec = this.userClub.secondaryColor || '#10b981';
    const rColor = this.rivalClub.primaryColor || '#dc2626';
    const rSec = this.rivalClub.secondaryColor || '#ffffff';

    const safeStarters = userStarters && userStarters.length >= 11 ? userStarters : ClubManager.generateInitialSquad(this.userClub.ovr).filter(p => p.isStarter);

    // Goleiro adversário sempre posicionado no gol superior
    this.goalkeeper = {
      id: 'ai_gk',
      name: 'Goleiro',
      isUser: false,
      isGK: true,
      x: 400,
      y: 65,
      vx: 0,
      vy: 0,
      ovr: this.rivalClub.ovr,
      color: '#eab308',
      secColor: '#000000',
      diveState: null,
      diveProgress: 0,
      stats: { pace: 65, defending: this.rivalClub.ovr }
    };
    this.players.push(this.goalkeeper);

    // Configura cenários dinâmicos com a jogada em movimento
    switch (this.scenarioType) {
      case 'wing_attack': {
        // Ponta conduzindo pela ala direita rumo à linha de fundo
        const winger = safeStarters.find(p => ['PD', 'ATA', 'PE'].includes(p.pos)) || safeStarters[10];
        const striker = safeStarters.find(p => p.pos === 'ATA' && p.id !== winger.id) || safeStarters[9];
        const mid = safeStarters.find(p => ['MEI', 'MC'].includes(p.pos)) || safeStarters[6];

        this.activePlayer = {
          ...winger,
          isUser: true,
          x: 620,
          y: 280,
          vx: 0.8,
          vy: -2.2, // Em velocidade para frente
          color: uColor,
          secColor: uSec
        };

        const runnerStriker = {
          ...striker,
          isUser: true,
          x: 420,
          y: 220,
          vx: 0.2,
          vy: -1.8,
          color: uColor,
          secColor: uSec,
          isRunner: true
        };

        const trailingMid = {
          ...mid,
          isUser: true,
          x: 500,
          y: 380,
          vx: 0,
          vy: -1.2,
          color: uColor,
          secColor: uSec
        };

        // Defensores adversários marcando a área
        const def1 = { id: 'ai_d1', name: 'Zagueiro', isUser: false, x: 440, y: 160, vx: 0, vy: -0.6, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 65, defending: this.rivalClub.ovr } };
        const def2 = { id: 'ai_d2', name: 'Lateral', isUser: false, x: 580, y: 220, vx: 0.3, vy: -1.4, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 70, defending: this.rivalClub.ovr } };

        this.players.push(this.activePlayer, runnerStriker, trailingMid, def1, def2);

        this.ball = { x: 624, y: 270, z: 0, vx: 0.8, vy: -2.2, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'counter_attack': {
        // Meia armando contra-ataque rápido pelo meio
        const mid = safeStarters.find(p => ['MEI', 'MC', 'VOL'].includes(p.pos)) || safeStarters[6];
        const atk1 = safeStarters.find(p => p.pos === 'ATA') || safeStarters[9];
        const atk2 = safeStarters.find(p => ['PE', 'PD'].includes(p.pos)) || safeStarters[8];

        this.activePlayer = {
          ...mid,
          isUser: true,
          x: 400,
          y: 390,
          vx: 0,
          vy: -2.8,
          color: uColor,
          secColor: uSec
        };

        const runnerLeft = { ...atk2, isUser: true, x: 260, y: 260, vx: -0.4, vy: -2.5, color: uColor, secColor: uSec, isRunner: true };
        const runnerRight = { ...atk1, isUser: true, x: 520, y: 240, vx: 0.4, vy: -2.6, color: uColor, secColor: uSec, isRunner: true };

        const defCenter = { id: 'ai_d1', name: 'Zagueiro', isUser: false, x: 380, y: 210, vx: 0, vy: -1.0, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 66, defending: this.rivalClub.ovr } };
        const defRight = { id: 'ai_d2', name: 'Zagueiro', isUser: false, x: 460, y: 200, vx: 0, vy: -1.0, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 66, defending: this.rivalClub.ovr } };

        this.players.push(this.activePlayer, runnerLeft, runnerRight, defCenter, defRight);

        this.ball = { x: 400, y: 380, z: 0, vx: 0, vy: -2.8, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'breakaway':
      case 'edge_box': {
        // Finalização da entrada da área / cara a cara
        const striker = safeStarters.find(p => p.pos === 'ATA') || safeStarters[9];
        const support = safeStarters.find(p => ['MEI', 'MC', 'PE'].includes(p.pos)) || safeStarters[7];

        const startY = this.scenarioType === 'breakaway' ? 220 : 280;

        this.activePlayer = {
          ...striker,
          isUser: true,
          x: 390,
          y: startY,
          vx: 0.2,
          vy: -2.0,
          color: uColor,
          secColor: uSec
        };

        const supportPlayer = {
          ...support,
          isUser: true,
          x: 270,
          y: startY + 40,
          vx: 0.3,
          vy: -1.5,
          color: uColor,
          secColor: uSec
        };

        const defender = {
          id: 'ai_d1',
          name: 'Zagueiro',
          isUser: false,
          x: 450,
          y: startY - 60,
          vx: -0.6,
          vy: 0.5,
          ovr: this.rivalClub.ovr,
          color: rColor,
          secColor: rSec,
          stats: { pace: 68, defending: this.rivalClub.ovr }
        };

        this.players.push(this.activePlayer, supportPlayer, defender);
        this.ball = { x: 390, y: startY - 10, z: 0, vx: 0.2, vy: -2.0, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'corner': {
        // Escanteio Ofensivo pela direita
        const taker = safeStarters.find(p => ['PD', 'MEI', 'LD'].includes(p.pos)) || safeStarters[4];
        const h1 = safeStarters.find(p => ['ATA', 'ZAG'].includes(p.pos)) || safeStarters[9];
        const h2 = safeStarters.find(p => ['ZAG', 'MC'].includes(p.pos) && p.id !== h1.id) || safeStarters[2];

        this.activePlayer = { ...taker, isUser: true, x: 740, y: 55, vx: 0, vy: 0, color: uColor, secColor: uSec };
        const attacker1 = { ...h1, isUser: true, x: 420, y: 140, vx: 0, vy: 0, color: uColor, secColor: uSec };
        const attacker2 = { ...h2, isUser: true, x: 370, y: 170, vx: 0, vy: 0, color: uColor, secColor: uSec };

        const def1 = { id: 'ai_d1', name: 'Zagueiro', isUser: false, x: 410, y: 120, vx: 0, vy: 0, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 65, defending: this.rivalClub.ovr } };
        const def2 = { id: 'ai_d2', name: 'Zagueiro', isUser: false, x: 380, y: 150, vx: 0, vy: 0, ovr: this.rivalClub.ovr, color: rColor, secColor: rSec, stats: { pace: 65, defending: this.rivalClub.ovr } };

        this.players.push(this.activePlayer, attacker1, attacker2, def1, def2);
        this.ball = { x: 740, y: 55, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'penalty': {
        // Pênalti
        const taker = safeStarters.find(p => p.pos === 'ATA') || safeStarters[9];
        this.activePlayer = { ...taker, isUser: true, x: 400, y: 220, vx: 0, vy: 0, color: uColor, secColor: uSec };
        this.players.push(this.activePlayer);
        this.ball = { x: 400, y: 175, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'freekick': {
        // Falta perigosa
        const taker = safeStarters.find(p => ['MEI', 'ATA'].includes(p.pos)) || safeStarters[9];
        this.activePlayer = { ...taker, isUser: true, x: 420, y: 280, vx: 0, vy: 0, color: uColor, secColor: uSec };

        // Barreira com 4 adversários
        for (let i = 0; i < 4; i++) {
          this.players.push({
            id: `ai_wall_${i}`,
            name: 'Barreira',
            isUser: false,
            x: 360 + i * 28,
            y: 195,
            vx: 0,
            vy: 0,
            ovr: this.rivalClub.ovr,
            color: rColor,
            secColor: rSec,
            isWall: true,
            stats: { pace: 60, defending: this.rivalClub.ovr }
          });
        }
        this.players.push(this.activePlayer);
        this.ball = { x: 420, y: 275, z: 0, vx: 0, vy: 0, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.activePlayer };
        break;
      }

      case 'defense': {
        // MOMENTO DEFENSIVO: Atacante adversário avança rumo ao nosso gol (inferior)
        const defender = safeStarters.find(p => ['ZAG', 'LE', 'LD', 'VOL'].includes(p.pos)) || safeStarters[2];
        const coveringDef = safeStarters.find(p => p.pos === 'ZAG' && p.id !== defender.id) || safeStarters[3];

        // Goleiro do usuário no gol inferior
        const userGk = {
          id: 'user_gk',
          name: 'Nosso Goleiro',
          isUser: true,
          isGK: true,
          x: 400,
          y: 535,
          vx: 0,
          vy: 0,
          ovr: this.userClub.ovr,
          color: '#10b981',
          secColor: '#000000',
          stats: { pace: 65, defending: this.userClub.ovr }
        };

        this.opponentAttacker = {
          id: 'ai_star_atk',
          name: 'Atacante Rival',
          isUser: false,
          x: 380,
          y: 320,
          vx: 0.3,
          vy: 2.2, // Correndo para o nosso gol
          ovr: this.rivalClub.ovr,
          color: rColor,
          secColor: rSec,
          stats: { pace: 74, shooting: 76, dribbling: 75, defending: 40 }
        };

        this.activePlayer = {
          ...defender,
          isUser: true,
          x: 420,
          y: 410,
          vx: 0,
          vy: -0.5,
          color: uColor,
          secColor: uSec,
          isDefender: true
        };

        const cover = {
          ...coveringDef,
          isUser: true,
          x: 340,
          y: 440,
          vx: 0,
          vy: 0,
          color: uColor,
          secColor: uSec
        };

        this.players.push(userGk, this.opponentAttacker, this.activePlayer, cover);
        this.ball = { x: 380, y: 330, z: 0, vx: 0.3, vy: 2.2, vz: 0, spin: 0, radius: 7, inAir: false, holder: this.opponentAttacker };
        break;
      }
    }
  },

  // Manipula o passe simples por toque (clique em companheiro ou espaço vazio)
  handleTapPass(targetPos) {
    if (!this.activePlayer) return;

    // Verifica se clicou diretamente em um companheiro de time
    const clickedTeammate = this.players.find(p => p.isUser && p.id !== this.activePlayer.id && Math.hypot(p.x - targetPos.x, p.y - targetPos.y) < 36);

    let destX = targetPos.x;
    let destY = targetPos.y;

    if (clickedTeammate) {
      destX = clickedTeammate.x + clickedTeammate.vx * 15;
      destY = clickedTeammate.y + clickedTeammate.vy * 15;
    }

    const dx = destX - this.ball.x;
    const dy = destY - this.ball.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 15) return;

    // Precisão e velocidade do passe baseadas no stat de passe
    const passStat = this.activePlayer.stats ? this.activePlayer.stats.passing : 70;
    const speed = 7.5 + (passStat / 100) * 4.5;

    this.ball.holder = null;
    this.ball.vx = (dx / dist) * speed;
    this.ball.vy = (dy / dist) * speed;
    this.ball.vz = 0.5; // Leve descolamento da grama
    this.ball.z = 1;
    this.ball.spin = 0;

    SoundEngine.playKick(false);
  },

  // Manipula gesto de deslizar / swipe: Chute, Cruzamento ou Passe em Profundidade
  handleSwipeAction(dx, dy, dist, duration) {
    if (!this.activePlayer) return;

    // Detecta se é cruzamento: jogador na lateral e swipe apontando para o centro da área
    const isWingArea = this.activePlayer.x < 240 || this.activePlayer.x > 560;
    const pointingToBox = dy < -30 && Math.abs(dx) > 30 && ((this.activePlayer.x < 240 && dx > 0) || (this.activePlayer.x > 560 && dx < 0));

    if (isWingArea && pointingToBox && this.scenarioType !== 'penalty') {
      this.executeCross(dx, dy, dist);
      return;
    }

    // Se o swipe estiver apontando claramente para a direção do gol (para cima: dy < -20): CHUTE
    if (dy < -20 || this.scenarioType === 'penalty' || this.scenarioType === 'freekick') {
      this.executeShot(dx, dy, dist, duration);
      return;
    }

    // Caso contrário: Passe forte / em profundidade
    this.executeThroughPass(dx, dy, dist);
  },

  // Executa o chute com física, altura e efeito de curva
  executeShot(dx, dy, dist, duration) {
    const shootStat = this.activePlayer.stats ? this.activePlayer.stats.shooting : 70;
    // Força calculada pela velocidade e comprimento do gesto
    const gestureSpeed = dist / Math.max(80, duration);
    const powerMult = Math.min(1.4, Math.max(0.7, gestureSpeed * 1.5));
    const speed = (9.0 + (shootStat / 100) * 6.5) * powerMult;

    // Cálculo de curvatura / efeito através do desvio dos pontos do gesto
    let curve = 0;
    if (this.pointer.points.length >= 4) {
      const midPoint = this.pointer.points[Math.floor(this.pointer.points.length / 2)];
      const directMidX = (this.pointer.startX + this.pointer.currentX) / 2;
      const deviation = midPoint.x - directMidX;
      curve = Math.max(-0.6, Math.min(0.6, (deviation / 40)));
    }

    const angle = Math.atan2(dy, dx);
    this.ball.holder = null;
    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.vz = Math.min(8.0, 3.5 + (dist / 60)); // Elevação
    this.ball.spin = curve;
    this.ball.inAir = true;

    SoundEngine.playKick(true);

    // Inteligência do goleiro para iniciar o salto
    this.triggerGoalkeeperDive(this.ball.x, this.ball.vx, this.ball.vy);
  },

  // Executa cruzamento aéreo
  executeCross(dx, dy, dist) {
    const passStat = this.activePlayer.stats ? this.activePlayer.stats.passing : 70;
    const speed = 7.0 + (passStat / 100) * 3.5;
    const angle = Math.atan2(dy, dx);

    this.ball.holder = null;
    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.vz = 8.5; // Parábola alta
    this.ball.z = 2;
    this.ball.inAir = true;

    SoundEngine.playKick(false);
  },

  // Executa passe em profundidade
  executeThroughPass(dx, dy, dist) {
    const passStat = this.activePlayer.stats ? this.activePlayer.stats.passing : 70;
    const speed = 8.0 + (passStat / 100) * 4.0;
    const angle = Math.atan2(dy, dx);

    this.ball.holder = null;
    this.ball.vx = Math.cos(angle) * speed;
    this.ball.vy = Math.sin(angle) * speed;
    this.ball.vz = 1.0;
    this.ball.z = 1;

    SoundEngine.playKick(false);
  },

  // Ações de defesa: Toque para pressionar ou Deslizar para carrinho/desarme
  handleDefensiveGesture(pos, dx, dy, dist) {
    if (!this.activePlayer || !this.opponentAttacker) return;

    const distToAttacker = Math.hypot(this.activePlayer.x - this.opponentAttacker.x, this.activePlayer.y - this.opponentAttacker.y);

    // Se deslizou em direção ao adversário: Carrinho / Desarme Agressivo
    if (dist > 30) {
      const defStat = this.activePlayer.stats ? this.activePlayer.stats.defending : 68;
      // Probabilidade de desarme limpo calculada pelo atributo
      const cleanTackleChance = 0.45 + (defStat / 100) * 0.45;

      SoundEngine.playTackle();

      if (distToAttacker < 65 && Math.random() < cleanTackleChance) {
        // Desarme com sucesso!
        this.ball.holder = this.activePlayer;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.finishHighlight('tackle', 'DESARME PERFEITO!', 'A jogada foi desarmada com precisão!');
      } else if (distToAttacker < 65) {
        // Falta ou drible do adversário
        if (Math.random() < 0.35) {
          this.finishHighlight('foul', '🟨 FALTA COMETIDA!', 'Árbitro assinalou falta perigosa!');
        } else {
          // Adversário dribla e chuta
          this.opponentAttacker.vy = 3.5;
          setTimeout(() => {
            this.executeAiOpponentShot();
          }, 300);
        }
      } else {
        // Deu carrinho longe da bola: atacante escapa livre
        this.opponentAttacker.vy = 3.5;
        setTimeout(() => {
          this.executeAiOpponentShot();
        }, 400);
      }
    } else {
      // Toque simples: Aproximação / Pressão
      const pdx = this.opponentAttacker.x - this.activePlayer.x;
      const pdy = this.opponentAttacker.y - this.activePlayer.y;
      const pdist = Math.hypot(pdx, pdy);
      this.activePlayer.vx = (pdx / pdist) * 3.5;
      this.activePlayer.vy = (pdy / pdist) * 3.5;
    }
  },

  // IA do adversário finalizando no gol do usuário
  executeAiOpponentShot() {
    if (this.highlightEnded) return;
    this.ball.holder = null;
    const targetX = 360 + Math.random() * 80;
    const dx = targetX - this.ball.x;
    const dy = 550 - this.ball.y;
    const dist = Math.hypot(dx, dy);

    this.ball.vx = (dx / dist) * 11;
    this.ball.vy = (dy / dist) * 11;
    this.ball.vz = 4.0;
    this.ball.inAir = true;

    SoundEngine.playKick(true);

    // Goleiro do usuário tenta defender
    setTimeout(() => {
      const userGkDef = this.userClub.ovr;
      if (Math.random() < (userGkDef / 100) * 0.75) {
        SoundEngine.playSave();
        this.finishHighlight('save', 'GRANDE DEFESA!', 'O goleiro salvou no cantinho!');
      } else {
        SoundEngine.playGoal();
        this.finishHighlight('rival_goal', 'GOL DO ADVERSÁRIO!', `${this.rivalClub.name} aproveitou a falha.`);
      }
    }, 700);
  },

  // Aciona salto do goleiro para a trajetória do chute
  triggerGoalkeeperDive(ballX, ballVx, ballVy) {
    if (!this.goalkeeper) return;
    const timeToGoal = (this.goalTop.y - this.ball.y) / (ballVy || -1);

    if (timeToGoal > 0 && timeToGoal < 45) {
      const estimatedLandingX = ballX + ballVx * timeToGoal;
      const targetX = Math.max(this.goalTop.x1 + 10, Math.min(this.goalTop.x2 - 10, estimatedLandingX));

      this.goalkeeper.diveState = {
        startX: this.goalkeeper.x,
        targetX,
        progress: 0,
        speed: (this.goalkeeper.ovr / 100) * 0.09
      };
    }
  },

  // Loop principal de animação e física 60 FPS
  loop() {
    if (!this.isActive) return;

    this.updatePhysics();
    this.render();

    this.animId = requestAnimationFrame(() => this.loop());
  },

  // Atualização física de jogadores, bola e regras de campo
  updatePhysics() {
    // 1. Atualiza bola
    if (this.ball.holder) {
      // Bola presa ao condutor
      this.ball.x = this.ball.holder.x + (this.ball.holder.vx || 0) * 5;
      this.ball.y = this.ball.holder.y + (this.ball.holder.vy || 0) * 5;
      this.ball.z = 0;
      this.ball.inAir = false;
    } else {
      // Bola em movimento livre
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.z += this.ball.vz;

      // Gravidade
      if (this.ball.z > 0) {
        this.ball.vz -= 0.32;
        // Aplicação do efeito de curva lateral
        this.ball.vx += this.ball.spin * 0.18;
      } else {
        this.ball.z = 0;
        this.ball.vz = 0;
        this.ball.inAir = false;
        // Atrito da grama
        this.ball.vx *= 0.965;
        this.ball.vy *= 0.965;
      }

      // Quique da bola
      if (this.ball.z < 0) {
        this.ball.z = 0;
        if (Math.abs(this.ball.vz) > 1.2) {
          this.ball.vz = -this.ball.vz * 0.5;
        } else {
          this.ball.vz = 0;
        }
      }
    }

    // 2. Atualiza goleiro
    if (this.goalkeeper) {
      if (this.goalkeeper.diveState) {
        this.goalkeeper.diveState.progress += this.goalkeeper.diveState.speed;
        const p = Math.min(1, this.goalkeeper.diveState.progress);
        this.goalkeeper.x = this.goalkeeper.diveState.startX + (this.goalkeeper.diveState.targetX - this.goalkeeper.diveState.startX) * p;
      } else {
        // Acompanha a bola lateralmente no gol
        const idealX = Math.max(this.goalTop.x1 + 25, Math.min(this.goalTop.x2 - 25, this.ball.x));
        this.goalkeeper.x += (idealX - this.goalkeeper.x) * 0.08;
      }
    }

    // 3. Atualiza movimentação dos atletas
    this.players.forEach(p => {
      p.x += p.vx || 0;
      p.y += p.vy || 0;

      // Atletas sem a bola tentam interceptar ou acompanhar
      if (!p.isUser && !p.isGK && !p.isWall) {
        if (!this.ball.holder) {
          const bDist = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
          if (bDist < 120) {
            const angle = Math.atan2(this.ball.y - p.y, this.ball.x - p.x);
            p.vx = Math.cos(angle) * 1.8;
            p.vy = Math.sin(angle) * 1.8;
          }
        }
      }

      // Corredores do time do usuário aceleram para o espaço
      if (p.isUser && p.isRunner) {
        p.vy = -2.2;
      }
    });

    // 4. Checagem de recepção de passe por companheiro
    if (!this.ball.holder && this.ball.z < 12 && !this.highlightEnded) {
      for (const p of this.players) {
        const dist = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
        if (dist < 22) {
          if (p.isUser) {
            // Jogador recebeu o passe com sucesso!
            this.ball.holder = p;
            this.activePlayer = p;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.vz = 0;

            // Se for atacante recebendo cruzamento aéreo na área: cabeceia ou finaliza de primeira!
            if (this.ball.inAir || this.scenarioType === 'corner') {
              this.executeHeaderAttempt(p);
            }
            break;
          } else if (!p.isGK) {
            // Adversário interceptou a jogada!
            this.ball.holder = p;
            this.finishHighlight('intercept', 'INTERCEPTADO!', 'A defesa adversária cortou o passe.');
            break;
          }
        }
      }
    }

    // 5. Checagem de Gol ou Defesa no gol superior
    if (!this.highlightEnded) {
      this.checkGoalEvents();
    }
  },

  // Finalização de primeira / Cabeceio em cruzamento
  executeHeaderAttempt(player) {
    const shootStat = player.stats ? player.stats.shooting : 70;
    const targetX = 350 + Math.random() * 100;
    const dx = targetX - player.x;
    const dy = this.goalTop.y - player.y;
    const dist = Math.hypot(dx, dy);

    this.ball.holder = null;
    this.ball.vx = (dx / dist) * 10.5;
    this.ball.vy = (dy / dist) * 10.5;
    this.ball.vz = 2.0;
    this.ball.inAir = true;

    SoundEngine.playKick(true);
    this.triggerGoalkeeperDive(this.ball.x, this.ball.vx, this.ball.vy);
  },

  // Avalia se a bola entrou no gol ou se o goleiro espalmou
  checkGoalEvents() {
    // Checagem de defesa do goleiro adversário
    if (this.goalkeeper && this.ball.y < 100 && this.ball.y > 35) {
      const distToGk = Math.hypot(this.goalkeeper.x - this.ball.x, this.goalkeeper.y - this.ball.y);
      if (distToGk < 32 && this.ball.z < 26) {
        // Goleiro defendeu!
        SoundEngine.playSave();
        this.ball.vx = (Math.random() - 0.5) * 5;
        this.ball.vy = 4;
        this.finishHighlight('save', 'GRANDE DEFESA!', 'O goleiro espalmou para longe!');
        return;
      }
    }

    // Bola cruzou a linha do gol superior
    if (this.ball.y <= this.goalTop.y + 4) {
      if (this.ball.x >= this.goalTop.x1 && this.ball.x <= this.goalTop.x2 && this.ball.z < 28) {
        // GOOOOOOL!
        SoundEngine.playGoal();
        this.ball.vx *= 0.15;
        this.ball.vy *= 0.15;
        const scorerName = this.activePlayer ? this.activePlayer.name : 'Camisa11';
        this.finishHighlight('goal', '⚽ GOOOOOOL!', `${scorerName} balançou as redes!`);
      } else {
        // Chute para fora
        this.finishHighlight('miss', 'PARA FORA!', 'O chute passou raspando a trave.');
      }
      return;
    }

    // Bola saiu pelas laterais ou linha de fundo
    if (this.ball.x < 20 || this.ball.x > this.pitchWidth - 20 || this.ball.y > this.pitchHeight + 20) {
      this.finishHighlight('out', 'BOLA FORA!', 'A jogada terminou em tiro de meta.');
    }
  },

  // Finaliza o highlight e agenda retorno para a simulação contínua
  finishHighlight(type, title, subtext) {
    if (this.highlightEnded) return;
    this.highlightEnded = true;

    this.bannerType = type;
    this.bannerText = title;
    this.bannerSubtext = subtext;
    this.showBanner = true;

    setTimeout(() => {
      this.isActive = false;
      if (this.animId) cancelAnimationFrame(this.animId);
      if (this.onHighlightComplete) {
        this.onHighlightComplete({
          type,
          isUserGoal: type === 'goal',
          isRivalGoal: type === 'rival_goal',
          scorer: this.activePlayer
        });
      }
    }, 1400);
  },

  // Renderização gráfica em Canvas
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.pitchWidth, this.pitchHeight);

    // 1. Gramado com faixas verticais elegantes
    this.drawPitchTurf(ctx);

    // 2. Linhas do campo, áreas e círculos
    this.drawPitchMarkings(ctx);

    // 3. Traves e redes
    this.drawGoals(ctx);

    // 4. Trajetória prevista do gesto ao mirar
    this.drawAimGuide(ctx);

    // 5. Atletas
    this.drawPlayers(ctx);

    // 6. Bola de futebol com sombra e altura 3D
    this.drawBall(ctx);

    // 7. Banner de resultado do highlight (GOOOL, DEFESA, etc.)
    if (this.showBanner) {
      this.drawBanner(ctx);
    }
  },

  // Desenha gramado com faixas alternadas
  drawPitchTurf(ctx) {
    const stripeWidth = 50;
    const numStripes = Math.ceil(this.pitchWidth / stripeWidth);

    for (let i = 0; i < numStripes; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#166534' : '#15803d';
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, this.pitchHeight);
    }
  },

  // Desenha linhas brancas do campo
  drawPitchMarkings(ctx) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 3;

    // Linhas laterais externas
    ctx.strokeRect(40, 35, this.pitchWidth - 80, this.pitchHeight - 70);

    // Linha de meio campo
    ctx.beginPath();
    ctx.moveTo(40, this.pitchHeight / 2);
    ctx.lineTo(this.pitchWidth - 40, this.pitchHeight / 2);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(this.pitchWidth / 2, this.pitchHeight / 2, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Ponto central
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.pitchWidth / 2, this.pitchHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Grande Área Superior (Ataque)
    ctx.strokeRect(240, 35, 320, 140);
    // Pequena Área Superior
    ctx.strokeRect(320, 35, 160, 48);
    // Ponto do Pênalti Superior
    ctx.beginPath();
    ctx.arc(400, 130, 4, 0, Math.PI * 2);
    ctx.fill();
    // Meia-lua superior
    ctx.beginPath();
    ctx.arc(400, 130, 55, 0.6, Math.PI - 0.6);
    ctx.stroke();

    // Grande Área Inferior (Defesa)
    ctx.strokeRect(240, this.pitchHeight - 175, 320, 140);
    // Pequena Área Inferior
    ctx.strokeRect(320, this.pitchHeight - 83, 160, 48);
    // Ponto do Pênalti Inferior
    ctx.beginPath();
    ctx.arc(400, this.pitchHeight - 130, 4, 0, Math.PI * 2);
    ctx.fill();
    // Meia-lua inferior
    ctx.beginPath();
    ctx.arc(400, this.pitchHeight - 130, 55, Math.PI + 0.6, -0.6);
    ctx.stroke();
  },

  // Desenha os gols superior e inferior com efeito de profundidade de rede
  drawGoals(ctx) {
    // Gol Superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.goalTop.x1, this.goalTop.y - this.goalTop.depth, this.goalTop.x2 - this.goalTop.x1, this.goalTop.depth);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.goalTop.x1, this.goalTop.y - this.goalTop.depth, this.goalTop.x2 - this.goalTop.x1, this.goalTop.depth);

    // Traves redondas
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(this.goalTop.x1, this.goalTop.y, 5, 0, Math.PI * 2);
    ctx.arc(this.goalTop.x2, this.goalTop.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Gol Inferior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.goalBottom.x1, this.goalBottom.y, this.goalBottom.x2 - this.goalBottom.x1, this.goalBottom.depth);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.goalBottom.x1, this.goalBottom.y, this.goalBottom.x2 - this.goalBottom.x1, this.goalBottom.depth);

    ctx.beginPath();
    ctx.arc(this.goalBottom.x1, this.goalBottom.y, 5, 0, Math.PI * 2);
    ctx.arc(this.goalBottom.x2, this.goalBottom.y, 5, 0, Math.PI * 2);
    ctx.fill();
  },

  // Desenha indicador de mira e força do gesto
  drawAimGuide(ctx) {
    if (!this.pointer.isDown || !this.activePlayer || this.highlightEnded) return;

    const dx = this.pointer.currentX - this.pointer.startX;
    const dy = this.pointer.currentY - this.pointer.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 15) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.ball.x, this.ball.y);

    // Desenha linha curvada se houver curva no gesto
    if (this.pointer.points.length >= 4) {
      const mid = this.pointer.points[Math.floor(this.pointer.points.length / 2)];
      const devX = mid.x - ((this.pointer.startX + this.pointer.currentX) / 2);
      ctx.quadraticCurveTo(this.ball.x + dx * 0.5 + devX * 1.5, this.ball.y + dy * 0.5, this.ball.x + dx, this.ball.y + dy);
    } else {
      ctx.lineTo(this.ball.x + dx, this.ball.y + dy);
    }

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();

    // Círculo indicador na ponta da mira
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(this.ball.x + dx, this.ball.y + dy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // Desenha os atletas em campo
  drawPlayers(ctx) {
    this.players.forEach(p => {
      // Sombra sob o atleta
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 11, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Destaque luminoso pulsante no atleta controlado
      if (p === this.activePlayer) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Triângulo de foco sobre a cabeça
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(p.x - 5, p.y - 24);
        ctx.lineTo(p.x + 5, p.y - 24);
        ctx.lineTo(p.x, p.y - 18);
        ctx.closePath();
        ctx.fill();
      }

      // Círculo do uniforme do atleta
      ctx.fillStyle = p.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Borda com cor secundária
      ctx.strokeStyle = p.secColor || '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Letra ou número da posição
      ctx.fillStyle = p.secColor || '#ffffff';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.pos ? p.pos.substring(0, 3) : (p.isGK ? 'GK' : '10'), p.x, p.y);

      // Nome do atleta
      const displayName = p.name ? p.name.split(' ').pop() : '';
      ctx.font = '700 10px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(displayName, p.x, p.y - 15);
      ctx.shadowBlur = 0;
    });
  },

  // Desenha a bola de futebol com física 3D e sombra dinâmica
  drawBall(ctx) {
    const b = this.ball;

    // Sombra no chão (escala com a altura z)
    const shadowScale = Math.max(0.4, 1 - (b.z / 40));
    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.radius * shadowScale * 1.3, b.radius * shadowScale * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bola física desenhada na posição (x, y - z)
    const renderY = b.y - b.z;
    const renderRadius = b.radius + (b.z * 0.08);

    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, renderY, renderRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Detalhe de gomos pretos da bola
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(b.x, renderY, renderRadius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  // Desenha o banner de resultado da jogada
  drawBanner(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
    ctx.fillRect(0, this.pitchHeight / 2 - 60, this.pitchWidth, 120);

    const isGoal = this.bannerType === 'goal';
    ctx.font = '900 36px system-ui, sans-serif';
    ctx.fillStyle = isGoal ? '#10b981' : '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(this.bannerText, this.pitchWidth / 2, this.pitchHeight / 2 - 5);

    ctx.font = '600 15px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(this.bannerSubtext, this.pitchWidth / 2, this.pitchHeight / 2 + 30);
    ctx.restore();
  }
};
