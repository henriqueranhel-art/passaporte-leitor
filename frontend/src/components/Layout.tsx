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
    { to: '/leituras', icon: '📖', label: 'Leituras' },
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

        {/* Family Info */}
        {family && (
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm mb-6">
            <div className="p-4 flex items-center gap-4">
              {/* Family avatar */}
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl">
                👨‍👩‍👧‍👦
              </div>

              {/* Family info */}
              <div className="flex-1">
                <p className="text-xs text-gray-500">Família</p>
                <h2 className="font-bold text-gray-800 text-lg">{family.name}</h2>
              </div>
            </div>
          </div>
        )}

        {/* Settings and Logout */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-6">
          <div className="flex">
            <NavLink
              to="/definicoes"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors border-r border-gray-100',
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
                )
              }
            >
              <span>⚙️</span>
              <span className="text-sm font-medium text-gray-600">Definições</span>
            </NavLink>
            <button
              onClick={() => useStore.getState().logout()}
              className="flex-1 py-3 px-4 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors active:bg-red-100"
            >
              <span>🚪</span>
              <span className="text-sm font-medium text-red-500">Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
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
        <div className="p-4 rounded-xl bg-green-50 mb-4">
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
