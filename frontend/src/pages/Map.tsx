import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFamilyId } from '../lib/store';
import { mapApi } from '../lib/api';
import { ChildSelector } from '../components/ChildSelector';

// ============================================================================
// TYPES
// ============================================================================

interface LevelInfo {
  rank: number;
  name: string;
  minBooks: number;
  icon: string;
  color: string;
}

interface ChildData {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  todayMinutes: number;
  dailyGoal: number;
  totalReadingDays: number;
  streak: number;
  totalHours: number;
  levelCategory: string;
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
}

interface MapResponse {
  family: {
    id: string;
    name: string;
  };
  children: ChildData[];
  aggregated: ChildData & { levelCategory: string };
}

// ============================================================================
// DESIGN TOKENS & CONFIG
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  secondary: '#3498DB',
  success: '#27AE60',
  background: '#FDF6E3',
  text: '#2C3E50',
};

// Visualization limits based on progression milestones
const MAX_FISH_COUNT = 50;  // Number of books in the last level
const MAX_STARS_COUNT = 80; // Cap for star visualization

// ============================================================================
// SHARED INTERFACES
// ============================================================================

interface MapVisualizationProps {
  rank?: number;
  todayMinutes?: number;
  dailyGoal?: number;
  totalReadingDays?: number;
  streak?: number;
  totalHours?: number;
  childName?: string | null;
  isFamily?: boolean;
  currentLevel?: LevelInfo;
}



// ============================================================================
// STATS PANEL (shared component) - BELOW THE MAP
// ============================================================================

const StatsPanel = ({
  todayMinutes,
  dailyGoal,
  totalReadingDays,
  streak,
  totalHours,
  childName,
  variant = 'aquarium' as 'aquarium' | 'constellation'
}: {
  todayMinutes: number;
  dailyGoal: number;
  totalReadingDays: number;
  streak: number;
  totalHours: number;
  childName?: string | null;
  variant?: 'aquarium' | 'constellation';
}) => {
  const goalMet = todayMinutes >= dailyGoal;
  const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);

  const bgColor = variant === 'aquarium' ? 'bg-slate-800' : 'bg-indigo-900';
  const textColors = variant === 'aquarium'
    ? { primary: 'text-cyan-400', secondary: 'text-teal-400', tertiary: 'text-purple-400', quaternary: 'text-amber-400', label: 'text-slate-300' }
    : { primary: 'text-yellow-400', secondary: 'text-blue-400', tertiary: 'text-purple-400', quaternary: 'text-pink-400', label: 'text-indigo-200' };

  return (
    <div className={`${bgColor} rounded-xl p-4 mt-3`}>
      {/* Child name if showing individual */}
      {childName && (
        <p className={`text-sm ${textColors.primary} mb-3 text-center font-medium`}>
          {childName}
        </p>
      )}

      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <div className={`text-2xl font-bold ${textColors.primary}`}>
            {todayMinutes}
          </div>
          <div className={`text-xs ${textColors.label}`}>min hoje</div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${goalProgress}%`,
                backgroundColor: goalMet ? '#10B981' : '#3B82F6',
              }}
            />
          </div>
          <div className={`text-xs mt-1 ${goalMet ? 'text-green-400' : textColors.label}`}>
            {goalMet ? '✓ Meta!' : `Meta: ${dailyGoal}min`}
          </div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${textColors.secondary}`}>
            {totalReadingDays}
          </div>
          <div className={`text-xs ${textColors.label}`}>dias de</div>
          <div className={`text-xs ${textColors.label}`}>leitura</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${textColors.tertiary}`}>
            {streak}
          </div>
          <div className={`text-xs ${textColors.label}`}>dias</div>
          <div className={`text-xs ${textColors.label}`}>seguidos 🔥</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${textColors.quaternary}`}>
            {totalHours}h
          </div>
          <div className={`text-xs ${textColors.label}`}>tempo</div>
          <div className={`text-xs ${textColors.label}`}>total</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// AQUÁRIO VIVO 🐠
// ============================================================================

const LivingAquarium = ({
  rank = 3,
  todayMinutes = 18,
  dailyGoal = 15,
  totalReadingDays = 45,
  streak = 7,
  totalHours = 32,
  childName = null,
  currentLevel,
}: MapVisualizationProps) => {
  // Fallback level if not provided
  const level = currentLevel || { rank: 1, name: 'Iniciante', minBooks: 0, icon: '🐣', color: '#BDC3C7' };
  const goalMet = todayMinutes >= dailyGoal;

  // Peixes baseados em dias totais de leitura
  const fish = [];
  const fishTypes = ['🐟', '🐠', '🐡'];
  for (let i = 0; i < Math.min(totalReadingDays, MAX_FISH_COUNT); i++) {
    fish.push({
      type: fishTypes[i % 3],
      x: Math.random() * 80 + 10,
      y: Math.random() * 50 + 15,
      speed: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      size: 0.8 + Math.random() * 0.4,
    });
  }

  // Espécies especiais baseadas no rank
  const specialByRank = [
    [], // rank 1
    ['🦐'], // rank 2
    ['🦐', '🦀'], // rank 3
    ['🦐', '🦀', '🐙'], // rank 4
    ['🦐', '🦀', '🐙', '🐬'], // rank 5
    ['🦐', '🦀', '🐙', '🐬', '🐳', '🧜‍♀️'], // rank 6
  ];
  const specialFish = specialByRank[rank - 1] || [];

  // Claridade da água baseada no streak
  const waterClarity = Math.min(streak * 8 + 40, 100);

  // Coral cresce com dias totais
  const coralCount = Math.min(Math.floor(totalReadingDays / 10) + 1, 8);

  // Tesouros baseados no streak
  const treasures = [];
  if (streak >= 3) treasures.push({ emoji: '💎', x: 15, y: 85 });
  if (streak >= 7) treasures.push({ emoji: '🏆', x: 75, y: 88 });
  if (streak >= 14) treasures.push({ emoji: '👑', x: 45, y: 82 });

  return (
    <div>
      {/* Map */}
      <div
        className="relative w-full h-72 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, 
            rgba(0,80,120,${1 - waterClarity / 150}) 0%, 
            rgba(0,120,180,${waterClarity / 100}) 40%, 
            rgba(0,60,100,1) 100%)`
        }}
      >
        {/* Indicador de meta diária (Sol/Lua no topo) */}
        <div className="absolute top-3 right-4">
          {goalMet ? (
            <div className="relative">
              <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,0,0.8))' }}>
                ☀️
              </span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                ✓ Meta!
              </div>
            </div>
          ) : (
            <div className="relative">
              <span className="text-4xl opacity-60">🌙</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                {dailyGoal - todayMinutes}min
              </div>
            </div>
          )}
        </div>

        {/* Rank badge */}
        <div className="absolute top-3 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
          <span className="text-2xl">{level.icon}</span>
          <div>
            <p className="text-xs text-white/80">Rank {rank}</p>
            <p className="text-sm font-bold text-white">{level.name}</p>
          </div>
        </div>

        {/* Bolhas (mais se meta cumprida) */}
        {[...Array(goalMet ? 15 : 8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${Math.random() * 100}%`,
              bottom: '0',
              animation: `bubble ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Raios de luz (mais se meta cumprida) */}
        {goalMet && (
          <div className="absolute inset-0 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 w-8 h-full"
                style={{
                  left: `${10 + i * 16}%`,
                  background: 'linear-gradient(180deg, rgba(255,255,200,0.6), transparent)',
                  transform: `rotate(${-5 + i * 2}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Coral (cresce com dias totais) */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-around px-4">
          {[...Array(coralCount)].map((_, i) => (
            <div
              key={i}
              className="text-2xl"
              style={{
                animation: `sway ${2 + i * 0.3}s ease-in-out infinite`,
              }}
            >
              {['🪸', '🌿', '🪨', '🌊'][i % 4]}
            </div>
          ))}
        </div>

        {/* Areia */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-300 to-amber-200" />

        {/* Tesouros (baseados no streak) */}
        {treasures.map((t, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{ left: `${t.x}%`, top: `${t.y}%`, animation: 'sparkle 2s ease-in-out infinite' }}
          >
            {t.emoji}
          </div>
        ))}

        {/* Peixes normais (dias totais de leitura) */}
        {fish.map((f, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: `${f.size * 1.2}rem`,
              animation: `swim ${f.speed}s ease-in-out infinite`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.type}
          </div>
        ))}

        {/* Espécies especiais (baseadas no rank) */}
        {specialFish.map((species, i) => (
          <div
            key={i}
            className="absolute text-3xl"
            style={{
              left: `${15 + i * 18}%`,
              top: `${30 + (i % 2) * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))',
            }}
          >
            {species}
          </div>
        ))}

        {/* Mergulhador (aparece se leu hoje) */}
        {todayMinutes > 0 && (
          <div
            className="absolute text-3xl"
            style={{
              right: '8%',
              top: '30%',
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            🤿
          </div>
        )}

        {/* Streak indicator */}
        {streak > 0 && (
          <div className="absolute top-16 left-4 flex items-center gap-1 bg-cyan-500/30 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-white">{streak} dias</span>
          </div>
        )}

        <style>{`
          @keyframes bubble {
            0% { transform: translateY(0) scale(1); opacity: 0.6; }
            100% { transform: translateY(-300px) scale(0.5); opacity: 0; }
          }
          @keyframes swim {
            0%, 100% { transform: translateX(0) scaleX(1); }
            49% { transform: translateX(30px) scaleX(1); }
            50% { transform: translateX(30px) scaleX(-1); }
            99% { transform: translateX(0) scaleX(-1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes sway {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </div>

      {/* Stats Panel - BELOW the map */}
      <StatsPanel
        todayMinutes={todayMinutes}
        dailyGoal={dailyGoal}
        totalReadingDays={totalReadingDays}
        streak={streak}
        totalHours={totalHours}
        childName={childName}
        variant="aquarium"
      />
    </div>
  );
};

// ============================================================================
// CÉU ESTRELADO ⭐
// ============================================================================

const ConstellationMap = ({
  rank = 3,
  todayMinutes = 18,
  dailyGoal = 15,
  totalReadingDays = 45,
  streak = 7,
  totalHours = 32,
  childName = null,
  currentLevel,
}: MapVisualizationProps) => {
  // Fallback level if not provided
  const level = currentLevel || { rank: 1, name: 'Iniciante', minBooks: 0, icon: '⭐', color: '#BDC3C7' };
  const goalMet = todayMinutes >= dailyGoal;

  // Estrelas baseadas em dias totais de leitura
  const stars = [];
  for (let i = 0; i < Math.min(totalReadingDays, MAX_STARS_COUNT); i++) {
    stars.push({
      x: 5 + Math.random() * 90,
      y: 8 + Math.random() * 60,
      size: 0.3 + Math.random() * 0.8,
      delay: Math.random() * 2,
    });
  }

  // Constelação baseada no rank (forma diferente por rank)
  const constellationsByRank = [
    { points: [[50, 45]], icon: '⭐' }, // rank 1 - single star
    { points: [[45, 50], [50, 38], [55, 50]], icon: '�' }, // rank 2 - crescent
    { points: [[45, 45], [50, 32], [55, 45], [50, 55]], icon: '☄️' }, // rank 3 - comet
    { points: [[45, 55], [50, 38], [55, 55], [47, 46], [53, 46]], icon: '🪐' }, // rank 4 - planet
    { points: [[40, 55], [45, 38], [50, 50], [55, 38], [60, 55], [50, 28]], icon: '🚀' }, // rank 5 - rocket
    { points: [[35, 50], [42, 32], [50, 45], [58, 32], [65, 50], [50, 22], [50, 60]], icon: '🌌' }, // rank 6 - galaxy
  ];
  const constellation = constellationsByRank[rank - 1] || constellationsByRank[0];

  // Fase da lua baseada no streak
  const getMoonPhase = () => {
    if (streak === 0) return { emoji: '🌑', glow: 0 };
    if (streak < 3) return { emoji: '🌒', glow: 5 };
    if (streak < 5) return { emoji: '🌓', glow: 10 };
    if (streak < 7) return { emoji: '🌔', glow: 15 };
    if (streak < 14) return { emoji: '🌕', glow: 20 };
    return { emoji: '🌕', glow: 30 };
  };
  const moon = getMoonPhase();

  return (
    <div>
      {/* Map */}
      <div
        className="relative w-full h-72 rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a0a20 0%, #1a1a3e 40%, #2d1b4e 100%)' }}
      >
        {/* Aurora (se meta cumprida) */}
        {goalMet && (
          <div className="absolute inset-0 opacity-40">
            <div
              className="absolute inset-x-0 top-0 h-32"
              style={{
                background: 'linear-gradient(180deg, rgba(0,255,100,0.3), rgba(0,200,255,0.2), transparent)',
                animation: 'aurora 8s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Lua com fase baseada no streak */}
        <div className="absolute top-3 right-4">
          <span
            className="text-4xl"
            style={{ filter: `drop-shadow(0 0 ${moon.glow}px rgba(255,255,200,0.8))` }}
          >
            {moon.emoji}
          </span>
          {streak > 0 && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              🔥 {streak}
            </div>
          )}
        </div>

        {/* Indicador de meta diária */}
        <div className="absolute top-3 left-4">
          {goalMet ? (
            <div className="flex items-center gap-2 bg-green-500/30 backdrop-blur-sm rounded-xl px-3 py-2">
              <span className="text-xl">✨</span>
              <span className="text-sm font-bold text-green-300">Meta cumprida!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm rounded-xl px-3 py-2">
              <span className="text-xl">📖</span>
              <span className="text-sm font-bold text-blue-300">
                Faltam {dailyGoal - todayMinutes}min
              </span>
            </div>
          )}
        </div>

        {/* Estrelas de fundo (dias totais) */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size * 4}px`,
              height: `${star.size * 4}px`,
              opacity: 0.2 + star.size * 0.5,
              animation: `twinkle ${1.5 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}

        {/* Via Láctea */}
        <div
          className="absolute inset-x-0 top-1/4 h-20 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transform: 'rotate(-15deg)',
            filter: `blur(${Math.max(5 - totalHours / 10, 1)}px)`,
          }}
        />

        {/* Constelação do rank atual */}
        <div className="absolute inset-0">
          {/* Linhas da constelação */}
          <svg className="absolute inset-0 w-full h-full">
            {constellation.points.length > 1 && constellation.points.slice(0, -1).map((point, i) => {
              const next = constellation.points[i + 1];
              return (
                <line
                  key={i}
                  x1={`${point[0]}%`}
                  y1={`${point[1]}%`}
                  x2={`${next[0]}%`}
                  y2={`${next[1]}%`}
                  stroke="rgba(255,215,0,0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Estrelas da constelação */}
          {constellation.points.map((point, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-yellow-300"
              style={{
                left: `${point[0]}%`,
                top: `${point[1]}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 12px rgba(255,215,0,0.9)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          ))}

          {/* Nome e ícone da constelação */}
          <div
            className="absolute flex items-center gap-2 bg-indigo-900/50 backdrop-blur-sm rounded-lg px-3 py-1"
            style={{
              left: `${constellation.points[0][0]}%`,
              top: `${constellation.points[constellation.points.length - 1][1] + 10}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="text-lg">{constellation.icon}</span>
            <span className="text-sm font-bold text-yellow-200">{level.name}</span>
            <span className="text-xs text-yellow-300/70">Rank {rank}</span>
          </div>
        </div>

        {/* Estrela cadente (se leu hoje) */}
        {todayMinutes > 0 && (
          <div
            className="absolute"
            style={{
              top: '15%',
              left: '75%',
              animation: 'shootingStar 4s linear infinite',
            }}
          >
            <span className="text-lg">💫</span>
          </div>
        )}

        {/* Planetas decorativos */}
        {totalReadingDays > 20 && (
          <div className="absolute top-20 left-8 text-2xl opacity-70">🪐</div>
        )}
        {totalReadingDays > 40 && (
          <div className="absolute top-16 right-20 text-xl opacity-60">🌍</div>
        )}

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
          }
          @keyframes shootingStar {
            0% { transform: translate(0, 0) rotate(-45deg); opacity: 1; }
            30% { opacity: 1; }
            100% { transform: translate(-150px, 150px) rotate(-45deg); opacity: 0; }
          }
          @keyframes aurora {
            0%, 100% { transform: translateX(-5%) scaleY(1); opacity: 0.3; }
            50% { transform: translateX(5%) scaleY(1.2); opacity: 0.5; }
          }
        `}</style>
      </div>

      {/* Stats Panel - BELOW the map */}
      <StatsPanel
        todayMinutes={todayMinutes}
        dailyGoal={dailyGoal}
        totalReadingDays={totalReadingDays}
        streak={streak}
        totalHours={totalHours}
        childName={childName}
        variant="constellation"
      />
    </div>
  );
};

// ============================================================================
// FAMILY VIEW (agregado)
// ============================================================================

const FamilyAquarium = ({ children }: { children: ChildData[] }) => {
  const totalTodayMinutes = children.reduce((sum: number, c: ChildData) => sum + c.todayMinutes, 0);
  const avgDailyGoal = Math.round(children.reduce((sum: number, c: ChildData) => sum + c.dailyGoal, 0) / children.length);
  const totalReadingDays = children.reduce((sum: number, c: ChildData) => sum + c.totalReadingDays, 0);
  const maxStreak = Math.max(...children.map((c: ChildData) => c.streak));
  const totalHours = children.reduce((sum: number, c: ChildData) => sum + c.totalHours, 0);
  const avgRank = Math.round(children.reduce((sum: number, c: ChildData) => sum + c.rank, 0) / children.length);

  // Use the first child's level as representative (or could build an aggregate level)
  const representativeLevel = children[0]?.currentLevel;

  return (
    <LivingAquarium
      rank={avgRank}
      todayMinutes={totalTodayMinutes}
      dailyGoal={avgDailyGoal * children.length}
      totalReadingDays={totalReadingDays}
      streak={maxStreak}
      totalHours={totalHours}
      isFamily={true}
      currentLevel={representativeLevel}
    />
  );
};

const FamilyConstellation = ({ children }: { children: ChildData[] }) => {
  const totalTodayMinutes = children.reduce((sum: number, c: ChildData) => sum + c.todayMinutes, 0);
  const avgDailyGoal = Math.round(children.reduce((sum: number, c: ChildData) => sum + c.dailyGoal, 0) / children.length);
  const totalReadingDays = children.reduce((sum: number, c: ChildData) => sum + c.totalReadingDays, 0);
  const maxStreak = Math.max(...children.map((c: ChildData) => c.streak));
  const totalHours = children.reduce((sum: number, c: ChildData) => sum + c.totalHours, 0);
  const avgRank = Math.round(children.reduce((sum: number, c: ChildData) => sum + c.rank, 0) / children.length);

  // Use the first child's level as representative
  const representativeLevel = children[0]?.currentLevel;

  return (
    <ConstellationMap
      rank={avgRank}
      todayMinutes={totalTodayMinutes}
      dailyGoal={avgDailyGoal * children.length}
      totalReadingDays={totalReadingDays}
      streak={maxStreak}
      totalHours={totalHours}
      isFamily={true}
      currentLevel={representativeLevel}
    />
  );
};

// ============================================================================
// LEGEND
// ============================================================================

const MapLegend = ({ variant }: { variant: 'aquarium' | 'constellation' }) => {
  const items = variant === 'aquarium'
    ? [
      { icon: '🐟', label: 'Dias de leitura' },
      { icon: '🐬', label: 'Rank atual' },
      { icon: '🔥', label: 'Dias seguidos' },
      { icon: '☀️', label: 'Meta diária cumprida' },
      { icon: '💎', label: 'Tesouros (streak 3+)' },
    ]
    : [
      { icon: '⭐', label: 'Dias de leitura' },
      { icon: '✨', label: 'Constelação (rank)' },
      { icon: '🌕', label: 'Lua (streak)' },
      { icon: '🌈', label: 'Aurora (meta cumprida)' },
      { icon: '💫', label: 'Estrela cadente (leu hoje)' },
    ];

  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      <h3 className="font-bold text-sm mb-3" style={{ color: COLORS.text }}>
        Como funciona o mapa?
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-lg w-6">{item.icon}</span>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE WITH TABS
// ============================================================================

export default function ExplorerMapPage() {
  const familyId = useFamilyId();
  const [selectedChildId, setSelectedChildId] = useState('all');
  const [mapType, setMapType] = useState<'aquarium' | 'constellation'>('aquarium');

  // Fetch family map data
  const { data: mapData, isLoading, error } = useQuery<MapResponse>({
    queryKey: ['map', 'family', familyId],
    queryFn: () => mapApi.getFamily(familyId!),
    enabled: !!familyId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600">Erro ao carregar mapa</p>
        </div>
      </div>
    );
  }

  const children = mapData.children || [];
  const selectedChild = selectedChildId === 'all'
    ? null
    : children.find((c: ChildData) => c.id === selectedChildId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold" style={{ color: COLORS.text }}>
              🗺️ Mapa do Explorador
            </h1>

            {/* Map type toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMapType('aquarium')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mapType === 'aquarium' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
              >
                🐠 Aquário
              </button>
              <button
                onClick={() => setMapType('constellation')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mapType === 'constellation' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
              >
                ⭐ Estrelas
              </button>
            </div>
          </div>

          {/* Child Selector */}
          <ChildSelector
            children={children}
            selectedId={selectedChildId}
            onChange={setSelectedChildId}
          />
        </div>
      </div>

      {/* Map */}
      <div className="max-w-2xl mx-auto p-4">
        {mapType === 'aquarium' ? (
          selectedChildId === 'all' ? (
            <FamilyAquarium children={children} />
          ) : selectedChild ? (
            <LivingAquarium
              rank={selectedChild.rank}
              todayMinutes={selectedChild.todayMinutes}
              dailyGoal={selectedChild.dailyGoal}
              totalReadingDays={selectedChild.totalReadingDays}
              streak={selectedChild.streak}
              totalHours={selectedChild.totalHours}
              childName={selectedChild.name}
              currentLevel={selectedChild.currentLevel}
            />
          ) : null
        ) : (
          selectedChildId === 'all' ? (
            <FamilyConstellation children={children} />
          ) : selectedChild ? (
            <ConstellationMap
              rank={selectedChild.rank}
              todayMinutes={selectedChild.todayMinutes}
              dailyGoal={selectedChild.dailyGoal}
              totalReadingDays={selectedChild.totalReadingDays}
              streak={selectedChild.streak}
              totalHours={selectedChild.totalHours}
              childName={selectedChild.name}
              currentLevel={selectedChild.currentLevel}
            />
          ) : null
        )}

        {/* Legend */}
        <MapLegend variant={mapType} />

        {/* Individual child cards (when showing all) */}
        {selectedChildId === 'all' && children.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-bold text-sm" style={{ color: COLORS.text }}>
              Por criança
            </h3>
            {children.map((child: ChildData) => {
              const goalMet = child.todayMinutes >= child.dailyGoal;
              return (
                <div
                  key={child.id}
                  className="bg-white rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedChildId(child.id)}
                >
                  <span className="text-3xl">{child.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: COLORS.text }}>{child.name}</span>
                      <span className="text-sm">{child.currentLevel.icon} {child.currentLevel.name}</span>
                      {goalMet && <span className="text-sm">✅</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{child.todayMinutes}/{child.dailyGoal}min hoje</span>
                      <span>🔥 {child.streak}</span>
                      <span>{child.totalReadingDays} dias</span>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
