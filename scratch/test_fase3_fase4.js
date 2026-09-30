/**
 * CAMISA11 — Teste Automatizado de Conclusão: Fase 3 e Fase 4
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const DataProvider = require('../js/database.js');
const ClubManager = require('../js/club.js');
const SaveSystem = require('../js/save.js');
const GameEngine = require('../js/game.js');

async function runTests() {
  console.log('=== INICIANDO BATERIA DE TESTES: FASE 3 E FASE 4 ===\n');

  // TESTE 1: Logo Oficial e Renderização de Escudos SVG com 3 Cores
  console.log('--- 1. TESTE DE BRANDING E ESCUDOS SVG ---');
  const logoSvg = ClubManager.renderCamisa11Logo(76);
  assert(logoSvg.includes('<svg'), 'Logo Camisa11 deve ser um SVG válido');
  assert(logoSvg.includes('11'), 'Logo Camisa11 deve estampar o número 11');
  console.log('✅ Logo Oficial Camisa11 validado com sucesso.');

  const shapes = ['shield', 'circle', 'diamond', 'crest', 'hexagon', 'star'];
  const symbols = ['ball', 'star', 'crown', 'eagle', 'lightning', 'lion', 'flame', 'stripe'];

  shapes.forEach(shape => {
    symbols.forEach(symbol => {
      const badge = ClubManager.renderBadge({
        primaryColor: '#0f172a',
        secondaryColor: '#10b981',
        tertiaryColor: '#f59e0b',
        badgeShape: shape,
        badgeSymbol: symbol
      }, 64);
      assert(badge.includes('<svg'), `Badge ${shape} + ${symbol} deve gerar SVG`);
      assert(badge.includes('#0f172a'), `Badge deve conter cor primária`);
      assert(badge.includes('#10b981'), `Badge deve conter cor secundária`);
      assert(badge.includes('#f59e0b'), `Badge deve conter cor terciária`);
    });
  });
  console.log(`✅ 48 combinações de formatos (${shapes.length}) e símbolos (${symbols.length}) com 3 cores renderizadas com perfeição.`);

  // TESTE 2: DataProvider e Filtros da Regra 4 (Escolha de Clube)
  console.log('\n--- 2. TESTE DE CONSULTA E FILTROS DE CLUBES (REGRA 4) ---');
  await DataProvider.init();

  const allClubs = DataProvider.getAllClubs();
  assert(allClubs.length >= 49, `Esperado no mínimo 49 clubes, encontrados: ${allClubs.length}`);
  console.log(`✅ Base de clubes carregada: ${allClubs.length} clubes reais.`);

  const serieA = DataProvider.searchClubs({ division: 'brasileirao_serie_a' });
  assert(serieA.length === 20, `Série A deve possuir 20 clubes, encontrados: ${serieA.length}`);
  console.log(`✅ Filtro Série A: 20 clubes verificados.`);

  const serieB = DataProvider.searchClubs({ division: 'brasileirao_serie_b' });
  assert(serieB.length >= 10, `Série B deve possuir clubes`);
  console.log(`✅ Filtro Série B: ${serieB.length} clubes verificados.`);

  const estaduais = DataProvider.searchClubs({ division: 'ESTADUAIS' });
  assert(estaduais.length > 0, `Filtro Estaduais deve retornar clubes com estadual configurado`);
  console.log(`✅ Filtro Estaduais: ${estaduais.length} clubes mapeados.`);

  const spClubs = DataProvider.searchClubs({ state: 'SP' });
  assert(spClubs.length >= 4, `Filtro por estado (SP) deve retornar clubes paulistas`);
  console.log(`✅ Filtro por Estado (SP): ${spClubs.length} clubes encontrados.`);

  const searchFla = DataProvider.searchClubs({ query: 'Flamengo' });
  assert(searchFla.length >= 1 && searchFla[0].id === 'flamengo', 'Busca por texto deve encontrar o Flamengo');
  console.log(`✅ Busca por nome ("Flamengo"): encontrado com sucesso.`);

  // TESTE 3: Criação de Clube (Regra 5)
  console.log('\n--- 3. TESTE DA OFICINA DE CRIAÇÃO DE CLUBE (REGRA 5) ---');
  const customClubData = {
    name: 'Operário Ferroviário União',
    shortName: 'Operário',
    sigla: 'OFU',
    city: 'Ponta Grossa',
    state: 'PR',
    country: 'Brasil',
    primaryColor: '#1e293b',
    secondaryColor: '#38bdf8',
    tertiaryColor: '#f1f5f9',
    badgeShape: 'crest',
    badgeSymbol: 'eagle',
    division: 'brasileirao_serie_d'
  };

  const createdClub = DataProvider.createClub(customClubData);
  assert.strictEqual(createdClub.name, 'Operário Ferroviário União');
  assert.strictEqual(createdClub.shortName, 'Operário');
  assert.strictEqual(createdClub.sigla, 'OFU');
  assert.strictEqual(createdClub.state, 'PR');
  assert.strictEqual(createdClub.country, 'Brasil');
  assert.strictEqual(createdClub.division, 'brasileirao_serie_d');
  assert.strictEqual(createdClub.ovr, 64, 'Clube criado na Série D deve ter OVR calibrado 64');
  assert.strictEqual(createdClub.budget, 2500000, 'Orçamento Série D deve ser R$ 2.500.000');
  assert.strictEqual(createdClub.capacity, 10000, 'Capacidade Série D deve ser 10.000');
  assert(createdClub.stadium.includes('Operário'), 'Estádio gerado deve conter o nome do clube');
  assert(createdClub.staff && createdClub.staff.assistantCoach, 'Comissão técnica deve ser gerada');
  console.log(`✅ Criação de Clube na Série D validada com todos os campos e calibrações automáticas.`);

  // Elenco gerado para o clube criado
  const squad = DataProvider.getTeamPlayers(createdClub.id);
  assert.strictEqual(squad.length, 22, `Elenco gerado deve conter exatamente 22 atletas, encontrados: ${squad.length}`);
  const starters = squad.filter(p => p.number <= 11);
  assert(starters.length >= 11, 'Deve haver ao menos 11 titulares no elenco');
  console.log(`✅ Elenco equilibrado de 22 atletas gerado automaticamente para o novo clube.`);

  // TESTE 4: Inicialização de Carreira Completa com Clube Criado
  console.log('\n--- 4. TESTE DE INÍCIO DE CARREIRA COM CLUBE PERSONALIZADO ---');
  const career = GameEngine.startNewCareer(createdClub, {
    difficulty: 'normal',
    managerName: 'Professor Tite Silva'
  });

  assert(GameEngine.hasActiveCareer(), 'Carreira deve estar ativa no GameEngine');
  assert.strictEqual(career.club.id, createdClub.id);
  assert.strictEqual(career.season.competitionId, 'brasileirao_serie_d');
  assert.strictEqual(career.standings.length, 20, `Liga Série D deve conter exatamente 20 clubes participantes na tabela`);
  assert(career.fixtures.length > 0, 'Calendário de confrontos deve ser gerado');
  console.log(`✅ Temporada 2026 da Série D inicializada com 20 clubes e ${career.fixtures.length} rodadas.`);

  // TESTE 5: Inicialização de Carreira com Clube Criado na Série A (Garante substituição para manter 20 clubes)
  console.log('\n--- 5. TESTE DE INÍCIO NA SÉRIE A COM CLUBE CRIADO ---');
  const eliteCustom = DataProvider.createClub({
    name: 'Metropolitano FC',
    shortName: 'Metropolitano',
    sigla: 'MET',
    city: 'Curitiba',
    state: 'PR',
    division: 'brasileirao_serie_a'
  });
  const careerElite = GameEngine.startNewCareer(eliteCustom, { difficulty: 'easy' });
  assert.strictEqual(careerElite.standings.length, 20, 'Série A deve manter rigorosamente 20 clubes');
  assert(careerElite.standings.some(c => c.clubId === eliteCustom.id), 'Clube criado deve estar na tabela da Série A');
  console.log(`✅ Início na Série A com clube criado manteve exatamente 20 times na elite.`);

  // TESTE 6: Sistema de Save e Configurações (Fase 3)
  console.log('\n--- 6. TESTE DE PERSISTÊNCIA DO SAVE E CONFIGURAÇÕES ---');
  assert(SaveSystem.hasSave(), 'SaveSystem deve acusar save salvo no LocalStorage');
  const loadedSave = SaveSystem.loadGame();
  assert.strictEqual(loadedSave.club.id, eliteCustom.id);

  const exported = SaveSystem.exportSave();
  assert(typeof exported === 'string' && exported.length > 100, 'Exportação de save deve gerar JSON válido');

  // Teste de Configurações
  SaveSystem.saveSettings({ soundEnabled: false, volume: 0.45, simSpeed: 4 });
  const s = SaveSystem.loadSettings();
  assert.strictEqual(s.soundEnabled, false);
  assert.strictEqual(s.volume, 0.45);
  assert.strictEqual(s.simSpeed, 4);
  console.log(`✅ Persistência, exportação e ajustes de configurações validados.`);

  console.log('\n======================================================');
  console.log('🎉 TODOS OS TESTES DAS FASES 3 E 4 PASSARAM COM SUCESSO!');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
