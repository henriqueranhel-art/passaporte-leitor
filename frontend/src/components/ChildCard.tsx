import { GENRES, type Genre } from '../lib/types';


const COLORS = {
    primary: '#E67E22', // Laranja
    secondary: '#3498DB', // Azul
    success: '#27AE60', // Verde
    warning: '#F39C12', // Amarelo
    danger: '#E74C3C', // Vermelho
    background: '#FDFBF7', // Bege claro
    text: '#2C3E50', // Azul escuro
    textLight: '#7F8C8D', // Cinza
    border: '#E0E0E0',
};

export interface ChildCardProps {
    child: {
        id: string;
        name: string;
        avatar: string;
        level: {
            name: string;
            color: string;
            icon: string;
            nextLevel?: string;
            booksToNextLevel?: number;
            progress: number;
        };
        booksCount: number;
        streak: number;
        todayReading: {
            minutes: number;
            goal: number;
        };
        weeklyActivity: {
            day: string;
            status: 'success' | 'fail' | 'neutral';
            label: string;
        }[];
        currentBooks: {
            id: string;
            title: string;
            author: string;
            cover?: string;
            progress?: number;
            totalPages?: number;
            currentPage?: number;
            startDate?: string;
            daysReading?: number;
            type: 'page-progress' | 'page-only' | 'time-only';
        }[];
        lastFinishedBook?: {
            title: string;
            author: string;
            genre: Genre;
            rating: number;
            finishedAt: string;
        } | null;
    };
    onAddBook: () => void;
    onLogReading: () => void;
    onViewDetails: () => void;
}

export function ChildCard({ child, onAddBook, onLogReading, onViewDetails }: ChildCardProps) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border-2 border-slate-100 hover:border-orange-200 transition-all duration-300">
            {/* ================================================================== */}
            {/* HEADER - Identidade e Nível */}
            {/* ================================================================== */}
            <div className="p-5 pb-0">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
                            style={{ backgroundColor: child.level.color + '40' }} // 40% opacity
                        >
                            {child.avatar}
                        </div>

                        {/* Info */}
                        <div>
                            <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>{child.name}</h3>

                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className="px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <span>{child.level.icon}</span>
                                    <span>{child.level.name}</span>
                                </span>
                                <span className="text-sm text-gray-400 font-medium">
                                    {child.booksCount} livros
                                </span>
                            </div>

                            {/* Barra de Progresso Mini */}
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${child.level.progress}%`,
                                            backgroundColor: COLORS.primary
                                        }}
                                    />
                                </div>
                                {child.level.nextLevel ? (
                                    <span className="text-orange-400 font-medium">
                                        Próximo: {child.level.icon} {child.level.nextLevel} <span className="text-gray-300 mx-1">•</span> {child.level.booksToNextLevel} livros
                                    </span>
                                ) : (
                                    <span className="text-orange-400 font-medium">Nível Máximo!</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Streak Flame */}
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-orange-50 border border-orange-100">
                        <div className="flex items-center gap-1">
                            <span className="text-2xl">🔥</span>
                            <span className="text-xl font-bold text-orange-600">{child.streak}</span>
                        </div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">dias</span>
                    </div>
                </div>
            </div>

            <div className="my-5 mx-5 h-px bg-slate-50" />

            {/* ================================================================== */}
            {/* LEITURA DE HOJE - Ação Principal */}
            {/* ================================================================== */}
            <div className="px-5 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all ${child.todayReading.minutes >= child.todayReading.goal
                                ? 'border-green-500 text-green-500'
                                : 'border-gray-200 text-gray-300'
                                }`}
                        >
                            <span className="text-xl">
                                {child.todayReading.minutes >= child.todayReading.goal ? '✓' : ''}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Leitura de Hoje</p>
                            <p className="text-sm">
                                <span className={`text-xl font-bold ${child.todayReading.minutes > 0 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {child.todayReading.minutes}
                                </span>
                                <span className="text-gray-400"> / {child.todayReading.goal} min</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onLogReading}
                        className="px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                        style={{ backgroundColor: COLORS.success }}
                    >
                        <span>📝</span>
                        <span>Registar</span>
                    </button>
                </div>
            </div>

            {/* ================================================================== */}
            {/* CALENDÁRIO SEMANAL */}
            {/* ================================================================== */}
            <div className="px-5 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: COLORS.text }}>
                        <span>📅</span>
                        <span>Esta Semana</span>
                    </h4>
                    <div className="flex gap-3 text-[10px] uppercase font-bold text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Leu</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-100" />
                            <span>Não leu</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between gap-1">
                    {child.weeklyActivity.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400 mb-1">{day.day}</span>
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${day.status === 'success'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : day.status === 'fail'
                                        ? 'bg-red-50 text-red-300'
                                        : 'bg-gray-50 text-gray-300'
                                    }`}
                            >
                                {day.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-2 bg-slate-50 border-t border-b border-slate-100 mb-5" />

            {/* ================================================================== */}
            {/* A LER AGORA - Livros ativos */}
            {/* ================================================================== */}
            {child.currentBooks.length > 0 && (
                <div className="px-5 mb-5 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: COLORS.text }}>
                            <span>📖</span>
                            <span>A Ler ({child.currentBooks.length})</span>
                        </h4>
                        <button
                            onClick={onAddBook}
                            className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            + Novo livro
                        </button>
                    </div>

                    {child.currentBooks.map(book => (
                        <div key={book.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors group">
                            <div className="flex gap-3 mb-3">
                                <div className="w-10 h-14 rounded bg-purple-100 flex items-center justify-center text-xl shadow-sm">
                                    🏰
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-sm text-gray-800 truncate leading-tight mb-0.5">
                                        {book.title}
                                    </h5>
                                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                                </div>
                            </div>

                            {/* Progress Type 1: Page Progress */}
                            {book.type === 'page-progress' && book.progress !== undefined && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-purple-500 transition-all duration-1000"
                                                style={{ width: `${book.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-purple-600">{book.progress}%</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                        <span>Pág. {book.currentPage} de {book.totalPages}</span>
                                        <span>Há {book.daysReading} dias</span>
                                    </div>
                                </div>
                            )}

                            {/* Progress Type 2: Page Only */}
                            {book.type === 'page-only' && (
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 flex items-center gap-1 shadow-sm">
                                            📄 Pág. {book.currentPage}
                                        </span>
                                        <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 flex items-center gap-1 shadow-sm">
                                            📅 {book.daysReading} dias
                                        </span>
                                    </div>
                                    <span className="text-gray-400 text-[10px]">Ontem</span>
                                </div>
                            )}

                            {/* Progress Type 3: Time Only */}
                            {book.type === 'time-only' && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-600 flex items-center gap-1 shadow-sm">
                                        📅 A ler há {book.daysReading} dias
                                    </span>
                                    <span className="text-gray-400 text-[10px]">Há 2 dias</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {child.currentBooks.length > 2 && (
                        <button className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Ver mais {child.currentBooks.length - 2} livros...
                        </button>
                    )}
                </div>
            )}

            {/* ================================================================== */}
            {/* ÚLTIMO TERMINADO */}
            {/* ================================================================== */}
            {child.lastFinishedBook && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">✅</span>
                        <span className="font-bold text-sm" style={{ color: COLORS.text }}>Último Terminado</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100/50">
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
                                {new Date(child.lastFinishedBook.finishedAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================== */}
            {/* FOOTER */}
            {/* ================================================================== */}
            <div className="px-5 py-4 border-t border-slate-100">
                <div className="flex gap-3">
                    <button
                        onClick={onAddBook}
                        className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-98"
                        style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                    >
                        <span>📖</span>
                        <span>Adicionar</span>
                    </button>
                    <button
                        onClick={onViewDetails}
                        className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white hover:brightness-110 shadow-sm hover:shadow-md transition-all active:scale-98"
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
