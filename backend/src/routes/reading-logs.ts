import { Hono } from 'hono';
import { z } from 'zod';
import { BookStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';

export const readingLogRoutes = new Hono();

const createSessionSchema = z.object({
    childId: z.string().cuid(),
    bookId: z.string().cuid(), // Required now
    minutes: z.number().int().min(1),
    pageEnd: z.number().int().optional(),
    mood: z.number().int().min(1).max(5).optional(),
    finishedBook: z.boolean().optional(),
    // Accept date in YYYY-MM-DD format and transform to ISO datetime for proper timestamp
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
        .transform(dateStr => `${dateStr}T00:00:00.000Z`)
        .optional(),
    // Review fields (only used when finishedBook is true)
    rating: z.number().int().min(1).max(5).optional(),
    favoriteCharacter: z.string().optional(),
    notes: z.string().optional(),
});

const updateSessionSchema = z.object({
    minutes: z.number().int().min(1).optional(),
    mood: z.number().int().min(1).max(5).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(dateStr => `${dateStr}T00:00:00.000Z`).optional(),
    pageEnd: z.number().int().optional(),
});

// ============================================================================
// POST - Create reading session
// ============================================================================

readingLogRoutes.post('/', async (c) => {
    const body = await c.req.json();

    const validation = createSessionSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const { childId, bookId, minutes, pageEnd, mood, finishedBook, date, rating, favoriteCharacter, notes } = validation.data;

    // Verify child exists
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
        return c.json({ error: 'Criança não encontrada' }, 404);
    }

    // Verify book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
        return c.json({ error: 'Livro não encontrado' }, 404);
    }

    const session = await prisma.readingSession.create({
        data: {
            childId,
            bookId,
            minutes,
            pageEnd,
            mood,
            finishedBook: finishedBook || false,
            date: date ? new Date(date) : new Date(),
        }
    });

    // If book was finished, update book status and review
    if (finishedBook && book.status !== BookStatus.FINISHED) {
        await prisma.book.update({
            where: { id: bookId },
            data: {
                status: BookStatus.FINISHED,
                finishDate: new Date(),
                currentPage: pageEnd || book.totalPages || undefined,
                rating: rating || undefined,
                favoriteCharacter: favoriteCharacter || undefined,
                notes: notes || undefined,
            }
        });
    } else if (pageEnd && book.status === BookStatus.READING) {
        // Update current page if book is being read
        await prisma.book.update({
            where: { id: bookId },
            data: { currentPage: pageEnd }
        });
    }

    return c.json(session, 201);
});

// ============================================================================
// GET - Reading sessions stats
// ============================================================================

readingLogRoutes.get('/stats/:familyId', async (c) => {
    const familyId = c.req.param('familyId');
    const childId = c.req.query('childId');
    const search = c.req.query('search');
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');

    // Build where clause
    const where: any = {
        child: { familyId }
    };

    if (childId) {
        where.childId = childId;
    }

    if (search) {
        where.book = {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } }
            ]
        };
    }

    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const sessions = await prisma.readingSession.findMany({
        where,
        select: { minutes: true }
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    return c.json({
        totalSessions,
        totalMinutes,
        avgMinutes
    });
});

// ============================================================================
// GET - Reading sessions list (with filters & pagination)
// ============================================================================

readingLogRoutes.get('/family/:familyId', async (c) => {
    const familyId = c.req.param('familyId');
    const childId = c.req.query('childId');
    const search = c.req.query('search');
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    // Build where clause
    const where: any = {
        child: { familyId }
    };

    if (childId) {
        where.childId = childId;
    }

    if (search) {
        where.book = {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } }
            ]
        };
    }

    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom) where.date.gte = new Date(dateFrom);
        if (dateTo) where.date.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    // Get total count
    const total = await prisma.readingSession.count({ where });

    // Get paginated sessions
    const sessions = await prisma.readingSession.findMany({
        where,
        include: {
            child: { select: { id: true, name: true, avatar: true } },
            book: { select: { id: true, title: true, author: true, genre: true } }
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit
    });

    // Transform to frontend format
    const transformedSessions = sessions.map(s => ({
        id: s.id,
        childId: s.child.id,
        childName: s.child.name,
        childAvatar: s.child.avatar,
        bookId: s.book.id,
        bookName: s.book.title,
        bookAuthor: s.book.author,
        bookCover: '📕',
        date: s.date.toISOString().split('T')[0],
        minutes: s.minutes,
        mood: s.mood,
        pagesRead: s.pageEnd || 0,
    }));

    const totalPages = Math.ceil(total / limit);

    return c.json({
        sessions: transformedSessions,
        total,
        page,
        totalPages
    });
});

// ============================================================================
// PUT - Update reading session
// ============================================================================

readingLogRoutes.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();

    const validation = updateSessionSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const { minutes, mood, date, pageEnd } = validation.data;

    // Check if session exists
    const existing = await prisma.readingSession.findUnique({ where: { id } });
    if (!existing) {
        return c.json({ error: 'Sessão não encontrada' }, 404);
    }

    const updated = await prisma.readingSession.update({
        where: { id },
        data: {
            ...(minutes !== undefined && { minutes }),
            ...(mood !== undefined && { mood }),
            ...(date && { date: new Date(date) }),
            ...(pageEnd !== undefined && { pageEnd })
        },
        include: {
            child: { select: { id: true, name: true, avatar: true } },
            book: { select: { id: true, title: true, author: true, genre: true } }
        }
    });

    // Transform to frontend format
    const transformed = {
        id: updated.id,
        childId: updated.child.id,
        childName: updated.child.name,
        childAvatar: updated.child.avatar,
        bookId: updated.book.id,
        bookName: updated.book.title,
        bookAuthor: updated.book.author,
        bookCover: '📕',
        date: updated.date.toISOString().split('T')[0],
        minutes: updated.minutes,
        mood: updated.mood,
        pagesRead: updated.pageEnd || 0,
    };

    return c.json(transformed);
});

// ============================================================================
// DELETE - Delete reading session
// ============================================================================

readingLogRoutes.delete('/:id', async (c) => {
    const id = c.req.param('id');

    // Check if session exists
    const existing = await prisma.readingSession.findUnique({ where: { id } });
    if (!existing) {
        return c.json({ error: 'Sessão não encontrada' }, 404);
    }

    await prisma.readingSession.delete({ where: { id } });

    return c.json({ success: true });
});
