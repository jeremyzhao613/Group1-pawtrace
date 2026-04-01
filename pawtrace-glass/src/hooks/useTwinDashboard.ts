import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from 'react';
import {
  buildDashboardSnapshot,
  eventMeta,
  getPoiById,
  poiCatalog,
  timelineStops,
} from '@/data/mockTwinData';
import type { PoiId } from '@/types';

const DEFAULT_POI: PoiId = 'stadium';

export const useTwinDashboard = () => {
  const [activePoiId, setActivePoiId] = useState<PoiId>(DEFAULT_POI);
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState(() =>
    buildDashboardSnapshot(DEFAULT_POI, 0),
  );

  const refreshSnapshot = useEffectEvent((nextPoiId: PoiId, nextTick: number) => {
    const nextSnapshot = buildDashboardSnapshot(nextPoiId, nextTick);

    startTransition(() => {
      setSnapshot(nextSnapshot);
    });
  });

  useEffect(() => {
    refreshSnapshot(activePoiId, tick);
  }, [activePoiId, refreshSnapshot, tick]);

  useEffect(() => {
    const refreshId = window.setInterval(() => {
      setTick((currentTick) => currentTick + 1);
    }, 4200);

    return () => {
      window.clearInterval(refreshId);
    };
  }, []);

  return {
    activePoiId,
    eventMeta,
    pois: poiCatalog,
    selectedPoi: getPoiById(activePoiId),
    setActivePoiId,
    snapshot: useDeferredValue(snapshot),
    timelineStops,
  };
};
