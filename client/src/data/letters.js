// ─── Bangla Letter Data with Stroke Paths for Tracing ─────────────────────────
// Each letter has: character, name, audio phoneme, stroke paths (SVG-like),
// vowel markers, and category for progressive difficulty.
//
// Stroke paths are simplified reference paths for tracing validation.
// Each stroke is an array of [x, y] points normalized to a 0-1 coordinate space.

export const VOWELS = [
  { char: 'অ', name: 'অ', phoneme: 'ô', category: 'vowel', difficulty: 1,
    strokes: [
      [[0.5, 0.15], [0.5, 0.85]],           // vertical line
      [[0.2, 0.15], [0.8, 0.15]],            // top horizontal
      [[0.3, 0.5], [0.7, 0.5]],              // middle horizontal
    ],
    vowelMarker: null,
  },
  { char: 'আ', name: 'আ', phoneme: 'a', category: 'vowel', difficulty: 1,
    strokes: [
      [[0.35, 0.15], [0.35, 0.85]],
      [[0.15, 0.15], [0.65, 0.15]],
      [[0.25, 0.5], [0.55, 0.5]],
      [[0.65, 0.15], [0.65, 0.85]],          // additional vertical for আ
    ],
    vowelMarker: null,
  },
  { char: 'ই', name: 'ই', phoneme: 'i', category: 'vowel', difficulty: 2,
    strokes: [
      [[0.5, 0.15], [0.5, 0.85]],
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.65], [0.5, 0.45], [0.7, 0.65]],
    ],
    vowelMarker: null,
  },
];

export const CONSONANTS = [
  { char: 'ক', name: 'কো', phoneme: 'kô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.5, 0.15], [0.5, 0.85]],           // main vertical
      [[0.2, 0.15], [0.8, 0.15]],            // matra line
      [[0.25, 0.5], [0.5, 0.5], [0.5, 0.85]], // bottom curve
    ],
    vowelMarker: null,
    confusableWith: ['খ'],
  },
  { char: 'খ', name: 'খো', phoneme: 'khô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.5, 0.15], [0.5, 0.85]],
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.4], [0.7, 0.4]],
      [[0.3, 0.65], [0.5, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['ক'],
  },
  { char: 'গ', name: 'গো', phoneme: 'gô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.55]],
      [[0.3, 0.55], [0.5, 0.55], [0.7, 0.75], [0.5, 0.85], [0.3, 0.75]],
    ],
    vowelMarker: null,
    confusableWith: ['ঘ'],
  },
  { char: 'ঘ', name: 'ঘো', phoneme: 'ghô', category: 'consonant', difficulty: 2,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.4, 0.15], [0.4, 0.5]],
      [[0.6, 0.15], [0.6, 0.5]],
      [[0.3, 0.5], [0.7, 0.5], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['গ'],
  },
  { char: 'চ', name: 'চো', phoneme: 'chô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.5]],
      [[0.25, 0.5], [0.75, 0.5]],
      [[0.35, 0.5], [0.35, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['ছ'],
  },
  { char: 'ছ', name: 'ছো', phoneme: 'chhô', category: 'consonant', difficulty: 2,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.5]],
      [[0.3, 0.55], [0.7, 0.55]],
      [[0.4, 0.55], [0.3, 0.85]],
      [[0.6, 0.55], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['চ'],
  },
  { char: 'ত', name: 'তো', phoneme: 'tô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.55]],
      [[0.3, 0.55], [0.7, 0.55], [0.7, 0.85], [0.3, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['থ'],
  },
  { char: 'দ', name: 'দো', phoneme: 'dô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.3, 0.5], [0.5, 0.85], [0.7, 0.5], [0.5, 0.15]],
    ],
    vowelMarker: null,
    confusableWith: ['ধ'],
  },
  { char: 'ন', name: 'নো', phoneme: 'nô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.15], [0.3, 0.85]],
      [[0.3, 0.5], [0.7, 0.5], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['ণ'],
  },
  { char: 'প', name: 'পো', phoneme: 'pô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.4, 0.15], [0.4, 0.85]],
      [[0.4, 0.5], [0.7, 0.5], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['ফ'],
  },
  { char: 'ব', name: 'বো', phoneme: 'bô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.35, 0.15], [0.35, 0.85]],
      [[0.35, 0.4], [0.65, 0.55], [0.35, 0.7]],
    ],
    vowelMarker: null,
    confusableWith: ['ভ'],
  },
  { char: 'ম', name: 'মো', phoneme: 'mô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.15], [0.3, 0.85]],
      [[0.3, 0.45], [0.5, 0.65], [0.7, 0.45]],
      [[0.7, 0.45], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: [],
  },
  { char: 'র', name: 'রো', phoneme: 'rô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.3, 0.5], [0.5, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['ড'],
  },
  { char: 'ল', name: 'লো', phoneme: 'lô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.55]],
      [[0.3, 0.55], [0.5, 0.55], [0.5, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: [],
  },
  { char: 'শ', name: 'শো', phoneme: 'shô', category: 'consonant', difficulty: 2,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.15], [0.3, 0.5], [0.5, 0.5]],
      [[0.5, 0.15], [0.5, 0.85]],
      [[0.5, 0.65], [0.7, 0.65], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: ['স', 'ষ'],
  },
  { char: 'স', name: 'সো', phoneme: 'sô', category: 'consonant', difficulty: 2,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.5, 0.15], [0.5, 0.85]],
      [[0.3, 0.45], [0.5, 0.45]],
      [[0.5, 0.65], [0.7, 0.65]],
    ],
    vowelMarker: null,
    confusableWith: ['শ', 'ষ'],
  },
  { char: 'হ', name: 'হো', phoneme: 'hô', category: 'consonant', difficulty: 1,
    strokes: [
      [[0.2, 0.15], [0.8, 0.15]],
      [[0.3, 0.15], [0.3, 0.5]],
      [[0.3, 0.5], [0.5, 0.7], [0.7, 0.5]],
      [[0.7, 0.5], [0.7, 0.85]],
    ],
    vowelMarker: null,
    confusableWith: [],
  },
];

// Vowel markers with their positional directions for the float-in animation
export const VOWEL_MARKERS = [
  { char: 'া', name: 'আ-কার', direction: 'right', position: 'right',
    strokes: [[[0.5, 0.15], [0.5, 0.85]]] },
  { char: 'ি', name: 'ই-কার', direction: 'left', position: 'left',
    strokes: [[[0.5, 0.1], [0.3, 0.3], [0.5, 0.15]]] },
  { char: 'ী', name: 'দীর্ঘ ই-কার', direction: 'left', position: 'left',
    strokes: [[[0.5, 0.1], [0.3, 0.3], [0.5, 0.15], [0.5, 0.85]]] },
  { char: 'ু', name: 'উ-কার', direction: 'below', position: 'below',
    strokes: [[[0.3, 0.5], [0.5, 0.7], [0.7, 0.5]]] },
  { char: 'ূ', name: 'দীর্ঘ উ-কার', direction: 'below', position: 'below',
    strokes: [[[0.3, 0.5], [0.5, 0.7], [0.7, 0.5], [0.7, 0.7]]] },
  { char: 'ে', name: 'এ-কার', direction: 'left', position: 'left',
    strokes: [[[0.5, 0.1], [0.3, 0.5], [0.5, 0.15]]] },
  { char: 'ো', name: 'ও-কার', direction: 'left', position: 'both',
    strokes: [[[0.3, 0.1], [0.1, 0.5], [0.3, 0.15]], [[0.7, 0.15], [0.7, 0.85]]] },
];

// Letters grouped by difficulty for progressive unlocking
export const LETTER_SETS = {
  beginner: ['ক', 'খ', 'গ', 'চ', 'ত', 'দ', 'ন', 'প', 'ব', 'ম', 'র', 'ল'],
  intermediate: ['ঘ', 'ছ', 'শ', 'স', 'হ', 'অ', 'আ', 'ই'],
  advanced: [],
};

// Helper to get a random set of 3 letters for selection
export function getLetterChoices(learned = [], difficulty = 'beginner') {
  const pool = LETTER_SETS[difficulty] || LETTER_SETS.beginner;
  const available = pool.filter(l => !learned.includes(l));
  const source = available.length >= 3 ? available : pool;
  
  // Shuffle and pick 3
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Get full letter data by character
export function getLetterData(char) {
  return [...VOWELS, ...CONSONANTS].find(l => l.char === char) || null;
}

// Shop color options
export const SHOP_COLORS = [
  { name: 'নীল', color: '#4fc3f7', accent: '#0288d1' },
  { name: 'সবুজ', color: '#66bb6a', accent: '#2e7d32' },
  { name: 'কমলা', color: '#ffa726', accent: '#e65100' },
  { name: 'বেগুনি', color: '#ab47bc', accent: '#6a1b9a' },
  { name: 'লাল', color: '#ef5350', accent: '#c62828' },
];
