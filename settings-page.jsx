import React, { useState } from 'react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const COLORS = {
  primary: '#E67E22',
  primaryLight: '#F5A623',
  primaryDark: '#D35400',
  secondary: '#3498DB',
  success: '#27AE60',
  danger: '#E74C3C',
  background: '#FDF6E3',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E8E0D5',
};

// ============================================================================
// AVATARS (24 options)
// ============================================================================

const AVATARS = [
  '👧', '👦', '👧🏻', '👦🏻', '👧🏼', '👦🏼',
  '👧🏽', '👦🏽', '👧🏾', '👦🏾', '👧🏿', '👦🏿',
  '🧒', '🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿',
  '👶', '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿',
];

// ============================================================================
// LEVEL CATEGORIES
// ============================================================================

const LEVEL_CATEGORIES = {
  MAGIC: {
    code: 'MAGIC',
    name: 'Magia',
    description: 'Torna-te um poderoso mago!',
    icon: '🪄',
    preview: ['✨', '🪄', '🧙', '🔮', '👑', '⭐'],
  },
  EXPLORERS: {
    code: 'EXPLORERS',
    name: 'Exploradores',
    description: 'Descobre novos mundos!',
    icon: '🧭',
    preview: ['🐣', '🧭', '🎒', '🗺️', '⛵', '🌟'],
  },
  KNIGHTS: {
    code: 'KNIGHTS',
    name: 'Cavaleiros',
    description: 'Luta pela honra e glória!',
    icon: '⚔️',
    preview: ['🛡️', '⚔️', '🗡️', '🏅', '🦁', '👑'],
  },
  SPACE: {
    code: 'SPACE',
    name: 'Espaço',
    description: 'Explora o universo!',
    icon: '🚀',
    preview: ['🌙', '👨‍🚀', '🚀', '🛸', '🌟', '✨'],
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_FAMILY = {
  id: 'f1',
  name: 'Família Silva',
  email: 'silva@email.com',
};

const MOCK_CHILDREN = [
  { 
    id: 'c1', 
    name: 'Maria', 
    avatar: '👧',
    birthYear: 2016,
    levelCategory: 'EXPLORERS',
  },
  { 
    id: 'c2', 
    name: 'Tomás', 
    avatar: '👦',
    birthYear: 2018,
    levelCategory: 'SPACE',
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// Input field component
const InputField = ({ label, type = 'text', value, onChange, placeholder, error, helper }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
        error ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'
      } focus:outline-none`}
      style={{ color: COLORS.text }}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    {helper && <p className="text-gray-400 text-xs mt-1">{helper}</p>}
  </div>
);

// Button component
const Button = ({ children, onClick, variant = 'primary', size = 'medium', disabled = false, fullWidth = false }) => {
  const baseStyles = 'font-bold rounded-xl transition-all flex items-center justify-center gap-2';
  
  const variants = {
    primary: `bg-orange-500 text-white hover:bg-orange-600 ${disabled ? 'opacity-50' : ''}`,
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
  };

  const sizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
};

// Section header
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl">{icon}</span>
      <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-gray-500 ml-7">{subtitle}</p>}
  </div>
);

// ============================================================================
// AVATAR SELECTOR
// ============================================================================

const AvatarSelector = ({ selected, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
        Avatar
      </label>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            onClick={() => onChange(avatar)}
            className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
              selected === avatar
                ? 'bg-orange-100 ring-2 ring-orange-500 scale-110'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {avatar}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// BIRTH YEAR - Same logic as auth flow
// ============================================================================

const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from(
  { length: 15 }, // 15 anos de opções
  (_, i) => currentYear - 4 - i // Começar 4 anos atrás (excluir atual + 3 anteriores)
);

// Select field component (consistent with auth flow)
const Select = ({ label, value, onChange, options, placeholder, icon, error, helper }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full py-3 rounded-xl border-2 transition-colors appearance-none bg-white ${
          icon ? 'pl-12 pr-10' : 'pl-4 pr-10'
        } ${error ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'} focus:outline-none`}
        style={{ color: value ? COLORS.text : '#9CA3AF' }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        ▼
      </span>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    {helper && !error && <p className="text-gray-400 text-xs mt-1">{helper}</p>}
  </div>
);

const BirthYearSelect = ({ value, onChange, error }) => {
  const options = BIRTH_YEARS.map(year => ({
    value: year.toString(),
    label: `${year} (${currentYear - year} anos)`,
  }));

  return (
    <Select
      label="Ano de Nascimento"
      value={value?.toString() || ''}
      onChange={(v) => onChange(parseInt(v))}
      options={options}
      placeholder="Selecionar ano..."
      icon="📅"
      error={error}
      helper={`Anos disponíveis: ${BIRTH_YEARS[0]} - ${BIRTH_YEARS[BIRTH_YEARS.length - 1]}`}
    />
  );
};

// ============================================================================
// LEVEL CATEGORY SELECTOR
// ============================================================================

const LevelCategorySelector = ({ selected, onChange }) => {
  const categories = Object.values(LEVEL_CATEGORIES);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
        Tema da Aventura
      </label>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.code}
            onClick={() => onChange(category.code)}
            className={`p-4 rounded-xl text-left transition-all ${
              selected === category.code
                ? 'bg-orange-50 ring-2 ring-orange-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{category.icon}</span>
              <span className="font-bold" style={{ color: COLORS.text }}>{category.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{category.description}</p>
            <div className="flex gap-1">
              {category.preview.map((icon, i) => (
                <span key={i} className="text-sm">{icon}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// FAMILY SETTINGS FORM
// ============================================================================

const FamilySettingsForm = ({ family, onSave, onCancel }) => {
  const [name, setName] = useState(family.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    if (showPasswordSection) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Introduz a palavra-passe atual';
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Mínimo 6 caracteres';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'As palavras-passe não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        name,
        ...(showPasswordSection && { newPassword }),
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <SectionHeader 
        icon="👨‍👩‍👧‍👦" 
        title="Definições da Família" 
        subtitle="Edita o nome e a palavra-passe"
      />

      <InputField
        label="Nome da Família"
        value={name}
        onChange={setName}
        placeholder="Ex: Família Silva"
        error={errors.name}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
          Email
        </label>
        <div className="px-4 py-3 rounded-xl bg-gray-100 text-gray-500">
          {family.email}
        </div>
        <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
      </div>

      {/* Password section toggle */}
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
            <InputField
              label="Palavra-passe atual"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              error={errors.currentPassword}
            />
            <InputField
              label="Nova palavra-passe"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              error={errors.newPassword}
              helper="Mínimo 6 caracteres"
            />
            <InputField
              label="Confirmar nova palavra-passe"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button onClick={handleSave} fullWidth>
          💾 Guardar
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// CHILD SETTINGS FORM
// ============================================================================

const ChildSettingsForm = ({ child, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState(child?.name || '');
  const [avatar, setAvatar] = useState(child?.avatar || '👧');
  const [birthYear, setBirthYear] = useState(child?.birthYear || '');
  const [levelCategory, setLevelCategory] = useState(child?.levelCategory || 'EXPLORERS');
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isNew = !child?.id;
  const age = birthYear ? currentYear - birthYear : null;

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    if (!birthYear) {
      newErrors.birthYear = 'Seleciona o ano de nascimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        id: child?.id,
        name,
        avatar,
        birthYear: parseInt(birthYear),
        levelCategory,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <SectionHeader 
        icon={isNew ? '➕' : '✏️'} 
        title={isNew ? 'Adicionar Criança' : `Editar ${child.name}`}
        subtitle={isNew ? 'Cria um novo perfil de leitura' : 'Atualiza o perfil de leitura'}
      />

      {/* Preview */}
      <div className="flex items-center justify-center mb-6 p-4 bg-orange-50 rounded-xl">
        <div className="text-center">
          <span className="text-5xl">{avatar}</span>
          <p className="font-bold mt-2" style={{ color: COLORS.text }}>{name || 'Nome'}</p>
          <p className="text-sm text-gray-500">
            {age ? `${age} anos` : '-- anos'}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span>{LEVEL_CATEGORIES[levelCategory]?.icon}</span>
            <span className="text-sm text-gray-500">{LEVEL_CATEGORIES[levelCategory]?.name}</span>
          </div>
        </div>
      </div>

      <InputField
        label="Nome"
        value={name}
        onChange={setName}
        placeholder="Ex: Maria"
        error={errors.name}
      />

      <AvatarSelector selected={avatar} onChange={setAvatar} />

      <BirthYearSelect 
        value={birthYear} 
        onChange={setBirthYear}
        error={errors.birthYear}
      />

      <LevelCategorySelector selected={levelCategory} onChange={setLevelCategory} />

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button onClick={handleSave} fullWidth>
          💾 {isNew ? 'Criar' : 'Guardar'}
        </Button>
      </div>

      {/* Delete option (only for existing children) */}
      {!isNew && (
        <div className="mt-6 pt-6 border-t">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full text-center text-red-500 text-sm hover:text-red-600"
            >
              🗑️ Remover criança
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-red-700 mb-3 text-center">
                Tens a certeza? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowDeleteConfirm(false)} 
                  fullWidth
                  size="small"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => onDelete(child.id)} 
                  fullWidth
                  size="small"
                >
                  🗑️ Confirmar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CHILD LIST ITEM
// ============================================================================

const ChildListItem = ({ child, onClick }) => {
  const category = LEVEL_CATEGORIES[child.levelCategory];
  const age = currentYear - child.birthYear;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <span className="text-4xl">{child.avatar}</span>
      <div className="flex-1">
        <p className="font-bold" style={{ color: COLORS.text }}>{child.name}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{age} anos</span>
          <span>•</span>
          <span>{category?.icon} {category?.name}</span>
        </div>
      </div>
      <span className="text-gray-400">✏️</span>
    </div>
  );
};

// ============================================================================
// MAIN SETTINGS PAGE
// ============================================================================

const SettingsPage = () => {
  const [family, setFamily] = useState(MOCK_FAMILY);
  const [children, setChildren] = useState(MOCK_CHILDREN);
  const [activeView, setActiveView] = useState('list'); // 'list', 'family', 'child'
  const [editingChild, setEditingChild] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveFamily = (data) => {
    setFamily({ ...family, ...data });
    setActiveView('list');
    showToast('Família atualizada com sucesso!');
  };

  const handleSaveChild = (data) => {
    if (data.id) {
      // Update existing
      setChildren(children.map(c => c.id === data.id ? data : c));
      showToast('Criança atualizada com sucesso!');
    } else {
      // Create new
      const newChild = { ...data, id: `c${Date.now()}` };
      setChildren([...children, newChild]);
      showToast('Criança adicionada com sucesso!');
    }
    setActiveView('list');
    setEditingChild(null);
  };

  const handleDeleteChild = (childId) => {
    setChildren(children.filter(c => c.id !== childId));
    setActiveView('list');
    setEditingChild(null);
    showToast('Criança removida', 'warning');
  };

  const handleEditChild = (child) => {
    setEditingChild(child);
    setActiveView('child');
  };

  const handleAddChild = () => {
    setEditingChild(null);
    setActiveView('child');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Toast notification */}
      {toast && (
        <div 
          className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white text-center font-medium shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'warning' ? 'bg-orange-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10" style={{ borderColor: COLORS.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {activeView !== 'list' && (
              <button
                onClick={() => {
                  setActiveView('list');
                  setEditingChild(null);
                }}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
              >
                ←
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: COLORS.text }}>
                {activeView === 'list' ? '⚙️ Definições' :
                 activeView === 'family' ? '👨‍👩‍👧‍👦 Família' :
                 editingChild ? `✏️ ${editingChild.name}` : '➕ Nova Criança'}
              </h1>
              {activeView === 'list' && (
                <p className="text-sm text-gray-500">Gere a tua família e crianças</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {activeView === 'list' && (
          <div className="space-y-6">
            {/* Family section */}
            <div>
              <SectionHeader 
                icon="👨‍👩‍👧‍👦" 
                title="Família" 
              />
              <div 
                onClick={() => setActiveView('family')}
                className="bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                  🏠
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: COLORS.text }}>{family.name}</p>
                  <p className="text-sm text-gray-500">{family.email}</p>
                </div>
                <span className="text-gray-400">✏️</span>
              </div>
            </div>

            {/* Children section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionHeader 
                  icon="👶" 
                  title="Crianças" 
                />
                <Button size="small" onClick={handleAddChild}>
                  ➕ Adicionar
                </Button>
              </div>
              
              {children.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center">
                  <span className="text-5xl block mb-3">👶</span>
                  <p className="font-bold mb-1" style={{ color: COLORS.text }}>Nenhuma criança</p>
                  <p className="text-sm text-gray-500 mb-4">Adiciona uma criança para começar</p>
                  <Button onClick={handleAddChild}>
                    ➕ Adicionar Criança
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {children.map(child => (
                    <ChildListItem 
                      key={child.id} 
                      child={child}
                      onClick={() => handleEditChild(child)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* App info */}
            <div className="text-center pt-6 text-sm text-gray-400">
              <p>📚 Passaporte do Leitor</p>
              <p>Versão 1.0.0</p>
            </div>
          </div>
        )}

        {activeView === 'family' && (
          <FamilySettingsForm
            family={family}
            onSave={handleSaveFamily}
            onCancel={() => setActiveView('list')}
          />
        )}

        {activeView === 'child' && (
          <ChildSettingsForm
            child={editingChild}
            onSave={handleSaveChild}
            onCancel={() => {
              setActiveView('list');
              setEditingChild(null);
            }}
            onDelete={handleDeleteChild}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
