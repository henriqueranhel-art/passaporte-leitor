import { useQuery } from '@tanstack/react-query';
import { useSelectedChild } from '../lib/store';
import { achievementsApi } from '../lib/api';
import { Card, ProgressBar } from '../components/ui';

export default function AchievementsPage() {
  const selectedChild = useSelectedChild();

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', selectedChild?.id],
    queryFn: () => achievementsApi.getByChild(selectedChild!.id),
    enabled: !!selectedChild,
  });

  const achievements = data?.achievements || [];
  const earnedCount = data?.totalEarned || 0;
  const totalCount = data?.totalAvailable || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">🏆 Conquistas</h1>
        <p className="text-gray-500">
          {earnedCount} de {totalCount} conquistas desbloqueadas!
        </p>
      </div>

      {/* Progress Card */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-800">Progresso</span>
              <span className="text-primary">
                {earnedCount}/{totalCount}
              </span>
            </div>
            <ProgressBar value={earnedCount} max={totalCount} />
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-bounce">🏆</div>
          <p className="text-gray-500 mt-2">A carregar conquistas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border text-center transition-all ${
                achievement.earned ? 'shadow-md' : 'opacity-50'
              }`}
              style={{
                backgroundColor: achievement.earned ? 'rgba(245, 166, 35, 0.1)' : '#f9f9f9',
                borderColor: achievement.earned ? '#E67E22' : '#e5e7eb',
              }}
            >
              <span
                className={`text-3xl block mb-2 ${
                  achievement.earned ? '' : 'grayscale'
                }`}
              >
                {achievement.earned ? achievement.icon : '🔒'}
              </span>
              <h4 className="font-bold text-sm text-gray-800">{achievement.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
              {achievement.earned && achievement.earnedAt && (
                <p className="text-xs text-primary mt-2">
                  {new Date(achievement.earnedAt).toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
