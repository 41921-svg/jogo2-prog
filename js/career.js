/**
 * CAMISA11 — Football Career & Manager
 * career.js — Carreira do Treinador, Reputação, Propostas de Clubes e Ranking Global
 */

const CareerManager = {
  // Gera o ranking global dos maiores clubes
  generateGlobalRanking(userClub) {
    const allClubs = [];

    // Junta clubes das 3 divisões
    Object.values(Camisa11Data.DEFAULT_LEAGUES).forEach(league => {
      league.clubs.forEach(c => {
        // Se for o clube do usuário, usa os dados atualizados
        if (c.id === userClub.id) {
          allClubs.push({ ...userClub, isUser: true });
        } else {
          allClubs.push({ ...c, isUser: false });
        }
      });
    });

    // Se o clube do usuário for customizado e não estiver na lista:
    if (!allClubs.find(c => c.id === userClub.id)) {
      allClubs.push({ ...userClub, isUser: true });
    }

    // Pontuação de ranking calculada por OVR, Títulos e Orçamento
    allClubs.forEach(c => {
      const titlesScore = (c.titles || 0) * 150;
      const ovrScore = (c.ovr || 65) * 20;
      const budgetScore = Math.round((c.budget || 5000000) / 500000);
      c.rankingScore = titlesScore + ovrScore + budgetScore;
    });

    allClubs.sort((a, b) => b.rankingScore - a.rankingScore);

    return allClubs.map((club, index) => ({
      rank: index + 1,
      ...club
    }));
  },

  // Gera propostas de emprego de outros clubes no final da temporada
  generateJobOffers(manager, currentClub) {
    const offers = [];
    const rep = manager.reputation || 40;

    // Se a reputação for boa, recebe proposta da 2ª Divisão ou 1ª Divisão
    if (rep >= 45) {
      const pool = rep >= 75 ? Camisa11Data.DEFAULT_LEAGUES.div1.clubs : Camisa11Data.DEFAULT_LEAGUES.div2.clubs;
      const available = pool.filter(c => c.id !== currentClub.id);

      if (available.length > 0) {
        const target = available[Math.floor(Math.random() * available.length)];
        offers.push({
          clubId: target.id,
          name: target.name,
          shortName: target.shortName,
          division: target.division,
          ovr: target.ovr,
          budget: target.budget,
          stadium: target.stadium,
          titles: target.titles,
          primaryColor: target.primaryColor,
          secondaryColor: target.secondaryColor,
          badgeShape: target.badgeShape,
          badgeSymbol: target.badgeSymbol,
          wageOffer: Math.round(target.budget * 0.005)
        });
      }
    }

    return offers;
  },

  // Aceita proposta e muda para o novo clube
  acceptJobOffer(offer, gameState) {
    gameState.club = {
      id: offer.clubId,
      name: offer.name,
      shortName: offer.shortName,
      division: offer.division,
      city: 'Brasil',
      country: 'Brasil',
      primaryColor: offer.primaryColor,
      secondaryColor: offer.secondaryColor,
      badgeShape: offer.badgeShape,
      badgeSymbol: offer.badgeSymbol,
      budget: offer.budget,
      ovr: offer.ovr,
      titles: offer.titles,
      stadium: offer.stadium,
      stadiumCapacity: 25000
    };

    // Gera elenco compatível com o novo clube
    gameState.squad = ClubManager.generateInitialSquad(offer.ovr);
    TacticsManager.setFormation(TacticsManager.currentFormation, gameState.squad);

    return gameState.club;
  }
};
