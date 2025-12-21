import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import { familyRoutes } from './routes/family.js';
import { childRoutes } from './routes/children.js';
import { bookRoutes } from './routes/books.js';
import { achievementRoutes } from './routes/achievements.js';
import { statsRoutes } from './routes/stats.js';
import { authRoutes } from './routes/auth.js';
import { readingLogRoutes } from './routes/reading-logs.js';
import { mapRoutes } from './routes/map.js';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use('*', logger());

// Validate CORS_ORIGIN is set
if (!process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN environment variable is required');
}

app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = process.env.CORS_ORIGIN!.split(',').map(o => o.trim());

    // If no origin (like Postman) or origin is in allowed list, allow it
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      return origin || allowedOrigins[0];
    }

    return allowedOrigins[0]; // Default fallback
  },
  credentials: true,
}));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/', (c) => {
  return c.json({
    name: 'Passaporte do Leitor API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// ============================================================================
// API ROUTES
// ============================================================================

const api = new Hono();

// Public routes (no auth required)
api.route('/auth', authRoutes);

// Protected routes (auth required)
api.use('*', authMiddleware);
api.route('/family', familyRoutes);
api.route('/children', childRoutes);
api.route('/books', bookRoutes);
api.route('/achievements', achievementRoutes);
api.route('/stats', statsRoutes);
api.route('/reading-logs', readingLogRoutes);
api.route('/map', mapRoutes);

app.route('/api', api);

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// ============================================================================
// SERVER START
// ============================================================================

const port = parseInt(process.env.PORT || '3000', 10);

console.log(`🚀 Passaporte do Leitor API`);
console.log(`   Port: ${port}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port,
});
