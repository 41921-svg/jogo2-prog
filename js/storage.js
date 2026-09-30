/**
 * CAMISA11 — Football Career & Manager
 * storage.js — Gerenciamento de Persistência LocalStorage e Saves
 */

const STORAGE_KEY = 'CAMISA11_CAREER_SAVE_V1';
const SETTINGS_KEY = 'CAMISA11_SETTINGS_V1';

const StorageManager = {
  saveGame(state) {
    try {
      if (!state) return false;
      const data = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(`${STORAGE_KEY}_TIME`, Date.now().toString());
      return true;
    } catch (e) {
      console.error('Erro ao salvar:', e);
      return false;
    }
  },

  loadGame() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao carregar:', e);
      return null;
    }
  },

  hasSave() {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  clearSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_TIME`);
      return true;
    } catch (e) {
      console.error('Erro ao limpar save:', e);
      return false;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  },

  loadSettings() {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) return JSON.parse(s);
    } catch (e) {}
    return { soundEnabled: true, hintsEnabled: true };
  }
};
