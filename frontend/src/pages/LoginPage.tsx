import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [displayName, setDisplayName] = useState('');
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setPending(true);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password, displayName || username);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : '失败');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <span className="halo-pulse w-[520px] h-[520px] bg-primary/40 top-10 left-6 rounded-full absolute pointer-events-none" />
      <div className="relative z-10 w-full max-w-md pixel-card space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">PawTrace</h1>
          <p className="text-sm text-gray-600 mt-1">太仓校园 · 宠物与地图</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${mode === 'login' ? 'bg-primary/90 text-dark' : 'bg-white/50'}`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-xl text-sm font-medium ${mode === 'register' ? 'bg-primary/90 text-dark' : 'bg-white/50'}`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-gray-500">显示名</label>
              <input
                className="pixel-input mt-1"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="可选"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500">用户名</label>
            <input
              className="pixel-input mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">密码</label>
            <input
              type="password"
              className="pixel-input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button type="submit" className="pixel-button w-full" disabled={pending}>
            {pending ? '…' : mode === 'login' ? '进入' : '创建账号'}
          </button>
        </form>
        <p className="text-[11px] text-gray-500">演示账号：demo / demo123（需先 seed 数据库）</p>
      </div>
    </div>
  );
}
