// ============================================================================
// ENUMS
// ============================================================================

export type LevelCategory = 'MAGIC' | 'EXPLORERS' | 'KNIGHTS' | 'SPACE';

export type Genre =
  | 'ADVENTURE'
  | 'FANTASY'
  | 'MYSTERY'
  | 'SCIENCE'
  | 'COMICS'
  | 'ROMANCE'
  | 'HORROR'
  | 'BIOGRAPHY'
  | 'POETRY'
  | 'HISTORY'
  | 'ANIMALS'
  | 'HUMOR';

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
  dateRead?: string;
}

export interface CreateReadingSessionInput {
  childId: string;
  bookId: string;
  minutes: number;
  pageEnd?: number;
  mood?: number;
  finishedBook?: boolean;
  date?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const GENRES: Record<Genre, { name: string; icon: string; theme: string; color: string; mapColor: string }> = {
  ADVENTURE: { name: 'Aventura', icon: '🗺️', theme: 'Terras Selvagens', color: '#E67E22', mapColor: '#F5CBA7' },
  FANTASY: { name: 'Fantasia', icon: '🧙', theme: 'Reino Mágico', color: '#9B59B6', mapColor: '#D7BDE2' },
  MYSTERY: { name: 'Mistério', icon: '🔍', theme: 'Vale das Sombras', color: '#34495E', mapColor: '#ABB2B9' },
  SCIENCE: { name: 'Ciência', icon: '🔬', theme: 'Laboratório Secreto', color: '#1ABC9C', mapColor: '#A3E4D7' },
  COMICS: { name: 'Banda Desenhada', icon: '💥', theme: 'Cidade dos Heróis', color: '#E74C3C', mapColor: '#F5B7B1' },
  ROMANCE: { name: 'Romance', icon: '💕', theme: 'Jardim do Amor', color: '#EC407A', mapColor: '#F8BBD0' },
  HORROR: { name: 'Terror', icon: '👻', theme: 'Mansão Assombrada', color: '#5D4157', mapColor: '#D7BCC8' },
  BIOGRAPHY: { name: 'Biografia', icon: '👤', theme: 'Corredor da Fama', color: '#795548', mapColor: '#D7CCC8' },
  POETRY: { name: 'Poesia', icon: '🎭', theme: 'Teatro das Palavras', color: '#9C27B0', mapColor: '#E1BEE7' },
  HISTORY: { name: 'História', icon: '🏛️', theme: 'Ruínas Antigas', color: '#8D6E63', mapColor: '#D7CCC8' },
  ANIMALS: { name: 'Animais', icon: '🐾', theme: 'Selva Selvagem', color: '#4CAF50', mapColor: '#C8E6C9' },
  HUMOR: { name: 'Humor', icon: '😂', theme: 'Palco da Comédia', color: '#FFC107', mapColor: '#FFECB3' },
};

export const AVATARS = [
  // Row 1 - Pessoas
  '👱', '👱‍♀️', '👩‍🦱', '🧒', '👧', '👦', '🧒🏽', '👧🏽',
  // Row 2 - Pessoas + Super-heróis + Magos
  '🧒🏾', '🧒🏿', '👧🏿', '👦🏿', '🦸', '🦸‍♀️', '🧙', '🧙‍♀️',
  // Row 3 - Elfos + Animais
  '🧝', '🧝‍♀️', '🦊', '🐱', '🐼', '🦁', '🐸', '🦄',
];
