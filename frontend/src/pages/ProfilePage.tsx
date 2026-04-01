import { useAuth } from '@/context/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-dark">个人资料</h2>
      <div className="pixel-card space-y-2">
        <p>
          <span className="text-xs text-gray-500">显示名</span>
          <br />
          {user.displayName}
        </p>
        <p>
          <span className="text-xs text-gray-500">用户名</span>
          <br />
          {user.username}
        </p>
        <p>
          <span className="text-xs text-gray-500">校区</span>
          <br />
          {user.campus || '—'}
        </p>
        <p>
          <span className="text-xs text-gray-500">简介</span>
          <br />
          {user.bio || '—'}
        </p>
      </div>
      <a
        href="/monitor/index.html"
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm text-primary underline"
      >
        打开 Monitor 控制台（新窗口）
      </a>
    </div>
  );
}
