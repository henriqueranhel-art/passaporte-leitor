import { Hono } from 'hono';
import { BookStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { getCurrentLevel, getNextLevel, LEVEL_CATEGORIES } from '../lib/levels-config.js';
import { getAuthFamilyId } from '../middleware/auth.js';

export const mapRoutes = new Hono();

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_DAILY_GOAL_MINUTES = 15;

// ============================================================================
// HELPER: Calculate Streak
// ============================================================================

async function calculateStreak(childId: string, existingSessions?: any[]): Promise<number> {
    // Use existing sessions if provided (optimization for batch operations)
    const sessions = existingSessions || await prisma.readingSession.findMany({
        where: { childId },
        select: { date: true },
        orderBy: { date: 'desc' },
    });

    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);

    // Get unique dates first
    const uniqueDates = new Set<string>();
    sessions.forEach(s => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        uniqueDates.add(d.toISOString().split('T')[0]);
    });

    const sortedDates = Array.from(uniqueDates).sort().reverse();

    // Count consecutive days from today
    for (const dateStr of sortedDates) {
        const sessionDate = new Date(dateStr);
        if (sessionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (sessionDate.getTime() < currentDate.getTime()) {
            break;
        }
    }

    return streak;
}

// ============================================================================
// HELPER: Calculate Child Stats
// ============================================================================

interface ChildStatsInput {
    books: any[];
    readingSessions: any[];
    id: string;
    levelCategory: string;
}

interface ChildStatsOutput {
    rank: number;
    todayMinutes: number;
    totalReadingDays: number;
    streak: number;
    totalHours: number;
    levelCategory: string;
    currentLevel: {
        rank: number;
        name: string;
        minBooks: number;
        icon: string;
        color: string;
    };
    nextLevel: {
        rank: number;
        name: string;
        minBooks: number;
        icon: string;
        color: string;
    } | null;
}

async function calculateChildStats(child: ChildStatsInput): Promise<ChildStatsOutput> {
    const finishedBooksCount = child.books.length;
    const levelCategory = (child.levelCategory || 'EXPLORERS') as any;
    const currentLevel = getCurrentLevel(finishedBooksCount, levelCategory);
    const rank = currentLevel.rank;

    // Calculate today's minutes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMinutes = child.readingSessions
        .filter((s: any) => {
            const sessionDate = new Date(s.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
        })
        .reduce((sum: number, s: any) => sum + (s.minutes || 0), 0);

    // Calculate total reading days (unique dates)
    const uniqueDates = new Set(
        child.readingSessions.map((s: any) => {
            const d = new Date(s.date);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );
    const totalReadingDays = uniqueDates.size;

    // Calculate streak using already-loaded sessions (optimization)
    const streak = await calculateStreak(child.id, child.readingSessions);

    // Calculate total hours
    const totalMinutes = child.readingSessions.reduce(
        (sum: number, s: any) => sum + (s.minutes || 0),
        0
    );
    const totalHours = Math.round(totalMinutes / 60);

    const nextLevel = getNextLevel(finishedBooksCount, levelCategory);

    return {
        rank,
        todayMinutes,
        totalReadingDays,
        streak,
        totalHours,
        levelCategory,
        currentLevel: {
            rank: currentLevel.rank,
            name: currentLevel.name,
            minBooks: currentLevel.minBooks,
            icon: currentLevel.icon,
            color: currentLevel.color,
        },
        nextLevel: nextLevel ? {
            rank: nextLevel.rank,
            name: nextLevel.name,
            minBooks: nextLevel.minBooks,
            icon: nextLevel.icon,
            color: nextLevel.color,
        } : null,
    };
}

// ============================================================================
// GET /api/map/child/:childId - Map data for a child
// ============================================================================

mapRoutes.get('/child/:childId', async (c) => {
    const { childId } = c.req.param();

    // SECURITY: Get authenticated family ID from JWT token
    const familyId = getAuthFamilyId(c);

    // SECURITY: Query child with familyId to ensure it belongs to authenticated family
    const child = await prisma.child.findFirst({
        where: {
            id: childId,
            familyId: familyId, // Critical: Ensure child belongs to this family
        },
        include: {
            books: {
                where: { status: BookStatus.FINISHED },
            },
            readingSessions: {
                select: {
                    date: true,
                    minutes: true,
                },
            },
        },
    });

    if (!child) {
        return c.json({ error: 'Child not found or access denied' }, 404);
    }

    // Calculate stats using helper function
    const stats = await calculateChildStats({
        books: child.books,
        readingSessions: child.readingSessions,
        id: child.id,
        levelCategory: child.levelCategory,
    });

    return c.json({
        child: {
            id: child.id,
            name: child.name,
            avatar: child.avatar,
        },
        rank: stats.rank,
        todayMinutes: stats.todayMinutes,
        dailyGoal: DEFAULT_DAILY_GOAL_MINUTES,
        totalReadingDays: stats.totalReadingDays,
        streak: stats.streak,
        totalHours: stats.totalHours,
        levelCategory: stats.levelCategory,
        currentLevel: stats.currentLevel,
        nextLevel: stats.nextLevel,
    });
});

// ============================================================================
// GET /api/map/family/:familyId - Aggregated map data for family
// ============================================================================

mapRoutes.get('/family/:familyId', async (c) => {
    const { familyId } = c.req.param();

    // Get family with children
    const family = await prisma.family.findUnique({
        where: { id: familyId },
        include: {
            children: {
                include: {
                    books: {
                        where: { status: BookStatus.FINISHED },
                    },
                    readingSessions: {
                        select: {
                            date: true,
                            minutes: true,
                        },
                    },
                },
            },
        },
    });

    if (!family) {
        return c.json({ error: 'Family not found' }, 404);
    }

    // Calculate stats for each child
    const childrenStats = await Promise.all(
        family.children.map(async (child: any) => {
            const finishedBooksCount = child.books.length;
            const levelCategory = child.levelCategory || 'EXPLORERS';
            const currentLevel = getCurrentLevel(finishedBooksCount, levelCategory);
            const rank = currentLevel.rank;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayMinutes = child.readingSessions
                .filter((s: any) => {
                    const sessionDate = new Date(s.date);
                    sessionDate.setHours(0, 0, 0, 0);
                    return sessionDate.getTime() === today.getTime();
                })
                .reduce((sum: number, s: any) => sum + (s.minutes || 0), 0);

            const uniqueDates = new Set(
                child.readingSessions.map((s: any) => {
                    const d = new Date(s.date);
                    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                })
            );
            const totalReadingDays = uniqueDates.size;

            const streak = await calculateStreak(child.id);

            const totalMinutes = child.readingSessions.reduce(
                (sum: number, s: any) => sum + (s.minutes || 0),
                0
            );
            const totalHours = Math.round(totalMinutes / 60);
            const nextLevel = getNextLevel(finishedBooksCount, levelCategory);

            return {
                id: child.id,
                name: child.name,
                avatar: child.avatar,
                rank,
                todayMinutes,
                dailyGoal: DEFAULT_DAILY_GOAL_MINUTES,
                totalReadingDays,
                streak,
                totalHours,
                levelCategory,
                currentLevel: {
                    rank: currentLevel.rank,
                    name: currentLevel.name,
                    minBooks: currentLevel.minBooks,
                    icon: currentLevel.icon,
                    color: currentLevel.color,
                },
                nextLevel: nextLevel ? {
                    rank: nextLevel.rank,
                    name: nextLevel.name,
                    minBooks: nextLevel.minBooks,
                    icon: nextLevel.icon,
                    color: nextLevel.color,
                } : null,
            };
        })
    );

    // Aggregate stats
    // Find most common levelCategory for family view
    const categoryCount: Record<string, number> = {};
    childrenStats.forEach((c: any) => {
        categoryCount[c.levelCategory] = (categoryCount[c.levelCategory] || 0) + 1;
    });
    const familyLevelCategory = Object.entries(categoryCount).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any;

    const avgRank = Math.round(
        childrenStats.reduce((sum, c) => sum + c.rank, 0) / childrenStats.length
    );

    const aggregated = {
        rank: avgRank,
        todayMinutes: childrenStats.reduce((sum, c) => sum + c.todayMinutes, 0),
        dailyGoal: childrenStats.reduce((sum, c) => sum + c.dailyGoal, 0),
        totalReadingDays: childrenStats.reduce((sum, c) => sum + c.totalReadingDays, 0),
        streak: Math.max(...childrenStats.map((c) => c.streak)),
        totalHours: childrenStats.reduce((sum, c) => sum + c.totalHours, 0),
        levelCategory: familyLevelCategory,
    };

    return c.json({
        family: {
            id: family.id,
            name: family.name,
        },
        children: childrenStats,
        aggregated,
    });
});
