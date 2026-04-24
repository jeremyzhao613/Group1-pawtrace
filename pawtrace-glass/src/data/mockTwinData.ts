import type {
  DashboardSnapshot,
  EventMeta,
  HeroMetric,
  PoiId,
  PoiRecord,
  TimelineStop,
} from '@/types';

const timeLabels = ['18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45'];

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const compact = (value: number) => compactFormatter.format(value);

const oscillate = (
  value: number,
  tick: number,
  amplitude: number,
  phase = 0,
  precision = 0,
) => Number((value + Math.sin(tick * 0.82 + phase) * amplitude).toFixed(precision));

const oscillateSeries = (
  values: number[],
  tick: number,
  amplitude: number,
  precision = 1,
) =>
  values.map((value, index) =>
    Number(
      (
        value +
        Math.sin(tick * 0.63 + index * 0.41) * amplitude +
        Math.cos(tick * 0.37 + index * 0.27) * amplitude * 0.35
      ).toFixed(precision),
    ),
  );

export const eventMeta: EventMeta = {
  eventName: 'PawTrace Pulse Twin',
  venue: 'Harbor Stadium Operations Command',
  city: 'Shanghai',
  program: 'Live crowd, device, transport, and access intelligence',
  dateLabel: 'March 25, 2026',
  openingWindow: 'Doors open 18:30 CST',
};

export const timelineStops: TimelineStop[] = [
  {
    id: 'stadium',
    label: 'Bowl',
    note: 'Opening anchor and crowd core',
    eta: '00:00',
  },
  {
    id: 'airport',
    label: 'Airport',
    note: 'Ingress travel pressure',
    eta: '00:12',
  },
  {
    id: 'shopping_mall',
    label: 'Retail',
    note: 'Commercial spillover',
    eta: '00:24',
  },
  {
    id: 'turnstile',
    label: 'Gate',
    note: 'Ticketing and access lanes',
    eta: '00:36',
  },
  {
    id: 'telecom_tower',
    label: 'Tower',
    note: 'Coverage and backhaul health',
    eta: '00:48',
  },
];

export const poiCatalog: PoiRecord[] = [
  {
    id: 'stadium',
    name: 'Stadium',
    shortLabel: 'Stadium',
    category: 'Venue Core',
    status: 'Prime Flow',
    color: '#d6a75a',
    description:
      'Main bowl with premium seating, broadcast pathways, and synchronized access lanes.',
    overview:
      'The stadium remains the densest telemetry zone, driving most concurrent device attachment and peak downlink demand.',
    statusNote:
      'Core bowl is stable, light bands are active, and ingress load is smoothing into a balanced plateau.',
    position: [0, 0, 0],
    cameraPosition: [9.2, 5.8, 10.2],
    focusTarget: [0, 1.1, 0],
    mapPosition: [52, 48],
    model: 'stadium',
    metrics: [
      { label: 'Crowd Size', value: 68420, unit: 'people', delta: 3.8 },
      { label: 'Device Count', value: 123880, unit: 'devices', delta: 2.1 },
      { label: 'Data Usage', value: 8.6, unit: 'TB', decimals: 1, delta: 5.4 },
    ],
    network: [
      { label: 'Availability', value: 99.92, suffix: '%', note: 'Cross-bowl WLAN and DAS uptime' },
      { label: 'Coverage', value: 97.8, suffix: '%', note: 'Seating deck, concourse, and plaza blend' },
      { label: 'Latency', value: 14, suffix: 'ms', note: 'Median edge response at event peak' },
    ],
    throughput: [42.1, 48.5, 54.3, 59.6, 66.8, 73.4, 78.8, 81.2],
    availability: [99.31, 99.38, 99.45, 99.52, 99.61, 99.67, 99.71, 99.76],
    alerts: ['Concourse sector C under elevated uplink demand', 'Broadcast backbone running on primary loop'],
  },
  {
    id: 'airport',
    name: 'Airport',
    shortLabel: 'Airport',
    category: 'Transit Node',
    status: 'Stable Ingress',
    color: '#74c6c0',
    description:
      'Arrival staging node linking airside transit, shuttle dispatch, and venue ingress predictions.',
    overview:
      'Airport telemetry captures passenger arrival pulses and helps anticipate venue demand 30 to 45 minutes ahead of entry.',
    statusNote:
      'Flight banks are aligned with shuttle cadence and inbound demand is tracking within forecast.',
    position: [7.8, 0, -6.4],
    cameraPosition: [13.4, 4.6, -3.4],
    focusTarget: [7.8, 0.9, -6.4],
    mapPosition: [74, 26],
    model: 'airport',
    metrics: [
      { label: 'Crowd Size', value: 13840, unit: 'people', delta: 1.4 },
      { label: 'Device Count', value: 26550, unit: 'devices', delta: 0.8 },
      { label: 'Data Usage', value: 2.9, unit: 'TB', decimals: 1, delta: 2.7 },
    ],
    network: [
      { label: 'Availability', value: 99.78, suffix: '%', note: 'Terminal uplink and curbside mesh' },
      { label: 'Coverage', value: 96.6, suffix: '%', note: 'Arrival concourse and transit apron' },
      { label: 'Latency', value: 18, suffix: 'ms', note: 'Average handoff to metro edge' },
    ],
    throughput: [18.4, 21.1, 24.6, 27.9, 31.5, 34.2, 36.8, 38.5],
    availability: [99.08, 99.15, 99.23, 99.29, 99.34, 99.41, 99.47, 99.53],
    alerts: ['Passenger burst detected on gate-side shuttle channel', 'Backhaul reserve lane remains cold standby'],
  },
  {
    id: 'shopping_mall',
    name: 'Shopping Mall',
    shortLabel: 'Mall',
    category: 'Retail District',
    status: 'Spillover Live',
    color: '#f0ba6d',
    description:
      'Retail cluster feeding pre-event dwell time, food and beverage traffic, and post-match commercial overflow.',
    overview:
      'Mall movement helps quantify pre-entry spending patterns and predicts post-event crowd dispersion across the district.',
    statusNote:
      'Retail dwell time is high but queue pressure is still below the evening threshold.',
    position: [-8.6, 0, -4.1],
    cameraPosition: [-9.6, 4.3, 2.3],
    focusTarget: [-8.6, 0.8, -4.1],
    mapPosition: [23, 34],
    model: 'shopping_mall',
    metrics: [
      { label: 'Crowd Size', value: 11420, unit: 'people', delta: 2.6 },
      { label: 'Device Count', value: 19880, unit: 'devices', delta: 1.9 },
      { label: 'Data Usage', value: 2.1, unit: 'TB', decimals: 1, delta: 4.1 },
    ],
    network: [
      { label: 'Availability', value: 99.66, suffix: '%', note: 'Indoor retail repeaters and Wi-Fi 6' },
      { label: 'Coverage', value: 95.2, suffix: '%', note: 'Atrium, food court, and outer plaza' },
      { label: 'Latency', value: 16, suffix: 'ms', note: 'Application median for checkout apps' },
    ],
    throughput: [15.8, 18.2, 20.6, 23.4, 26.3, 28.1, 30.7, 31.4],
    availability: [99.02, 99.09, 99.14, 99.22, 99.28, 99.35, 99.41, 99.46],
    alerts: ['Atrium digital signage switched to high-frequency mode', 'Food hall payment cluster at 74 percent load'],
  },
  {
    id: 'turnstile',
    name: 'Turnstile',
    shortLabel: 'Gate',
    category: 'Access Control',
    status: 'Lane Green',
    color: '#8fd4a4',
    description:
      'Turnstile and ticketing segment handling gate scanning, fraud screening, and entry queue balancing.',
    overview:
      'Turnstile analytics link ticket validation, queue density, and gate throughput to keep spectators moving at consistent speed.',
    statusNote:
      'Most lanes are under two-second scan time and the overflow gate remains idle.',
    position: [3.2, 0, 6.6],
    cameraPosition: [6.0, 3.4, 9.1],
    focusTarget: [3.2, 0.7, 6.6],
    mapPosition: [61, 71],
    model: 'turnstile',
    metrics: [
      { label: 'Crowd Size', value: 9260, unit: 'people', delta: 4.3 },
      { label: 'Device Count', value: 17040, unit: 'devices', delta: 2.7 },
      { label: 'Data Usage', value: 1.4, unit: 'TB', decimals: 1, delta: 6.2 },
    ],
    network: [
      { label: 'Availability', value: 99.84, suffix: '%', note: 'Scanner mesh and access controller links' },
      { label: 'Coverage', value: 98.3, suffix: '%', note: 'Entry apron, security lanes, and ramps' },
      { label: 'Latency', value: 11, suffix: 'ms', note: 'Authentication round-trip for gate scans' },
    ],
    throughput: [12.8, 15.4, 19.8, 24.7, 27.2, 28.4, 26.6, 22.3],
    availability: [99.22, 99.31, 99.44, 99.58, 99.64, 99.72, 99.77, 99.81],
    alerts: ['Ticket validation burst expected at east concourse in 6 min', 'Queue balancing channel ready for reroute'],
  },
  {
    id: 'telecom_tower',
    name: 'Telecommunication Tower',
    shortLabel: 'Tower',
    category: 'Backhaul Node',
    status: 'Backhaul Ready',
    color: '#f6efe6',
    description:
      'Macro tower supervising spectrum load, uplink balancing, and district-wide transport resilience.',
    overview:
      'The telecom tower provides the cleanest read on district coverage, spectrum pressure, and emergency redundancy posture.',
    statusNote:
      'Backhaul reserve remains healthy and spectrum occupancy is inside the protected comfort band.',
    position: [-5.4, 0, 8.3],
    cameraPosition: [-8.3, 6.8, 10.5],
    focusTarget: [-5.4, 2.2, 8.3],
    mapPosition: [32, 78],
    model: 'telecom_tower',
    metrics: [
      { label: 'Crowd Size', value: 4120, unit: 'people', delta: 0.6 },
      { label: 'Device Count', value: 9820, unit: 'devices', delta: 1.2 },
      { label: 'Data Usage', value: 1.1, unit: 'TB', decimals: 1, delta: 2.5 },
    ],
    network: [
      { label: 'Availability', value: 99.97, suffix: '%', note: 'Macro layer and emergency failover' },
      { label: 'Coverage', value: 99.1, suffix: '%', note: 'District blanket and perimeter overlap' },
      { label: 'Latency', value: 9, suffix: 'ms', note: 'Fiber handoff and edge compute path' },
    ],
    throughput: [9.3, 10.2, 11.6, 12.9, 13.6, 14.3, 14.1, 13.8],
    availability: [99.48, 99.56, 99.61, 99.71, 99.79, 99.84, 99.89, 99.93],
    alerts: ['Secondary fiber ring has completed last integrity sweep', 'Spectrum guard-band remains above policy threshold'],
  },
];

const poiById = new Map<PoiId, PoiRecord>(poiCatalog.map((poi) => [poi.id, poi]));

export const getPoiById = (poiId: PoiId) => {
  const poi = poiById.get(poiId);

  if (!poi) {
    throw new Error(`Unknown POI: ${poiId}`);
  }

  return poi;
};

const buildHeroMetrics = (poi: PoiRecord, tick: number): HeroMetric[] => {
  const attendance = oscillate(poi.metrics[0].value, tick, poi.metrics[0].value * 0.02, 0.2, 0);
  const utilization = oscillate(86, tick, 5.6, poi.position[0], 1);
  const throughputPeak = Math.max(...poi.throughput) + Math.sin(tick * 0.41 + 0.6) * 1.2;
  const availabilityPeak = poi.availability[poi.availability.length - 1] + Math.cos(tick * 0.4) * 0.06;

  return [
    {
      label: 'Attendance',
      value: compact(attendance),
      note: 'Active people model',
    },
    {
      label: 'Utilization',
      value: `${utilization}%`,
      note: 'Venue capacity in use',
    },
    {
      label: 'Peak Throughput',
      value: `${throughputPeak.toFixed(1)} Gbps`,
      note: 'Rolling 15 min window',
    },
    {
      label: 'Accessibility',
      value: `${availabilityPeak.toFixed(2)}%`,
      note: 'District-wide service access',
    },
  ];
};

export const buildDashboardSnapshot = (
  activePoiId: PoiId,
  tick: number,
): DashboardSnapshot => {
  const poi = getPoiById(activePoiId);

  return {
    hero: buildHeroMetrics(poi, tick),
    metrics: poi.metrics.map((metric, index) => {
      const amplitude =
        metric.unit === 'TB'
          ? 0.28
          : metric.unit === 'people'
            ? metric.value * 0.024
            : metric.unit === 'devices'
              ? metric.value * 0.03
              : 1.4;

      return {
        ...metric,
        value: oscillate(metric.value, tick, amplitude, index + 0.4, metric.decimals ?? 0),
        delta: Number((metric.delta + Math.cos(tick * 0.48 + index) * 0.9).toFixed(1)),
      };
    }),
    network: poi.network.map((item, index) => ({
      ...item,
      value:
        item.suffix === '%'
          ? oscillate(item.value, tick, 0.48, index + 1.2, 2)
          : oscillate(item.value, tick, 1.3, index + 1.2, 0),
    })),
    throughput: {
      title: 'Throughput Chart',
      unit: 'Gbps',
      labels: timeLabels,
      values: oscillateSeries(poi.throughput, tick, 1.4, 1),
    },
    availability: {
      title: 'Availability Chart',
      unit: '%',
      labels: timeLabels,
      values: oscillateSeries(poi.availability, tick, 0.07, 2),
    },
    alerts: poi.alerts.map((alert, index) =>
      `${alert} · ${index === 0 ? 'Primary' : 'Fallback'} path synced`,
    ),
  };
};
