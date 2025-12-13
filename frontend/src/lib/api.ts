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
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

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
  get: (id: string) => request<Book>(`/books/${id}`),
  
  getByChild: (childId: string, params?: { genre?: Genre; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return request<{ books: Book[]; total: number }>(`/books/child/${childId}${query ? `?${query}` : ''}`);
  },
  
  getByFamily: (familyId: string, params?: { genre?: Genre; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.genre) searchParams.set('genre', params.genre);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return request<{ books: Book[]; total: number }>(`/books/family/${familyId}${query ? `?${query}` : ''}`);
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

export { ApiError };
