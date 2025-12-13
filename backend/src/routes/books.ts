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
  author: z.string().min(1).max(100),
  isbn: z.string().max(20).optional(),
  genre: genreEnum,
  rating: z.number().int().min(1).max(3).optional(),
  notes: z.string().max(500).optional(),
  dateRead: z.string().datetime().optional(),
});

const updateBookSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  author: z.string().min(1).max(100).optional(),
  genre: genreEnum.optional(),
  rating: z.number().int().min(1).max(3).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  dateRead: z.string().datetime().optional(),
});

// ============================================================================
// GET /api/books/:id - Obter livro por ID
// ============================================================================

bookRoutes.get('/:id', async (c) => {
  const { id } = c.req.param();

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      child: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  if (!book) {
    return c.json({ error: 'Livro não encontrado' }, 404);
  }

  return c.json(book);
});

// ============================================================================
// GET /api/books/child/:childId - Obter livros de uma criança
// ============================================================================

bookRoutes.get('/child/:childId', async (c) => {
  const { childId } = c.req.param();
  const { genre, limit, offset } = c.req.query();

  const where: any = { childId };
  if (genre) {
    where.genre = genre as Genre;
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { dateRead: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    }),
    prisma.book.count({ where }),
  ]);

  return c.json({ books, total });
});

// ============================================================================
// GET /api/books/family/:familyId - Obter livros de uma família
// ============================================================================

bookRoutes.get('/family/:familyId', async (c) => {
  const { familyId } = c.req.param();
  const { genre, limit, offset } = c.req.query();

  // Primeiro obter os IDs das crianças da família
  const children = await prisma.child.findMany({
    where: { familyId },
    select: { id: true },
  });

  const childIds = children.map((c) => c.id);

  const where: any = { childId: { in: childIds } };
  if (genre) {
    where.genre = genre as Genre;
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        child: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { dateRead: 'desc' },
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
    }),
    prisma.book.count({ where }),
  ]);

  return c.json({ books, total });
});

// ============================================================================
// POST /api/books - Adicionar novo livro
// ============================================================================

bookRoutes.post('/', async (c) => {
  const body = await c.req.json();
  
  const validation = createBookSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
  }

  const { childId, title, author, isbn, genre, rating, notes, dateRead } = validation.data;

  // Verificar se a criança existe
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) {
    return c.json({ error: 'Criança não encontrada' }, 404);
  }

  const book = await prisma.book.create({
    data: {
      childId,
      title,
      author,
      isbn,
      genre: genre as Genre,
      rating,
      notes,
      dateRead: dateRead ? new Date(dateRead) : new Date(),
    },
  });

  // Verificar e atribuir conquistas
  const newAchievements = await checkAndAwardAchievements(childId);

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
  if (data.dateRead) {
    data.dateRead = new Date(data.dateRead);
  }

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
