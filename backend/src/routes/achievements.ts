import { Hono } from 'hono';
import prisma from '../lib/prisma.js';
import { checkAndAwardAchievements } from '../services/achievements.js';

export const achievementRoutes = new Hono();

// ============================================================================
// GET /api/achievements - Listar todas as conquistas
// ============================================================================

achievementRoutes.get('/', async (c) => {
  const achievements = await prisma.achievement.findMany({
    orderBy: [
      { category: 'asc' },
      { code: 'asc' },
    ],
  });

  return c.json(achievements);
});

// ============================================================================
// GET /api/achievements/child/:childId - Conquistas de uma criança
// ============================================================================

achievementRoutes.get('/child/:childId', async (c) => {
  const { childId } = c.req.param();

  // Obter todas as conquistas
  const allAchievements = await prisma.achievement.findMany({
    orderBy: { code: 'asc' },
  });

  // Obter conquistas da criança
  const earnedAchievements = await prisma.childAchievement.findMany({
    where: { childId },
    include: {
      achievement: true,
    },
  });

  const earnedIds = new Set(earnedAchievements.map((ea) => ea.achievementId));
  const earnedMap = new Map(
    earnedAchievements.map((ea) => [ea.achievementId, ea.earnedAt])
  );

  // Combinar dados
  const achievements = allAchievements.map((achievement) => ({
    ...achievement,
    earned: earnedIds.has(achievement.id),
    earnedAt: earnedMap.get(achievement.id) || null,
  }));

  return c.json({
    achievements,
    totalEarned: earnedIds.size,
    totalAvailable: allAchievements.length,
  });
});

// ============================================================================
// POST /api/achievements/check/:childId - Verificar novas conquistas
// ============================================================================

achievementRoutes.post('/check/:childId', async (c) => {
  const { childId } = c.req.param();

  const newAchievements = await checkAndAwardAchievements(childId);

  return c.json({
    newAchievements,
    count: newAchievements.length,
  });
});
