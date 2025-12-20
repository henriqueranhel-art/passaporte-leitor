import { Hono } from 'hono';
import { z } from 'zod';
import { Genre, BookStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { checkAndAwardAchievements } from '../services/achievements.js';

export const bookRoutes = new Hono();

// Schemas de validação
const genreEnum = z.enum([
  'ADVENTURE',
  'FANTASY',
  'MYSTERY',
  'SCIENCE',
  'COMICS',
  'ROMANCE',
  'HORROR',
  'BIOGRAPHY',
  'POETRY',
  'HISTORY',
  'ANIMALS',
  'HUMOR',
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
});

// ============================================================================
// GET /api/books/family/:familyId - List all books for a family
// ============================================================================

bookRoutes.get('/family/:familyId', async (c) => {
  const { familyId } = c.req.param();

  // Query parameters for filtering
  const status = c.req.query('status'); // 'reading', 'to-read', 'finished', or undefined for all
  const genre = c.req.query('genre'); // Genre enum value or undefined for all
  const childId = c.req.query('childId'); // Specific child or undefined for all children
  const search = c.req.query('search'); // Search by title or author
  const sortBy = c.req.query('sortBy') || 'recent'; // 'recent', 'title', 'rating', 'progress'

  // Build where clause
  const where: any = {
    child: {
      familyId: familyId // Ensure we only get books for this family
    }
  };

  // Filter by status
  if (status && ['reading', 'to-read', 'finished'].includes(status)) {
    // Map lowercase string to enum value
    const statusMap: Record<string, BookStatus> = {
      'to-read': BookStatus.TO_READ,
      'reading': BookStatus.READING,
      'finished': BookStatus.FINISHED
    };
    where.status = statusMap[status];
  }

  // Filter by genre
  if (genre) {
    where.genre = genre;
  }

  // Filter by child
  if (childId) {
    where.childId = childId;
  }

  // Filter by search (title or author)
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Build orderBy clause
  let orderBy: any = {};
  switch (sortBy) {
    case 'title':
      orderBy = { title: 'asc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'progress':
      // Can't directly sort by progress (calculated field), will sort client-side
      orderBy = { currentPage: 'desc' };
      break;
    case 'recent':
    default:
      orderBy = { updatedAt: 'desc' };
      break;
  }

  const books = await prisma.book.findMany({
    where,
    orderBy,
    include: {
      child: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // Convert BookStatus enum to lowercase mapped values for API response
  const serializedBooks = books.map(book => ({
    ...book,
    status: book.status.toLowerCase().replace(/_/g, '-') as 'to-read' | 'reading' | 'finished'
  }));

  return c.json(serializedBooks);
});

// ============================================================================
// GET /api/books/child/:childId - Get books for a specific child
// ============================================================================

bookRoutes.get('/child/:childId', async (c) => {
  const { childId } = c.req.param();

  // Query parameters for filtering
  const genre = c.req.query('genre');
  const limit = c.req.query('limit');
  const offset = c.req.query('offset');

  // Build where clause
  const where: any = {
    childId: childId
  };

  // Filter by genre if provided
  if (genre) {
    where.genre = genre;
  }

  // Build query options
  const queryOptions: any = {
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  };

  // Add pagination if provided
  if (limit) {
    queryOptions.take = parseInt(limit);
  }
  if (offset) {
    queryOptions.skip = parseInt(offset);
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany(queryOptions),
    prisma.book.count({ where })
  ]);

  // Convert BookStatus enum to lowercase mapped values for API response
  const serializedBooks = books.map(book => ({
    ...book,
    status: book.status.toLowerCase().replace(/_/g, '-') as 'to-read' | 'reading' | 'finished'
  }));

  return c.json({ books: serializedBooks, total });
});

// ... POST endpoints follow ...

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

  // Map lowercase status to enum
  const statusMap: Record<string, BookStatus> = {
    'to-read': BookStatus.TO_READ,
    'reading': BookStatus.READING,
    'finished': BookStatus.FINISHED
  };

  const bookData: any = {
    childId: data.childId,
    title: data.title,
    author: data.author || "Desconhecido",
    isbn: data.isbn,
    genre: data.genre as Genre,
    totalPages: data.totalPages,
    status: statusMap[data.status] || BookStatus.TO_READ,
    currentPage: data.currentPage,
    rating: data.rating,
    notes: data.notes,
    favoriteCharacter: data.favoriteCharacter,
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

  // Map lowercase status to enum if status is provided
  const data: any = { ...validation.data };
  if (data.status) {
    const statusMap: Record<string, BookStatus> = {
      'to-read': BookStatus.TO_READ,
      'reading': BookStatus.READING,
      'finished': BookStatus.FINISHED
    };
    data.status = statusMap[data.status];
  }

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
