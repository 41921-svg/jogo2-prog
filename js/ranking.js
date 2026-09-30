/**
 * CAMISA11 — Football Tycoon
 * ranking.js — Sistema de Rankings Mundiais, 50+ Clubes de IA e Evolução de Posição
 */

const RankingSystem = {
  // Lista de clubes de IA com dados calibrados para progressão épica
  clubsDatabase: [
    { id: 'c_rm', name: 'Real Madrid', country: '🇪🇸', reputation: 98, netWorth: 3500000000, fans: 85000000, titles: 102, form: '🔥 5V' },
    { id: 'c_mc', name: 'Manchester City', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', reputation: 96, netWorth: 3200000000, fans: 60000000, titles: 38, form: '🔥 4V' },
    { id: 'c_bm', name: 'Bayern München', country: '🇩🇪', reputation: 95, netWorth: 2900000000, fans: 55000000, titles: 84, form: '🟢 3V' },
    { id: 'c_liv', name: 'Liverpool FC', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', reputation: 94, netWorth: 2800000000, fans: 68000000, titles: 69, form: '🔥 4V' },
    { id: 'c_bar', name: 'FC Barcelona', country: '🇪🇸', reputation: 94, netWorth: 2700000000, fans: 82000000, titles: 95, form: '🟢 3V' },
    { id: 'c_psg', name: 'Paris Saint-Germain', country: '🇫🇷', reputation: 93, netWorth: 2600000000, fans: 48000000, titles: 48, form: '🟢 3V' },
    { id: 'c_ars', name: 'Arsenal FC', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', reputation: 92, netWorth: 2400000000, fans: 45000000, titles: 47, form: '🟢 3V' },
    { id: 'c_int', name: 'Inter de Milão', country: '🇮🇹', reputation: 91, netWorth: 2100000000, fans: 38000000, titles: 45, form: '🟢 2V' },
    { id: 'c_juv', name: 'Juventus FC', country: '🇮🇹', reputation: 90, netWorth: 2000000000, fans: 42000000, titles: 70, form: '⚪ 1V' },
    { id: 'c_atm', name: 'Atlético de Madrid', country: '🇪🇸', reputation: 89, netWorth: 1800000000, fans: 30000000, titles: 34, form: '🟢 2V' },
    
    // Potências Sul-Americanas e Brasileiras
    { id: 'c_fla', name: 'Flamengo', country: '🇧🇷', reputation: 85, netWorth: 850000000, fans: 42000000, titles: 56, form: '🔥 4V' },
    { id: 'c_pal', name: 'Palmeiras', country: '🇧🇷', reputation: 84, netWorth: 800000000, fans: 22000000, titles: 54, form: '🔥 4V' },
    { id: 'c_riv', name: 'River Plate', country: '🇦🇷', reputation: 83, netWorth: 620000000, fans: 20000000, titles: 52, form: '🟢 3V' },
    { id: 'c_boc', name: 'Boca Juniors', country: '🇦🇷', reputation: 83, netWorth: 600000000, fans: 24000000, titles: 58, form: '⚪ 1V' },
    { id: 'c_spfc', name: 'São Paulo FC', country: '🇧🇷', reputation: 82, netWorth: 580000000, fans: 20000000, titles: 48, form: '🟢 2V' },
    { id: 'c_cor', name: 'Corinthians', country: '🇧🇷', reputation: 81, netWorth: 560000000, fans: 34000000, titles: 45, form: '⚪ 1V' },
    { id: 'c_cam', name: 'Atlético Mineiro', country: '🇧🇷', reputation: 81, netWorth: 540000000, fans: 12000000, titles: 36, form: '🟢 2V' },
    { id: 'c_flu', name: 'Fluminense', country: '🇧🇷', reputation: 80, netWorth: 490000000, fans: 8000000, titles: 35, form: '🟢 2V' },
    { id: 'c_gre', name: 'Grêmio', country: '🇧🇷', reputation: 80, netWorth: 480000000, fans: 10000000, titles: 40, form: '⚪ 1V' },
    { id: 'c_sci', name: 'Internacional', country: '🇧🇷', reputation: 79, netWorth: 470000000, fans: 9500000, titles: 42, form: '⚪ 1V' },
    { id: 'c_bot', name: 'Botafogo', country: '🇧🇷', reputation: 79, netWorth: 460000000, fans: 5500000, titles: 30, form: '🔥 4V' },
    { id: 'c_cru', name: 'Cruzeiro', country: '🇧🇷', reputation: 78, netWorth: 430000000, fans: 10000000, titles: 42, form: '⚪ 1V' },
    { id: 'c_vas', name: 'Vasco da Gama', country: '🇧🇷', reputation: 77, netWorth: 410000000, fans: 12000000, titles: 34, form: '⚪ 1V' },
    { id: 'c_san', name: 'Santos FC', country: '🇧🇷', reputation: 77, netWorth: 390000000, fans: 8000000, titles: 43, form: '⚪ 1V' },
    { id: 'c_cap', name: 'Athletico Paranaense', country: '🇧🇷', reputation: 76, netWorth: 420000000, fans: 3500000, titles: 28, form: '🟢 2V' },
    { id: 'c_bah', name: 'Bahia City', country: '🇧🇷', reputation: 75, netWorth: 380000000, fans: 5000000, titles: 24, form: '🟢 2V' },
    { id: 'c_for', name: 'Fortaleza EC', country: '🇧🇷', reputation: 75, netWorth: 310000000, fans: 4000000, titles: 22, form: '🟢 2V' },

    // Clubes Emergentes e Regionais
    { id: 'c_cui', name: 'Cuiabá Esporte', country: '🇧🇷', reputation: 65, netWorth: 120000000, fans: 800000, titles: 8, form: '⚪ 1V' },
    { id: 'c_cric', name: 'Criciúma EC', country: '🇧🇷', reputation: 63, netWorth: 90000000, fans: 650000, titles: 12, form: '⚪ 1V' },
    { id: 'c_juv_rs', name: 'Juventude', country: '🇧🇷', reputation: 62, netWorth: 85000000, fans: 500000, titles: 9, form: '⚪ 1V' },
    { id: 'c_pon', name: 'Ponte Preta', country: '🇧🇷', reputation: 58, netWorth: 65000000, fans: 850000, titles: 5, form: '⚪ 1V' },
    { id: 'c_gua', name: 'Guarani de Campinas', country: '🇧🇷', reputation: 57, netWorth: 60000000, fans: 800000, titles: 8, form: '⚪ 1V' },
    { id: 'c_ame', name: 'América Mineiro', country: '🇧🇷', reputation: 66, netWorth: 140000000, fans: 700000, titles: 14, form: '🟢 2V' },
    { id: 'c_vil', name: 'Vila Nova GO', country: '🇧🇷', reputation: 54, netWorth: 40000000, fans: 450000, titles: 4, form: '⚪ 1V' },
    { id: 'c_ope', name: 'Operário Ferroviário', country: '🇧🇷', reputation: 51, netWorth: 28000000, fans: 220000, titles: 3, form: '⚪ 1V' },
    { id: 'c_itu', name: 'Ituano FC', country: '🇧🇷', reputation: 50, netWorth: 25000000, fans: 180000, titles: 4, form: '⚪ 1V' },
    { id: 'c_mir', name: 'Mirassol FC', country: '🇧🇷', reputation: 52, netWorth: 32000000, fans: 150000, titles: 2, form: '🟢 2V' },
    { id: 'c_nov', name: 'Novorizontino', country: '🇧🇷', reputation: 53, netWorth: 35000000, fans: 140000, titles: 2, form: '🟢 2V' },
    { id: 'c_cha', name: 'Chapecoense', country: '🇧🇷', reputation: 55, netWorth: 45000000, fans: 550000, titles: 8, form: '⚪ 1V' },
    { id: 'c_ava', name: 'Avaí FC', country: '🇧🇷', reputation: 56, netWorth: 50000000, fans: 400000, titles: 7, form: '⚪ 1V' },
    { id: 'c_fig', name: 'Figueirense', country: '🇧🇷', reputation: 52, netWorth: 35000000, fans: 450000, titles: 6, form: '⚪ 1V' },
    { id: 'c_par', name: 'Paraná Clube', country: '🇧🇷', reputation: 48, netWorth: 20000000, fans: 500000, titles: 7, form: '⚪ 1V' },
    { id: 'c_lon', name: 'Londrina EC', country: '🇧🇷', reputation: 49, netWorth: 22000000, fans: 300000, titles: 4, form: '⚪ 1V' },
    { id: 'c_pay', name: 'Paysandu SC', country: '🇧🇷', reputation: 55, netWorth: 42000000, fans: 1200000, titles: 15, form: '⚪ 1V' },
    { id: 'c_rem', name: 'Clube do Remo', country: '🇧🇷', reputation: 54, netWorth: 40000000, fans: 1100000, titles: 14, form: '⚪ 1V' },
    { id: 'c_sam', name: 'Sampaio Corrêa', country: '🇧🇷', reputation: 46, netWorth: 18000000, fans: 250000, titles: 6, form: '⚪ 1V' },
    { id: 'c_abc', name: 'ABC de Natal', country: '🇧🇷', reputation: 45, netWorth: 15000000, fans: 350000, titles: 8, form: '⚪ 1V' },
    { id: 'c_ame_rn', name: 'América de Natal', country: '🇧🇷', reputation: 44, netWorth: 14000000, fans: 300000, titles: 7, form: '⚪ 1V' },
    { id: 'c_con', name: 'Confiança SE', country: '🇧🇷', reputation: 42, netWorth: 12000000, fans: 180000, titles: 4, form: '⚪ 1V' },
    { id: 'c_ser', name: 'Sergipe', country: '🇧🇷', reputation: 40, netWorth: 10000000, fans: 150000, titles: 4, form: '⚪ 1V' },
    { id: 'c_cam_pb', name: 'Campinense', country: '🇧🇷', reputation: 39, netWorth: 9000000, fans: 120000, titles: 3, form: '⚪ 1V' },
    { id: 'c_tre', name: 'Treze da Paraíba', country: '🇧🇷', reputation: 39, netWorth: 8500000, fans: 110000, titles: 3, form: '⚪ 1V' },
    { id: 'c_sal', name: 'Salgueiro AC', country: '🇧🇷', reputation: 36, netWorth: 6000000, fans: 60000, titles: 1, form: '⚪ 1V' },
    { id: 'c_mot', name: 'Moto Club', country: '🇧🇷', reputation: 37, netWorth: 7000000, fans: 90000, titles: 2, form: '⚪ 1V' },
    { id: 'c_mar', name: 'Maranhão AC', country: '🇧🇷', reputation: 35, netWorth: 5000000, fans: 50000, titles: 1, form: '⚪ 1V' },
    { id: 'c_sau', name: 'São José RS', country: '🇧🇷', reputation: 34, netWorth: 4500000, fans: 40000, titles: 1, form: '⚪ 1V' },
    { id: 'c_bov', name: 'Boavista RJ', country: '🇧🇷', reputation: 33, netWorth: 4000000, fans: 30000, titles: 0, form: '⚪ 1V' },
    { id: 'c_ban', name: 'Bangu Atlético', country: '🇧🇷', reputation: 32, netWorth: 3500000, fans: 95000, titles: 2, form: '⚪ 1V' },
    { id: 'c_mad', name: 'Madureira EC', country: '🇧🇷', reputation: 30, netWorth: 3000000, fans: 25000, titles: 0, form: '⚪ 1V' },
    { id: 'c_por_rj', name: 'Portuguesa da Ilha', country: '🇧🇷', reputation: 28, netWorth: 2500000, fans: 20000, titles: 0, form: '⚪ 1V' },
    { id: 'c_res', name: 'Resende FC', country: '🇧🇷', reputation: 25, netWorth: 2000000, fans: 15000, titles: 0, form: '⚪ 1V' },
    { id: 'c_nov_ig', name: 'Nova Iguaçu FC', country: '🇧🇷', reputation: 26, netWorth: 2200000, fans: 18000, titles: 0, form: '⚪ 1V' }
  ],

  // Combina o clube do usuário com os clubes da base e ordena
  getRankingList(userClub, category = 'reputation') {
    const list = this.clubsDatabase.map(c => ({ ...c, isUser: false }));

    // Cria entrada para o clube do usuário
    const userNetWorth = (userClub.funds || 0) + (userClub.squadValue || 0) + (userClub.stadiumValue || 0);
    const userEntry = {
      id: 'c_user',
      name: userClub.name || 'Camisa 11',
      country: '🇧🇷',
      reputation: userClub.reputation || 10,
      netWorth: userNetWorth,
      fans: userClub.fans || 1250,
      titles: userClub.titlesCount || 0,
      form: userClub.recentForm || '🟢 1V',
      isUser: true
    };

    list.push(userEntry);

    // Ordenação de acordo com o filtro selecionado
    if (category === 'reputation') {
      list.sort((a, b) => b.reputation - a.reputation || b.netWorth - a.netWorth);
    } else if (category === 'netWorth') {
      list.sort((a, b) => b.netWorth - a.netWorth);
    } else if (category === 'fans') {
      list.sort((a, b) => b.fans - a.fans);
    } else if (category === 'titles') {
      list.sort((a, b) => b.titles - a.titles || b.reputation - a.reputation);
    }

    // Atribui posições
    list.forEach((item, index) => {
      item.rank = index + 1;
    });

    return list;
  },

  // Retorna a posição exata do clube do usuário no ranking geral
  getUserRank(userClub) {
    const list = this.getRankingList(userClub, 'reputation');
    const found = list.find(c => c.isUser);
    return found ? found.rank : list.length;
  }
};

window.RankingSystem = RankingSystem;
