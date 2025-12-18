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
    date: z.string().datetime().optional()
});

readingLogRoutes.post('/', async (c) => {
    const body = await c.req.json();

    const validation = createSessionSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const { childId, bookId, minutes, pageEnd, mood, finishedBook, date } = validation.data;

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

    // If book was finished, update book status
    if (finishedBook && book.status !== BookStatus.FINISHED) {
        await prisma.book.update({
            where: { id: bookId },
            data: {
                status: BookStatus.FINISHED,
                finishDate: new Date(),
                currentPage: pageEnd || book.totalPages || undefined
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
