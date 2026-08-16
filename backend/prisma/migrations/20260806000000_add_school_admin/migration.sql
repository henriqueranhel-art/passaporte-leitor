-- Administração escolar: contas de admin escolar + estrutura escola/turma.
-- Só-aditivo: não altera nenhuma tabela existente.

-- CreateTable
CREATE TABLE "school_admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "concelho" TEXT NOT NULL,
    "agrupamento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escolas" (
    "id" TEXT NOT NULL,
    "concelho" TEXT NOT NULL,
    "agrupamento" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escolas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_admin_escolas" (
    "id" TEXT NOT NULL,
    "school_admin_id" TEXT NOT NULL,
    "escola_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_admin_escolas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "escola_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "professor" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_admins_email_key" ON "school_admins"("email");

-- CreateIndex
CREATE INDEX "escolas_agrupamento_idx" ON "escolas"("agrupamento");

-- CreateIndex
CREATE INDEX "school_admin_escolas_escola_id_idx" ON "school_admin_escolas"("escola_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_admin_escolas_school_admin_id_escola_id_key" ON "school_admin_escolas"("school_admin_id", "escola_id");

-- CreateIndex
CREATE INDEX "turmas_escola_id_idx" ON "turmas"("escola_id");

-- AddForeignKey
ALTER TABLE "school_admin_escolas" ADD CONSTRAINT "school_admin_escolas_school_admin_id_fkey" FOREIGN KEY ("school_admin_id") REFERENCES "school_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_admin_escolas" ADD CONSTRAINT "school_admin_escolas_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "escolas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_escola_id_fkey" FOREIGN KEY ("escola_id") REFERENCES "escolas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
