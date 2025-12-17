// ============================================================================
// ENUMS
// ============================================================================

export type LevelCategory = 'MAGIC' | 'EXPLORERS' | 'KNIGHTS' | 'SPACE';

export type Genre =
  | 'FANTASIA'
  | 'AVENTURA'
  | 'ESPACO'
  | 'NATUREZA'
  | 'MISTERIO'
  | 'OCEANO'
  | 'CIENCIA'
  | 'HISTORIA';

export type AchievementCategory = 'READING' | 'GENRE' | 'STREAK' | 'SPECIAL';

// ============================================================================
// MODELS
// ============================================================================

export interface Family {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  children?: Child[];
  settings?: FamilySettings;
}

export interface FamilySettings {
  id: string;
  familyId: string;
  language: string;
  notifications: boolean;
  weeklyReport: boolean;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  avatar: string;
  birthYear?: number;
  levelCategory?: LevelCategory;
  createdAt: string;
  updatedAt: string;

  // Dashboard stats (enriched fields)
  level: {
    name: string;
    color: string;
    icon: string;
    nextLevel: string;
    booksToNextLevel: number;
    progress: number;
  };
  booksCount: number;
  streak: number;
  todayReading: {
    minutes: number;
    goal: number;
  };
  weeklyActivity: {
    day: string;
    status: 'success' | 'fail' | 'neutral';
    label: string;
  }[];
  currentBooks: {
    id: string;
    title: string;
    author: string;
    genre: Genre;
    cover?: string;
    progress?: number;
    totalPages?: number;
    currentPage?: number;
    startDate?: string;
    daysReading?: number;
    type: 'page-progress' | 'page-only' | 'time-only';
  }[];
  lastFinishedBook?: {
    title: string;
    author: string;
    genre: Genre;
    rating: number;
    finishedAt: string;
  } | null;

  books?: Book[];
  achievements?: ChildAchievement[];
  _count?: {
    books: number;
  };
}

export interface Book {
  id: string;
  childId: string;
  title: string;
  author: string;
  isbn?: string;
  genre: Genre;
  totalPages?: number;
  status: 'to-read' | 'reading' | 'finished';
  currentPage?: number;
  startDate?: string;
  finishDate?: string;
  rating?: number;
  notes?: string;
  favoriteCharacter?: string;
  recommended?: boolean;
  dateRead: string;
  createdAt: string;
  updatedAt: string;
  child?: Pick<Child, 'id' | 'name' | 'avatar'>;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirements: Record<string, unknown>;
  earned?: boolean;
  earnedAt?: string;
}

export interface ChildAchievement {
  id: string;
  childId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: Achievement;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface Level {
  name: string;
  minBooks: number;
  icon: string;
  color: string;
}

export interface LevelProgress {
  current: Level;
  next: Level | null;
  progress: number;
  booksToNextLevel: number;
}

export interface GenreStat {
  genre: string;
  name: string;
  icon: string;
  theme: string;
  color: string;
  count: number;
  discovered: boolean;
}

export interface ChildStats {
  child: Pick<Child, 'id' | 'name' | 'avatar'>;
  level: LevelProgress;
  books: {
    total: number;
    thisMonth: number;
    thisYear: number;
    averageRating: number | null;
  };
  genres: {
    stats: GenreStat[];
    discovered: number;
    total: number;
    favorite: string | null;
  };
  achievements: {
    earned: number;
    total: number;
    recent: Achievement[];
  };
}

export interface FamilyStats {
  family: Pick<Family, 'id' | 'name'>;
  totals: {
    children: number;
    books: number;
    achievements: number;
    genresDiscovered: number;
  };
  monthlyStats: { month: string; count: number }[];
  genreStats: { genre: string; count: number }[];
  childStats: {
    id: string;
    name: string;
    avatar: string;
    bookCount: number;
    achievementCount: number;
    level: LevelProgress;
  }[];
}

// ============================================================================
// FORMS
// ============================================================================

export interface CreateFamilyInput {
  name: string;
  email?: string;
}

export interface CreateChildInput {
  familyId: string;
  name: string;
  avatar?: string;
  birthYear?: number;
}

export interface CreateBookInput {
  childId: string;
  title: string;
  author: string;
  isbn?: string;
  genre: Genre;
  totalPages?: number;
  status?: 'to-read' | 'reading' | 'finished';
  currentPage?: number;
  startDate?: string;
  finishDate?: string;
  rating?: number;
  notes?: string;
  favoriteCharacter?: string;
  recommended?: boolean;
  dateRead?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const GENRES: Record<Genre, { name: string; icon: string; theme: string; color: string; mapColor: string }> = {
  FANTASIA: { name: 'Fantasia', icon: '🏰', theme: 'Reino Mágico', color: '#9B59B6', mapColor: '#D7BDE2' },
  AVENTURA: { name: 'Aventura', icon: '🗺️', theme: 'Terras Selvagens', color: '#E67E22', mapColor: '#F5CBA7' },
  ESPACO: { name: 'Espaço', icon: '🚀', theme: 'Galáxia Infinita', color: '#2C3E50', mapColor: '#85929E' },
  NATUREZA: { name: 'Natureza', icon: '🌲', theme: 'Floresta Encantada', color: '#27AE60', mapColor: '#ABEBC6' },
  MISTERIO: { name: 'Mistério', icon: '🔍', theme: 'Vale das Sombras', color: '#34495E', mapColor: '#ABB2B9' },
  OCEANO: { name: 'Oceano', icon: '🌊', theme: 'Mar dos Piratas', color: '#3498DB', mapColor: '#AED6F1' },
  CIENCIA: { name: 'Ciência', icon: '🔬', theme: 'Laboratório Secreto', color: '#1ABC9C', mapColor: '#A3E4D7' },
  HISTORIA: { name: 'História', icon: '📜', theme: 'Ruínas Antigas', color: '#795548', mapColor: '#D7CCC8' },
};

export const AVATARS = [
  // Row 1 - Pessoas
  '👱', '👱‍♀️', '👩‍🦱', '🧒', '👧', '👦', '🧒🏽', '👧🏽',
  // Row 2 - Pessoas + Super-heróis + Magos
  '🧒🏾', '🧒🏿', '👧🏿', '👦🏿', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️',
  // Row 3 - Elfos + Animais
  '🧝', '🧝‍♀️', '🦊', '🐱', '🐼', '🦁', '🐸', '🦄',
];
