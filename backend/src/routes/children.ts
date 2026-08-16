import { Hono } from 'hono';
import { z } from 'zod';
import { BookStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { getCurrentLevel, getNextLevel, getLevelProgress, getBooksToNextLevel } from '../lib/levels-config.js';
import { verifyFamilyParam, verifyChildOwnership } from '../middleware/authorization.js';
import { serializeChildBooks } from '../lib/serializers.js';

export const childRoutes = new Hono();

// Schemas de validação
const createChildSchema = z.object({
  familyId: z.string().cuid(),
  name: z.string().min(1).max(50),
  avatar: z.string().max(10).default('🧒'),
  birthYear: z.number().int().optional(),
  levelCategory: z.enum(['MAGIC', 'EXPLORERS', 'KNIGHTS', 'SPACE']).default('EXPLORERS'),
});

const updateChildSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().max(10).optional(),
  birthYear: z.number().int().optional().nullable(),
  levelCategory: z.enum(['MAGIC', 'EXPLORERS', 'KNIGHTS', 'SPACE']).optional(),
  dailyGoal: z.number().int().min(15).max(120).optional(),
});

// ============================================================================
// GET /api/children/:id - Obter criança por ID
// ============================================================================

childRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();

  // Authorization check: verify child belongs to authenticated family
  if (!await verifyChildOwnership(c, id)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      childBooks: {
        orderBy: { updatedAt: 'desc' },
        include: { book: true },
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
      _count: {
        select: { childBooks: true },
      },
    },
  });

  if (!child) {
    return c.json({ error: 'Criança não encontrada' }, 404);
  }

  // Serialize per-child book status (metadata stays nested under .book)
  const serializedChild = {
    ...child,
    childBooks: serializeChildBooks(child.childBooks)
  };

  return c.json(serializedChild);
});

// ============================================================================
// GET /api/children/family/:familyId - Obter exploradores de uma família
// ============================================================================

childRoutes.get('/family/:familyId', async (c) => {
  const { familyId } = c.req.param();

  // Authorization check: verify family belongs to authenticated user
  if (!verifyFamilyParam(c, familyId)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const children = await prisma.child.findMany({
    where: { familyId },
    include: {
      _count: {
        select: { childBooks: true },
      },
      childBooks: {
        where: {
          OR: [
            { status: BookStatus.TO_READ },
            { status: BookStatus.READING },
            { status: BookStatus.FINISHED }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        include: { book: true }
      },
      readingSessions: {
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

  // Serialize per-child book status for all children (metadata under .book)
  const serializedChildren = children.map(child => ({
    ...child,
    childBooks: serializeChildBooks(child.childBooks)
  }));

  // Transform data for dashboard
  const enrichedChildren = (serializedChildren as any[]).map(child => {
    // 1. Calculate Level using levels-config

    const levelCategory = child.levelCategory || 'EXPLORERS'; // Default to EXPLORERS
    const finishedBooksCount = child.childBooks.filter((b: any) => b.status === 'finished').length;

    const currentLevel = getCurrentLevel(finishedBooksCount, levelCategory);
    const nextLevel = getNextLevel(finishedBooksCount, levelCategory);
    const progress = getLevelProgress(finishedBooksCount, levelCategory);
    const booksToNext = getBooksToNextLevel(finishedBooksCount, levelCategory);


    // 2. Calculate Streak & Today's Reading
    // Sum all minutes from today's sessions
    const todaySessions = child.readingSessions.filter((s: any) => {
      const d = new Date(s.date);
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    const todayMinutes = todaySessions.reduce((sum: number, s: any) => sum + (s.minutes || 0), 0);

    // Calculate streak: count consecutive days with reading
    // Get unique dates from sessions
    const uniqueDates = Array.from(
      new Set(
        child.readingSessions.map((s: any) => {
          const d = new Date(s.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      )
    ).sort().reverse(); // Most recent first

    // Count consecutive days from today backwards
    let streak = 0;
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    if (uniqueDates.includes(todayKey)) {
      streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - i);
        const expectedKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;

        if (uniqueDates.includes(expectedKey)) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
    }

    // 3. Weekly Activity
    const weekSessions = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // Last 6 days + today

      // Get ALL sessions for this day and sum the minutes
      const daySessions = child.readingSessions.filter((s: any) => {
        const sd = new Date(s.date);
        return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
      });

      const dayMinutes = daySessions.reduce((sum: number, s: any) => sum + (s.minutes || 0), 0);

      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return {
        day: dayNames[d.getDay()],
        status: dayMinutes > 0 ? (dayMinutes >= child.dailyGoal || 0 ? 'success' : 'neutral') : 'fail',
        label: dayMinutes > 0 ? `${dayMinutes}m` : '✗'
      };
    });

    // 4. Current Books — "a ler" e "quero ler" (para permitir registar leitura)
    const currentBooks = child.childBooks.filter((b: any) => b.status === 'reading' || b.status === 'to-read').map((b: any) => ({
      id: b.id,
      status: b.status,
      title: b.book.title,
      author: b.book.author,
      genre: b.book.genre,
      progress: b.book.totalPages && b.currentPage ? Math.round((b.currentPage / b.book.totalPages) * 100) : undefined,
      totalPages: b.book.totalPages,
      currentPage: b.currentPage,
      startDate: b.startDate,
      daysReading: b.startDate ? Math.ceil((new Date().getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24)) : 0,
      type: b.book.totalPages && b.currentPage ? 'page-progress' : b.currentPage ? 'page-only' : 'time-only'
    }));

    // 5. Last Finished
    const lastFinishedBook = child.childBooks.find((b: any) => b.status === 'finished');

    return {
      ...child,
      level: {
        name: currentLevel.name,
        color: currentLevel.color,
        icon: currentLevel.icon,
        nextLevel: nextLevel ? nextLevel.name : 'Nível Máximo',
        booksToNextLevel: booksToNext,
        progress: progress
      },
      booksCount: finishedBooksCount,
      streak, // Simplified
      todayReading: {
        minutes: todayMinutes,
        goal: child.dailyGoal
      },
      weeklyActivity: weekSessions, // Mapped to expected format
      currentBooks,
      lastFinishedBook: lastFinishedBook ? {
        title: lastFinishedBook.book.title,
        author: lastFinishedBook.book.author,
        genre: lastFinishedBook.book.genre,
        rating: lastFinishedBook.rating || 0,
        finishedAt: lastFinishedBook.finishDate || lastFinishedBook.updatedAt
      } : null
    };
  });

  return c.json(enrichedChildren);
});

// ============================================================================
// GET /api/children/family/:familyId/list - Lightweight list (no books/sessions)
// ============================================================================

childRoutes.get('/family/:familyId/list', async (c) => {
  const { familyId } = c.req.param();

  if (!verifyFamilyParam(c, familyId)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

  const children = await prisma.child.findMany({
    where: { familyId },
    select: {
      id: true,
      name: true,
      avatar: true,
      birthYear: true,
      levelCategory: true,
      dailyGoal: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return c.json(children);
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

  const { familyId, name, avatar, birthYear, levelCategory } = validation.data;

  // Authorization check: verify familyId matches authenticated user
  if (!verifyFamilyParam(c, familyId)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

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
      levelCategory,
    },
    include: {
      _count: {
        select: { childBooks: true },
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

  // Authorization check: verify child belongs to authenticated family
  if (!await verifyChildOwnership(c, id)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

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
        select: { childBooks: true },
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

  // Authorization check: verify child belongs to authenticated family
  if (!await verifyChildOwnership(c, id)) {
    return c.json({ error: 'Forbidden - Access denied' }, 403);
  }

  await prisma.child.delete({
    where: { id },
  });

  return c.json({ success: true });
});
