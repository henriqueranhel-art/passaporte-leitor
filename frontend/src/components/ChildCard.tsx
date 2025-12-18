import { useState } from 'react';
import { GENRES, type Child, type LevelCategory } from '../lib/types';
import { THEME_CONFIG } from '../lib/themeConfig';

// ============================================================================
// DESIGN TOKENS
// ==================================================== ========================

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


// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ProgressRing = ({ progress, size = 60, strokeWidth = 6, color = COLORS.primary }: { progress: number; size?: number; strokeWidth?: number; color?: string }) => {
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

const WeekCalendar = ({ sessions }: { sessions: Child['weeklyActivity'] }) => {
    return (
        <div className="flex justify-between gap-1">
            {sessions.map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-400 mb-1.5 font-medium">{day.day}</span>
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative ${day.status !== 'neutral' ? 'ring-2 ring-offset-2 ring-transparent' : '' // Simplified ring logic
                            }`}
                        style={{
                            backgroundColor: day.status === 'success'
                                ? COLORS.success
                                : day.status === 'fail'
                                    ? '#FEE2E2'
                                    : '#F3F4F6',
                            color: day.status === 'success'
                                ? 'white'
                                : day.status === 'fail'
                                    ? '#EF4444'
                                    : '#9CA3AF',
                        }}
                    >
                        {day.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

const BookProgressIndicator = ({ book }: { book: Child['currentBooks'][0] }) => {
    const genre = GENRES[book.genre as keyof typeof GENRES]; // Cast because genre might be string in derived types if not strictly matched
    // In our types.ts Child['currentBooks'] has type: 'page-progress' | 'page-only' | 'time-only'

    const progress = book.progress || 0;
    const lastReadText = book.daysReading === 0 ? 'Hoje' : book.daysReading === 1 ? 'Ontem' : `Há ${book.daysReading} dias`;

    if (book.type === 'page-progress') {
        return (
            <div className="mt-1.5">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%`, backgroundColor: genre?.color || COLORS.primary }}
                        />
                    </div>
                    <span className="text-xs font-bold" style={{ color: genre?.color || COLORS.primary }}>{progress}%</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">Pág. {book.currentPage} de {book.totalPages}</span>
                    <span className="text-xs text-gray-400">{lastReadText}</span>
                </div>
            </div>
        );
    }

    if (book.type === 'page-only') {
        return (
            <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        📄 Pág. {book.currentPage}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        📅 {book.daysReading} dias
                    </span>
                </div>
                <span className="text-xs text-gray-400">{lastReadText}</span>
            </div>
        );
    }

    // time-only
    return (
        <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                📅 A ler há {book.daysReading} dias
            </span>
            <span className="text-xs text-gray-400">{lastReadText}</span>
        </div>
    );
};

const CurrentBookMini = ({ book }: { book: Child['currentBooks'][0] }) => {
    // Safe genre access
    const genreKey = book.genre as keyof typeof GENRES;
    const genre = GENRES[genreKey];

    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
            {/* Icon */}
            <div
                className="w-11 h-14 rounded-lg flex items-center justify-center text-xl shadow-sm flex-shrink-0"
                style={{ backgroundColor: genre?.mapColor || '#eee' }}
            >
                {genre?.icon || '📚'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm truncate" style={{ color: COLORS.text }}>
                    {book.title}
                </h5>
                <p className="text-xs text-gray-500 truncate">{book.author}</p>

                {/* Progress */}
                <BookProgressIndicator book={book} />
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface ChildCardProps {
    child: Child;
    onAddBook: () => void;
    onLogReading: () => void;
    onViewDetails: () => void;
}

export function ChildCard({ child, onAddBook, onLogReading, onViewDetails }: ChildCardProps) {
    const [showAllBooks, setShowAllBooks] = useState(false);

    const levelCategory = (child.levelCategory || 'EXPLORERS') as LevelCategory;
    const theme = THEME_CONFIG[levelCategory];
    const levelProgress = child.level.progress;
    const dailyProgress = Math.min(
        Math.round((child.todayReading.minutes / child.todayReading.goal) * 100),
        100
    );

    const bookSlice = 1;
    const goalComplete = child.todayReading.minutes >= child.todayReading.goal;
    const hasCurrentBooks = child.currentBooks && child.currentBooks.length > 0;
    const displayedBooks = showAllBooks ? child.currentBooks : child.currentBooks?.slice(0, bookSlice);

    return (
        <div
            className="rounded-3xl border-2 overflow-hidden shadow-lg transition-all hover:border-orange-200"
            style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
        >
            {/* ================================================================== */}
            {/* THEMED HEADER */}
            {/* ================================================================== */}
            <div className="relative overflow-hidden" style={{ background: theme.gradient }}>
                {/* Background Elements */}
                <theme.BackgroundElements />

                {/* Content */}
                <div className="relative z-10 p-5 flex items-start gap-4">
                    <div className="relative">
                        <div
                            className="w-18 h-18 rounded-2xl flex items-center justify-center text-4xl shadow-lg bg-white/20 backdrop-blur-sm"
                            style={{ width: '72px', height: '72px' }}
                        >
                            {child.avatar}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-1 text-white">
                            {child.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/90" style={{ color: theme.badgeTextColor }}>
                                {child.level.icon} {child.level.name}
                            </span>
                            <span className="text-sm text-white/90">
                                {child.booksCount} livros
                            </span>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-white/70">Próximo: {child.level.nextLevel}</span>
                                <span className="text-white font-medium">Falta(m) {child.level.booksToNextLevel} livros</span>
                            </div>
                            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500 bg-white"
                                    style={{ width: `${levelProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex flex-col items-center px-3 py-2 rounded-xl min-w-[70px] bg-white/20 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-1">
                            <span className="text-2xl">{child.streak > 0 ? '🔥' : '💤'}</span>
                            <span
                                className="text-2xl font-bold text-white"
                            >
                                {child.streak}
                            </span>
                        </div>
                        <span className="text-xs text-white/70">
                            {child.streak === 1 ? 'dia' : 'dias'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ================================================================== */}
            {/* META DIÁRIA */}
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
                            {child.todayReading.minutes}
                        </span>
                        <span className="text-gray-500 text-sm">/ {child.todayReading.goal} min</span>
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
                <WeekCalendar sessions={child.weeklyActivity} />
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
                </div>

                {hasCurrentBooks ? (
                    <div className="space-y-2">
                        {displayedBooks.map((book) => (
                            <CurrentBookMini key={book.id} book={book} />
                        ))}

                        {child.currentBooks.length > bookSlice && !showAllBooks && (
                            <button
                                onClick={() => setShowAllBooks(true)}
                                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Ver mais {child.currentBooks.length - 1} livros...
                            </button>
                        )}

                        {showAllBooks && child.currentBooks.length > bookSlice && (
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
                            style={{ backgroundColor: GENRES[child.lastFinishedBook.genre]?.mapColor || '#eee' }}
                        >
                            {GENRES[child.lastFinishedBook.genre]?.icon || '📕'}
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
}
