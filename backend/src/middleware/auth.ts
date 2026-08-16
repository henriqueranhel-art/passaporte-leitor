import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export interface AuthContext {
    familyId: string;
}

export interface SchoolAuthContext {
    schoolAdminId: string;
}

interface TokenPayload {
    familyId?: string;
    schoolAdminId?: string;
    // Tokens antigos não têm `type` — tratados como 'family'.
    type?: 'family' | 'school_admin';
}

// Protege as rotas de família. Aceita tokens de família (com ou sem `type`,
// para retrocompatibilidade) e rejeita tokens de administrador escolar.
export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        // Um administrador escolar não pode aceder aos dados das famílias.
        if (decoded.type === 'school_admin' || !decoded.familyId) {
            return c.json({ error: 'Forbidden - Access denied' }, 403);
        }

        c.set('auth', { familyId: decoded.familyId } as AuthContext);
        await next();
    } catch (error) {
        return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
}

// Protege as rotas de administração escolar (/api/school). Exige um token
// com type === 'school_admin'.
export async function schoolAdminMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

        if (decoded.type !== 'school_admin' || !decoded.schoolAdminId) {
            return c.json({ error: 'Forbidden - Access denied' }, 403);
        }

        c.set('schoolAuth', { schoolAdminId: decoded.schoolAdminId } as SchoolAuthContext);
        await next();
    } catch (error) {
        return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }
}

// Helper to get authenticated family ID from context
export function getAuthFamilyId(c: Context): string {
    const auth = c.get('auth') as AuthContext;
    if (!auth || !auth.familyId) {
        throw new Error('Not authenticated');
    }
    return auth.familyId;
}

// Helper to get authenticated school admin ID from context
export function getAuthSchoolAdminId(c: Context): string {
    const auth = c.get('schoolAuth') as SchoolAuthContext;
    if (!auth || !auth.schoolAdminId) {
        throw new Error('Not authenticated');
    }
    return auth.schoolAdminId;
}
