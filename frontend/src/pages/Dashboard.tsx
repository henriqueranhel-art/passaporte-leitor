import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore, useChildren, useSelectedChild, useFamilyId } from '../lib/store';
import { booksApi, statsApi, childrenApi } from '../lib/api';
import { Button, Card, Modal, Input } from '../components/ui';
import { GENRES, AVATARS, type Genre } from '../lib/types';
import { ChildCard } from '../components/ChildCard';

export default function Dashboard() {
  const familyId = useFamilyId();
  const children = useChildren();
  const selectedChild = useSelectedChild();
  const { setSelectedChild, addChild, triggerConfetti } = useStore();
  const queryClient = useQueryClient();

  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  // Fetch family stats
  const { data: familyStats } = useQuery({
    queryKey: ['familyStats', familyId],
    queryFn: () => statsApi.getFamilyStats(familyId!),
    enabled: !!familyId,
  });

  // Fetch recent books
  const { data: booksData } = useQuery({
    queryKey: ['familyBooks', familyId],
    queryFn: () => booksApi.getByFamily(familyId!, { limit: 5 }),
    enabled: !!familyId,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Olá, Exploradores! 👋
        </h1>
        <p className="text-gray-500">
          Acompanhem as aventuras literárias da família.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total de Livros', value: familyStats?.totals.books || 0, icon: '📚', color: '#E67E22' },
          { label: 'Exploradores', value: familyStats?.totals.children || 0, icon: '👨‍👩‍👧‍👦', color: '#3498DB' },
          { label: 'Géneros Descobertos', value: familyStats?.totals.genresDiscovered || 0, icon: '🗺️', color: '#27AE60' },
          { label: 'Conquistas', value: familyStats?.totals.achievements || 0, icon: '🏆', color: '#9B59B6' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Children Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">👨‍👩‍👧‍👦 Exploradores</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAddChild(true)}>
            ➕ Adicionar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.map((child) => {
            const stats = familyStats?.childStats.find((s) => s.id === child.id);
            const childBooks = booksData?.books.filter(b => b.childId === child.id) || [];
            const lastBook = childBooks.length > 0 ? childBooks[0] : null;

            return (
              <ChildCard
                key={child.id}
                child={{
                  id: child.id,
                  name: child.name,
                  avatar: child.avatar,
                  level: {
                    name: stats?.level.current.name || 'Grumete',
                    color: stats?.level.current.color || '#BDC3C7',
                    icon: stats?.level.current.icon || '🐣',
                    nextLevel: stats?.level.next?.name,
                    booksToNextLevel: stats?.level.booksToNextLevel,
                    progress: stats?.level.progress || 0,
                  },
                  booksCount: stats?.bookCount || 0,
                  streak: 0, // Mocked
                  todayReading: { minutes: 0, goal: 15 }, // Mocked
                  weeklyActivity: [
                    { day: 'Seg', status: 'neutral', label: '15' },
                    { day: 'Ter', status: 'neutral', label: '16' },
                    { day: 'Qua', status: 'neutral', label: '17' },
                    { day: 'Qui', status: 'neutral', label: '18' },
                    { day: 'Sex', status: 'neutral', label: '19' },
                    { day: 'Sáb', status: 'neutral', label: '20' },
                    { day: 'Dom', status: 'neutral', label: '21' },
                  ], // Mocked
                  currentBooks: [], // Mocked
                  lastFinishedBook: lastBook ? {
                    title: lastBook.title,
                    author: lastBook.author,
                    genre: lastBook.genre,
                    rating: lastBook.rating || 0,
                    finishedAt: lastBook.dateRead,
                  } : null,
                }}
                onAddBook={() => {
                  setSelectedChild(child.id);
                  setShowAddBook(true);
                }}
                onLogReading={() => alert('Funcionalidade de registo de tempo em breve!')}
                onViewDetails={() => setSelectedChild(child.id)}
              />
            );
          })}
        </div>
      </div>




      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddBook}
        onClose={() => setShowAddBook(false)}
        child={selectedChild}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['familyBooks'] });
          queryClient.invalidateQueries({ queryKey: ['familyStats'] });
          triggerConfetti();
        }}
      />

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddChild}
        onClose={() => setShowAddChild(false)}
        familyId={familyId!}
        onSuccess={(child) => {
          addChild(child);
          queryClient.invalidateQueries({ queryKey: ['familyStats'] });
        }}
      />

      {/* Screen Time Reminder */}
      <div className="mt-8 p-6 rounded-2xl border bg-green-50 border-green-200 flex items-center gap-4">
        <span className="text-4xl">🌿</span>
        <div>
          <p className="font-bold text-green-800 mb-1">
            Lembrete: Menos ecrã, mais leitura!
          </p>
          <p className="text-sm text-green-700">
            Esta plataforma foi desenhada para visitas curtas. Adicione o livro em 1
            minuto, depois desliguem o computador e celebrem as conquistas com o
            passaporte físico!
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD BOOK MODAL
// ============================================================================

function AddBookModal({
  isOpen,
  onClose,
  child,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  child: ReturnType<typeof useSelectedChild>;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState<Genre | ''>('');
  const [rating, setRating] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const createBookMutation = useMutation({
    mutationFn: booksApi.create,
  });

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setAuthor('');
    setGenre('');
    setRating(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!child || !title || !author || !genre) return;

    try {
      await createBookMutation.mutateAsync({
        childId: child.id,
        title,
        author,
        genre: genre as Genre,
        rating: rating || undefined,
      });

      setShowSuccess(true);
      onSuccess();

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`📚 Adicionar Livro - ${child?.name}`}
    >
      {showSuccess ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">
            Novo Território Descoberto!
          </h3>
          <p className="text-gray-500">+1 livro adicionado ao passaporte</p>
        </div>
      ) : (
        <>
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${step >= s ? '' : 'opacity-50'
                  }`}
                style={{ backgroundColor: step >= s ? '#E67E22' : '#ddd' }}
              />
            ))}
          </div>

          {step === 1 && (
            <>
              <Input
                label="Título do Livro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: O Principezinho"
                icon="📖"
              />
              <Input
                label="Autor"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Antoine de Saint-Exupéry"
                icon="✍️"
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <p className="text-lg font-bold text-gray-800">{title}</p>
                <p className="text-gray-500">{author}</p>
              </div>

              {/* Genre Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Género
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(GENRES) as Genre[]).map((g) => {
                    const genreData = GENRES[g];
                    return (
                      <button
                        key={g}
                        onClick={() => setGenre(g)}
                        className={`p-3 rounded-xl border-2 transition-all ${genre === g ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-100'
                          }`}
                        style={{
                          borderColor: genre === g ? genreData.color : '#e5e7eb',
                          backgroundColor: genre === g ? genreData.mapColor : 'white',
                        }}
                      >
                        <span className="text-2xl block mb-1">{genreData.icon}</span>
                        <span className="text-xs font-medium text-gray-800">
                          {genreData.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  O que achaste? (opcional)
                </label>
                <div className="flex gap-3 justify-center">
                  {[
                    { value: 1, emoji: '😐', label: 'Assim-assim' },
                    { value: 2, emoji: '🙂', label: 'Gostei' },
                    { value: 3, emoji: '😍', label: 'Adorei!' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRating(rating === r.value ? null : r.value)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all ${rating === r.value ? 'scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
                        }`}
                      style={{
                        backgroundColor: rating === r.value ? '#F5A623' : '#f3f4f6',
                      }}
                    >
                      <span className="text-3xl mb-1">{r.emoji}</span>
                      <span className="text-xs">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                ← Voltar
              </Button>
            )}
            <Button
              variant={step === 2 ? 'success' : 'primary'}
              onClick={step === 2 ? handleSubmit : () => setStep(2)}
              disabled={step === 1 ? !title || !author : !genre}
              className="flex-1"
            >
              {createBookMutation.isPending
                ? 'A adicionar...'
                : step === 2
                  ? '✓ Adicionar ao Passaporte'
                  : 'Continuar →'}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            ⏱️ Tempo estimado: menos de 1 minuto
          </p>
        </>
      )}
    </Modal>
  );
}

// ============================================================================
// ADD CHILD MODAL
// ============================================================================

function AddChildModal({
  isOpen,
  onClose,
  familyId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onSuccess: (child: any) => void;
}) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧒');

  const createChildMutation = useMutation({
    mutationFn: childrenApi.create,
  });

  const handleSubmit = async () => {
    if (!name) return;

    try {
      const child = await createChildMutation.mutateAsync({
        familyId,
        name,
        avatar,
      });
      onSuccess(child);
      setName('');
      setAvatar('🧒');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👶 Adicionar Explorador">
      <Input
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da criança"
        icon="👤"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Avatar
        </label>
        <div className="grid grid-cols-8 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-10 h-10 rounded-lg text-xl transition-all ${avatar === a
                ? 'scale-110 shadow-md ring-2 ring-primary'
                : 'opacity-60 hover:opacity-100'
                }`}
              style={{ backgroundColor: avatar === a ? '#F5A623' : '#f3f4f6' }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={!name || createChildMutation.isPending}
          className="flex-1"
        >
          {createChildMutation.isPending ? 'A criar...' : '✓ Adicionar Explorador'}
        </Button>
      </div>
    </Modal>
  );
}
