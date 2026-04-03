import { useMemo, useState } from 'react';
import { LiquidPageHeader } from '@/components/LiquidPageHeader';

const DEMO_LOCATIONS = [
  {
    id: 'pawprint-cafe',
    name: 'Pawprint Café',
    type: 'Pet café & bakery',
    description: '阳光露台、宠物友好点心与咖啡。',
    rating: '4.9 · 520 reviews',
    coords: { x: 32, y: 28 },
  },
  {
    id: 'lucky-pet-garden',
    name: 'Lucky Pet Garden',
    type: '植物园步道',
    description: '树荫小径与喷泉，适合牵绳散步。',
    rating: '4.8 · 310 reviews',
    coords: { x: 57, y: 44 },
  },
  {
    id: 'pawfect-gear',
    name: 'Pawfect Gear Studio',
    type: '宠物精品',
    description: '定制项圈、可降解玩具与旅行套装。',
    rating: '5.0 · 118 reviews',
    coords: { x: 70, y: 20 },
  },
];

const MAP_ANIMALS = [
  { name: 'Bao', emoji: '🐶', coords: { x: 25, y: 62 } },
  { name: 'Mochi', emoji: '🐱', coords: { x: 56, y: 40 } },
  { name: 'Nimbus', emoji: '🐶', coords: { x: 68, y: 18 } },
];

export function MapPage() {
  const [active, setActive] = useState(DEMO_LOCATIONS[0]);

  const markers = useMemo(() => DEMO_LOCATIONS, []);

  return (
    <div className="space-y-4">
      <LiquidPageHeader
        eyebrow="Map Pulse"
        title="校园地图"
        description="像液态玻璃一样把实时位置、常去地点和地图动态叠在一起，信息更轻，但层次更深。"
        stats={[
          { label: '热点地点', value: '3' },
          { label: '在线宠物', value: '3' },
        ]}
      />
      <div className="liquid-map-stage relative aspect-[4/3] max-h-[420px] overflow-hidden rounded-3xl">
        <img
          src="/assets/m2.png"
          alt="campus map"
          className="w-full h-full object-cover opacity-90"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {markers.map((loc) => (
              <button
                key={loc.id}
                type="button"
                className={`map-marker absolute -translate-x-1/2 -translate-y-1/2 ${active?.id === loc.id ? 'map-marker--active ring-2 ring-dark' : ''}`}
                style={{ left: `${loc.coords.x}%`, top: `${loc.coords.y}%` }}
                onClick={() => setActive(loc)}
              >
                <span aria-hidden>🐾</span>
              </button>
            ))}
            {MAP_ANIMALS.map((a) => (
              <div
                key={a.name}
                className="map-pet absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 text-[10px] pointer-events-none"
                style={{ left: `${a.coords.x}%`, top: `${a.coords.y}%` }}
              >
                <span className="rounded-full bg-white/90 px-1 shadow">{a.emoji}</span>
                <span className="bg-dark/80 text-white px-1 rounded">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {active && (
        <div className="pixel-card space-y-2">
          <p className="text-sm font-semibold">{active.name}</p>
          <p className="text-xs text-gray-500">{active.type}</p>
          <p className="text-sm text-gray-700">{active.description}</p>
          <p className="text-xs text-gray-400">{active.rating}</p>
        </div>
      )}
      <p className="text-[11px] text-gray-500">地图资源：public 目录下 /assets/m2.png（可替换为校园图）</p>
    </div>
  );
}
