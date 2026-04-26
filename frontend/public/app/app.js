    let pendingAvatarData = null;
    let editAvatarFileInput = null;
    let profileAvatarPreviewImg = null;
    let shareImageSource = '';
    let shareImageIsUpload = false;
    let mapController = null;
    let aiServiceOutputEl = null;
    let aiServiceStatusEl = null;
    let aiServiceStatusTimer = null;
    let aiServiceButtons = [];
    let diagFileInput = null;
    let diagDropzone = null;
    let diagPreview = null;
    let diagPreviewImg = null;
    let diagPlaceholder = null;
    let diagSymptoms = null;
    let diagRunBtn = null;
    let diagResetBtn = null;
    let diagResult = null;
    let diagLoading = null;
    let diagStatus = null;
    let textPanel = null;
    let diagPanel = null;
    let textServiceInput = null;
    let textServiceTitle = null;
    let textServiceSubtitle = null;
    let textServiceIcon = null;
    let textServiceRunBtn = null;
    let textServiceClearBtn = null;
    let selectedAIService = 'diagnosis';
    let petsInitialized = false;
    let rerenderPets = null;
    let chatInitialized = false;
    let rerenderChat = null;
    let chatHoverCard = null;
    let petCheckInInitialized = false;
    let activeTabName = 'map';
    let activateAppTab = null;
    let modalSystemInitialized = false;
    let activeModalId = null;
    let lastModalTrigger = null;
    const TAB_HEADER_META = {
      map: {
        eyebrow: 'PawTrace',
        title: 'Campus Map',
        subtitle: '12 pets nearby · 5 campus spots',
        path: 'campus-map'
      },
      pets: {
        eyebrow: 'PawTrace',
        title: 'Pet Cards',
        subtitle: 'Community feed · My pets',
        path: 'pet-cards'
      },
      chat: {
        eyebrow: 'PawTrace',
        title: 'Friends Chat',
        subtitle: 'Friends · Care context',
        path: 'friends-chat'
      },
      health: {
        eyebrow: 'PawTrace',
        title: 'Health Monitoring',
        subtitle: 'Latest vitals · Trend history',
        path: 'health-monitoring'
      },
      behaviour: {
        eyebrow: 'PawTrace',
        title: 'Video Behaviour Check',
        subtitle: 'Video upload · Behaviour timeline · Risk review',
        path: 'video-behaviour-check'
      },
      ai: {
        eyebrow: 'PawTrace',
        title: 'AI Assist',
        subtitle: 'Photo diagnosis · Care reports',
        path: 'ai-assist'
      },
      profile: {
        eyebrow: 'PawTrace',
        title: 'Profile Center',
        subtitle: 'Owner card · Settings',
        path: 'profile-center'
      }
    };
    function syncModalState() {
      const hasOpenModal = !!document.querySelector('.app-modal:not(.hidden)');
      document.body.classList.toggle('modal-open', hasOpenModal);
      if (!hasOpenModal) {
        activeModalId = null;
      }
    }

    function setModalState(modalId, isOpen) {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      if (isOpen) {
        if (activeModalId && activeModalId !== modalId) {
          setModalState(activeModalId, false);
        }
        lastModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        activeModalId = modalId;
        syncModalState();
        const firstField = modal.querySelector('input, textarea, select, button:not([disabled])');
        if (firstField instanceof HTMLElement) {
          window.requestAnimationFrame(() => {
            firstField.focus({ preventScroll: true });
          });
        }
        return;
      }
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      if (activeModalId === modalId) {
        activeModalId = null;
      }
      syncModalState();
      const triggerToRestore = lastModalTrigger;
      lastModalTrigger = null;
      if (triggerToRestore && triggerToRestore.isConnected) {
        window.requestAnimationFrame(() => {
          if (triggerToRestore.isConnected) {
            triggerToRestore.focus({ preventScroll: true });
          }
        });
      }
    }

    function closeAllModals() {
      document.querySelectorAll('.app-modal:not(.hidden)').forEach((modal) => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
      });
      activeModalId = null;
      lastModalTrigger = null;
      syncModalState();
    }

    function initModalSystem() {
      if (modalSystemInitialized) {
        syncModalState();
        return;
      }
      modalSystemInitialized = true;
      document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const closeButton = target.closest('[data-modal-close]');
        if (closeButton) {
          const modalId = closeButton.getAttribute('data-modal-close');
          if (modalId) setModalState(modalId, false);
          return;
        }
        const modalRoot = target.closest('.app-modal');
        if (modalRoot && target === modalRoot) {
          setModalState(modalRoot.id, false);
        }
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && activeModalId) {
          event.preventDefault();
          setModalState(activeModalId, false);
        }
      });
      syncModalState();
    }

    // --- Modal Functions ---
    function openProfileEditModal() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      pendingAvatarData = null;
      if (editAvatarFileInput) editAvatarFileInput.value = '';
      if (profileAvatarPreviewImg) {
        profileAvatarPreviewImg.src = currentUser.avatar || DEFAULT_PET_AVATAR;
      }
      document.getElementById('edit-display-name').value = currentUser.displayName || '';
      document.getElementById('edit-bio').value = currentUser.bio || '';
      document.getElementById('edit-campus').value = currentUser.campus || 'Taicang';
      document.getElementById('edit-contact').value = currentUser.contact || '';
      document.getElementById('edit-star-sign').value = currentUser.starSign || '';
      document.getElementById('edit-main-pet-name').value = currentUser.mainPetName || '';
      document.getElementById('edit-main-pet-type').value = currentUser.mainPetType || '';
      document.getElementById('edit-main-pet-birth').value = currentUser.mainPetBirth || '';
      document.getElementById('edit-main-pet-notes').value = currentUser.mainPetNotes || '';
      setModalState('profile-edit-modal', true);
    }

    function closeProfileEditModal() {
      setModalState('profile-edit-modal', false);
    }

    function openShareImageModal() {
      const modal = document.getElementById('share-image-modal');
      const preview = document.getElementById('share-image-preview');
      const previewImg = document.getElementById('share-preview-img');
      const urlInput = document.getElementById('share-image-url');
      const captionInput = document.getElementById('share-image-caption');
      const fileInput = document.getElementById('share-image-file');
      shareImageSource = '';
      shareImageIsUpload = false;
      if (urlInput) urlInput.value = '';
      if (captionInput) captionInput.value = '';
      if (fileInput) fileInput.value = '';
      if (preview) preview.classList.add('hidden');
      if (previewImg) previewImg.src = '';
      if (modal) setModalState('share-image-modal', true);
    }

    function closeShareImageModal() {
      const preview = document.getElementById('share-image-preview');
      const previewImg = document.getElementById('share-preview-img');
      const urlInput = document.getElementById('share-image-url');
      const captionInput = document.getElementById('share-image-caption');
      const fileInput = document.getElementById('share-image-file');
      shareImageSource = '';
      shareImageIsUpload = false;
      setModalState('share-image-modal', false);
      if (preview) preview.classList.add('hidden');
      if (previewImg) previewImg.src = '';
      if (urlInput) urlInput.value = '';
      if (captionInput) captionInput.value = '';
      if (fileInput) fileInput.value = '';
    }

    // --- Simple scroll reveal ---
    function handleScrollReveal() {
      const els = document.querySelectorAll('.scroll-section');
      const trigger = window.innerHeight * 0.9;
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < trigger) {
          el.classList.add('visible');
        }
      });
    }
    document.addEventListener('scroll', handleScrollReveal);
    window.addEventListener('load', handleScrollReveal);

    // --- Auth & local storage ---
    const LS_USERS_KEY = 'pawtrace_users';
    const LS_CURRENT_USER_KEY = 'pawtrace_current_user';

    function loadUsers() {
      try {
        return JSON.parse(localStorage.getItem(LS_USERS_KEY)) || [];
      } catch { return []; }
    }
    function saveUsers(users) {
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    }
    function persistCurrentUser(user) {
      if (!user) return;
      setCurrentUser(user);
      let users = loadUsers();
      users = users.map(u => u.username === user.username ? user : u);
      saveUsers(users);
    }
    function setCurrentUser(user) {
      if (user) localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_CURRENT_USER_KEY);
    }
    function getCurrentUser() {
      try {
        return JSON.parse(localStorage.getItem(LS_CURRENT_USER_KEY));
      } catch { return null; }
    }

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

    function createGuestUser() {
      return {
        username: 'guest',
        displayName: 'Guest Explorer',
        password: '',
        avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png',
        bio: 'Exploring PawTrace without logging in.',
        campus: 'Taicang',
        contact: 'N/A',
        starSign: '',
        mainPetName: '',
        mainPetType: '',
        mainPetBirth: '',
        mainPetNotes: '',
        petInsight: ''
      };
    }

    function getDefaultUser() {
      const users = loadUsers();
      return users[0] || createGuestUser();
    }

    function initBehaviourCheck() {
      const fileInput = document.getElementById('behaviour-video-input');
      const uploadTrigger = document.getElementById('behaviour-upload-trigger');
      const demoRunBtn = document.getElementById('behaviour-demo-run');
      const dropzone = document.getElementById('behaviour-dropzone');
      const videoPreview = document.getElementById('behaviour-video-preview');
      const uploadEmpty = document.getElementById('behaviour-upload-empty');
      const analysisStatus = document.getElementById('behaviour-analysis-status');
      const detectedPetEl = document.getElementById('behaviour-detected-pet');
      const durationEl = document.getElementById('behaviour-video-duration');
      const detectionRateEl = document.getElementById('behaviour-detection-rate');
      const movementScoreEl = document.getElementById('behaviour-movement-score');
      const eventCountEl = document.getElementById('behaviour-event-count');
      const timelineEl = document.getElementById('behaviour-timeline');
      const markersEl = document.getElementById('behaviour-alert-markers');
      const eventListEl = document.getElementById('behaviour-event-list');
      const adviceListEl = document.getElementById('behaviour-advice-list');
      const historyBarsEl = document.getElementById('behaviour-history-bars');
      const riskSummaryEl = document.getElementById('behaviour-risk-summary');
      const riskTitleEl = document.getElementById('behaviour-risk-title');
      const riskBadgeEl = document.getElementById('behaviour-risk-badge');
      const riskCopyEl = document.getElementById('behaviour-risk-copy');
      const timeAxisEl = document.querySelector('#tab-behaviour .behaviour-time-axis');
      const timelineTitleEl = document.querySelector('#tab-behaviour .behaviour-timeline-card h3');
      if (!fileInput || !dropzone || !timelineEl) return;

      let previewUrl = '';
      let selectedVideoFile = null;
      const behaviorDisclaimer = 'This result is only a behavior-risk hint and does not constitute veterinary diagnosis.';
      const timeline = [
        { label: 'Resting', type: 'rest', width: 18, color: '#60a5fa' },
        { label: 'Walking', type: 'walk', width: 14, color: '#10b981' },
        { label: 'Repeated paw licking', type: 'alert', width: 7, color: '#ec4899' },
        { label: 'Grooming', type: 'groom', width: 13, color: '#f59e0b' },
        { label: 'Resting', type: 'rest', width: 16, color: '#60a5fa' },
        { label: 'Frequent ear scratching', type: 'alert', width: 6, color: '#ec4899' },
        { label: 'Walking', type: 'walk', width: 18, color: '#10b981' },
        { label: 'Frequent head shaking', type: 'alert', width: 8, color: '#ec4899' }
      ];
      const demoEvents = [
        { time: '08:20', action: 'Frequent head shaking', hint: 'May indicate ear discomfort. Record frequency and duration.', risk: 'medium' },
        { time: '14:45', action: 'Frequent ear scratching', hint: 'Check whether the ear has odor, redness, or discharge.', risk: 'high' },
        { time: '22:10', action: 'One-sided limping', hint: 'May indicate joint, paw, or muscle discomfort. Reduce intense activity and record gait changes.', risk: 'high' },
        { time: '31:40', action: 'Long low-activity period', hint: 'Activity is below the usual baseline. Continue observing appetite, water intake, and energy.', risk: 'medium' },
        { time: '42:30', action: 'Repeated paw licking', hint: 'May indicate skin irritation, anxiety, or a foreign object. Check paw pads and between toes.', risk: 'medium' },
        { time: '53:05', action: 'Arched back or tucked abdomen', hint: 'May indicate pain or discomfort. Record posture duration and watch appetite or stool changes.', risk: 'medium' }
      ];
      const advice = [
        { title: 'Ear observation', detail: 'Record head-shaking and ear-scratching frequency. Check for odor, redness, or discharge.' },
        { title: 'Paw observation', detail: 'Record paw-licking frequency. Check paw pads, between toes, skin irritation, or foreign objects.' },
        { title: 'Gait observation', detail: 'If one-sided limping appears, capture a short side-view walking video and avoid intense activity.' },
        { title: 'Daily context', detail: 'Track appetite, water intake, stool, sleep, and energy changes alongside the video.' },
        { title: 'Safety boundary', detail: behaviorDisclaimer }
      ];
      const history = [
        { label: 'Head shaking', value: 44, delta: '+18%', color: '#ec4899' },
        { label: 'Ear scratching', value: 52, delta: '+24%', color: '#f59e0b' },
        { label: 'Paw licking', value: 48, delta: '+16%', color: '#ec4899' },
        { label: 'Limping signal', value: 22, delta: '+9%', color: '#ef4444' },
        { label: 'Normal walking', value: 68, delta: '-7%', color: '#10b981' }
      ];

      function setRisk(level = 'medium') {
        const normalized = level.toLowerCase();
        const label = normalized === 'high' ? 'High' : normalized === 'low' ? 'Low' : 'Medium';
        riskSummaryEl?.classList.remove('behaviour-risk-summary--low', 'behaviour-risk-summary--medium', 'behaviour-risk-summary--high');
        riskSummaryEl?.classList.add(`behaviour-risk-summary--${normalized}`);
        if (riskSummaryEl) riskSummaryEl.innerHTML = `<span>Risk</span><strong>${label}</strong>`;
        riskBadgeEl?.classList.remove('behaviour-risk-badge--low', 'behaviour-risk-badge--medium', 'behaviour-risk-badge--high');
        riskBadgeEl?.classList.add(`behaviour-risk-badge--${normalized}`);
        if (riskBadgeEl) riskBadgeEl.textContent = label;
        if (riskTitleEl) riskTitleEl.textContent = `${label} risk`;
        if (riskCopyEl) {
          riskCopyEl.textContent = normalized === 'high'
            ? 'Multiple behavior signals appeared in the same clip. Record frequency, duration, and context, and consult a veterinarian if needed.'
            : normalized === 'low'
              ? 'No strong abnormal movement cluster was detected. Keep short videos for future comparison.'
              : 'Some behaviors are above the weekly baseline. PawTrace only provides observation hints and does not judge the cause.';
        }
      }

      function toTitleLabel(value = '') {
        return String(value || '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
      }

      function riskColor(risk = 'low') {
        const normalized = String(risk).toLowerCase();
        if (normalized === 'high') return '#ef4444';
        if (normalized === 'medium') return '#ec4899';
        return '#10b981';
      }

      function formatPercent(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return '--';
        const pct = num <= 1 ? num * 100 : num;
        return `${Math.round(pct)}%`;
      }

      function formatEventTime(event) {
        if (Number.isFinite(Number(event.timeSec))) return `${Math.round(Number(event.timeSec) * 10) / 10}s`;
        return String(event.time || '0:00');
      }

      function eventPosition(event, duration = 60) {
        if (Number.isFinite(Number(event.timeSec))) {
          return Math.min(100, (Number(event.timeSec) / Math.max(duration, 1)) * 100);
        }
        const minutes = Number(String(event.time || '0').split(':')[0]) || 0;
        return Math.min(100, (minutes / 60) * 100);
      }

      function renderAxis(duration = 60, unit = 'min') {
        if (!timeAxisEl) return;
        const steps = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(duration * ratio));
        timeAxisEl.innerHTML = steps.map((value) => `<span>${value}${unit === 'sec' && value === duration ? 's' : ''}</span>`).join('');
      }

      function renderTimeline(segments = timeline, events = demoEvents, duration = 60, unit = 'min') {
        if (timelineTitleEl) timelineTitleEl.textContent = unit === 'sec' ? `${Math.round(duration)}s YOLO scan` : '60min activity scan';
        renderAxis(duration, unit);
        timelineEl.innerHTML = segments.map((segment) => `
          <span class="behaviour-segment" title="${escapeHtml(segment.label)}" style="--width:${segment.width}%; --segment-color:${segment.color};"></span>
        `).join('');
        if (markersEl) {
          markersEl.innerHTML = events.map((event) => `
            <span class="behaviour-alert-marker" style="--left:${eventPosition(event, duration)}%;" title="${escapeHtml(event.action || event.type)}">
              <i class="fas fa-triangle-exclamation"></i>
            </span>
          `).join('');
        }
      }

      function renderEvents(events = demoEvents) {
        if (!eventListEl) return;
        eventListEl.innerHTML = events.map((event) => `
          <div class="behaviour-event-row">
            <span class="behaviour-event-time">${escapeHtml(formatEventTime(event))}</span>
            <div>
              <strong>${escapeHtml(event.action || toTitleLabel(event.type || 'movement_event'))}</strong>
              <span>${escapeHtml(event.hint || event.note || 'Movement event detected for observation.')}</span>
            </div>
            <span class="behaviour-event-score behaviour-event-score--${escapeHtml(event.risk || 'medium')}">${escapeHtml(event.risk || formatPercent(event.confidence))}</span>
          </div>
        `).join('');
        if (eventCountEl) eventCountEl.textContent = String(events.length);
      }

      function renderAdvice(items = advice) {
        if (!adviceListEl) return;
        adviceListEl.innerHTML = items.map((item) => `
          <div class="behaviour-advice-row">
            <i class="fas fa-clipboard-check"></i>
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.detail)}</span>
            </div>
          </div>
        `).join('');
      }

      function renderHistory() {
        if (!historyBarsEl) return;
        historyBarsEl.innerHTML = history.map((item) => `
          <div class="behaviour-history-row">
            <strong>${escapeHtml(item.label)}</strong>
            <div class="behaviour-history-track" aria-hidden="true">
              <span style="--value:${item.value}%; --segment-color:${item.color};"></span>
            </div>
            <span>${escapeHtml(item.delta)}</span>
          </div>
        `).join('');
      }

      function setStatus(text, mode = '') {
        if (!analysisStatus) return;
        analysisStatus.textContent = text;
        analysisStatus.classList.toggle('behaviour-status-chip--high', mode === 'high');
      }

      function detectPetFromFile(file) {
        const name = String(file?.name || '').toLowerCase();
        if (/cat|kitty/.test(name)) return 'Cat · 91%';
        if (/dog|puppy/.test(name)) return 'Dog · 93%';
        return 'Cat/Dog · 88%';
      }

      function renderYoloResult(data) {
        const summary = data?.summary || {};
        const durationSec = Number(summary.durationSec) || 0;
        const apiTimeline = Array.isArray(data?.timeline) ? data.timeline : [];
        const apiEvents = Array.isArray(data?.events) ? data.events : [];
        const totalDuration = durationSec || Math.max(...apiTimeline.map((item) => Number(item.endSec) || 0), 1);
        const yoloSegments = apiTimeline.length
          ? apiTimeline.map((item) => {
              const start = Number(item.startSec) || 0;
              const end = Number(item.endSec) || start + 1;
              return {
                label: toTitleLabel(item.behavior || 'normal_movement'),
                type: item.risk || 'low',
                width: Math.max(3, ((end - start) / Math.max(totalDuration, 1)) * 100),
                color: riskColor(item.risk || 'low')
              };
            })
          : [{ label: toTitleLabel(summary.activityType || 'normal_movement'), type: summary.riskLevel || 'low', width: 100, color: riskColor(summary.riskLevel || 'low') }];

        const risk = String(summary.riskLevel || 'low').toLowerCase();
        setRisk(risk);
        if (detectedPetEl) detectedPetEl.textContent = Number(summary.detectedFrames) > 0 ? 'Cat/Dog detected' : 'Low visibility';
        if (durationEl) durationEl.textContent = `${Math.round((durationSec || 0) * 10) / 10}s`;
        if (detectionRateEl) detectionRateEl.textContent = formatPercent(summary.detectionRate);
        if (movementScoreEl) movementScoreEl.textContent = `${Number.isFinite(Number(summary.movementScore)) ? summary.movementScore : 0}`;
        renderTimeline(yoloSegments, apiEvents, totalDuration, 'sec');
        renderEvents(apiEvents);
        renderAdvice([
          { title: 'YOLO activity type', detail: toTitleLabel(summary.activityType || 'normal_movement') },
          { title: 'Movement score', detail: `${Number.isFinite(Number(summary.movementScore)) ? summary.movementScore : 0} / 100` },
          { title: 'Advice', detail: data?.advice || 'Movement pattern looks generally normal in this short video.' },
          { title: 'Disclaimer', detail: data?.disclaimer || behaviorDisclaimer }
        ]);
        renderHistory();
        if (riskCopyEl) {
          riskCopyEl.textContent = `YOLO sampled ${summary.analyzedFrames || 0} frames and detected the pet in ${summary.detectedFrames || 0}. ${data?.disclaimer || behaviorDisclaimer}`;
        }
        setStatus('YOLO analysis complete', risk === 'high' ? 'high' : '');
      }

      async function analyzeUploadedVideo(file) {
        if (!file) return;
        const formData = new FormData();
        formData.append('video', file);
        setStatus('Running YOLO...');
        try {
          const response = await fetch('/api/ai/video-behavior', {
            method: 'POST',
            body: formData
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.error || 'YOLO analysis failed');
          }
          renderYoloResult(data);
        } catch (err) {
          console.warn('Standalone YOLO behavior check failed', err);
          setStatus(err instanceof Error ? err.message : 'YOLO service unavailable', 'high');
          if (riskCopyEl) {
            riskCopyEl.textContent = 'The YOLO service is unavailable. Start the Python FastAPI service and try again.';
          }
        }
      }

      function analyseVideo(file = null) {
        const detected = file ? detectPetFromFile(file) : 'Dog · 92%';
        const highSignal = file && /limp|ear|paw|scratch|shake|arched|abdomen/.test(file.name.toLowerCase());
        const level = highSignal ? 'high' : 'medium';
        if (detectedPetEl) detectedPetEl.textContent = detected;
        setRisk(level);
        renderTimeline();
        renderEvents();
        renderAdvice();
        renderHistory();
        if (durationEl) durationEl.textContent = '60 min';
        if (detectionRateEl) detectionRateEl.textContent = '92%';
        if (movementScoreEl) movementScoreEl.textContent = highSignal ? '68' : '42';
        setStatus(file ? 'Demo analysis complete' : 'Demo ready', highSignal ? 'high' : '');
      }

      function handleVideoFile(file) {
        if (!file) return;
        const allowedExt = /\.(mp4|mov|avi|webm)$/i.test(file.name);
        const allowedMime = /^video\//i.test(file.type || '');
        if (!allowedExt && !allowedMime) {
          alert('Please choose a video file: mp4, mov, avi, or webm.');
          fileInput.value = '';
          return;
        }
        if (file.size > 150 * 1024 * 1024) {
          alert('Please choose a video under 150MB.');
          fileInput.value = '';
          return;
        }
        selectedVideoFile = file;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(file);
        if (videoPreview) {
          videoPreview.src = previewUrl;
          videoPreview.classList.remove('hidden');
          videoPreview.addEventListener('loadedmetadata', () => {
            if (!durationEl || !Number.isFinite(videoPreview.duration)) return;
            const minutes = Math.max(1, Math.round(videoPreview.duration / 60));
            durationEl.textContent = `${minutes} min`;
          }, { once: true });
        }
        uploadEmpty?.classList.add('hidden');
        setStatus('Ready for YOLO');
        if (riskCopyEl) riskCopyEl.textContent = 'Click Start YOLO Check to send this video to the backend and Python YOLO service.';
      }

      uploadTrigger?.addEventListener('click', () => fileInput.click());
      demoRunBtn?.addEventListener('click', () => {
        if (selectedVideoFile) {
          analyzeUploadedVideo(selectedVideoFile);
          return;
        }
        analyseVideo();
      });
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInput.click();
        }
      });
      dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('is-dragover');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
      dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('is-dragover');
        handleVideoFile(event.dataTransfer?.files?.[0]);
      });
      fileInput.addEventListener('change', () => handleVideoFile(fileInput.files?.[0]));
      analyseVideo();
    }

    document.addEventListener('DOMContentLoaded', () => {
      initModalSystem();
      const loginScreen = document.getElementById('login-screen');
      const appRoot = document.getElementById('app-root');
      const authMsg = document.getElementById('auth-message');
      const mobileTabbar = document.getElementById('mobile-tabbar');
      const guestAccessBtn = document.getElementById('btn-guest-access');
      aiServiceOutputEl = document.getElementById('ai-service-output');
      aiServiceStatusEl = document.getElementById('ai-service-status');
      aiServiceButtons = Array.from(document.querySelectorAll('.ai-service-card[data-ai-service]'));
      const aiIntroBody = document.getElementById('ai-intro-body');
      const aiIntroToggle = document.getElementById('ai-intro-toggle');
      const chatToggleContacts = document.getElementById('chat-toggle-contacts');
      const chatLeftPane = document.getElementById('chat-left-pane');
      const chatBackBtn = document.getElementById('chat-back-btn');
      const chatTabBack = document.getElementById('chat-tab-back');
      diagFileInput = document.getElementById('diag-file');
      diagDropzone = document.getElementById('diag-dropzone');
      diagPreview = document.getElementById('diag-preview');
      diagPreviewImg = document.getElementById('diag-preview-img');
      diagPlaceholder = document.getElementById('diag-placeholder');
      diagSymptoms = document.getElementById('diag-symptoms');
      diagRunBtn = document.getElementById('diag-run');
      diagResetBtn = document.getElementById('diag-reset');
      diagResult = document.getElementById('diag-result');
      diagLoading = document.getElementById('diag-loading');
      diagStatus = document.getElementById('diag-status');
      diagPanel = document.getElementById('diag-panel');
      textPanel = document.getElementById('text-panel');
      textServiceInput = document.getElementById('text-service-input');
      textServiceTitle = document.getElementById('text-service-title');
      textServiceSubtitle = document.getElementById('text-service-subtitle');
      textServiceIcon = document.getElementById('text-service-icon');
      textServiceRunBtn = document.getElementById('text-service-run');
      textServiceClearBtn = document.getElementById('text-service-clear');
      const aiUpgradeBtn = document.getElementById('btn-ai-upgrade');

      const tabLogin = document.getElementById('tab-login');
      const tabRegister = document.getElementById('tab-register');
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');

      const loginUsername = document.getElementById('login-username');
      const loginPassword = document.getElementById('login-password');
      const regUsername = document.getElementById('reg-username');
      const regDisplayName = document.getElementById('reg-displayname');
      const regPassword = document.getElementById('reg-password');
      const regAvatar = document.getElementById('reg-avatar');
      const mapOptions = {
        container: document.getElementById('map-container'),
        background: document.getElementById('map-background'),
        markersLayer: document.getElementById('map-markers-layer'),
        petsLayer: document.getElementById('map-pets-layer'),
        petLocationListEl: document.getElementById('pet-location-feed'),
        trackedCountEl: document.getElementById('tracked-pet-count'),
        locationListEl: document.getElementById('location-list'),
        locationCountEl: document.getElementById('location-count'),
        searchInput: document.getElementById('map-search'),
        cardElements: {
          wrapper: document.getElementById('location-card'),
          name: document.getElementById('loc-name'),
          type: document.getElementById('loc-type'),
          desc: document.getElementById('loc-desc'),
          rating: document.getElementById('loc-rating'),
          tags: document.getElementById('loc-tags'),
          pets: document.getElementById('loc-pets'),
          hours: document.getElementById('loc-hours'),
          phone: document.getElementById('loc-phone'),
          address: document.getElementById('loc-address'),
          status: document.getElementById('loc-status'),
          linkButton: document.getElementById('loc-link'),
          closeButton: document.getElementById('loc-close')
        },
        onMapFocus: () => {
          document.querySelector('[data-tab=\"map\"]')?.click();
        }
      };
      if (mapOptions.container && window.PawMapController) {
        mapController = new window.PawMapController(mapOptions);
        mapController.init();
      }
      initBehaviourCheck();
      window.focusPetOnMap = (petId) => {
        document.querySelector('[data-tab="map"]')?.click();
        window.setTimeout(() => {
          mapController?.focusTrackedPet?.(petId);
        }, 80);
      };

      const appShellEl = document.querySelector('.app-shell');
      function setSidebarState(collapsed) {
        if (!appShellEl) return;
        const isCollapsed = typeof collapsed === 'boolean' ? collapsed : !appShellEl.classList.contains('collapsed');
        appShellEl.classList.toggle('collapsed', isCollapsed);
        localStorage.setItem('pawtraceSidebarCollapsed', isCollapsed ? '1' : '0');
      }
      const SIDEBAR_PREF_VERSION = 'v2';
      const storedSidebarPrefVersion = localStorage.getItem('pawtraceSidebarPrefVersion');
      if (storedSidebarPrefVersion !== SIDEBAR_PREF_VERSION) {
        localStorage.removeItem('pawtraceSidebarCollapsed');
        localStorage.setItem('pawtraceSidebarPrefVersion', SIDEBAR_PREF_VERSION);
      }
      const storedCollapsed = localStorage.getItem('pawtraceSidebarCollapsed');
      const defaultCollapsed = storedCollapsed ? storedCollapsed === '1' : false;
      setSidebarState(defaultCollapsed);
      aiServiceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-ai-service');
          setSelectedAIService(key);
        });
      });
      if (aiIntroToggle && aiIntroBody) {
        aiIntroToggle.addEventListener('click', () => {
          const isOpen = aiIntroBody.classList.toggle('show');
          aiIntroToggle.textContent = isOpen ? 'Hide details' : 'Show details';
        });
      }
      if (chatToggleContacts && chatLeftPane) {
        chatToggleContacts.addEventListener('click', () => {
          const isOpen = chatLeftPane.classList.toggle('open');
          chatToggleContacts.textContent = isOpen ? 'Hide friends' : 'Show friends';
        });
      }
      if (chatBackBtn && chatLeftPane) {
        chatBackBtn.addEventListener('click', () => {
          chatLeftPane.classList.add('open');
          if (chatToggleContacts) chatToggleContacts.textContent = 'Hide friends';
        });
      }
      if (chatTabBack) {
        chatTabBack.addEventListener('click', () => {
          document.querySelector('.app-tab[data-tab="pets"]')?.click();
        });
      }
      aiUpgradeBtn?.addEventListener('click', () => {
      alert('AI Wellness plan: ¥29/month for unlimited health, behavior, and diet recommendations.');
      });

      // Visual Diagnosis handlers
      if (diagDropzone && diagFileInput) {
        const openPicker = () => diagFileInput.click();
        diagDropzone.setAttribute('tabindex', '0');
        diagDropzone.addEventListener('click', openPicker);
        diagDropzone.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        });
      }

      diagFileInput?.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an image under 5MB.');
          diagFileInput.value = '';
          return;
        }
        try {
          const dataUrl = await fileToDataURL(file);
          if (diagPreviewImg) diagPreviewImg.src = dataUrl;
          diagPreview?.classList.remove('hidden');
          diagPlaceholder?.classList.add('hidden');
          if (diagResult) {
            diagResult.innerHTML = `
              <div class="text-[11px] text-gray-600">
                Photo ready. Add symptoms (optional) and click Start AI Diagnosis.
              </div>
            `;
          }
        } catch (err) {
          console.warn('Preview load failed', err);
          diagFileInput.value = '';
          resetDiagnosisUI();
        }
      });

      diagRunBtn?.addEventListener('click', handleDiagnosisRun);
      diagResetBtn?.addEventListener('click', resetDiagnosisUI);
      textServiceRunBtn?.addEventListener('click', handleTextServiceRun);
      textServiceClearBtn?.addEventListener('click', clearTextService);
      setSelectedAIService('diagnosis');
      resetDiagnosisUI();

      const currentUserNameEl = document.getElementById('current-user-name');
      const currentUserAvatarEl = document.getElementById('current-user-avatar');
      const headerConnectionStatusEl = document.getElementById('header-connection-status');
      const sidebarUserNameEl = document.getElementById('sidebar-user-name');
      const profileAvatarEl = document.getElementById('profile-avatar');
      const profileNameEl = document.getElementById('profile-name');
      const profileUsernameEl = document.getElementById('profile-username');
      const profileBioEl = document.getElementById('profile-bio');
      const profileCampusEl = document.getElementById('profile-campus');
      const profileContactEl = document.getElementById('profile-contact');
      const profileStarSignEl = document.getElementById('profile-star-sign');
      const profileMainPetEl = document.getElementById('profile-main-pet');
      const profilePetNotesEl = document.getElementById('profile-pet-notes');
      const profileSideFocusEl = document.getElementById('profile-side-focus');
      const petInsightText = document.getElementById('pet-insight-text');
      const btnRefreshPetInsight = document.getElementById('btn-refresh-pet-insight');
      const btnEditProfile = document.getElementById('btn-edit-profile');
      const btnSaveProfile = document.getElementById('btn-save-profile');
      editAvatarFileInput = document.getElementById('edit-avatar-file');
      profileAvatarPreviewImg = document.getElementById('profile-avatar-preview-img');
      const editStarSign = document.getElementById('edit-star-sign');
      const editMainPetName = document.getElementById('edit-main-pet-name');
      const editMainPetType = document.getElementById('edit-main-pet-type');
      const editMainPetBirth = document.getElementById('edit-main-pet-birth');
      const editMainPetNotes = document.getElementById('edit-main-pet-notes');
      editMainPetBirth?.addEventListener('change', () => {
        const computedSign = computeStarSign(editMainPetBirth.value);
        if (computedSign) {
          editStarSign.value = computedSign;
        }
      });


      function updateProfileDetails(user) {
        if (!user) return;
        if (profileStarSignEl) {
          const tagline = user.starSign ? STAR_SIGN_DESCRIPTIONS[user.starSign] : '';
          profileStarSignEl.textContent = user.starSign
            ? `Star sign: ${user.starSign}${tagline ? ' · ' + tagline : ''}`
            : 'Star sign: Not set';
        }
        const mainPetLabel = user.mainPetName ? `${user.mainPetName} · ${user.mainPetType || 'Pet'}` : 'Add your main pet to personalize insights.';
        if (profileMainPetEl) profileMainPetEl.textContent = mainPetLabel;
        if (profileSideFocusEl) profileSideFocusEl.textContent = user.mainPetName || 'Not set';
        if (profilePetNotesEl) profilePetNotesEl.textContent = user.mainPetNotes || 'Share habits and quirks to give the AI more context.';
        if (petInsightText) {
          petInsightText.textContent = user.petInsight || 'Tap "Ask AI" to get a behavior prediction.';
        }
      }

      async function fetchPetInsight(force = false) {
        const user = getCurrentUser();
        if (!user || !petInsightText) return;
        if (!user.starSign && user.mainPetBirth) {
          const derivedSign = computeStarSign(user.mainPetBirth);
          if (derivedSign) {
            user.starSign = derivedSign;
            persistCurrentUser(user);
            updateProfileDetails(user);
          }
        }
        if (!user.starSign && !user.mainPetName) {
          petInsightText.textContent = 'Add your star sign or main pet info to unlock insights.';
          return;
        }
        if (!force && user.petInsight) {
          petInsightText.textContent = user.petInsight;
          return;
        }
        petInsightText.textContent = 'Asking AI for a fresh insight...';
        try {
          const response = await fetch('/api/pet-prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile: {
                displayName: user.displayName,
                starSign: user.starSign,
                petName: user.mainPetName,
                petType: user.mainPetType,
                petBirthday: user.mainPetBirth,
                petNotes: user.mainPetNotes
              }
            })
          });
          if (!response.ok) {
            throw new Error('Prediction request failed');
          }
          const data = await response.json();
          const prediction = data.prediction || data.error || 'Unable to predict right now.';
          petInsightText.textContent = prediction;
          user.petInsight = prediction;
          setCurrentUser(user);
        } catch (err) {
          console.warn('Pet insight error', err);
          petInsightText.textContent = user.petInsight || 'Unable to reach AI at the moment.';
        }
      }

      function setAIServiceStatus(message, persistent = false) {
        if (!aiServiceStatusEl) return;
        aiServiceStatusEl.textContent = message;
        aiServiceStatusEl.classList.remove('hidden');
        if (!persistent) {
          if (aiServiceStatusTimer) clearTimeout(aiServiceStatusTimer);
          aiServiceStatusTimer = window.setTimeout(() => {
            aiServiceStatusEl?.classList.add('hidden');
          }, 4000);
        }
      }

      function setDiagStatus(message, isError = false) {
        if (!diagStatus) return;
        diagStatus.textContent = message;
        diagStatus.classList.remove('hidden');
        diagStatus.classList.toggle('text-red-500', isError);
        diagStatus.classList.toggle('text-primary', !isError);
      }

      function toggleDiagLoading(show) {
        if (diagLoading) diagLoading.classList.toggle('hidden', !show);
      }

      function resetDiagnosisUI() {
        if (diagPreview) diagPreview.classList.add('hidden');
        if (diagPlaceholder) diagPlaceholder.classList.remove('hidden');
        if (diagPreviewImg) diagPreviewImg.src = '';
        if (diagFileInput) diagFileInput.value = '';
        if (diagSymptoms) diagSymptoms.value = '';
        if (diagResult) {
          diagResult.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
              <div class="w-20 h-20 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-file-medical-alt text-3xl opacity-20 text-dark"></i>
              </div>
              <p class="text-sm font-medium text-gray-600">Results Waiting</p>
              <p class="text-[11px] mt-1 max-w-[220px] leading-relaxed">Upload a photo and describe symptoms to receive a detailed AI assessment.</p>
            </div>
          `;
        }
        toggleDiagLoading(false);
        if (diagStatus) diagStatus.classList.add('hidden');
      }

      function renderDiagnosisResult(text) {
        if (!diagResult) return;
        const formatted = escapeHtml(text)
          .replace(/\n/g, '<br/>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/### (.*?)(<br\/>|$)/g, '<h4 class="text-primary font-bold text-sm mt-3 mb-2 border-b border-primary/20 pb-1">$1</h4>')
          .replace(/- (.*?)(<br\/>|$)/g, '<div class="flex items-start gap-2 mb-1"><span class="text-primary">•</span><span>$1</span></div>');
        diagResult.innerHTML = `<div class="prose prose-sm max-w-none text-xs text-dark leading-relaxed ai-fade">${formatted}</div>`;
      }

      async function handleDiagnosisRun() {
        const file = diagFileInput?.files?.[0] || null;
        const symptoms = (diagSymptoms && diagSymptoms.value.trim()) || '';
        const user = getCurrentUser();
        if (!file && !symptoms) {
          alert('Upload a pet photo or enter symptoms to ask AI.');
          return;
        }
        diagRunBtn?.setAttribute('disabled', 'true');
        diagRunBtn?.classList.add('opacity-60', 'cursor-not-allowed');
        toggleDiagLoading(true);
        setDiagStatus(file ? 'Analyzing pet health with Qwen Vision...' : 'Analyzing symptoms (no photo)...');
        try {
          if (diagResult) {
            diagResult.innerHTML = `
              <div class="space-y-2 ai-fade">
                <div class="skeleton h-4 rounded"></div>
                <div class="skeleton h-4 rounded w-5/6"></div>
                <div class="skeleton h-4 rounded w-2/3"></div>
              </div>
            `;
          }
          if (file) {
            const base64 = await fileToBase64(file);
            const response = await fetch('/api/ai/qwen-diagnosis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type || 'image/jpeg',
                symptoms
              })
            });
            if (!response.ok) {
              const errText = await response.text();
              throw new Error(errText || 'Qwen Vision request failed');
            }
            const data = await response.json();
            const text = data?.result || data?.text || 'Unable to generate analysis. Please try a clearer photo.';
            renderDiagnosisResult(text);
            setDiagStatus('Qwen Vision analysis complete');
          } else {
            const response = await fetch('/api/ai/qwen-advice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                service: 'health',
                context: symptoms,
                profile: sanitizeUserProfile(user),
                pets: gatherOwnedPetsForPayload()
              })
            });
            if (response.ok) {
              const data = await response.json();
              const text = data?.result || data?.text || 'No response received.';
              renderDiagnosisResult(text);
              setDiagStatus('AI analysis complete (text only)');
            } else {
              throw new Error('Text-only AI request failed');
            }
          }
        } catch (err) {
          console.warn('Qwen diagnosis error', err);
          setDiagStatus('AI request failed', true);
          if (diagResult) {
            const fallback = generateMockAIResponse('health', user) || 'Unable to analyze right now. Please try again.';
            diagResult.innerHTML = `<p class="text-xs text-gray-700">${escapeHtml(fallback)}</p>`;
          }
        } finally {
          toggleDiagLoading(false);
          diagRunBtn?.removeAttribute('disabled');
          diagRunBtn?.classList.remove('opacity-60', 'cursor-not-allowed');
        }
      }

      function buildProfileContext(user) {
        if (!user) return '';
        const parts = [];
        if (user.displayName) parts.push(`Owner: ${user.displayName}`);
        if (user.mainPetName) parts.push(`Pet: ${user.mainPetName} (${user.mainPetType || 'Pet'})`);
        if (user.mainPetBirth) parts.push(`Birthday: ${user.mainPetBirth}`);
        if (user.mainPetNotes) parts.push(`Notes: ${user.mainPetNotes}`);
        return parts.join(' | ');
      }

      function getTextPlaceholder(serviceKey) {
        const meta = AI_SERVICE_CONFIG[serviceKey] || {};
        return meta.placeholder || "Describe your pet's recent health, behavior, or diet concerns...";
      }

      function setSelectedAIService(serviceKey) {
        selectedAIService = serviceKey;
        document.querySelectorAll('.ai-service-card[data-ai-service]').forEach(btn => {
          btn.classList.toggle('ring-2', btn.getAttribute('data-ai-service') === serviceKey);
          btn.classList.toggle('ring-primary', btn.getAttribute('data-ai-service') === serviceKey);
          btn.classList.toggle('bg-white', btn.getAttribute('data-ai-service') === serviceKey);
          btn.classList.toggle('scale-[1.02]', btn.getAttribute('data-ai-service') === serviceKey);
        });
        if (serviceKey === 'diagnosis') {
          diagPanel?.classList.remove('hidden');
          textPanel?.classList.add('hidden');
          return;
        }
        diagPanel?.classList.add('hidden');
        textPanel?.classList.remove('hidden');
        const meta = AI_SERVICE_CONFIG[serviceKey] || AI_SERVICE_CONFIG.health;
        if (textServiceTitle) textServiceTitle.textContent = meta.label || 'AI Report';
        if (textServiceSubtitle) textServiceSubtitle.textContent = meta.subtitle || meta.summary || '';
        if (textServiceIcon) textServiceIcon.innerHTML = `<i class="${meta.icon || 'fas fa-magic'}"></i>`;
        if (textServiceInput && !textServiceInput.value) {
          textServiceInput.placeholder = getTextPlaceholder(serviceKey);
        }
      }

      function renderTextResult(text) {
        if (!aiServiceOutputEl) return;
        const formatted = escapeHtml(text)
          .replace(/\n/g, '<br/>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/### (.*?)(<br\/>|$)/g, '<h4 class="text-primary font-bold text-sm mt-3 mb-2 border-b border-primary/20 pb-1">$1</h4>')
          .replace(/- (.*?)(<br\/>|$)/g, '<div class="flex items-start gap-2 mb-1"><span class="text-primary">•</span><span>$1</span></div>');
        aiServiceOutputEl.innerHTML = `<div class="prose prose-sm max-w-none text-xs text-dark leading-relaxed ai-fade">${formatted}</div>`;
      }

      async function handleTextServiceRun() {
        if (selectedAIService === 'diagnosis') return;
        const user = getCurrentUser();
        if (!user) {
          alert('Please log in before using AI services.');
          return;
        }
        const config = AI_SERVICE_CONFIG[selectedAIService];
        if (!config || !config.endpoint) {
          alert('This AI service is not configured yet.');
          return;
        }
        const context = (textServiceInput?.value || '').trim() || buildProfileContext(user);
        if (!context) {
          alert('Please provide some context for the AI.');
          return;
        }
        setAIButtonsDisabled(true);
        setAIServiceStatus(`Generating ${AI_SERVICE_CONFIG[selectedAIService]?.label || 'report'} ...`);
        if (aiServiceOutputEl) {
          aiServiceOutputEl.innerHTML = `
            <div class="space-y-2 ai-fade">
              <div class="skeleton h-4 rounded"></div>
              <div class="skeleton h-4 rounded w-5/6"></div>
              <div class="skeleton h-4 rounded w-2/3"></div>
            </div>
          `;
        }
        try {
          const response = await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service: selectedAIService,
              context,
              profile: sanitizeUserProfile(user),
              pets: gatherOwnedPetsForPayload()
            })
          });
          if (!response.ok) throw new Error('AI endpoint unavailable');
          const data = await response.json();
          const result = data?.result || data?.text;
          if (result) {
            renderTextResult(result);
            setAIServiceStatus(`Complete · ${AI_SERVICE_CONFIG[selectedAIService]?.label || 'AI report'}`);
            return;
          }
        } catch (err) {
          console.warn('Text AI service error', err);
          renderTextResult(generateMockAIResponse(selectedAIService, user));
          setAIServiceStatus('AI request failed, using mock data', true);
        } finally {
          setAIButtonsDisabled(false);
        }
      }

      function clearTextService() {
        if (textServiceInput) textServiceInput.value = '';
        if (textServiceInput) textServiceInput.placeholder = getTextPlaceholder(selectedAIService);
        if (aiServiceOutputEl) {
          aiServiceOutputEl.innerHTML = 'Select a text AI service and generate a tailored report.';
        }
        if (aiServiceStatusEl) aiServiceStatusEl.classList.add('hidden');
      }

      function setAIButtonsDisabled(disabled) {
        aiServiceButtons.forEach(btn => {
          btn.disabled = disabled;
          btn.classList.toggle('opacity-60', disabled);
          btn.classList.toggle('cursor-not-allowed', disabled);
        });
      }

      async function requestAIService(serviceKey) {
        if (serviceKey === 'diagnosis') {
          setSelectedAIService('diagnosis');
          return;
        }
        setSelectedAIService(serviceKey);
        await handleTextServiceRun();
      }

      function generateMockAIResponse(serviceKey, user) {
        const petName = user?.mainPetName || 'your pet';
        const campus = user?.campus || 'Taicang Campus';
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        switch (serviceKey) {
          case 'health':
            return `
              <strong>${petName} · Health Report</strong><br>
              • ${rand(['Weight and body fat are steady', 'Weight trending up 0.1kg, monitor treats', 'Body score 4/9, lean and active'])}; keep ${rand(['2-3 weekly 30-minute walks', 'one brisk 20-min walk daily', 'mixed sniff walks + short jogs'])}.<br>
              • Vaccine reminder: ${rand(['rabies next month', 'DHPP in 6 weeks', 'annual boosters due in 2 months'])}.<br>
              • ${rand(['Add dental chews twice a week', 'Check ears after outdoor play', 'Moisturize paw pads in dry weather'])}.
            `;
          case 'behavior':
            return `
              <strong>Behavior Insight</strong><br>
              1. ${rand(['Restless sniffing = searching for outlets; add nosework mats 10 min/day', 'Low tail + pacing suggests uncertainty; use short approach/retreat games', 'Extra zoomies indoors; rotate puzzle toys before bedtime'])}.<br>
              2. ${rand(['Reward quiet observation on walks to reduce reactivity', 'Use 3-step settle cue before guests arrive', 'Short clicker sessions to channel energy'])}.<br>
              3. ${rand(['Schedule decompression walk on soft surfaces', 'Increase chew time to lower stress hormones', 'Keep greetings short and predictable this week'])}.
            `;
          case 'diet':
            return `
              <strong>Diet Recommendation</strong><br>
              • Breakfast: ${rand(['60g low-fat kibble + 20g pumpkin', 'lean turkey 50g + oat topper', 'salmon kibble 55g + carrot shreds'])}.<br>
              • Dinner: ${rand(['70g wet food + 30g yam', '65g kibble + 1 boiled egg white', '70g chicken wet + green bean mix'])}.<br>
              • Snacks: ${rand(['freeze-dried chicken 1-2 cubes', 'blueberries 6-8 pcs', 'dental chew after dinner'])}.<br>
              • Hydration: ${rand(['target 50-60ml/kg/day', 'add goat milk cube after play', 'use broths if appetite dips'])}.
            `;
          default:
            return 'AI services are evolving; stay tuned.';
        }
      }

      btnRefreshPetInsight?.addEventListener('click', () => {
        fetchPetInsight(true);
      });
      editAvatarFileInput?.addEventListener('change', async () => {
        const file = editAvatarFileInput.files && editAvatarFileInput.files[0];
        if (!file) {
          pendingAvatarData = null;
          if (profileAvatarPreviewImg) {
            profileAvatarPreviewImg.src = (getCurrentUser()?.avatar) || DEFAULT_PET_AVATAR;
          }
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an avatar under 5MB.');
          editAvatarFileInput.value = '';
          return;
        }
        try {
          const data = await fileToDataURL(file);
          pendingAvatarData = data;
          if (profileAvatarPreviewImg) profileAvatarPreviewImg.src = data;
        } catch (err) {
          console.warn('Avatar load failed', err);
          pendingAvatarData = null;
        }
      });

      function showApp(user) {
        authMsg.textContent = '';
        closeAllModals();
        loginScreen?.classList.add('hidden');
        appRoot.classList.remove('hidden');
        mobileTabbar?.classList.remove('hidden');
        const displayName = user.displayName || user.username;
        const avatar = user.avatar || 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png';
        currentUserNameEl.textContent = displayName;
        currentUserAvatarEl.src = avatar;
        if (sidebarUserNameEl) sidebarUserNameEl.textContent = displayName;
        if (headerConnectionStatusEl) headerConnectionStatusEl.textContent = `${user.campus || 'Taicang'} · Connected`;
        profileAvatarEl.src = avatar;
        profileNameEl.textContent = displayName;
        profileUsernameEl.textContent = '@' + user.username;
        profileBioEl.textContent = user.bio || 'Welcome to PawTrace!';
        profileCampusEl.textContent = user.campus || 'Taicang';
        profileContactEl.textContent = user.contact || 'Contact: N/A';
        updateProfileDetails(user);
        initTabs();
        initPets();
        initHealthMonitor();
        mapController?.refreshTrackedPets?.();
        initChat();
        handleScrollReveal();
        fetchPetInsight();
      }

      function switchAuthTab(mode) {
        if (mode === 'login') {
          tabLogin.classList.add('bg-primary','text-white');
          tabRegister.classList.remove('bg-primary','text-white');
          loginForm.classList.remove('hidden');
          registerForm.classList.add('hidden');
        } else {
          tabRegister.classList.add('bg-primary','text-white');
          tabLogin.classList.remove('bg-primary','text-white');
          loginForm.classList.add('hidden');
          registerForm.classList.remove('hidden');
        }
        authMsg.textContent = '';
      }

      tabLogin.addEventListener('click', () => switchAuthTab('login'));
      tabRegister.addEventListener('click', () => switchAuthTab('register'));

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const users = loadUsers();
        const u = users.find(x => x.username === loginUsername.value.trim());
        if (!u || u.password !== loginPassword.value) {
          authMsg.textContent = 'Incorrect username or password.';
          return;
        }
        authMsg.textContent = '';
        setCurrentUser(u);
        showApp(u);
      });

      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let users = loadUsers();
        const username = regUsername.value.trim();
        if (!username) {
          authMsg.textContent = 'Username is required.';
          return;
        }
        if (users.find(x => x.username === username)) {
          authMsg.textContent = 'This username is already taken.';
          return;
        }
        if (regPassword.value.length < 6) {
          authMsg.textContent = 'Password should be at least 6 characters.';
          return;
        }
        const newUser = {
          username,
          displayName: regDisplayName.value.trim() || username,
          password: regPassword.value,
          avatar: regAvatar.value.trim() || 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png',
          bio: '',
          campus: 'Taicang',
          contact: '',
          starSign: '',
          mainPetName: '',
          mainPetType: '',
          mainPetBirth: '',
          mainPetNotes: '',
          petInsight: ''
        };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        authMsg.textContent = '';
        showApp(newUser);
      });

      btnEditProfile.addEventListener('click', openProfileEditModal);
      btnSaveProfile.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return;
        if (pendingAvatarData) {
          currentUser.avatar = pendingAvatarData;
        }
        currentUser.displayName = document.getElementById('edit-display-name').value || currentUser.displayName;
        currentUser.bio = document.getElementById('edit-bio').value;
        currentUser.campus = document.getElementById('edit-campus').value;
        currentUser.contact = document.getElementById('edit-contact').value;
        const derivedStarSign = editStarSign.value.trim() || computeStarSign(editMainPetBirth.value);
        if (!editStarSign.value && derivedStarSign) {
          editStarSign.value = derivedStarSign;
        }
        currentUser.starSign = derivedStarSign || '';
        currentUser.mainPetName = editMainPetName.value;
        currentUser.mainPetType = editMainPetType.value;
        currentUser.mainPetBirth = editMainPetBirth.value;
        currentUser.mainPetNotes = editMainPetNotes.value;
        currentUser.petInsight = '';
        persistCurrentUser(currentUser);
        closeProfileEditModal();
        showApp(currentUser);
        sendMonitoringPayload({
          personalInfo: {
            username: currentUser.username,
            displayName: currentUser.displayName,
            campus: currentUser.campus,
            contact: currentUser.contact
          },
          userProfile: sanitizeUserProfile(currentUser),
          pets: gatherOwnedPetsForPayload(),
          metadata: { source: 'profile-update' }
        });
      });


      guestAccessBtn?.addEventListener('click', () => {
        const guestUser = getDefaultUser();
        setCurrentUser(guestUser);
        showApp(guestUser);
      });

      const existing = getCurrentUser();
      if (existing) {
        showApp(existing);
      } else {
        closeAllModals();
        appRoot.classList.add('hidden');
        mobileTabbar?.classList.add('hidden');
        loginScreen?.classList.remove('hidden');
      }

      document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => {
          closeAllModals();
          setCurrentUser(null);
          appRoot.classList.add('hidden');
          mobileTabbar?.classList.add('hidden');
          loginScreen?.classList.remove('hidden');
          switchAuthTab('login');
          authMsg.textContent = '';
        });
      });
    });

    // --- Tabs & navigation ---
    let tabsInitialized = false;
    function initTabs() {
      const tabPages = {
        map: document.getElementById('tab-map'),
        pets: document.getElementById('tab-pets'),
        chat: document.getElementById('tab-chat'),
        health: document.getElementById('tab-health'),
        behaviour: document.getElementById('tab-behaviour'),
        profile: document.getElementById('tab-profile'),
        ai: document.getElementById('tab-ai'),
      };
      const topTabs = document.querySelectorAll('.app-tab');
      const headerEyebrow = document.getElementById('header-tab-eyebrow');
      const headerTitle = document.getElementById('header-tab-title');
      const headerSubtitle = document.getElementById('header-tab-subtitle');
      const appAddressSection = document.getElementById('app-address-section');
      const mobileMoreButton = document.getElementById('mobile-more-button');
      const mobileMoreSheet = document.getElementById('mobile-more-sheet');
      const mobileMoreItems = document.querySelectorAll('[data-mobile-tab]');
      const mobileMoreTabs = new Set(['behaviour', 'ai', 'profile']);
      if (tabsInitialized) {
        activateAppTab?.(activeTabName);
        return;
      }
      tabsInitialized = true;

      function setMobileMoreOpen(isOpen) {
        mobileMoreSheet?.classList.toggle('hidden', !isOpen);
        mobileMoreSheet?.setAttribute('aria-hidden', String(!isOpen));
        mobileMoreButton?.setAttribute('aria-expanded', String(isOpen));
      }

      function activateTab(name) {
        if (!tabPages[name]) name = 'map';
        const chatPane = document.getElementById('chat-left-pane');
        const chatToggle = document.getElementById('chat-toggle-contacts');
        const meta = TAB_HEADER_META[name] || TAB_HEADER_META.map;
        activeTabName = name;
        Object.keys(tabPages).forEach(key => {
          tabPages[key].classList.toggle('hidden', key !== name);
        });
        topTabs.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
        });
        mobileMoreButton?.classList.toggle('active', mobileMoreTabs.has(name));
        mobileMoreItems.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-mobile-tab') === name);
        });
        setMobileMoreOpen(false);
        if (headerEyebrow) headerEyebrow.textContent = meta.eyebrow;
        if (headerTitle) headerTitle.textContent = meta.title;
        if (headerSubtitle) headerSubtitle.textContent = meta.subtitle;
        if (appAddressSection) appAddressSection.textContent = meta.path || name;
        if (tabPages[name]) {
          tabPages[name].classList.add('visible');
        }
        if (name === 'map') {
          window.requestAnimationFrame(() => {
            mapController?.syncMapView?.();
          });
        }
        if (name === 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.add('open');
          if (chatToggle) chatToggle.textContent = 'Hide friends';
        } else if (name !== 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.remove('open');
          if (chatToggle) chatToggle.textContent = 'Show friends';
        }
      }
      activateAppTab = activateTab;

      topTabs.forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-tab');
          activateTab(name);
          if (name && tabPages[name]) {
            history.replaceState(null, '', `#${name}`);
          }
        });
      });
      mobileMoreButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        setMobileMoreOpen(mobileMoreSheet?.classList.contains('hidden'));
      });
      mobileMoreItems.forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-mobile-tab');
          activateTab(name);
          if (name && tabPages[name]) {
            history.replaceState(null, '', `#${name}`);
          }
        });
      });
      document.addEventListener('click', (event) => {
        if (!mobileMoreSheet || mobileMoreSheet.classList.contains('hidden')) return;
        const target = event.target;
        if (target instanceof Element && (mobileMoreSheet.contains(target) || mobileMoreButton?.contains(target))) return;
        setMobileMoreOpen(false);
      });
      window.addEventListener('hashchange', () => {
        const hashTab = window.location.hash.replace('#', '');
        if (hashTab && tabPages[hashTab]) activateTab(hashTab);
      });
      const initialTab = window.location.hash.replace('#', '');
      activateTab(initialTab && tabPages[initialTab] ? initialTab : 'map');
    }

    // --- Pet data & UI ---
    const PETS_DATA_KEY = 'pawtrace_pets';
    const MONITORING_API = '/api/monitor/collect';
    const DEFAULT_PET_AVATAR = '/assets/1.png';
    const MY_PETS_KEY = 'pawtrace_my_pets';
    const STAR_SIGN_DESCRIPTIONS = {
      Aries: 'Bold bursts of energy – plan active play.',
      Taurus: 'Calm, food-loving companion – keep snacks ready.',
      Gemini: 'Curious chatterbox – rotate toys often.',
      Cancer: 'Homebody cuddler – give extra comfort corners.',
      Leo: 'Attention seeker – celebrate with applause and selfies.',
      Virgo: 'Detail-focused buddy – loves tidy routines.',
      Libra: 'Balance seeker – mix social walks and quiet time.',
      Scorpio: 'Intense protector – respect their space cues.',
      Sagittarius: 'Explorer spirit – map new routes weekly.',
      Capricorn: 'Disciplined pal – thrives on structured training.',
      Aquarius: 'Inventive friend – introduce puzzle toys.',
      Pisces: 'Dreamy empath – soft music and water play soothe.'
    };
    const AI_SERVICE_CONFIG = {
      diagnosis: {
        label: 'Visual Diagnosis',
        subtitle: 'Photo + symptoms',
        icon: 'fas fa-microscope'
      },
      health: {
        label: 'Pet Health Report',
        endpoint: '/api/ai/qwen-advice',
        summary: 'Vitals, vaccine progress, and next care reminders.',
        placeholder: "Describe your pet's recent health status, last vet visit, weight changes, or concerns (e.g., 'Cat has been lethargic and eating less').",
        icon: 'fas fa-notes-medical',
        subtitle: 'Vitals, vaccines, and next steps'
      },
      behavior: {
        label: 'Behavior Insight',
        endpoint: '/api/ai/qwen-advice',
        summary: 'Decode recent interactions to explain moods and highlight training priorities.',
        placeholder: "Describe the behavior (e.g., 'Dog barks at strangers on walks' or 'Cat is scratching the sofa').",
        icon: 'fas fa-brain',
        subtitle: 'Mood shifts, training cues'
      },
      diet: {
        label: 'Diet Recommendation',
        endpoint: '/api/ai/qwen-advice',
        summary: 'Match breed and activity level to a weekly meal plan and snacks.',
        placeholder: "Pet details (breed/age/weight) + diet needs (e.g., '3-year-old Corgi, 12kg, sensitive stomach, likes chicken').",
        icon: 'fas fa-carrot',
        subtitle: 'Meals, snacks, hydration'
      }
    };
    const PETS_CHANGED_EVENT = 'pawtrace:pets-updated';
    const DEFAULT_TRACKED_ZONES = [
      { label: 'West Residence Quad', coords: { x: 24, y: 20 } },
      { label: 'North Canal Bridge', coords: { x: 49, y: 33 } },
      { label: 'Central Ring Promenade', coords: { x: 68, y: 48 } },
      { label: 'Learning Hub Entrance', coords: { x: 59, y: 22 } },
      { label: 'Stadium Track Edge', coords: { x: 50, y: 69 } },
      { label: 'South Ring Gate', coords: { x: 72, y: 79 } },
    ];

    function clampNumber(value, min, max, fallback) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      return Math.min(max, Math.max(min, numeric));
    }

    function getDefaultTrackedZone(index = 0) {
      return DEFAULT_TRACKED_ZONES[index % DEFAULT_TRACKED_ZONES.length];
    }

    function buildPetNfcId(pet = {}, index = 0) {
      const raw = String(pet.id || `pet-${index}`)
        .replace(/[^a-z0-9]/gi, '')
        .slice(-6)
        .toUpperCase();
      return `PT-${raw || `0${index + 1}`}`;
    }

    function formatReadingTimestamp(timestamp) {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return 'Just now';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    function normalizeVitalsHistory(history = []) {
      if (!Array.isArray(history)) return [];
      return history
        .map((entry) => ({
          timestamp: entry?.timestamp || new Date().toISOString(),
          temperature: Number(entry?.temperature),
          heartRate: Number(entry?.heartRate),
        }))
        .filter((entry) => Number.isFinite(entry.temperature) || Number.isFinite(entry.heartRate))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function getLatestVitals(pet = {}) {
      const history = normalizeVitalsHistory(pet.vitalsHistory);
      return history[0] || null;
    }

    function getVitalsAssessment(entry) {
      if (!entry) {
        return {
          state: 'Waiting',
          summary: 'No recent temperature or heart-rate data.',
          tempLabel: 'No reading yet',
          heartLabel: 'No reading yet',
        };
      }
      const temperature = Number(entry.temperature);
      const heartRate = Number(entry.heartRate);
      const tempBand = Number.isFinite(temperature)
        ? (temperature < 37.3 || temperature > 39.6 ? 'alert' : temperature < 37.8 || temperature > 39.2 ? 'watch' : 'stable')
        : 'unknown';
      const heartBand = Number.isFinite(heartRate)
        ? (heartRate < 60 || heartRate > 165 ? 'alert' : heartRate < 75 || heartRate > 145 ? 'watch' : 'stable')
        : 'unknown';
      const state = tempBand === 'alert' || heartBand === 'alert'
        ? 'Needs attention'
        : tempBand === 'watch' || heartBand === 'watch'
          ? 'Watch closely'
          : 'Stable';
      const summary = state === 'Needs attention'
        ? 'One or more vitals are outside the usual pet-safe demo range.'
        : state === 'Watch closely'
          ? 'Vitals are slightly off the comfortable demo range. Recheck soon.'
          : 'Latest vitals are within the expected demo monitoring range.';
      return {
        state,
        summary,
        tempLabel: Number.isFinite(temperature) ? `${temperature.toFixed(1)} °C` : 'No reading yet',
        heartLabel: Number.isFinite(heartRate) ? `${Math.round(heartRate)} bpm` : 'No reading yet',
      };
    }

    function formatMetricValue(metric, value) {
      if (!Number.isFinite(value)) return '--';
      return metric === 'temperature'
        ? `${value.toFixed(1)}°C`
        : `${Math.round(value)}`;
    }

    function getTrendSeries(history = [], metric = 'temperature', limit = 7) {
      return normalizeVitalsHistory(history)
        .slice(0, limit)
        .reverse()
        .map((entry) => ({
          timestamp: entry.timestamp,
          value: Number(entry[metric]),
        }))
        .filter((entry) => Number.isFinite(entry.value));
    }

    function getTrendSummary(series = [], metric = 'temperature') {
      if (!series.length) {
        return {
          badge: 'No data',
          caption: 'Waiting for recent readings',
          min: '--',
          avg: '--',
          max: '--',
        };
      }
      const values = series.map((point) => point.value);
      const delta = values[values.length - 1] - values[0];
      const threshold = metric === 'temperature' ? 0.25 : 8;
      const badge = delta > threshold ? 'Rising' : delta < -threshold ? 'Falling' : 'Stable';
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      return {
        badge,
        caption: `${series.length} readings · ${formatReadingTimestamp(series[series.length - 1].timestamp)}`,
        min: formatMetricValue(metric, Math.min(...values)),
        avg: formatMetricValue(metric, average),
        max: formatMetricValue(metric, Math.max(...values)),
      };
    }

    function buildTrendChartMarkup(series = [], metric = 'temperature') {
      if (!series.length) {
        return '<div class="health-trend-empty">No recent readings to graph yet.</div>';
      }
      const width = 320;
      const height = 148;
      const paddingX = 20;
      const paddingY = 16;
      const values = series.map((point) => point.value);
      const rawMin = Math.min(...values);
      const rawMax = Math.max(...values);
      const rangePadding = metric === 'temperature' ? 0.25 : 8;
      const min = rawMin === rawMax ? rawMin - rangePadding : rawMin - rangePadding;
      const max = rawMin === rawMax ? rawMax + rangePadding : rawMax + rangePadding;
      const chartWidth = width - (paddingX * 2);
      const chartHeight = height - (paddingY * 2);
      const points = series.map((point, index) => {
        const x = paddingX + ((chartWidth / Math.max(series.length - 1, 1)) * index);
        const y = paddingY + ((max - point.value) / Math.max(max - min, 0.0001)) * chartHeight;
        return { ...point, x, y };
      });
      const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
      const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - paddingY).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - paddingY).toFixed(2)} Z`;
      const gridLines = [0.25, 0.5, 0.75]
        .map((ratio) => {
          const y = paddingY + (chartHeight * ratio);
          return `<line class="health-trend-grid" x1="${paddingX}" y1="${y.toFixed(2)}" x2="${(width - paddingX).toFixed(2)}" y2="${y.toFixed(2)}"></line>`;
        })
        .join('');
      const dots = points
        .map((point) => `<circle class="health-trend-dot" cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4" fill="${metric === 'temperature' ? '#f59e0b' : '#38bdf8'}"></circle>`)
        .join('');
      const firstLabel = new Date(points[0].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const lastLabel = new Date(points[points.length - 1].timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return `
        <svg class="health-trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${metric} trend">
          ${gridLines}
          <path class="health-trend-area" d="${areaPath}" fill="${metric === 'temperature' ? 'rgba(245,158,11,0.22)' : 'rgba(56,189,248,0.22)'}"></path>
          <path class="health-trend-line" d="${linePath}" stroke="${metric === 'temperature' ? '#f59e0b' : '#38bdf8'}"></path>
          ${dots}
          <text class="health-trend-label" x="${paddingX}" y="${height - 4}">${firstLabel}</text>
          <text class="health-trend-label" x="${width - paddingX}" y="${height - 4}" text-anchor="end">${lastLabel}</text>
        </svg>
      `;
    }

    function updateTrendCard(options = {}) {
      const {
        metric = 'temperature',
        history = [],
        chartEl,
        badgeEl,
        captionEl,
        minEl,
        avgEl,
        maxEl,
      } = options;
      const series = getTrendSeries(history, metric);
      const summary = getTrendSummary(series, metric);
      if (chartEl) chartEl.innerHTML = buildTrendChartMarkup(series, metric);
      if (badgeEl) badgeEl.textContent = summary.badge;
      if (captionEl) captionEl.textContent = summary.caption;
      if (minEl) minEl.textContent = summary.min;
      if (avgEl) avgEl.textContent = summary.avg;
      if (maxEl) maxEl.textContent = summary.max;
    }

    function createStarterVitals(pet = {}, index = 0) {
      const baseTemp = 38 + ((index % 3) * 0.2);
      const baseHeart = pet.type && /cat/i.test(pet.type) ? 138 - (index * 3) : 108 + (index * 4);
      return [
        {
          timestamp: new Date(Date.now() - ((index + 1) * 3600 * 1000)).toISOString(),
          temperature: Number(baseTemp.toFixed(1)),
          heartRate: baseHeart,
        }
      ];
    }

    function normalizePetRecord(pet = {}, index = 0) {
      const zone = getDefaultTrackedZone(index);
      const currentUser = getCurrentUser();
      const history = normalizeVitalsHistory(pet.vitalsHistory);
      return {
        ...pet,
        location: String(pet.location || pet.locationLabel || zone.label || 'Campus Lawn').trim(),
        mapCoords: {
          x: clampNumber(pet?.mapCoords?.x, 8, 92, zone.coords.x),
          y: clampNumber(pet?.mapCoords?.y, 8, 92, zone.coords.y),
        },
        nfcId: String(pet.nfcId || buildPetNfcId(pet, index)),
        nfcContact: String(pet.nfcContact || currentUser?.contact || '').trim(),
        nfcNote: String(pet.nfcNote || `${pet.name || 'This pet'} is friendly. Please contact the owner if found.`).trim(),
        vitalsHistory: history.length ? history : createStarterVitals(pet, index),
      };
    }

    function emitPetsChanged(pets = []) {
      document.dispatchEvent(new CustomEvent(PETS_CHANGED_EVENT, { detail: { pets } }));
    }

    function fileToDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Unable to read file'));
        reader.readAsDataURL(file);
      });
    }

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            const base64 = result.split(',')[1] || '';
            resolve(base64);
          } else {
            reject(new Error('Unable to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Unable to read file'));
        reader.readAsDataURL(file);
      });
    }

    function getStoredPets() {
      try {
        const parsed = JSON.parse(localStorage.getItem(PETS_DATA_KEY)) || [];
        return Array.isArray(parsed) ? parsed.map((pet, index) => normalizePetRecord(pet, index)) : [];
      } catch {
        return [];
      }
    }

    function setStoredPets(pets) {
      const normalized = Array.isArray(pets) ? pets.map((pet, index) => normalizePetRecord(pet, index)) : [];
      localStorage.setItem(PETS_DATA_KEY, JSON.stringify(normalized));
      emitPetsChanged(normalized);
    }


    function sanitizeUserProfile(user) {
      if (!user) return null;
      return {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        campus: user.campus,
        contact: user.contact,
        starSign: user.starSign,
        mainPetName: user.mainPetName,
        mainPetType: user.mainPetType,
        mainPetBirth: user.mainPetBirth,
        mainPetNotes: user.mainPetNotes
      };
    }

    function sanitizePetForPayload(pet = {}) {
      const latestVitals = getLatestVitals(pet);
      return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        status: pet.status,
        health: pet.health,
        location: pet.location,
        temperature: latestVitals?.temperature ?? null,
        heartRate: latestVitals?.heartRate ?? null,
      };
    }

    function gatherOwnedPetsForPayload() {
      return getStoredPets().map(sanitizePetForPayload);
    }

    async function sendMonitoringPayload(payload = {}) {
      try {
        await fetch(MONITORING_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Monitoring payload failed', err);
      }
    }

    function defaultPets() {
      return [
        {
          id: 'pet-1',
          name: 'Xiao Hei',
          type: 'Dog',
          breed: 'Labrador',
          age: '2 years',
          gender: 'Male',
          avatar: '/assets/1.png',
          traits: ['Friendly', 'Active', 'Affectionate'],
          status: 'Needs at least two walks daily and prefers chicken dog food.',
          health: 'Vaccinations up to date: Rabies, Distemper, Parvovirus. Next vaccination: 2023/12/15.',
          location: 'North Lawn',
          mapCoords: { x: 24, y: 61 },
          nfcId: 'PT-XH01',
          nfcContact: '+86 138 0000 0001',
          nfcNote: 'Friendly with students. Offer water first if found.',
          vitalsHistory: [
            { timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), temperature: 38.4, heartRate: 104 },
            { timestamp: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), temperature: 38.2, heartRate: 108 },
          ],
        },
        {
          id: 'pet-2',
          name: 'Xiao Bai',
          type: 'Cat',
          breed: 'Ragdoll',
          age: '1 year',
          gender: 'Female',
          avatar: '/assets/2.png',
          traits: ['Quiet', 'Independent', 'Cuddly'],
          status: 'Enjoys quiet rooms and feather toys, eats tuna-flavor food.',
          health: 'Vaccinations up to date: FVRCP, Rabies. Next vaccination: 2024/01/20.',
          location: 'Library Plaza',
          mapCoords: { x: 52, y: 37 },
          nfcId: 'PT-XB02',
          nfcContact: '+86 138 0000 0002',
          nfcNote: 'Indoor cat. Please keep in a quiet room and avoid loud dogs.',
          vitalsHistory: [
            { timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), temperature: 38.1, heartRate: 142 },
            { timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), temperature: 38.0, heartRate: 146 },
          ],
        },
        {
          id: 'pet-3',
          name: 'Xiao Huang',
          type: 'Hamster',
          breed: 'Syrian Hamster',
          age: '8 months',
          gender: 'Male',
          avatar: '/assets/3.png',
          traits: ['Active', 'Curious', 'Nocturnal'],
          status: 'Sleeps during the day, loves sunflower seeds and late-night runs.',
          health: 'Healthy; housed in 40x30cm cage with wheel and fresh wood shavings.',
          location: 'Dorm Garden',
          mapCoords: { x: 66, y: 47 },
          nfcId: 'PT-XH03',
          nfcContact: '+86 138 0000 0003',
          nfcNote: 'Small pet. Keep the carrier level and avoid direct sun.',
          vitalsHistory: [
            { timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), temperature: 37.8, heartRate: 132 },
            { timestamp: new Date(Date.now() - 27 * 3600 * 1000).toISOString(), temperature: 37.7, heartRate: 128 },
          ],
        }
      ].map((pet, index) => normalizePetRecord(pet, index));
    }

    function loadMyPetsFromStorage() {
      try {
        return JSON.parse(localStorage.getItem(MY_PETS_KEY)) || [];
      } catch {
        return [];
      }
    }

    function saveMyPetsToStorage(list) {
      localStorage.setItem(MY_PETS_KEY, JSON.stringify(list));
    }

    function emitMyPetsChanged() {
      document.dispatchEvent(new CustomEvent('myPetsChanged'));
    }

    function updateProfilePetManagerUI(pets = loadMyPetsFromStorage()) {
      const manager = document.getElementById('profile-pet-manager');
      if (!manager) return;
      manager.innerHTML = '';
      if (pets.length === 0) {
        manager.innerHTML = '<p class="text-gray-400 text-[11px]">No pets yet. Add one from the Pets tab.</p>';
        return;
      }
      pets.forEach(p => {
        const petId = escapeHtml(p.id);
        const petAvatar = escapeHtml(safeImageSrc(p.avatar, DEFAULT_PET_AVATAR));
        const petName = escapeHtml(p.name || 'Unnamed pet');
        const petType = escapeHtml(p.type || 'Pet');
        const petBreed = escapeHtml(p.breed || 'Unknown');
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between bg-secondary/40 px-2 py-2 rounded-sm';
        row.innerHTML = `
          <div class="flex items-center gap-2 min-w-0">
            <img src="${petAvatar}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-neutral" />
            <div class="min-w-0">
              <p class="font-semibold text-[11px] truncate">${petName}</p>
              <p class="text-[10px] text-gray-500 truncate">${petType} · ${petBreed}</p>
            </div>
          </div>
          <button class="text-[10px] text-red-500 hover:underline" data-profile-pet-delete="${petId}" type="button">
            Delete
          </button>
        `;
        manager.appendChild(row);
      });
        manager.querySelectorAll('[data-profile-pet-delete]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-profile-pet-delete');
            if (!id) return;
            if (!confirm('Delete this pet from your account?')) return;
            const pets = loadMyPetsFromStorage().filter(p => p.id !== id);
            saveMyPetsToStorage(pets);
            emitMyPetsChanged();
            updateProfilePetManagerUI(pets);
          });
        });
    }

    document.addEventListener('myPetsChanged', () => updateProfilePetManagerUI());

    const COMMUNITY_PETS = [
      {
        id: 'cp-1',
        name: 'Milk Tea',
        type: 'Shiba Inu',
        mood: 'Campus café regular, polite tail wags for everyone.',
        traits: ['Friendly', 'Latte guardian'],
        location: 'Whisker Bean Café terrace',
        photo: '/assets/4.png',
        ownerContact: 'c1'
      },
      {
        id: 'cp-2',
        name: 'Nebula',
        type: 'British Shorthair',
        mood: 'Sleeps on textbooks until she hears the can opener.',
        traits: ['Calm', 'Chubby paws'],
        location: 'Studio dorms · Block C',
        photo: '/assets/2.png',
        ownerContact: 'c3'
      },
      {
        id: 'cp-3',
        name: 'Rocket',
        type: 'Border Collie',
        mood: 'Practicing frisbee tricks before hackathon showcases.',
        traits: ['High energy', 'Trick nerd'],
        location: 'Central Lawn',
        photo: '/assets/5.png',
        ownerContact: 'c2'
      },
      {
        id: 'cp-4',
        name: 'Baozi',
        type: 'Bichon',
        mood: 'Wears matching sweaters with owner every Friday.',
        traits: ['Fashionable', 'Cuddly'],
        location: 'Tailwind Study Loft beanbags',
        photo: '/assets/6.png',
        ownerContact: 'c5'
      },
      {
        id: 'cp-5',
        name: 'Nova',
        type: 'Ragdoll',
        mood: 'Hosts silent study sessions on the library stairs.',
        traits: ['Graceful', 'Focus buddy'],
        location: 'Library Plaza cushions',
        photo: '/assets/3.png',
        ownerContact: 'c6'
      },
      {
        id: 'cp-6',
        name: 'Pudding',
        type: 'Corgi',
        mood: 'Collects compliments near Maple Bark Espresso every morning.',
        traits: ['Short legs, big heart'],
        location: 'Shuttle hub walkway',
        photo: '/assets/1.png',
        ownerContact: 'c7'
      }
    ];

    let healthMonitorInitialized = false;
    let rerenderHealthMonitor = null;

    function initHealthMonitor() {
      const petSelect = document.getElementById('health-pet-select');
      const latestTempEl = document.getElementById('health-latest-temp');
      const latestHeartEl = document.getElementById('health-latest-heart');
      const tempStatusEl = document.getElementById('health-temp-status');
      const heartStatusEl = document.getElementById('health-heart-status');
      const vitalsStateEl = document.getElementById('health-vitals-state');
      const vitalsSummaryEl = document.getElementById('health-vitals-summary');
      const historyCountEl = document.getElementById('health-history-count');
      const historyListEl = document.getElementById('health-history-list');
      const historyEmptyEl = document.getElementById('health-history-empty');
      const tempChartEl = document.getElementById('health-temp-chart');
      const tempBadgeEl = document.getElementById('health-temp-badge');
      const tempCaptionEl = document.getElementById('health-temp-caption');
      const tempMinEl = document.getElementById('health-temp-min');
      const tempAvgEl = document.getElementById('health-temp-avg');
      const tempMaxEl = document.getElementById('health-temp-max');
      const heartChartEl = document.getElementById('health-heart-chart');
      const heartBadgeEl = document.getElementById('health-heart-badge');
      const heartCaptionEl = document.getElementById('health-heart-caption');
      const heartMinEl = document.getElementById('health-heart-min');
      const heartAvgEl = document.getElementById('health-heart-avg');
      const heartMaxEl = document.getElementById('health-heart-max');
      const tempInput = document.getElementById('health-input-temp');
      const heartInput = document.getElementById('health-input-heart');
      const saveBtn = document.getElementById('health-save-reading');
      const demoBtn = document.getElementById('health-fill-demo');
      const formStatus = document.getElementById('health-form-status');
      if (!petSelect) return;

      function setFormStatus(message = '', isError = false) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.classList.toggle('hidden', !message);
        formStatus.classList.toggle('text-red-500', Boolean(message) && isError);
        formStatus.classList.toggle('text-primary', Boolean(message) && !isError);
      }

      function render() {
        const pets = getStoredPets();
        const previousSelection = petSelect.value;
        petSelect.innerHTML = '';
        if (!pets.length) {
          petSelect.innerHTML = '<option value="">No pets available</option>';
          if (latestTempEl) latestTempEl.textContent = '--';
          if (latestHeartEl) latestHeartEl.textContent = '--';
          if (tempStatusEl) tempStatusEl.textContent = 'Add a pet first';
          if (heartStatusEl) heartStatusEl.textContent = 'Add a pet first';
          if (vitalsStateEl) vitalsStateEl.textContent = 'Waiting';
          if (vitalsSummaryEl) vitalsSummaryEl.textContent = 'Create a pet in the Pets page to start health monitoring.';
          if (historyCountEl) historyCountEl.textContent = '0 records';
          if (historyListEl) historyListEl.innerHTML = '';
          updateTrendCard({ metric: 'temperature', history: [], chartEl: tempChartEl, badgeEl: tempBadgeEl, captionEl: tempCaptionEl, minEl: tempMinEl, avgEl: tempAvgEl, maxEl: tempMaxEl });
          updateTrendCard({ metric: 'heartRate', history: [], chartEl: heartChartEl, badgeEl: heartBadgeEl, captionEl: heartCaptionEl, minEl: heartMinEl, avgEl: heartAvgEl, maxEl: heartMaxEl });
          historyEmptyEl?.classList.remove('hidden');
          return;
        }
        pets.forEach((pet) => {
          const option = document.createElement('option');
          option.value = pet.id;
          option.textContent = `${pet.name} · ${pet.type}`;
          petSelect.appendChild(option);
        });
        petSelect.value = pets.some((pet) => pet.id === previousSelection) ? previousSelection : pets[0].id;
        const activePet = pets.find((pet) => pet.id === petSelect.value) || pets[0];
        const latestVitals = getLatestVitals(activePet);
        const assessment = getVitalsAssessment(latestVitals);
        if (latestTempEl) latestTempEl.textContent = assessment.tempLabel;
        if (latestHeartEl) latestHeartEl.textContent = assessment.heartLabel;
        if (tempStatusEl) tempStatusEl.textContent = latestVitals ? `Last update · ${formatReadingTimestamp(latestVitals.timestamp)}` : 'No reading yet';
        if (heartStatusEl) heartStatusEl.textContent = activePet.location ? `Tracking near ${activePet.location}` : 'Location not set';
        if (vitalsStateEl) vitalsStateEl.textContent = assessment.state;
        if (vitalsSummaryEl) vitalsSummaryEl.textContent = assessment.summary;
        const history = normalizeVitalsHistory(activePet.vitalsHistory);
        updateTrendCard({ metric: 'temperature', history, chartEl: tempChartEl, badgeEl: tempBadgeEl, captionEl: tempCaptionEl, minEl: tempMinEl, avgEl: tempAvgEl, maxEl: tempMaxEl });
        updateTrendCard({ metric: 'heartRate', history, chartEl: heartChartEl, badgeEl: heartBadgeEl, captionEl: heartCaptionEl, minEl: heartMinEl, avgEl: heartAvgEl, maxEl: heartMaxEl });
        if (historyCountEl) historyCountEl.textContent = `${history.length} records`;
        if (historyListEl) historyListEl.innerHTML = '';
        if (!history.length) {
          historyEmptyEl?.classList.remove('hidden');
          return;
        }
        historyEmptyEl?.classList.add('hidden');
        history.slice(0, 6).forEach((entry) => {
          const row = document.createElement('div');
          row.className = 'health-history-row';
          const petName = escapeHtml(activePet.name || 'Pet');
          const petLocation = escapeHtml(activePet.location || 'Campus');
          row.innerHTML = `
            <div class="health-history-row__meta">
              <p class="font-semibold text-dark">${formatReadingTimestamp(entry.timestamp)}</p>
              <p class="text-[10px] text-gray-500">${petName} · ${petLocation}</p>
            </div>
            <div class="health-history-row__stats">
              <span class="health-status-pill">Temp ${Number.isFinite(entry.temperature) ? `${entry.temperature.toFixed(1)}°C` : '--'}</span>
              <span class="health-status-pill">HR ${Number.isFinite(entry.heartRate) ? `${Math.round(entry.heartRate)} bpm` : '--'}</span>
            </div>
          `;
          historyListEl.appendChild(row);
        });
      }

      function saveReading(useDemo = false) {
        const pets = getStoredPets();
        const petId = petSelect.value;
        const selectedPet = pets.find((pet) => pet.id === petId);
        if (!selectedPet) {
          setFormStatus('Select a pet first.', true);
          return;
        }
        const nextTemperature = useDemo
          ? Number((38 + Math.random() * 1).toFixed(1))
          : (tempInput && tempInput.value.trim() !== '' ? Number(tempInput.value) : NaN);
        const nextHeartRate = useDemo
          ? Math.round(90 + Math.random() * 55)
          : (heartInput && heartInput.value.trim() !== '' ? Number(heartInput.value) : NaN);
        if (!Number.isFinite(nextTemperature) || !Number.isFinite(nextHeartRate)) {
          setFormStatus('Please enter both temperature and heart rate.', true);
          return;
        }
        const nextPets = pets.map((pet, index) => {
          if (pet.id !== petId) return normalizePetRecord(pet, index);
          return normalizePetRecord({
            ...pet,
            vitalsHistory: [
              {
                timestamp: new Date().toISOString(),
                temperature: nextTemperature,
                heartRate: nextHeartRate,
              },
              ...normalizeVitalsHistory(pet.vitalsHistory),
            ].slice(0, 12),
          }, index);
        });
        setStoredPets(nextPets);
        if (tempInput) tempInput.value = '';
        if (heartInput) heartInput.value = '';
        setFormStatus(`Saved a new reading for ${selectedPet.name}.`);
        render();
      }

      if (!healthMonitorInitialized) {
        healthMonitorInitialized = true;
        petSelect.addEventListener('change', () => {
          setFormStatus('');
          render();
        });
        saveBtn?.addEventListener('click', () => saveReading(false));
        demoBtn?.addEventListener('click', () => saveReading(true));
        document.addEventListener(PETS_CHANGED_EVENT, () => render());
      }
      rerenderHealthMonitor = render;
      render();
    }

    function initPets() {
      if (petsInitialized && rerenderPets) {
        rerenderPets();
        return;
      }
      petsInitialized = true;
      let pets = [];
      const petList = document.getElementById('pet-list');
      const petEmpty = document.getElementById('pet-empty');
      const profilePetCount = document.getElementById('profile-pet-count');
      const profileSidePetCount = document.getElementById('profile-side-pet-count');
      const btnAddPet = document.getElementById('btn-add-pet');
      const petForm = document.getElementById('pet-form');
      const btnClosePetForm = document.getElementById('btn-close-pet-form');
      const profilePetManager = document.getElementById('profile-pet-manager');
      const communityPetFeed = document.getElementById('community-pet-feed');
      let openPetId = null;
      const petFormHeading = document.getElementById('pet-form-heading');
      const petFormSubtitle = document.getElementById('pet-form-subtitle');
      const petFormSubmitLabel = document.getElementById('pet-form-submit-label');
      let editingPetId = null;
      const newPetInputs = {
        name: document.getElementById('new-pet-name'),
        type: document.getElementById('new-pet-type'),
        breed: document.getElementById('new-pet-breed'),
        birthday: document.getElementById('new-pet-birthday'),
        gender: document.getElementById('new-pet-gender'),
        status: document.getElementById('new-pet-status'),
        health: document.getElementById('new-pet-health'),
        location: document.getElementById('new-pet-location'),
        nfcContact: document.getElementById('new-pet-nfc-contact'),
        nfcNote: document.getElementById('new-pet-nfc-note'),
        traits: document.getElementById('new-pet-traits'),
        image: document.getElementById('new-pet-image'),
      };
      const petImagePreviewImg = document.getElementById('pet-image-preview-img');
      const petImagePlaceholder = document.getElementById('pet-image-placeholder');

      function setPetFormMode(mode = 'new') {
        if (mode === 'edit') {
          if (petFormHeading) petFormHeading.textContent = 'Edit pet';
          if (petFormSubtitle) petFormSubtitle.textContent = 'Update and save changes';
          if (petFormSubmitLabel) petFormSubmitLabel.textContent = 'Update pet';
          return;
        }
        if (petFormHeading) petFormHeading.textContent = 'Register a new pet';
        if (petFormSubtitle) petFormSubtitle.textContent = 'Ready when you need it';
        if (petFormSubmitLabel) petFormSubmitLabel.textContent = 'Save pet';
      }

      function resetPetFormState() {
        editingPetId = null;
        setPetFormMode('new');
        petForm?.reset();
        resetPetImagePreview();
      }

      function hydratePets() {
        const stored = getStoredPets();
        pets = stored && stored.length ? stored : defaultPets();
        setStoredPets(pets);
      }

      function resetPetImagePreview() {
        if (petImagePreviewImg) {
          petImagePreviewImg.src = '';
          petImagePreviewImg.classList.add('hidden');
        }
        petImagePlaceholder?.classList.remove('hidden');
        if (newPetInputs.image) {
          newPetInputs.image.value = '';
        }
      }

      function setPetImagePreview(src) {
        if (!petImagePreviewImg) return;
        petImagePreviewImg.src = src;
        petImagePreviewImg.classList.remove('hidden');
        petImagePlaceholder?.classList.add('hidden');
      }

      function loadPetIntoForm(pet) {
        if (!petForm) return;
        if (newPetInputs.image) newPetInputs.image.value = '';
        newPetInputs.name.value = pet.name || '';
        newPetInputs.type.value = pet.type || '';
        newPetInputs.breed.value = pet.breed || '';
        newPetInputs.birthday.value = pet.birthday || '';
        newPetInputs.gender.value = pet.gender || '';
        newPetInputs.status.value = pet.status || '';
        newPetInputs.health.value = pet.health || '';
        newPetInputs.location.value = pet.location || '';
        newPetInputs.nfcContact.value = pet.nfcContact || '';
        newPetInputs.nfcNote.value = pet.nfcNote || '';
        newPetInputs.traits.value = (pet.traits || []).join(', ');
        if (pet.avatar) setPetImagePreview(pet.avatar); else resetPetImagePreview();
        showPetForm();
      }

      function render() {
        if (!petList) return;
        petList.innerHTML = '';
        if (profilePetCount) profilePetCount.textContent = pets.length.toString();
        if (profileSidePetCount) profileSidePetCount.textContent = pets.length.toString();
        if (pets.length === 0) {
          petEmpty?.classList.remove('hidden');
          renderProfilePetList();
          return;
        }
        petEmpty?.classList.add('hidden');
        pets.forEach((p, idx) => {
          const latestVitals = getLatestVitals(p);
          const vitalsAssessment = getVitalsAssessment(latestVitals);
          const birthdayDisplay = p.birthday
            ? (() => {
                try {
                  return new Date(p.birthday).toLocaleDateString();
                } catch { return p.birthday; }
              })()
            : (p.age || 'Not set');
          const petAvatar = safeImageSrc(p.avatar, DEFAULT_PET_AVATAR);
          const petAvatarEsc = escapeHtml(petAvatar);
          const petId = escapeHtml(p.id);
          const petName = escapeHtml(p.name || 'Unnamed pet');
          const petType = escapeHtml(p.type || 'Pet');
          const petBreed = escapeHtml(p.breed || 'Unknown');
          const petBirthday = escapeHtml(birthdayDisplay);
          const petGender = escapeHtml(p.gender || 'Unknown');
          const petStatus = escapeHtml(p.status || 'No recent notes');
          const petLocation = escapeHtml(p.location || 'Campus map not set');
          const petHealth = escapeHtml(p.health || 'No health notes yet');
          const petNfcId = escapeHtml(p.nfcId || '');
          const petNfcContact = escapeHtml(p.nfcContact || 'Add an emergency contact');
          const petNfcNote = escapeHtml(p.nfcNote || 'No care note added yet.');
          const traitMarkup = (p.traits || [])
            .map(t => `<span class="px-2 py-0.5 rounded-full bg-secondary text-dark">${escapeHtml(t)}</span>`)
            .join('');
          const mobileLayout = window.innerWidth <= 768;
          const isOpen = openPetId ? openPetId === p.id : (!mobileLayout && idx === 0);
          if (!openPetId && !mobileLayout && idx === 0) openPetId = p.id;
          const card = document.createElement('div');
          card.className = 'pixel-card flex flex-col gap-2 animate-slideInLeft';
          card.style.animationDelay = (idx * 0.1) + 's';
          card.innerHTML = `
            <button class="w-full flex justify-between items-center text-left" data-pet-toggle="${petId}">
              <div class="flex items-center gap-3">
                <img src="${petAvatarEsc}" alt="${petName}" loading="lazy" decoding="async" class="w-12 h-12 rounded-full object-cover pixel-border bg-secondary" />
                <div>
                  <p class="font-semibold text-sm">${petName}</p>
                  <p class="text-[11px] text-gray-500">${petType} · ${petBreed}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-gray-500">
                <span class="text-[10px]">${petBirthday}</span>
                <i class="fas fa-chevron-${isOpen ? 'up' : 'down'}"></i>
              </div>
            </button>
            <div class="${isOpen ? '' : 'hidden'} space-y-2 pt-2 border-t border-white/60">
              <div class="flex gap-3">
                <img src="${petAvatarEsc}" alt="${petName}" loading="lazy" decoding="async" class="w-16 h-16 rounded-full object-cover pixel-border bg-secondary" />
                <div class="space-y-1 text-[11px]">
                  <p><span class="font-semibold">Type:</span> ${petType}</p>
                  <p><span class="font-semibold">Breed:</span> ${petBreed}</p>
                  <p><span class="font-semibold">Birthday:</span> ${petBirthday}</p>
                  <p><span class="font-semibold">Gender:</span> ${petGender}</p>
                </div>
              </div>
              <div>
                <p class="font-semibold text-[11px]">Status</p>
                <p class="text-[11px] text-gray-600">${petStatus}</p>
              </div>
              <div class="grid md:grid-cols-2 gap-3">
                <div>
                  <p class="font-semibold text-[11px]">Location</p>
                  <p class="text-[11px] text-gray-600">${petLocation}</p>
                </div>
                <div>
                  <p class="font-semibold text-[11px]">Latest vitals</p>
                  <div class="pet-vitals-mini">
                    <span class="health-status-pill">${vitalsAssessment.tempLabel}</span>
                    <span class="health-status-pill">${vitalsAssessment.heartLabel}</span>
                  </div>
                  <p class="text-[10px] text-gray-500 mt-1">${vitalsAssessment.state}</p>
                </div>
              </div>
              <div>
                <p class="font-semibold text-[11px]">Personality</p>
                <div class="flex flex-wrap gap-1">
                  ${traitMarkup}
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-[11px]">Health</p>
                  <p class="text-[11px] text-gray-600">${petHealth}</p>
                </div>
                <button data-id="${petId}" class="pet-edit text-primary text-[12px] hover:underline flex items-center gap-1"><i class="fas fa-edit"></i>Edit</button>
              </div>
              <div class="pet-nfc-card">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-500">NFC Pet Card</p>
                    <p class="font-semibold text-sm text-dark">${petName}</p>
                  </div>
                  <span class="pet-nfc-card__code">${petNfcId}</span>
                </div>
                <div class="space-y-1 text-[11px] text-gray-700">
                  <p><span class="font-semibold">Emergency:</span> ${petNfcContact}</p>
                  <p><span class="font-semibold">Care note:</span> ${petNfcNote}</p>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <button type="button" class="pet-action-link" data-copy-nfc="${petId}">
                    <i class="fas fa-id-card"></i><span>Copy NFC Card</span>
                  </button>
                  <button type="button" class="pet-action-link" data-open-map="${petId}">
                    <i class="fas fa-location-arrow"></i><span>Locate on Map</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        petList.appendChild(card);
      });
        petList.querySelectorAll('.pet-edit').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const petIndex = pets.findIndex(p => p.id === id);
            if (petIndex === -1) return;
            editingPetId = id;
            setPetFormMode('edit');
            loadPetIntoForm(pets[petIndex]);
          });
        });
        petList.querySelectorAll('[data-pet-toggle]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-pet-toggle');
            if (!id) return;
            openPetId = id;
            render();
          });
        });
        petList.querySelectorAll('[data-copy-nfc]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-copy-nfc');
            const pet = pets.find((entry) => entry.id === id);
            if (!pet) return;
            const cardText = [
              `PawTrace NFC Card · ${pet.name}`,
              `NFC ID: ${pet.nfcId}`,
              `Type: ${pet.type} · ${pet.breed}`,
              `Location: ${pet.location || 'Campus'}`,
              `Emergency: ${pet.nfcContact || 'Not set'}`,
              `Care note: ${pet.nfcNote || 'None'}`,
            ].join('\n');
            try {
              await navigator.clipboard.writeText(cardText);
              alert(`Copied ${pet.name}'s NFC card.`);
            } catch (err) {
              console.warn('Clipboard copy failed', err);
              alert(cardText);
            }
          });
        });
        petList.querySelectorAll('[data-open-map]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-open-map');
            if (!id) return;
            window.focusPetOnMap?.(id);
          });
        });
        renderProfilePetList();
      }

      function renderProfilePetList() {
        if (!profilePetManager) return;
        profilePetManager.innerHTML = '';
        if (pets.length === 0) {
          profilePetManager.innerHTML = '<p class="text-gray-400 text-[11px]">No pets yet. Add one from the Pets tab.</p>';
          return;
        }
        pets.forEach(p => {
          const petId = escapeHtml(p.id);
          const petAvatar = escapeHtml(safeImageSrc(p.avatar, DEFAULT_PET_AVATAR));
          const petName = escapeHtml(p.name || 'Unnamed pet');
          const petType = escapeHtml(p.type || 'Pet');
          const petBreed = escapeHtml(p.breed || 'Unknown');
          const row = document.createElement('div');
          row.className = 'flex items-center justify-between bg-secondary/40 px-2 py-2 rounded-sm';
          row.innerHTML = `
            <div class="flex items-center gap-2 min-w-0">
              <img src="${petAvatar}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-neutral" />
              <div class="min-w-0">
                <p class="font-semibold text-[11px] truncate">${petName}</p>
                <p class="text-[10px] text-gray-500 truncate">${petType} · ${petBreed}</p>
              </div>
            </div>
            <button class="text-[10px] text-red-500 hover:underline" data-profile-pet-delete="${petId}" type="button">
              Delete
            </button>
          `;
          profilePetManager.appendChild(row);
        });
        profilePetManager.querySelectorAll('[data-profile-pet-delete]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-profile-pet-delete');
            if (!id) return;
            if (!confirm('Delete this pet from your account?')) return;
            pets = pets.filter(p => p.id !== id);
            setStoredPets(pets);
            render();
          });
        });
      }

      function renderCommunityPets() {
        if (!communityPetFeed) return;
        communityPetFeed.innerHTML = '';
        COMMUNITY_PETS.forEach((pet, idx) => {
          const petPhoto = escapeHtml(safeImageSrc(pet.photo, DEFAULT_PET_AVATAR));
          const petName = escapeHtml(pet.name || 'Community pet');
          const petType = escapeHtml(pet.type || 'Pet');
          const petMood = escapeHtml(pet.mood || '');
          const petLocation = escapeHtml(pet.location || '');
          const ownerContact = escapeHtml(pet.ownerContact || '');
          const traitsMarkup = (pet.traits || [])
            .map(tag => `<span class="px-2 py-0.5 rounded-full bg-secondary/60">${escapeHtml(tag)}</span>`)
            .join('');
          const card = document.createElement('div');
          card.className = 'pixel-card flex flex-col gap-2 animate-slideIn';
          card.style.animationDelay = (idx * 0.05) + 's';
          card.innerHTML = `
            <div class="relative">
              <img src="${petPhoto}" alt="${petName}" loading="lazy" decoding="async" class="community-cover w-full object-cover rounded-sm pixel-border" />
              <span class="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">Community</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-sm">${petName}</p>
                <p class="text-[11px] text-gray-600">${petType}</p>
              </div>
              <button class="text-[10px] text-primary underline" data-community-contact="${ownerContact}">
                Message owner
              </button>
            </div>
            <p class="text-[11px] text-gray-600">${petMood}</p>
            <p class="text-[10px] text-gray-500"><i class="fas fa-map-marker-alt text-primary mr-1"></i>${petLocation}</p>
            <div class="flex flex-wrap gap-1 text-[10px]">
              ${traitsMarkup}
            </div>
          `;
          communityPetFeed.appendChild(card);
        });
        communityPetFeed.querySelectorAll('[data-community-contact]').forEach(btn => {
          btn.addEventListener('click', () => {
            const ownerId = btn.getAttribute('data-community-contact');
            if (ownerId) {
              openFriendInChat(ownerId);
            }
          });
        });
      }

      hydratePets();
      render();
      renderCommunityPets();
      rerenderPets = () => {
        hydratePets();
        if (!pets.some((pet) => pet.id === openPetId)) {
          openPetId = pets[0]?.id || null;
        }
        render();
        renderCommunityPets();
      };

      newPetInputs.image?.addEventListener('change', () => {
        const file = newPetInputs.image.files && newPetInputs.image.files[0];
        if (!file) {
          resetPetImagePreview();
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an image under 5MB.');
          newPetInputs.image.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setPetImagePreview(event.target?.result);
        };
        reader.onerror = () => resetPetImagePreview();
        reader.readAsDataURL(file);
      });

      function showPetForm() {
        if (!petForm) return;
        petForm.classList.remove('hidden');
        petForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      function hidePetForm() {
        petForm?.classList.add('hidden');
        resetPetFormState();
      }

      btnAddPet?.addEventListener('click', () => {
        resetPetFormState();
        showPetForm();
      });
      btnClosePetForm?.addEventListener('click', hidePetForm);

      if (petForm) {
        petForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = newPetInputs.name.value.trim();
          if (!name) return;
          const file = newPetInputs.image?.files && newPetInputs.image.files[0];
          const isEdit = Boolean(editingPetId);
          const existingPet = isEdit ? pets.find(p => p.id === editingPetId) : null;
          let avatar = existingPet?.avatar || DEFAULT_PET_AVATAR;
          if (file) {
            try {
              avatar = await fileToDataURL(file);
            } catch (err) {
              console.warn('Image load failed', err);
            }
          }
          const traits = (newPetInputs.traits.value || '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
          const birthdayValue = newPetInputs.birthday?.value || '';
          const birthdayLabel = birthdayValue
            ? (() => {
                try {
                  return new Date(birthdayValue).toLocaleDateString();
                } catch { return birthdayValue; }
              })()
            : '';
          const updatedPet = {
            ...(existingPet || {}),
            id: existingPet?.id || `pet-${Date.now()}`,
            name,
            type: newPetInputs.type.value.trim() || 'Pet',
            breed: newPetInputs.breed.value.trim() || 'Unknown',
            age: birthdayLabel,
            birthday: birthdayValue,
            gender: newPetInputs.gender.value.trim() || 'Unknown',
            avatar,
            traits: traits.length ? traits : ['Playful'],
            status: newPetInputs.status.value.trim() || 'Just joined the crew.',
            health: newPetInputs.health.value.trim() || 'No health notes yet.',
            location: newPetInputs.location.value.trim() || existingPet?.location || getDefaultTrackedZone(pets.length).label,
            nfcContact: newPetInputs.nfcContact.value.trim() || existingPet?.nfcContact || getCurrentUser()?.contact || '',
            nfcNote: newPetInputs.nfcNote.value.trim() || existingPet?.nfcNote || `${name} is friendly. Please contact the owner if found.`,
            mapCoords: existingPet?.mapCoords || getDefaultTrackedZone(pets.length).coords,
            vitalsHistory: existingPet?.vitalsHistory || createStarterVitals(existingPet || { name, type: newPetInputs.type.value.trim() || 'Pet' }, pets.length),
          };

          if (isEdit && existingPet) {
            pets = pets.map(p => p.id === existingPet.id ? updatedPet : p);
          } else {
            pets.push(updatedPet);
          }
          setStoredPets(pets);
          render();
          resetPetFormState();
          hidePetForm();
          const currentUser = getCurrentUser();
          sendMonitoringPayload({
            personalInfo: {
              username: currentUser?.username,
              displayName: currentUser?.displayName,
              campus: currentUser?.campus
            },
            pets: [sanitizePetForPayload(updatedPet)],
            metadata: { source: isEdit ? 'pet-edit' : 'pet-add' }
          });
        });
        petForm.addEventListener('reset', () => {
          hidePetForm();
        });
      }
    }

    function computeStarSign(dateStr) {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length < 3) return '';
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!month || !day) return '';
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
      if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
      return 'Capricorn';
    }

    // --- Chat assistant integration ---
    let CHAT_STATE = {
      contacts: [
        {
          id: 'c1',
          name: 'Lily (Team Lead)',
          avatar: '/assets/avatars/文件1.png',
          petName: 'Mocha',
          petType: 'Corgi',
          petBreed: 'Welsh Corgi',
          petAge: '2 years',
          petHealth: 'Healthy and active',
          petTraits: ['Loves fetch', 'Calm with kids'],
          petNotes: 'Mocha prefers short walks and lots of belly rubs.',
          lastPreview: 'Want to walk in the central lawn tomorrow?',
        },
        {
          id: 'c2',
          name: 'Eric (Developer)',
          avatar: '/assets/avatars/文件2.png',
          petName: 'Pixel',
          petType: 'Border Collie',
          petBreed: 'Border Collie',
          petAge: '3 years',
          petHealth: 'Excellent, very active',
          petTraits: ['Agile', 'Mega fetch energy'],
          petNotes: 'Pixel thrives on new tricks and chasing frisbees.',
          lastPreview: 'Pixel learned a new trick!',
        },
        {
          id: 'c3',
          name: 'Mia (Designer)',
          avatar: '/assets/avatars/文件3.png',
          petName: 'Mochi',
          petType: 'Cat',
          petBreed: 'Ragdoll',
          petAge: '1 year',
          petHealth: 'Indoor cat, perfect health',
          petTraits: ['Curious', 'Sun-loving'],
          petNotes: 'Mochi usually naps near windows and loves gentle chin scratches.',
          lastPreview: 'Any vet recommendations near campus?',
        },
        {
          id: 'c4',
          name: 'Leo (Product Manager)',
          avatar: '/assets/avatars/文件4.png',
          petName: 'Kiko',
          petType: 'Husky',
          petBreed: 'Siberian Husky',
          petAge: '4 years',
          petHealth: 'Strong and energetic',
          petTraits: ['Pack leader', 'Snow lover'],
          petNotes: 'Kiko is happiest after a long run and enjoys meeting new friends.',
          lastPreview: 'Planning a weekend dog meetup.',
        },
        {
          id: 'c5',
          name: 'Zoe (Maker)',
          avatar: '/assets/avatars/文件5.png',
          petName: 'Baozi',
          petType: 'Bichon',
          petBreed: 'Bichon Frisé',
          petAge: '3 years',
          petHealth: 'Weekly grooming, sensitive skin',
          petTraits: ['Fashion lover', 'Cuddly'],
          petNotes: 'Baozi has a wardrobe that rivals roommates. Prefers short walks and café patios.',
          lastPreview: 'Matching sweaters arrived today!',
        },
        {
          id: 'c6',
          name: 'Iris (Art Student)',
          avatar: '/assets/avatars/文件6.png',
          petName: 'Nova',
          petType: 'Cat',
          petBreed: 'Ragdoll',
          petAge: '2 years',
          petHealth: 'Indoor, loves brushing sessions',
          petTraits: ['Graceful', 'Focus buddy'],
          petNotes: 'Nova supervises late-night studio projects and naps on sketchbooks.',
          lastPreview: 'Nova claimed the new tote bag.',
        },
        {
          id: 'c7',
          name: 'Aaron (Volunteer)',
          avatar: '/assets/avatars/文件7.png',
          petName: 'Pudding',
          petType: 'Corgi',
          petBreed: 'Pembroke Corgi',
          petAge: '5 years',
          petHealth: 'Healthy, weekly jogs',
          petTraits: ['Short legs', 'Greets everyone'],
          petNotes: 'Pudding guards the Maple Bark espresso window and enjoys belly rub tips.',
          lastPreview: 'Met so many students this morning!',
        },
      ],
      history: {},
      activeId: null,
    };

    const LOCAL_CHAT_REPLIES = [
      'Okay, I understand!',
      'That’s great!',
      'Let’s meet this weekend!',
      'My pet loves this activity too.',
      'Thanks for letting me know.',
      'Sounds good!',
    ];
    const LOCAL_PET_SUMMARIES = [
      (contact) => `${contact.petName} is a ${contact.petAge} ${contact.petBreed}. ${contact.petNotes || ''}`,
      (contact) => {
        const health = contact.petHealth ? contact.petHealth.toLowerCase() : 'doing well recently.';
        return `${contact.petName} has been ${health}`;
      },
      (contact) => `${contact.petName} loves ${(contact.petTraits && contact.petTraits[0]) || 'play time'} lately.`,
    ];

    function buildContactProfile(contact) {
      if (!contact) return '';
      const traitLine = (contact.petTraits && contact.petTraits.length)
        ? `Pet traits: ${contact.petTraits.join(', ')}`
        : '';
      return [
        `Contact name: ${contact.name}`,
        `Pet: ${contact.petName} (${contact.petType}, ${contact.petBreed})`,
        `Pet age: ${contact.petAge}`,
        `Pet health: ${contact.petHealth}`,
        traitLine,
        contact.petNotes ? `Notes: ${contact.petNotes}` : ''
      ].filter(Boolean).join('\n');
    }

    async function requestAssistantResponse(payload = {}) {
      const { type, contact, contactId, messages = [], fallback } = payload;
      if (type === 'owner-pet-summary' && contact) {
        const generator = LOCAL_PET_SUMMARIES[Math.floor(Math.random() * LOCAL_PET_SUMMARIES.length)];
        return (generator ? generator(contact) : fallback) || 'Pet update coming soon.';
      }
      if (!contactId) return fallback || 'Message received.';
      const sanitizedHistory = messages
        .slice(-12)
        .map(m => {
          let content = (m.content || '').trim();
          if (m.media?.type === 'image') {
            const note = `Shared image: ${m.media.src}`;
            content = content ? `${content}\n${note}` : note;
          }
          return {
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content
          };
        })
        .filter(m => m.content);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId,
            contactProfile: buildContactProfile(contact),
            messages: sanitizedHistory
          })
        });
        if (!response.ok) throw new Error('AI request failed');
        const data = await response.json();
        if (!data.reply) throw new Error('Empty reply');
        return data.reply.trim();
      } catch (error) {
        console.warn('Assistant bridge failed', error);
        const fallbackReply = LOCAL_CHAT_REPLIES[Math.floor(Math.random() * LOCAL_CHAT_REPLIES.length)];
        return fallbackReply || fallback || 'Message received.';
      }
    }

    function initChat() {
      if (chatInitialized && rerenderChat) {
        rerenderChat();
        return;
      }
      chatInitialized = true;
      const listEl = document.getElementById('contact-list');
      const searchEl = document.getElementById('chat-search');
      const chatAvatar = document.getElementById('chat-avatar');
      const chatName = document.getElementById('chat-name');
      const chatPetTag = document.getElementById('chat-pet-tag');
      const chatStatus = document.getElementById('chat-status');
      const chatMessages = document.getElementById('chat-messages');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatError = document.getElementById('chat-error');
      const chatPane = document.getElementById('chat-left-pane');
      const chatToggle = document.getElementById('chat-toggle-contacts');
      const shareImageUrlInput = document.getElementById('share-image-url');
      const shareImageCaption = document.getElementById('share-image-caption');
      const sharePreviewWrapper = document.getElementById('share-image-preview');
      const sharePreviewImg = document.getElementById('share-preview-img');
      const shareImageFileInput = document.getElementById('share-image-file');
      const chatPetInfoPlaceholder = document.getElementById('chat-pet-info-placeholder');
      const chatPetDetails = document.getElementById('chat-pet-details');
      const chatPetName = document.getElementById('chat-pet-name');
      const chatPetSummary = document.getElementById('chat-pet-summary');
      const chatPetBreed = document.getElementById('chat-pet-breed');
      const chatPetAge = document.getElementById('chat-pet-age');
      const chatPetHealth = document.getElementById('chat-pet-health');
      const chatPetTraits = document.getElementById('chat-pet-traits');
      const profileFriendsCount = document.getElementById('profile-friends-count');
      const profileSideFriendCount = document.getElementById('profile-side-friend-count');
      const chatScrollUp = document.getElementById('chat-scroll-up');
      const chatScrollDown = document.getElementById('chat-scroll-down');
      if (!chatHoverCard) {
        chatHoverCard = document.createElement('div');
        chatHoverCard.className = 'contact-hover-card';
        chatHoverCard.innerHTML = `
          <div class="flex items-center gap-2 mb-2">
            <img id="hover-avatar" class="w-9 h-9 rounded-full object-cover pixel-border bg-secondary" alt="Avatar preview" />
            <div>
              <h4 id="hover-name">Friend</h4>
              <p id="hover-pet-tag" class="text-[11px] text-gray-500">Pet info</p>
            </div>
          </div>
          <p id="hover-summary" class="mb-1 text-[12px] text-gray-600"></p>
          <p id="hover-health" class="text-[11px] text-gray-500"></p>
          <div id="hover-tags" class="contact-hover-tags"></div>
        `;
        document.body.appendChild(chatHoverCard);
      }
      const hoverCard = chatHoverCard;

      if (profileFriendsCount) profileFriendsCount.textContent = CHAT_STATE.contacts.length;
      if (profileSideFriendCount) profileSideFriendCount.textContent = CHAT_STATE.contacts.length;

      const getActiveContact = () => CHAT_STATE.contacts.find(c => c.id === CHAT_STATE.activeId);
      const ensureActiveContact = () => {
        let contact = getActiveContact();
        if (!contact && CHAT_STATE.contacts[0]) {
          activateContact(CHAT_STATE.contacts[0].id);
          contact = CHAT_STATE.contacts[0];
        }
        return contact;
      };
      const focusChatInput = () => {
        if (!chatInput) return;
        chatInput.focus();
        chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      const switchToChatTab = () => document.querySelector('[data-tab="chat"]')?.click();

      function renderContacts(filter = '') {
        if (!listEl) return;
        listEl.innerHTML = '';
        const filteredContacts = CHAT_STATE.contacts
          .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
        if (!filteredContacts.length) {
          listEl.innerHTML = '<div class="chat-empty-state">No friends matched that search yet.</div>';
          return;
        }
        filteredContacts.forEach((c, idx) => {
          const item = document.createElement('button');
          item.className = `chat-contact-item w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors animate-slideInLeft ${c.id === CHAT_STATE.activeId ? 'active' : ''}`;
          item.style.animationDelay = (idx * 0.05) + 's';
          item.dataset.id = c.id;
          item.dataset.contactId = c.id;
          const avatar = escapeHtml(safeImageSrc(c.avatar, DEFAULT_PET_AVATAR));
          const name = escapeHtml(c.name || 'Friend');
          const preview = escapeHtml(c.lastPreview || '');
          item.innerHTML = `
              <img src="${avatar}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-secondary" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-xs truncate">${name}</p>
                <p class="text-[11px] text-gray-600 truncate">${preview}</p>
              </div>
            `;
            const showHover = (event) => {
              const rect = item.getBoundingClientRect();
              const data = c;
              const avatarEl = hoverCard.querySelector('#hover-avatar');
              const nameEl = hoverCard.querySelector('#hover-name');
              const petTagEl = hoverCard.querySelector('#hover-pet-tag');
              const summaryEl = hoverCard.querySelector('#hover-summary');
              const healthEl = hoverCard.querySelector('#hover-health');
              const tagsEl = hoverCard.querySelector('#hover-tags');
              if (avatarEl) avatarEl.src = data.avatar;
              if (nameEl) nameEl.textContent = data.name || 'Friend';
              if (petTagEl) petTagEl.textContent = `${data.petName || 'Pet'} · ${data.petType || ''}`.trim() || 'Pet info';
              if (summaryEl) summaryEl.textContent = data.petNotes || data.lastPreview || '';
              if (healthEl) healthEl.textContent = data.petHealth ? `Health: ${data.petHealth}` : '';
              if (tagsEl) {
                const tags = data.petTraits || [];
                tagsEl.innerHTML = tags.map(t => `<span>${escapeHtml(t)}</span>`).join('');
              }
              hoverCard.style.top = `${rect.top + window.scrollY + rect.height + 8}px`;
              hoverCard.style.left = `${Math.min(window.innerWidth - 260, rect.left + window.scrollX + 10)}px`;
              hoverCard.classList.add('show');
            };
            const hideHover = () => hoverCard.classList.remove('show');
            item.addEventListener('mouseenter', showHover);
            item.addEventListener('mouseleave', hideHover);
            item.addEventListener('click', () => activateContact(c.id));
            listEl.appendChild(item);
          });
      }

      function renderHistory(contactId) {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        const history = CHAT_STATE.history[contactId] || [];
        history.forEach(msg => appendMessageBubble(msg, contactId, false));
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      function appendMessageBubble(message, contactId, scroll = true) {
        if (!message || !chatMessages) return;
        const role = message.role;
        const content = message.content || '';
        const media = message.media;
        const isUser = role === 'user';
        const safeContent = escapeHtml(content);
        const wrapper = document.createElement('div');
        wrapper.className = `flex items-end gap-2 ${isUser ? 'justify-end' : ''} animate-slideInLeft bubble-entry bubble-bounce`;
        const bubble = document.createElement('div');
        bubble.className = `px-3 py-2 max-w-[70%] ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-secondary text-dark rounded-bl-none'}`;
        if (media?.type === 'image') {
          bubble.className += ' bubble-image';
          const mediaSrc = escapeHtml(safeImageSrc(media.src, ''));
          bubble.innerHTML = `
            <img src="${mediaSrc}" class="w-full h-auto object-cover rounded-sm border-2 border-dark mb-1" />
            ${safeContent ? `<p class="text-[11px]">${safeContent}</p>` : ''}
          `;
        } else {
          bubble.innerHTML = `<p class="text-[11px]">${safeContent}</p>`;
        }
        const avatar = document.createElement('img');
        const contact = CHAT_STATE.contacts.find(x => x.id === contactId);
        avatar.loading = 'lazy';
        avatar.decoding = 'async';
        avatar.src = isUser
          ? (document.getElementById('current-user-avatar')?.src || '')
          : (contact?.avatar || '');
        avatar.className = 'w-7 h-7 rounded-full object-cover pixel-border bg-secondary';
        if (isUser) {
          wrapper.appendChild(bubble);
          wrapper.appendChild(avatar);
        } else {
          wrapper.appendChild(avatar);
          wrapper.appendChild(bubble);
        }
        chatMessages.appendChild(wrapper);
        if (scroll) chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      const updateOwnerPetPanel = async (contact) => {
        if (!contact) return;
        chatPetInfoPlaceholder?.classList.add('hidden');
        chatPetDetails?.classList.remove('hidden');
        if (chatPetName) chatPetName.textContent = `${contact.petName} · ${contact.petType}`;
        if (chatPetBreed) chatPetBreed.textContent = contact.petBreed;
        if (chatPetAge) chatPetAge.textContent = contact.petAge;
        if (chatPetHealth) chatPetHealth.textContent = contact.petHealth;
        if (chatPetTraits) {
          chatPetTraits.innerHTML = (contact.petTraits || []).length
            ? contact.petTraits.map(t => `<span class="px-2 py-0.5 rounded-full bg-secondary text-dark">${escapeHtml(t)}</span>`).join('')
            : '<span class="text-gray-400">No traits added yet</span>';
        }
        if (chatPetSummary) {
          chatPetSummary.textContent = 'Gathering a quick update...';
          const fallback = `${contact.petName} is a ${contact.petAge} ${contact.petBreed}. ${contact.petNotes || ''}`;
          const summary = await requestAssistantResponse({
            type: 'owner-pet-summary',
            contactId: contact.id,
            contact,
            fallback
          });
          chatPetSummary.textContent = summary;
        }
      };

      const handleAssistantReply = async (contact, contactId, fallback) => {
        if (!contact) return;
        if (chatStatus) chatStatus.textContent = 'Thinking...';
        const history = CHAT_STATE.history[contactId] || [];
        const reply = await requestAssistantResponse({
          type: 'conversation',
          contactId,
          contact,
          messages: history,
          fallback
        });
        const assistantMessage = { role: 'assistant', content: reply };
        history.push(assistantMessage);
        CHAT_STATE.history[contactId] = history;
        appendMessageBubble(assistantMessage, contactId);
        if (chatStatus) chatStatus.textContent = `Online · ${contact.petType} owner`;
      };

      function activateContact(id) {
        CHAT_STATE.activeId = id;
        const c = CHAT_STATE.contacts.find(x => x.id === id);
        if (!c) return;
        if (window.innerWidth <= 1024 && chatPane && chatPane.classList.contains('open')) {
          chatPane.classList.remove('open');
          if (chatToggle) chatToggle.textContent = 'Show friends';
        }
        if (chatAvatar) chatAvatar.src = c.avatar;
        if (chatName) chatName.textContent = c.name;
        if (chatPetTag) {
          chatPetTag.textContent = c.petName + ' · ' + c.petType;
          chatPetTag.classList.remove('hidden');
        }
        if (chatStatus) chatStatus.textContent = 'Online · ' + c.petType + ' owner';
        updateOwnerPetPanel(c);
        renderContacts(searchEl?.value || '');
        if (!CHAT_STATE.history[id]) {
          CHAT_STATE.history[id] = [
            { role: 'assistant', content: `Hi! I'm ${c.name} and this is ${c.petName}.` }
          ];
        }
        renderHistory(id);
      }

      async function sendMessage() {
        if (!chatInput) return;
        chatError.textContent = '';
        const text = chatInput.value.trim();
        const contact = getActiveContact();
        if (!contact) {
          chatError.textContent = 'Select a friend first.';
          return;
        }
        if (!text) return;
        const history = CHAT_STATE.history[contact.id] || [];
        const userMessage = { role: 'user', content: text };
        history.push(userMessage);
        CHAT_STATE.history[contact.id] = history;
        appendMessageBubble(userMessage, contact.id);
        chatInput.value = '';
        await handleAssistantReply(contact, contact.id, `Thanks for the update on ${contact.petName}.`);
      }

      async function sendImageMessage() {
        const contact = getActiveContact();
        if (!contact) {
          alert('Select a friend first.');
          return;
        }
        const caption = shareImageCaption?.value.trim();
        const resolvedSource = shareImageSource || shareImageUrlInput?.value.trim();
        if (!resolvedSource) {
          alert('Please paste an image URL or upload a file.');
          return;
        }
        const history = CHAT_STATE.history[contact.id] || [];
        const imageMessage = {
          role: 'user',
          content: caption || 'Shared a photo',
          media: { type: 'image', src: resolvedSource }
        };
        history.push(imageMessage);
        CHAT_STATE.history[contact.id] = history;
        appendMessageBubble(imageMessage, contact.id);
        closeShareImageModal();
        await handleAssistantReply(contact, contact.id, `${contact.petName} got a new photo!`);
      }

      renderContacts();

      chatScrollUp?.addEventListener('click', () => {
        if (!chatMessages) return;
        chatMessages.scrollBy({ top: -160, behavior: 'smooth' });
      });
      chatScrollDown?.addEventListener('click', () => {
        if (!chatMessages) return;
        chatMessages.scrollBy({ top: 160, behavior: 'smooth' });
      });

      searchEl?.addEventListener('input', () => {
        renderContacts(searchEl.value);
      });
      document.addEventListener('click', (event) => {
        if (window.innerWidth > 1024) return;
        if (!chatPane?.classList.contains('open')) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (chatPane.contains(target) || target.closest('#chat-toggle-contacts') || target.closest('#chat-back-btn')) return;
        chatPane.classList.remove('open');
        if (chatToggle) chatToggle.textContent = 'Show friends';
      });
      const chatAttachImage = document.getElementById('chat-attach-image');
      chatAttachImage?.addEventListener('click', () => {
        openShareImageModal();
      });
      chatSend?.addEventListener('click', sendMessage);
      chatInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      if (shareImageUrlInput && sharePreviewImg) {
        shareImageUrlInput.addEventListener('input', () => {
          const url = shareImageUrlInput.value.trim();
          if (!url) {
            if (!shareImageIsUpload) {
              shareImageSource = '';
              sharePreviewWrapper?.classList.add('hidden');
              sharePreviewImg.src = '';
            }
          } else {
            shareImageSource = url;
            shareImageIsUpload = false;
            if (shareImageFileInput) shareImageFileInput.value = '';
            sharePreviewImg.src = url;
            sharePreviewWrapper?.classList.remove('hidden');
          }
        });
      }
      shareImageFileInput?.addEventListener('change', async () => {
        const file = shareImageFileInput.files && shareImageFileInput.files[0];
        if (!file) {
          shareImageIsUpload = false;
          shareImageSource = shareImageUrlInput?.value.trim() || '';
          if (!shareImageSource) {
            sharePreviewImg.src = '';
            sharePreviewWrapper?.classList.add('hidden');
          }
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an image under 5MB.');
          shareImageFileInput.value = '';
          return;
        }
        try {
          const data = await fileToDataURL(file);
          shareImageSource = data;
          shareImageIsUpload = true;
          if (shareImageUrlInput) shareImageUrlInput.value = '';
          sharePreviewImg.src = data;
          sharePreviewWrapper?.classList.remove('hidden');
        } catch (err) {
          console.warn('Image upload failed', err);
          alert('Unable to load that image.');
          shareImageFileInput.value = '';
          shareImageSource = '';
          shareImageIsUpload = false;
        }
      });

      const btnSendImage = document.getElementById('btn-send-image');
      if (btnSendImage) {
        btnSendImage.addEventListener('click', sendImageMessage);
      }

      if (CHAT_STATE.contacts[0]) {
        activateContact(CHAT_STATE.contacts[0].id);
      }
      rerenderChat = () => {
        if (profileFriendsCount) profileFriendsCount.textContent = CHAT_STATE.contacts.length;
        if (profileSideFriendCount) profileSideFriendCount.textContent = CHAT_STATE.contacts.length;
        renderContacts(searchEl?.value || '');
        const nextId = CHAT_STATE.contacts.some((contact) => contact.id === CHAT_STATE.activeId)
          ? CHAT_STATE.activeId
          : CHAT_STATE.contacts[0]?.id;
        if (nextId) {
          activateContact(nextId);
        }
      };

      window.openFriendInChat = (friendId) => {
        switchToChatTab();
        setTimeout(() => {
          if (searchEl) searchEl.value = '';
          renderContacts();
          activateContact(friendId);
          focusChatInput();
        }, 80);
      };

      window.scrollToChatTab = () => {
        if (CHAT_STATE.contacts[0]) {
          window.openFriendInChat(CHAT_STATE.contacts[0].id);
        } else {
          switchToChatTab();
          focusChatInput();
        }
      };

      // ========== PET CHECK-IN SYSTEM ==========
      function initPetCheckIn() {
        if (petCheckInInitialized) return;
        petCheckInInitialized = true;
        const checkInBtn = document.getElementById('btn-pet-checkin');
        if (!checkInBtn) return;

        function getCheckInData() {
          const data = localStorage.getItem('pawtrace_checkins');
          return data ? JSON.parse(data) : {};
        }

        function saveCheckInData(data) {
          localStorage.setItem('pawtrace_checkins', JSON.stringify(data));
        }

        checkInBtn.addEventListener('click', () => {
          const pets = getStoredPets();
          if (pets.length === 0) {
            alert('No pets to check in!');
            return;
          }

          const today = new Date().toISOString().split('T')[0];
          const checkins = getCheckInData();

          pets.forEach(pet => {
            if (!checkins[pet.id]) checkins[pet.id] = {};
            checkins[pet.id][today] = true;
          });

          saveCheckInData(checkins);
          alert('✓ Check-in complete! All pets marked for today.');
        });
      }

      // Initialize all features
      initPetCheckIn();
    }
