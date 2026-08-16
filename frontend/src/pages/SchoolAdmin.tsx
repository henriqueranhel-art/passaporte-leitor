import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolApi } from '../lib/api';
import { useStore, useSchoolAdmin } from '../lib/store';
import { COLORS } from '../lib/constants';
import { Button } from '../components/ui';
import type { Escola, Turma, TurmaInput } from '../lib/types';

// ============================================================================
// Helpers de UI
// ============================================================================

type Toast = { message: string; type: 'success' | 'warning' } | null;

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  readOnly?: boolean;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      {label}
    </label>
    {readOnly ? (
      <div className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500 text-sm">{value || '—'}</div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 ${
          error ? 'border-red-400' : 'border-gray-200'
        } focus:outline-none focus:border-primary`}
        style={{ color: COLORS.text }}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ============================================================================
// Alterar palavra-passe
// ============================================================================

const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${
          error ? 'border-red-400' : 'border-gray-200'
        } focus:outline-none focus:border-primary`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const PasswordForm = ({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (currentPassword: string, newPassword: string) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Palavra-passe atual é obrigatória';
    if (next.length < 6) e.next = 'Mínimo 6 caracteres';
    if (next !== confirm) e.confirm = 'As palavras-passe não coincidem';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(current, next);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>
        🔒 Alterar palavra-passe
      </h2>
      <PasswordInput label="Palavra-passe atual" value={current} onChange={setCurrent} show={show} onToggle={() => setShow((s) => !s)} error={errors.current} />
      <PasswordInput label="Nova palavra-passe" value={next} onChange={setNext} show={show} onToggle={() => setShow((s) => !s)} error={errors.next} />
      <PasswordInput label="Confirmar nova palavra-passe" value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow((s) => !s)} error={errors.confirm} />
      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          💾 Guardar
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Formulário de turma
// ============================================================================

const TurmaForm = ({
  turma,
  onSave,
  onCancel,
  saving,
}: {
  turma?: Turma | null;
  onSave: (data: TurmaInput) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [nome, setNome] = useState(turma?.nome || '');
  const [professor, setProfessor] = useState(turma?.professor || '');
  const [email, setEmail] = useState(turma?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Indica o nome da turma';
    if (!professor.trim()) e.professor = 'Indica o professor';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Email inválido';
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({ nome: nome.trim(), professor: professor.trim(), email: email.trim() });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-orange-100">
      <h3 className="text-sm font-bold mb-4" style={{ color: COLORS.text }}>
        {turma ? '✏️ Editar turma' : '➕ Nova turma'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <Field label="Turma" value={nome} onChange={setNome} placeholder="Ex: 3.º A" error={errors.nome} />
        <Field
          label="Professor"
          value={professor}
          onChange={setProfessor}
          placeholder="Nome do professor"
          error={errors.professor}
        />
        <div className="md:col-span-2">
          <Field
            label="Email do professor"
            value={email}
            onChange={setEmail}
            placeholder="professor@escola.pt"
            type="email"
            error={errors.email}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving} variant="success" className="flex-1">
          💾 Guardar turma
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Vista de turmas de uma escola
// ============================================================================

const TurmasView = ({ escola, onBack, showToast }: { escola: Escola; onBack: () => void; showToast: (m: string, t?: 'success' | 'warning') => void }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Turma | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['turmas', escola.id],
    queryFn: () => schoolApi.listTurmas(escola.id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['turmas', escola.id] });
    queryClient.invalidateQueries({ queryKey: ['escolas'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: TurmaInput) => schoolApi.createTurma(escola.id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      showToast('Turma adicionada!');
    },
    onError: () => showToast('Erro ao adicionar turma', 'warning'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TurmaInput }) => schoolApi.updateTurma(id, input),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      showToast('Turma atualizada!');
    },
    onError: () => showToast('Erro ao atualizar turma', 'warning'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schoolApi.deleteTurma(id),
    onSuccess: () => {
      invalidate();
      setConfirmDelete(null);
      showToast('Turma removida', 'warning');
    },
    onError: () => showToast('Erro ao remover turma', 'warning'),
  });

  const turmas = data?.turmas ?? [];
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        ← Voltar às escolas
      </button>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>
            {escola.nome}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          {escola.concelho} · {escola.agrupamento}
        </p>
      </div>

      {editing === 'new' ? (
        <TurmaForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setEditing(null)} saving={saving} />
      ) : editing ? (
        <TurmaForm
          turma={editing}
          onSave={(d) => updateMutation.mutate({ id: editing.id, input: d })}
          onCancel={() => setEditing(null)}
          saving={saving}
        />
      ) : (
        <Button onClick={() => setEditing('new')} className="w-full">
          ➕ Adicionar turma
        </Button>
      )}

      {isLoading ? (
        <p className="text-center text-gray-400 py-8">A carregar turmas...</p>
      ) : turmas.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <span className="text-5xl block mb-3">🎒</span>
          <p className="font-bold mb-1" style={{ color: COLORS.text }}>
            Sem turmas
          </p>
          <p className="text-sm text-gray-500">Adiciona a primeira turma desta escola.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_1.6fr_auto] gap-2 px-4 py-3 bg-orange-50 text-xs font-bold text-gray-500">
            <span>TURMA</span>
            <span>PROFESSOR</span>
            <span>EMAIL</span>
            <span></span>
          </div>
          {turmas.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1.6fr_auto] gap-1 md:gap-2 px-4 py-3 border-t border-gray-100 md:items-center text-sm"
            >
              <span className="font-bold" style={{ color: COLORS.text }}>
                {t.nome}
              </span>
              <span className="text-gray-700">{t.professor}</span>
              <span className="text-blue-500 truncate">{t.email}</span>
              <div className="flex gap-3 md:justify-end mt-1 md:mt-0">
                <button onClick={() => setEditing(t)} className="text-gray-400 hover:text-gray-700" title="Editar">
                  ✏️
                </button>
                <button onClick={() => setConfirmDelete(t.id)} className="text-red-400 hover:text-red-600" title="Remover">
                  🗑️
                </button>
              </div>

              {confirmDelete === t.id && (
                <div className="md:col-span-4 bg-red-50 p-3 rounded-xl mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm text-red-700">Remover a turma {t.nome}?</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(null)}>
                      Cancelar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(t.id)}>
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Página principal
// ============================================================================

export default function SchoolAdmin() {
  const storedAdmin = useSchoolAdmin();
  const { logout } = useStore();
  const queryClient = useQueryClient();

  // Conta + âmbito (concelho/agrupamento) derivados das escolas ligadas.
  const { data: account } = useQuery({
    queryKey: ['school-account'],
    queryFn: () => schoolApi.getAccount(),
  });
  const adminName = account?.name ?? storedAdmin?.name ?? '';
  const agrupamento = account?.agrupamento ?? null;
  const concelho = account?.concelho ?? null;

  const [view, setView] = useState<'list' | 'password'>('list');
  const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null);
  const [addingEscola, setAddingEscola] = useState(false);
  const [novaEscolaNome, setNovaEscolaNome] = useState('');
  const [escolaError, setEscolaError] = useState('');
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['escolas'],
    queryFn: () => schoolApi.listEscolas(),
  });

  const createEscolaMutation = useMutation({
    mutationFn: (nome: string) => schoolApi.createEscola(nome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      setAddingEscola(false);
      setNovaEscolaNome('');
      showToast('Escola adicionada!');
    },
    onError: () => showToast('Erro ao adicionar escola', 'warning'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      schoolApi.changePassword(current, next),
    onSuccess: () => {
      setView('list');
      showToast('Palavra-passe alterada!');
    },
    onError: (err: any) => {
      showToast(
        err?.message === 'Palavra-passe atual incorreta' ? 'Palavra-passe atual incorreta' : 'Erro ao alterar palavra-passe',
        'warning'
      );
    },
  });

  const handleAddEscola = () => {
    if (!novaEscolaNome.trim()) {
      setEscolaError('Indica o nome da escola');
      return;
    }
    setEscolaError('');
    createEscolaMutation.mutate(novaEscolaNome.trim());
  };

  const escolas = data?.escolas ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {toast && (
        <div
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white text-center shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-orange-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">
              🏫
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate" style={{ color: COLORS.text }}>
                Gestão de Turmas
              </h1>
              <p className="text-xs text-gray-500 truncate">
                {adminName}
                {agrupamento ? ` · ${agrupamento}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setView((v) => (v === 'password' ? 'list' : 'password'));
                setSelectedEscola(null);
              }}
              className="text-sm px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{ color: COLORS.text }}
            >
              🔒 <span className="hidden sm:inline">Palavra-passe</span>
            </button>
            <button
              onClick={logout}
              className="text-sm px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-red-500 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {view === 'password' ? (
          <PasswordForm
            saving={changePasswordMutation.isPending}
            onCancel={() => setView('list')}
            onSave={(current, next) => changePasswordMutation.mutate({ current, next })}
          />
        ) : selectedEscola ? (
          <TurmasView escola={selectedEscola} onBack={() => setSelectedEscola(null)} showToast={showToast} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: COLORS.text }}>
                As minhas escolas
              </h2>
              {!addingEscola && agrupamento && (
                <Button size="sm" onClick={() => setAddingEscola(true)}>
                  ➕ Adicionar escola
                </Button>
              )}
            </div>

            {addingEscola && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-orange-100">
                <h3 className="text-sm font-bold mb-4" style={{ color: COLORS.text }}>
                  ➕ Nova escola
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <Field label="Concelho" value={concelho || ''} readOnly />
                  <Field label="Agrupamento" value={agrupamento || ''} readOnly />
                </div>
                <Field
                  label="Nome da escola"
                  value={novaEscolaNome}
                  onChange={(v) => {
                    setNovaEscolaNome(v);
                    setEscolaError('');
                  }}
                  placeholder="Ex: EB1 do Cerco"
                  error={escolaError}
                />
                <p className="text-xs text-gray-400 -mt-2 mb-4">
                  Concelho e agrupamento são os da tua conta e não podem ser alterados aqui.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setAddingEscola(false);
                      setNovaEscolaNome('');
                      setEscolaError('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" disabled={createEscolaMutation.isPending} onClick={handleAddEscola}>
                    💾 Guardar escola
                  </Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <p className="text-center text-gray-400 py-8">A carregar escolas...</p>
            ) : escolas.length === 0 && !addingEscola ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <span className="text-5xl block mb-3">🏫</span>
                <p className="font-bold mb-1" style={{ color: COLORS.text }}>
                  Nenhuma escola
                </p>
                <p className="text-sm text-gray-500">
                  A tua conta ainda não tem nenhuma escola associada. Contacta o administrador do
                  sistema para ligar a tua conta a uma escola do teu agrupamento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {escolas.map((escola) => (
                  <div
                    key={escola.id}
                    onClick={() => setSelectedEscola(escola)}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🏫
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ color: COLORS.text }}>
                        {escola.nome}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {escola.concelho} · {escola.agrupamento}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
                        {escola.turmaCount ?? 0}
                      </span>
                      <p className="text-xs text-gray-400">turmas</p>
                    </div>
                    <span className="text-gray-300">›</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
