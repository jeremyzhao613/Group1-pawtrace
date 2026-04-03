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
      document.getElementById('profile-edit-modal').classList.remove('hidden');
    }

    function initStickyNotes() {
      const form = document.getElementById('sticky-note-form');
      const input = document.getElementById('sticky-note-input');
      const listEl = document.getElementById('sticky-note-list');
      const clearBtn = document.getElementById('clear-sticky-notes');
      const emptyEl = document.getElementById('sticky-note-empty');
      const container = document.getElementById('sticky-note-container');
      if (!form || !input || !listEl) return;
      let notes = [];

      async function fetchNotes() {
        try {
          const res = await fetch(STICKY_NOTES_API);
          const data = await res.json();
          notes = Array.isArray(data.notes) ? data.notes : [];
        } catch (err) {
          console.error('Failed to load sticky notes', err);
          notes = notes || [];
        }
        render();
      }

      function render() {
        listEl.innerHTML = '';
        if (!notes.length) {
          emptyEl?.classList.remove('hidden');
          return;
        }
        emptyEl?.classList.add('hidden');
        notes
          .slice()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .forEach(note => {
            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-start justify-between gap-2 bg-secondary/40 px-2 py-2 rounded-sm';
            wrapper.innerHTML = `
              <p class="flex-1 text-[11px] text-gray-700 break-words">${note.text}</p>
              <button class="text-[10px] text-red-500 hover:underline" data-note-id="${note.id}" type="button">Delete</button>
            `;
            listEl.appendChild(wrapper);
          });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        try {
          const res = await fetch(STICKY_NOTES_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          });
          if (!res.ok) throw new Error('Failed to save note');
          input.value = '';
          await fetchNotes();
        } catch (err) {
          console.error('Sticky note save error', err);
          alert('Unable to save note right now.');
        }
      });

      listEl.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-note-id]');
        if (!btn) return;
        const id = btn.getAttribute('data-note-id');
        if (!id) return;
        try {
          const res = await fetch(`${STICKY_NOTES_API}/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete note');
          await fetchNotes();
        } catch (err) {
          console.error('Sticky note delete error', err);
        }
      });

      clearBtn?.addEventListener('click', async () => {
        if (!notes.length) return;
        if (!confirm('Clear all sticky notes?')) return;
        try {
          const res = await fetch(STICKY_NOTES_API, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to clear notes');
          await fetchNotes();
        } catch (err) {
          console.error('Sticky note clear error', err);
        }
      });

      fetchNotes();
    }

    function closeProfileEditModal() {
      document.getElementById('profile-edit-modal').classList.add('hidden');
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
      modal?.classList.remove('hidden');
    }

    function closeShareImageModal() {
      const modal = document.getElementById('share-image-modal');
      const preview = document.getElementById('share-image-preview');
      const previewImg = document.getElementById('share-preview-img');
      const urlInput = document.getElementById('share-image-url');
      const captionInput = document.getElementById('share-image-caption');
      const fileInput = document.getElementById('share-image-file');
      shareImageSource = '';
      shareImageIsUpload = false;
      if (modal) modal.classList.add('hidden');
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

    // True Focus (feature highlight)
    function initTrueFocus() {
      const container = document.getElementById('core-focus');
      if (!container) return;
      const words = Array.from(container.querySelectorAll('.true-focus-word'));
      if (!words.length) return;
      const frame = document.createElement('div');
      frame.className = 'true-focus-frame';
      frame.innerHTML = `
        <span class="true-focus-corner tl"></span>
        <span class="true-focus-corner tr"></span>
        <span class="true-focus-corner bl"></span>
        <span class="true-focus-corner br"></span>
      `;
      container.appendChild(frame);
      let currentIndex = 0;
      const duration = 2000;
      const pause = 800;

      function highlight(idx) {
        words.forEach((w, i) => w.classList.toggle('active', i === idx));
        const active = words[idx];
        if (!active) return;
        const parentRect = container.getBoundingClientRect();
        const rect = active.getBoundingClientRect();
        const x = rect.left - parentRect.left;
        const y = rect.top - parentRect.top;
        frame.style.width = rect.width + 'px';
        frame.style.height = rect.height + 'px';
        frame.style.transform = `translate(${x}px, ${y}px)`;
        frame.classList.add('show');
      }

      highlight(currentIndex);
      setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
        highlight(currentIndex);
      }, duration + pause);
    }

    document.addEventListener('DOMContentLoaded', () => {
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
        locationListEl: document.getElementById('location-list'),
        locationCountEl: document.getElementById('location-count'),
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
      initTrueFocus();
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
        if (profileMainPetEl) profileMainPetEl.textContent = user.mainPetName ? `${user.mainPetName} · ${user.mainPetType || 'Pet'}` : 'Add your main pet to personalize insights.';
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
        const formatted = text
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
        setDiagStatus(file ? 'Analyzing pet health with Gemini...' : 'Analyzing symptoms (no photo)...');
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
            const response = await fetch('/api/ai/gemini-diagnosis', {
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
              throw new Error(errText || 'Gemini request failed');
            }
            const data = await response.json();
            const text = data?.result || data?.text || 'Unable to generate analysis. Please try a clearer photo.';
            renderDiagnosisResult(text);
            setDiagStatus('Gemini analysis complete');
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
          console.warn('Gemini diagnosis error', err);
          setDiagStatus('AI request failed', true);
          if (diagResult) {
            const fallback = generateMockAIResponse('health', user) || 'Unable to analyze right now. Please try again.';
            diagResult.innerHTML = `<p class="text-xs text-gray-700">${fallback}</p>`;
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
        const formatted = text
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
        loginScreen?.classList.add('hidden');
        appRoot.classList.remove('hidden');
        mobileTabbar?.classList.remove('hidden');
        const displayName = user.displayName || user.username;
        const avatar = user.avatar || 'https://design.gemcoder.com/staticResource/echoAiSystemImages/fdca457404bba5bf76bb0fd8378c6d8d.png';
        currentUserNameEl.textContent = displayName;
        currentUserAvatarEl.src = avatar;
        if (sidebarUserNameEl) sidebarUserNameEl.textContent = displayName;
        profileAvatarEl.src = avatar;
        profileNameEl.textContent = displayName;
        profileUsernameEl.textContent = '@' + user.username;
        profileBioEl.textContent = user.bio || 'Welcome to PawTrace!';
        profileCampusEl.textContent = user.campus || 'Taicang';
        profileContactEl.textContent = user.contact || 'Contact: N/A';
        updateProfileDetails(user);
        initTabs();
        initStickyNotes();
        initPets();
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
        showApp(currentUser);
        closeProfileEditModal();
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
        appRoot.classList.add('hidden');
        mobileTabbar?.classList.add('hidden');
        loginScreen?.classList.remove('hidden');
      }

      document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => {
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
      if (tabsInitialized) return;
      tabsInitialized = true;
      const tabPages = {
        map: document.getElementById('tab-map'),
        pets: document.getElementById('tab-pets'),
        chat: document.getElementById('tab-chat'),
        profile: document.getElementById('tab-profile'),
        ai: document.getElementById('tab-ai'),
      };
      const topTabs = document.querySelectorAll('.app-tab');

      function activateTab(name) {
        const chatPane = document.getElementById('chat-left-pane');
        const chatToggle = document.getElementById('chat-toggle-contacts');
        Object.keys(tabPages).forEach(key => {
          tabPages[key].classList.toggle('hidden', key !== name);
        });
        topTabs.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-tab') === name);
        });
        if (tabPages[name]) {
          tabPages[name].classList.add('visible');
        }
        if (name === 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.add('open');
          if (chatToggle) chatToggle.textContent = 'Hide friends';
        } else if (name !== 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.remove('open');
          if (chatToggle) chatToggle.textContent = 'Show friends';
        }
      }

      topTabs.forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-tab');
          activateTab(name);
        });
      });
      activateTab('map');
    }

    // --- Pet data & UI ---
    const PETS_DATA_KEY = 'pawtrace_pets';
    const STICKY_NOTES_API = '/api/sticky-notes';
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
        return JSON.parse(localStorage.getItem(PETS_DATA_KEY)) || [];
      } catch {
        return [];
      }
    }

    function setStoredPets(pets) {
      localStorage.setItem(PETS_DATA_KEY, JSON.stringify(pets));
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
      return {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        status: pet.status,
        health: pet.health
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
        }
      ];
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
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between bg-secondary/40 px-2 py-2 rounded-sm';
        row.innerHTML = `
          <div class="flex items-center gap-2 min-w-0">
            <img src="${p.avatar || DEFAULT_PET_AVATAR}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-neutral" />
            <div class="min-w-0">
              <p class="font-semibold text-[11px] truncate">${p.name}</p>
              <p class="text-[10px] text-gray-500 truncate">${p.type} · ${p.breed}</p>
            </div>
          </div>
          <button class="text-[10px] text-red-500 hover:underline" data-profile-pet-delete="${p.id}" type="button">
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

    function initPets() {
      let pets = [];
      const petList = document.getElementById('pet-list');
      const petEmpty = document.getElementById('pet-empty');
      const profilePetCount = document.getElementById('profile-pet-count');
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
        newPetInputs.traits.value = (pet.traits || []).join(', ');
        if (pet.avatar) setPetImagePreview(pet.avatar); else resetPetImagePreview();
        showPetForm();
      }

      function render() {
        if (!petList) return;
        petList.innerHTML = '';
        if (pets.length === 0) {
          petEmpty?.classList.remove('hidden');
          return;
        }
        petEmpty?.classList.add('hidden');
        pets.forEach((p, idx) => {
          const birthdayDisplay = p.birthday
            ? (() => {
                try {
                  return new Date(p.birthday).toLocaleDateString();
                } catch { return p.birthday; }
              })()
            : (p.age || 'Not set');
          const petAvatar = p.avatar || DEFAULT_PET_AVATAR;
          const isOpen = openPetId ? openPetId === p.id : idx === 0;
          if (!openPetId && idx === 0) openPetId = p.id;
          const card = document.createElement('div');
          card.className = 'pixel-card flex flex-col gap-2 animate-slideInLeft';
          card.style.animationDelay = (idx * 0.1) + 's';
          card.innerHTML = `
            <button class="w-full flex justify-between items-center text-left" data-pet-toggle="${p.id}">
              <div class="flex items-center gap-3">
                <img src="${petAvatar}" alt="${p.name}" loading="lazy" decoding="async" class="w-12 h-12 rounded-full object-cover pixel-border bg-secondary" />
                <div>
                  <p class="font-semibold text-sm">${p.name}</p>
                  <p class="text-[11px] text-gray-500">${p.type} · ${p.breed}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-gray-500">
                <span class="text-[10px]">${birthdayDisplay}</span>
                <i class="fas fa-chevron-${isOpen ? 'up' : 'down'}"></i>
              </div>
            </button>
            <div class="${isOpen ? '' : 'hidden'} space-y-2 pt-2 border-t border-white/60">
              <div class="flex gap-3">
                <img src="${petAvatar}" alt="${p.name}" loading="lazy" decoding="async" class="w-16 h-16 rounded-full object-cover pixel-border bg-secondary" />
                <div class="space-y-1 text-[11px]">
                  <p><span class="font-semibold">Type:</span> ${p.type}</p>
                  <p><span class="font-semibold">Breed:</span> ${p.breed}</p>
                  <p><span class="font-semibold">Birthday:</span> ${birthdayDisplay}</p>
                  <p><span class="font-semibold">Gender:</span> ${p.gender || 'Unknown'}</p>
                </div>
              </div>
              <div>
                <p class="font-semibold text-[11px]">Status</p>
                <p class="text-[11px] text-gray-600">${p.status || 'No recent notes'}</p>
              </div>
              <div>
                <p class="font-semibold text-[11px]">Personality</p>
                <div class="flex flex-wrap gap-1">
                  ${(p.traits || []).map(t => `<span class="px-2 py-0.5 rounded-full bg-secondary text-dark">${t}</span>`).join('')}
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-[11px]">Health</p>
                  <p class="text-[11px] text-gray-600">${p.health || 'No health notes yet'}</p>
                </div>
                <button data-id="${p.id}" class="pet-edit text-primary text-[12px] hover:underline flex items-center gap-1"><i class="fas fa-edit"></i>Edit</button>
              </div>
            </div>
          `;
        petList.appendChild(card);
      });
      if (profilePetCount) profilePetCount.textContent = pets.length.toString();

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
          const row = document.createElement('div');
          row.className = 'flex items-center justify-between bg-secondary/40 px-2 py-2 rounded-sm';
          row.innerHTML = `
            <div class="flex items-center gap-2 min-w-0">
              <img src="${p.avatar || DEFAULT_PET_AVATAR}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-neutral" />
              <div class="min-w-0">
                <p class="font-semibold text-[11px] truncate">${p.name}</p>
                <p class="text-[10px] text-gray-500 truncate">${p.type} · ${p.breed}</p>
              </div>
            </div>
            <button class="text-[10px] text-red-500 hover:underline" data-profile-pet-delete="${p.id}" type="button">
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
          const card = document.createElement('div');
          card.className = 'pixel-card flex flex-col gap-2 animate-slideIn';
          card.style.animationDelay = (idx * 0.05) + 's';
          card.innerHTML = `
            <div class="relative">
              <img src="${pet.photo}" alt="${pet.name}" loading="lazy" decoding="async" class="community-cover w-full object-cover rounded-sm pixel-border" />
              <span class="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">Community</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-sm">${pet.name}</p>
                <p class="text-[11px] text-gray-600">${pet.type}</p>
              </div>
              <button class="text-[10px] text-primary underline" data-community-contact="${pet.ownerContact}">
                Message owner
              </button>
            </div>
            <p class="text-[11px] text-gray-600">${pet.mood}</p>
            <p class="text-[10px] text-gray-500"><i class="fas fa-map-marker-alt text-primary mr-1"></i>${pet.location}</p>
            <div class="flex flex-wrap gap-1 text-[10px]">
              ${(pet.traits || []).map(tag => `<span class="px-2 py-0.5 rounded-full bg-secondary/60">${tag}</span>`).join('')}
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
            health: newPetInputs.health.value.trim() || 'No health notes yet.'
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
      const chatScrollUp = document.getElementById('chat-scroll-up');
      const chatScrollDown = document.getElementById('chat-scroll-down');
      const hoverCard = document.createElement('div');
      hoverCard.className = 'contact-hover-card';
      hoverCard.innerHTML = `
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
      document.body.appendChild(hoverCard);

      if (profileFriendsCount) profileFriendsCount.textContent = CHAT_STATE.contacts.length;

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
        CHAT_STATE.contacts
          .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
          .forEach((c, idx) => {
            const item = document.createElement('button');
          item.className = 'w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-secondary text-left transition-colors animate-slideInLeft';
          item.style.animationDelay = (idx * 0.05) + 's';
          item.dataset.id = c.id;
          item.dataset.contactId = c.id;
          item.innerHTML = `
              <img src="${c.avatar}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-secondary" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-xs truncate">${c.name}</p>
                <p class="text-[11px] text-gray-600 truncate">${c.lastPreview}</p>
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
                tagsEl.innerHTML = tags.map(t => `<span>${t}</span>`).join('');
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
        const wrapper = document.createElement('div');
        wrapper.className = `flex items-end gap-2 ${isUser ? 'justify-end' : ''} animate-slideInLeft bubble-entry bubble-bounce`;
        const bubble = document.createElement('div');
        bubble.className = `px-3 py-2 max-w-[70%] ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-secondary text-dark rounded-bl-none'}`;
        if (media?.type === 'image') {
          bubble.className += ' bubble-image';
          bubble.innerHTML = `
            <img src="${media.src}" class="w-full h-auto object-cover rounded-sm border-2 border-dark mb-1" />
            ${content ? `<p class="text-[11px]">${content}</p>` : ''}
          `;
        } else {
          bubble.innerHTML = `<p class="text-[11px]">${content}</p>`;
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
            ? contact.petTraits.map(t => `<span class="px-2 py-0.5 rounded-full bg-secondary text-dark">${t}</span>`).join('')
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

      window.openFriendInChat = (friendId) => {
        switchToChatTab();
        setTimeout(() => {
          document.querySelector(`[data-contact-id="${friendId}"]`)?.click();
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
          const pets = JSON.parse(localStorage.getItem('pawtrace_pets') || '[]');
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
