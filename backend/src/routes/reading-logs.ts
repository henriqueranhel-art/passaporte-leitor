import { Hono } from 'hono';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

export const readingLogRoutes = new Hono();

const createLogSchema = z.object({
    childId: z.string().cuid(),
    bookId: z.string().cuid().optional(),
    minutes: z.number().int().min(1),
    pages: z.number().int().optional(),
    date: z.string().datetime().optional()
});

readingLogRoutes.post('/', async (c) => {
    const body = await c.req.json();

    const validation = createLogSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const { childId, bookId, minutes, pages, date } = validation.data;

    // Verify child exists
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
        return c.json({ error: 'Criança não encontrada' }, 404);
    }

    const log = await (prisma as any).readingLog.create({
        data: {
            childId,
            bookId,
            minutes,
            pages: pages || 0,
            date: date ? new Date(date) : new Date(),
        }
    });

    // If bookId is provided, might want to update book progress too?
    // Use existing book update route logic or duplicate minimal needed here.
    // For now just logging.

    return c.json(log, 201);
});
