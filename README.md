# 🗺️ Passaporte do Leitor

Uma aplicação de leitura gamificada para crianças dos 6 aos 12 anos. Cada livro lido revela novos territórios no mapa mágico!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

## ✨ Funcionalidades

- 📚 **Registo de Livros** - Adicionar livros com título, autor e género
- 🗺️ **Mapa de Géneros** - 8 territórios temáticos para descobrir
- 🏆 **Sistema de Conquistas** - 15+ conquistas desbloqueáveis
- 📊 **Níveis de Progressão** - Grumete → Marinheiro → Explorador → Capitão → Almirante → Lenda
- 🖨️ **Centro de Impressão** - Certificados e páginas do passaporte
- 👨‍👩‍👧‍👦 **Multi-criança** - Gerir vários exploradores na mesma família

## 🛠️ Stack Tecnológica

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS |
| **Backend** | Hono + Node.js |
| **Base de Dados** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **State Management** | Zustand + TanStack Query |
| **Deploy** | Railway (backend) + Vercel (frontend) |

## 📁 Estrutura do Projeto

```
passaporte-leitor/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes UI reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── lib/             # API client, store, types
│   │   └── styles/          # CSS global
│   └── package.json
├── backend/                  # API Hono
│   ├── src/
│   │   ├── routes/          # Endpoints da API
│   │   ├── services/        # Lógica de negócio
│   │   └── lib/             # Prisma client
│   └── package.json
├── prisma/
│   ├── schema.prisma        # Schema da base de dados
│   └── seed.ts              # Dados iniciais (conquistas)
└── package.json             # Root package (workspaces)
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Neon](https://neon.tech) (base de dados PostgreSQL gratuita)

### 1. Clonar e Instalar

```bash
git clone https://github.com/seu-usuario/passaporte-leitor.git
cd passaporte-leitor
npm install
```

### 2. Configurar Base de Dados

1. Criar um projeto no [Neon](https://console.neon.tech)
2. Copiar o connection string
3. Criar ficheiro `.env` na raiz:

```bash
cp .env.example .env
```

4. Preencher as variáveis:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/passaporte-leitor?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/passaporte-leitor?sslmode=require"
```

### 3. Inicializar Base de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Criar tabelas
npm run db:push

# Adicionar conquistas iniciais
npx tsx prisma/seed.ts
```

### 4. Executar em Desenvolvimento

```bash
# Backend + Frontend em paralelo
npm run dev

# Ou separadamente:
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5175
```

## 🌐 API Endpoints

### Família
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/family/:id` | Obter família |
| POST | `/api/family` | Criar família |
| PUT | `/api/family/:id` | Atualizar família |

### Crianças
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/children/:id` | Obter criança |
| GET | `/api/children/family/:familyId` | Listar crianças |
| POST | `/api/children` | Criar criança |
| PUT | `/api/children/:id` | Atualizar criança |

### Livros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/books/:id` | Obter livro |
| GET | `/api/books/child/:childId` | Livros de uma criança |
| GET | `/api/books/family/:familyId` | Livros da família |
| POST | `/api/books` | Adicionar livro |
| PUT | `/api/books/:id` | Atualizar livro |

### Estatísticas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stats/child/:childId` | Stats de uma criança |
| GET | `/api/stats/family/:familyId` | Stats da família |
| GET | `/api/achievements/child/:childId` | Conquistas |

## 🚢 Deploy

### Backend no Railway

1. Criar conta no [Railway](https://railway.app)
2. Criar novo projeto → "Deploy from GitHub repo"
3. Selecionar o repositório
4. Adicionar variáveis de ambiente:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NODE_ENV=production`

5. Railway deteta automaticamente o `railway.toml`

### Frontend no Vercel

1. Criar conta no [Vercel](https://vercel.com)
2. Importar projeto do GitHub
3. Configurar:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Adicionar variável de ambiente:
   - `VITE_API_URL`: URL do Railway (ex: `https://passaporte-leitor.up.railway.app/api`)

5. Deploy!

## 📊 Schema da Base de Dados

```
Family
├── id, name, email, createdAt
├── children[] → Child
└── settings → FamilySettings

Child
├── id, familyId, name, avatar, birthYear
├── books[] → Book
└── achievements[] → ChildAchievement

Book
├── id, childId
├── title, author, isbn, genre
├── rating (1-3), notes
└── dateRead

Achievement
├── id, code, name, description, icon
├── category (READING, GENRE, STREAK, SPECIAL)
└── requirements (JSON)
```

## 🎨 Géneros Disponíveis

| ID | Nome | Tema | Ícone |
|----|------|------|-------|
| FANTASIA | Fantasia | Reino Mágico | 🏰 |
| AVENTURA | Aventura | Terras Selvagens | 🗺️ |
| ESPACO | Espaço | Galáxia Infinita | 🚀 |
| NATUREZA | Natureza | Floresta Encantada | 🌲 |
| MISTERIO | Mistério | Vale das Sombras | 🔍 |
| OCEANO | Oceano | Mar dos Piratas | 🌊 |
| CIENCIA | Ciência | Laboratório Secreto | 🔬 |
| HISTORIA | História | Ruínas Antigas | 📜 |

## 🏆 Sistema de Níveis

| Nível | Livros | Ícone |
|-------|--------|-------|
| Grumete | 0 | 🐣 |
| Marinheiro | 5 | ⚓ |
| Explorador | 10 | 🧭 |
| Capitão | 20 | 🎖️ |
| Almirante | 35 | 👑 |
| Lenda | 50 | ⭐ |

## 🔮 Roadmap

- [ ] Autenticação com email/password
- [ ] Integração com ISBN API para auto-complete
- [ ] App móvel (React Native)
- [ ] Modo escola/biblioteca
- [ ] Recomendações baseadas em preferências
- [ ] Exportar dados para PDF

## 📄 Licença

MIT © 2024

---

**Menos ecrã, mais leitura!** 🌿📚
