import { NavLink, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { useFamily, useStore } from '../lib/store';

// ============================================================================
// LAYOUT WITH SIDEBAR
// ============================================================================

export default function Layout() {
  const family = useFamily();

  const navItems = [
    { to: '/', icon: '🏠', label: 'Início' },
    { to: '/mapa', icon: '🗺️', label: 'Mapa' },
    { to: '/livros', icon: '📚', label: 'Livros' },
    { to: '/conquistas', icon: '🏆', label: 'Conquistas' },
    { to: '/imprimir', icon: '🖨️', label: 'Imprimir' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen p-6 border-r border-gray-200 bg-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-primary shadow-md">
            🗺️
          </div>
          <div>
            <h1 className="font-bold text-gray-800">Passaporte</h1>
            <p className="text-xs text-gray-500">do Leitor</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                  isActive
                    ? 'bg-background font-bold shadow-sm'
                    : 'hover:bg-gray-50'
                )
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-gray-800">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Family Info & Logout */}
        <div className="p-4 rounded-xl bg-background mt-4">
          {family ? (
            <>
              <p className="text-xs text-gray-500 mb-1">👨‍👩‍👧‍👦 Família</p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm text-gray-800">{family.name}</p>
                <button
                  onClick={() => useStore.getState().logout()}
                  className="text-xs text-red-400 hover:text-red-600 font-bold"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => useStore.getState().logout()}
              className="w-full text-sm text-red-400 hover:text-red-600 font-bold py-2"
            >
              🚪 Sair
            </button>
          )}
        </div>

        {/* Tip */}
        <div className="p-4 rounded-xl bg-green-50 mt-4">
          <p className="text-xs font-medium mb-1 text-green-700">🌿 Dica</p>
          <p className="text-xs text-gray-600">
            O passaporte físico é a estrela! Use esta plataforma apenas para
            registar livros rapidamente.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
