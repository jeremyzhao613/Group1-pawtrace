import { useAuth } from '@/context/AuthContext';
import { LiquidPageHeader } from '@/components/LiquidPageHeader';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-4">
      <LiquidPageHeader
        eyebrow="Identity Glass"
        title="个人资料"
        description="把个人信息放进一层更安静的液态玻璃里，重点信息更集中，背景依然保持轻盈。"
        stats={[
          { label: '身份', value: 'Owner' },
          { label: '监控入口', value: 'Ready' },
        ]}
      />
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
        className="liquid-inline-link"
      >
        打开 Monitor 控制台（新窗口）
      </a>
    </div>
  );
}
