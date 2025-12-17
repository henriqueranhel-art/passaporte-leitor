import { NavLink, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { useFamily, useStore } from '../lib/store';
import { useState } from 'react';

// ============================================================================
// LAYOUT WITH RESPONSIVE SIDEBAR
// ============================================================================

export default function Layout() {
  const family = useFamily();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: '🏠', label: 'Início' },
    { to: '/mapa', icon: '🗺️', label: 'Mapa' },
    { to: '/livros', icon: '📚', label: 'Livros' },
    { to: '/conquistas', icon: '🏆', label: 'Conquistas' },
    { to: '/imprimir', icon: '🖨️', label: 'Imprimir' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide in when open */}
      <aside className={clsx(
        "fixed lg:sticky top-0 h-screen w-64 p-6 border-r border-gray-200 bg-white flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

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

        {/* Family Info & Logout */}
        <div className="p-4 rounded-xl bg-background mb-6">
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

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsSidebarOpen(false)}
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
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Mobile Header with Hamburger */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <span className="font-bold text-gray-800">Passaporte do Leitor</span>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 z-30">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px]',
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-gray-500'
                )
              }
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
