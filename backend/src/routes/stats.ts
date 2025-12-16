import { Hono } from 'hono';
import prisma from '../lib/prisma.js';
import { calculateLevel, getGenreStats } from '../services/achievements.js';

export const statsRoutes = new Hono();

// ============================================================================
// GET /api/stats/child/:childId - Estatísticas de uma criança
// ============================================================================

statsRoutes.get('/child/:childId', async (c) => {
  const { childId } = c.req.param();

  // Obter criança
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      books: true,
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  });

  if (!child) {
    return c.json({ error: 'Criança não encontrada' }, 404);
  }

  const bookCount = child.books.length;
  const level = calculateLevel(bookCount);
  const genreStats = await getGenreStats(childId);

  // Estatísticas de leitura
  const now = new Date();
  const thisMonth = child.books.filter((b: any) => {
    if (!b.finishDate) return false;
    const d = new Date(b.finishDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const thisYear = child.books.filter((b: any) => {
    if (!b.finishDate) return false;
    const d = new Date(b.finishDate);
    return d.getFullYear() === now.getFullYear();
  }).length;

  // Média de avaliação
  const ratedBooks = child.books.filter((b) => b.rating !== null);
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
      : null;

  // Género favorito
  const genreCounts: Record<string, number> = {};
  for (const book of child.books) {
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
  }
  const favoriteGenre =
    Object.entries(genreCounts).length > 0
      ? Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  return c.json({
    child: {
      id: child.id,
      name: child.name,
      avatar: child.avatar,
    },
    level,
    books: {
      total: bookCount,
      thisMonth,
      thisYear,
      averageRating,
    },
    genres: {
      stats: genreStats,
      discovered: genreStats.filter((g) => g.discovered).length,
      total: genreStats.length,
      favorite: favoriteGenre,
    },
    achievements: {
      earned: child.achievements.length,
      total: await prisma.achievement.count(),
      recent: child.achievements
        .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
        .slice(0, 3)
        .map((a) => ({
          ...a.achievement,
          earnedAt: a.earnedAt,
        })),
    },
  });
});

// ============================================================================
// GET /api/stats/family/:familyId - Estatísticas de uma família
// ============================================================================

statsRoutes.get('/family/:familyId', async (c) => {
  const { familyId } = c.req.param();

  // Obter família com filhos e livros
  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      children: {
        include: {
          books: true,
          achievements: true,
        },
      },
    },
  });

  if (!family) {
    return c.json({ error: 'Família não encontrada' }, 404);
  }

  const allBooks = family.children.flatMap((c) => c.books);
  const totalBooks = allBooks.length;

  // Livros por mês (últimos 6 meses)
  const monthlyStats: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthBooks = allBooks.filter((b: any) => {
      if (!b.finishDate) return false;
      const d = new Date(b.finishDate);
      return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    });
    monthlyStats.push({
      month: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
      count: monthBooks.length,
    });
  }

  // Géneros agregados
  const genreCounts: Record<string, number> = {};
  for (const book of allBooks) {
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
  }

  // Estatísticas por criança
  const childStats = family.children.map((child) => ({
    id: child.id,
    name: child.name,
    avatar: child.avatar,
    bookCount: child.books.length,
    achievementCount: child.achievements.length,
    level: calculateLevel(child.books.length),
  }));

  return c.json({
    family: {
      id: family.id,
      name: family.name,
    },
    totals: {
      children: family.children.length,
      books: totalBooks,
      achievements: family.children.reduce((sum, c) => sum + c.achievements.length, 0),
      genresDiscovered: Object.keys(genreCounts).length,
    },
    monthlyStats,
    genreStats: Object.entries(genreCounts).map(([genre, count]) => ({
      genre,
      count,
    })),
    childStats,
  });
});

// ============================================================================
// GET /api/stats/leaderboard/:familyId - Leaderboard familiar
// ============================================================================

statsRoutes.get('/leaderboard/:familyId', async (c) => {
  const { familyId } = c.req.param();
  const { period } = c.req.query(); // 'week', 'month', 'year', 'all'

  const children = await prisma.child.findMany({
    where: { familyId },
    include: {
      books: true,
    },
  });

  let filterDate: Date | null = null;
  if (period === 'week') {
    filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - 7);
  } else if (period === 'month') {
    filterDate = new Date();
    filterDate.setMonth(filterDate.getMonth() - 1);
  } else if (period === 'year') {
    filterDate = new Date();
    filterDate.setFullYear(filterDate.getFullYear() - 1);
  }

  const leaderboard = children
    .map((child) => {
      const filteredBooks = filterDate
        ? child.books.filter((b: any) => b.finishDate && new Date(b.finishDate) >= filterDate!)
        : child.books;

      return {
        id: child.id,
        name: child.name,
        avatar: child.avatar,
        bookCount: filteredBooks.length,
        level: calculateLevel(child.books.length), // Nível sempre total
      };
    })
    .sort((a, b) => b.bookCount - a.bookCount);

  return c.json({
    period: period || 'all',
    leaderboard,
  });
});
