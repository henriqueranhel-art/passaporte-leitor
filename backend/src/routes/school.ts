import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { schoolAdminMiddleware, getAuthSchoolAdminId } from '../middleware/auth.js';

export const schoolRoutes = new Hono();

// Todas as rotas exigem um administrador escolar autenticado.
schoolRoutes.use('*', schoolAdminMiddleware);

// ============================================================================
// Schemas de validação
// ============================================================================

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

const createEscolaSchema = z.object({
    nome: z.string().min(1).max(200),
});

const updateEscolaSchema = z.object({
    nome: z.string().min(1).max(200),
});

const turmaSchema = z.object({
    nome: z.string().min(1).max(100),
    professor: z.string().min(1).max(200),
    email: z.string().email(),
});

// ============================================================================
// Helpers
// ============================================================================

// Confirma que a escola está ligada ao admin autenticado. Devolve a escola ou null.
async function getOwnedEscola(schoolAdminId: string, escolaId: string) {
    const link = await prisma.schoolAdminEscola.findUnique({
        where: { schoolAdminId_escolaId: { schoolAdminId, escolaId } },
        include: { escola: true },
    });
    return link?.escola ?? null;
}

// Deriva o âmbito (concelho + agrupamento) do admin a partir das escolas a que
// está ligado (SchoolAdminEscola -> Escola). Devolve null se ainda não tiver
// nenhuma escola de referência.
async function getAdminScope(
    schoolAdminId: string
): Promise<{ concelho: string; agrupamento: string } | null> {
    const link = await prisma.schoolAdminEscola.findFirst({
        where: { schoolAdminId },
        include: { escola: { select: { concelho: true, agrupamento: true } } },
        orderBy: { createdAt: 'asc' },
    });
    if (!link) return null;
    return { concelho: link.escola.concelho, agrupamento: link.escola.agrupamento };
}

// ============================================================================
// GET /api/school/account - Dados do admin autenticado
// ============================================================================

schoolRoutes.get('/account', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);

    const admin = await prisma.schoolAdmin.findUnique({
        where: { id: schoolAdminId },
        select: { id: true, name: true, email: true },
    });

    if (!admin) {
        return c.json({ error: 'Administrador não encontrado' }, 404);
    }

    // O âmbito (concelho/agrupamento) é derivado das escolas ligadas.
    const scope = await getAdminScope(schoolAdminId);

    return c.json({
        ...admin,
        concelho: scope?.concelho ?? null,
        agrupamento: scope?.agrupamento ?? null,
    });
});

// ============================================================================
// PUT /api/school/account/password - Alterar palavra-passe
// ============================================================================

schoolRoutes.put('/account/password', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);

    const body = await c.req.json();
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const { currentPassword, newPassword } = validation.data;

    const admin = await prisma.schoolAdmin.findUnique({
        where: { id: schoolAdminId },
        select: { password: true },
    });

    if (!admin) {
        return c.json({ error: 'Administrador não encontrado' }, 404);
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
        return c.json({ error: 'Palavra-passe atual incorreta' }, 401);
    }

    await prisma.schoolAdmin.update({
        where: { id: schoolAdminId },
        data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return c.json({ success: true });
});

// ============================================================================
// GET /api/school/escolas - Escolas do admin (com contagem de turmas)
// ============================================================================

schoolRoutes.get('/escolas', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);

    const links = await prisma.schoolAdminEscola.findMany({
        where: { schoolAdminId },
        include: {
            escola: {
                include: { _count: { select: { turmas: true } } },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const escolas = links.map((link) => ({
        id: link.escola.id,
        concelho: link.escola.concelho,
        agrupamento: link.escola.agrupamento,
        nome: link.escola.nome,
        turmaCount: link.escola._count.turmas,
    }));

    return c.json({ escolas });
});

// ============================================================================
// POST /api/school/escolas - Criar escola (âmbito forçado ao agrupamento do admin)
// ============================================================================

schoolRoutes.post('/escolas', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);

    const body = await c.req.json();
    const validation = createEscolaSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    // O âmbito é determinado pelas escolas já ligadas ao admin
    // (SchoolAdminEscola -> Escola). Uma nova escola herda esse concelho/agrupamento,
    // garantindo que o admin só cria escolas do seu agrupamento.
    const scope = await getAdminScope(schoolAdminId);
    if (!scope) {
        return c.json(
            { error: 'A tua conta ainda não tem nenhuma escola de referência. Contacta o administrador do sistema.' },
            400
        );
    }

    // O cliente só escolhe o nome; concelho/agrupamento vêm do âmbito derivado.
    const escola = await prisma.$transaction(async (tx) => {
        const created = await tx.escola.create({
            data: {
                concelho: scope.concelho,
                agrupamento: scope.agrupamento,
                nome: validation.data.nome,
            },
        });

        await tx.schoolAdminEscola.create({
            data: { schoolAdminId, escolaId: created.id },
        });

        return created;
    });

    return c.json(
        {
            id: escola.id,
            concelho: escola.concelho,
            agrupamento: escola.agrupamento,
            nome: escola.nome,
            turmaCount: 0,
        },
        201
    );
});

// ============================================================================
// PUT /api/school/escolas/:id - Renomear escola (âmbito imutável)
// ============================================================================

schoolRoutes.put('/escolas/:id', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    const owned = await getOwnedEscola(schoolAdminId, id);
    if (!owned) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    const body = await c.req.json();
    const validation = updateEscolaSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    // Apenas o nome é editável — concelho/agrupamento não podem sair do âmbito do admin.
    const escola = await prisma.escola.update({
        where: { id },
        data: { nome: validation.data.nome },
    });

    return c.json({
        id: escola.id,
        concelho: escola.concelho,
        agrupamento: escola.agrupamento,
        nome: escola.nome,
    });
});

// ============================================================================
// DELETE /api/school/escolas/:id - Eliminar escola (e as suas turmas em cascata)
// ============================================================================

schoolRoutes.delete('/escolas/:id', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    const owned = await getOwnedEscola(schoolAdminId, id);
    if (!owned) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    await prisma.escola.delete({ where: { id } });

    return c.json({ success: true });
});

// ============================================================================
// GET /api/school/escolas/:id/turmas - Turmas de uma escola
// ============================================================================

schoolRoutes.get('/escolas/:id/turmas', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    const owned = await getOwnedEscola(schoolAdminId, id);
    if (!owned) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    const turmas = await prisma.turma.findMany({
        where: { escolaId: id },
        orderBy: { nome: 'asc' },
    });

    return c.json({ turmas });
});

// ============================================================================
// POST /api/school/escolas/:id/turmas - Criar turma
// ============================================================================

schoolRoutes.post('/escolas/:id/turmas', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    const owned = await getOwnedEscola(schoolAdminId, id);
    if (!owned) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    const body = await c.req.json();
    const validation = turmaSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const turma = await prisma.turma.create({
        data: {
            escolaId: id,
            nome: validation.data.nome,
            professor: validation.data.professor,
            email: validation.data.email,
        },
    });

    return c.json(turma, 201);
});

// ============================================================================
// PUT /api/school/turmas/:id - Atualizar turma
// ============================================================================

schoolRoutes.put('/turmas/:id', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    // Verifica posse através da escola da turma.
    const turma = await prisma.turma.findFirst({
        where: {
            id,
            escola: { admins: { some: { schoolAdminId } } },
        },
        select: { id: true },
    });

    if (!turma) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    const body = await c.req.json();
    const validation = turmaSchema.safeParse(body);
    if (!validation.success) {
        return c.json({ error: 'Dados inválidos', details: validation.error.issues }, 400);
    }

    const updated = await prisma.turma.update({
        where: { id },
        data: {
            nome: validation.data.nome,
            professor: validation.data.professor,
            email: validation.data.email,
        },
    });

    return c.json(updated);
});

// ============================================================================
// DELETE /api/school/turmas/:id - Eliminar turma
// ============================================================================

schoolRoutes.delete('/turmas/:id', async (c) => {
    const schoolAdminId = getAuthSchoolAdminId(c);
    const { id } = c.req.param();

    const turma = await prisma.turma.findFirst({
        where: {
            id,
            escola: { admins: { some: { schoolAdminId } } },
        },
        select: { id: true },
    });

    if (!turma) {
        return c.json({ error: 'Forbidden - Access denied' }, 403);
    }

    await prisma.turma.delete({ where: { id } });

    return c.json({ success: true });
});
