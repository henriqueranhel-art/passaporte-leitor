import { Hono } from 'hono';
import prisma from '../lib/prisma.js';
import { getCurrentLevel } from '../lib/levels-config.js';

export const mapRoutes = new Hono();

// ============================================================================
// HELPER: Calculate Streak
// ============================================================================

async function calculateStreak(childId: string): Promise<number> {
    const sessions = await prisma.readingSession.findMany({
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
// GET /api/map/child/:childId - Map data for a child
// ============================================================================

mapRoutes.get('/child/:childId', async (c) => {
    const { childId } = c.req.param();

    // Get child with books and sessions
    const child = await prisma.child.findUnique({
        where: { id: childId },
        include: {
            books: {
                where: { status: 'finished' },
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
        return c.json({ error: 'Child not found' }, 404);
    }

    // Calculate rank
    const finishedBooksCount = child.books.length;
    const levelCategory = child.levelCategory || 'EXPLORERS';
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

    // Calculate streak
    const streak = await calculateStreak(childId);

    // Calculate total hours
    const totalMinutes = child.readingSessions.reduce(
        (sum: number, s: any) => sum + (s.minutes || 0),
        0
    );
    const totalHours = Math.round(totalMinutes / 60);

    return c.json({
        child: {
            id: child.id,
            name: child.name,
            avatar: child.avatar,
        },
        rank,
        todayMinutes,
        dailyGoal: 15, // Hardcoded for now
        totalReadingDays,
        streak,
        totalHours,
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
                        where: { status: 'finished' },
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

            return {
                id: child.id,
                name: child.name,
                avatar: child.avatar,
                rank,
                todayMinutes,
                dailyGoal: 15,
                totalReadingDays,
                streak,
                totalHours,
            };
        })
    );

    // Aggregate stats
    const aggregated = {
        rank: Math.round(
            childrenStats.reduce((sum, c) => sum + c.rank, 0) / childrenStats.length
        ),
        todayMinutes: childrenStats.reduce((sum, c) => sum + c.todayMinutes, 0),
        dailyGoal: childrenStats.reduce((sum, c) => sum + c.dailyGoal, 0),
        totalReadingDays: childrenStats.reduce((sum, c) => sum + c.totalReadingDays, 0),
        streak: Math.max(...childrenStats.map((c) => c.streak)),
        totalHours: childrenStats.reduce((sum, c) => sum + c.totalHours, 0),
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
