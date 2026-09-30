/**
 * CAMISA11 — Football Tycoon
 * stadium.js — Sistema de Evolução do Estádio, Instalações Comerciais e Centro de Treinamento
 */

const StadiumDB = {
  // Níveis de capacidade do estádio
  capacityTiers: [
    { tier: 1, capacity: 1000,   cost: 0,         name: 'Campo Municipal',       desc: 'Um modesto campo cercado com alambrado.' },
    { tier: 2, capacity: 2500,   cost: 45000,     name: 'Estádio de Bairro',     desc: 'Pequenas arquibancadas de cimento e cabine de rádio.' },
    { tier: 3, capacity: 5000,   cost: 150000,    name: 'Alçapão Regional',      desc: 'Pressão da torcida perto do gramado e cabines de imprensa.' },
    { tier: 4, capacity: 10000,  cost: 450000,    name: 'Arena Comunitária',     desc: 'Arquibancadas completas, catracas eletrônicas e iluminação.' },
    { tier: 5, capacity: 25000,  cost: 1500000,   name: 'Estádio Metropolitano', desc: 'Estrutura profissional com cadeiras e cobertura parcial.' },
    { tier: 6, capacity: 50000,  cost: 6000000,   name: 'Grande Arena Nacional', desc: 'Padrão internacional, telões de LED e camarotes luxuosos.' },
    { tier: 7, capacity: 80000,  cost: 20000000,  name: 'Templo do Futebol',     desc: 'Um dos maiores estádios do planeta, oponente treme ao entrar.' },
    { tier: 8, capacity: 105000, cost: 55000000,  name: 'Coliseu Mundial',       desc: 'A arena mais imponente e tecnológica de todos os tempos.' }
  ],

  // Instalações do Estádio
  facilities: {
    stands: {
      id: 'stands',
      name: 'Arquibancadas Modernas',
      icon: '🏟️',
      desc: 'Melhora o conforto, a acústica e a empolgação da torcida.',
      maxLevel: 10,
      baseCost: 20000,
      costMultiplier: 1.8,
      benefitDesc: '+10% de atmosfera e +5% bônus de público'
    },
    vip: {
      id: 'vip',
      name: 'Camarotes VIP',
      icon: '💎',
      desc: 'Setores executivos de alto padrão para patrocinadores e empresários.',
      maxLevel: 10,
      baseCost: 35000,
      costMultiplier: 2.0,
      benefitDesc: '+R$ 15.000 a cada partida em ingressos VIP'
    },
    food: {
      id: 'food',
      name: 'Praça de Alimentação',
      icon: '🍔',
      desc: 'Lanchonetes, quiosques e bares no anel interno do estádio.',
      maxLevel: 10,
      baseCost: 25000,
      costMultiplier: 1.7,
      benefitDesc: '+R$ 4 a mais consumidos por cada torcedor presente'
    },
    store: {
      id: 'store',
      name: 'Loja Oficial do Clube',
      icon: '🛍️',
      desc: 'Venda de camisas oficiais, bandeiras e produtos licenciados.',
      maxLevel: 10,
      baseCost: 30000,
      costMultiplier: 1.85,
      benefitDesc: 'Aumenta a venda de produtos e faturamento diário passivo'
    },
    parking: {
      id: 'parking',
      name: 'Estacionamento Privativo',
      icon: '🅿️',
      desc: 'Vagas seguras com cobrança automatizada para dias de jogos.',
      maxLevel: 10,
      baseCost: 18000,
      costMultiplier: 1.65,
      benefitDesc: '+R$ 8.000 por jogo em tarifas de veículos'
    },
    media: {
      id: 'media',
      name: 'Centro de Mídia e TV',
      icon: '📺',
      desc: 'Salas de coletiva, estúdios para transmissão em alta definição.',
      maxLevel: 10,
      baseCost: 40000,
      costMultiplier: 2.1,
      benefitDesc: '+12% no valor dos contratos de TV e patrocinadores'
    },
    lighting: {
      id: 'lighting',
      name: 'Refletores LED & Show de Luzes',
      icon: '💡',
      desc: 'Sistema de luzes para jogos noturnos e espetáculos pirotécnicos.',
      maxLevel: 10,
      baseCost: 22000,
      costMultiplier: 1.75,
      benefitDesc: '+4 pontos permanentes de Reputação por nível'
    },
    museum: {
      id: 'museum',
      name: 'Memorial & Museu das Glórias',
      icon: '🏆',
      desc: 'Exposição de troféus, camisas históricas e atração turística.',
      maxLevel: 10,
      baseCost: 50000,
      costMultiplier: 2.2,
      benefitDesc: '+R$ 6.000 diários de ingressos turísticos e grande prestígio'
    }
  },

  // Instalações do Centro de Treinamento
  trainingFacilities: {
    gym: {
      id: 'gym',
      name: 'Academia & Fisiologia',
      icon: '🏋️',
      desc: 'Equipamentos modernos de musculação e monitoramento de carga.',
      maxLevel: 8,
      baseCost: 30000,
      costMultiplier: 1.9,
      benefitDesc: '+15% de recuperação física e menos fadiga entre jogos'
    },
    pitch: {
      id: 'pitch',
      name: 'Campos Anexos com Drenagem',
      icon: '🌱',
      desc: 'Gramados idênticos aos dos grandes jogos para treinos táticos.',
      maxLevel: 8,
      baseCost: 40000,
      costMultiplier: 1.85,
      benefitDesc: '+20% de velocidade de evolução de OVR do elenco'
    },
    medical: {
      id: 'medical',
      name: 'Centro Médico e Fisioterapia',
      icon: '🩺',
      desc: 'Crioterapia, médicos especialistas e rápida recuperação de lesões.',
      maxLevel: 8,
      baseCost: 35000,
      costMultiplier: 2.0,
      benefitDesc: '-50% de risco de lesões e retorno imediato aos treinos'
    },
    tech: {
      id: 'tech',
      name: 'Tecnologia & Análise de Dados',
      icon: '💻',
      desc: 'GPS, câmeras táticas de inteligência esportiva e relatórios dos adversários.',
      maxLevel: 8,
      baseCost: 45000,
      costMultiplier: 2.1,
      benefitDesc: '+2 OVR coletivo em partidas simuladas'
    },
    youth: {
      id: 'youth',
      name: 'CT das Categorias de Base',
      icon: '🧑‍🎓',
      desc: 'Alojamento, escola e comissão técnica dedicada aos jovens talentos.',
      maxLevel: 8,
      baseCost: 50000,
      costMultiplier: 2.25,
      benefitDesc: 'Jovens descobertos na Base vêm com OVR e Potencial muito maiores'
    }
  },

  // Calcula custo de upgrade de uma instalação
  getFacilityUpgradeCost(facilityDef, currentLevel) {
    if (currentLevel >= facilityDef.maxLevel) return null;
    return Math.round(facilityDef.baseCost * Math.pow(facilityDef.costMultiplier, currentLevel));
  },

  // Retorna próximo tier de capacidade do estádio
  getNextCapacityTier(currentCapacity) {
    const currentIndex = this.capacityTiers.findIndex(t => t.capacity === currentCapacity);
    if (currentIndex === -1 || currentIndex >= this.capacityTiers.length - 1) return null;
    return this.capacityTiers[currentIndex + 1];
  },

  // Calcula receita de bilheteria e instalações para uma partida
  calculateMatchdayFinancials(attendance, ticketPrice, facilitiesLevels = {}) {
    // 1. Bilheteria normal
    const ticketRevenue = attendance * ticketPrice;

    // 2. Camarotes VIP
    const vipLevel = facilitiesLevels.vip || 0;
    const vipSeats = Math.min(vipLevel * 120, Math.round(attendance * 0.08));
    const vipRevenue = vipSeats * (ticketPrice * 2.8 + 80);

    // 3. Alimentação
    const foodLevel = facilitiesLevels.food || 0;
    const foodPerHead = 4 + (foodLevel * 3.5);
    const foodRevenue = Math.round(attendance * foodPerHead);

    // 4. Loja Oficial
    const storeLevel = facilitiesLevels.store || 0;
    const merchandiseBuyers = Math.round(attendance * (0.04 + storeLevel * 0.015));
    const storeRevenue = merchandiseBuyers * (55 + storeLevel * 10);

    // 5. Estacionamento
    const parkingLevel = facilitiesLevels.parking || 0;
    const parkingVehicles = Math.min(parkingLevel * 250, Math.round(attendance * 0.15));
    const parkingRevenue = parkingVehicles * 25;

    // Custos operacionais do estádio no dia do jogo (segurança, limpeza, luz)
    const baseOperatingCost = 4000 + Math.round(attendance * 3.2);

    const totalRevenue = ticketRevenue + vipRevenue + foodRevenue + storeRevenue + parkingRevenue;
    const netProfit = totalRevenue - baseOperatingCost;

    return {
      attendance,
      ticketRevenue,
      vipRevenue,
      foodRevenue,
      storeRevenue,
      parkingRevenue,
      baseOperatingCost,
      totalRevenue,
      netProfit
    };
  }
};

window.StadiumDB = StadiumDB;
