import type {
  Family,
  Child,
  Book,
  Achievement,
  ChildStats,
  FamilyStats,
  CreateFamilyInput,
  CreateChildInput,
  CreateBookInput,
  Genre,
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

  register: (data: any) =>
    request<{ token: string; family: Family; firstChild: Child }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; family: Family }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ============================================================================
// FAMILY API
// ============================================================================

export const familyApi = {
  get: (id: string) => request<Family>(`/family/${id}`),

  getFull: (id: string) => request<Family>(`/family/${id}/full`),

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

export const childrenApi = {
  get: (id: string) => request<Child>(`/children/${id}`),

  getByFamily: (familyId: string) => request<Child[]>(`/children/family/${familyId}`),

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

export const booksApi = {
  getByFamily: (
    familyId: string,
    filters?: {
      status?: 'reading' | 'to-read' | 'finished';
      genre?: string;
      childId?: string;
      search?: string;
      sortBy?: 'recent' | 'title' | 'rating' | 'progress';
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.childId) params.append('childId', filters.childId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    return request<Book[]>(`/books/family/${familyId}${queryString ? `?${queryString}` : ''}`);
  },

  get: (id: string) => request<Book>(`/books/${id}`),

  getByChild: (childId: string, params?: { genre?: Genre; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return request<{ books: Book[]; total: number }>(`/books/child/${childId}${query ? `?${query}` : ''}`);
  },

  create: (data: CreateBookInput) =>
    request<{ book: Book; newAchievements: Achievement[] }>('/books', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Omit<CreateBookInput, 'childId'>>) =>
    request<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/books/${id}`, {
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
    childId: string;
    bookId: string;
    minutes: number;
    pageEnd?: number;
    mood?: number;
    finishedBook?: boolean;
    date?: string;
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
