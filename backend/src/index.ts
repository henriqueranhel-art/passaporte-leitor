import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { familyRoutes } from './routes/family.js';
import { childRoutes } from './routes/children.js';
import { bookRoutes } from './routes/books.js';
import { achievementRoutes } from './routes/achievements.js';
import { statsRoutes } from './routes/stats.js';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use('*', logger());
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

api.route('/family', familyRoutes);
api.route('/children', childRoutes);
api.route('/books', bookRoutes);
api.route('/achievements', achievementRoutes);
api.route('/stats', statsRoutes);

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
