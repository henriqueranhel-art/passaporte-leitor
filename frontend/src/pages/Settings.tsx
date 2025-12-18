import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AVATARS, LevelCategory } from '../lib/types';
import { familyApi, childrenApi } from '../lib/api';
import { useFamilyId } from '../lib/store';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  background: '#FDF6E3',
  text: '#2C3E50',
};

// ============================================================================
// LEVEL CATEGORIES
// ============================================================================

const LEVEL_CATEGORIES = {
  MAGIC: { code: 'MAGIC', name: 'Magia', description: 'Torna-te um poderoso mago!', icon: '🪄', preview: ['✨', '🪄', '🧙', '🔮', '👑', '⭐'] },
  EXPLORERS: { code: 'EXPLORERS', name: 'Exploradores', description: 'Descobre novos mundos!', icon: '🧭', preview: ['🐣', '🧭', '🎒', '🗺️', '⛵', '🌟'] },
  KNIGHTS: { code: 'KNIGHTS', name: 'Cavaleiros', description: 'Luta pela honra e glória!', icon: '⚔️', preview: ['🛡️', '⚔️', '🗡️', '🏅', '🦁', '👑'] },
  SPACE: { code: 'SPACE', name: 'Espaço', description: 'Explora o universo!', icon: '🚀', preview: ['🌙', '👨‍🚀', '🚀', '🛸', '🌟', '✨'] },
};

const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 15 }, (_, i) => currentYear - 4 - i);

// ============================================================================
// COMPONENTS
// ============================================================================

const Button = ({ children, onClick, variant = 'primary', size = 'medium', fullWidth = false }: any) => {
  const baseStyles = 'font-bold rounded-xl transition-all flex items-center justify-center gap-2';
  const variants: Record<string, string> = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes: Record<string, string> = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
};

const SectionHeader = ({ icon, title }: any) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>{title}</h2>
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 ${error ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
      style={{ color: COLORS.text }}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const AvatarSelector = ({ selected, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Avatar</label>
    <div className="grid grid-cols-8 gap-2">
      {AVATARS.map(avatar => (
        <button
          key={avatar}
          onClick={() => onChange(avatar)}
          className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${selected === avatar ? 'bg-orange-100 ring-2 ring-orange-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {avatar}
        </button>
      ))}
    </div>
  </div>
);

const BirthYearSelect = ({ value, onChange, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Ano de Nascimento</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className={`w-full px-4 py-3 rounded-xl border-2 ${error ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
    >
      <option value="">Selecionar...</option>
      {BIRTH_YEARS.map(y => <option key={y} value={y}>{y} ({currentYear - y} anos)</option>)}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const LevelCategorySelector = ({ selected, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Tema da Aventura</label>
    <div className="grid grid-cols-2 gap-3">
      {Object.values(LEVEL_CATEGORIES).map(cat => (
        <button
          key={cat.code}
          onClick={() => onChange(cat.code)}
          className={`p-4 rounded-xl text-left ${selected === cat.code ? 'bg-orange-50 ring-2 ring-orange-500' : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{cat.icon}</span>
            <span className="font-bold">{cat.name}</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{cat.description}</p>
          <div className="flex gap-1">
            {cat.preview.map((icon, i) => <span key={i} className="text-sm">{icon}</span>)}
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// FAMILY FORM
// ============================================================================

const FamilyForm = ({ family, onSave, onCancel }: any) => {
  const [name, setName] = useState(family?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const handleSave = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';

    if (showPasswordSection) {
      if (!currentPassword) newErrors.currentPassword = 'Palavra-passe atual é obrigatória';
      if (newPassword.length < 6) newErrors.newPassword = 'Mínimo 6 caracteres';
      if (newPassword !== confirmPassword) newErrors.confirmPassword = 'As palavras-passe não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data: any = { name };
    if (showPasswordSection && newPassword) {
      data.password = newPassword;
      data.currentPassword = currentPassword;
    }

    onSave(data);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <SectionHeader icon="👨‍👩‍👧‍👦" title="Definições da Família" />

      <InputField
        label="Nome da Família"
        value={name}
        onChange={setName}
        placeholder="Ex: Família Silva"
        error={errors.name}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Email</label>
        <div className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500">{family?.email}</div>
        <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
      </div>

      <div className="border-t pt-4 mt-4">
        <button
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600"
        >
          <span>🔒</span>
          <span>{showPasswordSection ? 'Cancelar alteração de palavra-passe' : 'Alterar palavra-passe'}</span>
          <span>{showPasswordSection ? '▲' : '▼'}</span>
        </button>

        {showPasswordSection && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Palavra-passe atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.currentPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
              />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Nova palavra-passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.newPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
              />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>Confirmar nova palavra-passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} fullWidth>Cancelar</Button>
        <Button onClick={handleSave} fullWidth>💾 Guardar</Button>
      </div>
    </div>
  );
};

// ============================================================================
// CHILD FORM
// ============================================================================

const ChildForm = ({ child, onSave, onCancel, onDelete }: any) => {
  const [name, setName] = useState(child?.name || '');
  const [avatar, setAvatar] = useState(child?.avatar || '👧');
  const [birthYear, setBirthYear] = useState(child?.birthYear || '');
  const [levelCategory, setLevelCategory] = useState<LevelCategory>(child?.levelCategory || 'EXPLORERS');
  const [errors, setErrors] = useState<any>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isNew = !child?.id;
  const age = birthYear ? currentYear - birthYear : null;

  const handleSave = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!birthYear) newErrors.birthYear = 'Seleciona o ano';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({ id: child?.id, name, avatar, birthYear: parseInt(birthYear.toString()), levelCategory });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-center mb-6 p-4 bg-orange-50 rounded-xl">
        <div className="text-center">
          <span className="text-5xl">{avatar}</span>
          <p className="font-bold mt-2">{name || 'Nome'}</p>
          <p className="text-sm text-gray-500">{age ? `${age} anos` : '-- anos'}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span>{LEVEL_CATEGORIES[levelCategory]?.icon}</span>
            <span className="text-sm text-gray-500">{LEVEL_CATEGORIES[levelCategory]?.name}</span>
          </div>
        </div>
      </div>

      <InputField label="Nome" value={name} onChange={setName} placeholder="Ex: Maria" error={errors.name} />
      <AvatarSelector selected={avatar} onChange={setAvatar} />
      <BirthYearSelect value={birthYear} onChange={setBirthYear} error={errors.birthYear} />
      <LevelCategorySelector selected={levelCategory} onChange={setLevelCategory} />

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} fullWidth>Cancelar</Button>
        <Button onClick={handleSave} fullWidth>💾 {isNew ? 'Criar' : 'Guardar'}</Button>
      </div>

      {!isNew && (
        <div className="mt-6 pt-6 border-t">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full text-red-500 text-sm">🗑️ Remover</button>
          ) : (
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-sm text-red-700 mb-3 text-center">Tens a certeza?</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} fullWidth size="small">Cancelar</Button>
                <Button variant="danger" onClick={() => onDelete(child.id)} fullWidth size="small">Confirmar</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Settings() {
  const familyId = useFamilyId();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState('list');
  const [editingChild, setEditingChild] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  const { data: family } = useQuery({
    queryKey: ['family', familyId],
    queryFn: () => familyApi.get(familyId!),
    enabled: !!familyId,
  });

  const { data: children = [] } = useQuery({
    queryKey: ['children', familyId],
    queryFn: () => childrenApi.getByFamily(familyId!),
    enabled: !!familyId,
  });

  const updateFamilyMutation = useMutation({
    mutationFn: (data: any) => familyApi.update(familyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family', familyId] });
      showToast('Família atualizada!');
      setActiveView('list');
    },
  });

  const updateChildMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => childrenApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children', familyId] });
      showToast('Criança atualizada!');
      setActiveView('list');
    },
  });

  const createChildMutation = useMutation({
    mutationFn: (data: any) => childrenApi.create({ ...data, familyId: familyId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children', familyId] });
      showToast('Criança adicionada!');
      setActiveView('list');
    },
  });

  const deleteChildMutation = useMutation({
    mutationFn: (id: string) => childrenApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children', familyId] });
      showToast('Criança removida', 'warning');
      setActiveView('list');
    },
  });

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveFamily = (data: any) => {
    updateFamilyMutation.mutate(data);
  };

  const handleSaveChild = (data: any) => {
    if (data.id) {
      updateChildMutation.mutate(data);
    } else {
      createChildMutation.mutate(data);
    }
  };

  if (!family) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white text-center shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-orange-500'
          }`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {activeView !== 'list' && (
              <button onClick={() => { setActiveView('list'); setEditingChild(null); }} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">←</button>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {activeView === 'list' ? '⚙️ Definições' : activeView === 'family' ? '👨‍👩‍👧‍👦 Família' : editingChild ? `✏️ ${editingChild.name}` : '➕ Nova Criança'}
              </h1>
              {activeView === 'list' && <p className="text-sm text-gray-500">Gere a tua família e crianças</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {activeView === 'list' && (
          <div className="space-y-6">
            <div>
              <SectionHeader icon="👨‍👩‍👧‍👦" title="Família" />
              <div
                onClick={() => setActiveView('family')}
                className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">🏠</div>
                  <div className="flex-1">
                    <p className="font-bold">{family.name}</p>
                    <p className="text-sm text-gray-500">{family.email}</p>
                  </div>
                  <span className="text-gray-400">✏️</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionHeader icon="👶" title="Crianças" />
                <Button size="small" onClick={() => { setEditingChild(null); setActiveView('child'); }}>➕ Adicionar</Button>
              </div>
              {children.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <span className="text-5xl block mb-3">👶</span>
                  <p className="font-bold mb-1">Nenhuma criança</p>
                  <p className="text-sm text-gray-500 mb-4">Adiciona uma criança</p>
                  <Button onClick={() => { setEditingChild(null); setActiveView('child'); }}>➕ Adicionar</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {children.map((child: any) => (
                    <div
                      key={child.id}
                      onClick={() => { setEditingChild(child); setActiveView('child'); }}
                      className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md"
                    >
                      <span className="text-4xl">{child.avatar}</span>
                      <div className="flex-1">
                        <p className="font-bold">{child.name}</p>
                        <p className="text-sm text-gray-500">
                          {child.birthYear ? `${currentYear - child.birthYear} anos` : ''}
                          {child.levelCategory && ` • ${LEVEL_CATEGORIES[child.levelCategory as LevelCategory]?.icon} ${LEVEL_CATEGORIES[child.levelCategory as LevelCategory]?.name}`}
                        </p>
                      </div>
                      <span className="text-gray-400">✏️</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'family' && (
          <FamilyForm
            family={family}
            onSave={handleSaveFamily}
            onCancel={() => setActiveView('list')}
          />
        )}

        {activeView === 'child' && (
          <ChildForm
            child={editingChild}
            onSave={handleSaveChild}
            onCancel={() => { setActiveView('list'); setEditingChild(null); }}
            onDelete={(id: string) => deleteChildMutation.mutate(id)}
          />
        )}
      </div>
    </div>
  );
}
