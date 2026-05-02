import { useCallback, useEffect, useMemo, useState } from 'react';

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

const demoBlePacket = {
  id: 'pawtrace_001',
  source: 'm5stickc-plus-ble',
  transport: 'ble',
  bat: 82,
  bpm: 92,
  lat: 31.2983,
  lon: 120.5853,
  alert: 0,
  ble_connected: true,
  ble_rssi: -58,
  ble_mtu: 185,
  service_uuid: '7b9f0001-6f3a-4f8a-9f4d-111111111111',
  characteristic_uuid: '7b9f0002-6f3a-4f8a-9f4d-222222222222',
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

function isBleTelemetry(latest: Telemetry | null) {
  const source = `${latest?.source || latest?.metadata?.source || ''} ${latest?.transport || latest?.metadata?.transport || ''}`;
  return /ble/i.test(source);
}

function telemetrySourceLabel(latest: Telemetry | null) {
  if (!latest) return 'Waiting';
  const source = String(latest.source || latest.metadata?.source || '');
  const transport = String(latest.transport || latest.metadata?.transport || '');
  const joined = `${source} ${transport}`.toLowerCase();
  if (joined.includes('ble')) return 'BLE sync';
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
  if (!isBleTelemetry(telemetry) && Number(telemetry.gpsFix ?? 1) === 0) return false;
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
      source: isBleTelemetry(latest) ? 'Live BLE sync GPS' : 'Live Wi-Fi GPS',
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

function osmEmbedUrl(point: MapCoordinate) {
  const delta = 0.006;
  const west = point.lon - delta;
  const south = point.lat - delta;
  const east = point.lon + delta;
  const north = point.lat + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${point.lat}%2C${point.lon}`;
}

function osmOpenUrl(point: MapCoordinate) {
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=17/${point.lat}/${point.lon}`;
}

export default function App() {
  const [state, setState] = useState<DashboardState>(emptyState);
  const [posting, setPosting] = useState(false);

  const apiFetch = useCallback(async (path: string, token: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${path}`);
    }
    return data;
  }, []);

  const ensureToken = useCallback(async () => {
    if (state.token) return state.token;
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo123' }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.token) {
      throw new Error(data.error || 'Unable to log in with demo account');
    }
    setState((current) => ({ ...current, token: data.token }));
    return data.token as string;
  }, [state.token]);

  const refresh = useCallback(async () => {
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
  }, [apiFetch, ensureToken]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 6000);
    return () => window.clearInterval(timer);
  }, [refresh]);

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
  const sendBlePacket = useCallback(() => sendPacket(demoBlePacket), [sendPacket]);

  const latest = state.latest;
  const sourceLabel = telemetrySourceLabel(latest);
  const latestGpsStatus = gpsStatusValue(latest);
  const liveGpsValid = hasLiveCoordinateLock(latest);
  const mapPoint = useMemo(
    () => getActiveCoordinate(latest, state.points, liveGpsValid),
    [liveGpsValid, latest, state.points],
  );
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
              M5StickC Plus BLE sync or Wi-Fi packets, PostgreSQL telemetry, user records, pet cards, GPS validity,
              geofence state, and health prototype signals in one operational view.
            </p>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={sendDemoPacket} disabled={posting}>
              {posting ? 'Posting packet...' : 'Send demo Wi-Fi packet'}
            </button>
            <button type="button" onClick={sendBlePacket} disabled={posting}>
              {posting ? 'Posting packet...' : 'Send demo BLE packet'}
            </button>
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
                <h2>
                  {liveGpsValid
                    ? isBleTelemetry(latest)
                      ? 'Live BLE sync GPS on real map'
                      : 'Live Wi-Fi GPS on real map'
                    : mapPoint
                      ? 'Showing last valid GPS point'
                      : 'Waiting for valid GPS fix'}
                </h2>
              </div>
              <span className={`status-pill ${liveGpsValid ? 'good' : mapPoint ? 'idle' : 'bad'}`}>
                {liveGpsValid ? 'Live coordinate lock' : mapPoint ? 'Last point' : 'No coordinate lock'}
              </span>
            </div>

            <div className="gps-map real-map">
              {mapPoint ? (
                <>
                  <iframe
                    className="osm-frame"
                    title="PawTrace OpenStreetMap location"
                    src={osmEmbedUrl(mapPoint)}
                    loading="lazy"
                  />
                  <div className={`pet-marker ${mapPoint.live ? 'active' : 'idle'}`}>
                    <span />
                  </div>
                  <a className="osm-link" href={osmOpenUrl(mapPoint)} target="_blank" rel="noreferrer">
                    Open map
                  </a>
                </>
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
                        {telemetrySourceLabel(row)} · {isBleTelemetry(row)
                          ? `RSSI ${numberLabel(row.bleRssi, ' dBm')}`
                          : `code ${numberLabel(row.uploadCode)}`}
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
                <h3>{latest && isBleTelemetry(latest) ? 'BLE JSON payload' : 'Wi-Fi JSON payload'}</h3>
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
