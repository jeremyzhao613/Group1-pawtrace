;(function (global) {
  const PETS_STORAGE_KEY = 'pawtrace_pets';
  const MAP_BACKGROUND_SOURCES = ['/assets/m1.jpg', '/assets/m2.png'];
  const MAP_FRAME_FALLBACK_SIZE = { width: 1810, height: 1280 };
  const REAL_MAP_DEFAULT_CENTER = { lat: 31.48303, lon: 121.15569, label: 'XJTLU Taicang Campus' };
  const REAL_MAP_HALF_SPAN = { lat: 0.006, lon: 0.006 };
  const REAL_MAP_PADDING_RATIO = 0.3;
  const REAL_MAP_DEFAULT_ASPECT = 1810 / 1280;
  const OSM_TILE_SIZE = 256;
  const OSM_TILE_ZOOM = 17;
  const OSM_TILE_MIN_ZOOM = 15;
  const OSM_TILE_MAX_ZOOM = 19;
  const MAP_ZOOM_MIN = -2;
  const MAP_ZOOM_MAX = 3;
  const MAP_TILE_LOAD_TIMEOUT_MS = 7000;
  const DEFAULT_GEOFENCE_RADIUS_M = 180;
  const FENCE_RADIUS_MIN_M = 60;
  const FENCE_RADIUS_MAX_M = 650;
  const MAP_CONTROL_STORAGE_KEY = 'pawtrace_map_controls_v2';
  const TRACK_EXTRA_LIMIT = 24;
  const MAP_TILE_URL_TEMPLATES = [
    '/api/map/tile/{z}/{x}/{y}.png',
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  ];
  const TRACKED_ZONE_FALLBACKS = [
    { label: 'West Residence Quad', coords: { x: 24, y: 20 } },
    { label: 'North Canal Bridge', coords: { x: 49, y: 33 } },
    { label: 'Central Ring Promenade', coords: { x: 68, y: 48 } },
    { label: 'Learning Hub Entrance', coords: { x: 59, y: 22 } },
    { label: 'Stadium Track Edge', coords: { x: 50, y: 69 } },
    { label: 'South Ring Gate', coords: { x: 72, y: 79 } },
  ];

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function safeImageSrc(value, fallback = '') {
    const src = String(value || '').trim();
    if (!src) return fallback;
    if (/^(https?:\/\/|data:image\/|\/|\.\/|\.\.\/)/i.test(src)) return src;
    return fallback;
  }

  function finiteNumber(value, fallback = null) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function clampNumber(value, min, max, fallback = min) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function optionalBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'ok'].includes(normalized)) return true;
      if (['false', '0', 'no', 'invalid'].includes(normalized)) return false;
    }
    return null;
  }

  function statusLabel(value) {
    if (value === true) return 'YES';
    if (value === false) return 'NO';
    return '--';
  }

  function readMapPreferences() {
    try {
      const parsed = JSON.parse(localStorage.getItem(MAP_CONTROL_STORAGE_KEY) || '{}');
      return {
        trackScope: parsed?.trackScope === 'all' ? 'all' : 'active',
        petSettings: parsed && typeof parsed.petSettings === 'object' && parsed.petSettings
          ? parsed.petSettings
          : {},
      };
    } catch {
      return { trackScope: 'active', petSettings: {} };
    }
  }

  function writeMapPreferences(preferences = {}) {
    try {
      localStorage.setItem(MAP_CONTROL_STORAGE_KEY, JSON.stringify({
        trackScope: preferences.trackScope === 'all' ? 'all' : 'active',
        petSettings: preferences.petSettings && typeof preferences.petSettings === 'object'
          ? preferences.petSettings
          : {},
      }));
    } catch {}
  }

  function hasValidCoordinate(lat, lon) {
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

  function normalizeCoordinate(lat, lon) {
    return hasValidCoordinate(lat, lon)
      ? { lat: Number(lat), lon: Number(lon) }
      : null;
  }

  function formatCoordinatePair(coordinate = {}) {
    if (!coordinate) return '';
    if (!hasValidCoordinate(coordinate.lat, coordinate.lon)) return '';
    return `${Number(coordinate.lat).toFixed(5)}, ${Number(coordinate.lon).toFixed(5)}`;
  }

  function formatDistanceMeters(value) {
    const meters = Number(value);
    if (!Number.isFinite(meters) || meters <= 0) return '0m';
    if (meters >= 1000) return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)}km`;
    return `${Math.round(meters)}m`;
  }

  function formatDurationMs(value) {
    const ms = Number(value);
    if (!Number.isFinite(ms) || ms <= 0) return 'now';
    const minutes = Math.max(1, Math.round(ms / 60000));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `${hours}h`;
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const time = new Date(timestamp).getTime();
    if (!Number.isFinite(time)) return '';
    const diff = Date.now() - time;
    if (diff < 45000) return 'just now';
    if (diff < 3600000) return `${Math.max(1, Math.round(diff / 60000))}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return new Date(time).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function offsetCoordinateMeters(coordinate = {}, eastM = 0, northM = 0) {
    if (!hasValidCoordinate(coordinate.lat, coordinate.lon)) return null;
    const lat = Number(coordinate.lat);
    const lon = Number(coordinate.lon);
    const latOffset = Number(northM) / 111320;
    const lonScale = 111320 * Math.cos(degreesToRadians(lat));
    const lonOffset = Math.abs(lonScale) > 0.000001 ? Number(eastM) / lonScale : 0;
    return { lat: lat + latOffset, lon: lon + lonOffset };
  }

  function coordsToCoordinate(coords = {}, center = REAL_MAP_DEFAULT_CENTER) {
    const x = finiteNumber(coords?.x, null);
    const y = finiteNumber(coords?.y, null);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return {
      lat: center.lat + (((50 - y) / 100) * REAL_MAP_HALF_SPAN.lat * 2),
      lon: center.lon + (((x - 50) / 100) * REAL_MAP_HALF_SPAN.lon * 2),
      derived: true,
    };
  }

  function degreesToRadians(value) {
    return Number(value) * (Math.PI / 180);
  }

  function radiansToDegrees(value) {
    return Number(value) * (180 / Math.PI);
  }

  function distanceMeters(a = {}, b = {}) {
    if (!hasValidCoordinate(a.lat, a.lon) || !hasValidCoordinate(b.lat, b.lon)) return null;
    const radius = 6371000;
    const lat1 = degreesToRadians(a.lat);
    const lat2 = degreesToRadians(b.lat);
    const deltaLat = degreesToRadians(Number(b.lat) - Number(a.lat));
    const deltaLon = degreesToRadians(Number(b.lon) - Number(a.lon));
    const sinLat = Math.sin(deltaLat / 2);
    const sinLon = Math.sin(deltaLon / 2);
    const h = (sinLat * sinLat) + Math.cos(lat1) * Math.cos(lat2) * (sinLon * sinLon);
    return radius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  }

  function interpolateCoordinate(start = {}, end = {}, ratio = 0) {
    if (!hasValidCoordinate(start.lat, start.lon) || !hasValidCoordinate(end.lat, end.lon)) return null;
    const t = clampNumber(ratio, 0, 1, 0);
    return {
      lat: Number(start.lat) + ((Number(end.lat) - Number(start.lat)) * t),
      lon: Number(start.lon) + ((Number(end.lon) - Number(start.lon)) * t),
    };
  }

  function trackPoint(coordinate, meta = {}) {
    if (!coordinate || !hasValidCoordinate(coordinate.lat, coordinate.lon)) return null;
    return {
      lat: Number(coordinate.lat),
      lon: Number(coordinate.lon),
      timestamp: meta.timestamp || '',
      source: meta.source || 'gps',
      accuracyM: finiteNumber(meta.accuracyM, null),
    };
  }

  function timestampFromEntry(entry = {}) {
    return entry.timestamp || entry.createdAt || entry.measuredAt || entry.time || '';
  }

  function mercatorY(lat) {
    const boundedLat = Math.min(85.05112878, Math.max(-85.05112878, Number(lat)));
    const radians = degreesToRadians(boundedLat);
    return Math.log(Math.tan((Math.PI / 4) + (radians / 2)));
  }

  function mercatorYToLat(y) {
    return radiansToDegrees((2 * Math.atan(Math.exp(Number(y)))) - (Math.PI / 2));
  }

  function isLiveGpsPet(pet = {}) {
    const latest = pet.latestVitals || {};
    const lat = finiteNumber(pet.lat ?? latest.lat, null);
    const lon = finiteNumber(pet.lon ?? latest.lon, null);
    const fix = finiteNumber(pet.gpsFix ?? latest.gpsFix, null);
    const valid = optionalBoolean(pet.locationValid ?? latest.locationValid ?? pet.gpsValid ?? latest.gpsValid);
    return valid === true && fix !== 0 && hasValidCoordinate(lat, lon);
  }

  function getPetGps(pet = {}) {
    const latest = pet.latestVitals || {};
    return {
      lat: finiteNumber(pet.lat ?? latest.lat, null),
      lon: finiteNumber(pet.lon ?? latest.lon, null),
    };
  }

  function getPetGpsCoordinate(pet = {}) {
    const gps = getPetGps(pet);
    return normalizeCoordinate(gps.lat, gps.lon);
  }

  function getPetMapCoordinate(pet = {}) {
    return getPetGpsCoordinate(pet) || coordsToCoordinate(pet.coords);
  }

  function getLocationCoordinate(location = {}) {
    return normalizeCoordinate(location.lat, location.lon) || coordsToCoordinate(location.coords);
  }

  function fitBoundsToAspect(bounds = {}, aspect = REAL_MAP_DEFAULT_ASPECT) {
    const west = Number(bounds.west);
    const east = Number(bounds.east);
    const south = Number(bounds.south);
    const north = Number(bounds.north);
    if (![west, east, south, north].every(Number.isFinite)) return bounds;
    const safeAspect = Number.isFinite(Number(aspect)) && Number(aspect) > 0 ? Number(aspect) : REAL_MAP_DEFAULT_ASPECT;
    const centerLon = (west + east) / 2;
    const centerY = (mercatorY(south) + mercatorY(north)) / 2;
    const xSpan = Math.max(0.000001, degreesToRadians(east - west));
    const ySpan = Math.max(0.000001, mercatorY(north) - mercatorY(south));
    const currentAspect = xSpan / ySpan;

    if (currentAspect < safeAspect) {
      const nextXSpan = ySpan * safeAspect;
      const halfLon = radiansToDegrees(nextXSpan / 2);
      return {
        west: centerLon - halfLon,
        east: centerLon + halfLon,
        south,
        north,
      };
    }

    const nextYSpan = xSpan / safeAspect;
    const southY = centerY - (nextYSpan / 2);
    const northY = centerY + (nextYSpan / 2);
    return {
      west,
      east,
      south: mercatorYToLat(southY),
      north: mercatorYToLat(northY),
    };
  }

  function applyZoomToMapView(view = {}, zoomLevel = 0) {
    const bounds = view.bounds || {};
    const scale = 2 ** Number(zoomLevel || 0);
    if (scale === 1
      || ![bounds.west, bounds.east, bounds.south, bounds.north].every((value) => Number.isFinite(Number(value)))) {
      return view;
    }
    const marker = hasValidCoordinate(view.marker?.lat, view.marker?.lon) ? view.marker : null;
    const centerLon = marker ? Number(marker.lon) : (Number(bounds.west) + Number(bounds.east)) / 2;
    const centerLat = marker ? Number(marker.lat) : (Number(bounds.south) + Number(bounds.north)) / 2;
    const halfLon = Math.max(0.00008, ((Number(bounds.east) - Number(bounds.west)) / 2) / scale);
    const halfLat = Math.max(0.00008, ((Number(bounds.north) - Number(bounds.south)) / 2) / scale);
    return {
      ...view,
      bounds: {
        west: centerLon - halfLon,
        east: centerLon + halfLon,
        south: centerLat - halfLat,
        north: centerLat + halfLat,
      },
    };
  }

  function buildRealMapView(pets = [], locations = [], activePetId = '', activeLocationId = '', aspect = REAL_MAP_DEFAULT_ASPECT) {
    const activePet = pets.find((entry) => entry.id === activePetId);
    const activeLocation = locations.find((entry) => entry.id === activeLocationId);
    const activePetCoordinate = activePet ? getPetMapCoordinate(activePet) : null;
    const activeLocationCoordinate = activeLocation ? getLocationCoordinate(activeLocation) : null;
    const livePetCoordinate = getPetGpsCoordinate(pets.find(isLiveGpsPet) || {});
    const firstGpsCoordinate = pets.map(getPetGpsCoordinate).find(Boolean);
    const marker = activePetCoordinate
      || activeLocationCoordinate
      || livePetCoordinate
      || firstGpsCoordinate
      || REAL_MAP_DEFAULT_CENTER;
    const coordinates = [
      marker,
      ...locations.map(getLocationCoordinate),
      ...pets.map(getPetMapCoordinate),
    ].filter(Boolean);
    const lats = coordinates.map((coordinate) => coordinate.lat);
    const lons = coordinates.map((coordinate) => coordinate.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const halfLat = Math.max(REAL_MAP_HALF_SPAN.lat, ((maxLat - minLat) / 2) * (1 + REAL_MAP_PADDING_RATIO));
    const halfLon = Math.max(REAL_MAP_HALF_SPAN.lon, ((maxLon - minLon) / 2) * (1 + REAL_MAP_PADDING_RATIO));

    const rawBounds = {
      west: centerLon - halfLon,
      south: centerLat - halfLat,
      east: centerLon + halfLon,
      north: centerLat + halfLat,
    };

    return {
      marker,
      bounds: fitBoundsToAspect(rawBounds, aspect),
    };
  }

  function osmEmbedUrl(view = {}) {
    const bounds = view.bounds || {};
    const marker = view.marker || REAL_MAP_DEFAULT_CENTER;
    const west = Number(bounds.west ?? (marker.lon - REAL_MAP_HALF_SPAN.lon)).toFixed(6);
    const south = Number(bounds.south ?? (marker.lat - REAL_MAP_HALF_SPAN.lat)).toFixed(6);
    const east = Number(bounds.east ?? (marker.lon + REAL_MAP_HALF_SPAN.lon)).toFixed(6);
    const north = Number(bounds.north ?? (marker.lat + REAL_MAP_HALF_SPAN.lat)).toFixed(6);
    const markerLat = Number(marker.lat).toFixed(6);
    const markerLon = Number(marker.lon).toFixed(6);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${markerLat}%2C${markerLon}`;
  }

  function osmOpenUrl(lat, lon) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  }

  function lonToTileWorldX(lon, zoom = OSM_TILE_ZOOM) {
    return ((Number(lon) + 180) / 360) * (2 ** zoom) * OSM_TILE_SIZE;
  }

  function latToTileWorldY(lat, zoom = OSM_TILE_ZOOM) {
    return ((1 - (mercatorY(lat) / Math.PI)) / 2) * (2 ** zoom) * OSM_TILE_SIZE;
  }

  function mapTileUrl(x, y, zoom = OSM_TILE_ZOOM, sourceIndex = 0) {
    const template = MAP_TILE_URL_TEMPLATES[sourceIndex] || MAP_TILE_URL_TEMPLATES[0];
    return template
      .replace('{z}', encodeURIComponent(String(zoom)))
      .replace('{x}', encodeURIComponent(String(x)))
      .replace('{y}', encodeURIComponent(String(y)));
  }

  function projectCoordinateToRealMap(coordinate = {}, view = {}) {
    const bounds = view.bounds || {};
    if (!coordinate
      || !hasValidCoordinate(coordinate.lat, coordinate.lon)
      || !Number.isFinite(Number(bounds.west))
      || !Number.isFinite(Number(bounds.east))
      || !Number.isFinite(Number(bounds.south))
      || !Number.isFinite(Number(bounds.north))) {
      return null;
    }
    const xSpan = Math.max(0.000001, degreesToRadians(Number(bounds.east) - Number(bounds.west)));
    const northY = mercatorY(bounds.north);
    const southY = mercatorY(bounds.south);
    const ySpan = Math.max(0.000001, northY - southY);
    return {
      x: Math.min(94, Math.max(6, (degreesToRadians(Number(coordinate.lon) - Number(bounds.west)) / xSpan) * 100)),
      y: Math.min(94, Math.max(6, ((northY - mercatorY(coordinate.lat)) / ySpan) * 100)),
    };
  }

  function projectRealMapPointToCoordinate(point = {}, view = {}) {
    const bounds = view.bounds || {};
    if (!Number.isFinite(Number(point.x))
      || !Number.isFinite(Number(point.y))
      || !Number.isFinite(Number(bounds.west))
      || !Number.isFinite(Number(bounds.east))
      || !Number.isFinite(Number(bounds.south))
      || !Number.isFinite(Number(bounds.north))) {
      return null;
    }
    const x = clampNumber(point.x, 0, 100, 50) / 100;
    const y = clampNumber(point.y, 0, 100, 50) / 100;
    const lon = Number(bounds.west) + ((Number(bounds.east) - Number(bounds.west)) * x);
    const northY = mercatorY(bounds.north);
    const southY = mercatorY(bounds.south);
    const lat = mercatorYToLat(northY - ((northY - southY) * y));
    return normalizeCoordinate(lat, lon);
  }

  function coordinateKey(coordinate = {}) {
    if (!hasValidCoordinate(coordinate.lat, coordinate.lon)) return '';
    return `${Number(coordinate.lat).toFixed(6)},${Number(coordinate.lon).toFixed(6)}`;
  }

  function smoothSvgPath(points = []) {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    const tension = 0.18;
    const commands = [`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];
    for (let index = 0; index < points.length - 1; index += 1) {
      const p0 = points[Math.max(0, index - 1)];
      const p1 = points[index];
      const p2 = points[index + 1];
      const p3 = points[Math.min(points.length - 1, index + 2)];
      const cp1 = {
        x: p1.x + ((p2.x - p0.x) * tension),
        y: p1.y + ((p2.y - p0.y) * tension),
      };
      const cp2 = {
        x: p2.x - ((p3.x - p1.x) * tension),
        y: p2.y - ((p3.y - p1.y) * tension),
      };
      commands.push(`C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
    }
    return commands.join(' ');
  }

  function routeArrowPath(from = {}, to = {}, size = 1.15) {
    if (![from.x, from.y, to.x, to.y].every((value) => Number.isFinite(Number(value)))) return '';
    const angle = Math.atan2(Number(to.y) - Number(from.y), Number(to.x) - Number(from.x));
    const tip = { x: Number(to.x), y: Number(to.y) };
    const baseDistance = size * 1.05;
    const wing = size * 0.55;
    const base = {
      x: tip.x - Math.cos(angle) * baseDistance,
      y: tip.y - Math.sin(angle) * baseDistance,
    };
    const left = {
      x: base.x + Math.cos(angle + Math.PI / 2) * wing,
      y: base.y + Math.sin(angle + Math.PI / 2) * wing,
    };
    const right = {
      x: base.x + Math.cos(angle - Math.PI / 2) * wing,
      y: base.y + Math.sin(angle - Math.PI / 2) * wing,
    };
    return `M ${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L ${left.x.toFixed(2)} ${left.y.toFixed(2)} L ${right.x.toFixed(2)} ${right.y.toFixed(2)} Z`;
  }

  function trackPointFromEntry(entry = {}) {
    const coordinate = normalizeCoordinate(entry.lat, entry.lon)
      || normalizeCoordinate(entry.latitude, entry.longitude)
      || coordsToCoordinate(entry.mapCoords || entry.coords);
    return trackPoint(coordinate, {
      timestamp: timestampFromEntry(entry),
      source: entry.source || entry.transport || 'telemetry',
      accuracyM: entry.accuracyM ?? entry.accuracy_m ?? entry.gpsAccuracyM ?? entry.hdop,
    });
  }

  function trackCoordinateFromEntry(entry = {}) {
    const point = trackPointFromEntry(entry);
    return point ? { lat: point.lat, lon: point.lon } : null;
  }
  const DEMO_LOCATIONS = [
    {
      id: 'canal-paw-cafe',
      name: 'Canal Paw Cafe',
      markerLabel: 'Cafe',
      markerIcon: 'fa-mug-hot',
      type: 'Coffee + pet break',
      description: 'A compact coffee stop beside the north canal bridge, with shaded seats and water bowls for quick campus walks.',
      rating: 'Water bowls',
      tags: ['Bridge-side', 'Water bowls', 'Quick stop'],
      pets: ['Dogs welcome', 'Small pets welcome'],
      hours: '08:00 – 21:00',
      phone: '',
      address: 'North Canal Bridge, Taicang Campus',
      status: 'Shown on OpenStreetMap by latitude and longitude.',
      lat: 31.485214,
      lon: 121.15497,
      link: osmOpenUrl(31.485214, 121.15497),
      coords: { x: 44, y: 31.8 }
    },
    {
      id: 'ring-lawn-garden',
      name: 'Ring Lawn Garden',
      markerLabel: 'Lawn',
      markerIcon: 'fa-seedling',
      type: 'Open lawn + shade',
      description: 'The central green beside the ring is the easiest place to pause, meet other owners, and let pets settle before class.',
      rating: 'Open lawn',
      tags: ['Open lawn', 'Meeting point', 'Rest benches'],
      pets: ['Dogs on-leash', 'Cat carriers'],
      hours: '06:00 – 22:30',
      phone: '',
      address: 'Central Ring Promenade',
      status: 'Shown on OpenStreetMap by latitude and longitude.',
      lat: 31.48345,
      lon: 121.15731,
      link: osmOpenUrl(31.48345, 121.15731),
      coords: { x: 63.5, y: 46.5 }
    },
    {
      id: 'learning-hub-supplies',
      name: 'Learning Hub Pet Supplies',
      markerLabel: 'Supply',
      markerIcon: 'fa-store',
      type: 'Pet essentials kiosk',
      description: 'A grab-and-go kiosk near the upper learning hub for wipes, waste bags, small snacks, and replacement tags.',
      rating: 'Pet essentials',
      tags: ['Supplies', 'Tags', 'Quick checkout'],
      pets: ['All pets'],
      hours: '09:00 – 19:30',
      phone: '',
      address: 'Learning Hub Entrance',
      status: 'Shown on OpenStreetMap by latitude and longitude.',
      lat: 31.48657,
      lon: 121.156626,
      link: osmOpenUrl(31.48657, 121.156626),
      coords: { x: 57.8, y: 20.5 }
    },
    {
      id: 'trackside-play-zone',
      name: 'Trackside Play Zone',
      markerLabel: 'Track',
      markerIcon: 'fa-person-walking',
      type: 'Walk loop + open field',
      description: 'A calmer stretch near the stadium where owners usually do short walks, cooldowns, and basic obedience practice.',
      rating: 'Walk loop',
      tags: ['Track edge', 'Open loop', 'Evening walks'],
      pets: ['Dogs welcome', 'Harness pets'],
      hours: '06:00 – 23:00',
      phone: '',
      address: 'Stadium Track Edge',
      status: 'Shown on OpenStreetMap by latitude and longitude.',
      lat: 31.48081,
      lon: 121.15527,
      link: osmOpenUrl(31.48081, 121.15527),
      coords: { x: 46.5, y: 68.5 }
    },
    {
      id: 'west-courtyard-care',
      name: 'West Courtyard Care Point',
      markerLabel: 'Care',
      markerIcon: 'fa-kit-medical',
      type: 'Pet wellness kiosk',
      description: 'A small service point near the west residence blocks for first-aid wipes, water refill, and emergency card help.',
      rating: 'Care point',
      tags: ['Wellness', 'Water refill', 'Emergency cards'],
      pets: ['All pets'],
      hours: '10:00 – 18:00',
      phone: '',
      address: 'West Residence Quad',
      status: 'Shown on OpenStreetMap by latitude and longitude.',
      lat: 31.48621,
      lon: 121.15191,
      link: osmOpenUrl(31.48621, 121.15191),
      coords: { x: 18.5, y: 23.5 }
    }
  ];

  const MAP_ANIMALS = [
    {
      name: 'Bao',
      emoji: '🐶',
      status: 'Central Ring',
      lat: 31.483354,
      lon: 121.157226,
      coords: { x: 62.8, y: 47.3 }
    },
    {
      name: 'Mochi',
      emoji: '🐱',
      status: 'North Canal',
      lat: 31.485238,
      lon: 121.15503,
      coords: { x: 44.5, y: 31.6 }
    },
    {
      name: 'Nimbus',
      emoji: '🐶',
      status: 'Track Edge',
      lat: 31.480774,
      lon: 121.155306,
      coords: { x: 46.8, y: 68.8 }
    }
  ];

  const DEMO_TRACK_ROUTES = {
    Bao: [
      { lat: 31.48592, lon: 121.15234, label: 'Residence path' },
      { lat: 31.48533, lon: 121.15412, label: 'Canal turn' },
      { lat: 31.48446, lon: 121.15526, label: 'Inner road' },
      { lat: 31.48374, lon: 121.15648, label: 'Ring path' },
      { lat: 31.48345, lon: 121.15731, label: 'Central Ring' },
    ],
    Mochi: [
      { lat: 31.48657, lon: 121.156626, label: 'Learning Hub' },
      { lat: 31.48602, lon: 121.15588, label: 'North walk' },
      { lat: 31.48562, lon: 121.15536, label: 'Bridge approach' },
      { lat: 31.485214, lon: 121.15497, label: 'Canal Paw Cafe' },
    ],
    Nimbus: [
      { lat: 31.48205, lon: 121.15372, label: 'South service road' },
      { lat: 31.48152, lon: 121.15436, label: 'Track corner' },
      { lat: 31.48102, lon: 121.15488, label: 'Trackside' },
      { lat: 31.48081, lon: 121.15527, label: 'Trackside Play Zone' },
    ],
  };

  function getTrackedFallback(index = 0) {
    return TRACKED_ZONE_FALLBACKS[index % TRACKED_ZONE_FALLBACKS.length];
  }

  function buildDemoTrackPoints(pet = {}) {
    const current = getPetMapCoordinate(pet);
    if (!current) return [];
    const template = DEMO_TRACK_ROUTES[pet.name] || DEMO_TRACK_ROUTES.Bao || [];
    const anchors = [
      ...template.map((point) => normalizeCoordinate(point.lat, point.lon)).filter(Boolean),
      current,
    ];
    const points = [];
    const now = Date.now();
    let index = 0;

    for (let segment = 0; segment < anchors.length - 1; segment += 1) {
      const start = anchors[segment];
      const end = anchors[segment + 1];
      const segmentDistance = distanceMeters(start, end) || 0;
      const steps = Math.max(2, Math.min(5, Math.ceil(segmentDistance / 95)));
      for (let step = 0; step < steps; step += 1) {
        if (segment > 0 && step === 0) continue;
        const ratio = step / steps;
        const interpolated = interpolateCoordinate(start, end, ratio);
        if (!interpolated) continue;
        const curve = Math.sin(ratio * Math.PI) * 14;
        const coordinate = offsetCoordinateMeters(
          interpolated,
          curve * (segment % 2 === 0 ? 1 : -0.55),
          curve * (segment % 2 === 0 ? 0.25 : -0.2)
        ) || interpolated;
        points.push(trackPoint(coordinate, {
          timestamp: new Date(now - ((18 - index) * 60000)).toISOString(),
          source: 'demo-gps',
          accuracyM: 8 + ((index % 4) * 2),
        }));
        index += 1;
      }
    }

    points.push(trackPoint(current, {
      timestamp: new Date(now).toISOString(),
      source: 'live-demo',
      accuracyM: 6,
    }));
    return points.filter(Boolean);
  }

  function readStoredPets() {
    try {
      const pets = JSON.parse(localStorage.getItem(PETS_STORAGE_KEY) || '[]');
      return Array.isArray(pets) ? pets : [];
    } catch {
      return [];
    }
  }

  function getLatestVitals(pet = {}) {
    const history = Array.isArray(pet.vitalsHistory) ? pet.vitalsHistory : [];
    return history[0] || null;
  }

  function normalizeTrackedPet(pet = {}, index = 0) {
    const fallback = getTrackedFallback(index);
    const latestVitals = getLatestVitals(pet);
    const vitalsHistory = Array.isArray(pet.vitalsHistory) ? pet.vitalsHistory : [];
    return {
      id: pet.id || `tracked-${index}`,
      name: pet.name || `Pet ${index + 1}`,
      type: pet.type || 'Pet',
      avatar: pet.avatar || '',
      emoji: pet.emoji || '🐾',
      location: pet.location || fallback.label,
      coords: {
        x: Number.isFinite(Number(pet?.mapCoords?.x)) ? Number(pet.mapCoords.x) : fallback.coords.x,
        y: Number.isFinite(Number(pet?.mapCoords?.y)) ? Number(pet.mapCoords.y) : fallback.coords.y,
      },
      nfcContact: pet.nfcContact || '',
      nfcId: pet.nfcId || '',
      deviceId: pet.deviceId || '',
      note: pet.nfcNote || pet.status || '',
      latestVitals,
      vitalsHistory,
      telemetryUpdatedAt: pet.telemetryUpdatedAt || '',
      lat: finiteNumber(pet.lat ?? latestVitals?.lat, null),
      lon: finiteNumber(pet.lon ?? latestVitals?.lon, null),
      gpsFix: finiteNumber(pet.gpsFix ?? latestVitals?.gpsFix, null),
      gpsSatsUsed: finiteNumber(pet.gpsSatsUsed ?? latestVitals?.gpsSatsUsed, null),
      gpsVisible: finiteNumber(pet.gpsVisible ?? latestVitals?.gpsVisible, null),
      gpsHdop: finiteNumber(pet.gpsHdop ?? latestVitals?.gpsHdop, null),
      locationValid: optionalBoolean(pet.locationValid ?? latestVitals?.locationValid),
      lastLocationValid: optionalBoolean(pet.lastLocationValid ?? latestVitals?.lastLocationValid),
      geofenceEnabled: optionalBoolean(pet.geofenceEnabled ?? latestVitals?.geofenceEnabled),
      distanceM: finiteNumber(pet.distanceM ?? latestVitals?.distanceM, null),
      geofenceRadiusM: finiteNumber(pet.geofenceRadiusM ?? latestVitals?.geofenceRadiusM, DEFAULT_GEOFENCE_RADIUS_M),
      lostAlert: optionalBoolean(pet.lostAlert ?? latestVitals?.lostAlert),
      wifiConnected: optionalBoolean(pet.wifiConnected ?? latestVitals?.wifiConnected),
      wifiRssi: finiteNumber(pet.wifiRssi ?? latestVitals?.wifiRssi, null),
      uploadOk: optionalBoolean(pet.uploadOk ?? latestVitals?.uploadOk),
      uploadCode: finiteNumber(pet.uploadCode ?? latestVitals?.uploadCode, null),
    };
  }

  class PawMapController {
    constructor(options = {}) {
      this.container = options.container;
      this.background = options.background;
      this.realMapTiles = options.realMapTiles || null;
      this.realMapFrame = options.realMapFrame || null;
      this.realMapLink = options.realMapLink || null;
      this.overlayLayer = options.overlayLayer || null;
      this.markersLayer = options.markersLayer;
      this.petsLayer = options.petsLayer;
      this.controls = options.controls || {};
      this.petLocationListEl = options.petLocationListEl;
      this.trackedCountEl = options.trackedCountEl;
      this.locationListEl = options.locationListEl;
      this.locationCountEl = options.locationCountEl;
      this.searchInput = options.searchInput;
      this.cardElements = options.cardElements || {};
      this.locationCard = this.cardElements.wrapper;
      this.activeMarker = null;
      this.activeTrackedPetId = null;
      this.activeLocationId = null;
      this.searchQuery = '';
      this.locationMarkerMap = new Map();
      this.locationRowMap = new Map();
      this.trackedPetMap = new Map();
      this.locations = DEMO_LOCATIONS;
      this.trackedPets = [];
      this.realMapPet = null;
      this.realMapView = buildRealMapView([], this.locations, '', '', REAL_MAP_DEFAULT_ASPECT);
      this.zoomLevel = 0;
      this.showGeofence = true;
      this.showTracks = true;
      this.preferences = readMapPreferences();
      this.trackScope = this.preferences.trackScope === 'all' ? 'all' : 'active';
      this.centerPickPetId = '';
      this.trackPointPickPetId = '';
      this.mapToolMessage = '';
      this.mapToolTone = 'ready';
      this.handleResize = null;
      this.resizeObserver = null;
    }

    init() {
      if (!this.container) return;
      this.ensureBackground();
      this.renderTrackedPets();
      this.renderMarkers();
      this.renderLocationList();
      this.attachCardHandlers();
      this.attachSearchHandler();
      this.attachControlHandlers();
      this.updateLocationCount();
      this.updateControls();
      const initialPet = this.getRealMapPet(this.trackedPets) || this.trackedPets[0];
      if (initialPet && window.innerWidth > 768) {
        this.focusTrackedPet(initialPet.id);
      } else {
        this.hideLocationCard();
      }
      document.addEventListener('pawtrace:pets-updated', () => this.refreshTrackedPets());
    }

    ensureBackground() {
      if (!this.background) return;
      if (!this.handleResize) {
        this.handleResize = () => {
          this.updateMapFrame();
          window.requestAnimationFrame(() => {
            this.updateMapFrame();
            this.renderTrackedPets();
            this.renderMarkers();
          });
        };
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
        window.visualViewport?.addEventListener('resize', this.handleResize);
      }
      if (!this.resizeObserver && this.container && typeof ResizeObserver === 'function') {
        this.resizeObserver = new ResizeObserver(() => {
          this.updateMapFrame();
          this.renderOverlay();
        });
        this.resizeObserver.observe(this.container);
      }
      if (this.background.tagName === 'IMG') {
        const preferred = this.background.getAttribute('src') || MAP_BACKGROUND_SOURCES[0];
        const fallback = this.background.getAttribute('data-fallback-src') || MAP_BACKGROUND_SOURCES[1];
        const candidates = Array.from(new Set([preferred, fallback].filter(Boolean)));
        let index = 0;

        const applySource = () => {
          const nextSrc = candidates[index];
          if (!nextSrc) return;
          if (this.background.getAttribute('src') !== nextSrc) {
            this.background.setAttribute('src', nextSrc);
          }
        };

        this.background.onerror = () => {
          if (index >= candidates.length - 1) return;
          index += 1;
          applySource();
        };
        this.background.addEventListener('load', () => this.updateMapFrame());

        this.background.style.objectFit = 'fill';
        this.background.style.objectPosition = 'center';
        this.background.style.backgroundColor = 'rgba(255, 255, 255, 0.72)';
        applySource();
        requestAnimationFrame(() => this.updateMapFrame());
        return;
      }

      this.background.style.backgroundImage = `url('${MAP_BACKGROUND_SOURCES[0]}')`;
      this.background.style.backgroundSize = 'contain';
      this.background.style.backgroundRepeat = 'no-repeat';
      this.background.style.backgroundPosition = 'center';
      this.background.style.backgroundColor = 'rgba(255, 255, 255, 0.72)';
      requestAnimationFrame(() => this.updateMapFrame());
    }

    updateMapFrame() {
      if (!this.container) return;
      const bounds = this.container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const naturalWidth = this.background?.naturalWidth || MAP_FRAME_FALLBACK_SIZE.width;
      const naturalHeight = this.background?.naturalHeight || MAP_FRAME_FALLBACK_SIZE.height;
      const aspect = naturalWidth / naturalHeight;
      let frameWidth = bounds.width;
      let frameHeight = frameWidth / aspect;
      if (frameHeight > bounds.height) {
        frameHeight = bounds.height;
        frameWidth = frameHeight * aspect;
      }
      const left = (bounds.width - frameWidth) / 2;
      const top = (bounds.height - frameHeight) / 2;
      this.container.style.setProperty('--map-frame-left', `${left}px`);
      this.container.style.setProperty('--map-frame-top', `${top}px`);
      this.container.style.setProperty('--map-frame-width', `${frameWidth}px`);
      this.container.style.setProperty('--map-frame-height', `${frameHeight}px`);
    }

    renderMarkers() {
      if (!this.markersLayer) return;
      this.markersLayer.innerHTML = '';
      this.locationMarkerMap.clear();
      this.activeMarker = null;
      this.getVisibleLocations().forEach(location => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = `map-marker map-marker--store ${location.id === this.activeLocationId ? 'map-marker--active' : ''}`;
        const projected = projectCoordinateToRealMap(getLocationCoordinate(location), this.realMapView)
          || { x: location.coords?.x ?? 50, y: location.coords?.y ?? 50 };
        marker.style.left = `${projected.x}%`;
        marker.style.top = `${projected.y}%`;
        const coordinateLabel = formatCoordinatePair(getLocationCoordinate(location));
        marker.setAttribute('aria-label', `${location.name} marker ${coordinateLabel}`);
        marker.title = coordinateLabel ? `${location.name} · ${coordinateLabel}` : location.name;
        const markerIcon = escapeHtml(location.markerIcon || 'fa-store');
        const markerLabel = escapeHtml(location.markerLabel || location.name);
        marker.innerHTML = `
          <span class="map-marker__icon" aria-hidden="true"><i class="fas ${markerIcon}"></i></span>
          <span class="map-marker__label">${markerLabel}</span>
        `;
        marker.addEventListener('click', () => this.showLocationCard(location, marker));
        this.markersLayer.appendChild(marker);
        this.locationMarkerMap.set(location.id, marker);
        if (location.id === this.activeLocationId) {
          this.activeMarker = marker;
        }
      });
    }

    renderLocationList() {
      if (!this.locationListEl) return;
      this.locationListEl.innerHTML = '';
      this.locationRowMap.clear();
      const visibleLocations = this.getVisibleLocations();
      if (!visibleLocations.length) {
        this.locationListEl.innerHTML = '<p class="map-empty-state">No matching spots.</p>';
        return;
      }
      visibleLocations.forEach(location => {
        const entry = document.createElement('button');
        entry.type = 'button';
        entry.className = 'map-spot-row';
        const coordinateLabel = formatCoordinatePair(getLocationCoordinate(location));
        entry.innerHTML = `
          <span class="flex items-center justify-between">
            <span class="map-spot-row__title">${escapeHtml(location.name)}</span>
            <span class="text-[10px] text-gray-500">${escapeHtml(location.rating)}</span>
          </span>
          <span class="map-spot-row__meta">${escapeHtml(location.type)}</span>
          <span class="map-spot-row__foot">${escapeHtml(coordinateLabel || location.address)}</span>
        `;
        entry.addEventListener('click', () => this.showLocationCard(location));
        this.locationListEl.appendChild(entry);
        this.locationRowMap.set(location.id, entry);
      });
      this.updateLocationSelection();
    }

    getVisibleLocations() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.locations;
      return this.locations.filter((location) => {
        const haystack = [
          location.name,
          location.markerLabel,
          location.type,
          location.description,
          location.rating,
          location.address,
          location.status,
          formatCoordinatePair(getLocationCoordinate(location)),
          ...(location.tags || []),
          ...(location.pets || [])
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    attachSearchHandler() {
      if (!this.searchInput) return;
      this.searchInput.addEventListener('input', () => {
        this.searchQuery = this.searchInput.value || '';
        this.renderMarkers();
        this.renderLocationList();
        this.updateLocationCount();
        const visibleLocations = this.getVisibleLocations();
        if (this.activeLocationId && !visibleLocations.some((entry) => entry.id === this.activeLocationId)) {
          this.hideLocationCard();
          return;
        }
        if (!this.activeLocationId && !this.activeTrackedPetId && visibleLocations.length && window.innerWidth > 768) {
          this.showLocationCard(visibleLocations[0]);
        }
      });
    }

    attachControlHandlers() {
      const controls = this.controls || {};
      if (controls.zoomIn) {
        controls.zoomIn.addEventListener('click', () => this.setZoomLevel(this.zoomLevel + 1));
      }
      if (controls.zoomOut) {
        controls.zoomOut.addEventListener('click', () => this.setZoomLevel(this.zoomLevel - 1));
      }
      if (controls.reset) {
        controls.reset.addEventListener('click', () => this.resetView());
      }
      if (controls.fenceToggle) {
        controls.fenceToggle.addEventListener('click', () => {
          this.showGeofence = !this.showGeofence;
          this.updateControls();
          this.renderOverlay();
        });
      }
      if (controls.tracksToggle) {
        controls.tracksToggle.addEventListener('click', () => {
          this.showTracks = !this.showTracks;
          this.updateControls();
          this.renderOverlay();
        });
      }
      if (controls.fenceEnabled) {
        controls.fenceEnabled.addEventListener('change', () => {
          this.setFenceEnabledForCurrent(controls.fenceEnabled.checked);
        });
      }
      if (controls.fenceRadius) {
        controls.fenceRadius.addEventListener('input', () => {
          this.setFenceRadiusForCurrent(controls.fenceRadius.value);
        });
      }
      if (controls.fencePickCenter) {
        controls.fencePickCenter.addEventListener('click', () => this.startFenceCenterPick());
      }
      if (controls.fenceCenterCurrent) {
        controls.fenceCenterCurrent.addEventListener('click', () => this.centerFenceOnCurrentPet());
      }
      if (controls.trackActiveOnly) {
        controls.trackActiveOnly.addEventListener('change', () => {
          this.trackScope = controls.trackActiveOnly.checked ? 'active' : 'all';
          this.preferences.trackScope = this.trackScope;
          this.savePreferences();
          if (this.trackScope === 'active' && !this.activeTrackedPetId) {
            const pet = this.getControlPet();
            if (pet) this.activeTrackedPetId = pet.id;
          }
          this.updateControls();
          this.renderOverlay();
        });
      }
      if (controls.trackAddPoint) {
        controls.trackAddPoint.addEventListener('click', () => this.startTrackPointPick());
      }
      if (controls.trackClear) {
        controls.trackClear.addEventListener('click', () => this.clearTrackForCurrentPet());
      }
      if (controls.trackRestore) {
        controls.trackRestore.addEventListener('click', () => this.restoreTrackForCurrentPet());
      }
      if (this.container) {
        this.container.addEventListener('click', (event) => this.handleMapClick(event));
        this.container.addEventListener('dblclick', (event) => {
          if (event.target?.closest?.('.map-control-panel, .real-map-link')) return;
          if (this.centerPickPetId || this.trackPointPickPetId) return;
          event.preventDefault();
          this.setZoomLevel(this.zoomLevel + 1);
        });
      }
    }

    updateControls() {
      const controls = this.controls || {};
      if (controls.zoomIn) controls.zoomIn.disabled = this.zoomLevel >= MAP_ZOOM_MAX;
      if (controls.zoomOut) controls.zoomOut.disabled = this.zoomLevel <= MAP_ZOOM_MIN;
      if (controls.zoomLabel) {
        controls.zoomLabel.textContent = `${Math.round((2 ** this.zoomLevel) * 100)}%`;
      }
      if (controls.fenceToggle) {
        controls.fenceToggle.classList.toggle('active', this.showGeofence);
        controls.fenceToggle.setAttribute('aria-pressed', this.showGeofence ? 'true' : 'false');
      }
      if (controls.tracksToggle) {
        controls.tracksToggle.classList.toggle('active', this.showTracks);
        controls.tracksToggle.setAttribute('aria-pressed', this.showTracks ? 'true' : 'false');
      }
      this.updateMapToolPanel();
    }

    savePreferences() {
      writeMapPreferences(this.preferences);
    }

    getPetSettings(petId = '') {
      if (!petId) return {};
      const settings = this.preferences?.petSettings?.[petId];
      return settings && typeof settings === 'object' ? settings : {};
    }

    updatePetSettings(petId = '', patch = {}) {
      if (!petId) return;
      const petSettings = {
        ...(this.preferences.petSettings || {}),
        [petId]: {
          ...this.getPetSettings(petId),
          ...patch,
        },
      };
      this.preferences = {
        ...this.preferences,
        trackScope: this.trackScope,
        petSettings,
      };
      this.savePreferences();
    }

    getControlPet() {
      return this.trackedPets.find((entry) => entry.id === this.activeTrackedPetId)
        || this.getRealMapPet(this.trackedPets)
        || this.trackedPets[0]
        || null;
    }

    getFenceState(pet = {}) {
      const settings = this.getPetSettings(pet.id);
      const storedCenter = normalizeCoordinate(settings.fenceCenter?.lat, settings.fenceCenter?.lon);
      const current = getPetMapCoordinate(pet);
      const center = storedCenter || current;
      const radiusM = clampNumber(
        settings.fenceRadiusM ?? pet.geofenceRadiusM,
        FENCE_RADIUS_MIN_M,
        FENCE_RADIUS_MAX_M,
        DEFAULT_GEOFENCE_RADIUS_M
      );
      const enabled = typeof settings.fenceEnabled === 'boolean'
        ? settings.fenceEnabled
        : pet.geofenceEnabled !== false;
      const distanceM = center && current ? distanceMeters(center, current) : null;
      const alert = pet.lostAlert === true || (enabled && Number.isFinite(distanceM) && distanceM > radiusM);
      return { enabled, radiusM, center, current, distanceM, alert };
    }

    getTrackSettings(pet = {}) {
      const settings = this.getPetSettings(pet.id);
      return {
        trackCleared: settings.trackCleared === true,
        extraTrackPoints: Array.isArray(settings.extraTrackPoints)
          ? settings.extraTrackPoints
              .map((point) => trackPoint(normalizeCoordinate(point?.lat, point?.lon), {
                timestamp: point?.timestamp || '',
                source: point?.source || 'manual',
                accuracyM: point?.accuracyM,
              }))
              .filter(Boolean)
          : [],
      };
    }

    setFenceEnabledForCurrent(enabled) {
      const pet = this.getControlPet();
      if (!pet) return;
      this.updatePetSettings(pet.id, { fenceEnabled: Boolean(enabled) });
      this.setMapToolMessage(Boolean(enabled) ? 'Fence enabled' : 'Fence paused', Boolean(enabled) ? 'ready' : 'off');
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    setFenceRadiusForCurrent(value) {
      const pet = this.getControlPet();
      if (!pet) return;
      const radiusM = clampNumber(value, FENCE_RADIUS_MIN_M, FENCE_RADIUS_MAX_M, DEFAULT_GEOFENCE_RADIUS_M);
      this.updatePetSettings(pet.id, { fenceRadiusM: radiusM, fenceEnabled: true });
      this.mapToolMessage = '';
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    setFenceCenterForPet(pet, coordinate, message = 'Fence center updated') {
      if (!pet || !coordinate) return;
      this.updatePetSettings(pet.id, {
        fenceCenter: {
          lat: Number(coordinate.lat),
          lon: Number(coordinate.lon),
        },
        fenceEnabled: true,
      });
      this.setMapToolMessage(message, 'ready');
      this.stopPickModes();
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    centerFenceOnCurrentPet() {
      const pet = this.getControlPet();
      const coordinate = pet ? getPetMapCoordinate(pet) : null;
      if (!pet || !coordinate) {
        this.setMapToolMessage('No valid pet location', 'alert');
        return;
      }
      this.setFenceCenterForPet(pet, coordinate, 'Fence centered on pet');
    }

    startFenceCenterPick() {
      const pet = this.getControlPet();
      if (!pet) {
        this.setMapToolMessage('Select a pet first', 'alert');
        return;
      }
      this.trackPointPickPetId = '';
      this.centerPickPetId = this.centerPickPetId === pet.id ? '' : pet.id;
      this.container?.classList.toggle('map-container--picking-fence', Boolean(this.centerPickPetId));
      this.container?.classList.remove('map-container--picking-route');
      this.setMapToolMessage(this.centerPickPetId ? 'Click the map to set fence center' : 'Fence center pick cancelled', this.centerPickPetId ? 'editing' : 'ready');
      this.updateMapToolPanel();
    }

    startTrackPointPick() {
      const pet = this.getControlPet();
      if (!pet) {
        this.setMapToolMessage('Select a pet first', 'alert');
        return;
      }
      this.centerPickPetId = '';
      this.trackPointPickPetId = this.trackPointPickPetId === pet.id ? '' : pet.id;
      this.container?.classList.remove('map-container--picking-fence');
      this.container?.classList.toggle('map-container--picking-route', Boolean(this.trackPointPickPetId));
      this.setMapToolMessage(this.trackPointPickPetId ? 'Click the map to add a GPS sample' : 'Route point pick cancelled', this.trackPointPickPetId ? 'editing' : 'ready');
      this.updateMapToolPanel();
    }

    stopPickModes() {
      this.centerPickPetId = '';
      this.trackPointPickPetId = '';
      this.container?.classList.remove('map-container--picking-fence', 'map-container--picking-route');
    }

    pointFromMapClick(event) {
      const rect = this.container?.getBoundingClientRect?.();
      if (!rect?.width || !rect?.height) return null;
      const x = clampNumber(((event.clientX - rect.left) / rect.width) * 100, 0, 100, 50);
      const y = clampNumber(((event.clientY - rect.top) / rect.height) * 100, 0, 100, 50);
      return projectRealMapPointToCoordinate({ x, y }, this.realMapView);
    }

    handleMapClick(event) {
      if (!this.centerPickPetId && !this.trackPointPickPetId) return;
      if (event.target?.closest?.('.map-control-panel, .map-marker, .map-pet, .real-map-link')) return;
      const coordinate = this.pointFromMapClick(event);
      if (!coordinate) {
        this.setMapToolMessage('Map point unavailable', 'alert');
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (this.centerPickPetId) {
        const pet = this.trackedPets.find((entry) => entry.id === this.centerPickPetId) || this.getControlPet();
        this.setFenceCenterForPet(pet, coordinate, 'Fence center set on map');
        return;
      }
      if (this.trackPointPickPetId) {
        this.addTrackPointForPet(this.trackPointPickPetId, coordinate);
      }
    }

    addTrackPointForPet(petId, coordinate) {
      const pet = this.trackedPets.find((entry) => entry.id === petId) || this.getControlPet();
      if (!pet || !coordinate) return;
      const settings = this.getTrackSettings(pet);
      const extraTrackPoints = [
        ...settings.extraTrackPoints,
        {
          lat: Number(coordinate.lat),
          lon: Number(coordinate.lon),
          timestamp: new Date().toISOString(),
          source: 'manual',
          accuracyM: 12,
        },
      ].slice(-TRACK_EXTRA_LIMIT);
      this.updatePetSettings(pet.id, {
        trackCleared: false,
        extraTrackPoints,
      });
      this.setMapToolMessage('GPS sample added', 'ready');
      this.stopPickModes();
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    clearTrackForCurrentPet() {
      const pet = this.getControlPet();
      if (!pet) return;
      this.updatePetSettings(pet.id, {
        trackCleared: true,
        extraTrackPoints: [],
      });
      this.setMapToolMessage('Route cleared for this pet', 'off');
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    restoreTrackForCurrentPet() {
      const pet = this.getControlPet();
      if (!pet) return;
      this.updatePetSettings(pet.id, {
        trackCleared: false,
        extraTrackPoints: [],
      });
      this.setMapToolMessage('Route restored from history', 'ready');
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    setMapToolMessage(message = '', tone = 'ready') {
      this.mapToolMessage = message;
      this.mapToolTone = tone;
    }

    updateMapToolPanel() {
      const controls = this.controls || {};
      const pet = this.getControlPet();
      const hasPet = Boolean(pet);
      const fence = hasPet ? this.getFenceState(pet) : null;
      const trackSummary = hasPet ? this.getPetTrackSummary(pet) : null;
      const totalTrackPoints = this.trackedPets.reduce((sum, entry) => sum + this.getPetTrackPoints(entry).length, 0);

      if (controls.toolPetName) {
        controls.toolPetName.textContent = hasPet
          ? `${pet.name} · ${formatCoordinatePair(getPetMapCoordinate(pet)) || pet.location || 'No GPS'}`
          : 'Select a pet on the map';
      }
      if (controls.fenceEnabled) {
        controls.fenceEnabled.checked = Boolean(fence?.enabled);
        controls.fenceEnabled.disabled = !hasPet;
      }
      if (controls.fenceRadius) {
        controls.fenceRadius.value = String(Math.round(fence?.radiusM || DEFAULT_GEOFENCE_RADIUS_M));
        controls.fenceRadius.disabled = !hasPet;
      }
      if (controls.fenceRadiusValue) {
        controls.fenceRadiusValue.textContent = `${Math.round(fence?.radiusM || DEFAULT_GEOFENCE_RADIUS_M)}m`;
      }
      if (controls.fenceStatus) {
        const status = !hasPet
          ? 'No pet'
          : this.mapToolMessage
            || (!this.showGeofence ? 'Fence hidden'
              : !fence.enabled ? 'Fence off'
                : fence.alert ? `Outside ${Math.round(fence.distanceM || 0)}m`
                  : `Inside ${Math.round(fence.distanceM || 0)}m`);
        controls.fenceStatus.textContent = status;
        controls.fenceStatus.dataset.status = this.mapToolMessage
          ? this.mapToolTone
          : fence?.alert ? 'alert' : fence?.enabled ? 'ready' : 'off';
      }
      if (controls.fencePickCenter) {
        controls.fencePickCenter.disabled = !hasPet;
        controls.fencePickCenter.classList.toggle('active', Boolean(this.centerPickPetId));
      }
      if (controls.fenceCenterCurrent) {
        controls.fenceCenterCurrent.disabled = !hasPet || !getPetMapCoordinate(pet);
      }
      if (controls.trackActiveOnly) {
        controls.trackActiveOnly.checked = this.trackScope === 'active';
        controls.trackActiveOnly.disabled = !hasPet;
      }
      if (controls.trackAddPoint) {
        controls.trackAddPoint.disabled = !hasPet;
        controls.trackAddPoint.classList.toggle('active', Boolean(this.trackPointPickPetId));
      }
      if (controls.trackClear) controls.trackClear.disabled = !hasPet;
      if (controls.trackRestore) controls.trackRestore.disabled = !hasPet;
      if (controls.trackStatus) {
        controls.trackStatus.textContent = !this.showTracks
          ? 'Routes hidden'
          : this.trackScope === 'active'
            ? (trackSummary ? `${formatDistanceMeters(trackSummary.distanceM)} · ${formatDurationMs(trackSummary.durationMs)}` : 'No route')
            : `${totalTrackPoints} pts`;
      }
    }

    resetView() {
      this.zoomLevel = 0;
      this.updateControls();
      this.refreshMapProjection();
    }

    setZoomLevel(nextLevel = 0) {
      const next = clampNumber(nextLevel, MAP_ZOOM_MIN, MAP_ZOOM_MAX, 0);
      if (next === this.zoomLevel) return;
      this.zoomLevel = next;
      this.updateControls();
      this.refreshMapProjection();
    }

    refreshMapProjection() {
      this.renderTrackedPets();
      this.renderMarkers();
      this.renderOverlay();
    }

    getTrackedPets() {
      const storedPets = readStoredPets().map((pet, index) => normalizeTrackedPet(pet, index));
      if (storedPets.length) return storedPets;
      return MAP_ANIMALS.map((animal, index) => ({
        id: `demo-${animal.name}`,
        name: animal.name,
        type: 'Tracked pet',
        avatar: '',
        emoji: animal.emoji,
        location: animal.status,
        coords: animal.coords,
        lat: animal.lat,
        lon: animal.lon,
        locationValid: true,
        gpsFix: 1,
        note: animal.status,
        latestVitals: null,
      }));
    }

    getRealMapPet(pets = this.trackedPets) {
      if (this.activeTrackedPetId) {
        const active = pets.find((entry) => entry.id === this.activeTrackedPetId);
        if (active && getPetMapCoordinate(active)) return active;
      }
      return pets.find(isLiveGpsPet) || null;
    }

    getTileZoom() {
      return clampNumber(OSM_TILE_ZOOM + this.zoomLevel, OSM_TILE_MIN_ZOOM, OSM_TILE_MAX_ZOOM, OSM_TILE_ZOOM);
    }

    renderTileLayer() {
      if (!this.realMapTiles || !this.realMapView?.bounds) return;
      const bounds = this.realMapView.bounds;
      const zoom = this.getTileZoom();
      const westX = lonToTileWorldX(bounds.west, zoom);
      const eastX = lonToTileWorldX(bounds.east, zoom);
      const northY = latToTileWorldY(bounds.north, zoom);
      const southY = latToTileWorldY(bounds.south, zoom);
      const worldWidth = Math.max(1, eastX - westX);
      const worldHeight = Math.max(1, southY - northY);
      const viewKey = [
        zoom,
        westX.toFixed(1),
        eastX.toFixed(1),
        northY.toFixed(1),
        southY.toFixed(1),
      ].join(':');

      this.realMapTiles.classList.remove('hidden');
      if (this.realMapTiles.dataset.viewKey === viewKey) return;

      const startX = Math.floor(westX / OSM_TILE_SIZE);
      const endX = Math.floor(eastX / OSM_TILE_SIZE);
      const startY = Math.floor(northY / OSM_TILE_SIZE);
      const endY = Math.floor(southY / OSM_TILE_SIZE);
      const maxTile = 2 ** zoom;
      const fragment = document.createDocumentFragment();

      for (let tileX = startX; tileX <= endX; tileX += 1) {
        for (let tileY = startY; tileY <= endY; tileY += 1) {
          if (tileY < 0 || tileY >= maxTile) continue;
          const wrappedX = ((tileX % maxTile) + maxTile) % maxTile;
          const tile = document.createElement('img');
          tile.className = 'real-map-tile';
          tile.alt = '';
          tile.loading = 'eager';
          tile.decoding = 'async';
          tile.referrerPolicy = 'no-referrer';
          tile.draggable = false;
          tile.style.left = `${((tileX * OSM_TILE_SIZE - westX) / worldWidth) * 100}%`;
          tile.style.top = `${((tileY * OSM_TILE_SIZE - northY) / worldHeight) * 100}%`;
          tile.style.width = `${(OSM_TILE_SIZE / worldWidth) * 100}%`;
          tile.style.height = `${(OSM_TILE_SIZE / worldHeight) * 100}%`;
          let sourceIndex = 0;
          let fallbackTimer = 0;
          const applyTileSource = () => {
            tile.dataset.source = String(sourceIndex);
            tile.src = mapTileUrl(wrappedX, tileY, zoom, sourceIndex);
            if (fallbackTimer) window.clearTimeout(fallbackTimer);
            fallbackTimer = window.setTimeout(tryNextTileSource, MAP_TILE_LOAD_TIMEOUT_MS);
          };
          const markLoaded = () => {
            if (fallbackTimer) window.clearTimeout(fallbackTimer);
            fallbackTimer = 0;
            tile.classList.add('real-map-tile--loaded');
          };
          const markFailed = () => {
            if (fallbackTimer) window.clearTimeout(fallbackTimer);
            fallbackTimer = 0;
            tile.classList.add('real-map-tile--failed');
          };
          function tryNextTileSource() {
            if (sourceIndex >= MAP_TILE_URL_TEMPLATES.length - 1) {
              markFailed();
              return;
            }
            sourceIndex += 1;
            applyTileSource();
          }
          tile.addEventListener('load', markLoaded);
          tile.addEventListener('error', tryNextTileSource);
          applyTileSource();
          fragment.appendChild(tile);
        }
      }

      const attribution = document.createElement('span');
      attribution.className = 'real-map-attribution';
      attribution.innerHTML = 'Map data &copy; OpenStreetMap · CARTO fallback';
      this.realMapTiles.replaceChildren(fragment);
      this.realMapTiles.appendChild(attribution);
      this.realMapTiles.dataset.viewKey = viewKey;
    }

    updateRealMapState() {
      this.realMapPet = this.getRealMapPet();
      const bounds = this.container?.getBoundingClientRect?.();
      const mapAspect = bounds?.width && bounds?.height
        ? bounds.width / bounds.height
        : REAL_MAP_DEFAULT_ASPECT;
      this.realMapView = applyZoomToMapView(
        buildRealMapView(
          this.trackedPets,
          this.locations,
          this.activeTrackedPetId,
          this.activeLocationId,
          mapAspect
        ),
        this.zoomLevel
      );
      if (!this.container) return;

      this.container.classList.add('map-container--real');
      if (this.realMapTiles) {
        this.renderTileLayer();
      } else if (this.realMapFrame) {
        const src = osmEmbedUrl(this.realMapView);
        if (this.realMapFrame.getAttribute('src') !== src) {
          this.realMapFrame.setAttribute('src', src);
        }
        this.realMapFrame.classList.remove('hidden');
      }
      if (this.realMapFrame && this.realMapTiles) {
        this.realMapFrame.classList.add('hidden');
        this.realMapFrame.removeAttribute('src');
      }
      this.markersLayer?.classList.remove('hidden');
      if (this.realMapLink) {
        const marker = this.realMapView.marker || REAL_MAP_DEFAULT_CENTER;
        this.realMapLink.href = osmOpenUrl(marker.lat, marker.lon);
        this.realMapLink.classList.remove('hidden');
      }
    }

    renderTrackedPets() {
      if (!this.petsLayer) return;
      this.trackedPets = this.getTrackedPets();
      this.updateRealMapState();
      this.petsLayer.innerHTML = '';
      this.trackedPetMap.clear();
      this.trackedPets.forEach(record => {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = `map-pet map-pet--tracked ${this.activeTrackedPetId === record.id ? 'map-pet--focus' : ''}`;
        const coordinate = getPetMapCoordinate(record);
        const coordinateLabel = formatCoordinatePair(coordinate);
        const projected = projectCoordinateToRealMap(coordinate, this.realMapView)
          || { x: record.coords?.x ?? 50, y: record.coords?.y ?? 50 };
        node.style.left = `${projected.x}%`;
        node.style.top = `${projected.y}%`;
        node.title = coordinateLabel ? `${record.name} · ${coordinateLabel}` : `${record.name} · ${record.location}`;
        node.setAttribute('aria-label', `${record.name} ${coordinateLabel || 'location'}`);
        const avatar = safeImageSrc(record.avatar, '');
        const avatarMarkup = avatar
          ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(record.name)}" />`
          : escapeHtml(record.emoji);
        node.innerHTML = `
          <span class="map-pet-circle">${avatarMarkup}</span>
          <span class="map-pet-name">${escapeHtml(record.name)}</span>
          <span class="map-pet-status">${escapeHtml(record.location)}</span>
        `;
        node.addEventListener('click', () => this.focusTrackedPet(record.id));
        this.petsLayer.appendChild(node);
        this.trackedPetMap.set(record.id, node);
      });
      this.renderTrackedPetList();
      this.updateTrackedCount();
      this.renderOverlay();
      this.updateMapToolPanel();
    }

    getPetTrackPoints(pet = {}) {
      const trackSettings = this.getTrackSettings(pet);
      if (trackSettings.trackCleared) return [];
      const points = [];
      const history = Array.isArray(pet.vitalsHistory) ? pet.vitalsHistory : [];
      history
        .slice()
        .reverse()
        .forEach((entry) => {
          const point = trackPointFromEntry(entry);
          if (point) points.push(point);
        });

      const current = getPetMapCoordinate(pet);
      if (current) {
        points.push(trackPoint(current, {
          timestamp: pet.telemetryUpdatedAt || pet.latestVitals?.timestamp || '',
          source: isLiveGpsPet(pet) ? 'live-gps' : 'saved-point',
          accuracyM: pet.gpsHdop,
        }));
      }
      trackSettings.extraTrackPoints.forEach((point) => points.push(point));

      const unique = [];
      const seen = new Set();
      points.forEach((point) => {
        const key = coordinateKey(point);
        if (!key || seen.has(key)) return;
        seen.add(key);
        unique.push(point);
      });

      if (unique.length >= 2) return unique.slice(-TRACK_EXTRA_LIMIT);
      if (current && String(pet.id || '').startsWith('demo-')) {
        return buildDemoTrackPoints(pet).slice(-TRACK_EXTRA_LIMIT);
      }
      return unique;
    }

    getPetTrackCoordinates(pet = {}) {
      return this.getPetTrackPoints(pet).map((point) => ({ lat: point.lat, lon: point.lon }));
    }

    getPetTrackSummary(pet = {}) {
      const points = this.getPetTrackPoints(pet);
      if (points.length < 2) {
        return {
          count: points.length,
          distanceM: 0,
          durationMs: 0,
          latestTimestamp: points[0]?.timestamp || '',
          source: points[0]?.source || '',
        };
      }
      let distanceM = 0;
      for (let index = 1; index < points.length; index += 1) {
        distanceM += distanceMeters(points[index - 1], points[index]) || 0;
      }
      const startTime = new Date(points[0].timestamp || '').getTime();
      const endTime = new Date(points[points.length - 1].timestamp || '').getTime();
      return {
        count: points.length,
        distanceM,
        durationMs: Number.isFinite(startTime) && Number.isFinite(endTime) && endTime > startTime ? endTime - startTime : 0,
        latestTimestamp: points[points.length - 1]?.timestamp || '',
        source: points.some((point) => String(point.source || '').includes('demo')) ? 'demo' : 'gps',
      };
    }

    geofenceRadiusForPet(pet = {}) {
      return this.getFenceState(pet).radiusM;
    }

    projectGeofence(pet = {}) {
      const fenceState = this.getFenceState(pet);
      if (!fenceState.enabled || !fenceState.center) return null;
      const centerCoordinate = fenceState.center;
      const center = projectCoordinateToRealMap(centerCoordinate, this.realMapView);
      if (!center) return null;
      const radiusM = fenceState.radiusM;
      const east = projectCoordinateToRealMap(offsetCoordinateMeters(centerCoordinate, radiusM, 0), this.realMapView);
      const north = projectCoordinateToRealMap(offsetCoordinateMeters(centerCoordinate, 0, radiusM), this.realMapView);
      const rx = east ? Math.max(2.3, Math.abs(east.x - center.x)) : 5;
      const ry = north ? Math.max(2.3, Math.abs(north.y - center.y)) : 5;
      return {
        ...center,
        rx,
        ry,
        radiusM,
        distanceM: fenceState.distanceM,
        alert: fenceState.alert,
      };
    }

    renderOverlay() {
      if (!this.overlayLayer) return;
      const parts = [];
      const activeId = this.activeTrackedPetId;
      if (this.showGeofence) {
        this.trackedPets.forEach((pet) => {
          const fence = this.projectGeofence(pet);
          if (!fence) return;
          const isActive = pet.id === activeId;
          const isAlert = fence.alert === true;
          const className = [
            'map-geofence',
            isActive ? 'map-geofence--active' : '',
            isAlert ? 'map-geofence--alert' : '',
          ].filter(Boolean).join(' ');
          const labelX = Math.min(95, fence.x + fence.rx + 1.2);
          const labelY = Math.max(5, fence.y - fence.ry - 1.2);
          parts.push(`<ellipse class="${className}" cx="${fence.x.toFixed(2)}" cy="${fence.y.toFixed(2)}" rx="${fence.rx.toFixed(2)}" ry="${fence.ry.toFixed(2)}"></ellipse>`);
          parts.push(`<text class="map-geofence-label" x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}">${escapeHtml(isAlert ? `Alert ${Math.round(fence.distanceM || 0)}m` : `${Math.round(fence.radiusM)}m fence`)}</text>`);
        });
      }

      if (this.showTracks) {
        const visibleTrackPets = this.trackScope === 'active'
          ? [this.getControlPet()].filter(Boolean)
          : this.trackedPets;
        visibleTrackPets.forEach((pet) => {
          const trackPoints = this.getPetTrackPoints(pet);
          const points = trackPoints
            .map((point) => {
              const projected = projectCoordinateToRealMap(point, this.realMapView);
              return projected ? { ...projected, source: point.source, timestamp: point.timestamp } : null;
            })
            .filter(Boolean);
          if (points.length < 2) return;
          const path = smoothSvgPath(points);
          const isActive = pet.id === activeId;
          const summary = this.getPetTrackSummary(pet);
          const trackClass = [
            'map-track-path',
            isActive ? 'map-track-path--active' : '',
            summary.source === 'demo' ? 'map-track-path--demo' : '',
          ].filter(Boolean).join(' ');
          parts.push(`<path class="map-track-underlay" d="${path}"></path>`);
          parts.push(`<path class="${trackClass}" d="${path}"></path>`);

          const start = points[0];
          const end = points[points.length - 1];
          parts.push(`<circle class="map-track-point map-track-point--start" cx="${start.x.toFixed(2)}" cy="${start.y.toFixed(2)}" r="${isActive ? '0.82' : '0.62'}"></circle>`);
          points.slice(1, -1).filter((_, index) => index % 2 === 0).slice(-4).forEach((point) => {
            parts.push(`<circle class="map-track-point" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${isActive ? '0.48' : '0.38'}"></circle>`);
          });
          const arrowIndex = Math.max(1, Math.floor(points.length * 0.66));
          const arrowPath = routeArrowPath(points[arrowIndex - 1], points[arrowIndex], isActive ? 1.25 : 1.05);
          if (arrowPath) parts.push(`<path class="map-track-arrow ${isActive ? 'map-track-arrow--active' : ''}" d="${arrowPath}"></path>`);
          parts.push(`<circle class="map-track-point map-track-point--end ${isActive ? 'map-track-point--end-active' : ''}" cx="${end.x.toFixed(2)}" cy="${end.y.toFixed(2)}" r="${isActive ? '1.05' : '0.78'}"></circle>`);
        });
      }

      this.overlayLayer.innerHTML = parts.join('');
    }

    attachCardHandlers() {
      if (this.cardElements.closeButton) {
        this.cardElements.closeButton.addEventListener('click', () => this.hideLocationCard());
      }
    }

    revealDetailCard() {
      if (!this.locationCard || this.locationCard.classList.contains('hidden')) return;
      if (window.innerWidth > 768) return;
      window.requestAnimationFrame(() => {
        this.locationCard.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      });
    }

    focusTrackedPet(petId) {
      this.activeTrackedPetId = petId;
      this.activeLocationId = null;
      this.renderTrackedPets();
      this.renderMarkers();
      const pet = this.trackedPets.find((entry) => entry.id === petId);
      if (!pet) return;
      this.updateLocationSelection();
      this.trackedPetMap.forEach((node, id) => {
        node.classList.toggle('map-pet--focus', id === petId);
      });
      if (this.activeMarker) {
        this.activeMarker.classList.remove('map-marker--active');
        this.activeMarker = null;
      }
      if (this.locationCard) {
        this.locationCard.classList.remove('hidden');
      }
      this.cardElements.name.textContent = pet.name;
      this.cardElements.type.textContent = `${pet.type} · Live tracking`;
      this.cardElements.desc.textContent = pet.note || `${pet.name} is currently near ${pet.location}.`;
      this.cardElements.rating.textContent = pet.latestVitals
        ? `Temp ${pet.latestVitals.temperature?.toFixed?.(1) ?? pet.latestVitals.temperature}°C · BPM ${pet.latestVitals.heartRate ?? '--'} · SpO2 ${Number.isFinite(Number(pet.latestVitals.spo2Pct)) ? `${Math.round(Number(pet.latestVitals.spo2Pct))}%` : '--'}`
        : 'Tracking enabled';
      this.cardElements.hours.textContent = pet.latestVitals?.timestamp
        ? `Updated ${new Date(pet.latestVitals.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'No vitals uploaded yet';
      this.cardElements.phone.textContent = pet.nfcContact || 'Emergency contact not set';
      this.cardElements.phone.closest('p')?.classList.remove('hidden');
      const petCoordinate = getPetMapCoordinate(pet);
      const coordinateLabel = formatCoordinatePair(petCoordinate);
      this.cardElements.address.textContent = coordinateLabel
        ? `${pet.location || 'GPS position'} · ${coordinateLabel}`
        : (pet.location || '');
      this.cardElements.status.textContent = pet.note || '';
      if (pet.deviceId) {
        const statusParts = [pet.note, `Device ${pet.deviceId}`];
        if (coordinateLabel) statusParts.push(`GPS ${coordinateLabel}`);
        const battery = pet.latestVitals?.batteryPct;
        if (Number.isFinite(Number(battery))) statusParts.push(`${Math.round(Number(battery))}% battery`);
        if (Number.isFinite(Number(pet.gpsFix))) statusParts.push(`GPS fix ${Math.round(Number(pet.gpsFix))}`);
        if (Number.isFinite(Number(pet.gpsHdop))) statusParts.push(`HDOP ${Number(pet.gpsHdop).toFixed(1)}`);
        if (pet.wifiConnected !== null && pet.wifiConnected !== undefined) statusParts.push(`Wi-Fi ${statusLabel(pet.wifiConnected)}`);
        if (Number.isFinite(Number(pet.uploadCode))) statusParts.push(`HTTP ${Math.round(Number(pet.uploadCode))}`);
        this.cardElements.status.textContent = statusParts.filter(Boolean).join(' · ');
      }
      const fenceState = this.getFenceState(pet);
      const trackSummary = this.getPetTrackSummary(pet);
      this.cardElements.tags.innerHTML = [
        '<span class="location-tag">Tracked</span>',
        `<span class="location-tag">Card ${escapeHtml(pet.nfcId || 'pending')}</span>`,
        `<span class="location-tag">Location ${escapeHtml(statusLabel(pet.locationValid))}</span>`,
        `<span class="location-tag">Fence ${escapeHtml(fenceState.enabled ? `${Math.round(fenceState.radiusM)}m` : 'OFF')}</span>`,
        `<span class="location-tag">Route ${escapeHtml(trackSummary.count >= 2 ? formatDistanceMeters(trackSummary.distanceM) : 'pending')}</span>`,
      ].join('');
      this.cardElements.pets.innerHTML = pet.latestVitals
        ? `<span class="location-tag location-tag--emphasis">Temp ${escapeHtml(pet.latestVitals.temperature)}°C</span><span class="location-tag location-tag--emphasis">BPM ${escapeHtml(pet.latestVitals.heartRate)}</span><span class="location-tag location-tag--emphasis">SpO2 ${Number.isFinite(Number(pet.latestVitals.spo2Pct)) ? `${Math.round(Number(pet.latestVitals.spo2Pct))}%` : '--'}</span>${Number.isFinite(Number(pet.latestVitals.batteryPct)) ? `<span class="location-tag location-tag--emphasis">Battery ${Math.round(Number(pet.latestVitals.batteryPct))}%</span>` : ''}`
        : '<span class="location-tag location-tag--emphasis">Waiting for vitals</span>';
      const linkButton = this.cardElements.linkButton;
      if (linkButton) {
        linkButton.disabled = false;
        linkButton.classList.remove('opacity-40', 'cursor-not-allowed', 'hidden');
        linkButton.innerHTML = coordinateLabel
          ? '<i class="fas fa-location-dot mr-1"></i>Open GPS point'
          : '<i class="fas fa-paw mr-1"></i>Open pet card';
        linkButton.onclick = coordinateLabel
          ? () => window.open(osmOpenUrl(petCoordinate.lat, petCoordinate.lon), '_blank')
          : () => global.document.querySelector('[data-tab="pets"]')?.click();
      }
      this.updateMapToolPanel();
      this.revealDetailCard();
    }

    renderTrackedPetList() {
      if (!this.petLocationListEl) return;
      this.petLocationListEl.innerHTML = '';
      this.trackedPets.forEach((pet) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = `tracked-pet-row ${this.activeTrackedPetId === pet.id ? 'active' : ''}`;
        const avatar = safeImageSrc(pet.avatar, '');
        const avatarMarkup = avatar
          ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(pet.name)}" />`
          : escapeHtml(pet.emoji);
        const vitals = pet.latestVitals
          ? `Temp ${pet.latestVitals.temperature}°C · BPM ${pet.latestVitals.heartRate ?? '--'} · SpO2 ${Number.isFinite(Number(pet.latestVitals.spo2Pct)) ? `${Math.round(Number(pet.latestVitals.spo2Pct))}%` : '--'}${Number.isFinite(Number(pet.latestVitals.batteryPct)) ? ` · Battery ${Math.round(Number(pet.latestVitals.batteryPct))}%` : ''}`
          : 'No vitals yet';
        const gpsLine = isLiveGpsPet(pet)
          ? `Live GPS ${formatCoordinatePair(getPetGpsCoordinate(pet))}`
          : getPetMapCoordinate(pet)
            ? `Saved GPS ${formatCoordinatePair(getPetMapCoordinate(pet))}`
            : `GPS ${statusLabel(pet.locationValid)} · Wi-Fi ${statusLabel(pet.wifiConnected)}`;
        const fence = this.getFenceState(pet);
        const trackSummary = this.getPetTrackSummary(pet);
        const fenceLine = fence.enabled
          ? `Fence ${Math.round(fence.radiusM)}m · ${fence.alert ? 'outside' : 'inside'}${Number.isFinite(fence.distanceM) ? ` ${Math.round(fence.distanceM)}m` : ''}`
          : 'Fence off';
        const routeLine = trackSummary.count >= 2
          ? `Route ${formatDistanceMeters(trackSummary.distanceM)} · ${formatDurationMs(trackSummary.durationMs)}`
          : 'Route waiting for GPS';
        row.innerHTML = `
          <span class="tracked-pet-row__avatar">${avatarMarkup}</span>
          <span class="tracked-pet-row__meta">
            <span class="tracked-pet-row__title">${escapeHtml(pet.name)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(pet.location)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(vitals)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(gpsLine)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(fenceLine)} · ${escapeHtml(routeLine)}</span>
          </span>
        `;
        row.addEventListener('click', () => this.focusTrackedPet(pet.id));
        this.petLocationListEl.appendChild(row);
      });
    }

    updateTrackedCount() {
      if (!this.trackedCountEl) return;
      this.trackedCountEl.textContent = `${this.trackedPets.length} tracked`;
    }

    updateLocationSelection() {
      this.locationRowMap.forEach((node, id) => {
        node.classList.toggle('active', id === this.activeLocationId);
      });
    }

    refreshTrackedPets() {
      this.renderTrackedPets();
      this.renderMarkers();
      if (this.activeTrackedPetId) {
        this.focusTrackedPet(this.activeTrackedPetId);
      }
    }

    showLocationCard(location, marker) {
      if (!location || !this.cardElements.name) return;
      this.activeLocationId = location.id;
      this.activeTrackedPetId = null;
      this.updateRealMapState();
      this.renderMarkers();
      this.renderOverlay();
      this.updateMapToolPanel();
      const markerNode = marker && marker.isConnected ? marker : this.locationMarkerMap.get(location.id);
      if (this.activeMarker && this.activeMarker !== markerNode) {
        this.activeMarker.classList.remove('map-marker--active');
      }
      if (markerNode) {
        markerNode.classList.add('map-marker--active');
        this.activeMarker = markerNode;
      }
      this.updateLocationSelection();
      this.trackedPetMap.forEach((node) => {
        node.classList.remove('map-pet--focus');
      });
      if (this.locationCard) {
        this.locationCard.classList.remove('hidden');
      }
      this.cardElements.name.textContent = location.name;
      this.cardElements.type.textContent = location.type;
      this.cardElements.desc.textContent = location.description;
      this.cardElements.rating.textContent = location.rating || '';
      this.cardElements.hours.textContent = location.hours || 'Hours not listed';
      this.cardElements.phone.textContent = location.phone || '';
      this.cardElements.phone.closest('p')?.classList.toggle('hidden', !location.phone);
      const locationCoordinate = getLocationCoordinate(location);
      const coordinateLabel = formatCoordinatePair(locationCoordinate);
      this.cardElements.address.textContent = coordinateLabel
        ? `${location.address || 'Map point'} · ${coordinateLabel}`
        : (location.address || '');
      this.cardElements.status.textContent = location.status || '';
      this.cardElements.tags.innerHTML = [
        ...(location.tags || []),
        ...(coordinateLabel ? [`GPS ${coordinateLabel}`] : []),
      ]
        .map(tag => `<span class="location-tag">${escapeHtml(tag)}</span>`)
        .join('');
      this.cardElements.pets.innerHTML = (location.pets || [])
        .map(pet => `<span class="location-tag location-tag--emphasis">${escapeHtml(pet)}</span>`)
        .join('');
      if (this.cardElements.linkButton) {
        this.cardElements.linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Open spot details';
      }
      this.setLink(location.link || (coordinateLabel ? osmOpenUrl(locationCoordinate.lat, locationCoordinate.lon) : ''));
      this.revealDetailCard();
    }

    hideLocationCard() {
      if (this.locationCard) {
        this.locationCard.classList.add('hidden');
      }
      this.activeLocationId = null;
      this.activeTrackedPetId = null;
      this.updateLocationSelection();
      this.trackedPetMap.forEach((node) => {
        node.classList.remove('map-pet--focus');
      });
      if (this.activeMarker) {
        this.activeMarker.classList.remove('map-marker--active');
        this.activeMarker = null;
      }
      this.updateRealMapState();
      this.renderMarkers();
      this.renderOverlay();
      this.updateMapToolPanel();
      this.disableLinkButton();
    }

    setLink(url) {
      const linkButton = this.cardElements.linkButton;
      if (!linkButton) return;
      if (url) {
        linkButton.disabled = false;
        linkButton.classList.remove('opacity-40', 'cursor-not-allowed', 'hidden');
        linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Open spot details';
        linkButton.onclick = () => window.open(url, '_blank');
      } else {
        this.disableLinkButton();
      }
    }

    disableLinkButton() {
      const linkButton = this.cardElements.linkButton;
      if (!linkButton) return;
      linkButton.disabled = true;
      linkButton.classList.add('opacity-40', 'cursor-not-allowed', 'hidden');
      linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Open spot details';
      linkButton.onclick = null;
    }

    updateLocationCount() {
      if (!this.locationCountEl) return;
      const visibleCount = this.getVisibleLocations().length;
      this.locationCountEl.textContent = this.searchQuery.trim()
        ? `${visibleCount}/${this.locations.length} spots`
        : `${this.locations.length} spots`;
    }

    syncMapView() {
      window.requestAnimationFrame(() => {
        this.updateMapFrame();
        this.renderTrackedPets();
        this.renderMarkers();
        if (this.activeTrackedPetId) {
          this.focusTrackedPet(this.activeTrackedPetId);
          return;
        }
        if (this.activeLocationId) {
          const location = this.getVisibleLocations().find((entry) => entry.id === this.activeLocationId);
          if (location) this.showLocationCard(location);
          else this.hideLocationCard();
        }
      });
    }
  }

  global.PawMapController = PawMapController;
})(window);
