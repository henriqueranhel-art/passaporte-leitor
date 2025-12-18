import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore, useChildren, useSelectedChild, useFamilyId } from '../lib/store';
import { statsApi, childrenApi } from '../lib/api';
import { Button, Card, Modal, Input } from '../components/ui';
import { AVATARS } from '../lib/types';
import { ChildCard } from '../components/ChildCard';
import { AddBookModal } from '../components/AddBookModal';
import { LogReadingModal } from '../components/LogReadingModal';

export default function Dashboard() {
  const familyId = useFamilyId();
  const children = useChildren();
  const selectedChild = useSelectedChild();
  const { setSelectedChild, addChild, triggerConfetti } = useStore();
  const queryClient = useQueryClient();

  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showLogReading, setShowLogReading] = useState(false);

  // Fetch family stats
  const { data: familyStats } = useQuery({
    queryKey: ['familyStats', familyId],
    queryFn: () => statsApi.getFamilyStats(familyId!),
    enabled: !!familyId,
  });

  // Fetch recent books
  // const { data: booksData } = useQuery({ queryKey: ['books', familyId], queryFn: () => booksApi.getByFamily(familyId!, { limit: 5 }),


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Olá! 👋
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
            return (
              <ChildCard
                key={child.id}
                child={child}
                onAddBook={() => {
                  setSelectedChild(child.id); // Assuming setSelectedChild is the correct function based on context
                  setShowAddBook(true);
                }}
                onLogReading={() => {
                  setSelectedChild(child.id);
                  setShowLogReading(true);
                }}
                onViewDetails={() => setSelectedChild(child.id)} // Assuming this is the desired behavior for now, as `navigate` is not defined in the provided context
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
          queryClient.invalidateQueries({ queryKey: ['children', familyId] });
          queryClient.invalidateQueries({ queryKey: ['familyBooks'] });
          queryClient.invalidateQueries({ queryKey: ['familyStats'] });
          triggerConfetti();
        }}
      />

      {/* Log Reading Modal */}
      <LogReadingModal
        isOpen={showLogReading}
        onClose={() => setShowLogReading(false)}
        child={selectedChild}
        currentBooks={selectedChild?.currentBooks || []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['children', familyId] });
          queryClient.invalidateQueries({ queryKey: ['familyStats'] });
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

// AddBookModal moved to separate file

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
