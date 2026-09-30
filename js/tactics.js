/**
 * CAMISA11 — Football Career & Manager
 * tactics.js — Gestão Tática, Formações (4-3-3, 4-4-2, etc.), Escalação no Campo 2D e Substituições
 */

const TacticsManager = {
  currentFormation: '4-3-3',
  mentality: 'EQUILIBRADA', // DEFENSIVA | EQUILIBRADA | OFENSIVA
  pressing: 'NORMAL',      // BAIXA | NORMAL | ALTA
  selectedSlotIndex: null, // Para troca de atleta

  // Altera formação tática
  setFormation(formationName, squad) {
    if (!Camisa11Data.FORMATIONS[formationName]) return;
    this.currentFormation = formationName;
    if (squad) {
      ClubManager.assignDefaultStarters(squad, formationName);
    }
  },

  // Altera mentalidade
  setMentality(val) {
    if (['DEFENSIVA', 'EQUILIBRADA', 'OFENSIVA'].includes(val)) {
      this.mentality = val;
    }
  },

  // Altera pressão
  setPressing(val) {
    if (['BAIXA', 'NORMAL', 'ALTA'].includes(val)) {
      this.pressing = val;
    }
  },

  // Renderiza os 11 titulares no campo 2D
  renderPitch(containerId, squad, onSlotClick) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const formation = Camisa11Data.FORMATIONS[this.currentFormation] || Camisa11Data.FORMATIONS['4-3-3'];
    const starters = squad.filter(p => p.isStarter);

    formation.slots.forEach((slot, index) => {
      // Encontra o atleta atribuído a este slot
      const player = starters.find(p => p.slotIndex === index) || starters[index];

      const pin = document.createElement('div');
      pin.className = 'pitch-player-pin';
      if (this.selectedSlotIndex === index) {
        pin.classList.add('selected-swap');
      }

      pin.style.top = `${slot.top}%`;
      pin.style.left = `${slot.left}%`;

      if (player) {
        const lastName = player.name.split(' ').pop();
        const energyClass = player.energy < 60 ? 'low-energy' : '';

        pin.innerHTML = `
          <div class="pin-badge-wrap ${energyClass}">
            <div class="pin-ovr-tag">${player.ovr}</div>
            <div class="pin-pos-label">${slot.label}</div>
            <div class="pin-jersey-circle">
              <span class="pin-num">${index + 1}</span>
            </div>
          </div>
          <div class="pin-name-label">${lastName}</div>
        `;
      } else {
        pin.innerHTML = `
          <div class="pin-badge-wrap empty">
            <div class="pin-pos-label">${slot.label}</div>
            <div class="pin-jersey-circle">+</div>
          </div>
          <div class="pin-name-label">Vazio</div>
        `;
      }

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onSlotClick) onSlotClick(index, player);
      });

      container.appendChild(pin);
    });
  },

  // Realiza a troca de dois jogadores (entre titulares ou titular e reserva)
  swapPlayers(squad, slotIndex, reservePlayerId) {
    const playerToReplace = squad.find(p => p.isStarter && p.slotIndex === slotIndex);
    const newPlayer = squad.find(p => p.id === reservePlayerId);

    if (!newPlayer) return;

    if (newPlayer.isStarter) {
      // Troca dois titulares de posição
      const tempSlot = newPlayer.slotIndex;
      newPlayer.slotIndex = slotIndex;
      if (playerToReplace) {
        playerToReplace.slotIndex = tempSlot;
      }
    } else {
      // Troca titular por reserva do banco
      if (playerToReplace) {
        playerToReplace.isStarter = false;
        playerToReplace.slotIndex = null;
      }
      newPlayer.isStarter = true;
      newPlayer.slotIndex = slotIndex;
    }

    this.selectedSlotIndex = null;
  }
};
