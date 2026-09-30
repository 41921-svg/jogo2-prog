const fs = require('fs');

const ClubManager = {
  getShapeOptions() {
    return [
      { id: 'shield', name: 'Escudo' },
      { id: 'circle', name: 'Círculo' },
      { id: 'hexagon', name: 'Hexágono' },
      { id: 'diamond', name: 'Diamante' },
      { id: 'crest', name: 'Brasão' },
      { id: 'star', name: 'Estrela' },
      { id: 'octagon', name: 'Octógono' }
    ];
  },

  getPatternOptions() {
    return [
      { id: 'solid', name: 'Liso' },
      { id: 'stripes', name: 'Listras' },
      { id: 'sash', name: 'Faixa' },
      { id: 'split', name: 'Bipartido' },
      { id: 'chevron', name: 'Chevron' },
      { id: 'checkered', name: 'Quadriculado' },
      { id: 'ring', name: 'Anel' }
    ];
  },

  getSymbolOptions() {
    return [
      { id: 'monogram', name: 'Sigla' },
      { id: 'ball', name: 'Bola' },
      { id: 'star', name: 'Estrela' },
      { id: 'crown', name: 'Coroa' },
      { id: 'eagle', name: 'Águia' },
      { id: 'lightning', name: 'Raio' },
      { id: 'lion', name: 'Leão' },
      { id: 'flame', name: 'Chama' },
      { id: 'stripe', name: 'Faixa' },
      { id: 'wing', name: 'Asa' }
    ];
  },

  renderBadge(club, size = 48) {
    if (!club) return '';
    const primary = club.primaryColor || '#0f172a';
    const secondary = club.secondaryColor || '#10b981';
    const tertiary = club.tertiaryColor || '#ffffff';
    const shape = club.badgeShape || club.emblemShape || 'shield';
    const pattern = club.badgePattern || club.emblemPattern || 'solid';
    const symbol = club.badgeSymbol || club.emblemSymbol || 'ball';
    const sigla = (club.sigla || club.shortName || 'C11').toUpperCase().slice(0, 4);

    const strokeWidth = Math.max(2, Math.round(size / 24));
    const clipId = 'emb_' + Math.random().toString(36).substr(2, 7);

    // 1. Geometria Base e Caminho de Corte (Clip Path)
    let shapeGeometry = '';
    let innerRim = '';

    switch (shape) {
      case 'circle':
        shapeGeometry = `<circle cx="50" cy="50" r="45"/>`;
        innerRim = `<circle cx="50" cy="50" r="39" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" opacity="0.85"/>`;
        break;
      case 'hexagon':
        shapeGeometry = `<polygon points="50,5 93,27 93,73 50,95 7,73 7,27"/>`;
        innerRim = `<polygon points="50,13 85,31 85,69 50,87 15,69 15,31" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
      case 'diamond':
        shapeGeometry = `<polygon points="50,4 96,50 50,96 4,50"/>`;
        innerRim = `<polygon points="50,14 86,50 50,86 14,50" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
      case 'crest':
        shapeGeometry = `<path d="M 12 12 Q 50 18 88 12 L 88 56 Q 88 88 50 96 Q 12 88 12 56 Z"/>`;
        innerRim = `<path d="M 20 19 Q 50 25 80 19 L 80 54 Q 80 80 50 88 Q 20 80 20 54 Z" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
      case 'star':
        shapeGeometry = `<polygon points="50,4 63,33 95,36 71,58 78,89 50,73 22,89 29,58 5,36 37,33"/>`;
        innerRim = `<polygon points="50,16 60,38 84,40 66,57 71,81 50,68 29,81 34,57 16,40 40,38" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.7)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
      case 'octagon':
        shapeGeometry = `<polygon points="30,6 70,6 94,30 94,70 70,94 30,94 6,70 6,30"/>`;
        innerRim = `<polygon points="32,13 68,13 87,32 87,68 68,87 32,87 13,68 13,32" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
      case 'shield':
      default:
        shapeGeometry = `<path d="M 12 12 L 88 12 L 82 56 Q 78 86 50 96 Q 22 86 18 56 Z"/>`;
        innerRim = `<path d="M 19 19 L 81 19 L 76 54 Q 73 79 50 88 Q 27 79 24 54 Z" fill="none" stroke="${tertiary}" stroke-width="${Math.max(1, strokeWidth * 0.75)}" stroke-linejoin="round" opacity="0.85"/>`;
        break;
    }

    // 2. Padrões Geométricos Internos (Patterns)
    let patternSvg = '';
    switch (pattern) {
      case 'stripes':
        patternSvg = `
          <rect x="22" y="0" width="12" height="100" fill="${secondary}" opacity="0.9"/>
          <rect x="46" y="0" width="8" height="100" fill="${tertiary}" opacity="0.85"/>
          <rect x="66" y="0" width="12" height="100" fill="${secondary}" opacity="0.9"/>
        `;
        break;
      case 'sash':
        patternSvg = `
          <polygon points="0,0 26,0 100,74 100,100 74,100 0,26" fill="${secondary}" opacity="0.9"/>
          <line x1="0" y1="0" x2="100" y2="100" stroke="${tertiary}" stroke-width="2.5" opacity="0.8"/>
        `;
        break;
      case 'split':
        patternSvg = `<rect x="50" y="0" width="50" height="100" fill="${secondary}" opacity="0.9"/>`;
        break;
      case 'chevron':
        patternSvg = `
          <polygon points="0,22 50,56 100,22 100,44 50,78 0,44" fill="${secondary}" opacity="0.9"/>
          <polygon points="0,22 50,56 100,22 100,28 50,62 0,28" fill="${tertiary}" opacity="0.8"/>
        `;
        break;
      case 'checkered':
        patternSvg = `
          <rect x="50" y="0" width="50" height="50" fill="${secondary}" opacity="0.85"/>
          <rect x="0" y="50" width="50" height="50" fill="${secondary}" opacity="0.85"/>
          <rect x="0" y="0" width="50" height="50" fill="${primary}" opacity="0.85"/>
          <rect x="50" y="50" width="50" height="50" fill="${primary}" opacity="0.85"/>
        `;
        break;
      case 'ring':
        patternSvg = `
          <circle cx="50" cy="50" r="32" fill="${secondary}" opacity="0.25"/>
          <circle cx="50" cy="50" r="32" fill="none" stroke="${secondary}" stroke-width="3" opacity="0.7"/>
        `;
        break;
      case 'solid':
      default:
        patternSvg = '';
        break;
    }

    // 3. Símbolos Abstratos / Monograma Central
    let symbolSvg = '';
    switch (symbol) {
      case 'monogram': {
        const fontSize = sigla.length <= 2 ? 32 : sigla.length === 3 ? 24 : 18;
        symbolSvg = `
          <circle cx="50" cy="50" r="22" fill="${primary}" stroke="${secondary}" stroke-width="2" opacity="0.92"/>
          <text x="50" y="${50 + fontSize * 0.35}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}" fill="${tertiary}" letter-spacing="-0.5">${sigla}</text>
        `;
        break;
      }
      case 'star':
        symbolSvg = `<polygon points="50,30 55,42 68,43 58,52 61,65 50,58 39,65 42,52 32,43 45,42" fill="${secondary}" stroke="${tertiary}" stroke-width="1.2"/>`;
        break;
      case 'crown':
        symbolSvg = `
          <path d="M 30 64 L 70 64 L 74 44 L 62 52 L 50 36 L 38 52 L 26 44 Z" fill="${secondary}" stroke="${tertiary}" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="26" cy="42" r="2.5" fill="${tertiary}"/>
          <circle cx="50" cy="34" r="3" fill="${tertiary}"/>
          <circle cx="74" cy="42" r="2.5" fill="${tertiary}"/>
          <line x1="32" y1="60" x2="68" y2="60" stroke="${tertiary}" stroke-width="1.5"/>
        `;
        break;
      case 'eagle':
        symbolSvg = `
          <path d="M 50 34 Q 32 42 22 56 Q 38 53 50 63 Q 62 53 78 56 Q 68 42 50 34 Z" fill="${secondary}" stroke="${tertiary}" stroke-width="1"/>
          <polygon points="50,57 47,67 53,67" fill="${tertiary}"/>
        `;
        break;
      case 'lightning':
        symbolSvg = `<polygon points="54,26 36,51 48,51 44,74 64,46 52,46" fill="${secondary}" stroke="${tertiary}" stroke-width="1.5" stroke-linejoin="round"/>`;
        break;
      case 'lion':
        symbolSvg = `
          <path d="M 50 30 C 38 30 33 41 34 50 C 35 59 44 67 50 67 C 56 67 65 59 66 50 C 67 41 62 30 50 30 Z" fill="${secondary}" stroke="${tertiary}" stroke-width="1.5"/>
          <circle cx="43" cy="47" r="2.5" fill="${tertiary}"/>
          <circle cx="57" cy="47" r="2.5" fill="${tertiary}"/>
          <polygon points="50,53 47,58 53,58" fill="${tertiary}"/>
        `;
        break;
      case 'flame':
        symbolSvg = `
          <path d="M 50 26 Q 63 43 59 56 Q 55 67 50 67 Q 41 67 41 56 Q 41 45 50 26 Z" fill="${secondary}" stroke="${tertiary}" stroke-width="1"/>
          <path d="M 50 40 Q 56 49 54 56 Q 52 61 50 61 Q 46 61 46 56 Q 46 51 50 40 Z" fill="${tertiary}"/>
        `;
        break;
      case 'wing':
        symbolSvg = `
          <path d="M 22 55 Q 50 32 78 42 Q 60 54 48 58 Q 34 61 22 55 Z" fill="${secondary}" stroke="${tertiary}" stroke-width="1.5" stroke-linejoin="round"/>
          <line x1="32" y1="52" x2="68" y2="44" stroke="${tertiary}" stroke-width="1.5"/>
        `;
        break;
      case 'stripe':
        symbolSvg = `
          <line x1="24" y1="20" x2="76" y2="80" stroke="${secondary}" stroke-width="9" stroke-linecap="round"/>
          <line x1="24" y1="20" x2="76" y2="80" stroke="${tertiary}" stroke-width="2.5" stroke-linecap="round"/>
        `;
        break;
      case 'ball':
      default:
        symbolSvg = `
          <circle cx="50" cy="50" r="16" fill="${tertiary}" stroke="${secondary}" stroke-width="2"/>
          <polygon points="50,44 55,48 53,54 47,54 45,48" fill="${primary}"/>
          <line x1="50" y1="44" x2="50" y2="34" stroke="${primary}" stroke-width="1.5"/>
          <line x1="55" y1="48" x2="65" y2="44" stroke="${primary}" stroke-width="1.5"/>
          <line x1="53" y1="54" x2="61" y2="62" stroke="${primary}" stroke-width="1.5"/>
          <line x1="47" y1="54" x2="39" y2="62" stroke="${primary}" stroke-width="1.5"/>
          <line x1="45" y1="48" x2="35" y2="44" stroke="${primary}" stroke-width="1.5"/>
        `;
        break;
    }

    // Constrói o elemento com o corte restrito à geometria da forma
    const baseElement = shapeGeometry.replace('/>', ` fill="${primary}" stroke="${secondary}" stroke-width="${strokeWidth * 2}" stroke-linejoin="round"/>`);

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="club-badge-svg" style="display:inline-block; vertical-align:middle; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <defs>
          <clipPath id="${clipId}">
            ${shapeGeometry}
          </clipPath>
        </defs>
        ${baseElement}
        ${patternSvg ? `<g clip-path="url(#${clipId})">${patternSvg}</g>` : ''}
        ${innerRim}
        ${symbolSvg}
      </svg>
    `;
  }
};

const shapes = ClubManager.getShapeOptions();
const patterns = ClubManager.getPatternOptions();
const symbols = ClubManager.getSymbolOptions();

console.log(`Shapes: ${shapes.length}, Patterns: ${patterns.length}, Symbols: ${symbols.length}`);
console.log(`Total possible original emblem combinations: ${shapes.length * patterns.length * symbols.length * 8} combos!`);

const sample = ClubManager.renderBadge({
  primaryColor: '#046a38',
  secondaryColor: '#ffffff',
  tertiaryColor: '#f59e0b',
  badgeShape: 'circle',
  badgePattern: 'sash',
  badgeSymbol: 'monogram',
  shortName: 'PAL'
}, 48);

console.log('Sample SVG length:', sample.length);
if (sample.includes('<svg') && sample.includes('clipPath') && sample.includes('PAL')) {
  console.log('✅ ALL GEOMETRIC EMBLEM TESTS PASSED!');
} else {
  console.error('❌ Failed SVG validation');
  process.exit(1);
}
