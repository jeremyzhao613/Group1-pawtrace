import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ApiUser = {
  id?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  campus?: string;
  contact?: string;
  bio?: string;
};

type ApiPet = {
  id: string;
  name: string;
  type?: string;
  breed?: string;
  avatar?: string;
  status?: string;
  health?: string;
};

type Telemetry = {
  id?: string;
  deviceId?: string;
  userId?: string | null;
  source?: string | null;
  transport?: string | null;
  timestamp?: string;
  receivedAt?: string;
  heartRateBpm?: number | null;
  batteryPct?: number | null;
  batteryMv?: number | null;
  tempC?: number | null;
  activity?: string | null;
  activityScore?: number | null;
  lat?: number | null;
  lon?: number | null;
  gpsValid?: boolean | null;
  gpsFix?: number | null;
  gpsSatsUsed?: number | null;
  gpsVisible?: number | null;
  gpsHdop?: number | null;
  locationValid?: boolean | null;
  lastLocationValid?: boolean | null;
  trackSamples?: number | null;
  geofenceEnabled?: boolean | null;
  distanceM?: number | null;
  lostAlert?: boolean | null;
  heartFound?: boolean | null;
  finger?: boolean | null;
  spo2Pct?: number | null;
  spo2Valid?: boolean | null;
  wifiConnected?: boolean | null;
  wifiRssi?: number | null;
  uploadEnabled?: boolean | null;
  uploadOk?: boolean | null;
  uploadCode?: number | null;
  bleConnected?: boolean | null;
  bleRssi?: number | null;
  bleMtu?: number | null;
  notifySeq?: number | null;
  metadata?: Record<string, unknown>;
};

type LocationPoint = {
  id: string;
  timestamp: string;
  lat: number;
  lon: number;
  source?: string;
};

type DashboardState = {
  token: string;
  user: ApiUser | null;
  pets: ApiPet[];
  latest: Telemetry | null;
  history: Telemetry[];
  points: LocationPoint[];
  error: string;
  loading: boolean;
  lastRefresh: string;
};

type MapCoordinate = {
  lat: number;
  lon: number;
  live: boolean;
  source: string;
  timestamp?: string;
};

type MapTile = {
  key: string;
  url: string;
  offsetX: number;
  offsetY: number;
};

type MapTileLoadState = {
  signature: string;
  loaded: Set<string>;
  failed: Set<string>;
};

const OSM_TILE_SIZE = 256;
const OSM_TILE_ZOOM = 16;
const OSM_TILE_RADIUS = 1;
const OSM_MAX_LAT = 85.05112878;

const demoPacket = {
  device_id: 'm5stickc-plus-1-1',
  source: 'm5stickc-plus-wifi',
  transport: 'wifi-http',
  battery_pct: 100,
  battery_mv: 4193,
  gps_fix: 0,
  gps_sats_used: 0,
  gps_visible: 16,
  gps_hdop: 25.5,
  lat: 0.0,
  lon: 0.0,
  location_valid: false,
  last_location_valid: false,
  track_samples: 0,
  geofence_enabled: false,
  distance_m: -1.0,
  lost_alert: false,
  heart_found: true,
  finger: false,
  pet_bpm: 0,
  spo2: 0,
  spo2_valid: false,
  temp_c: 32.5,
  activity: 'REST',
  activity_score: 0.5,
  wifi_connected: false,
  wifi_rssi: 0,
  upload_enabled: false,
  upload_ok: false,
  upload_code: 0,
};

const emptyState: DashboardState = {
  token: '',
  user: null,
  pets: [],
  latest: null,
  history: [],
  points: [],
  error: '',
  loading: true,
  lastRefresh: '',
};

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || import.meta.env.PAWTRACE_API_BASE_URL || '').trim().replace(/\/+$/, '');

function apiUrl(path: string) {
  const target = String(path || '');
  if (!target || /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(target) || /^(data|blob):/i.test(target)) return target;
  if (!API_BASE_URL) return target;
  const normalizedPath = target.startsWith('/') ? target : `/${target}`;
  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice('/api'.length)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

function formatDate(value?: string) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function numberLabel(value: unknown, suffix = '', digits = 0) {
  if (value === undefined || value === null || value === '') return '--';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '--';
  return `${numeric.toFixed(digits)}${suffix}`;
}

function boolLabel(value: unknown) {
  if (value === true) return 'YES';
  if (value === false) return 'NO';
  return '--';
}

function telemetrySourceLabel(latest: Telemetry | null) {
  if (!latest) return 'Waiting';
  const source = String(latest.source || latest.metadata?.source || '');
  const transport = String(latest.transport || latest.metadata?.transport || '');
  const joined = `${source} ${transport}`.toLowerCase();
  if (joined.includes('ble')) return 'BLE WiFi setup';
  if (joined.includes('wifi') || joined.includes('http')) return 'Wi-Fi HTTP';
  return source || transport || 'M5Stack';
}

function statusTone(value: unknown) {
  if (value === true) return 'good';
  if (value === false) return 'bad';
  return 'idle';
}

function hasNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return false;
  return Number.isFinite(Number(value));
}

function hasValidCoordinate(lat?: number | null, lon?: number | null) {
  if (lat === undefined || lat === null || lon === undefined || lon === null) return false;
  const numericLat = Number(lat);
  const numericLon = Number(lon);
  return Number.isFinite(numericLat)
    && Number.isFinite(numericLon)
    && numericLat >= -90
    && numericLat <= 90
    && numericLon >= -180
    && numericLon <= 180
    && !(numericLat === 0 && numericLon === 0);
}

function hasLiveCoordinateLock(telemetry: Telemetry | null) {
  if (!telemetry || !hasValidCoordinate(telemetry.lat, telemetry.lon)) return false;
  const explicitGpsValid = telemetry.locationValid ?? telemetry.gpsValid;
  if (explicitGpsValid === false) return false;
  if (Number(telemetry.gpsFix ?? 1) === 0) return false;
  return true;
}

function gpsStatusValue(telemetry: Telemetry | null) {
  if (!telemetry) return null;
  if (hasLiveCoordinateLock(telemetry)) return true;
  return telemetry.locationValid ?? telemetry.gpsValid ?? null;
}

function getLastPoint(points: LocationPoint[]) {
  return points.length ? points[points.length - 1] : null;
}

function getActiveCoordinate(latest: Telemetry | null, points: LocationPoint[], liveGpsValid: boolean): MapCoordinate | null {
  if (liveGpsValid && hasValidCoordinate(latest?.lat, latest?.lon)) {
    return {
      lat: Number(latest?.lat),
      lon: Number(latest?.lon),
      live: true,
      source: 'Live Wi-Fi GPS',
      timestamp: latest?.receivedAt || latest?.timestamp,
    };
  }

  const lastPoint = getLastPoint(points);
  if (lastPoint && hasValidCoordinate(lastPoint.lat, lastPoint.lon)) {
    return {
      lat: lastPoint.lat,
      lon: lastPoint.lon,
      live: false,
      source: 'Last valid GPS point',
      timestamp: lastPoint.timestamp,
    };
  }

  return null;
}

function osmOpenUrl(point: MapCoordinate) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=17/${point.lat}/${point.lon}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function coordinateToTile(point: MapCoordinate, zoom = OSM_TILE_ZOOM) {
  const lat = clamp(point.lat, -OSM_MAX_LAT, OSM_MAX_LAT);
  const scale = 2 ** zoom;
  const latRad = lat * Math.PI / 180;
  return {
    x: ((point.lon + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale,
  };
}

function osmTiles(point: MapCoordinate, zoom = OSM_TILE_ZOOM): MapTile[] {
  const center = coordinateToTile(point, zoom);
  const centerTileX = Math.floor(center.x);
  const centerTileY = Math.floor(center.y);
  const centerPixelX = center.x * OSM_TILE_SIZE;
  const centerPixelY = center.y * OSM_TILE_SIZE;
  const maxTile = 2 ** zoom - 1;
  const tiles: MapTile[] = [];

  for (let yOffset = -OSM_TILE_RADIUS; yOffset <= OSM_TILE_RADIUS; yOffset += 1) {
    for (let xOffset = -OSM_TILE_RADIUS; xOffset <= OSM_TILE_RADIUS; xOffset += 1) {
      const x = clamp(centerTileX + xOffset, 0, maxTile);
      const y = clamp(centerTileY + yOffset, 0, maxTile);
      tiles.push({
        key: `${zoom}-${x}-${y}-${xOffset}-${yOffset}`,
        url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        offsetX: x * OSM_TILE_SIZE - centerPixelX,
        offsetY: y * OSM_TILE_SIZE - centerPixelY,
      });
    }
  }

  return tiles;
}

function telemetryStreamUrl(token: string) {
  return apiUrl(`/api/device/telemetry/stream?limit=1&token=${encodeURIComponent(token)}`);
}

function telemetryFromStreamPayload(payload: unknown): Telemetry | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const record = payload as { telemetry?: Telemetry; latest?: Telemetry };
  return record.telemetry || record.latest || null;
}

function telemetryRowKey(row: Telemetry | null | undefined) {
  if (!row) return '';
  return String(row.id || [
    row.deviceId || '',
    row.receivedAt || row.timestamp || '',
    row.notifySeq ?? '',
  ].join(':'));
}

function prependTelemetryRow(history: Telemetry[], row: Telemetry, limit = 80) {
  const key = telemetryRowKey(row);
  return [
    row,
    ...history.filter((item) => telemetryRowKey(item) !== key),
  ].slice(0, limit);
}

function locationPointFromTelemetry(row: Telemetry): LocationPoint | null {
  if (!hasLiveCoordinateLock(row)) return null;
  return {
    id: `telemetry-${telemetryRowKey(row)}`,
    timestamp: row.receivedAt || row.timestamp || new Date().toISOString(),
    lat: Number(row.lat),
    lon: Number(row.lon),
    source: row.source || 'm5stickc-plus-wifi',
  };
}

function appendTelemetryPoint(points: LocationPoint[], row: Telemetry, limit = 80) {
  const point = locationPointFromTelemetry(row);
  if (!point) return points;
  return [
    ...points.filter((item) => item.id !== point.id),
    point,
  ].slice(-limit);
}

export default function App() {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [posting, setPosting] = useState(false);
  const [mapTileLoadState, setMapTileLoadState] = useState<MapTileLoadState>(() => ({
    signature: '',
    loaded: new Set(),
    failed: new Set(),
  }));
  const tokenRef = useRef('');
  const loginPromiseRef = useRef<Promise<string> | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  const apiFetch = useCallback(async (path: string, token: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const response = await fetch(apiUrl(path), { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${path}`);
    }
    return data;
  }, []);

  const ensureToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    if (loginPromiseRef.current) return loginPromiseRef.current;

    loginPromiseRef.current = (async () => {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo', password: 'demo123' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Unable to log in with demo account');
      }
      tokenRef.current = data.token;
      setState((current) => ({ ...current, token: data.token }));
      return data.token as string;
    })().finally(() => {
      loginPromiseRef.current = null;
    });

    return loginPromiseRef.current;
  }, []);

  const refresh = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const token = await ensureToken();
        const [me, pets, latest, history, points] = await Promise.all([
          apiFetch('/api/auth/me', token),
          apiFetch('/api/pets', token),
          apiFetch('/api/device/telemetry/latest?limit=8', token),
          apiFetch('/api/device/telemetry/history?limit=40', token),
          apiFetch('/api/location/points?limit=40', token),
        ]);

        setState((current) => ({
          ...current,
          token,
          user: me.user || null,
          pets: Array.isArray(pets.pets) ? pets.pets : [],
          latest: latest.latest || latest.telemetry?.[0] || null,
          history: Array.isArray(history.telemetry) ? history.telemetry : [],
          points: Array.isArray(points.points) ? points.points : [],
          error: '',
          loading: false,
          lastRefresh: new Date().toISOString(),
        }));
      } catch (err) {
        setState((current) => ({
          ...current,
          error: err instanceof Error ? err.message : 'Unable to refresh dashboard',
          loading: false,
        }));
      }
    })().finally(() => {
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, [apiFetch, ensureToken]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (typeof EventSource === 'undefined') return undefined;

    let stream: EventSource | null = null;
    let stopped = false;

    ensureToken()
      .then((token) => {
        if (stopped || !token) return;
        stream = new EventSource(telemetryStreamUrl(token));
        stream.addEventListener('telemetry', (event) => {
          try {
            const payload = JSON.parse((event as MessageEvent<string>).data);
            const telemetry = telemetryFromStreamPayload(payload);
            if (!telemetry?.deviceId) return;
            setState((current) => ({
              ...current,
              latest: telemetry,
              history: prependTelemetryRow(current.history, telemetry),
              points: appendTelemetryPoint(current.points, telemetry),
              error: '',
              loading: false,
              lastRefresh: new Date().toISOString(),
            }));
          } catch (err) {
            console.warn('Telemetry stream event parse failed', err);
          }
        });
      })
      .catch((err) => {
        setState((current) => ({
          ...current,
          error: err instanceof Error ? err.message : 'Unable to open telemetry stream',
          loading: false,
        }));
      });

    return () => {
      stopped = true;
      stream?.close();
    };
  }, [ensureToken]);

  const sendPacket = useCallback(async (packet: Record<string, unknown>) => {
    setPosting(true);
    try {
      const token = await ensureToken();
      await apiFetch('/api/device/telemetry', token, {
        method: 'POST',
        body: JSON.stringify({
          ...packet,
          timestamp: new Date().toISOString(),
        }),
      });
      await refresh();
    } catch (err) {
      setState((current) => ({
        ...current,
        error: err instanceof Error ? err.message : 'Unable to post demo telemetry',
      }));
    } finally {
      setPosting(false);
    }
  }, [apiFetch, ensureToken, refresh]);

  const sendDemoPacket = useCallback(() => sendPacket(demoPacket), [sendPacket]);

  const latest = state.latest;
  const sourceLabel = telemetrySourceLabel(latest);
  const latestGpsStatus = gpsStatusValue(latest);
  const liveGpsValid = hasLiveCoordinateLock(latest);
  const mapPoint = useMemo(
    () => getActiveCoordinate(latest, state.points, liveGpsValid),
    [liveGpsValid, latest, state.points],
  );
  const mapTiles = useMemo(() => (mapPoint ? osmTiles(mapPoint) : []), [mapPoint]);
  const mapTileSignature = useMemo(() => mapTiles.map((tile) => tile.key).join('|'), [mapTiles]);
  const mapLoading = state.loading && !mapPoint;
  const loadedMapTiles = mapTileLoadState.signature === mapTileSignature ? mapTileLoadState.loaded : new Set<string>();
  const failedMapTiles = mapTileLoadState.signature === mapTileSignature ? mapTileLoadState.failed : new Set<string>();
  const mapTilesReady = mapTiles.length > 0
    && failedMapTiles.size === 0
    && mapTiles.every((tile) => loadedMapTiles.has(tile.key));
  const mapBaseReady = !mapPoint || mapTilesReady || failedMapTiles.size > 0;
  const pageReady = !state.loading && !state.error && mapBaseReady;
  const mapLoadingLabel = failedMapTiles.size > 0
    ? 'Map fallback loaded'
    : `Loading map ${Math.min(loadedMapTiles.size, mapTiles.length)}/${mapTiles.length}`;
  const mapHeading = mapLoading
    ? 'Loading GPS data'
    : liveGpsValid
      ? 'Live Wi-Fi GPS on real map'
      : mapPoint
        ? 'Showing last valid GPS point'
        : 'Waiting for valid GPS fix';
  const mapStatusTone = liveGpsValid ? 'good' : mapPoint || mapLoading ? 'idle' : 'bad';
  const mapStatusText = mapLoading
    ? 'Loading coordinates'
    : liveGpsValid
      ? 'Live coordinate lock'
      : mapPoint
        ? 'Last point'
        : 'No coordinate lock';
  const activePet = state.pets[0];

  const kpis = [
    {
      label: 'Device',
      value: latest?.deviceId || 'Waiting',
      note: `${sourceLabel} · User ${state.user?.username || 'demo'}`,
      tone: 'idle',
    },
    {
      label: 'Battery',
      value: numberLabel(latest?.batteryPct, '%'),
      note: `${numberLabel(latest?.batteryMv, ' mV')} power rail`,
      tone: hasNumber(latest?.batteryPct) ? (Number(latest?.batteryPct) > 25 ? 'good' : 'bad') : 'idle',
    },
    {
      label: 'GPS Fix',
      value: boolLabel(latestGpsStatus),
      note: `${numberLabel(latest?.gpsVisible)} visible · HDOP ${numberLabel(latest?.gpsHdop, '', 1)}`,
      tone: statusTone(latestGpsStatus),
    },
    {
      label: 'Health',
      value: `${numberLabel(latest?.heartRateBpm)} BPM`,
      note: `Temp ${numberLabel(latest?.tempC, '°C', 1)} · SpO2 ${numberLabel(latest?.spo2Pct, '%')}`,
      tone: latest?.heartFound ? 'good' : 'idle',
    },
  ];

  return (
    <div className="dashboard-shell">
      <div className="ambient-grid" />
      <main className="dashboard">
        <header className="topbar panel">
          <div>
            <p className="eyebrow">PawTrace hardware database</p>
            <h1>GPS & Pet Health Telemetry Hub</h1>
            <p className="topbar-copy">
              M5StickC Plus Wi-Fi packets, PostgreSQL telemetry, user records, pet cards, GPS validity,
              geofence state, and health prototype signals in one operational view.
            </p>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={sendDemoPacket} disabled={posting}>
              {posting ? 'Posting packet...' : 'Send demo Wi-Fi packet'}
            </button>
            <span className={`status-pill ${pageReady ? 'good' : 'idle'}`}>
              {pageReady ? 'Page loaded' : 'Loading page'}
            </span>
            <span className={`status-pill ${state.error ? 'bad' : 'good'}`}>
              {state.error ? 'Backend warning' : 'Backend linked'}
            </span>
          </div>
        </header>

        {state.error ? <div className="error-banner">{state.error}</div> : null}

        <section className="kpi-grid">
          {kpis.map((item) => (
            <article className={`panel kpi-card ${item.tone}`} key={item.label}>
              <p className="eyebrow">{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </article>
          ))}
        </section>

        <section className="main-grid">
          <aside className="panel user-panel">
            <p className="eyebrow">User & pet content</p>
            <div className="user-card">
              <img src={state.user?.avatar || activePet?.avatar || '/assets/1.png'} alt="" />
              <div>
                <h2>{state.user?.displayName || 'Demo Owner'}</h2>
                <p>@{state.user?.username || 'demo'} · {state.user?.campus || 'Taicang'}</p>
                <span>{state.user?.contact || 'No contact saved'}</span>
              </div>
            </div>

            <div className="section-head">
              <h3>Pets from database</h3>
              <span>{state.pets.length} records</span>
            </div>
            <div className="pet-list">
              {state.pets.slice(0, 6).map((pet) => (
                <div className="pet-row" key={pet.id}>
                  <img src={pet.avatar || '/assets/1.png'} alt="" />
                  <div>
                    <strong>{pet.name}</strong>
                    <span>{pet.type || 'Pet'} · {pet.breed || 'Unknown'}</span>
                    <p>{pet.status || pet.health || 'No notes yet'}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="panel map-panel">
            <div className="map-head">
              <div>
                <p className="eyebrow">GPS status</p>
                <h2>{mapHeading}</h2>
              </div>
              <span className={`status-pill ${mapStatusTone}`}>{mapStatusText}</span>
            </div>

            <div className="gps-map real-map">
              {mapPoint ? (
                <>
                  <div className={`osm-tile-layer ${mapTilesReady ? 'ready' : ''}`} aria-hidden="true">
                    {mapTiles.map((tile) => (
                      <img
                        key={tile.key}
                        className="osm-tile"
                        src={tile.url}
                        alt=""
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        style={{
                          left: `calc(50% + ${tile.offsetX}px)`,
                          top: `calc(50% + ${tile.offsetY}px)`,
                        }}
                        onLoad={() => {
                          setMapTileLoadState((current) => {
                            const loaded = current.signature === mapTileSignature ? current.loaded : new Set<string>();
                            const failed = current.signature === mapTileSignature ? current.failed : new Set<string>();
                            if (current.signature === mapTileSignature && loaded.has(tile.key)) return current;
                            const next = new Set(loaded);
                            next.add(tile.key);
                            return { signature: mapTileSignature, loaded: next, failed };
                          });
                        }}
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                          setMapTileLoadState((current) => {
                            const loaded = current.signature === mapTileSignature ? current.loaded : new Set<string>();
                            const failed = current.signature === mapTileSignature ? current.failed : new Set<string>();
                            if (current.signature === mapTileSignature && failed.has(tile.key)) return current;
                            const next = new Set(failed);
                            next.add(tile.key);
                            return { signature: mapTileSignature, loaded, failed: next };
                          });
                        }}
                      />
                    ))}
                  </div>
                  <div className={`pet-marker ${mapPoint.live ? 'active' : 'idle'}`}>
                    <span />
                  </div>
                  <a className="osm-link" href={osmOpenUrl(mapPoint)} target="_blank" rel="noreferrer">
                    Open map
                  </a>
                  {!mapTilesReady ? (
                    <div className="map-loading" aria-live="polite">
                      <strong>{mapLoadingLabel}</strong>
                      <span>{failedMapTiles.size > 0 ? 'Using stable local map base.' : 'Waiting for complete tile set.'}</span>
                    </div>
                  ) : null}
                  <div className="map-attribution">
                    {mapTilesReady ? 'OpenStreetMap contributors' : 'PawTrace map'}
                  </div>
                </>
              ) : mapLoading ? (
                <div className="map-empty">
                  <strong>Loading GPS data</strong>
                  <span>Checking latest telemetry and saved location points.</span>
                </div>
              ) : (
                <div className="map-empty">
                  <strong>No valid GPS coordinate</strong>
                  <span>Awaiting valid M5StickC GPS packet.</span>
                </div>
              )}
              <div className="map-readout">
                <strong>{latest?.deviceId || 'm5stickc-plus-1-1'}</strong>
                <span>{mapPoint?.source || 'Wi-Fi GPS pending'}</span>
                <span>Lat {numberLabel(mapPoint?.lat ?? latest?.lat, '', 6)}</span>
                <span>Lon {numberLabel(mapPoint?.lon ?? latest?.lon, '', 6)}</span>
                <span>{formatDate(mapPoint?.timestamp)}</span>
              </div>
            </div>

            <div className="gps-detail-grid">
              <MiniStat label="Fix" value={numberLabel(latest?.gpsFix)} />
              <MiniStat label="Sat used" value={numberLabel(latest?.gpsSatsUsed)} />
              <MiniStat label="Visible" value={numberLabel(latest?.gpsVisible)} />
              <MiniStat label="HDOP" value={numberLabel(latest?.gpsHdop, '', 1)} />
              <MiniStat label="Track samples" value={numberLabel(latest?.trackSamples)} />
              <MiniStat label="Distance" value={numberLabel(latest?.distanceM, ' m', 1)} />
            </div>

            <div className="alert-strip">
              <span className={latest?.geofenceEnabled ? 'good' : 'idle'}>
                Geofence {boolLabel(latest?.geofenceEnabled)}
              </span>
              <span className={latest?.lostAlert ? 'bad' : 'good'}>
                Lost alert {boolLabel(latest?.lostAlert)}
              </span>
              <span className={latest?.lastLocationValid ? 'good' : 'idle'}>
                Last location {boolLabel(latest?.lastLocationValid)}
              </span>
            </div>
          </section>

          <aside className="panel health-panel">
            <p className="eyebrow">Health prototype</p>
            <div className="health-ring">
              <strong>{numberLabel(latest?.tempC, '°C', 1)}</strong>
              <span>body/contact temp</span>
            </div>
            <div className="health-stack">
              <MiniStat label="Heart found" value={boolLabel(latest?.heartFound)} />
              <MiniStat label="Finger/contact" value={boolLabel(latest?.finger)} />
              <MiniStat label="Pet BPM" value={numberLabel(latest?.heartRateBpm)} />
              <MiniStat label="SpO2" value={`${numberLabel(latest?.spo2Pct, '%')} · ${boolLabel(latest?.spo2Valid)}`} />
              <MiniStat label="Activity" value={latest?.activity || '--'} />
              <MiniStat label="Activity score" value={numberLabel(latest?.activityScore, '', 2)} />
            </div>
          </aside>
        </section>

        <section className="bottom-grid">
          <article className="panel table-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">PostgreSQL telemetry history</p>
                <h3>Recent device packets</h3>
              </div>
              <span>{state.history.length} rows</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Device</th>
                    <th>GPS</th>
                    <th>Battery</th>
                    <th>Health</th>
                    <th>Link / upload</th>
                  </tr>
                </thead>
                <tbody>
                  {state.history.slice(0, 12).map((row) => (
                    <tr key={row.id || row.receivedAt}>
                      <td>{formatDate(row.receivedAt || row.timestamp)}</td>
                      <td>{row.deviceId}</td>
                      <td>{boolLabel(gpsStatusValue(row))} · {numberLabel(row.gpsVisible)} sats</td>
                      <td>{numberLabel(row.batteryPct, '%')} · {numberLabel(row.batteryMv, 'mV')}</td>
                      <td>{numberLabel(row.heartRateBpm)} BPM · {numberLabel(row.tempC, '°C', 1)}</td>
                      <td>
                        {telemetrySourceLabel(row)} · code {numberLabel(row.uploadCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel packet-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Raw packet model</p>
                <h3>Wi-Fi JSON payload</h3>
              </div>
              <span>{formatDate(state.lastRefresh)}</span>
            </div>
            <pre>{JSON.stringify(latest || demoPacket, null, 2)}</pre>
          </article>
        </section>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
