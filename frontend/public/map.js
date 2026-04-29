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

  function osmTileUrl(x, y, zoom = OSM_TILE_ZOOM) {
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
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

  function getTrackedFallback(index = 0) {
    return TRACKED_ZONE_FALLBACKS[index % TRACKED_ZONE_FALLBACKS.length];
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
      this.markersLayer = options.markersLayer;
      this.petsLayer = options.petsLayer;
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
      this.updateLocationCount();
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
          window.requestAnimationFrame(() => this.updateMapFrame());
        };
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
        window.visualViewport?.addEventListener('resize', this.handleResize);
      }
      if (!this.resizeObserver && this.container && typeof ResizeObserver === 'function') {
        this.resizeObserver = new ResizeObserver(() => this.updateMapFrame());
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

    renderTileLayer() {
      if (!this.realMapTiles || !this.realMapView?.bounds) return;
      const bounds = this.realMapView.bounds;
      const zoom = OSM_TILE_ZOOM;
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
          tile.src = osmTileUrl(wrappedX, tileY, zoom);
          tile.alt = '';
          tile.loading = 'eager';
          tile.decoding = 'async';
          tile.referrerPolicy = 'no-referrer';
          tile.draggable = false;
          tile.style.left = `${((tileX * OSM_TILE_SIZE - westX) / worldWidth) * 100}%`;
          tile.style.top = `${((tileY * OSM_TILE_SIZE - northY) / worldHeight) * 100}%`;
          tile.style.width = `${(OSM_TILE_SIZE / worldWidth) * 100}%`;
          tile.style.height = `${(OSM_TILE_SIZE / worldHeight) * 100}%`;
          fragment.appendChild(tile);
        }
      }

      const attribution = document.createElement('span');
      attribution.className = 'real-map-attribution';
      attribution.innerHTML = 'Map data &copy; OpenStreetMap';
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
      this.realMapView = buildRealMapView(
        this.trackedPets,
        this.locations,
        this.activeTrackedPetId,
        this.activeLocationId,
        mapAspect
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
      this.cardElements.tags.innerHTML = [
        '<span class="location-tag">Tracked</span>',
        `<span class="location-tag">Card ${escapeHtml(pet.nfcId || 'pending')}</span>`,
        `<span class="location-tag">Location ${escapeHtml(statusLabel(pet.locationValid))}</span>`,
        `<span class="location-tag">Geofence ${escapeHtml(statusLabel(pet.geofenceEnabled))}</span>`,
        `<span class="location-tag">Lost ${escapeHtml(statusLabel(pet.lostAlert))}</span>`,
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
        row.innerHTML = `
          <span class="tracked-pet-row__avatar">${avatarMarkup}</span>
          <span class="tracked-pet-row__meta">
            <span class="tracked-pet-row__title">${escapeHtml(pet.name)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(pet.location)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(vitals)}</span>
            <span class="tracked-pet-row__subtitle">${escapeHtml(gpsLine)}</span>
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
