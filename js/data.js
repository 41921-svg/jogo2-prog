/**
 * CAMISA11 — Football Career & Manager
 * data.js — Banco de Dados: Clubes Oficiais, Nomes, Formações Táticas e Configurações
 */

const Camisa11Data = {
  // Divisões e Clubes Originais Fictícios
  DEFAULT_LEAGUES: {
    div3: {
      id: 'div3',
      name: '3ª Divisão Nacional',
      shortName: '3ª Divisão',
      country: 'Brasil',
      tier: 3,
      promotionSpots: 2,
      relegationSpots: 2,
      clubs: [
        {
          id: 'camisa11',
          name: 'CAMISA11 FC',
          shortName: 'C11',
          city: 'São Paulo',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#0f172a',
          secondaryColor: '#10b981',
          badgeShape: 'shield',
          badgeSymbol: 'ball',
          budget: 8000000,
          ovr: 72,
          titles: 2,
          stadium: 'Estádio da Colina',
          stadiumCapacity: 12000,
          fans: 48000
        },
        {
          id: 'uniao_fc',
          name: 'UNIÃO FC',
          shortName: 'UNI',
          city: 'Belo Horizonte',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#dc2626',
          secondaryColor: '#ffffff',
          badgeShape: 'circle',
          badgeSymbol: 'star',
          budget: 6000000,
          ovr: 69,
          titles: 1,
          stadium: 'Arena União',
          stadiumCapacity: 10500,
          fans: 39000
        },
        {
          id: 'rio_fc',
          name: 'RIO FC',
          shortName: 'RIO',
          city: 'Rio de Janeiro',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#0284c7',
          secondaryColor: '#ffffff',
          badgeShape: 'diamond',
          badgeSymbol: 'crown',
          budget: 12000000,
          ovr: 75,
          titles: 5,
          stadium: 'Estádio Imperial',
          stadiumCapacity: 18000,
          fans: 74000
        },
        {
          id: 'estrela_fc',
          name: 'ESTRELA FC',
          shortName: 'EST',
          city: 'Porto Alegre',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#eab308',
          secondaryColor: '#1e293b',
          badgeShape: 'star',
          badgeSymbol: 'star',
          budget: 4000000,
          ovr: 64,
          titles: 0,
          stadium: 'Estádio Estrelado',
          stadiumCapacity: 8000,
          fans: 24000
        },
        {
          id: 'alvorada_fc',
          name: 'ALVORADA FC',
          shortName: 'ALV',
          city: 'Curitiba',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#15803d',
          secondaryColor: '#ffffff',
          badgeShape: 'crest',
          badgeSymbol: 'eagle',
          budget: 5000000,
          ovr: 67,
          titles: 1,
          stadium: 'Parque Alvorada',
          stadiumCapacity: 9500,
          fans: 31000
        },
        {
          id: 'serrano_fc',
          name: 'SERRANO FC',
          shortName: 'SER',
          city: 'Caxias do Sul',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#0369a1',
          secondaryColor: '#facc15',
          badgeShape: 'shield',
          badgeSymbol: 'lion',
          budget: 3500000,
          ovr: 63,
          titles: 0,
          stadium: 'Montanha Park',
          stadiumCapacity: 7500,
          fans: 19000
        },
        {
          id: 'paulistano_sc',
          name: 'PAULISTANO SC',
          shortName: 'PAU',
          city: 'Campinas',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#ffffff',
          secondaryColor: '#b91c1c',
          badgeShape: 'hexagon',
          badgeSymbol: 'lightning',
          budget: 14000000,
          ovr: 76,
          titles: 4,
          stadium: 'Estádio Central',
          stadiumCapacity: 19000,
          fans: 82000
        },
        {
          id: 'real_litoral',
          name: 'REAL LITORAL',
          shortName: 'LIT',
          city: 'Santos',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#18181b',
          secondaryColor: '#eab308',
          badgeShape: 'crest',
          badgeSymbol: 'ball',
          budget: 4500000,
          ovr: 65,
          titles: 0,
          stadium: 'Arena da Praia',
          stadiumCapacity: 8500,
          fans: 26000
        },
        {
          id: 'atletico_central',
          name: 'ATLÉTICO CENTRAL',
          shortName: 'CEN',
          city: 'Goiânia',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#991b1b',
          secondaryColor: '#0f172a',
          badgeShape: 'diamond',
          badgeSymbol: 'flame',
          budget: 7000000,
          ovr: 70,
          titles: 2,
          stadium: 'Serra Park',
          stadiumCapacity: 11000,
          fans: 42000
        },
        {
          id: 'porto_real',
          name: 'PORTO REAL',
          shortName: 'POR',
          city: 'Salvador',
          country: 'Brasil',
          division: '3ª Divisão',
          tier: 3,
          primaryColor: '#1d4ed8',
          secondaryColor: '#ef4444',
          badgeShape: 'shield',
          badgeSymbol: 'crown',
          budget: 10000000,
          ovr: 74,
          titles: 3,
          stadium: 'Arena Bahia Real',
          stadiumCapacity: 16000,
          fans: 68000
        }
      ]
    },
    div2: {
      id: 'div2',
      name: '2ª Divisão Nacional',
      shortName: '2ª Divisão',
      country: 'Brasil',
      tier: 2,
      promotionSpots: 2,
      relegationSpots: 2,
      clubs: [
        { id: 'aurora_fc', name: 'AURORA FC', shortName: 'AUR', city: 'Recife', country: 'Brasil', division: '2ª Divisão', tier: 2, primaryColor: '#d97706', secondaryColor: '#111827', badgeShape: 'circle', badgeSymbol: 'flame', budget: 18000000, ovr: 77, titles: 3, stadium: 'Arena do Sol', stadiumCapacity: 24000, fans: 110000 },
        { id: 'pioneiros_sc', name: 'PIONEIROS SC', shortName: 'PIO', city: 'Florianópolis', country: 'Brasil', division: '2ª Divisão', tier: 2, primaryColor: '#059669', secondaryColor: '#ffffff', badgeShape: 'shield', badgeSymbol: 'eagle', budget: 19000000, ovr: 78, titles: 4, stadium: 'Vila da Ilha', stadiumCapacity: 22000, fans: 125000 },
        { id: 'metropole_fc', name: 'METRÓPOLE FC', shortName: 'MET', city: 'São Paulo', country: 'Brasil', division: '2ª Divisão', tier: 2, primaryColor: '#334155', secondaryColor: '#38bdf8', badgeShape: 'hexagon', badgeSymbol: 'lightning', budget: 22000000, ovr: 79, titles: 5, stadium: 'Parque Metrópole', stadiumCapacity: 28000, fans: 150000 },
        { id: 'valente_ec', name: 'VALENTE EC', shortName: 'VAL', city: 'Fortaleza', country: 'Brasil', division: '2ª Divisão', tier: 2, primaryColor: '#7c3aed', secondaryColor: '#facc15', badgeShape: 'crest', badgeSymbol: 'lion', budget: 25000000, ovr: 80, titles: 6, stadium: 'Castelo Real', stadiumCapacity: 30000, fans: 170000 }
      ]
    },
    div1: {
      id: 'div1',
      name: '1ª Divisão Nacional',
      shortName: '1ª Divisão',
      country: 'Brasil',
      tier: 1,
      promotionSpots: 0,
      relegationSpots: 2,
      clubs: [
        { id: 'imperador_fc', name: 'IMPERADOR FC', shortName: 'IMP', city: 'São Paulo', country: 'Brasil', division: '1ª Divisão', tier: 1, primaryColor: '#0f172a', secondaryColor: '#eab308', badgeShape: 'crest', badgeSymbol: 'crown', budget: 65000000, ovr: 88, titles: 14, stadium: 'Arena Imperial', stadiumCapacity: 52000, fans: 650000 },
        { id: 'soberano_fc', name: 'SOBERANO FC', shortName: 'SOB', city: 'Rio de Janeiro', country: 'Brasil', division: '1ª Divisão', tier: 1, primaryColor: '#b91c1c', secondaryColor: '#18181b', badgeShape: 'shield', badgeSymbol: 'lion', budget: 60000000, ovr: 87, titles: 12, stadium: 'Coliseu da Guanabara', stadiumCapacity: 50000, fans: 580000 },
        { id: 'triunfo_sc', name: 'TRIUNFO SC', shortName: 'TRI', city: 'Porto Alegre', country: 'Brasil', division: '1ª Divisão', tier: 1, primaryColor: '#1e40af', secondaryColor: '#ffffff', badgeShape: 'circle', badgeSymbol: 'star', budget: 52000000, ovr: 85, titles: 9, stadium: 'Arena Glória', stadiumCapacity: 45000, fans: 490000 },
        { id: 'galaxia_ec', name: 'GALÁXIA EC', shortName: 'GAL', city: 'Belo Horizonte', country: 'Brasil', division: '1ª Divisão', tier: 1, primaryColor: '#047857', secondaryColor: '#ffffff', badgeShape: 'diamond', badgeSymbol: 'ball', budget: 48000000, ovr: 84, titles: 8, stadium: 'Parque das Estrelas', stadiumCapacity: 42000, fans: 430000 }
      ]
    }
  },

  // Dificuldades
  DIFFICULTIES: {
    easy: {
      id: 'easy',
      name: 'FÁCIL',
      subtitle: 'Clube forte · Mais dinheiro · Objetivos mais simples',
      budgetBonus: 4000000,
      ovrBonus: 3,
      objective: 'Garantir vaga na parte de cima da tabela (G4)',
      minReputationGain: 12
    },
    normal: {
      id: 'normal',
      name: 'NORMAL',
      subtitle: 'Clube equilibrado · Economia normal',
      budgetBonus: 0,
      ovrBonus: 0,
      objective: 'Terminar entre os 10 primeiros com estabilidade',
      minReputationGain: 8
    },
    hard: {
      id: 'hard',
      name: 'DIFÍCIL',
      subtitle: 'Clube pequeno · Pouco dinheiro · Elenco fraco',
      budgetBonus: -2000000,
      ovrBonus: -3,
      objective: 'Evitar o rebaixamento a qualquer custo',
      minReputationGain: 15
    }
  },

  // Nomes para geração procedural de atletas brasileiros
  NAMES: {
    first: [
      'Carlos', 'Lucas', 'Pedro', 'João', 'Rafael', 'Mateus', 'Gabriel', 'André', 'Felipe',
      'Bruno', 'Rodrigo', 'Thiago', 'Vinícius', 'Gustavo', 'Enzo', 'Leonardo', 'Diego',
      'Renan', 'Danilo', 'Caio', 'Arthur', 'Marcos', 'Kauã', 'Luan', 'Eduardo', 'Igor',
      'Murilo', 'Bernardo', 'Henrique', 'Samuel', 'Vitor', 'Alex', 'Guilherme', 'Breno',
      'Otávio', 'Davi', 'Nicolas', 'Ruan', 'Everton', 'Allan', 'Douglas', 'Leandro'
    ],
    last: [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
      'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes',
      'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade',
      'Ramos', 'Moreira', 'Nunes', 'Mendes', 'Cardoso', 'Santana', 'Teixeira', 'Cavalcante',
      'Pinto', 'Batista', 'Moraes', 'Dantas', 'Freitas', 'Machado', 'Monteiro', 'Correia'
    ]
  },

  // Formações táticas e coordenadas em % do campo 2D (top, left)
  FORMATIONS: {
    '4-3-3': {
      name: '4-3-3',
      slots: [
        { role: 'GK', label: 'GK', top: 88, left: 50 },
        { role: 'LE', label: 'LE', top: 72, left: 16 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 38 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 62 },
        { role: 'LD', label: 'LD', top: 72, left: 84 },
        { role: 'VOL', label: 'VOL', top: 56, left: 50 },
        { role: 'MEI', label: 'MEI', top: 44, left: 32 },
        { role: 'MEI', label: 'MEI', top: 44, left: 68 },
        { role: 'PE', label: 'PE', top: 22, left: 18 },
        { role: 'ATA', label: 'ATA', top: 16, left: 50 },
        { role: 'PD', label: 'PD', top: 22, left: 82 }
      ]
    },
    '4-4-2': {
      name: '4-4-2',
      slots: [
        { role: 'GK', label: 'GK', top: 88, left: 50 },
        { role: 'LE', label: 'LE', top: 72, left: 16 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 38 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 62 },
        { role: 'LD', label: 'LD', top: 72, left: 84 },
        { role: 'ME', label: 'ME', top: 48, left: 18 },
        { role: 'MC', label: 'MC', top: 52, left: 40 },
        { role: 'MC', label: 'MC', top: 52, left: 60 },
        { role: 'MD', label: 'MD', top: 48, left: 82 },
        { role: 'ATA', label: 'ATA', top: 20, left: 38 },
        { role: 'ATA', label: 'ATA', top: 20, left: 62 }
      ]
    },
    '4-2-3-1': {
      name: '4-2-3-1',
      slots: [
        { role: 'GK', label: 'GK', top: 88, left: 50 },
        { role: 'LE', label: 'LE', top: 72, left: 16 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 38 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 62 },
        { role: 'LD', label: 'LD', top: 72, left: 84 },
        { role: 'VOL', label: 'VOL', top: 58, left: 36 },
        { role: 'VOL', label: 'VOL', top: 58, left: 64 },
        { role: 'ME', label: 'ME', top: 38, left: 20 },
        { role: 'MEI', label: 'MEI', top: 36, left: 50 },
        { role: 'MD', label: 'MD', top: 38, left: 80 },
        { role: 'ATA', label: 'ATA', top: 16, left: 50 }
      ]
    },
    '3-5-2': {
      name: '3-5-2',
      slots: [
        { role: 'GK', label: 'GK', top: 88, left: 50 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 26 },
        { role: 'ZAG', label: 'ZAG', top: 75, left: 50 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 74 },
        { role: 'ALA_E', label: 'ALA', top: 50, left: 14 },
        { role: 'VOL', label: 'VOL', top: 58, left: 50 },
        { role: 'MC', label: 'MC', top: 44, left: 36 },
        { role: 'MC', label: 'MC', top: 44, left: 64 },
        { role: 'ALA_D', label: 'ALA', top: 50, left: 86 },
        { role: 'ATA', label: 'ATA', top: 20, left: 38 },
        { role: 'ATA', label: 'ATA', top: 20, left: 62 }
      ]
    },
    '4-5-1': {
      name: '4-5-1',
      slots: [
        { role: 'GK', label: 'GK', top: 88, left: 50 },
        { role: 'LE', label: 'LE', top: 72, left: 16 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 38 },
        { role: 'ZAG', label: 'ZAG', top: 74, left: 62 },
        { role: 'LD', label: 'LD', top: 72, left: 84 },
        { role: 'VOL', label: 'VOL', top: 58, left: 50 },
        { role: 'MC', label: 'MC', top: 46, left: 36 },
        { role: 'MC', label: 'MC', top: 46, left: 64 },
        { role: 'PE', label: 'PE', top: 32, left: 20 },
        { role: 'PD', label: 'PD', top: 32, left: 80 },
        { role: 'ATA', label: 'ATA', top: 16, left: 50 }
      ]
    }
  }
};
