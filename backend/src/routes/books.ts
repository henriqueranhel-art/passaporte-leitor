import { Hono } from 'hono';
import { z } from 'zod';
import { Genre } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { checkAndAwardAchievements } from '../services/achievements.js';

export const bookRoutes = new Hono();

// Schemas de validação
const genreEnum = z.enum([
  'FANTASIA',
  'AVENTURA',
  'ESPACO',
  'NATUREZA',
  'MISTERIO',
  'OCEANO',
  'CIENCIA',
  'HISTORIA',
]);

const createBookSchema = z.object({
  childId: z.string().cuid(),
  title: z.string().min(1).max(200),
  author: z.string().max(100).optional(),
  isbn: z.string().max(20).optional(),
  genre: genreEnum,
  totalPages: z.number().int().positive().optional(),
  status: z.enum(['to-read', 'reading', 'finished']).default('to-read'),
  currentPage: z.number().int().nonnegative().optional(),
  startDate: z.string().datetime().optional(),
  finishDate: z.string().datetime().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
  favoriteCharacter: z.string().max(100).optional(),
  recommended: z.boolean().optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(100).optional(),
  genre: genreEnum.optional(),
  totalPages: z.number().int().positive().optional(),
  status: z.enum(['to-read', 'reading', 'finished']).optional(),
  currentPage: z.number().int().nonnegative().optional(),
  startDate: z.string().datetime().optional(),
  finishDate: z.string().datetime().optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  favoriteCharacter: z.string().max(100).optional().nullable(),
  recommended: z.boolean().optional(),
});

// ... GET endpoints remain same ...

// ============================================================================
// POST /api/books - Adicionar novo livro
// ============================================================================

bookRoutes.post('/', async (c) => {
  const body = await c.req.json();

  const validation = createBookSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
  }

  const data = validation.data;

  // Verificar se a criança existe
  const child = await prisma.child.findUnique({ where: { id: data.childId } });
  if (!child) {
    return c.json({ error: 'Criança não encontrada' }, 404);
  }

  const bookData: any = {
    childId: data.childId,
    title: data.title,
    author: data.author || "Desconhecido",
    isbn: data.isbn,
    genre: data.genre as Genre,
    totalPages: data.totalPages,
    status: data.status,
    currentPage: data.currentPage,
    rating: data.rating,
    notes: data.notes,
    favoriteCharacter: data.favoriteCharacter,
    recommended: data.recommended,
  };

  if (data.startDate) bookData.startDate = new Date(data.startDate);
  if (data.finishDate) bookData.finishDate = new Date(data.finishDate);

  const book = await prisma.book.create({
    data: bookData,
  });

  // Verificar e atribuir conquistas (apenas se terminado)
  let newAchievements: any[] = [];
  if (data.status === 'finished') {
    newAchievements = await checkAndAwardAchievements(data.childId);
  }

  return c.json({ book, newAchievements }, 201);
});

// ============================================================================
// PUT /api/books/:id - Atualizar livro
// ============================================================================

bookRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const validation = updateBookSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
  }

  const data: any = { ...validation.data };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.finishDate) data.finishDate = new Date(data.finishDate);

  const book = await prisma.book.update({
    where: { id },
    data,
  });

  return c.json(book);
});

// ============================================================================
// DELETE /api/books/:id - Eliminar livro
// ============================================================================

bookRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();

  await prisma.book.delete({
    where: { id },
  });

  return c.json({ success: true });
});
