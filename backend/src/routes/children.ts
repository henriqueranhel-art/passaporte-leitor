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

  const children = await prisma.child.findMany({
    where: { familyId },
    include: {
      _count: {
        select: { books: true },
      },
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
