-- O âmbito do admin passa a ser derivado das escolas ligadas (SchoolAdminEscola -> Escola).
-- Remover os campos de âmbito de school_admins.

ALTER TABLE "school_admins" DROP COLUMN "concelho";
ALTER TABLE "school_admins" DROP COLUMN "agrupamento";
