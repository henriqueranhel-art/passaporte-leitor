import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useStore } from '../lib/store';
import { familyApi, childrenApi } from '../lib/api';
import { Button, Input } from '../components/ui';
import { AVATARS } from '../lib/types';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState('🧒');
  const [error, setError] = useState('');

  const { setFamily, addChild, completeOnboarding, triggerConfetti } = useStore();

  const createFamilyMutation = useMutation({
    mutationFn: familyApi.create,
  });

  const createChildMutation = useMutation({
    mutationFn: childrenApi.create,
  });

  const handleComplete = async () => {
    if (!childName) {
      setError('Por favor, introduz o nome da criança');
      return;
    }

    try {
      // Create family
      const family = await createFamilyMutation.mutateAsync({
        name: familyName || 'A Nossa Família',
      });
      setFamily(family);

      // Create first child
      const child = await createChildMutation.mutateAsync({
        familyId: family.id,
        name: childName,
        avatar: childAvatar,
      });
      addChild(child);

      // Complete onboarding
      triggerConfetti();
      completeOnboarding();
    } catch (err) {
      setError('Ocorreu um erro. Por favor, tenta novamente.');
    }
  };

  const isLoading = createFamilyMutation.isPending || createChildMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className="w-3 h-3 rounded-full transition-all"
            style={{
              backgroundColor: step >= s ? '#E67E22' : '#ddd',
              transform: step === s ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-8xl mb-6 animate-bounce">🗺️</div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
              Bem-vindos, Exploradores!
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              O <strong>Passaporte do Leitor</strong> é uma aventura de
              descoberta através dos livros.
            </p>
            <p className="text-gray-500 mb-8">
              Cada livro lido revela novos territórios no mapa mágico!
            </p>
            <Button onClick={() => setStep(1)} size="lg">
              Começar a Aventura 🚀
            </Button>
          </div>
        )}

        {/* Step 1: Family Name */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Como se chama a vossa família?
            </h2>
            <div className="max-w-md mx-auto">
              <Input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Ex: Família Silva"
                icon="🏠"
              />
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <Button variant="secondary" onClick={() => setStep(0)}>
                ← Voltar
              </Button>
              <Button onClick={() => setStep(2)}>Continuar →</Button>
            </div>
          </div>
        )}

        {/* Step 2: First Child */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-6xl mb-6">{childAvatar}</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Quem é o primeiro explorador?
            </h2>
            <p className="text-gray-500 mb-6">
              Podem adicionar mais exploradores depois.
            </p>

            <div className="max-w-md mx-auto">
              <Input
                label="Nome"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Nome da criança"
                icon="👤"
                error={error}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-left text-gray-800">
                  Avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {AVATARS.slice(0, 16).map((a) => (
                    <button
                      key={a}
                      onClick={() => setChildAvatar(a)}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        childAvatar === a
                          ? 'scale-110 shadow-md ring-2 ring-primary'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor:
                          childAvatar === a ? '#F5A623' : '#f3f4f6',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Voltar
              </Button>
              <Button
                variant="success"
                onClick={handleComplete}
                disabled={!childName || isLoading}
              >
                {isLoading ? 'A criar...' : '✓ Começar a Explorar!'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Decorations */}
      <div className="fixed bottom-4 left-4 text-4xl opacity-20">📚</div>
      <div className="fixed bottom-4 right-4 text-4xl opacity-20">🏰</div>
      <div className="fixed top-4 right-4 text-4xl opacity-20">🚀</div>
    </div>
  );
}
