/**
 * CAMISA11 — "Seu clube. Sua história."
 * js/database.js — DATA PROVIDER (Camada Oficial de Acesso a Dados e Modelos)
 * 
 * Centraliza e abstrai todo o acesso aos dados esportivos, competições,
 * estádios, clubes e atletas. Permite expansões futuras sem alterar o motor.
 */

const DataProvider = {
  clubs: new Map(),
  players: new Map(),
  competitions: new Map(),
  stadiums: new Map(),
  isLoaded: false,

  // Inicializa o Data Provider (detecta ambiente Node.js, HTTP ou fallback offline)
  async init() {
    try {
      if (typeof window === 'undefined' && typeof require !== 'undefined') {
        // Ambiente Node.js (testes automatizados)
        this.loadFromNodeFS();
      } else if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
        // Ambiente Navegador com servidor HTTP/HTTPS
        await this.loadFromJSON();
      } else {
        // Fallback offline (execução local direta via duplo clique file://)
        this.loadEmbeddedDefaults();
      }
    } catch (err) {
      console.warn('DataProvider: Falha ao carregar JSON, aplicando fallback embutido.', err);
      this.loadEmbeddedDefaults();
    }
    this.isLoaded = true;
    return true;
  },

  // Carrega arquivos JSON no ambiente Node.js
  loadFromNodeFS() {
    const fs = require('fs');
    const path = require('path');
    const basePath = path.resolve(__dirname, '../data');

    const compRes = JSON.parse(fs.readFileSync(path.join(basePath, 'competitions.json'), 'utf8'));
    const stadRes = JSON.parse(fs.readFileSync(path.join(basePath, 'stadiums.json'), 'utf8'));
    const clubRes = JSON.parse(fs.readFileSync(path.join(basePath, 'clubs.json'), 'utf8'));
    const playRes = JSON.parse(fs.readFileSync(path.join(basePath, 'players.json'), 'utf8'));

    this.competitions.clear();
    (compRes.competitions || []).forEach(c => this.competitions.set(c.id, c));

    this.stadiums.clear();
    (stadRes.stadiums || []).forEach(s => this.stadiums.set(s.id, s));

    this.clubs.clear();
    (clubRes.clubs || []).forEach(c => this.clubs.set(c.id, c));

    this.players.clear();
    (playRes.players || []).forEach(p => this.players.set(p.id, p));
  },

  // Carrega dos arquivos JSON via fetch no navegador
  async loadFromJSON() {
    const [compRes, stadRes, clubRes, playRes] = await Promise.all([
      fetch('data/competitions.json').then(r => r.json()),
      fetch('data/stadiums.json').then(r => r.json()),
      fetch('data/clubs.json').then(r => r.json()),
      fetch('data/players.json').then(r => r.json())
    ]);

    this.competitions.clear();
    (compRes.competitions || []).forEach(c => this.competitions.set(c.id, c));

    this.stadiums.clear();
    (stadRes.stadiums || []).forEach(s => this.stadiums.set(s.id, s));

    this.clubs.clear();
    (clubRes.clubs || []).forEach(c => this.clubs.set(c.id, c));

    this.players.clear();
    (playRes.players || []).forEach(p => this.players.set(p.id, p));
  },

  // Fallback embutido com suporte a múltiplas divisões (funciona offline via file://)
  loadEmbeddedDefaults() {
    const defaultCompetitions = [
      { id: 'brasileirao_serie_a', name: 'Campeonato Brasileiro Série A', shortName: 'Série A', country: 'Brasil', type: 'league', tier: 1, teamsCount: 20, rounds: 38, promotionSpots: 0, relegationSpots: 4, prizePool: { champion: 48000000 } },
      { id: 'brasileirao_serie_b', name: 'Campeonato Brasileiro Série B', shortName: 'Série B', country: 'Brasil', type: 'league', tier: 2, teamsCount: 20, rounds: 38, promotionSpots: 4, relegationSpots: 4, prizePool: { champion: 18000000 } },
      { id: 'brasileirao_serie_c', name: 'Campeonato Brasileiro Série C', shortName: 'Série C', country: 'Brasil', type: 'league', tier: 3, teamsCount: 20, rounds: 19, promotionSpots: 4, relegationSpots: 4, prizePool: { champion: 6000000 } },
      { id: 'brasileirao_serie_d', name: 'Campeonato Brasileiro Série D', shortName: 'Série D', country: 'Brasil', type: 'league', tier: 4, teamsCount: 20, rounds: 19, promotionSpots: 4, relegationSpots: 0, prizePool: { champion: 3000000 } },
      { id: 'copa_do_brasil', name: 'Copa do Brasil', shortName: 'Copa do Brasil', country: 'Brasil', type: 'cup', tier: 1, format: 'knockout', teamsCount: 32 },
      { id: 'estadual_sp', name: 'Campeonato Paulista', shortName: 'Paulistão', state: 'SP', country: 'Brasil', type: 'state', tier: 1, teamsCount: 16 }
    ];
    defaultCompetitions.forEach(c => this.competitions.set(c.id, c));

    const defaultClubs = [
      { id: 'corinthians', name: 'Corinthians', shortName: 'COR', city: 'São Paulo', state: 'SP', division: 'brasileirao_serie_a', tier: 1, reputation: 88, ovr: 81, budget: 45000000, stadium: 'Neo Química Arena', primaryColor: '#000000', secondaryColor: '#ffffff', badgeShape: 'shield', badgeSymbol: 'anchor' },
      { id: 'palmeiras', name: 'Palmeiras', shortName: 'PAL', city: 'São Paulo', state: 'SP', division: 'brasileirao_serie_a', tier: 1, reputation: 91, ovr: 84, budget: 75000000, stadium: 'Allianz Parque', primaryColor: '#046a38', secondaryColor: '#ffffff', badgeShape: 'circle', badgeSymbol: 'star' },
      { id: 'flamengo', name: 'Flamengo', shortName: 'FLA', city: 'Rio de Janeiro', state: 'RJ', division: 'brasileirao_serie_a', tier: 1, reputation: 92, ovr: 85, budget: 90000000, stadium: 'Maracanã', primaryColor: '#c8102e', secondaryColor: '#000000', badgeShape: 'shield', badgeSymbol: 'crest' },
      { id: 'sao_paulo', name: 'São Paulo', shortName: 'SAO', city: 'São Paulo', state: 'SP', division: 'brasileirao_serie_a', tier: 1, reputation: 87, ovr: 80, budget: 35000000, stadium: 'MorumBIS', primaryColor: '#da291c', secondaryColor: '#ffffff', badgeShape: 'diamond', badgeSymbol: 'star' },
      { id: 'santos', name: 'Santos', shortName: 'SAN', city: 'Santos', state: 'SP', division: 'brasileirao_serie_a', tier: 1, reputation: 84, ovr: 78, budget: 25000000, stadium: 'Vila Belmiro', primaryColor: '#ffffff', secondaryColor: '#000000', badgeShape: 'shield', badgeSymbol: 'crown' },
      { id: 'sport_recife', name: 'Sport Recife', shortName: 'SPT', city: 'Recife', state: 'PE', division: 'brasileirao_serie_b', tier: 2, reputation: 79, ovr: 75, budget: 18000000, stadium: 'Ilha do Retiro', primaryColor: '#c8102e', secondaryColor: '#000000', badgeShape: 'shield', badgeSymbol: 'lion' },
      { id: 'ceara', name: 'Ceará', shortName: 'CEA', city: 'Fortaleza', state: 'CE', division: 'brasileirao_serie_b', tier: 2, reputation: 78, ovr: 74, budget: 17000000, stadium: 'Castelão', primaryColor: '#000000', secondaryColor: '#ffffff', badgeShape: 'shield', badgeSymbol: 'star' },
      { id: 'nautico', name: 'Náutico', shortName: 'NAU', city: 'Recife', state: 'PE', division: 'brasileirao_serie_c', tier: 3, reputation: 73, ovr: 69, budget: 6500000, stadium: 'Aflitos', primaryColor: '#c8102e', secondaryColor: '#ffffff', badgeShape: 'shield', badgeSymbol: 'anchor' },
      { id: 'santa_cruz', name: 'Santa Cruz', shortName: 'STC', city: 'Recife', state: 'PE', division: 'brasileirao_serie_d', tier: 4, reputation: 71, ovr: 68, budget: 5000000, stadium: 'Arruda', primaryColor: '#c8102e', secondaryColor: '#ffffff', badgeShape: 'shield', badgeSymbol: 'crest' },
      { id: 'camisa11', name: 'CAMISA11 FC', shortName: 'C11', city: 'São Paulo', state: 'SP', division: 'brasileirao_serie_d', tier: 4, reputation: 65, ovr: 70, budget: 8000000, stadium: 'Arena Camisa11', primaryColor: '#0f172a', secondaryColor: '#10b981', badgeShape: 'shield', badgeSymbol: 'ball' }
    ];
    defaultClubs.forEach(c => this.clubs.set(c.id, c));
  },

  // --------------------------------------------------------------------------
  // MÉTODOS OFICIAIS DO DATA PROVIDER (Regra 56)
  // --------------------------------------------------------------------------

  // Obtém clube por ID
  getClub(id) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.clubs.get(id) || null;
  },

  // Obtém todos os clubes registrados
  getAllClubs() {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return Array.from(this.clubs.values());
  },

  // Obtém clubes por divisão
  getClubsByDivision(divisionId) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.getAllClubs().filter(c => c.division === divisionId);
  },

  // Obtém clubes por nível de divisão (Tier 1 = Série A, 2 = Série B, etc.)
  getClubsByTier(tier) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.getAllClubs().filter(c => c.tier === Number(tier));
  },

  // Obtém clubes por estado da federação
  getClubsByState(stateCode) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    const uf = String(stateCode).toUpperCase();
    return this.getAllClubs().filter(c => c.state === uf);
  },

  // Obtém jogador por ID
  getPlayer(id) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.players.get(id) || null;
  },

  // Obtém todos os jogadores registrados no banco
  getAllPlayers() {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return Array.from(this.players.values());
  },

  // Obtém todos os jogadores de um clube específico
  getTeamPlayers(clubId) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    const team = [];
    for (const player of this.players.values()) {
      if (player.clubId === clubId) {
        team.push(player);
      }
    }

    // Se o clube possuir menos de 20 jogadores registrados, completa o elenco até 22 atletas
    if (team.length < 20) {
      const club = this.getClub(clubId);
      const generated = this.generateSquadForClub(club || { id: clubId, name: 'Clube', ovr: 70 });
      if (team.length === 0) {
        generated.forEach(p => {
          this.players.set(p.id, p);
          team.push(p);
        });
      } else {
        const needed = 22 - team.length;
        for (let i = 0; i < needed; i++) {
          const genPlayer = (i < generated.length) ? generated[i] : this.generatePlayer({ clubId: club.id, overall: club.ovr });
          this.players.set(genPlayer.id, genPlayer);
          team.push(genPlayer);
        }
      }
    }

    return team;
  },

  // Obtém competição por ID
  getCompetition(id) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.competitions.get(id) || null;
  },

  // Obtém todas as competições registradas
  getAllCompetitions() {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return Array.from(this.competitions.values());
  },

  // Obtém estádio por ID
  getStadium(id) {
    if (!this.isLoaded) this.loadEmbeddedDefaults();
    return this.stadiums.get(id) || null;
  },

  // Obtém os times participantes de uma liga
  getLeagueTeams(competitionId) {
    return this.getClubsByDivision(competitionId);
  },

  // --------------------------------------------------------------------------
  // CONSULTAS AVANÇADAS E FILTROS (Regras 4 e 17)
  // --------------------------------------------------------------------------

  // Busca clubes com múltiplos critérios (nome, cidade, estado, divisão) - Regra 4
  searchClubs(filters = {}) {
    let results = this.getAllClubs();

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.shortName && c.shortName.toLowerCase().includes(q)) ||
        (c.sigla && c.sigla.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q))
      );
    }

    if (filters.division && filters.division !== 'ALL') {
      if (filters.division === 'ESTADUAIS') {
        results = results.filter(c => Boolean(c.stateLeagueId));
      } else {
        results = results.filter(c => c.division === filters.division);
      }
    }

    if (filters.tier) {
      results = results.filter(c => c.tier === Number(filters.tier));
    }

    if (filters.state && filters.state !== 'ALL') {
      const uf = filters.state.toUpperCase();
      results = results.filter(c => c.state === uf);
    }

    if (filters.minOvr) {
      results = results.filter(c => (c.ovr || 0) >= filters.minOvr);
    }

    return results;
  },

  // Busca jogadores com múltiplos critérios (nome, posição, faixa de preço, etc.)
  searchPlayers(filters = {}) {
    let results = this.getAllPlayers();

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(p => p.name.toLowerCase().includes(q));
    }

    if (filters.position && filters.position !== 'ALL') {
      if (['GK', 'GOL'].includes(filters.position)) {
        results = results.filter(p => p.position === 'GOL');
      } else if (['DEF'].includes(filters.position)) {
        results = results.filter(p => ['ZAG', 'LD', 'LE'].includes(p.position));
      } else if (['MID', 'MEI'].includes(filters.position)) {
        results = results.filter(p => ['VOL', 'MC', 'MEI'].includes(p.position));
      } else if (['ATT', 'ATA'].includes(filters.position)) {
        results = results.filter(p => ['ATA', 'PD', 'PE', 'SA'].includes(p.position));
      } else {
        results = results.filter(p => p.position === filters.position);
      }
    }

    if (filters.freeAgentsOnly) {
      results = results.filter(p => !p.clubId);
    } else if (filters.clubId !== undefined) {
      results = results.filter(p => p.clubId === filters.clubId);
    }

    if (filters.minOvr) {
      results = results.filter(p => p.overall >= filters.minOvr);
    }

    if (filters.maxOvr) {
      results = results.filter(p => p.overall <= filters.maxOvr);
    }

    if (filters.maxPrice) {
      results = results.filter(p => (p.value || 0) <= filters.maxPrice);
    }

    if (filters.maxAge) {
      results = results.filter(p => p.age <= filters.maxAge);
    }

    return results;
  },

  // --------------------------------------------------------------------------
  // CRIAÇÃO E GERAÇÃO PROCEDURAL REALISTA
  // --------------------------------------------------------------------------

  // Registra um clube personalizado (Regra 5)
  createClub(customData) {
    const id = customData.id || `custom_${Date.now()}`;
    const division = customData.division || 'brasileirao_serie_d';

    // Calibração procedural conforme a divisão inicial escolhida (Regra 5)
    let defOvr = 64;
    let defRep = 45;
    let defBudget = 2500000;
    let defWage = 500000;
    let defTier = 4;
    let defCapacity = 10000;

    if (division === 'brasileirao_serie_a') {
      defOvr = 76;
      defRep = 75;
      defBudget = 12000000;
      defWage = 2500000;
      defTier = 1;
      defCapacity = 32000;
    } else if (division === 'brasileirao_serie_b') {
      defOvr = 72;
      defRep = 65;
      defBudget = 6500000;
      defWage = 1400000;
      defTier = 2;
      defCapacity = 20000;
    } else if (division === 'brasileirao_serie_c') {
      defOvr = 68;
      defRep = 55;
      defBudget = 4000000;
      defWage = 900000;
      defTier = 3;
      defCapacity = 14000;
    }

    const stateUf = (customData.state || 'SP').toUpperCase();
    const stateLeagueMap = {
      'SP': 'estadual_sp',
      'RJ': 'estadual_rj',
      'MG': 'estadual_mg',
      'RS': 'estadual_rs',
      'PR': 'estadual_pr',
      'BA': 'estadual_ba',
      'CE': 'estadual_ce',
      'PE': 'estadual_pe'
    };

    const sName = customData.shortName || customData.sigla || 'Clube';
    const sigla = (customData.sigla || customData.shortName || 'CLB').toUpperCase().slice(0, 4);
    const finalOvr = customData.ovr || defOvr;

    const club = {
      id: id,
      name: customData.name || 'Meu Clube FC',
      shortName: sName,
      sigla: sigla,
      city: customData.city || 'São Paulo',
      state: stateUf,
      country: customData.country || 'Brasil',
      division: division,
      tier: customData.tier || defTier,
      stateLeagueId: customData.stateLeagueId || stateLeagueMap[stateUf] || 'estadual_sp',
      reputation: customData.reputation || defRep,
      ovr: finalOvr,
      attack: customData.attack || (finalOvr + 1),
      midfield: customData.midfield || finalOvr,
      defense: customData.defense || (finalOvr - 1),
      budget: customData.budget || defBudget,
      wageBudget: customData.wageBudget || defWage,
      stadium: customData.stadium || `Arena ${sName}`,
      stadiumId: 'arena_custom',
      capacity: customData.capacity || defCapacity,
      primaryColor: customData.primaryColor || '#0f172a',
      secondaryColor: customData.secondaryColor || '#10b981',
      tertiaryColor: customData.tertiaryColor || '#f8fafc',
      badgeShape: customData.badgeShape || 'shield',
      badgePattern: customData.badgePattern || 'solid',
      badgeSymbol: customData.badgeSymbol || 'ball',
      staff: {
        assistantCoach: 'Carlos Alberto (Adjunto)',
        physio: 'Dr. Roberto Mendes (Médico)',
        scout: 'Marcos Vinicius (Olheiro Chefe)'
      },
      isCustom: true
    };
    this.clubs.set(id, club);
    return club;
  },

  // Gera um jogador balanceado com todos os 12 atributos e posições (Regra 14)
  generatePlayer(options = {}) {
    const firstNames = ['Lucas', 'Gabriel', 'Matheus', 'Felipe', 'Bruno', 'Rodrigo', 'Thiago', 'Danilo', 'Kauan', 'Vinicius', 'Henrique', 'Diego', 'Rafael', 'Arthur', 'Gustavo', 'Pedro', 'Bernardo', 'Cauã', 'Enzo', 'Leonardo', 'Murilo', 'Samuel', 'Eduardo', 'Caio', 'Davi', 'Lucca'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira'];
    const positions = ['GOL', 'LD', 'LE', 'ZAG', 'VOL', 'MC', 'MEI', 'PD', 'PE', 'ATA'];

    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const pos = options.position || positions[Math.floor(Math.random() * positions.length)];
    const age = options.age || Math.floor(17 + Math.random() * 16);
    const targetOvr = options.overall || 70;

    // Jovens têm margem de evolução maior (Regra 15 e 16)
    const potBoost = age <= 21 ? Math.floor(4 + Math.random() * 12) : age <= 25 ? Math.floor(1 + Math.random() * 6) : 0;
    const pot = Math.min(96, Math.max(targetOvr, targetOvr + potBoost));

    const clamp = (val) => Math.max(25, Math.min(99, Math.round(val)));
    const spread = () => Math.floor(Math.random() * 9) - 4;

    const player = {
      id: options.id || `p_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      name: `${fn} ${ln}`,
      age: age,
      nationality: options.nationality || 'Brasil',
      position: pos,
      number: options.number || Math.floor(1 + Math.random() * 99),
      preferredFoot: Math.random() > 0.3 ? 'Destro' : 'Canhoto',
      overall: targetOvr,
      potential: pot,
      // 12 Atributos Essenciais
      pace: clamp(targetOvr + spread() + (['PD', 'PE', 'LD', 'LE'].includes(pos) ? 8 : -3)),
      acceleration: clamp(targetOvr + spread() + (['PD', 'PE', 'ATA'].includes(pos) ? 6 : -2)),
      shooting: clamp(targetOvr + spread() + (['ATA', 'MEI', 'PD', 'PE', 'SA'].includes(pos) ? 7 : -18)),
      passing: clamp(targetOvr + spread() + (['MC', 'MEI', 'VOL'].includes(pos) ? 7 : -4)),
      vision: clamp(targetOvr + spread() + (['MEI', 'MC'].includes(pos) ? 8 : -5)),
      dribbling: clamp(targetOvr + spread() + (['PD', 'PE', 'MEI', 'ATA'].includes(pos) ? 8 : -8)),
      ballControl: clamp(targetOvr + spread() + (['MEI', 'MC', 'ATA'].includes(pos) ? 5 : -4)),
      marking: clamp(targetOvr + spread() + (['ZAG', 'VOL', 'LD', 'LE'].includes(pos) ? 8 : -22)),
      tackling: clamp(targetOvr + spread() + (['ZAG', 'VOL'].includes(pos) ? 9 : -22)),
      strength: clamp(targetOvr + spread() + (['ZAG', 'ATA', 'VOL'].includes(pos) ? 6 : -3)),
      stamina: clamp(targetOvr + spread() + (['VOL', 'MC', 'LD', 'LE'].includes(pos) ? 6 : 2)),
      heading: clamp(targetOvr + spread() + (['ZAG', 'ATA'].includes(pos) ? 8 : -10)),
      // Finanças e Contrato
      value: Math.round(targetOvr * targetOvr * 320 * (1 + (pot - targetOvr) * 0.08)),
      salary: Math.round(targetOvr * targetOvr * 6.5),
      contractYears: 2 + Math.floor(Math.random() * 3),
      clubId: options.clubId || null,
      morale: 85,
      form: 80,
      energy: 100
    };

    // Atributos específicos de Goleiro
    if (pos === 'GOL') {
      player.gkReflexes = clamp(targetOvr + spread() + 4);
      player.gkDiving = clamp(targetOvr + spread() + 3);
      player.gkHandling = clamp(targetOvr + spread());
      player.gkPositioning = clamp(targetOvr + spread() + 2);
      player.shooting = 18;
      player.marking = 18;
      player.tackling = 20;
    }

    return player;
  },

  // Gera um elenco equilibrado de 22 atletas (titulares e reservas para todas as posições)
  generateSquadForClub(club, targetOvr = null) {
    const ovr = targetOvr || club.ovr || 70;
    const squadSchema = [
      { pos: 'GOL', num: 1, starter: true },
      { pos: 'GOL', num: 12, starter: false },
      { pos: 'LD', num: 2, starter: true },
      { pos: 'LD', num: 13, starter: false },
      { pos: 'ZAG', num: 3, starter: true },
      { pos: 'ZAG', num: 4, starter: true },
      { pos: 'ZAG', num: 14, starter: false },
      { pos: 'ZAG', num: 15, starter: false },
      { pos: 'LE', num: 6, starter: true },
      { pos: 'LE', num: 16, starter: false },
      { pos: 'VOL', num: 5, starter: true },
      { pos: 'VOL', num: 17, starter: false },
      { pos: 'MC', num: 8, starter: true },
      { pos: 'MC', num: 18, starter: false },
      { pos: 'MEI', num: 10, starter: true },
      { pos: 'MEI', num: 20, starter: false },
      { pos: 'PD', num: 7, starter: true },
      { pos: 'PE', num: 11, starter: true },
      { pos: 'PD', num: 21, starter: false },
      { pos: 'PE', num: 22, starter: false },
      { pos: 'ATA', num: 9, starter: true },
      { pos: 'ATA', num: 19, starter: false }
    ];

    const squad = squadSchema.map(slot => {
      const playerOvr = slot.starter
        ? Math.max(50, ovr + Math.floor(Math.random() * 5) - 2)
        : Math.max(48, ovr - Math.floor(2 + Math.random() * 4));

      return this.generatePlayer({
        clubId: club.id,
        position: slot.pos,
        number: slot.num,
        overall: playerOvr
      });
    });

    return squad;
  }
};

// Exporta para Node.js (testes) ou Window (Navegador)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataProvider;
}
