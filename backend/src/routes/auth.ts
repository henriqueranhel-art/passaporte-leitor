import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = new Hono();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-123';

// Schema Validation
const registerSchema = z.object({
    familyName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    child: z.object({
        name: z.string().min(2),
        avatar: z.string(),
        birthYear: z.number(),
    }),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

// Check email
app.post('/check-email', async (c) => {
    try {
        const body = await c.req.json();
        const { email } = body;

        if (!email) {
            return c.json({ error: 'Email required' }, 400);
        }

        const family = await prisma.family.findUnique({
            where: { email },
        });

        return c.json({ exists: !!family });
    } catch (error) {
        console.error('Check email error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// Register
app.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        const { familyName, email, password, child } = registerSchema.parse(body);

        const existingFamily = await prisma.family.findUnique({ where: { email } });
        if (existingFamily) {
            return c.json({ error: 'Email already registered' }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            // Create Family
            const family = await tx.family.create({
                data: {
                    name: familyName,
                    email,
                    password: hashedPassword,
                    settings: {
                        create: {
                            language: 'pt-PT',
                        },
                    },
                },
            });

            // Create First Child
            const newChild = await tx.child.create({
                data: {
                    familyId: family.id,
                    name: child.name,
                    avatar: child.avatar,
                    birthYear: child.birthYear,
                },
            });

            return { family, child: newChild };
        });

        const token = jwt.sign({ familyId: result.family.id }, JWT_SECRET, { expiresIn: '30d' });

        return c.json({
            token,
            family: {
                id: result.family.id,
                name: result.family.name,
                email: result.family.email,
            },
            firstChild: result.child,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: error.errors }, 400);
        }
        console.error('Register error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

// Login
app.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        const { email, password } = loginSchema.parse(body);

        const family = await prisma.family.findUnique({ where: { email } });
        if (!family || !family.password) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }

        const isValid = await bcrypt.compare(password, family.password);
        if (!isValid) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }

        const token = jwt.sign({ familyId: family.id }, JWT_SECRET, { expiresIn: '30d' });

        return c.json({
            token,
            family: {
                id: family.id,
                name: family.name,
                email: family.email,
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: error.errors }, 400);
        }
        console.error('Login error:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
});

export const authRoutes = app;
