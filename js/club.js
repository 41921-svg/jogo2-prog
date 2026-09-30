/**
 * CAMISA11 — Football Career & Manager
 * club.js — Gerador de Escudos SVG, Criação de Clubes e Geração de Elenco Equilibrado
 */

const ClubManager = {
  // Renderiza um escudo vetorial SVG baseado nas propriedades do clube
  renderBadge(club, size = 48) {
    if (!club) return '';
    const primary = club.primaryColor || '#0f172a';
    const secondary = club.secondaryColor || '#10b981';
    const shape = club.badgeShape || 'shield';
    const symbol = club.badgeSymbol || 'ball';
    const strokeWidth = Math.max(2, Math.round(size / 24));

    let shapePath = '';
    // ViewBox é 100 100
    switch (shape) {
      case 'circle':
        shapePath = `<circle cx="50" cy="50" r="44" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}"/>`;
        break;
      case 'diamond':
        shapePath = `<polygon points="50,4 96,50 50,96 4,50" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}" stroke-linejoin="round"/>`;
        break;
      case 'star':
        shapePath = `<polygon points="50,4 63,33 95,36 71,58 78,89 50,73 22,89 29,58 5,36 37,33" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 1.5}" stroke-linejoin="round"/>`;
        break;
      case 'hexagon':
        shapePath = `<polygon points="50,6 92,28 92,72 50,94 8,72 8,28" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}" stroke-linejoin="round"/>`;
        break;
      case 'crest':
        shapePath = `<path d="M 12 10 Q 50 18 88 10 L 88 56 Q 88 88 50 96 Q 12 88 12 56 Z" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}" stroke-linejoin="round"/>`;
        break;
      case 'shield':
      default:
        shapePath = `<path d="M 10 12 L 90 12 L 84 56 Q 80 86 50 96 Q 20 86 16 56 Z" fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}" stroke-linejoin="round"/>`;
        break;
    }

    let symbolSvg = '';
    switch (symbol) {
      case 'star':
        symbolSvg = `<polygon points="50,30 55,42 68,43 58,52 61,65 50,58 39,65 42,52 32,43 45,42" fill="${secondary}"/>`;
        break;
      case 'crown':
        symbolSvg = `<path d="M 30 64 L 70 64 L 74 44 L 62 52 L 50 36 L 38 52 L 26 44 Z" fill="${secondary}" stroke="${secondary}" stroke-width="2"/>`;
        break;
      case 'eagle':
        symbolSvg = `<path d="M 50 35 Q 32 42 24 56 Q 40 54 50 64 Q 60 54 76 56 Q 68 42 50 35 Z" fill="${secondary}"/>`;
        break;
      case 'lightning':
        symbolSvg = `<polygon points="54,28 36,52 48,52 44,72 64,46 52,46" fill="${secondary}"/>`;
        break;
      case 'lion':
        symbolSvg = `<path d="M 50 32 C 40 32 35 42 36 50 C 37 58 45 66 50 66 C 55 66 63 58 64 50 C 65 42 60 32 50 32 Z M 44 48 A 2 2 0 1 1 44 46 Z M 56 48 A 2 2 0 1 1 56 46 Z" fill="${secondary}"/>`;
        break;
      case 'flame':
        symbolSvg = `<path d="M 50 28 Q 62 44 58 56 Q 54 66 50 66 Q 42 66 42 56 Q 42 46 50 28 Z" fill="${secondary}"/>`;
      case 'stripe':
        symbolSvg = `<line x1="30" y1="20" x2="70" y2="80" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>`;
        break;
      case 'ball':
      default:
        symbolSvg = `
          <circle cx="50" cy="50" r="16" fill="#ffffff" stroke="${secondary}" stroke-width="2"/>
          <polygon points="50,44 55,48 53,54 47,54 45,48" fill="${primary}"/>
          <line x1="50" y1="44" x2="50" y2="34" stroke="${primary}" stroke-width="1.5"/>
          <line x1="55" y1="48" x2="65" y2="44" stroke="${primary}" stroke-width="1.5"/>
          <line x1="53" y1="54" x2="61" y2="62" stroke="${primary}" stroke-width="1.5"/>
          <line x1="47" y1="54" x2="39" y2="62" stroke="${primary}" stroke-width="1.5"/>
          <line x1="45" y1="48" x2="35" y2="44" stroke="${primary}" stroke-width="1.5"/>
        `;
        break;
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="club-badge-svg" style="display:inline-block; vertical-align:middle; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        ${shapePath}
        ${symbolSvg}
      </svg>
    `;
  },

  // Gera um nome brasileiro realista
  generatePlayerName() {
    const firstList = Camisa11Data.NAMES.first;
    const lastList = Camisa11Data.NAMES.last;
    const first = firstList[Math.floor(Math.random() * firstList.length)];
    const last = lastList[Math.floor(Math.random() * lastList.length)];
    return `${first} ${last}`;
  },

  // Calcula valor de mercado de um jogador calibrado aos exemplos do jogo
  calculatePlayerValue(ovr, age, potential) {
    // Calibração: OVR 65 ~R$ 1.5M | OVR 72 (19 anos) ~R$ 3.2M | OVR 84 ~R$ 8.5M
    const base = Math.pow(ovr / 22, 3.85) * 26000;
    const ageMultiplier = age <= 20 ? 1.35 : age <= 24 ? 1.2 : age <= 28 ? 1.0 : age <= 32 ? 0.75 : 0.5;
    const potentialBonus = Math.max(1, (potential - ovr) * 0.05 + 1);
    const rawVal = Math.round(base * ageMultiplier * potentialBonus);
    // Arredonda para múltiplo de 50.000
    return Math.max(250000, Math.round(rawVal / 50000) * 50000);
  },

  // Gera um único jogador com atributos calculados pelo OVR e Posição
  createPlayer(pos, targetOvr = 67, targetAge = null) {
    const age = targetAge || Math.floor(Math.random() * 15) + 18; // 18 a 32 anos
    const variance = Math.floor(Math.random() * 5) - 2; // -2 a +2
    const ovr = Math.max(55, Math.min(92, targetOvr + variance));
    const potential = Math.min(94, ovr + (age <= 21 ? Math.floor(Math.random() * 10) + 4 : Math.floor(Math.random() * 4)));

    // Distribuição de atributos detalhados de acordo com a posição
    let pace = ovr, shoot = ovr, pass = ovr, dribble = ovr, defend = ovr, physical = ovr;

    if (pos === 'GK') {
      defend = ovr + 4;
      physical = ovr + 2;
      pace = Math.max(45, ovr - 15);
      shoot = Math.max(30, ovr - 35);
      pass = Math.max(50, ovr - 10);
      dribble = Math.max(40, ovr - 20);
    } else if (['ZAG', 'LE', 'LD'].includes(pos)) {
      defend = ovr + 5;
      physical = ovr + 4;
      pace = pos === 'ZAG' ? Math.max(50, ovr - 8) : ovr + 4;
      pass = ovr - 2;
      dribble = ovr - 5;
      shoot = Math.max(40, ovr - 20);
    } else if (['VOL', 'MC', 'MEI', 'ME', 'MD'].includes(pos)) {
      pass = ovr + 4;
      dribble = ovr + 3;
      shoot = pos === 'MEI' ? ovr + 3 : ovr - 2;
      defend = pos === 'VOL' ? ovr + 4 : ovr - 3;
      pace = ovr;
      physical = ovr;
    } else {
      // ATA, PE, PD
      shoot = ovr + 5;
      pace = ovr + 4;
      dribble = ovr + 3;
      pass = ovr - 2;
      defend = Math.max(35, ovr - 22);
      physical = ovr + 1;
    }

    const value = this.calculatePlayerValue(ovr, age, potential);
    const wage = Math.round(value * 0.008);

    return {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      name: this.generatePlayerName(),
      age,
      pos,
      ovr,
      potential,
      energy: 100, // 100%
      stats: {
        pace: Math.min(99, Math.max(40, pace)),
        shooting: Math.min(99, Math.max(40, shoot)),
        passing: Math.min(99, Math.max(40, pass)),
        dribbling: Math.min(99, Math.max(40, dribble)),
        defending: Math.min(99, Math.max(40, defend)),
        physical: Math.min(99, Math.max(40, physical))
      },
      value,
      wage,
      goals: 0,
      assists: 0,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
      isStarter: false,
      slotIndex: null
    };
  },

  // Gera um elenco inicial equilibrado (~21 atletas)
  generateInitialSquad(baseOvr = 67) {
    const squad = [];

    // 2 Goleiros
    squad.push(this.createPlayer('GK', baseOvr - 1, 26));
    squad.push(this.createPlayer('GK', baseOvr - 5, 21));

    // 7 Defensores (2 Laterais esquerdos, 3 Zagueiros, 2 Laterais direitos)
    squad.push(this.createPlayer('LE', baseOvr, 24));
    squad.push(this.createPlayer('LE', baseOvr - 4, 19));
    squad.push(this.createPlayer('ZAG', baseOvr + 1, 27));
    squad.push(this.createPlayer('ZAG', baseOvr, 25));
    squad.push(this.createPlayer('ZAG', baseOvr - 3, 20));
    squad.push(this.createPlayer('LD', baseOvr, 24));
    squad.push(this.createPlayer('LD', baseOvr - 3, 22));

    // 7 Meio-Campistas (2 Volantes, 3 Meias Centrais, 2 Meias Ofensivos)
    squad.push(this.createPlayer('VOL', baseOvr + 1, 26));
    squad.push(this.createPlayer('VOL', baseOvr - 2, 21));
    squad.push(this.createPlayer('MC', baseOvr, 25));
    squad.push(this.createPlayer('MC', baseOvr - 1, 23));
    squad.push(this.createPlayer('MC', baseOvr - 4, 19));
    squad.push(this.createPlayer('MEI', baseOvr + 2, 24));
    squad.push(this.createPlayer('MEI', baseOvr - 3, 20));

    // 5 Atacantes (1 Ponta Esquerda, 1 Ponta Direita, 3 Centroavantes)
    squad.push(this.createPlayer('PE', baseOvr + 1, 23));
    squad.push(this.createPlayer('PD', baseOvr + 1, 22));
    squad.push(this.createPlayer('ATA', baseOvr + 2, 26));
    squad.push(this.createPlayer('ATA', baseOvr - 1, 21));
    squad.push(this.createPlayer('ATA', baseOvr - 4, 18));

    // Escala os 11 titulares automaticamente no 4-3-3
    this.assignDefaultStarters(squad, '4-3-3');

    return squad;
  },

  // Seleciona os 11 melhores para a formação padrão
  assignDefaultStarters(squad, formationName = '4-3-3') {
    const formation = Camisa11Data.FORMATIONS[formationName] || Camisa11Data.FORMATIONS['4-3-3'];
    
    // Reseta titulares
    squad.forEach(p => {
      p.isStarter = false;
      p.slotIndex = null;
    });

    const usedIds = new Set();

    formation.slots.forEach((slot, index) => {
      // Procura primeiro atleta da mesma posição disponível
      let candidate = squad
        .filter(p => !usedIds.has(p.id))
        .filter(p => p.pos === slot.role || (slot.role === 'ZAG' && ['ZAG', 'LE', 'LD'].includes(p.pos)) || (slot.role === 'MEI' && ['MEI', 'MC', 'VOL'].includes(p.pos)) || (slot.role === 'ATA' && ['ATA', 'PE', 'PD'].includes(p.pos)))
        .sort((a, b) => b.ovr - a.ovr)[0];

      // Se não achar da posição compatível, pega o melhor jogador restante não-GK
      if (!candidate) {
        candidate = squad
          .filter(p => !usedIds.has(p.id) && (slot.role === 'GK' ? p.pos === 'GK' : p.pos !== 'GK'))
          .sort((a, b) => b.ovr - a.ovr)[0];
      }

      if (candidate) {
        candidate.isStarter = true;
        candidate.slotIndex = index;
        usedIds.add(candidate.id);
      }
    });
  },

  // Calcula o OVR médio dos 11 titulares
  calculateTeamOvr(squad) {
    const starters = squad.filter(p => p.isStarter);
    if (starters.length === 0) return 60;
    const sum = starters.reduce((acc, p) => acc + p.ovr, 0);
    return Math.round(sum / starters.length);
  }
};
