import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelectedChild, useFamilyId } from '../lib/store';
import { booksApi } from '../lib/api';
import { Card, EmptyState, Badge } from '../components/ui';
import { GENRES, type Genre } from '../lib/types';

export default function BooksPage() {
  const selectedChild = useSelectedChild();
  const familyId = useFamilyId();
  const [filter, setFilter] = useState<Genre | 'all'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['books', selectedChild?.id, filter],
    queryFn: () =>
      selectedChild
        ? booksApi.getByChild(selectedChild.id, {
          genre: filter === 'all' ? undefined : filter,
        })
        : booksApi.getByFamily(familyId!, {
          genre: filter === 'all' ? undefined : filter,
        }),
    enabled: !!familyId,
  });

  const books = data?.books || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">📚 Biblioteca</h1>
          <p className="text-gray-500">Todos os livros lidos.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-primary/10 text-primary' : 'bg-gray-100'
            }`}
        >
          Todos ({data?.total || 0})
        </button>
        {(Object.keys(GENRES) as Genre[]).map((genre) => {
          const genreData = GENRES[genre];

          if (filter !== 'all' && filter !== genre) return null;

          return (
            <button
              key={genre}
              onClick={() => setFilter(genre)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1 ${filter === genre ? 'text-white' : 'bg-gray-100'
                }`}
              style={{
                backgroundColor: filter === genre ? genreData.color : undefined,
              }}
            >
              {genreData.icon} {genreData.name}
            </button>
          );
        })}
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100"
          >
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Book List */}
      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce">📚</div>
            <p className="text-gray-500 mt-2">A carregar livros...</p>
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Ainda não há livros registados"
            description="Adiciona o primeiro livro!"
          />
        ) : (
          <div className="space-y-3">
            {books.map((book) => {
              const genre = GENRES[book.genre];
              const ratingEmoji =
                book.rating === 3 ? '😍' : book.rating === 2 ? '🙂' : book.rating === 1 ? '😐' : null;

              return (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl shadow-sm"
                    style={{ backgroundColor: genre?.mapColor }}
                  >
                    {genre?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate text-gray-800">{book.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={genre?.color}>{genre?.name}</Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(book.dateRead).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                  {ratingEmoji && <span className="text-2xl">{ratingEmoji}</span>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
