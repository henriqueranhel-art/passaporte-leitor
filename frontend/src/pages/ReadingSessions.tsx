import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingLogsApi, childrenApi } from '../lib/api';
import { useFamilyId } from '../lib/store';
import { Modal, Button } from '../components/ui';
import { COLORS, MOODS, MoodSelector, MinutesInput } from '../components/reading';

// ============================================================================
// TYPES
// ============================================================================

interface Session {
    id: string;
    childId: string;
    childName: string;
    childAvatar: string;
    bookName: string;
    bookAuthor: string;
    bookCover: string;
    date: string;
    minutes: number;
    mood: number | null;
    pagesRead: number;
}

interface Child {
    id: string;
    name: string;
    avatar: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Hoje';
    if (dateStr === yesterdayStr) return 'Ontem';

    return date.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
};

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

interface FilterBarProps {
    children: Child[];
    selectedChild: string;
    onChildChange: (id: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const FilterBar = ({
    children,
    selectedChild,
    onChildChange,
    searchQuery,
    onSearchChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
    hasActiveFilters,
}: FilterBarProps) => {
    const [showDateFilters, setShowDateFilters] = useState(false);

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            {/* Search bar */}
            <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Pesquisar livro ou autor..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Child filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                <button
                    onClick={() => onChildChange('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedChild
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Todas
                </button>
                {children.map((child) => (
                    <button
                        key={child.id}
                        onClick={() => onChildChange(child.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${selectedChild === child.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <span>{child.avatar}</span>
                        <span>{child.name}</span>
                    </button>
                ))}
            </div>

            {/* Date filter toggle */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowDateFilters(!showDateFilters)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${(dateFrom || dateTo) ? 'text-orange-500' : 'text-gray-500'
                        }`}
                >
                    <span>📅</span>
                    <span>Filtrar por data</span>
                    <span className={`transition-transform ${showDateFilters ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Date range inputs */}
            {showDateFilters && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">De</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            max={dateTo || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Até</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            min={dateFrom}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// SESSION CARD COMPONENT
// ============================================================================

interface SessionCardProps {
    session: Session;
    onEdit: (session: Session) => void;
    onDelete: (session: Session) => void;
}

const SessionCard = ({ session, onEdit, onDelete }: SessionCardProps) => {
    const mood = MOODS.find(m => m.value === session.mood);

    return (
        <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            {/* Child avatar */}
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                {session.childAvatar}
            </div>

            {/* Session info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm truncate">
                        {session.childName}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm">{session.bookCover}</span>
                    <span className="text-xs text-gray-600 truncate">{session.bookName}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center">
                    <p className="text-sm font-bold text-orange-500">{session.minutes}m</p>
                </div>
                <div className="text-lg" title={mood?.label}>
                    {mood?.emoji}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={() => onEdit(session)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
                    title="Editar"
                >
                    ✏️
                </button>
                <button
                    onClick={() => onDelete(session)}
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-sm transition-colors"
                    title="Remover"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// SESSION LIST (Grouped by date)
// ============================================================================

interface SessionListProps {
    sessions: Session[];
    onEdit: (session: Session) => void;
    onDelete: (session: Session) => void;
}

const SessionList = ({ sessions, onEdit, onDelete }: SessionListProps) => {
    // Group sessions by date
    const groupedSessions = useMemo(() => {
        const groups: Record<string, Session[]> = {};
        sessions.forEach(session => {
            if (!groups[session.date]) {
                groups[session.date] = [];
            }
            groups[session.date].push(session);
        });
        return groups;
    }, [sessions]);

    const sortedDates = Object.keys(groupedSessions).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    if (sessions.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center">
                <span className="text-4xl block mb-3">📚</span>
                <p className="text-gray-500">Nenhuma leitura encontrada</p>
                <p className="text-sm text-gray-400 mt-1">Tenta ajustar os filtros</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedDates.map(date => (
                <div key={date}>
                    {/* Date header */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                            {formatDate(date)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">
                            {groupedSessions[date].length} {groupedSessions[date].length === 1 ? 'sessão' : 'sessões'}
                        </span>
                    </div>

                    {/* Sessions for this date */}
                    <div className="space-y-2">
                        {groupedSessions[date].map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm mt-4">
            <div className="flex items-center justify-between">
                {/* Info */}
                <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{startItem}-{endItem}</span> de <span className="font-medium text-gray-700">{totalItems}</span> leituras
                </p>

                {/* Page buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${currentPage === 1
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        ←
                    </button>

                    {getPageNumbers().map((page, i) => (
                        <button
                            key={i}
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                            disabled={page === '...'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${page === currentPage
                                ? 'bg-orange-500 text-white'
                                : page === '...'
                                    ? 'text-gray-400 cursor-default'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// EDIT MODAL
// ============================================================================

interface EditModalProps {
    session: Session | null;
    onSave: (session: Session) => void;
    onClose: () => void;
}

const EditModal = ({ session, onSave, onClose }: EditModalProps) => {
    const [minutes, setMinutes] = useState(15);
    const [mood, setMood] = useState(3);
    const [date, setDate] = useState('');

    // Sync form values when session changes
    useEffect(() => {
        if (session) {
            setMinutes(session.minutes);
            setMood(session.mood || 3);
            setDate(session.date);
        }
    }, [session]);

    if (!session) return null;

    const handleSave = () => {
        onSave({ ...session, date, minutes, mood });
    };

    return (
        <Modal isOpen={!!session} onClose={onClose} title="✏️ Editar Leitura" variant="white">
            {/* Session info */}
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 mb-4">
                <span className="text-2xl">{session.childAvatar}</span>
                <div>
                    <p className="font-medium text-gray-800">{session.childName}</p>
                    <p className="text-sm text-gray-500">{session.bookName}</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                {/* Date */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">📅 Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none"
                    />
                </div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">⏱️ Minutos</label>
                {/* Minutes */}
                <MinutesInput
                    value={minutes}
                    onChange={setMinutes}
                    min={5}
                    max={120}
                    step={5}
                />

                {/* Mood */}
                <div>
                    <MoodSelector value={mood} onChange={setMood} />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                    Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1">
                    Guardar
                </Button>
            </div>
        </Modal>
    );
};

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

interface DeleteModalProps {
    session: Session | null;
    onConfirm: (id: string) => void;
    onClose: () => void;
}

const DeleteModal = ({ session, onConfirm, onClose }: DeleteModalProps) => {
    if (!session) return null;

    return (
        <Modal isOpen={!!session} onClose={onClose} title="" variant="white">
            {/* Icon */}
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl mx-auto mb-4">
                    🗑️
                </div>
                <h2 className="font-bold text-gray-800 text-lg mb-2">Remover leitura?</h2>
                <p className="text-gray-500 text-sm mb-4">
                    Tens a certeza que queres remover esta sessão de leitura?
                </p>
            </div>

            {/* Session info */}
            <div className="p-3 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-xl">{session.childAvatar}</span>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm">{session.childName}</p>
                        <p className="text-xs text-gray-500 truncate">{session.bookName}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-orange-500">{session.minutes}m</p>
                        <p className="text-xs text-gray-400">{formatDate(session.date)}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                    Cancelar
                </Button>
                <Button variant="danger" onClick={() => onConfirm(session.id)} className="flex-1">
                    Remover
                </Button>
            </div>
        </Modal>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ReadingSessions() {
    const familyId = useFamilyId();
    const queryClient = useQueryClient();

    // Filter state
    const [selectedChild, setSelectedChild] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Modal state
    const [editSession, setEditSession] = useState<Session | null>(null);
    const [deleteSession, setDeleteSession] = useState<Session | null>(null);

    // Build filters object
    const filters = useMemo(() => ({
        ...(selectedChild && { childId: selectedChild }),
        ...(searchQuery && { search: searchQuery }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        page: currentPage,
        limit: itemsPerPage,
    }), [selectedChild, searchQuery, dateFrom, dateTo, currentPage]);

    // Fetch children
    const { data: children = [] } = useQuery({
        queryKey: ['children', familyId],
        queryFn: () => childrenApi.getByFamily(familyId!),
        enabled: !!familyId,
    });

    // Fetch sessions with pagination
    const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
        queryKey: ['reading-sessions', familyId, filters],
        queryFn: () => readingLogsApi.getByFamily(familyId!, filters),
        enabled: !!familyId,
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['reading-sessions-stats', familyId, { selectedChild, searchQuery, dateFrom, dateTo }],
        queryFn: () => readingLogsApi.getStats(familyId!, {
            ...(selectedChild && { childId: selectedChild }),
            ...(searchQuery && { search: searchQuery }),
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
        }),
        enabled: !!familyId,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            readingLogsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-sessions'] });
            queryClient.invalidateQueries({ queryKey: ['reading-sessions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['children', familyId] });
            queryClient.invalidateQueries({ queryKey: ['familyStats'] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => readingLogsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reading-sessions'] });
            queryClient.invalidateQueries({ queryKey: ['reading-sessions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['children', familyId] });
            queryClient.invalidateQueries({ queryKey: ['familyStats'] });
        },
    });

    const sessions = sessionsData?.sessions || [];
    const totalPages = sessionsData?.totalPages || 1;
    const totalItems = sessionsData?.total || 0;

    // Reset to first page when filters change
    const handleFilterChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
        setter(value);
        setCurrentPage(1);
    };

    const hasActiveFilters = !!selectedChild || !!searchQuery || !!dateFrom || !!dateTo;

    const clearFilters = () => {
        setSelectedChild('');
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    // Handlers
    const handleEdit = (session: Session) => setEditSession(session);
    const handleDelete = (session: Session) => setDeleteSession(session);

    const handleSaveEdit = (updatedSession: Session) => {
        updateMutation.mutate({
            id: updatedSession.id,
            data: {
                minutes: updatedSession.minutes,
                mood: updatedSession.mood,
                date: updatedSession.date,
            }
        });
        setEditSession(null);
    };

    const handleConfirmDelete = (sessionId: string) => {
        deleteMutation.mutate(sessionId);
        setDeleteSession(null);
    };

    // Loading state
    if (sessionsLoading && !sessions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500">A carregar sessões...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-800">📚 Leituras</h1>
                </div>

                {/* Filters */}
                <FilterBar
                    children={children}
                    selectedChild={selectedChild}
                    onChildChange={handleFilterChange(setSelectedChild)}
                    searchQuery={searchQuery}
                    onSearchChange={handleFilterChange(setSearchQuery)}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={handleFilterChange(setDateFrom)}
                    onDateToChange={handleFilterChange(setDateTo)}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Stats (for filtered results) */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                            <p className="text-2xl font-bold text-orange-500">{stats.totalSessions}</p>
                            <p className="text-xs text-gray-500">Sessões</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                            <p className="text-2xl font-bold text-blue-500">{stats.totalMinutes}m</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                            <p className="text-2xl font-bold text-green-500">{stats.avgMinutes}m</p>
                            <p className="text-xs text-gray-500">Média</p>
                        </div>
                    </div>
                )}

                {/* Session list */}
                <SessionList
                    sessions={sessions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Modals */}
            <EditModal
                session={editSession}
                onSave={handleSaveEdit}
                onClose={() => setEditSession(null)}
            />

            <DeleteModal
                session={deleteSession}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteSession(null)}
            />
        </div>
    );
}
