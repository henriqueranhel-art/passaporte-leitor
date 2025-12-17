import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksApi, childrenApi } from '../lib/api';
import { useFamilyId } from '../lib/store';
import type { Book, Child } from '../lib/types';
import { Modal } from '../components/ui';

// ============================================================================
// DESIGN TOKENS & CONSTANTS
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  primaryLight: '#F5A623',
  primaryDark: '#D35400',
  secondary: '#3498DB',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  background: '#FDF6E3',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E8E0D5',
};

export const GENRES = {
  FANTASIA: { name: 'Fantasia', icon: '🏰', color: '#9B59B6' },
  AVENTURA: { name: 'Aventura', icon: '🗺️', color: '#E67E22' },
  ESPACO: { name: 'Espaço', icon: '🚀', color: '#2C3E50' },
  NATUREZA: { name: 'Natureza', icon: '🌲', color: '#27AE60' },
  MISTERIO: { name: 'Mistério', icon: '🔍', color: '#34495E' },
  OCEANO: { name: 'Oceano', icon: '🌊', color: '#3498DB' },
  HISTORIA: { name: 'História', icon: '📜', color: '#795548' },
  CIENCIA: { name: 'Ciência', icon: '🔬', color: '#00BCD4' },
} as const;

export const STATUS_CONFIG = {
  'reading': { label: 'A Ler', icon: '📖', color: COLORS.secondary, bgColor: `${COLORS.secondary}20` },
  'to-read': { label: 'Por Ler', icon: '📋', color: COLORS.textLight, bgColor: '#f3f4f6' },
  'finished': { label: 'Terminado', icon: '✅', color: COLORS.success, bgColor: `${COLORS.success}20` },
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type StatusFilter = 'all' | 'reading' | 'to-read' | 'finished';
type GenreFilter = 'all' | keyof typeof GENRES;
type ChildFilter = 'all' | string;
type SortBy = 'recent' | 'title' | 'rating' | 'progress';

interface FilterCounts {
  total: number;
  READING: number;
  TO_READ: number;
  FINISHED: number;
}

interface ChildSelectorProps {
  children: Child[];
  selectedId: string;
  onChange: (id: string) => void;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

interface FilterTabsProps {
  activeFilter: StatusFilter;
  onChange: (filter: StatusFilter) => void;
  counts: FilterCounts;
}

interface GenreFilterProps {
  activeGenre: GenreFilter;
  onChange: (genre: GenreFilter) => void;
}

interface SortDropdownProps {
  value: SortBy;
  onChange: (value: SortBy) => void;
}

interface CompactBookCardProps {
  book: Book;
  onClick: () => void;
  showChild: boolean;
  children?: Child[];
}

interface BookDetailModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

interface EmptyStateProps {
  filter: StatusFilter;
  isSearch: boolean;
}

// ============================================================================
// CHILD SELECTOR
// ============================================================================

const ChildSelector = ({ children, selectedId, onChange }: ChildSelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onChange('all')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${selectedId === 'all'
          ? 'bg-orange-100 shadow-sm scale-105'
          : 'bg-gray-100 opacity-70 hover:opacity-100'
          }`}
      >
        <span className="text-xl">👨‍👩‍👧‍👦</span>
        <span className={`text-sm font-medium ${selectedId === 'all' ? 'text-orange-700' : 'text-gray-600'}`}>
          Todos
        </span>
      </button>

      {children.map((child) => {
        const isSelected = selectedId === child.id;
        return (
          <button
            key={child.id}
            onClick={() => onChange(child.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${isSelected
              ? 'bg-orange-100 shadow-sm scale-105'
              : 'bg-gray-100 opacity-70 hover:opacity-100'
              }`}
          >
            <span className="text-xl">{child.avatar}</span>
            <span className={`text-sm font-medium ${isSelected ? 'text-orange-700' : 'text-gray-600'}`}>
              {child.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// SEARCH BAR
// ============================================================================

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Procurar livro ou autor..."
      className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm"
      style={{ color: COLORS.text }}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 text-xs"
      >
        ✕
      </button>
    )}
  </div>
);

// ============================================================================
// FILTER TABS
// ============================================================================

const FilterTabs = ({ activeFilter, onChange, counts }: FilterTabsProps) => {
  const filters = [
    { id: 'all' as const, label: 'Todos', icon: '📚' },
    { id: 'reading' as const, label: 'A Ler', icon: '📖' },
    { id: 'to-read' as const, label: 'Por Ler', icon: '📋' },
    { id: 'finished' as const, label: 'Terminados', icon: '✅' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        const count = filter.id === 'all' ? counts.total :
          filter.id === 'reading' ? counts.READING :
            filter.id === 'to-read' ? counts.TO_READ : counts.FINISHED;

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${isActive ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            style={{
              backgroundColor: isActive ? COLORS.primary : '#f3f4f6',
              color: isActive ? 'white' : COLORS.text,
            }}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// GENRE FILTER
// ============================================================================

const GenreFilter = ({ activeGenre, onChange }: GenreFilterProps) => {
  const genres = [
    { id: 'all' as const, name: 'Todos', icon: '🌍', color: COLORS.primary },
    ...Object.entries(GENRES).map(([id, g]) => ({ id: id as keyof typeof GENRES, ...g }))
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
      {genres.map((genre) => {
        const isActive = activeGenre === genre.id;

        return (
          <button
            key={genre.id}
            onClick={() => onChange(genre.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
            style={{
              backgroundColor: isActive ? `${genre.color}20` : '#f9fafb',
              color: genre.color,
              borderWidth: isActive ? 2 : 0,
              borderColor: genre.color,
            }}
          >
            <span>{genre.icon}</span>
            <span>{genre.name}</span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// SORT DROPDOWN
// ============================================================================

const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const options: { id: SortBy; label: string }[] = [
    { id: 'recent', label: 'Recentes' },
    { id: 'title', label: 'Título (A-Z)' },
    { id: 'rating', label: 'Avaliação' },
    { id: 'progress', label: 'Progresso' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortBy)}
      className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-orange-400"
      style={{ color: COLORS.text }}
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{opt.label}</option>
      ))}
    </select>
  );
};

// ============================================================================
// COMPACT BOOK CARD
// ============================================================================

const CompactBookCard = ({ book, onClick, showChild, children }: CompactBookCardProps) => {
  const genre = GENRES[book.genre as keyof typeof GENRES];
  const progress = book.totalPages && book.currentPage
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : null;

  const bookChild = showChild ? children?.find(c => c.id === book.childId) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-3 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-100 border"
      style={{ borderColor: COLORS.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${genre?.color}15` }}
        >
          {genre?.icon}
        </div>

        {book.status === 'reading' && progress !== null && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${genre?.color}15`, color: genre?.color }}
          >
            {progress}%
          </span>
        )}
        {book.status === 'finished' && book.rating && (
          <span className="text-xs">{'⭐'.repeat(Math.min(book.rating, 3))}</span>
        )}
        {book.status === 'to-read' && book.totalPages && (
          <span className="text-xs text-gray-400">{book.totalPages}p</span>
        )}
      </div>

      <h4
        className="font-semibold text-sm leading-tight line-clamp-2 mb-1"
        style={{ color: COLORS.text }}
      >
        {book.title}
      </h4>

      <p className="text-xs text-gray-400 truncate">{book.author}</p>

      {bookChild && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <span>{bookChild.avatar}</span>
          <span>{bookChild.name}</span>
        </div>
      )}

      {book.status === 'reading' && progress !== null && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: genre?.color }}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// BOOK DETAIL MODAL
// ============================================================================

const BookDetailModal = ({ book, isOpen, onClose }: BookDetailModalProps) => {
  if (!book) return null;

  const genre = GENRES[book.genre as keyof typeof GENRES];
  const status = STATUS_CONFIG[book.status];
  const progress = book.totalPages && book.currentPage
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Livro" variant="white">
      <div className="flex gap-4 mb-6">
        <div
          className="w-20 h-28 rounded-xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0"
          style={{ backgroundColor: `${genre?.color}20` }}
        >
          {genre?.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.text }}>
            {book.title}
          </h3>
          <p className="text-gray-500 mb-2">{book.author}</p>

          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: status.bgColor, color: status.color }}
            >
              {status.icon} {status.label}
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: `${genre?.color}20`, color: genre?.color }}
            >
              {genre?.icon} {genre?.name}
            </span>
          </div>
        </div>
      </div>

      {book.status === 'reading' && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: COLORS.text }}>Progresso</p>
          {progress !== null ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: genre?.color }}
                  />
                </div>
                <span className="font-bold" style={{ color: genre?.color }}>{progress}%</span>
              </div>
              <p className="text-sm text-gray-500">
                Página {book.currentPage} de {book.totalPages}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Página {book.currentPage || '?'}</p>
          )}
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {book.startDate && (
            <div>
              <p className="text-gray-500">Início</p>
              <p className="font-medium" style={{ color: COLORS.text }}>
                {new Date(book.startDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          {book.finishDate && (
            <div>
              <p className="text-gray-500">Fim</p>
              <p className="font-medium" style={{ color: COLORS.text }}>
                {new Date(book.finishDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          {book.totalPages && (
            <div>
              <p className="text-gray-500">Páginas</p>
              <p className="font-medium" style={{ color: COLORS.text }}>{book.totalPages}</p>
            </div>
          )}
        </div>
      </div>

      {book.status === 'finished' && book.rating && (
        <div className="bg-green-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: COLORS.text }}>Avaliação</p>

          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-2xl">
                {i < book.rating! ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          {book.favoriteCharacter && (
            <div className="mb-2">
              <p className="text-sm text-gray-500">Personagem favorita</p>
              <p className="font-medium" style={{ color: COLORS.text }}>{book.favoriteCharacter}</p>
            </div>
          )}

          {book.notes && (
            <div className="mb-2">
              <p className="text-sm text-gray-500">O que achei</p>
              <p className="text-sm" style={{ color: COLORS.text }}>"{book.notes}"</p>
            </div>
          )}

          {book.recommended !== undefined && (
            <div className="mt-3">
              <span className={`text-sm px-3 py-1 rounded-full ${book.recommended ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {book.recommended ? '👍 Recomendo a amigos!' : '👎 Não recomendo'}
              </span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ filter, isSearch }: EmptyStateProps) => {
  if (isSearch) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-4">🔍</span>
        <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text }}>
          Nenhum livro encontrado
        </h3>
        <p className="text-gray-500">Tenta outro título ou autor</p>
      </div>
    );
  }

  const messages = {
    all: { icon: '📚', title: 'Nenhum livro ainda', subtitle: 'Adiciona o teu primeiro livro!' },
    reading: { icon: '📖', title: 'Nenhum livro a ler', subtitle: 'Começa uma nova aventura!' },
    'to-read': { icon: '📋', title: 'Lista de leitura vazia', subtitle: 'Adiciona livros que queres ler.' },
    finished: { icon: '🏆', title: 'Ainda sem livros terminados', subtitle: 'Continua a ler para desbloquear!' },
  };

  const msg = messages[filter] || messages.all;

  return (
    <div className="text-center py-12">
      <span className="text-6xl block mb-4">{msg.icon}</span>
      <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>{msg.title}</h3>
      <p className="text-gray-500 mb-6">{msg.subtitle}</p>
    </div>
  );
};

// ============================================================================
// MAIN BOOKS PAGE
// ============================================================================

export default function BooksPage() {
  const familyId = useFamilyId();
  const [selectedChildId, setSelectedChildId] = useState<ChildFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: children = [] } = useQuery({
    queryKey: ['children', familyId],
    queryFn: () => childrenApi.getByFamily(familyId!),
    enabled: !!familyId,
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books', familyId, selectedChildId, statusFilter, genreFilter, search, sortBy],
    queryFn: () => booksApi.getByFamily(familyId!, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      genre: genreFilter !== 'all' ? genreFilter : undefined,
      childId: selectedChildId !== 'all' ? selectedChildId : undefined,
      search: search || undefined,
      sortBy,
    }),
    enabled: !!familyId,
  });

  const selectedChild = selectedChildId === 'all' ? null : children.find(c => c.id === selectedChildId);

  // Calculate counts for current filters
  const counts: FilterCounts = {
    total: books.length,
    READING: books.filter(b => b.status === 'reading').length,
    TO_READ: books.filter(b => b.status === 'to-read').length,
    FINISHED: books.filter(b => b.status === 'finished').length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="bg-white border-b sticky top-0 z-10" style={{ borderColor: COLORS.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{ color: COLORS.text }}>
              📚 Livros
            </h1>
          </div>

          {children.length > 1 && (
            <div className="mb-3">
              <ChildSelector
                children={children}
                selectedId={selectedChildId}
                onChange={setSelectedChildId}
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
            {selectedChild ? (
              <>
                <span className="text-lg">{selectedChild.avatar}</span>
                <span>{selectedChild.name}</span>
              </>
            ) : (
              <>
                <span className="text-lg">👨‍👩‍👧‍👦</span>
                <span>Todas as crianças</span>
              </>
            )}
            <span>•</span>
            <span>{counts.total} livros</span>
            <span>•</span>
            <span>{counts.FINISHED} terminados</span>
          </div>

          <div className="mb-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <FilterTabs
            activeFilter={statusFilter}
            onChange={setStatusFilter}
            counts={counts}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <span>🎯</span>
            <span>Filtrar por género</span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>

          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {showFilters && (
          <div className="mt-3">
            <GenreFilter activeGenre={genreFilter} onChange={setGenreFilter} />
          </div>
        )}
      </div>

      {search && (
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <p className="text-sm text-gray-500">
            {books.length} resultado{books.length !== 1 ? 's' : ''} para "<span className="font-medium">{search}</span>"
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-8">
        {books.length === 0 ? (
          <EmptyState filter={statusFilter} isSearch={!!search} />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {books.map((book) => (
              <CompactBookCard
                key={book.id}
                book={book}
                onClick={() => setSelectedBook(book)}
                showChild={selectedChildId === 'all'}
                children={children}
              />
            ))}
          </div>
        )}
      </div>

      <BookDetailModal
        book={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
