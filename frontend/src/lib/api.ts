import type {
  Family,
  Child,
  Book,
  ChildBook,
  LibraryBook,
  Achievement,
  ChildStats,
  FamilyStats,
  CreateFamilyInput,
  CreateChildInput,
  CreateChildBookInput,
  UpdateChildBookInput,
  UpdateBookInput,
  RegisterInput,
  Genre,
  SchoolAdmin,
  Escola,
  Turma,
  TurmaInput,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle token expiration - redirect to auth page
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = 'https://www.vamosler.pt/';
    }
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  checkEmail: (email: string) =>
    request<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  register: (data: RegisterInput) =>
    request<{ token: string; family: Family; firstChild: Child }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<
      | { token: string; type: 'family'; family: Family }
      | { token: string; type: 'school_admin'; schoolAdmin: SchoolAdmin }
    >('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ============================================================================
// SCHOOL ADMIN API
// ============================================================================

export const schoolApi = {
  getAccount: () => request<SchoolAdmin>('/school/account'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/school/account/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  listEscolas: () => request<{ escolas: Escola[] }>('/school/escolas'),

  createEscola: (nome: string) =>
    request<Escola>('/school/escolas', {
      method: 'POST',
      body: JSON.stringify({ nome }),
    }),

  updateEscola: (id: string, nome: string) =>
    request<Escola>(`/school/escolas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nome }),
    }),

  deleteEscola: (id: string) =>
    request<{ success: boolean }>(`/school/escolas/${id}`, {
      method: 'DELETE',
    }),

  listTurmas: (escolaId: string) =>
    request<{ turmas: Turma[] }>(`/school/escolas/${escolaId}/turmas`),

  createTurma: (escolaId: string, data: TurmaInput) =>
    request<Turma>(`/school/escolas/${escolaId}/turmas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTurma: (id: string, data: TurmaInput) =>
    request<Turma>(`/school/turmas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTurma: (id: string) =>
    request<{ success: boolean }>(`/school/turmas/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// FAMILY API
// ============================================================================

export const familyApi = {
  get: (id: string) => request<Family>(`/family/${id}`),

  create: (data: CreateFamilyInput) =>
    request<Family>('/family', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateFamilyInput>) =>
    request<Family>(`/family/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/family/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// CHILDREN API
// ============================================================================

export interface ChildListItem {
  id: string;
  name: string;
  avatar: string;
  birthYear: number | null;
  levelCategory: string;
  dailyGoal: number;
}

export const childrenApi = {
  get: (id: string) => request<Child>(`/children/${id}`),

  getByFamily: (familyId: string) => request<Child[]>(`/children/family/${familyId}`),

  getList: (familyId: string) => request<ChildListItem[]>(`/children/family/${familyId}/list`),

  create: (data: CreateChildInput) =>
    request<Child>('/children', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<CreateChildInput, 'familyId'>>) =>
    request<Child>(`/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/children/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// BOOKS API
// ============================================================================

// Shared book metadata + family library
export const booksApi = {
  // Family library (metadata + which children already have each book)
  library: (familyId: string, filters?: { genre?: Genre; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return request<{ books: LibraryBook[] }>(
      `/books/library/${familyId}${query ? `?${query}` : ''}`
    );
  },

  // Update shared metadata (affects every child sharing the book)
  update: (id: string, data: UpdateBookInput) =>
    request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete the shared book (removes it from the library + all children's copies)
  delete: (id: string) =>
    request<{ success: boolean }>(`/books/${id}`, {
      method: 'DELETE',
    }),
};

// Per-child reading state
export const childBooksApi = {
  getByFamily: (
    familyId: string,
    filters?: {
      status?: 'reading' | 'to-read' | 'finished';
      genre?: string;
      childId?: string;
      search?: string;
      sortBy?: 'recent' | 'title' | 'rating' | 'progress';
      limit?: number;
      offset?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.childId) params.append('childId', filters.childId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    return request<{
      childBooks: ChildBook[];
      counts: { reading: number; 'to-read': number; finished: number };
    }>(`/child-books/family/${familyId}${queryString ? `?${queryString}` : ''}`);
  },

  get: (id: string) => request<ChildBook>(`/child-books/${id}`),

  getByChild: (childId: string, params?: { genre?: Genre; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return request<{ childBooks: ChildBook[]; total: number }>(
      `/child-books/child/${childId}${query ? `?${query}` : ''}`
    );
  },

  // Add a book to a child: either { childId, bookId } (from library) or
  // { childId, book: {...} } (new book). Optionally with initial reading state.
  create: (data: CreateChildBookInput) =>
    request<{ childBook: ChildBook; newAchievements: Achievement[] }>('/child-books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update a child's reading state
  update: (id: string, data: UpdateChildBookInput) =>
    request<ChildBook>(`/child-books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Remove a child's copy of a book (keeps the shared book unless orphaned)
  delete: (id: string) =>
    request<{ success: boolean }>(`/child-books/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// ACHIEVEMENTS API
// ============================================================================

export const achievementsApi = {
  getAll: () => request<Achievement[]>('/achievements'),

  getByChild: (childId: string) =>
    request<{
      achievements: Achievement[];
      totalEarned: number;
      totalAvailable: number;
    }>(`/achievements/child/${childId}`),

  check: (childId: string) =>
    request<{ newAchievements: Achievement[]; count: number }>(`/achievements/check/${childId}`, {
      method: 'POST',
    }),
};

// ============================================================================
// STATS API
// ============================================================================

export const statsApi = {
  getChildStats: (childId: string) => request<ChildStats>(`/stats/child/${childId}`),

  getFamilyStats: (familyId: string) => request<FamilyStats>(`/stats/family/${familyId}`),

  getLeaderboard: (familyId: string, period?: 'week' | 'month' | 'year' | 'all') => {
    const query = period ? `?period=${period}` : '';
    return request<{
      period: string;
      leaderboard: {
        id: string;
        name: string;
        avatar: string;
        bookCount: number;
        level: { current: { name: string; icon: string } };
      }[];
    }>(`/stats/leaderboard/${familyId}${query}`);
  },
};

// ============================================================================
// READING LOGS API
// ============================================================================

export const readingLogsApi = {
  create: (data: {
    childBookId: string;
    minutes: number;
    pageEnd?: number;
    mood?: number;
    finishedBook?: boolean;
    date?: string;
    rating?: number;
    favoriteCharacter?: string;
    notes?: string;
  }) =>
    request('/reading-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStats: (
    familyId: string,
    filters?: {
      childId?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.childId) params.append('childId', filters.childId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const queryString = params.toString();
    return request<{
      totalSessions: number;
      totalMinutes: number;
      avgMinutes: number;
    }>(`/reading-logs/stats/${familyId}${queryString ? `?${queryString}` : ''}`);
  },

  getByFamily: (
    familyId: string,
    filters?: {
      childId?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.childId) params.append('childId', filters.childId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const queryString = params.toString();
    return request<{
      sessions: Array<{
        id: string;
        childId: string;
        childName: string;
        childAvatar: string;
        bookId: string;
        bookName: string;
        bookAuthor: string;
        bookCover: string;
        date: string;
        minutes: number;
        mood: number | null;
        pagesRead: number;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/reading-logs/family/${familyId}${queryString ? `?${queryString}` : ''}`);
  },

  update: (
    id: string,
    data: {
      minutes?: number;
      mood?: number;
      date?: string;
      pageEnd?: number;
    }
  ) =>
    request('/reading-logs/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/reading-logs/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };

// ============================================================================
// MAP API
// ============================================================================

interface LevelInfo {
  rank: number;
  name: string;
  minBooks: number;
  icon: string;
  color: string;
}

interface MapChildData {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  todayMinutes: number;
  dailyGoal: number;
  totalReadingDays: number;
  streak: number;
  totalHours: number;
  levelCategory: string;
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
}

interface MapFamilyResponse {
  family: {
    id: string;
    name: string;
  };
  children: MapChildData[];
  aggregated: MapChildData & { levelCategory: string };
}

export const mapApi = {
  getChild: (childId: string) => request<MapChildData>(`/map/child/${childId}`),
  getFamily: (familyId: string) => request<MapFamilyResponse>(`/map/family/${familyId}`),
};
