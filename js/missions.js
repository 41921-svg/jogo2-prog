/**
 * CAMISA11 — Football Tycoon
 * missions.js — Missões Diárias, Semanais, Objetivos de Temporada e Conquistas
 */

const MissionsDB = {
  // Lista de conquistas permanentes do presidente
  achievements: [
    { id: 'first_win', title: 'Primeiro Triunfo', desc: 'Vencer a primeira partida oficial da história do clube.', icon: '⚽', xpReward: 50, cashReward: 15000 },
    { id: 'first_trophy', title: 'A Primeira Taça', desc: 'Conquistar o primeiro título de campeonato da carreira.', icon: '🏆', xpReward: 250, cashReward: 100000 },
    { id: 'stadium_5k', title: 'Caldeirão Formado', desc: 'Expandir a capacidade do estádio para pelo menos 5.000 lugares.', icon: '🏟️', xpReward: 100, cashReward: 40000 },
    { id: 'stadium_25k', title: 'Palco de Elite', desc: 'Atingir 25.000 lugares no estádio.', icon: '🏟️', xpReward: 300, cashReward: 250000 },
    { id: 'stadium_80k', title: 'Templo Lendário', desc: 'Atingir 80.000 lugares no Coliseu do futebol.', icon: '👑', xpReward: 1000, cashReward: 2000000 },
    { id: 'fans_10k', title: 'Torcida Fiel', desc: 'Alcançar a marca de 10.000 torcedores cadastrados.', icon: '👥', xpReward: 80, cashReward: 25000 },
    { id: 'fans_100k', title: 'Onda Avassaladora', desc: 'Atingir 100.000 torcedores fiéis.', icon: '📣', xpReward: 300, cashReward: 150000 },
    { id: 'fans_1m', title: 'Nação Gloriosa', desc: 'Romper a barreira de 1.000.000 de torcedores pelo país.', icon: '🔥', xpReward: 800, cashReward: 1000000 },
    { id: 'money_1m', title: 'Primeiro Milhão', desc: 'Acumular R$ 1.000.000 em caixa.', icon: '💰', xpReward: 150, cashReward: 50000 },
    { id: 'money_50m', title: 'Cofres Cheios', desc: 'Acumular R$ 50.000.000 em patrimônio financeiro.', icon: '💎', xpReward: 600, cashReward: 500000 },
    { id: 'prodigy_signed', title: 'Olho Clínico', desc: 'Descobrir ou promover um jovem com 85+ de potencial.', icon: '🧑‍🎓', xpReward: 120, cashReward: 30000 },
    { id: 'asset_tripled', title: 'Tubarão dos Negócios', desc: 'Vender um jogador com mais de 100% de valorização.', icon: '📈', xpReward: 200, cashReward: 80000 },
    { id: 'derby_winner', title: 'Dono da Cidade', desc: 'Vencer o grande rival histórico.', icon: '⚔️', xpReward: 150, cashReward: 50000 },
    { id: 'derby_dominant', title: 'Hegemonia Clássica', desc: 'Alcançar 5 vitórias sobre o grande rival.', icon: '🔥', xpReward: 400, cashReward: 200000 },
    { id: 'top_30', title: 'Reconhecimento', desc: 'Subir para o TOP 30 no ranking geral.', icon: '🌎', xpReward: 350, cashReward: 250000 },
    { id: 'top_1', title: 'Soberano Mundial', desc: 'Conquistar a 1ª posição no Ranking Mundial de Clubes!', icon: '👑', xpReward: 2500, cashReward: 10000000 },
    { id: 'streak_5', title: 'Rolo Compressor', desc: 'Vencer 5 partidas consecutivas em qualquer torneio.', icon: '⚡', xpReward: 180, cashReward: 60000 },
    { id: 'century_goals', title: 'Festa do Gol', desc: 'Alcançar 100 gols marcados na história do clube.', icon: '🎯', xpReward: 220, cashReward: 70000 }
  ],

  // Gera missões dinâmicas ativas
  generateDailyMissions(state) {
    return [
      {
        id: 'm_play_match',
        title: 'Entrar em Campo',
        desc: 'Disputar 1 partida em qualquer competição',
        target: 1,
        current: 0,
        completed: false,
        claimed: false,
        rewardCash: 12000,
        rewardXp: 30
      },
      {
        id: 'm_win_match',
        title: 'Espírito Vencedor',
        desc: 'Vencer 1 partida comemorando com a torcida',
        target: 1,
        current: 0,
        completed: false,
        claimed: false,
        rewardCash: 25000,
        rewardXp: 45
      },
      {
        id: 'm_upgrade_stadium',
        title: 'Obras no Clube',
        desc: 'Fazer 1 melhoria em qualquer instalação do estádio ou CT',
        target: 1,
        current: 0,
        completed: false,
        claimed: false,
        rewardCash: 20000,
        rewardXp: 50
      },
      {
        id: 'm_scout_youth',
        title: 'Olhos no Futuro',
        desc: 'Enviar olheiro da base ou observar jovens talentos',
        target: 1,
        current: 0,
        completed: false,
        claimed: false,
        rewardCash: 15000,
        rewardXp: 40
      }
    ];
  },

  // Temporadas e Grandes Metas
  seasonTiers: [
    {
      seasonNumber: 1,
      title: 'A Fundação da Lenda',
      desc: 'Coloque o clube nos trilhos: suba a capacidade do estádio, vença o rival e alcance o Top 40.',
      goals: [
        { id: 's1_cap', desc: 'Estádio com 2.500+ lugares', target: 2500, type: 'capacity' },
        { id: 's1_fans', desc: 'Alcançar 5.000 torcedores', target: 5000, type: 'fans' },
        { id: 's1_derby', desc: 'Vencer 1 jogo contra o rival', target: 1, type: 'derbyWins' }
      ],
      rewardCash: 200000,
      rewardXp: 500
    },
    {
      seasonNumber: 2,
      title: 'A Conquista do Território',
      desc: 'Conquiste a Taça Estadual e dispute o Campeonato Nacional de igual para igual.',
      goals: [
        { id: 's2_cap', desc: 'Estádio com 10.000+ lugares', target: 10000, type: 'capacity' },
        { id: 's2_fans', desc: 'Alcançar 30.000 torcedores', target: 30000, type: 'fans' },
        { id: 's2_trophy', desc: 'Conquistar pelo menos 1 título', target: 1, type: 'titles' }
      ],
      rewardCash: 1000000,
      rewardXp: 1200
    },
    {
      seasonNumber: 3,
      title: 'Rumo à Soberania Continental',
      desc: 'Monte uma constelação de craques e dispute a Copa Continental.',
      goals: [
        { id: 's3_cap', desc: 'Estádio com 50.000+ lugares', target: 50000, type: 'capacity' },
        { id: 's3_fans', desc: 'Alcançar 250.000 torcedores', target: 250000, type: 'fans' },
        { id: 's3_rank', desc: 'Entrar no TOP 15 Mundial', target: 15, type: 'rank' }
      ],
      rewardCash: 5000000,
      rewardXp: 3000
    }
  ]
};

window.MissionsDB = MissionsDB;
