import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { authMiddleware } from './middleware/auth.js';
import { familyRoutes } from './routes/family.js';
import { childRoutes } from './routes/children.js';
import { bookRoutes } from './routes/books.js';
import { childBookRoutes } from './routes/child-books.js';
import { achievementRoutes } from './routes/achievements.js';
import { statsRoutes } from './routes/stats.js';
import { authRoutes } from './routes/auth.js';
import { readingLogRoutes } from './routes/reading-logs.js';
import { mapRoutes } from './routes/map.js';
import { schoolRoutes } from './routes/school.js';

const app = new Hono();

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use('*', logger());

// Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xXssProtection: '1; mode=block',
}));

// ============================================================================
// HEALTH CHECK (before CORS - no origin header from Railway health checks)
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

// Validate CORS_ORIGIN is set (warn but don't crash to allow health checks)
if (!process.env.CORS_ORIGIN) {
  console.warn('⚠️  CORS_ORIGIN environment variable is not set. API routes will reject all origins.');
}

// CORS (applied to /api routes only)
app.use('/api/*', cors({
  origin: (origin) => {
    if (!process.env.CORS_ORIGIN) {
      return null; // Reject all if not configured
    }
    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());

    // No origin (server-to-server, Postman) - allow in development only
    if (!origin) {
      return process.env.NODE_ENV === 'development' ? allowedOrigins[0] : null;
    }

    // Check if origin is in the allowed list
    if (allowedOrigins.some(allowed => origin.includes(allowed))) {
      return origin;
    }

    // Reject unauthorized origins
    return null;
  },
  credentials: true,
}));

// ============================================================================
// API ROUTES
// ============================================================================

const api = new Hono();

// Public routes (no auth required)
api.route('/auth', authRoutes);

// School admin routes — usam o seu próprio middleware (schoolAdminMiddleware),
// por isso são montadas antes do authMiddleware de família.
api.route('/school', schoolRoutes);

// Protected routes (auth required)
api.use('*', authMiddleware);
api.route('/family', familyRoutes);
api.route('/children', childRoutes);
api.route('/books', bookRoutes);
api.route('/child-books', childBookRoutes);
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
