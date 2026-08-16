/**
 * Cria (ou atualiza) uma conta de administrador escolar e liga-a a escolas
 * existentes. O âmbito do admin (agrupamento/concelho) NÃO é guardado na conta —
 * é derivado das escolas ligadas (SchoolAdminEscola -> Escola).
 *
 * Uso:
 *   npm run create:school-admin -- \
 *     --name "Ana Sousa" \
 *     --email ana@escola.pt \
 *     --password "umaPasswordForte" \
 *     --escola-ids id1,id2
 *
 * A password é guardada com hash bcrypt (10 rounds), tal como as famílias.
 * Se o email já existir, os dados são atualizados (upsert).
 *
 * As escolas indicadas têm de existir e partilhar o MESMO agrupamento (um admin
 * pertence a um único agrupamento). Se a conta já tiver escolas, as novas têm de
 * ser do mesmo agrupamento.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    // Suporta "--key=value" e "--key value"
    if (key.includes('=')) {
      const [k, ...rest] = key.split('=');
      args[k] = rest.join('=');
    } else {
      args[key] = argv[i + 1] ?? '';
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const required = ['name', 'email', 'password'];
  const missing = required.filter((k) => !args[k]);
  if (missing.length) {
    console.error(`❌ Faltam argumentos: ${missing.map((m) => `--${m}`).join(', ')}`);
    console.error(
      '\nUso: npm run create:school-admin -- --name "Ana Sousa" --email ana@escola.pt ' +
        '--password "..." --escola-ids id1,id2'
    );
    process.exit(1);
  }

  if (args.password.length < 6) {
    console.error('❌ A password deve ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  const email = args.email.trim().toLowerCase();

  const escolaIds = (args['escola-ids'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Validar escolas ANTES de criar/atualizar a conta: têm de existir e partilhar
  // um único agrupamento.
  const escolasToLink = [];
  if (escolaIds.length) {
    const escolas = await prisma.escola.findMany({ where: { id: { in: escolaIds } } });
    const foundIds = new Set(escolas.map((e) => e.id));
    const notFound = escolaIds.filter((id) => !foundIds.has(id));
    if (notFound.length) {
      console.error(`❌ Escolas não encontradas: ${notFound.join(', ')}`);
      process.exit(1);
    }
    const agrupamentos = new Set(escolas.map((e) => e.agrupamento));
    if (agrupamentos.size > 1) {
      console.error(
        `❌ As escolas indicadas pertencem a agrupamentos diferentes (${[...agrupamentos].join(
          ', '
        )}). Um admin pertence a um único agrupamento.`
      );
      process.exit(1);
    }
    escolasToLink.push(...escolas);
  }

  const hashedPassword = await bcrypt.hash(args.password, 10);

  const admin = await prisma.schoolAdmin.upsert({
    where: { email },
    update: { name: args.name, password: hashedPassword },
    create: { name: args.name, email, password: hashedPassword },
  });

  // Se a conta já tem escolas, o agrupamento das novas tem de coincidir.
  if (escolasToLink.length) {
    const existing = await prisma.schoolAdminEscola.findFirst({
      where: { schoolAdminId: admin.id, escolaId: { notIn: escolasToLink.map((e) => e.id) } },
      include: { escola: { select: { agrupamento: true } } },
    });
    if (existing && existing.escola.agrupamento !== escolasToLink[0].agrupamento) {
      console.error(
        `❌ A conta já pertence ao agrupamento "${existing.escola.agrupamento}"; ` +
          `as novas escolas são de "${escolasToLink[0].agrupamento}".`
      );
      process.exit(1);
    }
  }

  const linked: string[] = [];
  for (const escola of escolasToLink) {
    await prisma.schoolAdminEscola.upsert({
      where: { schoolAdminId_escolaId: { schoolAdminId: admin.id, escolaId: escola.id } },
      update: {},
      create: { schoolAdminId: admin.id, escolaId: escola.id },
    });
    linked.push(escola.nome);
  }

  const scope = escolasToLink[0]?.agrupamento ?? '(sem escola — âmbito por definir)';

  console.log('✅ Administrador escolar pronto:');
  console.log(`   id:          ${admin.id}`);
  console.log(`   nome:        ${admin.name}`);
  console.log(`   email:       ${admin.email}`);
  console.log(`   agrupamento: ${scope}`);
  if (linked.length) console.log(`   escolas:     ${linked.join(', ')}`);
  else console.log('   ⚠️  Sem escolas ligadas — liga pelo menos uma para definir o âmbito.');
}

main()
  .catch((err) => {
    console.error('❌ Erro:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
