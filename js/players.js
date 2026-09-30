/**
 * CAMISA11 — Football Tycoon
 * players.js — Geração Procedural, Atributos, Valorização e Evolução de Atletas
 */

const PlayerDB = {
  firstNames: [
    'Lucas', 'Gabriel', 'Mateus', 'Felipe', 'Rodrigo', 'Thiago', 'Vinicius', 'Bruno',
    'Gustavo', 'Rafael', 'Danilo', 'Diego', 'Igor', 'Pedro', 'Arthur', 'Henrique',
    'Bernardo', 'Cauã', 'Davi', 'Enzo', 'Leonardo', 'Renan', 'Victor', 'Samuel',
    'Eduardo', 'Caio', 'Marcos', 'Alexandre', 'Yuri', 'Patrick', 'Murilo', 'Ruan',
    'Guilherme', 'Kayke', 'Nicolas', 'Breno', 'Wesley', 'Endrick', 'Lorran', 'Estêvão'
  ],

  lastNames: [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
    'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
    'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade',
    'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos',
    'Gonçalves', 'Santana', 'Teixeira', 'Moura', 'Cavalcanti', 'Pinto', 'Batista'
  ],

  nicknames: [
    'Canhotinha', 'Pedrinho', 'Gabigol', 'Dudu', 'Zezinho', 'Pelezinho', 'Furacão',
    'Imperador', 'Foguete', 'Mágico', 'Paredão', 'Xerife', 'Maestro', 'Flecha',
    'Pitbull', 'Motorzinho', 'Artilheiro', 'Raio', 'Fenômeno', 'Monstro'
  ],

  positions: [
    { pos: 'GOL', label: 'Goleiro', area: 'defesa' },
    { pos: 'ZAG', label: 'Zagueiro', area: 'defesa' },
    { pos: 'LD',  label: 'Lateral Direito', area: 'defesa' },
    { pos: 'LE',  label: 'Lateral Esquerdo', area: 'defesa' },
    { pos: 'VOL', label: 'Volante', area: 'meio' },
    { pos: 'MC',  label: 'Meio-Campo', area: 'meio' },
    { pos: 'MEI', label: 'Meia Ofensivo', area: 'meio' },
    { pos: 'PD',  label: 'Ponta Direita', area: 'ataque' },
    { pos: 'PE',  label: 'Ponta Esquerda', area: 'ataque' },
    { pos: 'ATA', label: 'Centroavante', area: 'ataque' }
  ],

  // Gera um nome brasileiro realista com chance de apelido carismático
  generateName(useNicknameChance = 0.25) {
    if (Math.random() < useNicknameChance) {
      const nick = this.nicknames[Math.floor(Math.random() * this.nicknames.length)];
      const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      return `${first} "${nick}"`;
    }
    const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
    const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
    return `${first} ${last}`;
  },

  // Calcula o valor de mercado justo e dinâmico de um jogador
  calculateMarketValue(ovr, potential, age, form = 'regular') {
    // Fórmula base exponencial por OVR
    // OVR 50: ~R$ 30.000 | OVR 60: ~R$ 200.000 | OVR 70: ~R$ 1.800.000 | OVR 80: ~R$ 15.000.000 | OVR 90+: R$ 70.000.000+
    const baseValue = Math.pow(ovr / 21.5, 4.2) * 10000;
    
    // Multiplicador de Potencial vs Idade (jovens com alto teto valem fortuna!)
    let ageMultiplier = 1.0;
    if (age <= 18) ageMultiplier = 1.6 + ((potential - ovr) * 0.05);
    else if (age <= 21) ageMultiplier = 1.35 + ((potential - ovr) * 0.03);
    else if (age <= 25) ageMultiplier = 1.1 + ((potential - ovr) * 0.015);
    else if (age <= 29) ageMultiplier = 0.95;
    else if (age <= 33) ageMultiplier = 0.7;
    else ageMultiplier = 0.45; // Veterano

    // Bônus de fase recente
    let formMultiplier = 1.0;
    if (form === 'em_alta') formMultiplier = 1.35;
    else if (form === 'boa') formMultiplier = 1.15;
    else if (form === 'baixa') formMultiplier = 0.85;

    const finalVal = Math.round((baseValue * ageMultiplier * formMultiplier) / 1000) * 1000;
    return Math.max(15000, finalVal);
  },

  // Salário semanal proporcional ao valor e OVR
  calculateWeeklySalary(ovr, value) {
    const baseWage = Math.pow(ovr / 18, 3.8) * 120;
    const valueWage = value * 0.003;
    const finalWage = Math.round((baseWage + valueWage) / 100) * 100;
    return Math.max(800, finalWage);
  },

  // Gera um jogador individual
  createPlayer(options = {}) {
    const posObj = options.pos 
      ? this.positions.find(p => p.pos === options.pos) 
      : this.positions[Math.floor(Math.random() * this.positions.length)];
    
    const age = options.age || Math.floor(Math.random() * 16) + 17; // 17 a 32 anos
    const ovr = options.ovr || Math.floor(Math.random() * 15) + 50; // 50 a 65
    
    // Potencial sempre >= OVR, jovens têm margem de crescimento muito maior
    let potBonus = 0;
    if (age <= 19) potBonus = Math.floor(Math.random() * 22) + 8; // Jovens podem ter até +30 de potencial
    else if (age <= 23) potBonus = Math.floor(Math.random() * 14) + 4;
    else if (age <= 27) potBonus = Math.floor(Math.random() * 6) + 1;
    else potBonus = 0; // Acima de 28 anos atingiu o pico

    const potential = Math.min(99, options.potential || (ovr + potBonus));
    const form = options.form || (['boa', 'regular', 'regular', 'em_alta'][Math.floor(Math.random() * 4)]);
    
    const marketValue = options.marketValue || this.calculateMarketValue(ovr, potential, age, form);
    const initialValue = options.initialValue || marketValue;
    const salary = this.calculateWeeklySalary(ovr, marketValue);

    return {
      id: 'ply_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      name: options.name || this.generateName(options.nicknameChance),
      age: age,
      pos: posObj.pos,
      posLabel: posObj.label,
      area: posObj.area,
      ovr: ovr,
      potential: potential,
      initialValue: initialValue,
      marketValue: marketValue,
      salary: salary,
      energy: 100, // 0 a 100
      morale: 90,  // 0 a 100
      form: form,  // 'em_alta', 'boa', 'regular', 'baixa'
      contractWeeks: options.contractWeeks || 52, // semanas de contrato
      isStarter: options.isStarter !== undefined ? options.isStarter : false,
      stats: {
        matches: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        mvpCount: 0
      }
    };
  },

  // Gera o elenco inicial para um clube recém-fundado (16 jogadores balanceados)
  generateInitialSquad(targetOvr = 56) {
    const requiredPositions = [
      // 11 Titulares (4-3-3 clássico brasileiro)
      { pos: 'GOL', titular: true, age: 24, ovrBonus: 0 },
      { pos: 'LD',  titular: true, age: 22, ovrBonus: -1 },
      { pos: 'ZAG', titular: true, age: 27, ovrBonus: +1 },
      { pos: 'ZAG', titular: true, age: 23, ovrBonus: 0 },
      { pos: 'LE',  titular: true, age: 21, ovrBonus: -1 },
      { pos: 'VOL', titular: true, age: 26, ovrBonus: 0 },
      { pos: 'MC',  titular: true, age: 25, ovrBonus: 0 },
      { pos: 'MEI', titular: true, age: 18, ovrBonus: +2, isProdigy: true }, // Jóia da casa!
      { pos: 'PD',  titular: true, age: 20, ovrBonus: 0 },
      { pos: 'PE',  titular: true, age: 22, ovrBonus: -1 },
      { pos: 'ATA', titular: true, age: 25, ovrBonus: +2 },
      
      // 5 Reservas
      { pos: 'GOL', titular: false, age: 19, ovrBonus: -4 },
      { pos: 'ZAG', titular: false, age: 20, ovrBonus: -3 },
      { pos: 'VOL', titular: false, age: 28, ovrBonus: -2 },
      { pos: 'MEI', titular: false, age: 17, ovrBonus: -3, isProdigy: true }, // Segunda jóia!
      { pos: 'ATA', titular: false, age: 21, ovrBonus: -2 }
    ];

    return requiredPositions.map((cfg) => {
      let ovr = targetOvr + cfg.ovrBonus;
      let potential = ovr;
      if (cfg.isProdigy) {
        potential = ovr + Math.floor(Math.random() * 12) + 20; // 80 a 90 de potencial!
      } else if (cfg.age <= 22) {
        potential = ovr + Math.floor(Math.random() * 10) + 6;
      }
      return this.createPlayer({
        pos: cfg.pos,
        age: cfg.age,
        ovr: ovr,
        potential: Math.min(99, potential),
        isStarter: cfg.titular
      });
    });
  },

  // Recalcula o OVR médio do time titular ou completo
  calculateTeamRating(players, startersOnly = true) {
    const list = startersOnly ? players.filter(p => p.isStarter) : players;
    if (!list.length) return 50;
    const sum = list.reduce((acc, p) => acc + p.ovr, 0);
    return Math.round(sum / list.length);
  },

  // Atualiza o valor de mercado de um jogador após evolução/partida
  updatePlayerValuation(player) {
    const newVal = this.calculateMarketValue(player.ovr, player.potential, player.age, player.form);
    player.marketValue = newVal;
    player.salary = this.calculateWeeklySalary(player.ovr, newVal);
    return player;
  },

  // Retorna a valorização percentual desde que o jogador foi adquirido/iniciado
  getValuationROI(player) {
    if (!player.initialValue || player.initialValue <= 0) return 0;
    const diff = player.marketValue - player.initialValue;
    return Math.round((diff / player.initialValue) * 100);
  },

  // Evolução pós-partida ou pós-treinamento
  evolvePlayer(player, ctFacilityLevel = 1, matchRating = 7.0) {
    // Jogadores com mais de 31 anos começam a estagnar ou declinar suavemente
    if (player.age >= 32) {
      if (Math.random() < 0.08) {
        player.ovr = Math.max(40, player.ovr - 1);
        this.updatePlayerValuation(player);
      }
      return false;
    }

    // Se ainda tem potencial para crescer
    if (player.ovr < player.potential) {
      // Chance base de subir 1 ponto de OVR
      // Influenciado pela juventude, nível do Centro de Treinamento e desempenho
      const ageBoost = Math.max(0, (26 - player.age) * 0.02);
      const ctBoost = ctFacilityLevel * 0.025;
      const perfBoost = (matchRating - 6.0) * 0.03;
      const growthChance = 0.08 + ageBoost + ctBoost + perfBoost;

      if (Math.random() < growthChance) {
        player.ovr += 1;
        this.updatePlayerValuation(player);
        return true; // Notifica que subiu de OVR!
      }
    }
    return false;
  }
};

window.PlayerDB = PlayerDB;
