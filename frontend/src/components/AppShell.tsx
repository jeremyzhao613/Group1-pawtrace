import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LiquidGlassBackdrop } from '@/components/LiquidGlassBackdrop';

const nav = [
  { to: '/map', label: '地图', icon: '🗺️' },
  { to: '/pets', label: '宠物', icon: '🐾' },
  { to: '/chat', label: '聊天', icon: '💬' },
  { to: '/profile', label: '我的', icon: '👤' },
];

export function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden pb-28">
      <LiquidGlassBackdrop variant="app" />
      <div className="relative z-10 flex min-h-screen flex-col px-3 pt-3 sm:px-4 sm:pt-4">
        <header className="liquid-shell-bar sticky top-3 z-30 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="liquid-brand-badge">PT</div>
            <div className="min-w-0">
              <p className="liquid-kicker !mb-1 !tracking-[0.3em]">Liquid Glass</p>
              <p className="truncate text-sm font-semibold text-dark">PawTrace Companion</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="liquid-status-pill">Campus live</span>
            <span className="text-xs text-gray-600">{user?.displayName}</span>
          </div>
          <button type="button" className="liquid-ghost-button text-xs" onClick={logout}>
            退出
          </button>
        </header>
        <main className="relative z-10 mx-auto flex-1 w-full max-w-5xl px-1 pb-28 pt-4 sm:px-2">
          <Outlet />
        </main>
        <nav className="fixed bottom-4 left-1/2 z-40 w-[min(calc(100%-1.5rem),32rem)] -translate-x-1/2">
          <div className="liquid-nav-dock flex items-center justify-around gap-1 px-2 py-2 safe-area-pb">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `liquid-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="liquid-nav-link__icon">{n.icon}</span>
                <span className="liquid-nav-link__label">{n.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
