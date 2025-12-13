// ============================================================================
// MAP PAGE
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { useSelectedChild } from '../lib/store';
import { statsApi } from '../lib/api';
import { Card } from '../components/ui';
import { GENRES } from '../lib/types';

export default function MapPage() {
  const selectedChild = useSelectedChild();


  const { data: stats } = useQuery({
    queryKey: ['childStats', selectedChild?.id],
    queryFn: () => statsApi.getChildStats(selectedChild!.id),
    enabled: !!selectedChild,
  });

  const genreStats = stats?.genres.stats || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">🗺️ Mapa do Explorador</h1>
        <p className="text-gray-500">
          Cada livro lido revela novos territórios no mapa!
        </p>
      </div>

      {/* Map Visualization */}
      <Card className="mb-6 p-0 overflow-hidden">
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            height: '400px',
            background: 'linear-gradient(135deg, #E8F4F8 0%, #F5E6D3 50%, #E8F4E8 100%)',
          }}
        >
          {/* Compass */}
          <div className="absolute top-4 right-4 text-4xl opacity-50">🧭</div>

          {/* Title */}
          <div className="absolute top-4 left-4 bg-white/80 rounded-lg px-4 py-2">
            <h3 className="font-bold text-sm text-gray-800">🗺️ Mapa do Explorador</h3>
            <p className="text-xs text-gray-500">
              {selectedChild?.name} • {stats?.books.total || 0} territórios
            </p>
          </div>

          {/* Territories Grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-4 gap-4 p-8">
              {genreStats.map((genre) => (
                <div
                  key={genre.genre}
                  className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${genre.discovered ? 'shadow-lg' : 'opacity-40'
                    }`}
                  style={{
                    backgroundColor: genre.discovered ? genre.color + '30' : '#e5e7eb',
                    border: `2px ${genre.discovered ? 'solid' : 'dashed'} ${genre.discovered ? genre.color : '#ccc'
                      }`,
                  }}
                >
                  <span className="text-2xl">{genre.discovered ? genre.icon : '❓'}</span>
                  <span className="text-xs font-medium text-gray-800 mt-1">
                    {genre.discovered ? genre.name : '???'}
                  </span>
                  {genre.discovered && (
                    <span className="text-xs text-gray-500">{genre.count} livros</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Genre Legend */}
      <div className="grid grid-cols-4 gap-4">
        {(Object.keys(GENRES) as (keyof typeof GENRES)[]).map((genreKey) => {
          const genre = GENRES[genreKey];
          const stat = genreStats.find((g) => g.genre === genreKey);
          const count = stat?.count || 0;
          const discovered = count > 0;

          return (
            <Card
              key={genreKey}
              className={`text-center ${!discovered ? 'opacity-50' : ''}`}
            >
              <span className="text-3xl mb-2 block">{genre.icon}</span>
              <h4 className="font-bold text-sm text-gray-800">{genre.name}</h4>
              <p className="text-xs text-gray-500">{genre.theme}</p>
              <p
                className="text-lg font-bold mt-2"
                style={{ color: discovered ? genre.color : '#ccc' }}
              >
                {count} livros
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
