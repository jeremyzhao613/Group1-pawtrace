export type PoiId =
  | 'stadium'
  | 'airport'
  | 'shopping_mall'
  | 'turnstile'
  | 'telecom_tower';

export interface HeroMetric {
  label: string;
  value: string;
  note: string;
}

export interface MetricItem {
  label: string;
  value: number;
  unit: string;
  decimals?: number;
  delta: number;
}

export interface NetworkIndicator {
  label: string;
  value: number;
  suffix: string;
  note: string;
}

export interface ChartSeries {
  title: string;
  unit: string;
  labels: string[];
  values: number[];
}

export interface TimelineStop {
  id: PoiId;
  label: string;
  note: string;
  eta: string;
}

export interface PoiRecord {
  id: PoiId;
  name: string;
  shortLabel: string;
  category: string;
  status: string;
  color: string;
  description: string;
  overview: string;
  statusNote: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  focusTarget: [number, number, number];
  mapPosition: [number, number];
  model: PoiId;
  metrics: MetricItem[];
  network: NetworkIndicator[];
  throughput: number[];
  availability: number[];
  alerts: string[];
}

export interface EventMeta {
  eventName: string;
  venue: string;
  city: string;
  program: string;
  dateLabel: string;
  openingWindow: string;
}

export interface DashboardSnapshot {
  hero: HeroMetric[];
  metrics: MetricItem[];
  network: NetworkIndicator[];
  throughput: ChartSeries;
  availability: ChartSeries;
  alerts: string[];
}
