import React, { useState } from 'react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  primaryLight: '#F5A623',
  primaryDark: '#D35400',
  secondary: '#3498DB',
  success: '#27AE60',
  successLight: '#58D68D',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#FDF6E3',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E8E0D5',
  streak: '#FF6B35',
};

const GENRES = {
  FANTASIA: { name: 'Fantasia', icon: '🏰', color: '#9B59B6', mapColor: '#D7BDE2' },
  AVENTURA: { name: 'Aventura', icon: '🗺️', color: '#E67E22', mapColor: '#F5CBA7' },
  ESPACO: { name: 'Espaço', icon: '🚀', color: '#2C3E50', mapColor: '#85929E' },
  NATUREZA: { name: 'Natureza', icon: '🌲', color: '#27AE60', mapColor: '#ABEBC6' },
  MISTERIO: { name: 'Mistério', icon: '🔍', color: '#34495E', mapColor: '#ABB2B9' },
  OCEANO: { name: 'Oceano', icon: '🌊', color: '#3498DB', mapColor: '#AED6F1' },
  HISTORIA: { name: 'História', icon: '📜', color: '#795548', mapColor: '#D7CCC8' },
};

// ============================================================================
// MOCK DATA - Com diferentes tipos de progresso
// ============================================================================

const mockChild = {
  id: '1',
  name: 'Maria',
  avatar: '👧',
  level: { name: 'Exploradora', icon: '🧭', color: '#82E0AA', minBooks: 10 },
  nextLevel: { name: 'Capitã', icon: '🎖️', minBooks: 20 },
  totalBooks: 12,
  
  streak: {
    current: 5,
    longest: 12,
    minutesToday: 18,
    dailyGoal: 15,
  },
  
  // Múltiplos livros - alguns com páginas, outros sem
  currentBooks: [
    {
      id: 'b1',
      title: 'Harry Potter e a Pedra Filosofal',
      author: 'J.K. Rowling',
      genre: 'FANTASIA',
      // Com páginas conhecidas
      currentPage: 127,
      totalPages: 250,
      startedAt: '2024-01-05',
      lastReadAt: '2024-01-15',
    },
    {
      id: 'b2',
      title: 'O Diário de Anne Frank',
      author: 'Anne Frank',
      genre: 'HISTORIA',
      // Sem total de páginas - só sabe a atual
      currentPage: 45,
      totalPages: null,
      startedAt: '2024-01-10',
      lastReadAt: '2024-01-14',
    },
    {
      id: 'b3',
      title: 'A Ilha do Tesouro',
      author: 'R. L. Stevenson',
      genre: 'AVENTURA',
      // Sem páginas nenhumas - só a data
      currentPage: null,
      totalPages: null,
      startedAt: '2024-01-12',
      lastReadAt: '2024-01-13',
    },
  ],
  
  lastFinishedBook: {
    id: 'b4',
    title: 'O Principezinho',
    author: 'Antoine de Saint-Exupéry',
    genre: 'FANTASIA',
    rating: 3,
    finishedAt: '2024-01-08',
  },
  
  weekSessions: [
    { date: '2024-01-15', minutes: 18, didRead: true },
    { date: '2024-01-14', minutes: 22, didRead: true },
    { date: '2024-01-13', minutes: 15, didRead: true },
    { date: '2024-01-12', minutes: 30, didRead: true },
    { date: '2024-01-11', minutes: 12, didRead: true },
    { date: '2024-01-10', minutes: 0, didRead: false },
    { date: '2024-01-09', minutes: 0, didRead: false },
  ],
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const ProgressRing = ({ progress, size = 60, strokeWidth = 6, color = COLORS.primary }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
};

const Badge = ({ children, color = COLORS.primary, small = false }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full font-bold text-white ${small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
    style={{ backgroundColor: color }}
  >
    {children}
  </span>
);

// Calendário da Semana
const WeekCalendar = ({ sessions }) => {
  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const today = new Date();
  const todayDay = today.getDay();
  const adjustedToday = todayDay === 0 ? 6 : todayDay - 1;
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - adjustedToday + i);
    const dateStr = date.toISOString().split('T')[0];
    const session = sessions.find(s => s.date === dateStr);
    
    days.push({
      name: dayNames[i],
      date: date.getDate(),
      didRead: session?.didRead || false,
      minutes: session?.minutes || 0,
      isToday: i === adjustedToday,
      isPast: i < adjustedToday,
      isFuture: i > adjustedToday,
    });
  }

  return (
    <div className="flex justify-between gap-1">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-400 mb-1.5 font-medium">{day.name}</span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative ${
              day.isToday ? 'ring-2 ring-offset-2' : ''
            }`}
            style={{
              backgroundColor: day.didRead 
                ? COLORS.success 
                : day.isPast 
                  ? '#FEE2E2' 
                  : '#F3F4F6',
              color: day.didRead 
                ? 'white' 
                : day.isPast 
                  ? '#EF4444' 
                  : '#9CA3AF',
              ringColor: day.isToday ? COLORS.primary : 'transparent',
            }}
          >
            {day.didRead ? '✓' : day.isPast ? '✗' : day.date}
          </div>
          {day.didRead && day.minutes > 0 && (
            <span className="text-xs text-gray-400 mt-1">{day.minutes}m</span>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// BOOK PROGRESS - Diferentes visualizações baseadas nos dados disponíveis
// ============================================================================

const BookProgressIndicator = ({ book }) => {
  const genre = GENRES[book.genre];
  const hasFullProgress = book.currentPage && book.totalPages;
  const hasPartialProgress = book.currentPage && !book.totalPages;
  const hasNoProgress = !book.currentPage;

  // Calcular dias a ler
  const startDate = new Date(book.startedAt);
  const today = new Date();
  const daysReading = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

  // Calcular "última leitura"
  const lastRead = new Date(book.lastReadAt);
  const daysAgo = Math.ceil((today - lastRead) / (1000 * 60 * 60 * 24));
  const lastReadText = daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `Há ${daysAgo} dias`;

  if (hasFullProgress) {
    // CASO 1: Sabemos página atual E total → mostrar barra de progresso %
    const progress = Math.round((book.currentPage / book.totalPages) * 100);
    return (
      <div className="mt-1.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: genre?.color }}
            />
          </div>
          <span className="text-xs font-bold" style={{ color: genre?.color }}>{progress}%</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Pág. {book.currentPage} de {book.totalPages}</span>
          <span className="text-xs text-gray-400">{lastReadText}</span>
        </div>
      </div>
    );
  }

  if (hasPartialProgress) {
    // CASO 2: Sabemos página atual mas NÃO o total → mostrar página + tempo
    return (
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            📄 Pág. {book.currentPage}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            📅 {daysReading} dias
          </span>
        </div>
        <span className="text-xs text-gray-400">{lastReadText}</span>
      </div>
    );
  }

  // CASO 3: Não sabemos páginas → mostrar apenas tempo
  return (
    <div className="mt-1.5 flex items-center justify-between">
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
        📅 A ler há {daysReading} dias
      </span>
      <span className="text-xs text-gray-400">{lastReadText}</span>
    </div>
  );
};

// Mini Card de Livro em Progresso
const CurrentBookMini = ({ book }) => {
  const genre = GENRES[book.genre];
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
      {/* Ícone do Género */}
      <div 
        className="w-11 h-14 rounded-lg flex items-center justify-center text-xl shadow-sm flex-shrink-0"
        style={{ backgroundColor: genre?.mapColor }}
      >
        {genre?.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h5 className="font-bold text-sm truncate" style={{ color: COLORS.text }}>
          {book.title}
        </h5>
        <p className="text-xs text-gray-500 truncate">{book.author}</p>
        
        {/* Progresso - adaptável */}
        <BookProgressIndicator book={book} />
      </div>
    </div>
  );
};

// ============================================================================
// CARTÃO DA CRIANÇA - VERSÃO 3
// ============================================================================

const ChildCard = ({ child, onAddBook, onLogReading, onViewDetails }) => {
  const [showAllBooks, setShowAllBooks] = useState(false);
  
  const levelProgress = Math.round(
    ((child.totalBooks - child.level.minBooks) / 
     (child.nextLevel.minBooks - child.level.minBooks)) * 100
  );

  const dailyProgress = Math.min(
    Math.round((child.streak.minutesToday / child.streak.dailyGoal) * 100),
    100
  );

  const goalComplete = child.streak.minutesToday >= child.streak.dailyGoal;
  const hasCurrentBooks = child.currentBooks && child.currentBooks.length > 0;
  const displayedBooks = showAllBooks ? child.currentBooks : child.currentBooks?.slice(0, 2);

  return (
    <div 
      className="rounded-3xl border-2 overflow-hidden shadow-lg"
      style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
    >
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div 
        className="p-5 relative"
        style={{ background: `linear-gradient(135deg, ${child.level.color}40 0%, ${child.level.color}20 100%)` }}
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <div 
              className="w-18 h-18 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
              style={{ backgroundColor: child.level.color, width: '72px', height: '72px' }}
            >
              {child.avatar}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>
              {child.name}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge color={COLORS.primary}>
                {child.level.icon} {child.level.name}
              </Badge>
              <span className="text-sm text-gray-500">
                {child.totalBooks} livros
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Próximo: {child.nextLevel.icon} {child.nextLevel.name}</span>
                <span style={{ color: COLORS.primary }}>{child.nextLevel.minBooks - child.totalBooks} livros</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress}%`, backgroundColor: COLORS.primary }}
                />
              </div>
            </div>
          </div>

          <div 
            className="flex flex-col items-center p-3 rounded-xl min-w-[70px]"
            style={{ backgroundColor: child.streak.current > 0 ? `${COLORS.streak}15` : '#F9FAFB' }}
          >
            <div className="flex items-center gap-1">
              <span className="text-2xl">{child.streak.current > 0 ? '🔥' : '💤'}</span>
              <span 
                className="text-2xl font-bold"
                style={{ color: child.streak.current > 0 ? COLORS.streak : '#9CA3AF' }}
              >
                {child.streak.current}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {child.streak.current === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* META DIÁRIA - Simplificada (sem badge "Meta cumprida") */}
      {/* ================================================================== */}
      <div 
        className="px-5 py-4 border-b flex items-center gap-4"
        style={{ 
          borderColor: COLORS.border,
          backgroundColor: goalComplete ? `${COLORS.success}08` : '#FFFBEB'
        }}
      >
        <div className="relative flex items-center justify-center">
          <ProgressRing 
            progress={dailyProgress} 
            size={52} 
            strokeWidth={5}
            color={goalComplete ? COLORS.success : COLORS.warning}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg">{goalComplete ? '✓' : '📖'}</span>
          </div>
        </div>

        <div className="flex-1">
          <span className="font-bold text-sm" style={{ color: COLORS.text }}>
            Leitura de Hoje
          </span>
          <div className="flex items-baseline gap-1">
            <span 
              className="text-2xl font-bold" 
              style={{ color: goalComplete ? COLORS.success : COLORS.warning }}
            >
              {child.streak.minutesToday}
            </span>
            <span className="text-gray-500 text-sm">/ {child.streak.dailyGoal} min</span>
          </div>
        </div>

        <button
          onClick={onLogReading}
          className="px-5 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{ backgroundColor: goalComplete ? COLORS.success : COLORS.primary }}
        >
          <span className="text-lg">📝</span>
          <span>Registar</span>
        </button>
      </div>

      {/* ================================================================== */}
      {/* CALENDÁRIO DA SEMANA */}
      {/* ================================================================== */}
      <div className="px-5 py-4 border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="font-bold text-sm" style={{ color: COLORS.text }}>Esta Semana</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span>
              <span className="text-gray-500">Leu</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-100"></span>
              <span className="text-gray-500">Não leu</span>
            </span>
          </div>
        </div>
        <WeekCalendar sessions={child.weekSessions} />
      </div>

      {/* ================================================================== */}
      {/* LIVROS EM PROGRESSO */}
      {/* ================================================================== */}
      <div className="px-5 py-4 border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <span className="font-bold text-sm" style={{ color: COLORS.text }}>
              A Ler ({child.currentBooks?.length || 0})
            </span>
          </div>
          <button
            onClick={onAddBook}
            className="text-sm font-medium flex items-center gap-1 hover:underline"
            style={{ color: COLORS.primary }}
          >
            <span>+</span>
            <span>Novo livro</span>
          </button>
        </div>
        
        {hasCurrentBooks ? (
          <div className="space-y-2">
            {displayedBooks.map((book) => (
              <CurrentBookMini key={book.id} book={book} />
            ))}
            
            {child.currentBooks.length > 2 && !showAllBooks && (
              <button
                onClick={() => setShowAllBooks(true)}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver mais {child.currentBooks.length - 2} livros...
              </button>
            )}
            
            {showAllBooks && child.currentBooks.length > 2 && (
              <button
                onClick={() => setShowAllBooks(false)}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver menos
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="text-gray-500 text-sm mb-3">Nenhum livro em progresso</p>
            <button
              onClick={onAddBook}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: COLORS.secondary }}
            >
              + Começar um livro
            </button>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* ÚLTIMO LIVRO TERMINADO */}
      {/* ================================================================== */}
      {child.lastFinishedBook && (
        <div className="px-5 py-4 border-b" style={{ borderColor: COLORS.border }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✅</span>
            <span className="font-bold text-sm" style={{ color: COLORS.text }}>Último Terminado</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
            <div 
              className="w-11 h-14 rounded-lg flex items-center justify-center text-xl shadow-sm flex-shrink-0"
              style={{ backgroundColor: GENRES[child.lastFinishedBook.genre]?.mapColor }}
            >
              {GENRES[child.lastFinishedBook.genre]?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-sm truncate" style={{ color: COLORS.text }}>
                {child.lastFinishedBook.title}
              </h5>
              <p className="text-xs text-gray-500 truncate">{child.lastFinishedBook.author}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">
                {child.lastFinishedBook.rating === 3 ? '😍' : child.lastFinishedBook.rating === 2 ? '🙂' : '😐'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(child.lastFinishedBook.finishedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <div className="px-5 py-4">
        <div className="flex gap-3">
          <button
            onClick={onAddBook}
            className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 hover:shadow-md transition-all active:scale-98"
            style={{ borderColor: COLORS.primary, color: COLORS.primary }}
          >
            <span>📖</span>
            <span>Adicionar Livro</span>
          </button>
          <button
            onClick={onViewDetails}
            className="px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white hover:shadow-md transition-all active:scale-98"
            style={{ backgroundColor: COLORS.secondary }}
          >
            <span>📊</span>
            <span>Detalhes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DEMO - Mostrar os 3 tipos de progresso
// ============================================================================

export default function ChildCardDemo() {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: COLORS.background }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>
            🗺️ Passaporte do Leitor
          </h1>
          <p className="text-gray-500 mb-4">Cartão do Explorador - v3</p>
        </div>

        {/* Cartão */}
        <div className="max-w-md mx-auto mb-8">
          <ChildCard 
            child={mockChild}
            onAddBook={() => alert('Adicionar livro')}
            onLogReading={() => alert('Registar leitura')}
            onViewDetails={() => alert('Ver detalhes')}
          />
        </div>

        {/* Explicação dos tipos de progresso */}
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <h3 className="font-bold mb-4" style={{ color: COLORS.text }}>
            📊 Tipos de Progresso nos Livros
          </h3>
          
          <div className="space-y-4">
            {/* Tipo 1 */}
            <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✅</span>
                <strong>Com páginas completas</strong>
                <Badge color={COLORS.success} small>Ideal</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Página atual + total → Barra de progresso com %
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '51%' }} />
                  </div>
                  <span className="text-sm font-bold text-purple-500">51%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Pág. 127 de 250</span>
                  <span>Hoje</span>
                </div>
              </div>
            </div>

            {/* Tipo 2 */}
            <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📄</span>
                <strong>Só página atual</strong>
                <Badge color={COLORS.warning} small>Parcial</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Sabemos a página atual mas não o total → Tags informativas
              </p>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">📄 Pág. 45</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">📅 5 dias</span>
                </div>
                <span className="text-xs text-gray-400">Ontem</span>
              </div>
            </div>

            {/* Tipo 3 */}
            <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: COLORS.border }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📅</span>
                <strong>Sem páginas</strong>
                <Badge color={COLORS.textLight} small>Mínimo</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Não sabemos páginas → Mostrar tempo desde início
              </p>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">📅 A ler há 3 dias</span>
                <span className="text-xs text-gray-400">Há 2 dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alterações v3 */}
        <div className="mt-6 p-6 rounded-2xl bg-green-50">
          <h3 className="font-bold mb-3" style={{ color: COLORS.text }}>✅ Alterações v3</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>🔄</span>
              <span><strong>Removido badge "Meta cumprida"</strong> - O ✓ verde já indica isso</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📊</span>
              <span><strong>Progresso adaptável</strong> - 3 tipos baseados nos dados disponíveis</span>
            </li>
            <li className="flex items-start gap-2">
              <span>📅</span>
              <span><strong>Última leitura</strong> - Mostra "Hoje", "Ontem" ou "Há X dias"</span>
            </li>
            <li className="flex items-start gap-2">
              <span>⏱️</span>
              <span><strong>Tempo a ler</strong> - Alternativa quando não há páginas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
