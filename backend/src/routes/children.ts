import { Hono } from 'hono';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

export const childRoutes = new Hono();

// Schemas de validação
const createChildSchema = z.object({
  familyId: z.string().cuid(),
  name: z.string().min(1).max(50),
  avatar: z.string().max(10).default('🧒'),
  birthYear: z.number().int().min(2000).max(2025).optional(),
});

const updateChildSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().max(10).optional(),
  birthYear: z.number().int().min(2000).max(2025).optional().nullable(),
});

// ============================================================================
// GET /api/children/:id - Obter criança por ID
// ============================================================================

childRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      books: {
        orderBy: { dateRead: 'desc' },
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
      _count: {
        select: { books: true },
      },
    },
  });

  if (!child) {
    return c.json({ error: 'Criança não encontrada' }, 404);
  }

  return c.json(child);
});

// ============================================================================
// GET /api/children/family/:familyId - Obter crianças de uma família
// ============================================================================

childRoutes.get('/family/:familyId', async (c) => {
  const { familyId } = c.req.param();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const children = await prisma.child.findMany({
    where: { familyId },
    include: {
      _count: {
        select: { books: true },
      },
      books: {
        where: {
          OR: [
            { status: 'reading' },
            { status: 'finished' }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      },
      readingLogs: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
          }
        },
        orderBy: { date: 'desc' }
      },
      achievements: true
    },
    orderBy: { createdAt: 'asc' },
  });

  // Transform data for dashboard
  const enrichedChildren = (children as any[]).map(child => {
    // 1. Calculate Level
    // Simple logic for now based on book count
    const bookCount = child._count.books;
    const levelName = bookCount < 5 ? 'Grumete' : bookCount < 10 ? 'Marinheiro' : 'Explorador';
    const levelIcon = bookCount < 5 ? '🐣' : bookCount < 10 ? '⚓' : '🧭';
    const levelColor = bookCount < 5 ? '#BDC3C7' : bookCount < 10 ? '#85C1E9' : '#82E0AA';
    const nextLevelBooks = bookCount < 5 ? 5 : bookCount < 10 ? 10 : 20;
    const prevLevelBooks = bookCount < 5 ? 0 : bookCount < 10 ? 5 : 10;
    const levelProgress = Math.min(100, Math.max(0, ((bookCount - prevLevelBooks) / (nextLevelBooks - prevLevelBooks)) * 100));

    // 2. Calculate Streak & Today's Reading
    const todayLog = child.readingLogs.find(l => {
      const d = new Date(l.date);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    // Simple streak calculation (mocked properly would need complex query)
    // For now we assume if they read today or yesterday, streak is kept.
    // In a real app we'd query distinct dates.
    const streak = child.readingLogs.length > 0 ? child.readingLogs.length : 0; // Simplified

    // 3. Weekly Activity
    const weekSessions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // Last 6 days + today
      const log = child.readingLogs.find(l => {
        const ld = new Date(l.date);
        return ld.getDate() === d.getDate() && ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      });

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        day: dayNames[d.getDay()],
        status: log ? (log.minutes >= 15 ? 'success' : 'neutral') : 'fail', // >=15 min is success, <15 neutral, 0 fail
        label: log ? (log.minutes > 0 ? `${log.minutes}m` : '✓') : '✗'
      };
    });

    // 4. Current Books
    const currentBooks = child.books.filter(b => b.status === 'reading').map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      progress: b.totalPages && b.currentPage ? Math.round((b.currentPage / b.totalPages) * 100) : undefined,
      totalPages: b.totalPages,
      currentPage: b.currentPage,
      startDate: b.startDate,
      daysReading: b.startDate ? Math.ceil((new Date().getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24)) : 0,
      type: b.totalPages && b.currentPage ? 'page-progress' : b.currentPage ? 'page-only' : 'time-only'
    }));

    // 5. Last Finished
    const lastFinishedBook = child.books.find(b => b.status === 'finished');

    return {
      ...child,
      level: {
        name: levelName,
        color: levelColor,
        icon: levelIcon,
        nextLevel: 'Próximo Nível', // Simplified
        booksToNextLevel: nextLevelBooks - bookCount,
        progress: levelProgress
      },
      booksCount: bookCount,
      streak, // Simplified
      todayReading: {
        minutes: todayLog ? todayLog.minutes : 0,
        goal: 15 // Hardcoded goal for now
      },
      weeklyActivity: weekSessions, // Mapped to expected format
      currentBooks,
      lastFinishedBook: lastFinishedBook ? {
        title: lastFinishedBook.title,
        author: lastFinishedBook.author,
        genre: lastFinishedBook.genre,
        rating: lastFinishedBook.rating || 0,
        finishedAt: lastFinishedBook.finishDate || lastFinishedBook.updatedAt
      } : null
    };
  });

  return c.json(enrichedChildren);
});

// ============================================================================
// POST /api/children - Criar nova criança
// ============================================================================

childRoutes.post('/', async (c) => {
  const body = await c.req.json();

  const validation = createChildSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
  }

  const { familyId, name, avatar, birthYear } = validation.data;

  // Verificar se a família existe
  const family = await prisma.family.findUnique({ where: { id: familyId } });
  if (!family) {
    return c.json({ error: 'Família não encontrada' }, 404);
  }

  const child = await prisma.child.create({
    data: {
      familyId,
      name,
      avatar,
      birthYear,
    },
    include: {
      _count: {
        select: { books: true },
      },
    },
  });

  return c.json(child, 201);
});

// ============================================================================
// PUT /api/children/:id - Atualizar criança
// ============================================================================

childRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const validation = updateChildSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
  }

  const child = await prisma.child.update({
    where: { id },
    data: validation.data,
    include: {
      _count: {
        select: { books: true },
      },
    },
  });

  return c.json(child);
});

// ============================================================================
// DELETE /api/children/:id - Eliminar criança
// ============================================================================

childRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();

  await prisma.child.delete({
    where: { id },
  });

  return c.json({ success: true });
});
