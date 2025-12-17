// ============================================================================
// LEVELS CONFIGURATION
// ============================================================================

export type LevelCategory = 'MAGIC' | 'EXPLORERS' | 'KNIGHTS' | 'SPACE';

export interface Level {
  rank: number;       // 1-6
  name: string;
  minBooks: number;
  icon: string;
  color: string;
}

export interface LevelCategoryConfig {
  code: LevelCategory;
  name: string;
  description: string;
  icon: string;
  levels: Level[];
}

// ============================================================================
// LEVEL THRESHOLDS (shared across all categories)
// ============================================================================

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 3,
  3: 7,
  4: 12,
  5: 20,
  6: 30,
};

// ============================================================================
// CATEGORY: MAGIC (Magia/Fantasia)
// ============================================================================

const MAGIC_LEVELS: Level[] = [
  { rank: 1, name: 'Aprendiz', minBooks: LEVEL_THRESHOLDS[1], icon: '✨', color: '#BDC3C7' },
  { rank: 2, name: 'Feiticeiro', minBooks: LEVEL_THRESHOLDS[2], icon: '🪄', color: '#85C1E9' },
  { rank: 3, name: 'Mago', minBooks: LEVEL_THRESHOLDS[3], icon: '🧙', color: '#82E0AA' },
  { rank: 4, name: 'Arquimago', minBooks: LEVEL_THRESHOLDS[4], icon: '🔮', color: '#F9E79F' },
  { rank: 5, name: 'Grão-Mestre', minBooks: LEVEL_THRESHOLDS[5], icon: '👑', color: '#F5B041' },
  { rank: 6, name: 'Lenda', minBooks: LEVEL_THRESHOLDS[6], icon: '⭐', color: '#AF7AC5' },
];

// ============================================================================
// CATEGORY: EXPLORERS (Exploradores)
// ============================================================================

const EXPLORER_LEVELS: Level[] = [
  { rank: 1, name: 'Curioso', minBooks: LEVEL_THRESHOLDS[1], icon: '🐣', color: '#BDC3C7' },
  { rank: 2, name: 'Explorador', minBooks: LEVEL_THRESHOLDS[2], icon: '🧭', color: '#85C1E9' },
  { rank: 3, name: 'Aventureiro', minBooks: LEVEL_THRESHOLDS[3], icon: '🎒', color: '#82E0AA' },
  { rank: 4, name: 'Descobridor', minBooks: LEVEL_THRESHOLDS[4], icon: '🗺️', color: '#F9E79F' },
  { rank: 5, name: 'Navegador', minBooks: LEVEL_THRESHOLDS[5], icon: '⛵', color: '#F5B041' },
  { rank: 6, name: 'Lenda', minBooks: LEVEL_THRESHOLDS[6], icon: '🌟', color: '#AF7AC5' },
];

// ============================================================================
// CATEGORY: KNIGHTS (Cavaleiros)
// ============================================================================

const KNIGHT_LEVELS: Level[] = [
  { rank: 1, name: 'Escudeiro', minBooks: LEVEL_THRESHOLDS[1], icon: '🛡️', color: '#BDC3C7' },
  { rank: 2, name: 'Cavaleiro', minBooks: LEVEL_THRESHOLDS[2], icon: '⚔️', color: '#85C1E9' },
  { rank: 3, name: 'Paladino', minBooks: LEVEL_THRESHOLDS[3], icon: '🗡️', color: '#82E0AA' },
  { rank: 4, name: 'Campeão', minBooks: LEVEL_THRESHOLDS[4], icon: '🏅', color: '#F9E79F' },
  { rank: 5, name: 'Guardião', minBooks: LEVEL_THRESHOLDS[5], icon: '🦁', color: '#F5B041' },
  { rank: 6, name: 'Lenda', minBooks: LEVEL_THRESHOLDS[6], icon: '👑', color: '#AF7AC5' },
];

// ============================================================================
// CATEGORY: SPACE (Espaço)
// ============================================================================

const SPACE_LEVELS: Level[] = [
  { rank: 1, name: 'Cadete', minBooks: LEVEL_THRESHOLDS[1], icon: '🌙', color: '#BDC3C7' },
  { rank: 2, name: 'Astronauta', minBooks: LEVEL_THRESHOLDS[2], icon: '👨‍🚀', color: '#85C1E9' },
  { rank: 3, name: 'Piloto', minBooks: LEVEL_THRESHOLDS[3], icon: '🚀', color: '#82E0AA' },
  { rank: 4, name: 'Comandante', minBooks: LEVEL_THRESHOLDS[4], icon: '🛸', color: '#F9E79F' },
  { rank: 5, name: 'Almirante', minBooks: LEVEL_THRESHOLDS[5], icon: '🌟', color: '#F5B041' },
  { rank: 6, name: 'Lenda Estelar', minBooks: LEVEL_THRESHOLDS[6], icon: '✨', color: '#AF7AC5' },
];

// ============================================================================
// ALL CATEGORIES
// ============================================================================

export const LEVEL_CATEGORIES: Record<LevelCategory, LevelCategoryConfig> = {
  MAGIC: {
    code: 'MAGIC',
    name: 'Magia',
    description: 'Torna-te um poderoso mago!',
    icon: '🪄',
    levels: MAGIC_LEVELS,
  },
  EXPLORERS: {
    code: 'EXPLORERS',
    name: 'Exploradores',
    description: 'Descobre novos mundos!',
    icon: '🧭',
    levels: EXPLORER_LEVELS,
  },
  KNIGHTS: {
    code: 'KNIGHTS',
    name: 'Cavaleiros',
    description: 'Luta pela honra e glória!',
    icon: '⚔️',
    levels: KNIGHT_LEVELS,
  },
  SPACE: {
    code: 'SPACE',
    name: 'Espaço',
    description: 'Explora o universo!',
    icon: '🚀',
    levels: SPACE_LEVELS,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get levels for a specific category
 */
export function getLevelsByCategory(category: LevelCategory): Level[] {
  return LEVEL_CATEGORIES[category].levels;
}

/**
 * Get current level based on books finished and category
 */
export function getCurrentLevel(booksFinished: number, category: LevelCategory): Level {
  const levels = getLevelsByCategory(category);

  // Find the highest level the user qualifies for
  for (let i = levels.length - 1; i >= 0; i--) {
    if (booksFinished >= levels[i].minBooks) {
      return levels[i];
    }
  }

  return levels[0];
}

/**
 * Get next level (or null if at max)
 */
export function getNextLevel(booksFinished: number, category: LevelCategory): Level | null {
  const levels = getLevelsByCategory(category);
  const currentLevel = getCurrentLevel(booksFinished, category);

  const nextRank = currentLevel.rank + 1;
  return levels.find(l => l.rank === nextRank) || null;
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(booksFinished: number, category: LevelCategory): number {
  const currentLevel = getCurrentLevel(booksFinished, category);
  const nextLevel = getNextLevel(booksFinished, category);

  if (!nextLevel) {
    return 100; // Max level reached
  }

  const booksInCurrentLevel = booksFinished - currentLevel.minBooks;
  const booksNeededForNext = nextLevel.minBooks - currentLevel.minBooks;

  return Math.round((booksInCurrentLevel / booksNeededForNext) * 100);
}

/**
 * Get books needed for next level
 */
export function getBooksToNextLevel(booksFinished: number, category: LevelCategory): number {
  const nextLevel = getNextLevel(booksFinished, category);

  if (!nextLevel) {
    return 0; // Max level reached
  }

  return nextLevel.minBooks - booksFinished;
}

