import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { to: '/map', label: '地图', icon: '🗺️' },
  { to: '/pets', label: '宠物', icon: '🐾' },
  { to: '/chat', label: '聊天', icon: '💬' },
  { to: '/profile', label: '我的', icon: '👤' },
];

export function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-white/60 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-dark">PawTrace</span>
        <span className="text-xs text-gray-600">{user?.displayName}</span>
        <button type="button" className="text-xs text-primary underline" onClick={logout}>
          退出
        </button>
      </header>
      <main className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/85 backdrop-blur border-t border-white/60 flex justify-around py-2 safe-area-pb">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-[10px] ${isActive ? 'text-dark font-semibold' : 'text-gray-500'}`
            }
          >
            <span className="text-lg">{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
