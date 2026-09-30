/**
 * CAMISA11 — Football Career & Manager
 * market.js — Mercado de Transferências, Compra, Venda e Scout de Atletas
 */

const TransferMarket = {
  availablePlayers: [],
  currentFilter: 'ALL',

  // Gera lista rotativa de atletas no mercado de acordo com a divisão e prestígio do clube
  refreshMarket(teamOvr = 68, count = 8) {
    this.availablePlayers = [];
    const positions = ['GK', 'LE', 'ZAG', 'LD', 'VOL', 'MC', 'MEI', 'PE', 'PD', 'ATA'];

    for (let i = 0; i < count; i++) {
      const pos = positions[Math.floor(Math.random() * positions.length)];
      // OVR do atleta no mercado varia entre -5 e +6 do OVR da equipe
      const targetOvr = Math.max(58, Math.min(88, teamOvr + Math.floor(Math.random() * 11) - 4));
      const player = ClubManager.createPlayer(pos, targetOvr);
      this.availablePlayers.push(player);
    }
  },

  // Filtra atletas disponíveis
  getFilteredPlayers() {
    if (this.currentFilter === 'ALL') return this.availablePlayers;
    if (this.currentFilter === 'DEF') {
      return this.availablePlayers.filter(p => ['ZAG', 'LE', 'LD'].includes(p.pos));
    }
    if (this.currentFilter === 'MEI') {
      return this.availablePlayers.filter(p => ['VOL', 'MC', 'MEI', 'ME', 'MD'].includes(p.pos));
    }
    if (this.currentFilter === 'ATA') {
      return this.availablePlayers.filter(p => ['ATA', 'PE', 'PD'].includes(p.pos));
    }
    return this.availablePlayers.filter(p => p.pos === this.currentFilter);
  },

  // Compra um atleta do mercado
  buyPlayer(playerId, club, squad) {
    const pIndex = this.availablePlayers.findIndex(p => p.id === playerId);
    if (pIndex === -1) return { success: false, message: 'Jogador não encontrado no mercado!' };

    const player = this.availablePlayers[pIndex];
    if (club.budget < player.value) {
      return { success: false, message: 'Orçamento insuficiente para esta contratação!' };
    }

    club.budget -= player.value;
    player.isStarter = false;
    player.slotIndex = null;
    player.energy = 100;
    squad.push(player);

    // Remove do mercado
    this.availablePlayers.splice(pIndex, 1);

    return { success: true, message: `Contratação confirmada! ${player.name} (${player.ovr} OVR) assinou com o clube.`, player };
  },

  // Vende um atleta do elenco
  sellPlayer(playerId, club, squad) {
    if (squad.length <= 11) {
      return { success: false, message: 'Você precisa manter no mínimo 11 jogadores no elenco!' };
    }

    const pIndex = squad.findIndex(p => p.id === playerId);
    if (pIndex === -1) return { success: false, message: 'Jogador não encontrado no elenco!' };

    const player = squad[pIndex];
    club.budget += player.value;

    const wasStarter = player.isStarter;
    const oldSlot = player.slotIndex;

    squad.splice(pIndex, 1);

    // Se era titular, substitui automaticamente
    if (wasStarter) {
      TacticsManager.setFormation(TacticsManager.currentFormation, squad);
    }

    return { success: true, message: `Venda concluída! ${player.name} vendido por R$ ${player.value.toLocaleString('pt-BR')}.`, value: player.value };
  }
};
