import { PrismaClient, AchievementCategory } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    code: 'primeiro-livro',
    name: 'Primeiro Passo',
    description: 'Leu o primeiro livro',
    icon: '📖',
    category: AchievementCategory.READING,
    requirements: { type: 'book_count', value: 1 },
  },
  {
    code: 'cinco-livros',
    name: 'Leitor Dedicado',
    description: 'Leu 5 livros',
    icon: '📚',
    category: AchievementCategory.READING,
    requirements: { type: 'book_count', value: 5 },
  },
  {
    code: 'dez-livros',
    name: 'Devorador de Histórias',
    description: 'Leu 10 livros',
    icon: '🏆',
    category: AchievementCategory.READING,
    requirements: { type: 'book_count', value: 10 },
  },
  {
    code: 'vinte-livros',
    name: 'Bibliotecário',
    description: 'Leu 20 livros',
    icon: '🎖️',
    category: AchievementCategory.READING,
    requirements: { type: 'book_count', value: 20 },
  },
  {
    code: 'cinquenta-livros',
    name: 'Lenda Literária',
    description: 'Leu 50 livros',
    icon: '👑',
    category: AchievementCategory.READING,
    requirements: { type: 'book_count', value: 50 },
  },
  {
    code: 'explorador-generos',
    name: 'Explorador de Géneros',
    description: 'Leu livros de 3 géneros diferentes',
    icon: '🌈',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_count', value: 3 },
  },
  {
    code: 'mestre-generos',
    name: 'Mestre dos Mundos',
    description: 'Leu livros de 6 géneros diferentes',
    icon: '🌍',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_count', value: 6 },
  },
  {
    code: 'todos-generos',
    name: 'Conquistador Total',
    description: 'Leu livros de todos os géneros',
    icon: '⭐',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_count', value: 8 },
  },
  {
    code: 'super-leitor',
    name: 'Super Leitor',
    description: 'Leu 3 livros no mesmo mês',
    icon: '🚀',
    category: AchievementCategory.STREAK,
    requirements: { type: 'monthly_books', value: 3 },
  },
  {
    code: 'critico',
    name: 'Crítico Literário',
    description: 'Avaliou 10 livros',
    icon: '⭐',
    category: AchievementCategory.SPECIAL,
    requirements: { type: 'rated_books', value: 10 },
  },
  {
    code: 'fantasista',
    name: 'Sonhador',
    description: 'Leu 5 livros de Fantasia',
    icon: '🏰',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_books', genre: 'FANTASIA', value: 5 },
  },
  {
    code: 'astronauta',
    name: 'Astronauta',
    description: 'Leu 5 livros de Espaço',
    icon: '🚀',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_books', genre: 'ESPACO', value: 5 },
  },
  {
    code: 'naturalista',
    name: 'Amigo da Natureza',
    description: 'Leu 5 livros de Natureza',
    icon: '🌲',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_books', genre: 'NATUREZA', value: 5 },
  },
  {
    code: 'pirata',
    name: 'Lobo do Mar',
    description: 'Leu 5 livros de Oceano',
    icon: '🏴‍☠️',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_books', genre: 'OCEANO', value: 5 },
  },
  {
    code: 'detetive',
    name: 'Detetive',
    description: 'Leu 5 livros de Mistério',
    icon: '🔍',
    category: AchievementCategory.GENRE,
    requirements: { type: 'genre_books', genre: 'MISTERIO', value: 5 },
  },
];

async function main() {
  console.log('🌱 A semear conquistas...');

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
    console.log(`  ✓ ${achievement.icon} ${achievement.name}`);
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
