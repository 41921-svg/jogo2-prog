/**
 * CAMISA11 — "Seu clube. Sua história."
 * js/save.js — SISTEMA DE SALVAMENTO & PERSISTÊNCIA (LocalStorage)
 * 
 * Gerencia persistência integral da carreira, integridade dos dados e
 * previne perdas de progresso ao atualizar a página.
 */

const SaveSystem = {
  SAVE_KEY: 'CAMISA11_CAREER_SAVE_V1',
  SETTINGS_KEY: 'CAMISA11_SETTINGS_V1',

  // Verifica se há save válido gravado
  hasSave() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const data = localStorage.getItem(this.SAVE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      return Boolean(parsed && parsed.club && parsed.club.id);
    } catch (err) {
      console.error('SaveSystem.hasSave: Erro ao verificar save.', err);
      return false;
    }
  },

  // Salva o estado completo da carreira
  saveGame(state) {
    if (!state || !state.club) {
      console.warn('SaveSystem.saveGame: Estado inválido para salvar.');
      return false;
    }

    try {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        club: state.club,
        manager: state.manager || {
          name: 'Treinador Camisa11',
          reputation: 60,
          titles: 0,
          matches: 0,
          wins: 0,
          draws: 0,
          losses: 0
        },
        season: state.season || {
          year: 2026,
          currentRound: 1,
          competitionId: state.club.division || 'brasileirao_serie_a'
        },
        squad: state.squad || [],
        finances: state.finances || {
          budget: state.club.budget || 5000000,
          wageBudget: state.club.wageBudget || 1000000,
          weeklyWages: 0
        },
        standings: state.standings || [],
        fixtures: state.fixtures || [],
        tactics: state.tactics || {
          formation: '4-3-3',
          mentality: 'EQUILIBRADA',
          pressing: 'NORMAL',
          tempo: 'NORMAL',
          defensiveLine: 'NORMAL'
        },
        history: state.history || [],
        market: state.market || []
      };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(payload));
      }
      return true;
    } catch (err) {
      console.error('SaveSystem.saveGame: Erro ao persistir save no LocalStorage.', err);
      return false;
    }
  },

  // Carrega o save existente
  loadGame() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      // Validações mínimas de integridade
      if (!parsed || !parsed.club || !parsed.club.id) {
        console.warn('SaveSystem.loadGame: Save corrompido ou incompleto.');
        return null;
      }

      return parsed;
    } catch (err) {
      console.error('SaveSystem.loadGame: Falha ao carregar e decodificar save.', err);
      return null;
    }
  },

  // Remove o save da carreira
  deleteSave() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.SAVE_KEY);
      }
      return true;
    } catch (err) {
      console.error('SaveSystem.deleteSave: Erro ao remover save.', err);
      return false;
    }
  },

  // Exporta save em string JSON para backup
  exportSave() {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.SAVE_KEY);
  },

  // Importa save a partir de string JSON
  importSave(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.club) {
        throw new Error('Arquivo de save inválido');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(parsed));
      }
      return true;
    } catch (err) {
      console.error('SaveSystem.importSave: Falha ao importar save.', err);
      return false;
    }
  },

  // Carrega e salva configurações globais (áudio, visual, etc.)
  loadSettings() {
    try {
      if (typeof localStorage === 'undefined') return { soundEnabled: true, soundVolume: 0.7 };
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (!raw) return { soundEnabled: true, soundVolume: 0.7 };
      return JSON.parse(raw);
    } catch (e) {
      return { soundEnabled: true, soundVolume: 0.7 };
    }
  },

  saveSettings(settings) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      }
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Exporta para Node.js (testes) ou Window (Navegador)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SaveSystem;
}
