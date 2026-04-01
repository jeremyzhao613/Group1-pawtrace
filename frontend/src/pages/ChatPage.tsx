import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/api/client';

const CONTACTS = [
  { id: 'c1', name: 'Lily', pet: 'Mocha' },
  { id: 'c2', name: 'Eric', pet: 'Pixel' },
  { id: 'c3', name: 'Mia', pet: 'Mochi' },
  { id: 'c4', name: 'Leo', pet: 'Kiko' },
];

type Msg = { role: string; content: string };

export function ChatPage() {
  const [contactId, setContactId] = useState('c1');
  const [input, setInput] = useState('');
  const qc = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ['chat', contactId],
    queryFn: () => apiFetch<{ history: Msg[] }>('/api/chat/history/' + contactId),
  });

  const send = useMutation({
    mutationFn: async () => {
      const text = input.trim();
      if (!text) return;
      const messages = [{ role: 'user', content: text }];
      const res = await apiFetch<{ reply: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          contactId,
          messages,
          contactProfile: CONTACTS.find((c) => c.id === contactId)?.name,
        }),
      });
      return res;
    },
    onSuccess: () => {
      setInput('');
      void qc.invalidateQueries({ queryKey: ['chat', contactId] });
    },
  });

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-8rem)]">
      <h2 className="text-lg font-semibold text-dark">AI 聊天</h2>
      <div className="flex gap-1 flex-wrap">
        {CONTACTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setContactId(c.id)}
            className={`text-xs px-2 py-1 rounded-lg border ${contactId === c.id ? 'border-dark bg-primary/30' : 'border-white/60'}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pixel-card space-y-2 min-h-[200px]">
        {history?.history.map((m, i) => (
          <div
            key={i}
            className={`text-sm ${m.role === 'assistant' ? 'text-dark' : 'text-blue-900'}`}
          >
            <span className="text-[10px] text-gray-400">{m.role}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {send.isError && (
          <p className="text-xs text-red-600">
            {(send.error as Error).message}（请配置后端 DASHSCOPE_API_KEY）
          </p>
        )}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send.mutate();
        }}
      >
        <input
          className="pixel-input flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="说点什么…"
        />
        <button type="submit" className="pixel-button" disabled={send.isPending}>
          发送
        </button>
      </form>
    </div>
  );
}
