import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LiquidGlassBackdrop } from '@/components/LiquidGlassBackdrop';

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
    <div id="login-screen" className="min-h-screen relative overflow-hidden px-6 py-16">
      <LiquidGlassBackdrop variant="login" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr,0.92fr]">
        <section className="liquid-login-story">
          <div className="space-y-4">
            <span className="liquid-status-pill">Apple-like liquid motion</span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-dark sm:text-5xl">
                会呼吸、会反光、会漂浮的玻璃感宠物面板
              </h1>
              <p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                用柔和折射、高光滑动和分层漂浮，把地图、健康、聊天、提醒做成更接近 iPhone 玻璃界面的体验。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="liquid-status-pill">Live map</span>
            <span className="liquid-status-pill">Health lens</span>
            <span className="liquid-status-pill">Smart summary</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="liquid-story-card">
              <p className="liquid-kicker">Light Drift</p>
              <p className="text-sm leading-6 text-gray-700">顶部高光缓慢滑过玻璃边缘，模拟手机界面里那种轻微折射。</p>
            </article>
            <article className="liquid-story-card">
              <p className="liquid-kicker">Floating Layers</p>
              <p className="text-sm leading-6 text-gray-700">前景卡片和背景彩色气泡分层漂浮，不是死板的毛玻璃截图。</p>
            </article>
            <article className="liquid-story-card">
              <p className="liquid-kicker">Soft Depth</p>
              <p className="text-sm leading-6 text-gray-700">透明层、内高光和阴影一起工作，做出有厚度但不沉重的表面。</p>
            </article>
            <article className="liquid-story-card">
              <p className="liquid-kicker">Quiet Motion</p>
              <p className="text-sm leading-6 text-gray-700">动画节奏偏慢，避免像游戏 UI 一样晃动过多，保持高级感。</p>
            </article>
          </div>
        </section>
        <section className="glass-panel liquid-auth-panel space-y-6">
          <div className="space-y-2">
            <p className="liquid-kicker">PawTrace Access</p>
            <div>
              <h2 className="text-2xl font-semibold text-dark">进入宠物面板</h2>
              <p className="mt-1 text-sm text-gray-600">太仓校园 · 宠物与地图</p>
            </div>
          </div>
          <div className="liquid-segment-wrap">
            <button
              type="button"
              className={`liquid-segment-button ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              登录
            </button>
            <button
              type="button"
              className={`liquid-segment-button ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              注册
            </button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="liquid-fieldset">
                <label className="text-xs text-gray-500">显示名</label>
                <input
                  className="pixel-input mt-2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="可选"
                />
              </div>
            )}
            <div className="liquid-fieldset">
              <label className="text-xs text-gray-500">用户名</label>
              <input
                className="pixel-input mt-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="liquid-fieldset">
              <label className="text-xs text-gray-500">密码</label>
              <input
                type="password"
                className="pixel-input mt-2"
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
        </section>
      </div>
    </div>
  );
}
