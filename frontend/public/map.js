;(function (global) {
  const PETS_STORAGE_KEY = 'pawtrace_pets';
  const MAP_BACKGROUND_SOURCES = ['/assets/m1.jpg', '/assets/m2.png'];
  const MAP_FRAME_FALLBACK_SIZE = { width: 1810, height: 1280 };
  const TRACKED_ZONE_FALLBACKS = [
    { label: 'West Residence Quad', coords: { x: 24, y: 20 } },
    { label: 'North Canal Bridge', coords: { x: 49, y: 33 } },
    { label: 'Central Ring Promenade', coords: { x: 68, y: 48 } },
    { label: 'Learning Hub Entrance', coords: { x: 59, y: 22 } },
    { label: 'Stadium Track Edge', coords: { x: 50, y: 69 } },
    { label: 'South Ring Gate', coords: { x: 72, y: 79 } },
  ];
  const DEMO_LOCATIONS = [
    {
      id: 'canal-paw-cafe',
      name: 'Canal Paw Cafe',
      type: 'Coffee + pet break',
      description: 'A compact coffee stop beside the north canal bridge, with shaded seats and water bowls for quick campus walks.',
      rating: '4.8 · 240 reviews',
      tags: ['Bridge-side', 'Water bowls', 'Quick stop'],
      pets: ['Dogs welcome', 'Small pets welcome'],
      hours: '08:00 – 21:00',
      phone: '+86 512 8888 3201',
      address: 'North Canal Bridge, Taicang Campus',
      status: 'Open now',
      coords: { x: 49, y: 33 },
      link: 'https://pawtrace.demo/spot/canal-paw-cafe'
    },
    {
      id: 'ring-lawn-garden',
      name: 'Ring Lawn Garden',
      type: 'Open lawn + shade',
      description: 'The central green beside the ring is the easiest place to pause, meet other owners, and let pets settle before class.',
      rating: '4.9 · 410 reviews',
      tags: ['Open lawn', 'Meeting point', 'Rest benches'],
      pets: ['Dogs on-leash', 'Cat carriers'],
      hours: '06:00 – 22:30',
      phone: '+86 512 8802 5521',
      address: 'Central Ring Promenade',
      status: 'Busy after 5pm',
      coords: { x: 68, y: 48 },
      link: 'https://pawtrace.demo/spot/ring-lawn-garden'
    },
    {
      id: 'learning-hub-supplies',
      name: 'Learning Hub Pet Supplies',
      type: 'Pet essentials kiosk',
      description: 'A grab-and-go kiosk near the upper learning hub for wipes, waste bags, small snacks, and replacement tags.',
      rating: '4.7 · 186 reviews',
      tags: ['Supplies', 'Tags', 'Quick checkout'],
      pets: ['All pets'],
      hours: '09:00 – 19:30',
      phone: '+86 512 8811 6128',
      address: 'Learning Hub Entrance',
      status: 'Stocked today',
      coords: { x: 59, y: 22 },
      link: 'https://pawtrace.demo/spot/learning-hub-supplies'
    },
    {
      id: 'trackside-play-zone',
      name: 'Trackside Play Zone',
      type: 'Walk loop + open field',
      description: 'A calmer stretch near the stadium where owners usually do short walks, cooldowns, and basic obedience practice.',
      rating: '4.8 · 352 reviews',
      tags: ['Track edge', 'Open loop', 'Evening walks'],
      pets: ['Dogs welcome', 'Harness pets'],
      hours: '06:00 – 23:00',
      phone: '+86 512 8844 5090',
      address: 'Stadium Track Edge',
      status: 'Best at sunset',
      coords: { x: 50, y: 69 },
      link: 'https://pawtrace.demo/spot/trackside-play-zone'
    },
    {
      id: 'west-courtyard-care',
      name: 'West Courtyard Care Point',
      type: 'Pet wellness kiosk',
      description: 'A small service point near the west residence blocks for first-aid wipes, water refill, and temporary NFC card help.',
      rating: '4.6 · 129 reviews',
      tags: ['Wellness', 'Water refill', 'NFC help'],
      pets: ['All pets'],
      hours: '10:00 – 18:00',
      phone: '+86 512 8866 1408',
      address: 'West Residence Quad',
      status: 'Open this afternoon',
      coords: { x: 24, y: 20 },
      link: 'https://pawtrace.demo/spot/west-courtyard-care'
    }
  ];

  const MAP_ANIMALS = [
    {
      name: 'Bao',
      emoji: '🐶',
      status: 'Central Ring',
      coords: { x: 67, y: 46 }
    },
    {
      name: 'Mochi',
      emoji: '🐱',
      status: 'North Canal',
      coords: { x: 48, y: 33 }
    },
    {
      name: 'Nimbus',
      emoji: '🐶',
      status: 'Track Edge',
      coords: { x: 51, y: 68 }
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
      note: pet.nfcNote || pet.status || '',
      latestVitals: getLatestVitals(pet),
    };
  }

  class PawMapController {
    constructor(options = {}) {
      this.container = options.container;
      this.background = options.background;
      this.markersLayer = options.markersLayer;
      this.petsLayer = options.petsLayer;
      this.petLocationListEl = options.petLocationListEl;
      this.trackedCountEl = options.trackedCountEl;
      this.locationListEl = options.locationListEl;
      this.locationCountEl = options.locationCountEl;
      this.cardElements = options.cardElements || {};
      this.locationCard = this.cardElements.wrapper;
      this.activeMarker = null;
      this.activeTrackedPetId = null;
      this.activeLocationId = null;
      this.locationMarkerMap = new Map();
      this.locationRowMap = new Map();
      this.trackedPetMap = new Map();
      this.locations = DEMO_LOCATIONS;
      this.trackedPets = [];
      this.handleResize = null;
    }

    init() {
      if (!this.container) return;
      this.ensureBackground();
      this.renderMarkers();
      this.renderLocationList();
      this.renderTrackedPets();
      this.attachCardHandlers();
      this.updateLocationCount();
      if (this.locations.length) {
        this.showLocationCard(this.locations[0]);
      }
      document.addEventListener('pawtrace:pets-updated', () => this.refreshTrackedPets());
    }

    ensureBackground() {
      if (!this.background) return;
      if (!this.handleResize) {
        this.handleResize = () => this.updateMapFrame();
        window.addEventListener('resize', this.handleResize);
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
      this.locations.forEach(location => {
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'map-marker';
        marker.style.left = `${location.coords?.x ?? 50}%`;
        marker.style.top = `${location.coords?.y ?? 50}%`;
        marker.innerHTML = '<span aria-hidden="true">🐾</span>';
        marker.addEventListener('click', () => this.showLocationCard(location, marker));
        this.markersLayer.appendChild(marker);
        this.locationMarkerMap.set(location.id, marker);
      });
    }

    renderLocationList() {
      if (!this.locationListEl) return;
      this.locationListEl.innerHTML = '';
      this.locationRowMap.clear();
      this.locations.forEach(location => {
        const entry = document.createElement('button');
        entry.type = 'button';
        entry.className = 'map-spot-row';
        entry.innerHTML = `
          <span class="flex items-center justify-between">
            <span class="map-spot-row__title">${location.name}</span>
            <span class="text-[10px] text-gray-500">${location.rating}</span>
          </span>
          <span class="map-spot-row__meta">${location.type}</span>
          <span class="map-spot-row__foot">${location.address}</span>
        `;
        entry.addEventListener('click', () => this.showLocationCard(location));
        this.locationListEl.appendChild(entry);
        this.locationRowMap.set(location.id, entry);
      });
      this.updateLocationSelection();
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
        note: animal.status,
        latestVitals: null,
      }));
    }

    renderTrackedPets() {
      if (!this.petsLayer) return;
      this.trackedPets = this.getTrackedPets();
      this.petsLayer.innerHTML = '';
      this.trackedPetMap.clear();
      this.trackedPets.forEach(record => {
        const node = document.createElement('button');
        node.type = 'button';
        node.className = `map-pet map-pet--tracked ${this.activeTrackedPetId === record.id ? 'map-pet--focus' : ''}`;
        node.style.left = `${record.coords?.x ?? 50}%`;
        node.style.top = `${record.coords?.y ?? 50}%`;
        node.title = `${record.name} · ${record.location}`;
        node.innerHTML = `
          <span class="map-pet-circle">${record.avatar ? `<img src="${record.avatar}" alt="${record.name}" />` : record.emoji}</span>
          <span class="map-pet-name">${record.name}</span>
          <span class="map-pet-status">${record.location}</span>
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

    focusTrackedPet(petId) {
      const pet = this.trackedPets.find((entry) => entry.id === petId);
      if (!pet) return;
      this.activeTrackedPetId = petId;
      this.activeLocationId = null;
      this.renderTrackedPetList();
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
        ? `🌡 ${pet.latestVitals.temperature?.toFixed?.(1) ?? pet.latestVitals.temperature}°C · ❤ ${pet.latestVitals.heartRate ?? '--'} bpm`
        : 'Tracking enabled';
      this.cardElements.hours.textContent = pet.latestVitals?.timestamp
        ? `Updated ${new Date(pet.latestVitals.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'No vitals uploaded yet';
      this.cardElements.phone.textContent = pet.nfcContact || 'Emergency contact not set';
      this.cardElements.address.textContent = pet.location || '';
      this.cardElements.status.textContent = pet.note || '';
      this.cardElements.tags.innerHTML = `<span class="location-tag">Tracked</span><span class="location-tag">NFC ${pet.nfcId || 'pending'}</span>`;
      this.cardElements.pets.innerHTML = pet.latestVitals
        ? `<span class="location-tag location-tag--emphasis">Temp ${pet.latestVitals.temperature}°C</span><span class="location-tag location-tag--emphasis">HR ${pet.latestVitals.heartRate} bpm</span>`
        : '<span class="location-tag location-tag--emphasis">Waiting for vitals</span>';
      const linkButton = this.cardElements.linkButton;
      if (linkButton) {
        linkButton.disabled = false;
        linkButton.classList.remove('opacity-40', 'cursor-not-allowed');
        linkButton.innerHTML = '<i class="fas fa-paw mr-1"></i>Open pet card';
        linkButton.onclick = () => global.document.querySelector('[data-tab="pets"]')?.click();
      }
    }

    renderTrackedPetList() {
      if (!this.petLocationListEl) return;
      this.petLocationListEl.innerHTML = '';
      this.trackedPets.forEach((pet) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = `tracked-pet-row ${this.activeTrackedPetId === pet.id ? 'active' : ''}`;
        row.innerHTML = `
          <span class="tracked-pet-row__avatar">${pet.avatar ? `<img src="${pet.avatar}" alt="${pet.name}" />` : pet.emoji}</span>
          <span class="tracked-pet-row__meta">
            <span class="tracked-pet-row__title">${pet.name}</span>
            <span class="tracked-pet-row__subtitle">${pet.location}</span>
            <span class="tracked-pet-row__subtitle">${pet.latestVitals ? `Temp ${pet.latestVitals.temperature}°C · HR ${pet.latestVitals.heartRate} bpm` : 'No vitals yet'}</span>
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
      if (this.activeTrackedPetId) {
        this.focusTrackedPet(this.activeTrackedPetId);
      }
    }

    showLocationCard(location, marker) {
      if (!location || !this.cardElements.name) return;
      const markerNode = marker || this.locationMarkerMap.get(location.id);
      if (this.activeMarker) {
        this.activeMarker.classList.remove('map-marker--active');
      }
      if (markerNode) {
        markerNode.classList.add('map-marker--active');
        this.activeMarker = markerNode;
      }
      this.activeLocationId = location.id;
      this.activeTrackedPetId = null;
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
      this.cardElements.rating.textContent = location.rating ? `⭐ ${location.rating}` : '';
      this.cardElements.hours.textContent = location.hours || 'Hours not listed';
      this.cardElements.phone.textContent = location.phone || 'No phone listed';
      this.cardElements.address.textContent = location.address || '';
      this.cardElements.status.textContent = location.status || '';
      this.cardElements.tags.innerHTML = (location.tags || [])
        .map(tag => `<span class="location-tag">${tag}</span>`)
        .join('');
      this.cardElements.pets.innerHTML = (location.pets || [])
        .map(pet => `<span class="location-tag location-tag--emphasis">${pet}</span>`)
        .join('');
      if (this.cardElements.linkButton) {
        this.cardElements.linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Visit this spot';
      }
      this.setLink(location.link);
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
      this.disableLinkButton();
    }

    setLink(url) {
      const linkButton = this.cardElements.linkButton;
      if (!linkButton) return;
      if (url) {
        linkButton.disabled = false;
        linkButton.classList.remove('opacity-40', 'cursor-not-allowed');
        linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Visit this spot';
        linkButton.onclick = () => window.open(url, '_blank');
      } else {
        this.disableLinkButton();
      }
    }

    disableLinkButton() {
      const linkButton = this.cardElements.linkButton;
      if (!linkButton) return;
      linkButton.disabled = true;
      linkButton.classList.add('opacity-40', 'cursor-not-allowed');
      linkButton.innerHTML = '<i class="fas fa-directions mr-1"></i>Visit this spot';
      linkButton.onclick = null;
    }

    updateLocationCount() {
      if (!this.locationCountEl) return;
      this.locationCountEl.textContent = `${this.locations.length} spots`;
    }
  }

  global.PawMapController = PawMapController;
})(window);
