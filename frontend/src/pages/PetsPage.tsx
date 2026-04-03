import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/api/client';
import { LiquidPageHeader } from '@/components/LiquidPageHeader';

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  avatar: string;
  status: string;
};

export function PetsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => apiFetch<{ pets: Pet[] }>('/api/pets'),
  });

  const add = useMutation({
    mutationFn: () =>
      apiFetch<{ pet: Pet }>('/api/pets', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pets'] });
      setName('');
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => apiFetch('/api/pets/' + id, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['pets'] }),
  });

  return (
    <div className="space-y-4">
      <LiquidPageHeader
        eyebrow="Pet Library"
        title="宠物档案"
        description="用更通透的玻璃层展示宠物卡片，让头像、状态和日常备注像漂浮在同一个信息平面里。"
        stats={[
          { label: '当前宠物', value: String(data?.pets.length ?? 0) },
          { label: '新增入口', value: '1 tap' },
        ]}
      />
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) add.mutate();
        }}
      >
        <input
          className="pixel-input flex-1"
          placeholder="新宠物名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="pixel-button" disabled={add.isPending}>
          添加
        </button>
      </form>
      {isLoading && <p className="text-sm text-gray-500">加载中…</p>}
      <ul className="space-y-2">
        {data?.pets.map((p) => (
          <li key={p.id} className="pixel-card flex items-center gap-3 py-3">
            <img src={p.avatar} alt="" className="w-12 h-12 rounded-xl object-cover bg-white/80" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark truncate">{p.name}</p>
              <p className="text-xs text-gray-500">
                {p.type} · {p.breed}
              </p>
              <p className="text-xs text-gray-600 truncate">{p.status}</p>
            </div>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => {
                if (confirm('删除这只宠物？')) del.mutate(p.id);
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
