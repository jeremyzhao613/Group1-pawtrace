    (function initLocalIconFallback() {
      const ICON_PREFIX = 'pawtrace-local-icon-';
      const ICON_SPRITE_ID = `${ICON_PREFIX}sprite`;
      const LOCAL_ICON_SYMBOLS = {
        ai: '<path fill="currentColor" d="M11 2.5 13 8l5.5 2-5.5 2-2 5.5L9 12 3.5 10 9 8l2-5.5Zm7 9.5 1.1 2.9L22 16l-2.9 1.1L18 20l-1.1-2.9L14 16l2.9-1.1L18 12Zm-13 1 1 2.4L8.5 16 6 17l-1 2.5L4 17l-2.5-1L4 15l1-2Z"/>',
        arrowLeft: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></g>',
        battery: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 11v2"/><path d="M7 11h5"/></g>',
        bell: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></g>',
        camera: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/></g>',
        carrot: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8c4 1 7 4 8 8-4-1-7-4-8-8Z"/><path d="M8 8 5 5"/><path d="M10 7 9 3"/><path d="M7 10 3 9"/></g>',
        chartBars: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M7 16v-5"/><path d="M12 16V6"/><path d="M17 16v-8"/></g>',
        chartLine: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m6 15 4-4 3 3 5-7"/></g>',
        check: '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4 10-10"/>',
        chevronDown: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/>',
        chevronUp: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m6 15 6-6 6 6"/>',
        clipboard: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="M9 10h6"/><path d="M9 14h4"/></g>',
        clock: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></g>',
        cloudUp: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 18a4.5 4.5 0 0 0-.7-8.9A6 6 0 0 0 5.3 11 3.5 3.5 0 0 0 6.5 18"/><path d="M12 19V11"/><path d="m8.5 14.5 3.5-3.5 3.5 3.5"/></g>',
        coffee: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 4v1"/><path d="M12 4v1"/></g>',
        comments: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V7a2 2 0 0 1 2-2Z"/><path d="M8 9h8"/><path d="M8 13h5"/></g>',
        compass: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></g>',
        copy: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></g>',
        crosshair: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/></g>',
        directions: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 19 5"/><path d="M9 5h10v10"/><path d="M5 19l6-1-5-5z"/></g>',
        dog: '<path fill="currentColor" d="M12.5 11.2c.9-.8 2.5-.6 3.4.2.9.8 1.1 2 .3 2.9-.5.6-1.4 1.3-2.3 1.9-.5.4-1.2.4-1.7 0-.9-.6-1.8-1.3-2.3-1.9-.8-.9-.6-2.1.3-2.9.9-.8 2.4-1 3.3-.2ZM8 6.2c.8.6 1 1.7.4 2.5-.6.8-1.7 1-2.5.4-.8-.6-1-1.7-.4-2.5.6-.8 1.7-1 2.5-.4Zm8 0c.8-.6 1.9-.4 2.5.4.6.8.4 1.9-.4 2.5-.8.6-1.9.4-2.5-.4-.6-.8-.4-1.9.4-2.5ZM9 4c0-1.1.8-2 1.8-2S12.5 2.9 12.5 4 11.7 6 10.7 6 9 5.1 9 4Zm6 0c0-1.1.8-2 1.8-2S18.5 2.9 18.5 4 17.7 6 16.7 6 15 5.1 15 4Z"/>',
        door: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4a1 1 0 0 1 1-1h10v18"/><path d="M10 12h.01"/><path d="M4 21h16"/></g>',
        droplet: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"/>',
        edit: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20H4v-4z"/></g>',
        ellipsisV: '<g fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></g>',
        eraser: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 16 8-8 6 6-5 5H7z"/><path d="M12 19h8"/></g>',
        external: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="m10 14 10-10"/><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></g>',
        fileMedical: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/><path d="M12 11v6"/><path d="M9 14h6"/></g>',
        gamepad: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9h10a4 4 0 0 1 3.8 5.2l-.7 2.1a2 2 0 0 1-3.2.8L15 15H9l-1.9 2.1a2 2 0 0 1-3.2-.8l-.7-2.1A4 4 0 0 1 7 9Z"/><path d="M8 12v4"/><path d="M6 14h4"/><circle cx="16.5" cy="13.5" r=".7" fill="currentColor"/><circle cx="18.5" cy="15.5" r=".7" fill="currentColor"/></g>',
        heart: '<path fill="currentColor" d="M12 21s-7-4.4-9.3-9C.9 9.1 2 5.3 5.3 4.4c2-.5 3.5.4 4.3 1.6.8-1.2 2.4-2.1 4.3-1.6 3.3.9 4.4 4.7 2.6 7.6C19 16.6 12 21 12 21Z"/>',
        heartPulse: '<path fill="currentColor" opacity=".22" d="M12 21s-7-4.4-9.3-9C.9 9.1 2 5.3 5.3 4.4c2-.5 3.5.4 4.3 1.6.8-1.2 2.4-2.1 4.3-1.6 3.3.9 4.4 4.7 2.6 7.6C19 16.6 12 21 12 21Z"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 12h4l2-4 4 8 2-4h4"/>',
        idCard: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16a3 3 0 0 1 5 0"/><path d="M14 10h4"/><path d="M14 14h4"/></g>',
        image: '<path fill="currentColor" d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v9.6l3.4-3.4a1.2 1.2 0 0 1 1.7 0l2.1 2.1 3.7-4a1.2 1.2 0 0 1 1.8 0L19 11.8V6H5Zm0 12h14v-3.3l-2.2-2.3-3.7 4a1.2 1.2 0 0 1-1.7 0l-2.1-2.1L5 18Zm5.2-9.5a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Z"/>',
        info: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></g>',
        link: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/></g>',
        logout: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></g>',
        mail: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></g>',
        map: '<path fill="currentColor" d="M9 3 3 5.5v15l6-2.5 6 2.5 6-2.5v-15L15 5.5 9 3Zm0 2.2 4.5 1.9v11.7L9 17V5.2ZM5 6.8l2-.8v11.8l-2 .8V6.8Zm14 0v11.7l-2 .8V7.7l2-.9Z"/>',
        mapLocation: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6 2.5v-15L9 3l6 2.5 6-2.5v15L15 21z"/><path d="M9 3v15"/><path d="M15 5.5V21"/><path d="M12 8a3 3 0 0 1 3 3c0 2.2-3 5-3 5s-3-2.8-3-5a3 3 0 0 1 3-3Z"/><circle cx="12" cy="11" r=".8" fill="currentColor" stroke="none"/></g>',
        microscope: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 4 5 3-4 7-5-3z"/><path d="M6 18h12"/><path d="M9 18a5 5 0 0 0 8-4"/><path d="M14 4l2-2"/><path d="M7 14l-2 4"/></g>',
        moon: '<path fill="currentColor" d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 9 9 0 1 0 20.5 15.5Z"/>',
        navigation: '<path fill="currentColor" d="M12 3 21 21l-9-4-9 4z"/>',
        paperPlane: '<path fill="currentColor" d="M3.4 20.6 21 12 3.4 3.4l-.8 6.8L14 12 2.6 13.8l.8 6.8Z"/>',
        paw: '<path fill="currentColor" d="M12.5 11.2c.9-.8 2.5-.6 3.4.2.9.8 1.1 2 .3 2.9-.5.6-1.4 1.3-2.3 1.9-.5.4-1.2.4-1.7 0-.9-.6-1.8-1.3-2.3-1.9-.8-.9-.6-2.1.3-2.9.9-.8 2.4-1 3.3-.2ZM8 6.2c.8.6 1 1.7.4 2.5-.6.8-1.7 1-2.5.4-.8-.6-1-1.7-.4-2.5.6-.8 1.7-1 2.5-.4Zm8 0c.8-.6 1.9-.4 2.5.4.6.8.4 1.9-.4 2.5-.8.6-1.9.4-2.5-.4-.6-.8-.4-1.9.4-2.5ZM9 4c0-1.1.8-2 1.8-2S12.5 2.9 12.5 4 11.7 6 10.7 6 9 5.1 9 4Zm6 0c0-1.1.8-2 1.8-2S18.5 2.9 18.5 4 17.7 6 16.7 6 15 5.1 15 4Z"/>',
        pen: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 3.5 4 4L8 20H4v-4z"/><path d="M14 6l4 4"/></g>',
        phone: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6.6 3.8 9 8.7l-2 1.6c1.5 3 3.7 5.2 6.7 6.7l1.6-2 4.9 2.4c.4.2.6.6.5 1.1l-.6 2.2c-.1.5-.6.8-1.1.8C9.6 21.5 2.5 14.4 2.5 5c0-.5.3-1 .8-1.1l2.2-.6c.5-.1.9.1 1.1.5Z"/>',
        pin: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-5.7 7-12a7 7 0 1 0-14 0c0 6.3 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></g>',
        plus: '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" d="M12 5v14M5 12h14"/>',
        plusCircle: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/></g>',
        polygon: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 7-4 7 4v8l-7 4-7-4z"/><path d="M5 8h14"/><path d="M12 4v16"/></g>',
        pulse: '<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M3 12h4l2-6 4 12 2-6h6"/>',
        rotate: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 4v6h-6"/></g>',
        running: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M10 21l2-5-3-3-2 3"/><path d="M15 8l-3 3 3 3 4 1"/><path d="M7 9l3-1 3 1"/></g>',
        save: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8"/><path d="M8 21v-7h8v7"/></g>',
        search: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></g>',
        shield: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
        signal: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 18h.01"/><path d="M9 18v-4"/><path d="M13 18v-8"/><path d="M17 18V6"/></g>',
        stethoscope: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v5a4 4 0 0 0 8 0V4"/><path d="M10 13v2a4 4 0 0 0 8 0v-1"/><circle cx="18" cy="12" r="2"/></g>',
        temperature: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 8v8"/></g>',
        tools: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 7 3-3 3 3-3 3z"/><path d="M14 7 4 17l3 3L17 10"/><path d="m5 5 4 4"/></g>',
        trash: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></g>',
        user: '<path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.3 0-6 1.7-6 3.8V20h12v-2.2C18 15.7 15.3 14 12 14Z"/>',
        userPlus: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M18 8v6"/><path d="M15 11h6"/></g>',
        users: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M14 19a4.5 4.5 0 0 1 7 0"/></g>',
        video: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></g>',
        warning: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 10 18H2z"/><path d="M12 9v5"/><path d="M12 17h.01"/></g>',
        wifi: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 10a11 11 0 0 1 14 0"/><path d="M8 13a6 6 0 0 1 8 0"/><path d="M11 16a2 2 0 0 1 2 0"/><path d="M12 19h.01"/></g>',
        x: '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/>',
        dot: '<circle cx="12" cy="12" r="5" fill="currentColor"/>',
        circleCheck: '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></g>'
      };
      const LOCAL_ICON_ALIASES = {
        'fa-arrow-left': 'arrowLeft',
        'fa-arrow-up-right-from-square': 'external',
        'fa-arrows-rotate': 'rotate',
        'fa-battery-half': 'battery',
        'fa-bell': 'bell',
        'fa-camera': 'camera',
        'fa-camera-retro': 'camera',
        'fa-carrot': 'carrot',
        'fa-chart-line': 'chartLine',
        'fa-chart-simple': 'chartBars',
        'fa-check': 'check',
        'fa-chevron-down': 'chevronDown',
        'fa-chevron-up': 'chevronUp',
        'fa-circle': 'dot',
        'fa-circle-check': 'circleCheck',
        'fa-circle-info': 'info',
        'fa-clipboard-check': 'clipboard',
        'fa-clipboard-list': 'clipboard',
        'fa-clock': 'clock',
        'fa-clock-rotate-left': 'clock',
        'fa-cloud-arrow-up': 'cloudUp',
        'fa-cog': 'tools',
        'fa-comment-dots': 'comments',
        'fa-comments': 'comments',
        'fa-compass': 'compass',
        'fa-copy': 'copy',
        'fa-directions': 'directions',
        'fa-dog': 'dog',
        'fa-door-open': 'door',
        'fa-draw-polygon': 'polygon',
        'fa-droplet': 'droplet',
        'fa-edit': 'edit',
        'fa-ellipsis-v': 'ellipsisV',
        'fa-envelope': 'mail',
        'fa-eraser': 'eraser',
        'fa-exclamation-circle': 'warning',
        'fa-file-medical-alt': 'fileMedical',
        'fa-floppy-disk': 'save',
        'fa-gamepad': 'gamepad',
        'fa-heart': 'heart',
        'fa-heart-pulse': 'heartPulse',
        'fa-id-card': 'idCard',
        'fa-image': 'image',
        'fa-images': 'image',
        'fa-info-circle': 'info',
        'fa-link': 'link',
        'fa-location-arrow': 'navigation',
        'fa-location-crosshairs': 'crosshair',
        'fa-location-dot': 'pin',
        'fa-magic': 'ai',
        'fa-map-location-dot': 'mapLocation',
        'fa-map-marked-alt': 'mapLocation',
        'fa-map-marker-alt': 'pin',
        'fa-message': 'comments',
        'fa-microscope': 'microscope',
        'fa-moon': 'moon',
        'fa-mug-hot': 'coffee',
        'fa-notes-medical': 'fileMedical',
        'fa-paper-plane': 'paperPlane',
        'fa-paw': 'paw',
        'fa-pen-to-square': 'pen',
        'fa-person-running': 'running',
        'fa-phone': 'phone',
        'fa-plus': 'plus',
        'fa-plus-circle': 'plusCircle',
        'fa-save': 'save',
        'fa-screwdriver-wrench': 'tools',
        'fa-search': 'search',
        'fa-shield-alt': 'shield',
        'fa-sign-out-alt': 'logout',
        'fa-signal': 'signal',
        'fa-stethoscope': 'stethoscope',
        'fa-temperature-half': 'temperature',
        'fa-times': 'x',
        'fa-trash-alt': 'trash',
        'fa-triangle-exclamation': 'warning',
        'fa-up-right-and-down-left-from-center': 'external',
        'fa-upload': 'upload',
        'fa-user': 'user',
        'fa-user-group': 'users',
        'fa-user-plus': 'userPlus',
        'fa-users': 'users',
        'fa-video': 'video',
        'fa-wand-magic-sparkles': 'ai',
        'fa-wave-square': 'pulse',
        'fa-wifi': 'wifi',
        'fa-xmark': 'x'
      };
      LOCAL_ICON_SYMBOLS.upload = LOCAL_ICON_SYMBOLS.cloudUp;

      function injectLocalIconSprite() {
        if (document.getElementById(ICON_SPRITE_ID) || !document.body) return;
        const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sprite.id = ICON_SPRITE_ID;
        sprite.setAttribute('aria-hidden', 'true');
        sprite.setAttribute('focusable', 'false');
        sprite.style.position = 'absolute';
        sprite.style.width = '0';
        sprite.style.height = '0';
        sprite.style.overflow = 'hidden';
        sprite.innerHTML = Object.entries(LOCAL_ICON_SYMBOLS)
          .map(([name, body]) => `<symbol id="${ICON_PREFIX}${name}" viewBox="0 0 24 24">${body}</symbol>`)
          .join('');
        document.body.prepend(sprite);
      }

      function getLocalIconName(iconElement) {
        for (const className of iconElement.classList) {
          const iconName = LOCAL_ICON_ALIASES[className];
          if (iconName) return iconName;
        }
        return '';
      }

      function renderLocalIcon(iconElement) {
        const iconName = getLocalIconName(iconElement);
        if (!iconName || !LOCAL_ICON_SYMBOLS[iconName]) return;
        const targetId = `${ICON_PREFIX}${iconName}`;
        if (iconElement.dataset.pawLocalIcon === targetId) return;
        iconElement.classList.add('paw-local-icon');
        iconElement.dataset.pawLocalIcon = targetId;
        iconElement.setAttribute('aria-hidden', 'true');
        iconElement.innerHTML = `<svg aria-hidden="true" focusable="false"><use href="#${targetId}"></use></svg>`;
      }

      function renderLocalIcons(root = document) {
        injectLocalIconSprite();
        if (root instanceof Element && root.matches('i')) {
          renderLocalIcon(root);
        }
        root.querySelectorAll?.('i.fas, i.fa-solid, i[class*=" fa-"], i[class^="fa-"]').forEach(renderLocalIcon);
      }

      function startLocalIconObserver() {
        if (!document.body) return;
        renderLocalIcons(document);
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.target instanceof Element) {
              renderLocalIcons(mutation.target);
              return;
            }
            mutation.addedNodes.forEach((node) => {
              if (node instanceof Element) renderLocalIcons(node);
            });
          });
        });
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class'],
          childList: true,
          subtree: true
        });
      }

      if (document.body) {
        startLocalIconObserver();
      } else {
        document.addEventListener('DOMContentLoaded', startLocalIconObserver, { once: true });
      }
    })();

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
    let selectedAIMode = 'photo';
    let setAIAssistMode = null;
    let petsInitialized = false;
    let rerenderPets = null;
    let chatInitialized = false;
    let rerenderChat = null;
    let chatHoverCard = null;
    let lastChatAssistantSource = '';
    let lastChatAssistantWarning = '';
    let petCheckInInitialized = false;
    let deviceTelemetryPollTimer = null;
    let deviceTelemetryHistoryPollTimer = null;
    let deviceTelemetryStream = null;
    let deviceTelemetrySyncWanted = false;
    let deviceTelemetrySyncEpoch = 0;
    let deviceTelemetryCommitTimer = null;
    let pendingDeviceTelemetryRecords = [];
    let lastDeviceTelemetryCommitMs = 0;
    const deviceTelemetryRequests = new Map();
    let wifiTelemetryBridgeInitialized = false;
    let wifiTelemetryPollTimer = null;
    let stopWifiTelemetryBridge = () => {};
    let bluetoothBridgeInitialized = false;
    let stopBluetoothTelemetryBridge = () => {};
    const bluetoothBridgeState = {
      device: null,
      telemetryChar: null,
      messageChar: null,
      storedCount: 0,
      lastMessage: '',
      autoReconnectTimer: null,
      autoReconnectBusy: false,
      userDisconnected: false,
      rxBuffer: '',
      logDumpCurrentUptimeMs: null,
    };
    let activeTabName = 'map';
    let activateAppTab = null;
    let modalSystemInitialized = false;
    let activeModalId = null;
    let lastModalTrigger = null;
    let currentGuestUser = null;
    let guestPetStore = [];
    let guestMyPetStore = [];
    let guestCheckInStore = {};
    let activeNfcPetCard = null;
    let activeNfcTargetId = '';
    const TAB_HEADER_META = {
      map: {
        eyebrow: 'PAWTRACE',
        title: 'Campus Map',
        subtitle: 'Campus spots · Pet locations',
        path: 'campus-map'
      },
      pets: {
        eyebrow: 'PAWTRACE',
        title: 'Pet Cards',
        subtitle: 'Community feed · My pets',
        path: 'pet-cards'
      },
      chat: {
        eyebrow: 'PAWTRACE',
        title: 'Friends Chat',
        subtitle: 'Friends · Care context',
        path: 'friends-chat'
      },
      health: {
        eyebrow: 'PAWTRACE',
        title: 'Health Monitoring',
        subtitle: 'Latest vitals · Trend history',
        path: 'health-monitoring'
      },
      ai: {
        eyebrow: 'PAWTRACE',
        title: 'AI Assist',
        subtitle: 'Photo checks · Video behavior review',
        path: 'ai-assist'
      },
      profile: {
        eyebrow: 'PAWTRACE',
        title: 'Profile Center',
        subtitle: 'Owner card · Settings',
        path: 'profile-center'
      }
    };
    const MOBILE_CHROME_QUERY = '(max-width: 768px), (hover: none), (pointer: coarse)';

    function isMobileChromeViewport() {
      return window.matchMedia?.(MOBILE_CHROME_QUERY)?.matches || window.innerWidth <= 768;
    }

    function isKeyboardEditingElement(element) {
      if (!(element instanceof HTMLElement)) return false;
      if (element.matches('textarea, [contenteditable="true"]')) return true;
      if (element instanceof HTMLInputElement) {
        const textEntryTypes = new Set([
          'email',
          'number',
          'password',
          'search',
          'tel',
          'text',
          'url',
        ]);
        return textEntryTypes.has((element.type || 'text').toLowerCase());
      }
      return false;
    }

    function syncMobileChromeState() {
      const shouldSuppress = document.body.classList.contains('modal-open') ||
        (isMobileChromeViewport() && isKeyboardEditingElement(document.activeElement));
      document.body.classList.toggle('mobile-chrome-suppressed', shouldSuppress);
    }

    function syncModalState() {
      const hasOpenModal = !!document.querySelector('.app-modal:not(.hidden)');
      document.body.classList.toggle('modal-open', hasOpenModal);
      if (!hasOpenModal) {
        activeModalId = null;
      }
      syncMobileChromeState();
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
        if (firstField instanceof HTMLElement && !isMobileChromeViewport()) {
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
        const openButton = target.closest('[data-modal-open]');
        if (openButton) {
          const modalId = openButton.getAttribute('data-modal-open');
          if (modalId) setModalState(modalId, true);
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
      document.addEventListener('focusin', syncMobileChromeState);
      document.addEventListener('focusout', () => window.setTimeout(syncMobileChromeState, 80));
      window.visualViewport?.addEventListener('resize', syncMobileChromeState);
      window.addEventListener('resize', syncMobileChromeState);
      syncModalState();
    }

    // --- Modal Functions ---
    function openProfileEditModal() {
      const currentUser = getCurrentUser();
      if (!currentUser) return;
      pendingAvatarData = null;
      if (editAvatarFileInput) editAvatarFileInput.value = '';
      if (profileAvatarPreviewImg) {
        setPreviewImageSource(profileAvatarPreviewImg, normalizeUserAvatar(currentUser.avatar), DEFAULT_USER_AVATAR);
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
      const cameraInput = document.getElementById('share-camera-file');
      shareImageSource = '';
      shareImageIsUpload = false;
      if (urlInput) urlInput.value = '';
      if (captionInput) captionInput.value = '';
      if (fileInput) fileInput.value = '';
      if (cameraInput) cameraInput.value = '';
      if (preview) preview.classList.add('hidden');
      setPreviewImageSource(previewImg, '');
      if (modal) setModalState('share-image-modal', true);
    }

    function closeShareImageModal() {
      const preview = document.getElementById('share-image-preview');
      const previewImg = document.getElementById('share-preview-img');
      const urlInput = document.getElementById('share-image-url');
      const captionInput = document.getElementById('share-image-caption');
      const fileInput = document.getElementById('share-image-file');
      const cameraInput = document.getElementById('share-camera-file');
      shareImageSource = '';
      shareImageIsUpload = false;
      setModalState('share-image-modal', false);
      if (preview) preview.classList.add('hidden');
      setPreviewImageSource(previewImg, '');
      if (urlInput) urlInput.value = '';
      if (captionInput) captionInput.value = '';
      if (fileInput) fileInput.value = '';
      if (cameraInput) cameraInput.value = '';
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
    const LS_AUTH_TOKEN_KEY = 'pawtrace_auth_token';
    const API_BASE_OVERRIDE_KEY = 'pawtrace_api_base_url';
    const DEFAULT_API_TIMEOUT_MS = 8000;
    const STATUS_API_TIMEOUT_MS = 4500;
    const TELEMETRY_API_TIMEOUT_MS = 3500;
    const API_BASE_URL = getApiBaseUrl();
    const DEFAULT_PUBLIC_APP_URL = 'https://pawtrace.pages.dev';
    const PUBLIC_APP_BASE_URL = getPublicAppBaseUrl();

    function isLocalHardwareHostName(hostname = window.location.hostname) {
      const host = String(hostname || '').trim().toLowerCase();
      return host === 'localhost'
        || host === '127.0.0.1'
        || host === '::1'
        || host.startsWith('10.')
        || host.startsWith('192.168.')
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
    }

    function getRouteHashPath() {
      try {
        return String(window.location.hash || '').replace(/^#/, '').split('?')[0].split('/')[0].trim().toLowerCase();
      } catch {
        return '';
      }
    }

    function isLocalM5DemoRoute() {
      if (!isLocalHardwareHostName()) return false;
      try {
        const query = new URLSearchParams(window.location.search || '');
        const openApp = String(query.get('openApp') || '').trim().toLowerCase();
        const hashPath = getRouteHashPath();
        return query.get('autoDemo') === '1'
          || query.has('m5Demo')
          || openApp === 'm5'
          || openApp === 'health'
          || (openApp === 'profile' && hashPath === 'health');
      } catch {
        return false;
      }
    }

    function getApiBaseUrl() {
      const metaBase = document.querySelector('meta[name="pawtrace-api-base"]')?.getAttribute('content') || '';
      const queryBase = getQueryApiBaseUrl();
      const storedBase = getStoredApiBaseUrl();
      if (queryBase) setStoredApiBaseUrl(queryBase);
      const useLocalDemoApi = !queryBase && isLocalM5DemoRoute();
      if (useLocalDemoApi) setStoredApiBaseUrl('');
      const rawBase = String(queryBase || (useLocalDemoApi ? '' : storedBase) || (useLocalDemoApi ? '' : window.PAWTRACE_API_BASE_URL) || (useLocalDemoApi ? '' : metaBase) || '').trim();
      return rawBase.replace(/\/+$/, '');
    }

    function normalizeAbsoluteHttpUrl(value = '') {
      const trimmed = String(value || '').trim();
      if (!trimmed) return '';
      const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      try {
        const url = new URL(withScheme);
        if (!/^https?:$/i.test(url.protocol)) return '';
        url.pathname = url.pathname.replace(/\/+$/, '') || '/';
        url.search = '';
        url.hash = '';
        return url.toString().replace(/\/+$/, '');
      } catch {
        return '';
      }
    }

    function getQueryPublicAppUrl() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        return String(params.get('publicAppUrl') || params.get('appUrl') || '').trim();
      } catch {
        return '';
      }
    }

    function getPublicAppBaseUrl() {
      const metaBase = document.querySelector('meta[name="pawtrace-public-app-url"]')?.getAttribute('content') || '';
      const currentPublicOrigin = isLocalHardwareHostName() ? '' : window.location.origin;
      return normalizeAbsoluteHttpUrl(
        getQueryPublicAppUrl()
        || window.PAWTRACE_PUBLIC_APP_URL
        || metaBase
        || currentPublicOrigin
        || DEFAULT_PUBLIC_APP_URL
      ) || DEFAULT_PUBLIC_APP_URL;
    }

    function buildPublicAppUrl(path = '/', configure = null) {
      const url = new URL(path || '/', `${PUBLIC_APP_BASE_URL}/`);
      if (typeof configure === 'function') configure(url);
      return url.toString();
    }

    function getQueryApiBaseUrl() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        return String(params.get('apiBase') || params.get('api') || '').trim();
      } catch {
        return '';
      }
    }

    function getStoredApiBaseUrl() {
      try {
        return String(localStorage.getItem(API_BASE_OVERRIDE_KEY) || '').trim();
      } catch {
        return '';
      }
    }

    function setStoredApiBaseUrl(value) {
      try {
        const normalized = String(value || '').trim().replace(/\/+$/, '');
        if (normalized) localStorage.setItem(API_BASE_OVERRIDE_KEY, normalized);
        else localStorage.removeItem(API_BASE_OVERRIDE_KEY);
      } catch {}
    }

    window.PAWTRACE_SET_API_BASE_URL = (value = '') => {
      setStoredApiBaseUrl(value);
      window.location.reload();
    };

    function promptApiBaseOverride() {
      const currentBase = getStoredApiBaseUrl() || API_BASE_URL || '';
      const nextBase = window.prompt('PawTrace API base URL', currentBase);
      if (nextBase === null) return;
      setStoredApiBaseUrl(nextBase);
      window.location.reload();
    }

    function apiUrl(path) {
      const target = String(path || '');
      if (!target || /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(target) || /^(data|blob):/i.test(target)) return target;
      if (!API_BASE_URL) return target;
      const normalizedPath = target.startsWith('/') ? target : `/${target}`;
      if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
        return `${API_BASE_URL}${normalizedPath.slice('/api'.length)}`;
      }
      return `${API_BASE_URL}${normalizedPath}`;
    }

    function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_API_TIMEOUT_MS) {
      const controller = new AbortController();
      const externalSignal = options.signal;
      const abortFromExternal = () => controller.abort(externalSignal?.reason);
      if (externalSignal?.aborted) abortFromExternal();
      else externalSignal?.addEventListener?.('abort', abortFromExternal, { once: true });
      const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
      return fetch(apiUrl(url), { ...options, signal: controller.signal })
        .finally(() => {
          window.clearTimeout(timeoutId);
          externalSignal?.removeEventListener?.('abort', abortFromExternal);
        });
    }

    function sanitizeStoredUser(user = {}) {
      if (!user || typeof user !== 'object') return null;
      const { password, passwordHash, token, ...safeUser } = user;
      return safeUser;
    }

    function loadUsers() {
      try {
        const parsed = JSON.parse(localStorage.getItem(LS_USERS_KEY)) || [];
        if (!Array.isArray(parsed)) return [];
        const sanitized = parsed.map(sanitizeStoredUser).filter(Boolean);
        if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
          saveUsers(sanitized);
        }
        return sanitized;
      } catch { return []; }
    }
    function saveUsers(users) {
      const sanitized = (Array.isArray(users) ? users : []).map(sanitizeStoredUser).filter(Boolean);
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(sanitized));
    }
    function persistCurrentUser(user) {
      if (!user) return;
      const safeUser = normalizeSessionUser(user);
      setCurrentUser(safeUser);
      if (safeUser.username === 'guest') {
        return;
      }
      let users = loadUsers();
      users = users.map(u => u.username === safeUser.username ? safeUser : u);
      saveUsers(users);
    }
    function setCurrentUser(user) {
      if (user) {
        const normalized = normalizeSessionUser(user);
        if (normalized.username === 'guest') {
          currentGuestUser = normalized;
          localStorage.removeItem(LS_CURRENT_USER_KEY);
          localStorage.removeItem(LS_AUTH_TOKEN_KEY);
          return;
        }
        currentGuestUser = null;
        localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(normalized));
        return;
      }
      currentGuestUser = null;
      guestPetStore = [];
      guestMyPetStore = [];
      guestCheckInStore = {};
      localStorage.removeItem(LS_CURRENT_USER_KEY);
    }
    function getCurrentUser() {
      if (currentGuestUser) return currentGuestUser;
      try {
        const user = sanitizeStoredUser(JSON.parse(localStorage.getItem(LS_CURRENT_USER_KEY)));
        if (user?.username === 'guest') {
          localStorage.removeItem(LS_CURRENT_USER_KEY);
          return null;
        }
        if (user) {
          const normalized = normalizeSessionUser(user);
          localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(normalized));
          return normalized;
        }
        return null;
      } catch { return null; }
    }

    function isGuestSession(user = getCurrentUser()) {
      return !getAuthToken() && user?.username === 'guest';
    }

    function setAuthToken(token) {
      if (token) localStorage.setItem(LS_AUTH_TOKEN_KEY, token);
      else localStorage.removeItem(LS_AUTH_TOKEN_KEY);
    }

    function getAuthToken() {
      try {
        return localStorage.getItem(LS_AUTH_TOKEN_KEY) || '';
      } catch {
        return '';
      }
    }

    function authHeaders(extra = {}) {
      const token = getAuthToken();
      return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
    }

    async function authJsonFetch(url, options = {}) {
      const { timeoutMs = DEFAULT_API_TIMEOUT_MS, ...fetchOptions } = options;
      const headers = authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) });
      return fetchWithTimeout(url, { ...fetchOptions, headers }, timeoutMs);
    }

    function telemetryRecordsFromPayload(data = {}) {
      if (Array.isArray(data?.telemetry)) return data.telemetry.filter(Boolean);
      return data?.latest ? [data.latest] : [];
    }

    function telemetryAuthHeaders(token, extra = {}) {
      return {
        'Content-Type': 'application/json',
        ...(extra || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
    }

    async function fetchDeviceTelemetryPayload(path) {
      const appToken = getAuthToken();
      if (!appToken) return null;
      const key = String(path || '');
      const existing = deviceTelemetryRequests.get(key);
      if (existing) return existing;
      const request = (async () => {
        const response = await fetchWithTimeout(path, {
          headers: telemetryAuthHeaders(appToken),
        }, TELEMETRY_API_TIMEOUT_MS);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Device telemetry request failed.');
        }
        return data;
      })();
      deviceTelemetryRequests.set(key, request);
      try {
        return await request;
      } finally {
        if (deviceTelemetryRequests.get(key) === request) {
          deviceTelemetryRequests.delete(key);
        }
      }
    }

    function normalizeSessionUser(user = {}) {
      const safeUser = sanitizeStoredUser(user) || {};
      return {
        username: safeUser.username || 'guest',
        displayName: safeUser.displayName || safeUser.username || 'Guest Explorer',
        avatar: normalizeUserAvatar(safeUser.avatar),
        bio: safeUser.bio || '',
        campus: safeUser.campus || 'Taicang',
        contact: safeUser.contact || '',
        starSign: safeUser.starSign || '',
        mainPetName: safeUser.mainPetName || '',
        mainPetType: safeUser.mainPetType || '',
        mainPetBirth: safeUser.mainPetBirth || '',
        mainPetNotes: safeUser.mainPetNotes || '',
        petInsight: safeUser.petInsight || ''
      };
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
      if (/^(https?:\/\/|data:image\/|blob:|\/|\.\/|\.\.\/)/i.test(src)) return src;
      return fallback;
    }

    function normalizeUserAvatar(value) {
      const src = safeImageSrc(value, DEFAULT_USER_AVATAR);
      if (/design\.gemcoder\.com\/staticResource\/echoAiSystemImages/i.test(src)) return DEFAULT_USER_AVATAR;
      if (/\/assets\/avatars\/avatar\d+\.png$/i.test(src)) return DEFAULT_USER_AVATAR;
      return src || DEFAULT_USER_AVATAR;
    }

    function base64UrlEncode(value = '') {
      const bytes = new TextEncoder().encode(String(value));
      let binary = '';
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    function base64UrlDecode(value = '') {
      const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    function getHashPathAndParams() {
      const raw = window.location.hash.replace(/^#/, '');
      const [path = '', query = ''] = raw.split('?');
      return {
        path: path.split('/')[0],
        params: new URLSearchParams(query)
      };
    }

    function normalizeNfcPetPayload(payload = {}) {
      const raw = payload && typeof payload === 'object' ? payload : {};
      const id = String(raw.id || raw.i || raw.petId || raw.nfcId || raw.nid || `nfc-${Date.now()}`).trim();
      const contact = String(raw.nfcContact || raw.c || raw.ownerContact || raw.contact || '').trim();
      const rawTraits = Array.isArray(raw.traits)
        ? raw.traits
        : String(raw.traits || raw.tags || '')
          .split(/[,，;；]/)
          .map((trait) => trait.trim())
          .filter(Boolean);
      return {
        id,
        nfcId: String(raw.nfcId || raw.nid || buildPetNfcId({ id }, 0)).trim(),
        name: String(raw.name || raw.n || 'Found pet').trim(),
        type: String(raw.type || raw.t || 'Pet').trim(),
        breed: String(raw.breed || raw.b || 'Unknown').trim(),
        avatar: safeImageSrc(raw.avatar || raw.img || '', DEFAULT_PET_AVATAR),
        location: String(raw.location || raw.l || 'Campus').trim(),
        status: String(raw.status || raw.s || 'No recent status notes.').trim(),
        health: String(raw.health || raw.h || 'No health notes provided.').trim(),
        birthday: String(raw.birthday || raw.bd || raw.age || '').trim(),
        gender: String(raw.gender || raw.g || '').trim(),
        traits: rawTraits.slice(0, 6),
        nfcContact: contact,
        nfcNote: String(raw.nfcNote || raw.m || 'Please contact the owner if this pet is found.').trim(),
        ownerName: String(raw.ownerName || raw.o || raw.owner || 'Pet owner').trim(),
        ownerCampus: String(raw.ownerCampus || raw.campus || 'Taicang').trim(),
        ownerAvatar: safeImageSrc(raw.ownerAvatar || raw.oa || '', ''),
        ownerBio: String(raw.ownerBio || raw.ob || '').trim(),
        ownerUsername: String(raw.ownerUsername || raw.ou || '').trim(),
        publicNfc: true
      };
    }

    function readNfcDeepLink() {
      const query = new URLSearchParams(window.location.search);
      const hash = getHashPathAndParams();
      const encoded = query.get('nfc') || hash.params.get('nfc');
      const targetId = query.get('pet') || query.get('nfcId') || hash.params.get('pet') || hash.params.get('nfcId') || '';
      const hashPath = String(hash.path || '').toLowerCase();
      const isNfcRoute = hashPath === 'nfc' || query.has('nfc') || query.has('pet') || query.has('nfcId') || hash.params.has('nfc') || hash.params.has('pet') || hash.params.has('nfcId');
      if (encoded) {
        try {
          const parsed = JSON.parse(base64UrlDecode(encoded));
          return {
            pet: normalizeNfcPetPayload(parsed),
            targetId: String(parsed.id || parsed.i || parsed.nfcId || parsed.nid || targetId || '').trim(),
            isNfcRoute
          };
        } catch (err) {
          console.warn('Invalid NFC pet link payload', err);
        }
      }
      return { pet: null, targetId: String(targetId).trim(), isNfcRoute };
    }

    function buildAppRouteHref(tab = 'map') {
      const targetTab = String(tab || 'map').replace(/[^\w-]/g, '') || 'map';
      return `/?openApp=${encodeURIComponent(targetTab)}#${targetTab}`;
    }

    function shouldExitNfcStandalone() {
      if (!document.documentElement.classList.contains('nfc-deep-link')) return false;
      const nfcDeepLink = readNfcDeepLink();
      return !nfcDeepLink.isNfcRoute && !nfcDeepLink.pet && !nfcDeepLink.targetId;
    }

    function reloadOutsideNfcStandalone() {
      if (!shouldExitNfcStandalone()) return;
      const targetTab = getHashPathAndParams().path || 'map';
      window.location.replace(buildAppRouteHref(targetTab));
    }

    function contactHref(value = '') {
      const contact = String(value || '').trim();
      if (!contact) return '';
      if (/^https?:\/\//i.test(contact)) return contact;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return `mailto:${contact}`;
      const phone = contact.replace(/[^\d+]/g, '');
      if (phone.length >= 6) return `tel:${phone}`;
      return '';
    }

    function getContactActionMeta(value = '') {
      const href = contactHref(value);
      if (!href) return null;
      if (href.startsWith('tel:')) return { href, label: 'Call owner now', icon: 'fas fa-phone' };
      if (href.startsWith('mailto:')) return { href, label: 'Email owner', icon: 'fas fa-envelope' };
      return { href, label: 'Open contact', icon: 'fas fa-arrow-up-right-from-square' };
    }

    function buildPublicNfcPetPayload(pet = {}, user = getCurrentUser() || {}) {
      const avatar = safeImageSrc(pet.avatar, DEFAULT_PET_AVATAR);
      const ownerAvatar = safeImageSrc(user.avatar, '');
      return {
        v: 1,
        i: pet.id,
        nid: pet.nfcId || buildPetNfcId(pet, 0),
        n: pet.name || 'Found pet',
        t: pet.type || 'Pet',
        b: pet.breed || 'Unknown',
        l: pet.location || user.campus || 'Campus',
        h: pet.health || 'No health notes provided.',
        s: pet.status || 'No recent status notes.',
        bd: pet.birthday || pet.age || '',
        g: pet.gender || '',
        traits: Array.isArray(pet.traits) ? pet.traits.slice(0, 6) : [],
        c: pet.nfcContact || user.contact || '',
        m: pet.nfcNote || `${pet.name || 'This pet'} is friendly. Please contact the owner if found.`,
        o: user.displayName || user.username || 'Pet owner',
        campus: user.campus || 'Taicang',
        ownerUsername: user.username || '',
        ownerBio: user.bio || '',
        ownerAvatar: ownerAvatar.startsWith('data:image/') ? '' : ownerAvatar,
        img: avatar.startsWith('data:image/') ? '' : avatar
      };
    }

    function getPublicNfcCardId(pet = {}) {
      return String(pet.nfcId || pet.nid || buildPetNfcId(pet, 0)).trim();
    }

    function buildStablePublicNfcLink(pet = {}) {
      const cardId = getPublicNfcCardId(pet);
      return buildPublicAppUrl('/', (url) => {
        url.searchParams.set('nfcId', cardId);
        url.hash = 'nfc';
      });
    }

    function buildEmbeddedPublicNfcLink(pet = {}) {
      const payload = buildPublicNfcPetPayload(pet, getCurrentUser() || getDefaultUser());
      return buildPublicAppUrl('/', (url) => {
        url.searchParams.set('nfc', base64UrlEncode(JSON.stringify(payload)));
        url.hash = 'nfc';
      });
    }

    async function fetchPublicNfcPetCard(target = '') {
      const cardId = String(target || '').trim();
      if (!cardId) return null;
      try {
        const response = await fetch(apiUrl(`/api/nfc-pet-cards/${encodeURIComponent(cardId)}`), {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return null;
        const data = await response.json().catch(() => ({}));
        return data.pet || data.card || data.payload || null;
      } catch (err) {
        console.warn('Public NFC card lookup failed', err);
        return null;
      }
    }

    async function resolveNfcPetCard(nfcDeepLink = {}) {
      if (nfcDeepLink.pet) return normalizeNfcPetPayload(nfcDeepLink.pet);
      const target = String(nfcDeepLink.targetId || '').trim();
      if (!target) return null;
      const pets = getStoredPets();
      const matchedPet = pets.find((pet) => pet.id === target || pet.nfcId === target);
      if (matchedPet) return normalizeNfcPetPayload(buildPublicNfcPetPayload(matchedPet, getCurrentUser() || getDefaultUser()));
      const publicPet = await fetchPublicNfcPetCard(target);
      return publicPet ? normalizeNfcPetPayload(publicPet) : null;
    }

    function renderStandaloneNfcLoading(targetId = '') {
      const nfcRoot = document.getElementById('nfc-root');
      const content = document.getElementById('nfc-page-content');
      if (!nfcRoot || !content) return;
      nfcRoot.classList.remove('hidden');
      document.title = 'PAWTRACE · NFC Pet Card';
      content.innerHTML = `
        <section class="nfc-empty-card pixel-card">
          <div class="nfc-empty-icon"><i class="fas fa-id-card"></i></div>
          <h1>Loading NFC pet card</h1>
          <p>${targetId ? `Looking up ${escapeHtml(targetId)} from the public card service.` : 'Opening the public pet card.'}</p>
        </section>
      `;
    }

    function renderStandaloneNfcPage(petPayload, options = {}) {
      const nfcRoot = document.getElementById('nfc-root');
      const content = document.getElementById('nfc-page-content');
      if (!nfcRoot || !content) return;
      nfcRoot.classList.remove('hidden');
      if (!petPayload) {
        const target = String(options.targetId || '').trim();
        document.title = 'PAWTRACE · NFC Pet Card';
        content.innerHTML = `
          <section class="nfc-empty-card pixel-card">
            <div class="nfc-empty-icon"><i class="fas fa-id-card"></i></div>
            <h1>NFC pet card unavailable</h1>
            <p>${target ? `No local pet card matches ${escapeHtml(target)}.` : 'This NFC link does not contain a pet card yet.'}</p>
            <a class="pixel-button text-xs" href="${buildAppRouteHref('pets')}"><i class="fas fa-paw"></i><span>Open PAWTRACE</span></a>
          </section>
        `;
        return;
      }

      const pet = normalizeNfcPetPayload(petPayload);
      const petName = escapeHtml(pet.name || 'Found pet');
      const petType = escapeHtml(pet.type || 'Pet');
      const petBreed = escapeHtml(pet.breed || 'Unknown');
      const petLocation = escapeHtml(pet.location || 'Campus');
      const petHealth = escapeHtml(pet.health || 'No health notes provided.');
      const petStatus = escapeHtml(pet.status || 'No recent status notes.');
      const petNfcId = escapeHtml(pet.nfcId || '');
      const petNote = escapeHtml(pet.nfcNote || 'Please contact the owner if found.');
      const petBirthday = escapeHtml(pet.birthday || 'Not provided');
      const petGender = escapeHtml(pet.gender || 'Not provided');
      const contact = escapeHtml(pet.nfcContact || 'Not provided');
      const ownerName = escapeHtml(pet.ownerName || 'Pet owner');
      const ownerCampus = escapeHtml(pet.ownerCampus || 'Taicang');
      const ownerBio = escapeHtml(pet.ownerBio || 'Owner profile details are not shared on this card.');
      const ownerAvatar = safeImageSrc(pet.ownerAvatar, '');
      const petAvatar = escapeHtml(safeImageSrc(pet.avatar, DEFAULT_PET_AVATAR));
      const traits = Array.isArray(pet.traits) ? pet.traits.filter(Boolean).slice(0, 6) : [];
      const traitsMarkup = traits.length
        ? traits.map((trait) => `<span>${escapeHtml(trait)}</span>`).join('')
        : '<span>Care profile</span>';
      const contactAction = getContactActionMeta(pet.nfcContact);
      const contactActionMarkup = contactAction
        ? `<a class="pixel-button nfc-call-button" href="${escapeHtml(contactAction.href)}"><i class="${escapeHtml(contactAction.icon)}"></i><span>${escapeHtml(contactAction.label)}</span></a>`
        : '';
      const appChatHref = buildAppRouteHref('chat');
      document.title = `${pet.name || 'Pet'} · PAWTRACE NFC Pet Card`;
      content.innerHTML = `
        <section class="nfc-hero-card">
          <div class="nfc-photo-frame">
            <img src="${petAvatar}" alt="${petName}" loading="eager" decoding="async" />
          </div>
          <div class="nfc-hero-copy">
            <div class="nfc-card-meta">
              <span><i class="fas fa-id-card"></i> NFC Emergency Pet Card</span>
              <strong>${petNfcId}</strong>
            </div>
            <h1>Help ${petName} get home</h1>
            <p class="nfc-pet-line">${petType} · ${petBreed} · ${petLocation}</p>
            <div class="nfc-trait-list">${traitsMarkup}</div>
            <div class="nfc-action-row">
              ${contactActionMarkup}
              <a class="pixel-button nfc-app-action" href="${appChatHref}">
                <i class="fas fa-comment-dots"></i><span>Log in to app chat</span>
              </a>
              <button type="button" class="pixel-button nfc-secondary-action" data-nfc-copy-contact>
                <i class="fas fa-copy"></i><span>Copy contact</span>
              </button>
              <button type="button" class="pixel-button nfc-secondary-action" data-nfc-copy-link>
                <i class="fas fa-link"></i><span>Copy card link</span>
              </button>
            </div>
          </div>
        </section>
        <section class="nfc-info-grid">
          <article class="nfc-info-panel">
            <p class="nfc-panel-label">Pet information</p>
            <dl class="nfc-detail-list">
              <div><dt>Status</dt><dd>${petStatus}</dd></div>
              <div><dt>Health notes</dt><dd>${petHealth}</dd></div>
              <div><dt>Birthday / adoption</dt><dd>${petBirthday}</dd></div>
              <div><dt>Gender</dt><dd>${petGender}</dd></div>
            </dl>
          </article>
          <article class="nfc-info-panel">
            <p class="nfc-panel-label">Owner information</p>
            <div class="nfc-owner-row">
              ${ownerAvatar ? `<img src="${escapeHtml(ownerAvatar)}" alt="${ownerName}" loading="lazy" decoding="async" />` : '<span><i class="fas fa-user"></i></span>'}
              <div>
                <strong>${ownerName}</strong>
                <p>${ownerCampus}</p>
              </div>
            </div>
            <dl class="nfc-detail-list">
              <div><dt>Emergency contact</dt><dd>${contact}</dd></div>
              <div><dt>Profile note</dt><dd>${ownerBio}</dd></div>
            </dl>
            <a class="nfc-owner-chat-link" href="${appChatHref}">
              <i class="fas fa-message"></i><span>Sign in to PAWTRACE and contact the owner in app</span>
            </a>
          </article>
          <article class="nfc-info-panel nfc-info-panel--note">
            <p class="nfc-panel-label">Care note</p>
            <strong>${petNote}</strong>
            <p>${petName} was registered in PAWTRACE for quick return support.</p>
          </article>
        </section>
      `;
      content.querySelector('[data-nfc-copy-contact]')?.addEventListener('click', async () => {
        const text = pet.nfcContact || '';
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          alert('Owner contact copied.');
        } catch {
          alert(text);
        }
      });
      content.querySelector('[data-nfc-copy-link]')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('NFC link copied.');
        } catch {
          alert(window.location.href);
        }
      });
    }

    function restoreImagePreviewElement(img) {
      if (!img) return;
      delete img.dataset.fallback;
      delete img.dataset.fallbackApplied;
      img.style.display = '';
      const fallback = img.nextElementSibling;
      if (fallback?.classList?.contains('img-fallback')) fallback.remove();
    }

    function getImageFallbackSource(img, fallback = '') {
      if (fallback) return fallback;
      const attrFallback = img?.dataset?.fallbackSrc || img?.getAttribute?.('data-fallback-src') || img?.dataset?.fallback || '';
      if (attrFallback) return safeImageSrc(attrFallback, '');
      if (img?.closest?.('.chat-contact-item, .contact-hover-card, .chat-main-header, #chat-avatar, #contact-list')) return DEFAULT_USER_AVATAR;
      if (img?.closest?.('.chat-sticker-panel, .bubble-sticker')) return DEFAULT_STICKER_IMAGE;
      if (img?.closest?.('#pet-list, #community-pet-feed, .map-pet, .tracked-pet-row, .pet-owned-card, .community-card, .nfc-photo-frame')) return DEFAULT_PET_AVATAR;
      const id = String(img?.id || '');
      if (
        id === 'current-user-avatar' ||
        id === 'profile-avatar' ||
        id === 'profile-avatar-preview-img' ||
        id === 'chat-avatar' ||
        id === 'hover-avatar'
      ) {
        return DEFAULT_USER_AVATAR;
      }
      if (id === 'map-background-img') return '/assets/m2.png';
      const descriptor = [
        id,
        img?.className || '',
        img?.alt || '',
        img?.getAttribute?.('src') || ''
      ].join(' ').toLowerCase();
      if (/avatar|profile|contact|owner|user|friend|hover/.test(descriptor)) return DEFAULT_USER_AVATAR;
      if (/sticker|emoji|reaction/.test(descriptor)) return DEFAULT_STICKER_IMAGE;
      if (/map|campus|background|m1\.jpg|m2\.png/.test(descriptor)) return '/assets/m2.png';
      if (/pet|paw|photo|preview|community|nfc|feed|share|diagnosis/.test(descriptor)) return DEFAULT_PET_AVATAR;
      if (descriptor.trim()) return DEFAULT_PET_AVATAR;
      return '';
    }

    let imageFallbackHandlerInstalled = false;

    function installImageFallbackHandler() {
      if (imageFallbackHandlerInstalled) return;
      imageFallbackHandlerInstalled = true;
      document.addEventListener('error', (event) => {
        const img = event.target;
        if (!(img instanceof HTMLImageElement)) return;
        if (img.dataset.fallbackApplied === '1') return;
        const fallbackSrc = getImageFallbackSource(img, '');
        if (!fallbackSrc) return;
        const currentSrc = img.getAttribute('src') || '';
        if (currentSrc === fallbackSrc) return;
        img.dataset.fallbackApplied = '1';
        img.src = fallbackSrc;
      }, true);
    }

    function setPreviewImageSource(img, src, fallback = '') {
      if (!img) return;
      restoreImagePreviewElement(img);
      const fallbackSrc = getImageFallbackSource(img, fallback);
      if (fallbackSrc) {
        img.dataset.fallback = fallbackSrc;
        img.onerror = () => {
          if (img.dataset.fallbackApplied === '1') return;
          img.dataset.fallbackApplied = '1';
          img.src = fallbackSrc;
        };
      } else {
        img.onerror = null;
      }
      const resolvedSrc = safeImageSrc(src, fallbackSrc);
      if (resolvedSrc) {
        img.dataset.fallbackApplied = resolvedSrc === fallbackSrc ? '1' : '0';
        img.src = resolvedSrc;
      } else {
        img.removeAttribute('src');
      }
    }

    function setChatToggleLabel(button, label) {
      if (!button) return;
      const labelEl = button.querySelector('span');
      if (labelEl) {
        labelEl.textContent = label;
        return;
      }
      button.textContent = label;
    }

    function createGuestUser() {
      return {
        username: 'guest',
        displayName: 'Guest Explorer',
        avatar: DEFAULT_USER_AVATAR,
        bio: 'Exploring PAWTRACE without logging in.',
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
      return createGuestUser();
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
      const eventStatusEl = document.getElementById('behaviour-event-status');
      const adviceListEl = document.getElementById('behaviour-advice-list');
      const historyBarsEl = document.getElementById('behaviour-history-bars');
      const riskSummaryEl = document.getElementById('behaviour-risk-summary');
      const riskTitleEl = document.getElementById('behaviour-risk-title');
      const riskBadgeEl = document.getElementById('behaviour-risk-badge');
      const riskCopyEl = document.getElementById('behaviour-risk-copy');
      const videoPanel = document.getElementById('ai-video-panel');
      const riskMeterSteps = Array.from((videoPanel || document).querySelectorAll('.behaviour-risk-meter span'));
      const timeAxisEl = (videoPanel || document).querySelector('.behaviour-time-axis');
      const timelineTitleEl = (videoPanel || document).querySelector('.behaviour-timeline-card h3');
      if (!fileInput || !dropzone || !timelineEl) return;

      let previewUrl = '';
      let selectedVideoFile = null;
      const behaviorDisclaimer = 'This result is only a behavior-risk hint and does not constitute veterinary diagnosis.';

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
        const activeCount = normalized === 'high' ? 3 : normalized === 'medium' ? 2 : 1;
        riskMeterSteps.forEach((step, index) => {
          step.classList.toggle('active', index < activeCount);
        });
        if (riskCopyEl) {
          riskCopyEl.textContent = normalized === 'high'
            ? 'Multiple behavior signals appeared in the same clip. Record frequency, duration, and context, and consult a veterinarian if needed.'
            : normalized === 'low'
              ? 'No strong abnormal movement cluster was detected. Keep short videos for future comparison.'
              : 'Some behaviors are above the weekly baseline. PAWTRACE only provides observation hints and does not judge the cause.';
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

      function renderTimeline(segments = [], events = [], duration = 60, unit = 'min') {
        if (timelineTitleEl) timelineTitleEl.textContent = unit === 'sec' ? `${Math.round(duration)}s video scan` : '60min activity scan';
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

      function renderEvents(events = []) {
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
        if (eventStatusEl) {
          const hasHighRisk = events.some((event) => String(event.risk || '').toLowerCase() === 'high');
          eventStatusEl.textContent = events.length ? 'Needs review' : 'No events';
          eventStatusEl.classList.toggle('behaviour-status-chip--high', hasHighRisk);
        }
      }

      function renderAdvice(items = []) {
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
        historyBarsEl.innerHTML = `
          <div class="behaviour-advice-row">
            <i class="fas fa-chart-simple"></i>
            <div>
              <strong>No comparison yet</strong>
              <span>History appears after multiple video checks.</span>
            </div>
          </div>
        `;
      }

      function renderEmptyVideoState() {
        if (detectedPetEl) detectedPetEl.textContent = '--';
        if (durationEl) durationEl.textContent = '--';
        if (detectionRateEl) detectionRateEl.textContent = '--';
        if (movementScoreEl) movementScoreEl.textContent = '--';
        if (eventCountEl) eventCountEl.textContent = '0';
        setStatus('Ready');
        riskSummaryEl?.classList.remove('behaviour-risk-summary--low', 'behaviour-risk-summary--medium', 'behaviour-risk-summary--high');
        riskSummaryEl?.classList.add('behaviour-risk-summary--low');
        if (riskSummaryEl) riskSummaryEl.innerHTML = '<span>Risk</span><strong>--</strong>';
        riskBadgeEl?.classList.remove('behaviour-risk-badge--low', 'behaviour-risk-badge--medium', 'behaviour-risk-badge--high');
        riskBadgeEl?.classList.add('behaviour-risk-badge--low');
        if (riskBadgeEl) riskBadgeEl.textContent = 'Not checked';
        if (riskTitleEl) riskTitleEl.textContent = 'Ready for upload';
        riskMeterSteps.forEach((step) => step.classList.remove('active'));
        if (riskCopyEl) riskCopyEl.textContent = 'Upload a clip to generate behavior observation prompts.';
        if (timelineTitleEl) timelineTitleEl.textContent = 'Waiting for video';
        renderAxis(60, 'min');
        if (timelineEl) {
          timelineEl.innerHTML = '<div style="width:100%;display:grid;place-items:center;color:#64748b;font-size:0.75rem;">No video selected</div>';
        }
        if (markersEl) markersEl.innerHTML = '';
        if (eventStatusEl) {
          eventStatusEl.textContent = 'Pending video';
          eventStatusEl.classList.remove('behaviour-status-chip--high');
        }
        if (eventListEl) {
          eventListEl.innerHTML = `
            <div class="behaviour-advice-row">
              <i class="fas fa-video"></i>
              <div>
                <strong>No clip uploaded</strong>
                <span>Choose a pet video to review movement and observation prompts.</span>
              </div>
            </div>
          `;
        }
        if (adviceListEl) {
          adviceListEl.innerHTML = `
            <div class="behaviour-advice-row">
              <i class="fas fa-clipboard-list"></i>
              <div>
                <strong>Before checking</strong>
                <span>Use a clear, steady clip that shows the full body and walking or resting behavior.</span>
              </div>
            </div>
          `;
        }
        if (historyBarsEl) {
          historyBarsEl.innerHTML = `
            <div class="behaviour-advice-row">
              <i class="fas fa-chart-simple"></i>
              <div>
                <strong>No comparison yet</strong>
                <span>History appears after at least one video check.</span>
              </div>
            </div>
          `;
        }
      }

      function setStatus(text, mode = '') {
        if (!analysisStatus) return;
        analysisStatus.textContent = text;
        analysisStatus.classList.toggle('behaviour-status-chip--high', mode === 'high');
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
          { title: 'Activity type', detail: toTitleLabel(summary.activityType || 'normal_movement') },
          { title: 'Movement score', detail: `${Number.isFinite(Number(summary.movementScore)) ? summary.movementScore : 0} / 100` },
          { title: 'Advice', detail: data?.advice || 'Movement pattern looks generally normal in this short video.' },
          { title: 'Disclaimer', detail: data?.disclaimer || behaviorDisclaimer }
        ]);
        renderHistory();
        if (riskCopyEl) {
          riskCopyEl.textContent = `The video check reviewed ${summary.analyzedFrames || 0} frames and detected the pet in ${summary.detectedFrames || 0}. ${data?.disclaimer || behaviorDisclaimer}`;
        }
        setStatus('Video check complete', risk === 'high' ? 'high' : '');
      }

      async function analyzeUploadedVideo(file) {
        if (!file) return;
        const formData = new FormData();
        formData.append('video', file);
        setStatus('Checking video...');
        try {
          const response = await fetch(apiUrl('/api/ai/video-behavior'), {
            method: 'POST',
            headers: authHeaders(),
            body: formData
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Please sign in before running the video check.');
            }
            const detail = typeof data?.detail === 'string' ? data.detail : '';
            throw new Error(detail || data?.error || 'Video check failed');
          }
          renderYoloResult(data);
        } catch (err) {
          console.warn('Standalone video behavior check failed', err);
          setStatus(err instanceof Error ? err.message : 'Video service unavailable', 'high');
          if (riskCopyEl) {
            riskCopyEl.textContent = 'The video analysis service is unavailable. Check the backend service and try again.';
          }
        }
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
        setStatus('Ready to check');
        if (riskCopyEl) riskCopyEl.textContent = 'Click Start Video Check to review this clip.';
      }

      uploadTrigger?.addEventListener('click', () => fileInput.click());
      demoRunBtn?.addEventListener('click', () => {
        if (selectedVideoFile) {
          analyzeUploadedVideo(selectedVideoFile);
          return;
        }
        renderEmptyVideoState();
        setStatus('Choose a video first');
        fileInput.click();
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
      renderEmptyVideoState();
    }

    document.addEventListener('DOMContentLoaded', () => {
      initModalSystem();
      installImageFallbackHandler();
      const loginScreen = document.getElementById('login-screen');
      const appRoot = document.getElementById('app-root');
      const nfcRoot = document.getElementById('nfc-root');
      const authMsg = document.getElementById('auth-message');
      const mobileTabbar = document.getElementById('mobile-tabbar');
      const guestAccessBtn = document.getElementById('btn-guest-access');
      const authPrivacyConsent = document.getElementById('auth-privacy-consent');
      const nfcDeepLink = readNfcDeepLink();
      activeNfcPetCard = nfcDeepLink.pet;
      activeNfcTargetId = nfcDeepLink.targetId || nfcDeepLink.pet?.id || nfcDeepLink.pet?.nfcId || '';
      const hasNfcDeepLink = Boolean(nfcDeepLink.isNfcRoute || activeNfcPetCard || activeNfcTargetId);
      window.addEventListener('hashchange', reloadOutsideNfcStandalone);
      aiServiceOutputEl = document.getElementById('ai-service-output');
      aiServiceStatusEl = document.getElementById('ai-service-status');
      aiServiceButtons = Array.from(document.querySelectorAll('.ai-service-card[data-ai-service]'));
      const aiIntroBody = document.getElementById('ai-intro-body');
      const aiIntroToggle = document.getElementById('ai-intro-toggle');
      const chatToggleContacts = document.getElementById('chat-toggle-contacts');
      const chatLeftPane = document.getElementById('chat-left-pane');
      const chatBackBtn = document.getElementById('chat-back-btn');
      const chatTabBack = document.getElementById('chat-tab-back');
      const mapOpenPetsBtn = document.getElementById('map-open-pets');
      const mapOpenHealthBtn = document.getElementById('map-open-health');
      const healthJumpManualBtn = document.getElementById('health-jump-manual');
      const healthOpenMapBtn = document.getElementById('health-open-map');
      const profileQuickEditBtn = document.getElementById('btn-profile-quick-edit');
      const profileOpenPetsBtn = document.getElementById('profile-open-pets');
      const healthManualCard = document.getElementById('health-manual-card');
      const aiModeButtons = Array.from(document.querySelectorAll('[data-ai-mode]'));
      const aiPhotoPanel = document.getElementById('ai-photo-panel');
      const aiVideoPanel = document.getElementById('ai-video-panel');
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
      const aiStatusBadge = document.getElementById('ai-status-badge');

      setAIAssistMode = (mode = 'photo') => {
        selectedAIMode = mode === 'video' ? 'video' : 'photo';
        const showVideo = selectedAIMode === 'video';
        aiModeButtons.forEach((button) => {
          const active = button.getAttribute('data-ai-mode') === selectedAIMode;
          button.classList.toggle('active', active);
          button.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        aiPhotoPanel?.classList.toggle('hidden', showVideo);
        aiPhotoPanel?.setAttribute('aria-hidden', showVideo ? 'true' : 'false');
        aiVideoPanel?.classList.toggle('hidden', !showVideo);
        aiVideoPanel?.setAttribute('aria-hidden', showVideo ? 'false' : 'true');
      };
      aiModeButtons.forEach((button) => {
        button.addEventListener('click', () => setAIAssistMode?.(button.getAttribute('data-ai-mode') || 'photo'));
      });
      setAIAssistMode('photo');

      const tabLogin = document.getElementById('tab-login');
      const tabRegister = document.getElementById('tab-register');
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');

      const loginUsername = document.getElementById('login-username');
      const loginPassword = document.getElementById('login-password');
      const regUsername = document.getElementById('reg-username');
      const regDisplayName = document.getElementById('reg-displayname');
      const regPassword = document.getElementById('reg-password');
      const mapOptions = {
        container: document.getElementById('map-container'),
        background: document.getElementById('map-background'),
        realMapTiles: document.getElementById('real-map-tiles'),
        realMapFrame: document.getElementById('real-map-frame'),
        realMapLink: document.getElementById('real-map-link'),
        overlayLayer: document.getElementById('map-overlay-layer'),
        markersLayer: document.getElementById('map-markers-layer'),
        petsLayer: document.getElementById('map-pets-layer'),
        controls: {
          zoomIn: document.getElementById('map-zoom-in'),
          zoomOut: document.getElementById('map-zoom-out'),
          reset: document.getElementById('map-reset-view'),
          zoomLabel: document.getElementById('map-zoom-label'),
          fenceToggle: document.getElementById('map-toggle-fence'),
          toolPetName: document.getElementById('map-tool-pet-name'),
          fenceStatus: document.getElementById('map-fence-status'),
          fenceEnabled: document.getElementById('map-fence-enable'),
          fenceRadius: document.getElementById('map-fence-radius'),
          fenceRadiusValue: document.getElementById('map-fence-radius-value'),
          fencePickCenter: document.getElementById('map-fence-pick-center'),
          fenceCenterCurrent: document.getElementById('map-fence-center-current')
        },
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
          setChatToggleLabel(chatToggleContacts, isOpen ? 'Show chat' : 'Show friends');
        });
      }
      if (chatBackBtn && chatLeftPane) {
        chatBackBtn.addEventListener('click', () => {
          chatLeftPane.classList.add('open');
          setChatToggleLabel(chatToggleContacts, 'Show chat');
        });
      }
      if (chatTabBack) {
        chatTabBack.addEventListener('click', () => {
          document.querySelector('.app-tab[data-tab="pets"]')?.click();
        });
      }
      mapOpenPetsBtn?.addEventListener('click', () => activateAppTab?.('pets'));
      mapOpenHealthBtn?.addEventListener('click', () => activateAppTab?.('health'));
      healthOpenMapBtn?.addEventListener('click', () => activateAppTab?.('map'));
      profileOpenPetsBtn?.addEventListener('click', () => activateAppTab?.('pets'));
      profileQuickEditBtn?.addEventListener('click', openProfileEditModal);
      healthJumpManualBtn?.addEventListener('click', () => {
        healthManualCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('health-input-temp')?.focus({ preventScroll: true });
      });
      aiUpgradeBtn?.addEventListener('click', () => {
      alert('AI tips are drafts for organizing care notes. For urgent or worsening symptoms, contact a veterinarian.');
      });

      // Photo check handlers
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
          showDiagnosisPreview(dataUrl);
          if (diagResult) {
            diagResult.innerHTML = `
              <div class="text-[11px] text-gray-600">
                Photo ready. Add symptoms if helpful, then start the photo check.
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
      if (headerConnectionStatusEl) {
        headerConnectionStatusEl.tabIndex = 0;
        headerConnectionStatusEl.setAttribute('role', 'button');
        headerConnectionStatusEl.style.cursor = 'pointer';
        headerConnectionStatusEl.addEventListener('click', promptApiBaseOverride);
        headerConnectionStatusEl.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          promptApiBaseOverride();
        });
      }
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

      function updateProfileDetails(user) {
        if (!user) return;
        if (profileStarSignEl) {
          profileStarSignEl.textContent = user.starSign
            ? `Care focus: ${user.starSign}`
            : 'Care focus: Not set';
        }
        const mainPetLabel = user.mainPetName ? `${user.mainPetName} · ${user.mainPetType || 'Pet'}` : 'Add your main pet to personalize insights.';
        if (profileMainPetEl) profileMainPetEl.textContent = mainPetLabel;
        if (profileSideFocusEl) profileSideFocusEl.textContent = user.mainPetName || 'Not set';
        if (profilePetNotesEl) profilePetNotesEl.textContent = user.mainPetNotes || 'Share habits and quirks to give the AI more context.';
        if (petInsightText) {
          petInsightText.textContent = user.petInsight || 'Tap "Ask AI" to get a care insight.';
        }
      }

      async function fetchPetInsight(force = false) {
        const user = getCurrentUser();
        if (!user || !petInsightText) return;
        if (!user.starSign && !user.mainPetName) {
          petInsightText.textContent = 'Add a care focus or main pet info to unlock insights.';
          return;
        }
        if (!force && user.petInsight) {
          petInsightText.textContent = user.petInsight;
          return;
        }
        petInsightText.textContent = 'Asking AI for a fresh insight...';
        try {
          const response = await authJsonFetch('/api/pet-prediction', {
            method: 'POST',
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

      function aiSourceLabel(source = '') {
        if (source === 'qwen-vl') return 'Qwen3.6 Vision';
        if (source === 'qwen' || source === 'qwen-text-fallback') return 'Qwen3.6';
        if (source === 'local') return 'Local fallback';
        return 'AI';
      }

      function setAIStatusBadge(message, mode = 'unknown') {
        if (!aiStatusBadge) return;
        aiStatusBadge.textContent = message;
        aiStatusBadge.classList.toggle('text-green-600', mode === 'ready');
        aiStatusBadge.classList.toggle('text-amber-600', mode === 'fallback');
        aiStatusBadge.classList.toggle('text-gray-500', mode !== 'ready' && mode !== 'fallback');
      }

      function setConnectionStatus(message, mode = 'unknown') {
        if (!headerConnectionStatusEl) return;
        headerConnectionStatusEl.textContent = message;
        headerConnectionStatusEl.title = API_BASE_URL
          ? `API: ${API_BASE_URL}`
          : 'API: same origin /api';
        headerConnectionStatusEl.classList.toggle('text-green-600', mode === 'ready');
        headerConnectionStatusEl.classList.toggle('text-red-500', mode === 'error');
        headerConnectionStatusEl.classList.toggle('text-gray-500', mode !== 'ready' && mode !== 'error');
      }

      async function refreshBackendStatus() {
        setConnectionStatus(API_BASE_URL ? 'API checking' : 'API same-origin', 'unknown');
        try {
          const response = await fetchWithTimeout('/api/status', {
            cache: 'no-store',
          }, STATUS_API_TIMEOUT_MS);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          setConnectionStatus('API online', 'ready');
        } catch (err) {
          console.warn('Backend status check failed', err);
          setConnectionStatus('API unreachable', 'error');
        }
      }

      async function refreshAIStatus() {
        try {
          const response = getAuthToken()
            ? await authJsonFetch('/api/ai/status', { timeoutMs: STATUS_API_TIMEOUT_MS })
            : await fetchWithTimeout('/api/ai/status', {}, STATUS_API_TIMEOUT_MS);
          if (!response.ok) throw new Error('AI status unavailable');
          const data = await response.json();
          if (data?.dashscopeConfigured) {
            setAIStatusBadge(`AI status: ${data.textModel || 'qwen3.6-plus'} ready`, 'ready');
          } else {
            setAIStatusBadge('AI status: local fallback', 'fallback');
          }
        } catch (err) {
          console.warn('AI status check failed', err);
          setAIStatusBadge('AI status: unavailable', 'fallback');
        }
      }

      function setDiagStatus(message, isError = false) {
        if (!diagStatus) return;
        diagStatus.textContent = message;
        diagStatus.classList.remove('hidden');
        diagStatus.classList.toggle('text-red-500', isError);
        diagStatus.classList.toggle('text-primary', !isError);
      }

      function buildAIHamsterLoaderMarkup(title = 'Generating AI report', detail = 'Reviewing pet details...') {
        return `
          <div class="ai-service-loading-state ai-fade" role="status" aria-live="polite">
            <div class="ai-hamster-loader" aria-label="Orange and tan hamster running in a metal wheel" role="img">
              <div class="ai-hamster-loader__wheel"></div>
              <div class="ai-hamster-loader__hamster">
                <div class="ai-hamster-loader__body">
                  <div class="ai-hamster-loader__head">
                    <div class="ai-hamster-loader__ear"></div>
                    <div class="ai-hamster-loader__eye"></div>
                    <div class="ai-hamster-loader__nose"></div>
                  </div>
                  <div class="ai-hamster-loader__limb ai-hamster-loader__limb--fr"></div>
                  <div class="ai-hamster-loader__limb ai-hamster-loader__limb--fl"></div>
                  <div class="ai-hamster-loader__limb ai-hamster-loader__limb--br"></div>
                  <div class="ai-hamster-loader__limb ai-hamster-loader__limb--bl"></div>
                  <div class="ai-hamster-loader__tail"></div>
                </div>
              </div>
              <div class="ai-hamster-loader__spoke"></div>
            </div>
            <div class="space-y-1">
              <p class="text-sm font-semibold text-dark">${escapeHtml(title)}</p>
              <p class="text-[11px] text-gray-500">${escapeHtml(detail)}</p>
            </div>
          </div>
        `;
      }

      function toggleDiagLoading(show) {
        if (diagLoading) {
          diagLoading.classList.toggle('hidden', !show);
          diagLoading.setAttribute('aria-hidden', show ? 'false' : 'true');
          diagLoading.style.display = show ? '' : 'none';
        }
        if (diagResult) {
          diagResult.classList.toggle('hidden', show);
          diagResult.setAttribute('aria-hidden', show ? 'true' : 'false');
          diagResult.style.display = show ? 'none' : '';
        }
      }

      function resetDiagnosisUI() {
        diagDropzone?.classList.remove('has-preview', 'has-preview-error');
        if (diagPreview) diagPreview.classList.add('hidden');
        if (diagPlaceholder) diagPlaceholder.classList.remove('hidden');
        if (diagPreviewImg) {
          diagPreviewImg.removeAttribute('data-loaded');
          diagPreviewImg.onload = null;
          diagPreviewImg.onerror = null;
          setPreviewImageSource(diagPreviewImg, '');
        }
        if (diagFileInput) diagFileInput.value = '';
        if (diagSymptoms) diagSymptoms.value = '';
        if (diagResult) {
          diagResult.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
              <div class="w-20 h-20 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-file-medical-alt text-3xl opacity-20 text-dark"></i>
              </div>
              <p class="text-sm font-medium text-gray-600">Waiting for details</p>
              <p class="text-[11px] mt-1 max-w-[220px] leading-relaxed">Upload a photo or describe symptoms to create an observation note.</p>
            </div>
          `;
        }
        toggleDiagLoading(false);
        if (diagStatus) diagStatus.classList.add('hidden');
      }

      function showDiagnosisPreview(dataUrl) {
        if (!diagPreview || !diagPreviewImg) return;
        diagDropzone?.classList.remove('has-preview-error');
        diagDropzone?.classList.add('has-preview');
        diagPreview.classList.remove('hidden');
        diagPlaceholder?.classList.add('hidden');
        diagPreviewImg.removeAttribute('data-loaded');
        diagPreviewImg.onload = () => {
          diagPreviewImg.setAttribute('data-loaded', 'true');
          diagDropzone?.classList.remove('has-preview-error');
        };
        diagPreviewImg.onerror = () => {
          diagPreviewImg.removeAttribute('data-loaded');
          diagDropzone?.classList.add('has-preview-error');
          setDiagStatus('Preview unavailable for this image format. Try JPG or PNG for visible preview.', true);
        };
        setPreviewImageSource(diagPreviewImg, dataUrl);
      }

      function renderDiagnosisResult(text) {
        if (!diagResult) return;
        toggleDiagLoading(false);
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
        setDiagStatus(file ? 'Reviewing the pet photo...' : 'Reviewing symptoms without a photo...');
        try {
          if (diagResult) {
            diagResult.innerHTML = buildAIHamsterLoaderMarkup(
              file ? 'Analyzing pet photo' : 'Analyzing symptoms',
              file ? 'Reviewing visible posture, skin, and fur details...' : 'Reviewing care notes and symptom details...'
            );
          }
          if (file) {
            const base64 = await fileToBase64(file);
            const response = await authJsonFetch('/api/ai/qwen-diagnosis', {
              method: 'POST',
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type || 'image/jpeg',
                symptoms
              })
            });
            if (!response.ok) {
              const errText = await response.text();
              throw new Error(errText || 'Photo check request failed');
            }
            const data = await response.json();
            const text = data?.result || data?.text || 'Unable to generate analysis. Please try a clearer photo.';
            renderDiagnosisResult(text);
            setDiagStatus(`Photo check complete · ${aiSourceLabel(data?.source)}`, data?.source === 'local');
          } else {
            const response = await authJsonFetch('/api/ai/qwen-advice', {
              method: 'POST',
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
              setDiagStatus(`AI analysis complete · ${aiSourceLabel(data?.source)}`, data?.source === 'local');
            } else {
              throw new Error('Text-only AI request failed');
            }
          }
        } catch (err) {
          console.warn('Photo check error', err);
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
          btn.classList.toggle('scale-[1.02]', btn.getAttribute('data-ai-service') === serviceKey && window.innerWidth > 640);
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
          aiServiceOutputEl.innerHTML = buildAIHamsterLoaderMarkup(
            `Generating ${AI_SERVICE_CONFIG[selectedAIService]?.label || 'AI report'}`,
            'Reviewing profile details and care notes...'
          );
        }
        try {
          const response = await authJsonFetch(config.endpoint, {
            method: 'POST',
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
            const sourceLabel = aiSourceLabel(data?.source);
            setAIServiceStatus(`Complete · ${AI_SERVICE_CONFIG[selectedAIService]?.label || 'AI report'} · ${sourceLabel}`, data?.source === 'local');
            return;
          }
        } catch (err) {
          console.warn('Text AI service error', err);
          renderTextResult(generateMockAIResponse(selectedAIService, user));
          setAIServiceStatus('AI service unavailable, showing a local example', true);
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
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        switch (serviceKey) {
          case 'health':
            return `
              **${petName} · Health Report**
              - ${rand(['Weight and body condition look steady', 'Weight has changed slightly; monitor treats and meals', 'Activity looks normal for a routine check-in'])}; keep ${rand(['2-3 calm walks each week', 'one short walk daily', 'mixed sniff walks and light play'])}.
              - Reminder: ${rand(['check vaccine dates in the profile', 'record the next vet visit date', 'update the latest health note after the next checkup'])}.
              - ${rand(['Add dental care notes twice a week', 'Check ears after outdoor play', 'Check paw pads in dry weather'])}.
            `;
          case 'diet':
            return `
              **Diet Guide**
              - Meals: keep portions consistent and record any appetite changes.
              - Snacks: ${rand(['use small training treats only', 'avoid adding new snacks during stomach upset', 'track treats separately from meals'])}.
              - Hydration: ${rand(['refresh water twice daily', 'watch water intake after walks', 'note any sudden increase or decrease in drinking'])}.
              - Follow-up: adjust the diet with a vet if vomiting, diarrhea, or weight loss appears.
            `;
          default:
            return 'Choose a care topic and add pet details to create a draft note.';
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
            setPreviewImageSource(profileAvatarPreviewImg, normalizeUserAvatar(getCurrentUser()?.avatar), DEFAULT_USER_AVATAR);
          }
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an avatar under 5MB.');
          editAvatarFileInput.value = '';
          return;
        }
        try {
          const data = await fileToAvatarDataURL(file);
          pendingAvatarData = data;
          setPreviewImageSource(profileAvatarPreviewImg, data, DEFAULT_USER_AVATAR);
        } catch (err) {
          console.warn('Avatar load failed', err);
          pendingAvatarData = null;
        }
      });

      function showApp(user) {
        authMsg.textContent = '';
        closeAllModals();
        nfcRoot?.classList.add('hidden');
        loginScreen?.classList.add('hidden');
        appRoot.classList.remove('hidden');
        mobileTabbar?.classList.remove('hidden');
        syncMobileChromeState();
        const displayName = user.displayName || user.username;
        const avatar = normalizeUserAvatar(user.avatar);
        currentUserNameEl.textContent = displayName;
        setPreviewImageSource(currentUserAvatarEl, avatar, DEFAULT_USER_AVATAR);
        if (sidebarUserNameEl) sidebarUserNameEl.textContent = displayName;
        if (headerConnectionStatusEl) headerConnectionStatusEl.textContent = `${user.campus || 'Taicang'} · Connected`;
        setPreviewImageSource(profileAvatarEl, avatar, DEFAULT_USER_AVATAR);
        profileNameEl.textContent = displayName;
        profileUsernameEl.textContent = '@' + user.username;
        profileBioEl.textContent = user.bio || 'Welcome to PAWTRACE!';
        profileCampusEl.textContent = user.campus || 'Taicang';
        profileContactEl.textContent = user.contact || 'Contact: N/A';
        updateProfileDetails(user);
        initTabs();
        initPets();
        window.openNfcPetDeepLink?.();
        initHealthMonitor();
        initWifiTelemetryBridge();
        initBluetoothTelemetryBridge();
        mapController?.refreshTrackedPets?.();
        initChat();
        handleScrollReveal();
        refreshBackendStatus();
        refreshAIStatus();
        fetchPetInsight();
        startDeviceTelemetrySync();
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
      authPrivacyConsent?.addEventListener('change', () => {
        if (authPrivacyConsent.checked && authMsg.textContent.includes('Data & Privacy Agreement')) {
          authMsg.textContent = '';
        }
      });

      function ensurePrivacyConsent() {
        if (authPrivacyConsent?.checked) return true;
        authMsg.textContent = 'Please read and agree to the Data & Privacy Agreement before continuing.';
        authPrivacyConsent?.focus({ preventScroll: true });
        return false;
      }

      function applyAuthenticatedSession(data = {}) {
        if (!data.token || !data.user) {
          throw new Error('Authenticated session is incomplete.');
        }
        const localProfile = loadUsers().find(x => x.username === data.user.username) || {};
        const sessionUser = normalizeSessionUser({ ...localProfile, ...data.user });
        setAuthToken(data.token);
        saveUsers([...loadUsers().filter(x => x.username !== sessionUser.username), sessionUser]);
        setCurrentUser(sessionUser);
        authMsg.textContent = '';
        showApp(sessionUser);
        return sessionUser;
      }

      function isLocalHardwareDemoHost() {
        return isLocalHardwareHostName();
      }

      function shouldAutoOpenDemoHealth(existingUser) {
        if (!isLocalHardwareDemoHost()) return false;
        void existingUser;
        return isLocalM5DemoRoute();
      }

      async function openDemoHealthSession() {
        authMsg.textContent = 'Connecting M5 demo data...';
        setStoredApiBaseUrl('');
        try {
          const response = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'demo', password: 'demo123' })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.token || !data.user) {
            throw new Error(data.error || 'Demo login failed.');
          }
          if (getHashPathAndParams().path !== 'health') {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#health`);
          }
          applyAuthenticatedSession(data);
          window.setTimeout(() => refreshDeviceTelemetry(), 0);
        } catch (err) {
          console.warn('M5 demo auto-login failed', err);
          setAuthToken('');
          const fakeUser = seedFakeAppData() || createFakeAppUser();
          if (getHashPathAndParams().path !== 'health') {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#health`);
          }
          authMsg.textContent = '';
          showApp(fakeUser);
          setAIStatusBadge('AI status: checking', 'unknown');
          refreshBackendStatus();
          refreshAIStatus();
        }
      }

      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!ensurePrivacyConsent()) return;
        const username = loginUsername.value.trim();
        const password = loginPassword.value;
        if (!username || !password) {
          authMsg.textContent = 'Username and password are required.';
          return;
        }
        authMsg.textContent = 'Signing in...';
        try {
          const response = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.token || !data.user) {
            throw new Error(data.error || 'Incorrect username or password.');
          }
          applyAuthenticatedSession(data);
        } catch (err) {
          authMsg.textContent = err instanceof Error ? err.message : 'Login failed.';
        }
      });

      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!ensurePrivacyConsent()) return;
        const username = regUsername.value.trim();
        if (!username) {
          authMsg.textContent = 'Username is required.';
          return;
        }
        if (regPassword.value.length < 8) {
          authMsg.textContent = 'Password should be at least 8 characters.';
          return;
        }
        authMsg.textContent = 'Creating account...';
        try {
          const response = await fetch(apiUrl('/api/auth/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              password: regPassword.value,
              displayName: regDisplayName.value.trim() || username
            })
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.token || !data.user) {
            throw new Error(data.error || 'Registration failed.');
          }
          applyAuthenticatedSession(data);
        } catch (err) {
          authMsg.textContent = err instanceof Error ? err.message : 'Registration failed.';
        }
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
        currentUser.starSign = editStarSign.value.trim();
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
        if (!ensurePrivacyConsent()) return;
        authMsg.textContent = '';
        const guestUser = getDefaultUser();
        setAuthToken('');
        setCurrentUser(guestUser);
        showApp(guestUser);
        setAIStatusBadge('AI status: checking', 'unknown');
        refreshBackendStatus();
        refreshAIStatus();
      });

      const forceFakeData = shouldForceFakeAppData();
      if (forceFakeData) setAuthToken('');
      const existingBeforeFakeSeed = forceFakeData
        ? seedFakeAppData({ force: true })
        : getCurrentUser();
      const existing = hasNfcDeepLink || (!forceFakeData && shouldAutoOpenDemoHealth(existingBeforeFakeSeed))
        ? existingBeforeFakeSeed
        : forceFakeData
          ? existingBeforeFakeSeed
          : ensureFakeAppData();
      if (hasNfcDeepLink) {
        closeAllModals();
        loginScreen?.classList.add('hidden');
        appRoot.classList.add('hidden');
        mobileTabbar?.classList.add('hidden');
        renderStandaloneNfcLoading(activeNfcTargetId);
        resolveNfcPetCard(nfcDeepLink)
          .then((nfcPetCard) => {
            activeNfcPetCard = nfcPetCard;
            renderStandaloneNfcPage(nfcPetCard, { targetId: activeNfcTargetId });
          })
          .catch((err) => {
            console.warn('NFC pet card render failed', err);
            activeNfcPetCard = null;
            renderStandaloneNfcPage(null, { targetId: activeNfcTargetId });
          });
      } else if (!forceFakeData && shouldAutoOpenDemoHealth(existing)) {
        openDemoHealthSession();
      } else if (existing && (existing.username === 'guest' || getAuthToken() || isFakeAppSession(existing))) {
        window.setTimeout(() => showApp(existing), 0);
      } else {
        setAuthToken('');
        setCurrentUser(null);
        closeAllModals();
        nfcRoot?.classList.add('hidden');
        appRoot.classList.add('hidden');
        mobileTabbar?.classList.add('hidden');
        loginScreen?.classList.remove('hidden');
      }

      document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => {
          closeAllModals();
          stopDeviceTelemetrySync();
          stopWifiTelemetryBridge();
          stopBluetoothTelemetryBridge();
          setAuthToken('');
          setCurrentUser(null);
          nfcRoot?.classList.add('hidden');
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
      const mobileMoreTabs = new Set();
      mobileMoreItems.forEach(btn => {
        const name = btn.getAttribute('data-mobile-tab');
        if (name) mobileMoreTabs.add(name);
      });
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
        if (name === 'behaviour') {
          name = 'ai';
          setAIAssistMode?.('video');
        }
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
        if (name === 'health') {
          window.requestAnimationFrame(() => {
            refreshDeviceTelemetry();
          });
        }
        if (name === 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.add('open');
          setChatToggleLabel(chatToggle, 'Show chat');
        } else if (name !== 'chat' && window.innerWidth <= 1024) {
          chatPane?.classList.remove('open');
          setChatToggleLabel(chatToggle, 'Show friends');
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
        const hashTab = getHashPathAndParams().path;
        if (hashTab === 'behaviour' || (hashTab && tabPages[hashTab])) activateTab(hashTab);
      });
      const initialTab = getHashPathAndParams().path;
      activateTab((initialTab === 'behaviour' || (initialTab && tabPages[initialTab])) ? initialTab : 'map');
    }

    // --- Pet data & UI ---
    const PETS_DATA_KEY = 'pawtrace_pets';
    const MONITORING_API = '/api/monitor/collect';
    const DEVICE_TELEMETRY_LATEST_API = '/api/device/telemetry/latest';
    const DEVICE_TELEMETRY_HISTORY_API = '/api/device/telemetry/history';
    const DEVICE_TELEMETRY_STREAM_API = '/api/device/telemetry/stream';
    const DEVICE_TELEMETRY_HISTORY_LIMIT = 120;
    const DEVICE_BLE_HISTORY_DUMP_LIMIT = 24;
    const DEVICE_TELEMETRY_POLL_MS = 1000;
    const DEVICE_TELEMETRY_HISTORY_POLL_MS = 30000;
    const DEVICE_TELEMETRY_UI_COMMIT_MS = 80;
    const DEFAULT_M5_DEVICE_ID = 'm5stickc-plus-1-1';
    const WIFI_LAN_URL_KEY = 'pawtrace_m5_lan_url';
    const WIFI_LAN_POLL_MS = 5000;
    const BLE_AUTO_RECONNECT_MS = 8000;
    const BLE_REMEMBERED_DEVICE_KEY = 'pawtrace_ble_device';
    const BLE_SERVICE_UUID = '7b9f0001-6f3a-4f8a-9f4d-111111111111';
    const BLE_TELEMETRY_UUID = '7b9f0002-6f3a-4f8a-9f4d-222222222222';
    const BLE_MESSAGE_UUID = '7b9f0003-6f3a-4f8a-9f4d-333333333333';
    const DEFAULT_PET_AVATAR = '/assets/1.png';
    const DEFAULT_USER_AVATAR = '/assets/people/person1.png';
    const DEFAULT_STICKER_IMAGE = '/assets/stickers/paw-sticker-01.png';
    const MY_PETS_KEY = 'pawtrace_my_pets';
    const FAKE_APP_DATA_VERSION_KEY = 'pawtrace_fake_data_version';
    const FAKE_APP_DATA_VERSION = '2026-05-05-demo-v1';
    const FAKE_APP_USERNAME = 'demo-local';
    const CHECKINS_DATA_KEY = 'pawtrace_checkins';
    const AI_SERVICE_CONFIG = {
      diagnosis: {
        label: 'Photo Check',
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
      diet: {
        label: 'Diet Guide',
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

    function hasTelemetryValue(value) {
      if (value === null || value === undefined || value === '') return false;
      return !(typeof value === 'number' && Number.isNaN(value));
    }

    function firstTelemetryValue(...values) {
      return values.find((value) => hasTelemetryValue(value));
    }

    function hasTelemetryNumber(value) {
      return hasTelemetryValue(value) && Number.isFinite(Number(value));
    }

    function telemetryNumberLabel(value, options = {}) {
      const { unit = '', digits = 0, empty = '--' } = options;
      if (!hasTelemetryNumber(value)) return empty;
      return `${Number(value).toFixed(digits)}${unit}`;
    }

    function telemetryIntegerLabel(value, unit = '') {
      if (!hasTelemetryNumber(value)) return '--';
      return `${Math.round(Number(value))}${unit}`;
    }

    function telemetryBoolLabel(value) {
      return statusLabel(optionalBoolean(value));
    }

    function isBleTelemetrySource(source = '', transport = '') {
      return /ble/i.test(`${source || ''} ${transport || ''}`);
    }

    function telemetrySourceLabel(source = '', transport = '') {
      const value = `${source || ''} ${transport || ''}`.toLowerCase();
      if (value.includes('ble')) return 'BLE WiFi setup';
      if (value.includes('wifi') || value.includes('http')) return 'Wi-Fi HTTP';
      if (value.includes('m5stack')) return 'M5Stack';
      if (value.includes('manual')) return 'Manual';
      return source || transport || '--';
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

    function isTelemetryLocationValid(record = {}) {
      const fix = finiteNumber(record.gpsFix, null);
      const validFlag = record.locationValid ?? record.gpsValid;
      return validFlag === true && fix !== 0 && hasValidCoordinate(record.lat, record.lon);
    }

    function normalizeVitalsHistory(history = []) {
      if (!Array.isArray(history)) return [];
      return history
        .map((entry) => {
          const temperatureValue = entry?.temperature ?? entry?.tempC ?? entry?.temp_c;
          const heartRateValue = entry?.heartRate ?? entry?.heartRateBpm ?? entry?.heart_rate_bpm ?? entry?.pet_bpm;
          const batteryValue = entry?.batteryPct ?? entry?.battery_pct;
          const stepsValue = entry?.steps;
          const temperature = temperatureValue === undefined || temperatureValue === null || temperatureValue === '' ? NaN : Number(temperatureValue);
          const heartRate = heartRateValue === undefined || heartRateValue === null || heartRateValue === '' ? NaN : Number(heartRateValue);
          return {
            id: entry?.id || '',
            timestamp: entry?.timestamp || new Date().toISOString(),
            temperature: Number.isFinite(temperature) && temperature > 20 ? temperature : NaN,
            heartRate: Number.isFinite(heartRate) && heartRate > 0 ? heartRate : NaN,
            batteryPct: batteryValue === undefined || batteryValue === null || batteryValue === '' ? NaN : Number(batteryValue),
            batteryMv: finiteNumber(entry?.batteryMv ?? entry?.battery_mv, NaN),
            steps: stepsValue === undefined || stepsValue === null || stepsValue === '' ? NaN : Number(stepsValue),
            activity: entry?.activity || '',
            activityScore: finiteNumber(entry?.activityScore ?? entry?.activity_score, NaN),
            spo2Pct: finiteNumber(entry?.spo2Pct ?? entry?.spo2, NaN),
            spo2Valid: optionalBoolean(entry?.spo2Valid ?? entry?.spo2_valid),
            heartFound: optionalBoolean(entry?.heartFound ?? entry?.heart_found),
            finger: optionalBoolean(entry?.finger),
            gpsFix: finiteNumber(entry?.gpsFix ?? entry?.gps_fix, NaN),
            gpsSatsUsed: finiteNumber(entry?.gpsSatsUsed ?? entry?.gps_sats_used, NaN),
            gpsVisible: finiteNumber(entry?.gpsVisible ?? entry?.gps_visible, NaN),
            gpsHdop: finiteNumber(entry?.gpsHdop ?? entry?.gps_hdop, NaN),
            locationValid: optionalBoolean(entry?.locationValid ?? entry?.location_valid),
            lastLocationValid: optionalBoolean(entry?.lastLocationValid ?? entry?.last_location_valid),
            trackSamples: finiteNumber(entry?.trackSamples ?? entry?.track_samples, NaN),
            geofenceEnabled: optionalBoolean(entry?.geofenceEnabled ?? entry?.geofence_enabled),
            distanceM: finiteNumber(entry?.distanceM ?? entry?.distance_m, NaN),
            lostAlert: optionalBoolean(entry?.lostAlert ?? entry?.lost_alert),
            wifiConnected: optionalBoolean(entry?.wifiConnected ?? entry?.wifi_connected),
            wifiRssi: finiteNumber(entry?.wifiRssi ?? entry?.wifi_rssi, NaN),
            uploadEnabled: optionalBoolean(entry?.uploadEnabled ?? entry?.upload_enabled),
            uploadOk: optionalBoolean(entry?.uploadOk ?? entry?.upload_ok),
            uploadCode: finiteNumber(entry?.uploadCode ?? entry?.upload_code, NaN),
            bleConnected: optionalBoolean(entry?.bleConnected ?? entry?.ble_connected),
            bleRssi: finiteNumber(entry?.bleRssi ?? entry?.ble_rssi, NaN),
            bleMtu: finiteNumber(entry?.bleMtu ?? entry?.ble_mtu, NaN),
            notifySeq: finiteNumber(entry?.notifySeq ?? entry?.notify_seq, NaN),
            uptimeMs: finiteNumber(entry?.uptimeMs ?? entry?.uptime_ms, NaN),
            deviceId: entry?.deviceId || entry?.device_id || '',
            lat: finiteNumber(entry?.lat, NaN),
            lon: finiteNumber(entry?.lon, NaN),
            source: entry?.source || '',
            transport: entry?.transport || '',
          };
        })
        .filter((entry) => Number.isFinite(entry.temperature) || Number.isFinite(entry.heartRate) || Number.isFinite(entry.spo2Pct) || entry.activity)
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
          displayState: 'Waiting for data',
          summary: 'Add a reading or connect the tracker to see a simple health check.',
          tempLabel: 'No reading yet',
          heartLabel: 'No reading yet',
        };
      }
      const temperature = Number(entry.temperature);
      const heartRate = Number(entry.heartRate);
      const spo2Pct = Number(entry.spo2Pct);
      const tempBand = Number.isFinite(temperature)
        ? (temperature < 37.3 || temperature > 39.6 ? 'alert' : temperature < 37.8 || temperature > 39.2 ? 'watch' : 'stable')
        : 'unknown';
      const heartBand = Number.isFinite(heartRate)
        ? (heartRate < 60 || heartRate > 165 ? 'alert' : heartRate < 75 || heartRate > 145 ? 'watch' : 'stable')
        : 'unknown';
      const contactMissing = entry.heartFound === false || entry.finger === false;
      const spo2Band = Number.isFinite(spo2Pct) && entry.spo2Valid === true
        ? (spo2Pct < 92 ? 'alert' : spo2Pct < 95 ? 'watch' : 'stable')
        : 'unknown';
      const state = contactMissing
        ? 'Check contact'
        : tempBand === 'alert' || heartBand === 'alert' || spo2Band === 'alert'
        ? 'Needs attention'
        : tempBand === 'watch' || heartBand === 'watch' || spo2Band === 'watch'
          ? 'Watch closely'
          : 'Stable';
      const displayState = state === 'Stable'
        ? 'Looks good'
        : state === 'Watch closely'
          ? 'Recheck soon'
          : state === 'Check contact'
            ? 'Fix sensor fit'
            : state;
      const summary = state === 'Check contact'
        ? 'The heart sensor needs better skin contact before this reading can be trusted.'
        : state === 'Needs attention'
        ? 'One signal is outside the usual monitoring range. Check your pet now.'
        : state === 'Watch closely'
          ? 'Vitals are close to the edge of the comfort range. Take another reading soon.'
          : 'Latest vitals look comfortable. Keep watching behavior and energy.';
      return {
        state,
        displayState,
        summary,
        tempLabel: Number.isFinite(temperature) ? `${temperature.toFixed(1)} °C` : 'No reading yet',
        heartLabel: Number.isFinite(heartRate) ? `${Math.round(heartRate)} bpm` : 'No reading yet',
        tempBand,
        heartBand,
        spo2Band,
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

    function fakeDataTimestamp(hoursAgo = 0) {
      return new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString();
    }

    function roundedMetric(value, digits = 1) {
      return Number(Number(value).toFixed(digits));
    }

    function createFakeVitalsHistory(pet = {}, index = 0) {
      const activities = ['resting', 'walking', 'active', 'resting', 'walking', 'resting', 'active', 'walking'];
      const baseTemp = Number(pet.baseTemp || 38.3);
      const baseHeart = Number(pet.baseHeart || (/cat/i.test(pet.type) ? 138 : /rabbit/i.test(pet.type) ? 156 : 112));
      const baseBattery = Number(pet.baseBattery || 84);
      return Array.from({ length: 8 }, (_, sampleIndex) => {
        const activity = activities[(sampleIndex + index) % activities.length];
        const isActive = activity === 'active';
        const isWalking = activity === 'walking';
        const heartLift = isActive ? 24 : isWalking ? 12 : 0;
        const latOffset = (sampleIndex - 3) * 0.00005;
        const lonOffset = (3 - sampleIndex) * 0.00004;
        return {
          id: `${pet.id || `fake-${index}`}-vital-${sampleIndex + 1}`,
          timestamp: fakeDataTimestamp(1 + (sampleIndex * (2 + index))),
          temperature: roundedMetric(baseTemp + (Math.sin(sampleIndex + index) * 0.18), 1),
          heartRate: Math.round(baseHeart + heartLift + (Math.cos(sampleIndex + index) * 5)),
          batteryPct: Math.max(22, Math.round(baseBattery - (sampleIndex * 2.7))),
          batteryMv: Math.round(4090 - (sampleIndex * 17) - (index * 23)),
          steps: Math.round((pet.baseSteps || 1800) + (sampleIndex * 135) + (index * 220)),
          activity,
          activityScore: roundedMetric(isActive ? 0.82 : isWalking ? 0.48 : 0.22, 2),
          spo2Pct: Math.round((pet.baseSpo2 || 98) - (sampleIndex % 3 === 0 ? 1 : 0)),
          spo2Valid: true,
          heartFound: true,
          finger: true,
          gpsFix: 2,
          gpsSatsUsed: 16 - (sampleIndex % 4),
          gpsVisible: 20,
          gpsHdop: roundedMetric(1.1 + ((sampleIndex % 3) * 0.1), 1),
          locationValid: true,
          lastLocationValid: true,
          trackSamples: 148 + sampleIndex,
          geofenceEnabled: true,
          distanceM: Math.max(8, Math.round((pet.distanceM || 48) + (sampleIndex * 3) - (index * 2))),
          lostAlert: Boolean(pet.lostAlert && sampleIndex === 0),
          wifiConnected: true,
          wifiRssi: -48 - index - sampleIndex,
          uploadEnabled: true,
          uploadOk: true,
          uploadCode: 200,
          deviceId: pet.deviceId || `demo-collar-${index + 1}`,
          tagId: pet.tagId || pet.nfcId || '',
          lat: roundedMetric(Number(pet.lat || 31.48303) + latOffset, 5),
          lon: roundedMetric(Number(pet.lon || 121.15569) + lonOffset, 5),
          source: 'fake-demo-telemetry',
          transport: 'local',
        };
      });
    }

    function createFakeAppUser() {
      return normalizeSessionUser({
        username: FAKE_APP_USERNAME,
        displayName: 'Ava Chen',
        avatar: '/assets/people/person2.png',
        bio: 'Synthetic PawTrace demo profile for product testing.',
        campus: 'XJTLU Taicang Campus',
        contact: 'WeChat ava-demo-613',
        starSign: 'Senior care reminders',
        mainPetName: 'Mocha',
        mainPetType: 'Corgi',
        mainPetBirth: '2024-02-18',
        mainPetNotes: 'Mocha is food-motivated, likes short walks, and needs weight-control snacks.',
        petInsight: 'Demo insight: Mocha is steady today. Keep the evening walk short and recheck heart rate after play.',
      });
    }

    function createFakeAppPets() {
      const owner = createFakeAppUser();
      const basePets = [
        {
          id: 'fake-mocha',
          name: 'Mocha',
          type: 'Dog',
          breed: 'Pembroke Corgi',
          age: '2 years',
          birthday: '2024-02-18',
          gender: 'Male',
          avatar: '/assets/1.png',
          traits: ['Friendly', 'Food-motivated', 'Short walk fan'],
          health: 'Vaccinated. Mild weight-control plan. No allergy notes.',
          status: 'Morning walk complete. Ready for a light dinner.',
          location: 'Central Ring Promenade',
          mapCoords: { x: 68, y: 48 },
          lat: 31.48303,
          lon: 121.15569,
          deviceId: DEFAULT_M5_DEVICE_ID,
          tagId: 'PT-MOCHA',
          nfcId: 'PT-MOCHA',
          baseTemp: 38.4,
          baseHeart: 112,
          baseBattery: 86,
          baseSteps: 3240,
          distanceM: 52,
        },
        {
          id: 'fake-mochi',
          name: 'Mochi',
          type: 'Cat',
          breed: 'Ragdoll',
          age: '1 year',
          birthday: '2025-01-07',
          gender: 'Female',
          avatar: '/assets/3.png',
          traits: ['Indoor', 'Curious', 'Window watcher'],
          health: 'Indoor cat. Spayed. Appetite and water intake normal.',
          status: 'Napped near the studio window after lunch.',
          location: 'Studio Dorms Block C',
          mapCoords: { x: 33, y: 42 },
          lat: 31.48192,
          lon: 121.15374,
          deviceId: 'demo-collar-mochi',
          tagId: 'PT-MOCHI',
          nfcId: 'PT-MOCHI',
          baseTemp: 38.1,
          baseHeart: 136,
          baseBattery: 78,
          baseSteps: 980,
          distanceM: 24,
        },
        {
          id: 'fake-pixel',
          name: 'Pixel',
          type: 'Dog',
          breed: 'Border Collie',
          age: '3 years',
          birthday: '2023-03-21',
          gender: 'Female',
          avatar: '/assets/2.png',
          traits: ['High energy', 'Frisbee', 'Training focus'],
          health: 'Very active. Joint check scheduled next month.',
          status: 'High activity after frisbee practice. Cooling down now.',
          location: 'Stadium Track Edge',
          mapCoords: { x: 50, y: 69 },
          lat: 31.48074,
          lon: 121.15602,
          deviceId: 'demo-collar-pixel',
          tagId: 'PT-PIXEL',
          nfcId: 'PT-PIXEL',
          baseTemp: 38.6,
          baseHeart: 126,
          baseBattery: 71,
          baseSteps: 6120,
          distanceM: 91,
        },
        {
          id: 'fake-nori',
          name: 'Nori',
          type: 'Rabbit',
          breed: 'Holland Lop',
          age: '8 months',
          birthday: '2025-09-14',
          gender: 'Male',
          avatar: '/assets/6.png',
          traits: ['Gentle', 'Quiet', 'Leafy snack fan'],
          health: 'Needs fresh hay daily. Teeth check reminder next week.',
          status: 'Calm indoor play session logged this afternoon.',
          location: 'Learning Hub Entrance',
          mapCoords: { x: 59, y: 22 },
          lat: 31.48452,
          lon: 121.1549,
          deviceId: 'demo-collar-nori',
          tagId: 'PT-NORI',
          nfcId: 'PT-NORI',
          baseTemp: 38.8,
          baseHeart: 154,
          baseBattery: 93,
          baseSteps: 640,
          distanceM: 18,
        },
      ];

      return basePets.map((pet, index) => {
        const vitalsHistory = createFakeVitalsHistory(pet, index);
        const latest = vitalsHistory[0] || {};
        return normalizePetRecord({
          ...pet,
          nfcContact: owner.contact,
          nfcNote: `${pet.name} is registered in PawTrace demo mode. Please contact Ava if found.`,
          vitalsHistory,
          batteryPct: latest.batteryPct,
          batteryMv: latest.batteryMv,
          steps: latest.steps,
          activity: latest.activity,
          activityScore: latest.activityScore,
          heartFound: latest.heartFound,
          finger: latest.finger,
          spo2Pct: latest.spo2Pct,
          spo2Valid: latest.spo2Valid,
          gpsFix: latest.gpsFix,
          gpsSatsUsed: latest.gpsSatsUsed,
          gpsVisible: latest.gpsVisible,
          gpsHdop: latest.gpsHdop,
          locationValid: latest.locationValid,
          lastLocationValid: latest.lastLocationValid,
          trackSamples: latest.trackSamples,
          geofenceEnabled: latest.geofenceEnabled,
          distanceM: latest.distanceM,
          lostAlert: latest.lostAlert,
          wifiConnected: latest.wifiConnected,
          wifiRssi: latest.wifiRssi,
          uploadEnabled: latest.uploadEnabled,
          uploadOk: latest.uploadOk,
          uploadCode: latest.uploadCode,
          telemetrySource: latest.source,
          telemetryTransport: latest.transport,
          telemetryUpdatedAt: latest.timestamp,
        }, index);
      });
    }

    function readJsonStorage(key, fallback) {
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    }

    function isFakeAppUser(user = getCurrentUser()) {
      return user?.username === FAKE_APP_USERNAME;
    }

    function shouldForceFakeAppData() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        return params.get('fakeData') === '1'
          || params.get('seedFakeData') === '1'
          || params.get('demoData') === '1';
      } catch {
        return false;
      }
    }

    function seedFakeAppData(options = {}) {
      const force = Boolean(options.force);
      const currentUser = getCurrentUser();
      const storedPets = readJsonStorage(PETS_DATA_KEY, []);
      const seededVersion = localStorage.getItem(FAKE_APP_DATA_VERSION_KEY) === FAKE_APP_DATA_VERSION;
      const hasStoredPets = Array.isArray(storedPets) && storedPets.length > 0 && !isSeededDefaultPetList(storedPets);

      if (!force && getAuthToken()) return currentUser;
      if (!force && currentUser && !isFakeAppUser(currentUser)) return currentUser;
      if (!force && hasStoredPets && !seededVersion) return currentUser;
      if (!force && hasStoredPets && seededVersion) {
        const user = currentUser || createFakeAppUser();
        if (!currentUser) setCurrentUser(user);
        return user;
      }

      const fakeUser = createFakeAppUser();
      const fakePets = createFakeAppPets();
      const users = loadUsers().filter((user) => user.username !== FAKE_APP_USERNAME);
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
      const checkins = fakePets.reduce((acc, pet, index) => {
        acc[pet.id] = {
          [today]: true,
          [yesterday]: index < 3,
        };
        return acc;
      }, {});

      saveUsers([...users, fakeUser]);
      localStorage.setItem(PETS_DATA_KEY, JSON.stringify(fakePets));
      localStorage.setItem(MY_PETS_KEY, JSON.stringify(fakePets));
      localStorage.setItem(CHECKINS_DATA_KEY, JSON.stringify(checkins));
      localStorage.setItem(FAKE_APP_DATA_VERSION_KEY, FAKE_APP_DATA_VERSION);
      setAuthToken('');
      setCurrentUser(fakeUser);
      emitPetsChanged(fakePets);
      return fakeUser;
    }

    function ensureFakeAppData() {
      const existingUser = getCurrentUser();
      if (getAuthToken()) return existingUser;
      if (existingUser && !isFakeAppUser(existingUser)) return existingUser;
      return seedFakeAppData();
    }

    function isFakeAppSession(user = getCurrentUser()) {
      return isFakeAppUser(user) && !getAuthToken();
    }

    window.PAWTRACE_SEED_FAKE_DATA = () => {
      const user = seedFakeAppData({ force: true });
      window.location.reload();
      return user;
    };

    window.PAWTRACE_CLEAR_FAKE_DATA = () => {
      const currentUser = getCurrentUser();
      localStorage.removeItem(PETS_DATA_KEY);
      localStorage.removeItem(MY_PETS_KEY);
      localStorage.removeItem(CHECKINS_DATA_KEY);
      localStorage.removeItem(FAKE_APP_DATA_VERSION_KEY);
      saveUsers(loadUsers().filter((user) => user.username !== FAKE_APP_USERNAME));
      if (isFakeAppUser(currentUser)) {
        setAuthToken('');
        setCurrentUser(null);
      }
      window.location.reload();
    };

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

    function fileToAvatarDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const raw = String(reader.result || '');
          const img = new Image();
          img.onload = () => {
            try {
              const maxSide = 512;
              const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
              const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
              const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(raw);
                return;
              }
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.86));
            } catch {
              resolve(raw);
            }
          };
          img.onerror = () => resolve(raw);
          img.src = raw;
        };
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
      if (isGuestSession()) {
        return Array.isArray(guestPetStore) ? guestPetStore.map((pet, index) => normalizePetRecord(pet, index)) : [];
      }
      try {
        const parsed = JSON.parse(localStorage.getItem(PETS_DATA_KEY)) || [];
        return Array.isArray(parsed) ? parsed.map((pet, index) => normalizePetRecord(pet, index)) : [];
      } catch {
        return [];
      }
    }

    function setStoredPets(pets) {
      const normalized = Array.isArray(pets) ? pets.map((pet, index) => normalizePetRecord(pet, index)) : [];
      if (isGuestSession()) {
        guestPetStore = normalized;
        emitPetsChanged(normalized);
        return;
      }
      localStorage.setItem(PETS_DATA_KEY, JSON.stringify(normalized));
      emitPetsChanged(normalized);
    }

    function stableTelemetrySnapshot(value) {
      if (Array.isArray(value)) {
        return `[${value.map(stableTelemetrySnapshot).join(',')}]`;
      }
      if (value && typeof value === 'object') {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableTelemetrySnapshot(value[key])}`).join(',')}}`;
      }
      return JSON.stringify(value);
    }

    function telemetryRecordTimeMs(record = {}) {
      const parsed = Date.parse(String(record.timestamp || record.receivedAt || record.bleBridgeReceivedAt || ''));
      if (Number.isFinite(parsed)) return parsed;
      const uptimeMs = Number(record.uptimeMs ?? record.uptime_ms);
      return Number.isFinite(uptimeMs) ? uptimeMs : 0;
    }

    function telemetryValueOr(value, fallback = null) {
      return hasTelemetryValue(value) ? value : fallback;
    }

    function clearQueuedDeviceTelemetryMerge() {
      if (deviceTelemetryCommitTimer) {
        window.clearTimeout(deviceTelemetryCommitTimer);
        deviceTelemetryCommitTimer = null;
      }
      pendingDeviceTelemetryRecords = [];
    }

    function flushQueuedDeviceTelemetryMerge() {
      const records = pendingDeviceTelemetryRecords;
      pendingDeviceTelemetryRecords = [];
      deviceTelemetryCommitTimer = null;
      lastDeviceTelemetryCommitMs = Date.now();
      if (records.length) mergeDeviceTelemetry(records);
    }

    function queueDeviceTelemetryMerge(records = []) {
      const nextRecords = (Array.isArray(records) ? records : []).filter(Boolean);
      if (!nextRecords.length) return false;
      pendingDeviceTelemetryRecords.push(...nextRecords);
      if (deviceTelemetryCommitTimer) return true;
      const elapsed = Date.now() - lastDeviceTelemetryCommitMs;
      const delay = lastDeviceTelemetryCommitMs === 0
        ? 120
        : Math.max(0, DEVICE_TELEMETRY_UI_COMMIT_MS - elapsed);
      deviceTelemetryCommitTimer = window.setTimeout(flushQueuedDeviceTelemetryMerge, delay);
      return true;
    }

    function normalizeDeviceTelemetryRecord(record = {}) {
      const metadata = record?.metadata && typeof record.metadata === 'object' ? record.metadata : {};
      const source = String(record.source || metadata.source || '').trim();
      const transport = String(record.transport || metadata.transport || '').trim();
      const bleLike = isBleTelemetrySource(source, transport)
        || record.bat !== undefined
        || record.alert !== undefined
        || record.bleRssi !== undefined
        || record.ble_rssi !== undefined;
      if (bleLike) return {};
      const lat = Number(record.lat);
      const lon = Number(record.lon);
      const temperature = Number(record.tempC ?? record.temp_c ?? record.temperature);
      const heartRate = Number(record.heartRateBpm ?? record.heart_rate_bpm ?? record.heartRate ?? record.pet_bpm ?? record.bpm);
      const mapX = Number(record?.mapCoords?.x);
      const mapY = Number(record?.mapCoords?.y);
      const gpsFix = finiteNumber(record.gpsFix ?? record.gps_fix, null);
      const locationValid = optionalBoolean(record.locationValid ?? record.location_valid ?? record.gpsValid ?? record.gps_valid);
      return {
        id: record.id || '',
        deviceId: String(record.deviceId || record.device_id || record.device || record.bleDeviceId || record.ble_device_id || (bleLike ? record.id : '') || '').trim(),
        tagId: String(record.tagId || record.tag_id || '').trim(),
        petId: String(record.petId || record.pet_id || '').trim(),
        timestamp: record.timestamp || record.receivedAt || new Date().toISOString(),
        temperature: Number.isFinite(temperature) ? temperature : null,
        heartRate: Number.isFinite(heartRate) ? heartRate : null,
        batteryPct: Number.isFinite(Number(record.batteryPct ?? record.battery_pct ?? record.bat)) ? Number(record.batteryPct ?? record.battery_pct ?? record.bat) : null,
        batteryMv: finiteNumber(record.batteryMv ?? record.battery_mv, null),
        steps: Number.isFinite(Number(record.steps)) ? Number(record.steps) : null,
        activity: String(record.activity || record.activityState || '').trim(),
        activityScore: finiteNumber(record.activityScore ?? record.activity_score, null),
        lat: Number.isFinite(lat) ? lat : null,
        lon: Number.isFinite(lon) ? lon : null,
        gpsValid: optionalBoolean(record.gpsValid ?? record.gps_valid ?? record.locationValid ?? record.location_valid),
        gpsFix,
        gpsSatsUsed: finiteNumber(record.gpsSatsUsed ?? record.gps_sats_used, null),
        gpsVisible: finiteNumber(record.gpsVisible ?? record.gps_visible ?? record.sat, null),
        gpsHdop: finiteNumber(record.gpsHdop ?? record.gps_hdop, null),
        locationValid,
        lastLocationValid: optionalBoolean(record.lastLocationValid ?? record.last_location_valid),
        trackSamples: finiteNumber(record.trackSamples ?? record.track_samples, null),
        geofenceEnabled: optionalBoolean(record.geofenceEnabled ?? record.geofence_enabled),
        distanceM: finiteNumber(record.distanceM ?? record.distance_m, null),
        lostAlert: optionalBoolean(record.lostAlert ?? record.lost_alert ?? record.alert),
        heartFound: optionalBoolean(record.heartFound ?? record.heart_found),
        finger: optionalBoolean(record.finger),
        spo2Pct: finiteNumber(record.spo2Pct ?? record.spo2, null),
        spo2Valid: optionalBoolean(record.spo2Valid ?? record.spo2_valid),
        wifiConnected: optionalBoolean(record.wifiConnected ?? record.wifi_connected),
        wifiRssi: finiteNumber(record.wifiRssi ?? record.wifi_rssi, null),
        uploadEnabled: optionalBoolean(record.uploadEnabled ?? record.upload_enabled),
        uploadOk: optionalBoolean(record.uploadOk ?? record.upload_ok, null),
        uploadCode: finiteNumber(record.uploadCode ?? record.upload_code, null),
        bleConnected: null,
        bleRssi: finiteNumber(record.bleRssi ?? record.ble_rssi ?? record.rssi, null),
        bleMtu: finiteNumber(record.bleMtu ?? record.ble_mtu ?? record.mtu, null),
        notifySeq: finiteNumber(record.notifySeq ?? record.notify_seq ?? record.seq, null),
        uptimeMs: finiteNumber(record.uptimeMs ?? record.uptime_ms, null),
        locationAccuracy: Number.isFinite(Number(record.locationAccuracy)) ? Number(record.locationAccuracy) : null,
        mapCoords: Number.isFinite(mapX) && Number.isFinite(mapY)
          ? { x: clampNumber(mapX, 8, 92, 50), y: clampNumber(mapY, 8, 92, 50) }
          : null,
        source: source || 'm5stack-wifi-http',
        transport: transport || 'wifi',
      };
    }

    function buildTelemetryLocationLabel(record, fallback = 'Campus live GPS') {
      if (isTelemetryLocationValid(record)) {
        return `Live GPS ${record.lat.toFixed(5)}, ${record.lon.toFixed(5)}`;
      }
      if (record.lastLocationValid === true) return 'Last valid GPS saved';
      return fallback;
    }

    function findTelemetryPetIndex(pets = [], record = {}) {
      if (!Array.isArray(pets) || !pets.length) return -1;
      if (record.petId) {
        const byPetId = pets.findIndex((pet) => pet.id === record.petId);
        if (byPetId >= 0) return byPetId;
      }
      if (record.deviceId) {
        const byDevice = pets.findIndex((pet) => pet.deviceId === record.deviceId);
        if (byDevice >= 0) return byDevice;
      }
      if (record.tagId) {
        const byTag = pets.findIndex((pet) => pet.tagId === record.tagId || pet.nfcId === record.tagId);
        if (byTag >= 0) return byTag;
      }
      return 0;
    }

    function telemetryHistoryKey(entry = {}) {
      const deviceId = String(entry.deviceId || entry.device_id || '').trim();
      const seq = entry.notifySeq ?? entry.notify_seq ?? entry.seq;
      const timestamp = String(entry.timestamp || entry.receivedAt || '').trim();
      if (deviceId && hasTelemetryValue(seq) && timestamp) return `seq:${deviceId}:${seq}:${timestamp}`;
      const id = String(entry.id || '').trim();
      if (id) return `id:${id}`;
      return [
        'sample',
        deviceId,
        timestamp,
        entry.temperature ?? entry.tempC ?? entry.temp_c ?? '',
        entry.heartRate ?? entry.heartRateBpm ?? entry.pet_bpm ?? entry.bpm ?? '',
        entry.activity || '',
      ].join(':');
    }

    function mergeVitalsHistoryEntries(entries = [], limit = DEVICE_TELEMETRY_HISTORY_LIMIT) {
      const seen = new Set();
      return normalizeVitalsHistory(entries)
        .filter((entry) => {
          const key = telemetryHistoryKey(entry);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, limit);
    }

    function applyTelemetryToPet(pet = {}, record = {}, index = 0) {
      const existingHistory = normalizeVitalsHistory(pet.vitalsHistory);
      const hasVitals = record.temperature !== null || record.heartRate !== null || record.spo2Pct !== null || record.activity;
      const nextVitals = hasVitals
        ? mergeVitalsHistoryEntries([
            {
              id: record.id,
              timestamp: record.timestamp,
              temperature: record.temperature ?? undefined,
              heartRate: record.heartRate ?? undefined,
              batteryPct: record.batteryPct ?? undefined,
              batteryMv: record.batteryMv ?? undefined,
              steps: record.steps ?? undefined,
              activity: record.activity,
              activityScore: record.activityScore ?? undefined,
              heartFound: record.heartFound,
              finger: record.finger,
              spo2Pct: record.spo2Pct ?? undefined,
              spo2Valid: record.spo2Valid,
              gpsFix: record.gpsFix ?? undefined,
              gpsSatsUsed: record.gpsSatsUsed ?? undefined,
              gpsVisible: record.gpsVisible ?? undefined,
              gpsHdop: record.gpsHdop ?? undefined,
              locationValid: record.locationValid,
              lastLocationValid: record.lastLocationValid,
              trackSamples: record.trackSamples ?? undefined,
              geofenceEnabled: record.geofenceEnabled,
              distanceM: record.distanceM ?? undefined,
              lostAlert: record.lostAlert,
              wifiConnected: record.wifiConnected,
              wifiRssi: record.wifiRssi ?? undefined,
              uploadEnabled: record.uploadEnabled,
              uploadOk: record.uploadOk,
              uploadCode: record.uploadCode ?? undefined,
              bleConnected: record.bleConnected,
              bleRssi: record.bleRssi ?? undefined,
              bleMtu: record.bleMtu ?? undefined,
              notifySeq: record.notifySeq ?? undefined,
              uptimeMs: record.uptimeMs ?? undefined,
              deviceId: record.deviceId,
              lat: record.lat ?? undefined,
              lon: record.lon ?? undefined,
              source: record.source || 'm5stack',
              transport: record.transport || '',
            },
            ...existingHistory,
          ])
        : existingHistory;
      const zone = getDefaultTrackedZone(index);
      const location = buildTelemetryLocationLabel(record, pet.location || zone.label);
      const statusParts = ['Wi-Fi live sync'];
      if (record.activity) statusParts.push(record.activity);
      if (record.batteryPct !== null) statusParts.push(`${Math.round(record.batteryPct)}% battery`);
      if (record.wifiConnected !== null) statusParts.push(`Wi-Fi ${statusLabel(record.wifiConnected)}`);
      if (record.uploadCode !== null) statusParts.push(`HTTP ${record.uploadCode}`);
      const hasFreshCoordinate = hasValidCoordinate(record.lat, record.lon);

      return normalizePetRecord({
        ...pet,
        id: pet.id || record.petId || `m5-${record.deviceId || Date.now()}`,
        name: pet.name || `M5Stack ${record.deviceId || 'Collar'}`,
        type: pet.type || 'Tracked pet',
        breed: pet.breed || 'GPS v1.1 + Heart Rate HAT',
        avatar: pet.avatar || DEFAULT_PET_AVATAR,
        traits: Array.isArray(pet.traits) && pet.traits.length ? pet.traits : ['Live telemetry', 'M5Stack'],
        deviceId: record.deviceId || pet.deviceId || '',
        tagId: record.tagId || pet.tagId || '',
        status: statusParts.join(' · '),
        health: pet.health || 'Receiving live M5Stack telemetry.',
        location,
        mapCoords: isTelemetryLocationValid(record) ? { x: 50, y: 50 } : (record.mapCoords || pet.mapCoords || zone.coords),
        vitalsHistory: nextVitals,
        batteryPct: telemetryValueOr(record.batteryPct, pet.batteryPct),
        batteryMv: telemetryValueOr(record.batteryMv, pet.batteryMv),
        steps: telemetryValueOr(record.steps, pet.steps),
        activity: telemetryValueOr(record.activity, pet.activity),
        activityScore: telemetryValueOr(record.activityScore, pet.activityScore),
        heartFound: telemetryValueOr(record.heartFound, pet.heartFound),
        finger: telemetryValueOr(record.finger, pet.finger),
        spo2Pct: telemetryValueOr(record.spo2Pct, pet.spo2Pct),
        spo2Valid: telemetryValueOr(record.spo2Valid, pet.spo2Valid),
        lat: hasFreshCoordinate ? record.lat : telemetryValueOr(pet.lat, null),
        lon: hasFreshCoordinate ? record.lon : telemetryValueOr(pet.lon, null),
        gpsValid: telemetryValueOr(record.gpsValid, pet.gpsValid),
        gpsFix: telemetryValueOr(record.gpsFix, pet.gpsFix),
        gpsSatsUsed: telemetryValueOr(record.gpsSatsUsed, pet.gpsSatsUsed),
        gpsVisible: telemetryValueOr(record.gpsVisible, pet.gpsVisible),
        gpsHdop: telemetryValueOr(record.gpsHdop, pet.gpsHdop),
        locationValid: telemetryValueOr(record.locationValid, pet.locationValid),
        lastLocationValid: telemetryValueOr(record.lastLocationValid, pet.lastLocationValid),
        trackSamples: telemetryValueOr(record.trackSamples, pet.trackSamples),
        geofenceEnabled: telemetryValueOr(record.geofenceEnabled, pet.geofenceEnabled),
        distanceM: telemetryValueOr(record.distanceM, pet.distanceM),
        lostAlert: telemetryValueOr(record.lostAlert, pet.lostAlert),
        wifiConnected: telemetryValueOr(record.wifiConnected, pet.wifiConnected),
        wifiRssi: telemetryValueOr(record.wifiRssi, pet.wifiRssi),
        uploadEnabled: telemetryValueOr(record.uploadEnabled, pet.uploadEnabled),
        uploadOk: telemetryValueOr(record.uploadOk, pet.uploadOk),
        uploadCode: telemetryValueOr(record.uploadCode, pet.uploadCode),
        bleConnected: telemetryValueOr(record.bleConnected, pet.bleConnected),
        bleRssi: telemetryValueOr(record.bleRssi, pet.bleRssi),
        bleMtu: telemetryValueOr(record.bleMtu, pet.bleMtu),
        notifySeq: telemetryValueOr(record.notifySeq, pet.notifySeq),
        telemetrySource: record.source || pet.telemetrySource,
        telemetryTransport: record.transport || pet.telemetryTransport,
        telemetryUpdatedAt: record.timestamp,
      }, index);
    }

    function mergeDeviceTelemetry(records = []) {
      const telemetry = (Array.isArray(records) ? records : [])
        .map(normalizeDeviceTelemetryRecord)
        .filter((record) => record.deviceId)
        .sort((a, b) => {
          const timeDelta = telemetryRecordTimeMs(a) - telemetryRecordTimeMs(b);
          if (timeDelta) return timeDelta;
          const seqDelta = Number(a.notifySeq ?? 0) - Number(b.notifySeq ?? 0);
          if (seqDelta) return seqDelta;
          return String(a.id || '').localeCompare(String(b.id || ''));
        });
      if (!telemetry.length) return false;

      let pets = getStoredPets();
      const previousPetCount = pets.length;
      const beforeSnapshot = stableTelemetrySnapshot(pets);
      telemetry.forEach((record) => {
        const index = findTelemetryPetIndex(pets, record);
        if (index >= 0) {
          pets = pets.map((pet, petIndex) => petIndex === index ? applyTelemetryToPet(pet, record, petIndex) : pet);
          return;
        }
        pets.push(applyTelemetryToPet({}, record, pets.length));
      });
      if (stableTelemetrySnapshot(pets) === beforeSnapshot) return false;
      setStoredPets(pets);
      if (activeTabName === 'pets' && pets.length !== previousPetCount) rerenderPets?.();
      return true;
    }

    async function refreshDeviceTelemetry({ history = false } = {}) {
      const syncEpoch = deviceTelemetrySyncEpoch;
      try {
        const endpoint = history
          ? `${DEVICE_TELEMETRY_HISTORY_API}?limit=${DEVICE_TELEMETRY_HISTORY_LIMIT}`
          : `${DEVICE_TELEMETRY_LATEST_API}?limit=12`;
        const data = await fetchDeviceTelemetryPayload(endpoint);
        let records = telemetryRecordsFromPayload(data);
        if (!records.length && !history) {
          const backfill = await fetchDeviceTelemetryPayload(`${DEVICE_TELEMETRY_HISTORY_API}?limit=12`);
          records = telemetryRecordsFromPayload(backfill);
        }
        if (document.hidden || syncEpoch !== deviceTelemetrySyncEpoch) return;
        if (records.length) queueDeviceTelemetryMerge(records);
      } catch (err) {
        console.warn('Device telemetry refresh failed', err);
      }
    }

    function stopDeviceTelemetryStream() {
      if (deviceTelemetryStream) {
        deviceTelemetryStream.close();
        deviceTelemetryStream = null;
      }
    }

    function teardownDeviceTelemetrySync() {
      deviceTelemetrySyncEpoch += 1;
      if (deviceTelemetryPollTimer) {
        window.clearInterval(deviceTelemetryPollTimer);
        deviceTelemetryPollTimer = null;
      }
      if (deviceTelemetryHistoryPollTimer) {
        window.clearInterval(deviceTelemetryHistoryPollTimer);
        deviceTelemetryHistoryPollTimer = null;
      }
      stopDeviceTelemetryStream();
      clearQueuedDeviceTelemetryMerge();
      deviceTelemetryRequests.clear();
    }

    function startDeviceTelemetryStream() {
      stopDeviceTelemetryStream();
      const token = getAuthToken();
      if (!token || typeof EventSource === 'undefined') return false;
      const url = apiUrl(`${DEVICE_TELEMETRY_STREAM_API}?limit=1&token=${encodeURIComponent(token)}`);
      const stream = new EventSource(url);
      deviceTelemetryStream = stream;
      stream.addEventListener('telemetry', (event) => {
        try {
          const payload = JSON.parse(event.data || '{}');
          const records = telemetryRecordsFromPayload(payload);
          if (records.length) queueDeviceTelemetryMerge(records);
        } catch (err) {
          console.warn('Device telemetry stream parse failed', err);
        }
      });
      stream.addEventListener('error', () => {
        // EventSource reconnects automatically; the fast latest poller keeps the UI live meanwhile.
        refreshDeviceTelemetry();
      });
      return true;
    }

    function stopDeviceTelemetrySync() {
      deviceTelemetrySyncWanted = false;
      teardownDeviceTelemetrySync();
    }

    function startDeviceTelemetrySync() {
      deviceTelemetrySyncWanted = true;
      teardownDeviceTelemetrySync();
      if (document.hidden) return;
      startDeviceTelemetryStream();
      refreshDeviceTelemetry();
      refreshDeviceTelemetry({ history: true });
      deviceTelemetryPollTimer = window.setInterval(refreshDeviceTelemetry, DEVICE_TELEMETRY_POLL_MS);
      deviceTelemetryHistoryPollTimer = window.setInterval(() => {
        refreshDeviceTelemetry({ history: true });
      }, DEVICE_TELEMETRY_HISTORY_POLL_MS);
    }

    document.addEventListener('visibilitychange', () => {
      if (!deviceTelemetrySyncWanted) return;
      if (document.hidden) {
        teardownDeviceTelemetrySync();
      } else {
        startDeviceTelemetrySync();
      }
    });

    function initWifiTelemetryBridge() {
      if (wifiTelemetryBridgeInitialized) return;
      wifiTelemetryBridgeInitialized = true;

      const urlInput = document.getElementById('wifi-lan-url');
      const saveBtn = document.getElementById('wifi-lan-save');
      const refreshBtn = document.getElementById('wifi-lan-refresh');
      const uploadBtn = document.getElementById('wifi-lan-upload');
      const messageInput = document.getElementById('wifi-message-input');
      const sendMessageBtn = document.getElementById('wifi-send-message');
      const statusEl = document.getElementById('wifi-bridge-status');
      const latestPayloadEl = document.getElementById('wifi-latest-payload');
      const storeStatusEl = document.getElementById('wifi-store-status');
      const deviceNameEl = document.getElementById('wifi-device-name');
      const queueDepthEl = document.getElementById('wifi-queue-depth');

      if (!urlInput || !statusEl || !latestPayloadEl) return;

      const setStatus = (text, state = 'stable') => {
        statusEl.textContent = text;
        statusEl.dataset.status = state;
      };

      const setStoreStatus = (text, state = 'neutral') => {
        if (!storeStatusEl) return;
        storeStatusEl.textContent = text;
        storeStatusEl.classList.toggle('text-red-500', state === 'error');
        storeStatusEl.classList.toggle('text-primary', state === 'ok');
        storeStatusEl.classList.toggle('text-gray-500', state !== 'error' && state !== 'ok');
      };

      const normalizeLanUrl = (value = '') => {
        let url = String(value || '').trim();
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
        return url.replace(/\/+$/, '');
      };

      const getLanUrl = () => normalizeLanUrl(urlInput.value);

      const saveLanUrl = () => {
        const url = getLanUrl();
        urlInput.value = url;
        if (url) {
          localStorage.setItem(WIFI_LAN_URL_KEY, url);
          setStoreStatus(`Saved M5 LAN URL ${url}`, 'ok');
        } else {
          localStorage.removeItem(WIFI_LAN_URL_KEY);
          setStoreStatus('Using Cloud mode. LAN URL is optional.', 'ok');
        }
        return url;
      };

      const updateFromPayload = (payload = {}) => {
        latestPayloadEl.textContent = JSON.stringify(payload, null, 2).slice(0, 2400);
        const deviceId = payload.device_id || payload.deviceId || '--';
        const queueDepth = payload.queue_depth ?? payload.queueDepth ?? '--';
        if (deviceNameEl) deviceNameEl.textContent = String(deviceId);
        if (queueDepthEl) queueDepthEl.textContent = String(queueDepth);
        if (payload.device_id || payload.deviceId) queueDeviceTelemetryMerge([payload]);
        const wifiConnected = optionalBoolean(payload.wifi_connected ?? payload.wifiConnected);
        setStatus(wifiConnected === false ? 'WiFi waiting' : 'WiFi online', wifiConnected === false ? 'watch' : 'stable');
        setStoreStatus(`M5 reachable at ${payload.lan_base_url || payload.lanBaseUrl || getLanUrl()}`, 'ok');
      };

      const fetchLanJson = async (path, options = {}) => {
        const baseUrl = getLanUrl();
        if (!baseUrl) throw new Error('Enter the M5 LAN URL first.');
        const response = await fetch(`${baseUrl}${path}`, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `M5 request failed with HTTP ${response.status}.`);
        }
        return data;
      };

      const refreshCloudStatus = async ({ silent = false } = {}) => {
        const data = await fetchDeviceTelemetryPayload(`${DEVICE_TELEMETRY_LATEST_API}?deviceId=${encodeURIComponent(DEFAULT_M5_DEVICE_ID)}&limit=1`);
        const latest = data?.latest || (Array.isArray(data?.telemetry) ? data.telemetry[0] : null);
        if (!latest) {
          if (!silent) {
            setStatus('Cloud waiting', 'watch');
            setStoreStatus('Cloud is reachable, but no M5 telemetry has arrived for this account yet.', 'neutral');
          }
          return null;
        }
        updateFromPayload(latest);
        setStatus('Cloud live', latest.uploadOk === false ? 'watch' : 'stable');
        setStoreStatus(`Cloud packet received from ${latest.deviceId || latest.device_id || DEFAULT_M5_DEVICE_ID}.`, 'ok');
        return latest;
      };

      const queueCloudCommand = async (command = {}) => {
        if (!getAuthToken()) {
          throw new Error('Sign in or use the demo account before sending cloud commands to the M5.');
        }
        const response = await authJsonFetch('/api/device/commands', {
          method: 'POST',
          body: JSON.stringify({
            deviceId: DEFAULT_M5_DEVICE_ID,
            ...command,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Cloud command failed.');
        return data;
      };

      const refreshStatus = async ({ silent = false } = {}) => {
        try {
          if (!silent) setStatus('Reading', 'watch');
          const data = getLanUrl() ? await fetchLanJson('/status') : await refreshCloudStatus({ silent });
          if (!data) return null;
          updateFromPayload(data);
          return data;
        } catch (err) {
          if (!silent) {
            console.warn('M5 WiFi status request failed', err);
            setStatus('Offline', 'alert');
            setStoreStatus(err instanceof Error ? err.message : 'M5 WiFi request failed.', 'error');
          }
          return null;
        }
      };

      const sendMessage = async () => {
        const text = String(messageInput?.value || '').trim();
        if (!text) {
          setStoreStatus('Type a message to send to the M5.', 'error');
          return;
        }
        try {
          setStatus('Sending', 'watch');
          const data = getLanUrl()
            ? await fetchLanJson('/message', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text,
              })
            : await queueCloudCommand({ type: 'message', message: text });
          latestPayloadEl.textContent = JSON.stringify(data, null, 2).slice(0, 2400);
          setStatus(getLanUrl() ? 'Message sent' : 'Cloud queued', 'stable');
          setStoreStatus(getLanUrl()
            ? `WiFi message ${data.message_seq || ''} sent.`
            : `Cloud command queued for ${data.command?.deviceId || DEFAULT_M5_DEVICE_ID}.`, 'ok');
          if (messageInput) messageInput.value = '';
        } catch (err) {
          console.warn('M5 WiFi message failed', err);
          setStatus('Send failed', 'alert');
          setStoreStatus(err instanceof Error ? err.message : 'M5 message failed.', 'error');
        }
      };

      const triggerUpload = async () => {
        try {
          setStatus('Uploading', 'watch');
          const data = getLanUrl()
            ? await fetchLanJson('/upload', { method: 'POST' })
            : await queueCloudCommand({ type: 'upload', message: 'upload now' });
          latestPayloadEl.textContent = JSON.stringify(data, null, 2).slice(0, 2400);
          setStatus(getLanUrl() ? (data.upload_ok ? 'Uploaded' : 'Queued') : 'Cloud queued', getLanUrl() && !data.upload_ok ? 'watch' : 'stable');
          setStoreStatus(getLanUrl()
            ? `M5 queue depth ${data.queue_depth ?? '--'}, HTTP ${data.upload_code ?? '--'}.`
            : `Upload command queued for ${data.command?.deviceId || DEFAULT_M5_DEVICE_ID}.`, getLanUrl() && !data.upload_ok ? 'neutral' : 'ok');
          refreshDeviceTelemetry();
        } catch (err) {
          console.warn('M5 WiFi upload trigger failed', err);
          setStatus('Upload failed', 'alert');
          setStoreStatus(err instanceof Error ? err.message : 'M5 upload trigger failed.', 'error');
        }
      };

      urlInput.value = localStorage.getItem(WIFI_LAN_URL_KEY) || '';
      setStatus(urlInput.value ? 'LAN ready' : 'Cloud ready', 'stable');
      saveBtn?.addEventListener('click', () => {
        saveLanUrl();
        refreshStatus();
      });
      refreshBtn?.addEventListener('click', () => {
        saveLanUrl();
        refreshStatus();
      });
      uploadBtn?.addEventListener('click', () => {
        saveLanUrl();
        triggerUpload();
      });
      sendMessageBtn?.addEventListener('click', () => {
        saveLanUrl();
        sendMessage();
      });
      messageInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          saveLanUrl();
          sendMessage();
        }
      });

      refreshStatus({ silent: true });
      wifiTelemetryPollTimer = window.setInterval(() => {
        if (document.hidden) return;
        refreshStatus({ silent: true });
      }, WIFI_LAN_POLL_MS);
      stopWifiTelemetryBridge = () => {
        if (wifiTelemetryPollTimer) {
          window.clearInterval(wifiTelemetryPollTimer);
          wifiTelemetryPollTimer = null;
        }
      };
    }

    function initBluetoothTelemetryBridge() {
      if (bluetoothBridgeInitialized) return;
      bluetoothBridgeInitialized = true;

      const connectBtn = document.getElementById('ble-connect');
      const disconnectBtn = document.getElementById('ble-disconnect');
      const sendBtn = document.getElementById('ble-send-message');
      const messageInput = document.getElementById('ble-message-input');
      const petSelect = document.getElementById('ble-pet-select');
      const sendPetInfoBtn = document.getElementById('ble-send-pet-info');
      const petSyncStatusEl = document.getElementById('ble-pet-sync-status');
      const statusEl = document.getElementById('ble-bridge-status');
      const deviceNameEl = document.getElementById('ble-device-name');
      const storedCountEl = document.getElementById('ble-stored-count');
      const latestPayloadEl = document.getElementById('ble-latest-payload');
      const storeStatusEl = document.getElementById('ble-store-status');

      if (!connectBtn || !statusEl || !latestPayloadEl) return;

      const setStatus = (text, state = 'stable') => {
        statusEl.textContent = text;
        statusEl.dataset.status = state;
      };

      const setStoreStatus = (text, state = 'neutral') => {
        if (!storeStatusEl) return;
        storeStatusEl.textContent = text;
        storeStatusEl.classList.toggle('text-red-500', state === 'error');
        storeStatusEl.classList.toggle('text-primary', state === 'ok');
        storeStatusEl.classList.toggle('text-gray-500', state !== 'error' && state !== 'ok');
      };

      const setPetSyncStatus = (text, state = 'neutral') => {
        if (!petSyncStatusEl) return;
        petSyncStatusEl.textContent = text;
        petSyncStatusEl.classList.toggle('text-red-500', state === 'error');
        petSyncStatusEl.classList.toggle('text-primary', state === 'ok');
        petSyncStatusEl.classList.toggle('text-gray-500', state !== 'error' && state !== 'ok');
      };

      const sanitizeBleDisplayText = (value = '', maxLength = 24) => String(value || '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);

      const getPetAgeLabel = (pet = {}) => {
        if (pet.birthday) {
          const birthday = new Date(`${pet.birthday}T00:00:00`);
          if (!Number.isNaN(birthday.getTime())) {
            const today = new Date();
            let years = today.getFullYear() - birthday.getFullYear();
            let months = today.getMonth() - birthday.getMonth();
            if (today.getDate() < birthday.getDate()) months -= 1;
            if (months < 0) {
              years -= 1;
              months += 12;
            }
            if (years > 0) return `${years}y ${months}m`;
            return `${Math.max(months, 0)}m`;
          }
        }
        return sanitizeBleDisplayText(pet.age || pet.birthday || 'Age not set', 16);
      };

      const getBlePetOptions = () => getStoredPets().filter((pet) => String(pet.name || '').trim());

      const renderBlePetOptions = () => {
        if (!petSelect) return;
        const selected = petSelect.value;
        const pets = getBlePetOptions();
        petSelect.innerHTML = '<option value="">Choose a pet</option>';
        pets.forEach((pet) => {
          const option = document.createElement('option');
          option.value = pet.id || pet.nfcId || pet.name;
          option.textContent = `${pet.name || 'Unnamed pet'} · ${getPetAgeLabel(pet)}`;
          petSelect.appendChild(option);
        });
        if (selected && pets.some((pet) => (pet.id || pet.nfcId || pet.name) === selected)) {
          petSelect.value = selected;
        }
      };

      const setHeaderWirelessStatus = (text) => {
        const headerConnectionStatusEl = document.getElementById('header-connection-status');
        if (!headerConnectionStatusEl) return;
        const campus = getCurrentUser()?.campus || 'Taicang';
        headerConnectionStatusEl.textContent = `${campus} · ${text}`;
      };

      const updateButtons = () => {
        const connected = Boolean(bluetoothBridgeState.device?.gatt?.connected);
        connectBtn.disabled = connected;
        if (disconnectBtn) disconnectBtn.disabled = !connected;
        if (sendBtn) sendBtn.disabled = !connected || !bluetoothBridgeState.messageChar;
        if (sendPetInfoBtn) {
          sendPetInfoBtn.disabled = !connected || !bluetoothBridgeState.messageChar || !petSelect?.value;
        }
        if (deviceNameEl) {
          deviceNameEl.textContent = bluetoothBridgeState.device?.name || (connected ? 'PawTrace BLE' : '--');
        }
      };

      const rememberBleDevice = (device) => {
        if (!device) return;
        try {
          localStorage.setItem(BLE_REMEMBERED_DEVICE_KEY, JSON.stringify({
            id: device.id || '',
            name: device.name || '',
            savedAt: new Date().toISOString(),
          }));
        } catch {}
      };

      const getRememberedBleDevice = () => {
        try {
          return JSON.parse(localStorage.getItem(BLE_REMEMBERED_DEVICE_KEY) || '{}') || {};
        } catch {
          return {};
        }
      };

      const decodeValue = (value) => {
        const bytes = value instanceof DataView
          ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
          : new Uint8Array(value || []);
        return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/g, '').trim();
      };

      const hasObjectShape = (value) => value && typeof value === 'object' && !Array.isArray(value);

      const parseBleJsonObject = (text) => {
        try {
          const candidate = JSON.parse(text);
          return hasObjectShape(candidate) ? candidate : {};
        } catch {
          return {};
        }
      };

      const extractBleJsonMessages = (chunk) => {
        const nextBuffer = `${bluetoothBridgeState.rxBuffer || ''}${chunk || ''}`.slice(-6000);
        const messages = [];
        let start = -1;
        let depth = 0;
        let consumed = 0;
        let inString = false;
        let escaping = false;

        for (let index = 0; index < nextBuffer.length; index += 1) {
          const char = nextBuffer[index];
          if (start < 0) {
            if (char === '{') {
              start = index;
              depth = 1;
            }
            continue;
          }

          if (escaping) {
            escaping = false;
            continue;
          }
          if (char === '\\') {
            escaping = true;
            continue;
          }
          if (char === '"') {
            inString = !inString;
            continue;
          }
          if (inString) continue;
          if (char === '{') depth += 1;
          if (char === '}') depth -= 1;
          if (depth === 0) {
            messages.push(nextBuffer.slice(start, index + 1));
            consumed = index + 1;
            start = -1;
          }
        }

        bluetoothBridgeState.rxBuffer = nextBuffer.slice(consumed).trimStart();
        if (bluetoothBridgeState.rxBuffer.length > 5000) {
          const restart = bluetoothBridgeState.rxBuffer.lastIndexOf('{');
          bluetoothBridgeState.rxBuffer = restart >= 0 ? bluetoothBridgeState.rxBuffer.slice(restart) : '';
        }
        return messages;
      };

      const telemetryTimestampFromUptime = (parsed = {}, now = new Date()) => {
        const explicit = parsed.timestamp || parsed.capturedAt || parsed.time;
        if (explicit) return explicit;
        const uptimeMs = Number(parsed.uptimeMs ?? parsed.uptime_ms);
        const dumpUptimeMs = Number(bluetoothBridgeState.logDumpCurrentUptimeMs);
        if (Number.isFinite(uptimeMs) && Number.isFinite(dumpUptimeMs) && dumpUptimeMs >= uptimeMs) {
          return new Date(now.getTime() - (dumpUptimeMs - uptimeMs)).toISOString();
        }
        return now.toISOString();
      };

      const buildTelemetryPayload = (text, parsed = parseBleJsonObject(text)) => {
        const parsedOk = Object.keys(parsed).length > 0;

        const now = new Date();
        const timestamp = telemetryTimestampFromUptime(parsed, now);
        const currentUser = getCurrentUser();
        const explicitDeviceId = parsed.deviceId
          || parsed.device_id
          || parsed.device
          || parsed.id
          || bluetoothBridgeState.device?.name
          || bluetoothBridgeState.device?.id
          || 'pawtrace-ble';
        const metadata = hasObjectShape(parsed.metadata) ? parsed.metadata : {};

        return {
          ...parsed,
          deviceId: String(explicitDeviceId),
          timestamp,
          userId: currentUser?.username && currentUser.username !== 'guest' ? currentUser.username : parsed.userId,
          source: parsed.source || 'm5stickc-plus-ble-web',
          transport: 'ble',
          bleName: bluetoothBridgeState.device?.name || parsed.bleName || parsed.ble_name || '',
          bleServiceUuid: BLE_SERVICE_UUID,
          bleTelemetryUuid: BLE_TELEMETRY_UUID,
          bleMessageUuid: BLE_MESSAGE_UUID,
          bleBridgeReceivedAt: now.toISOString(),
          bleBridgeStoredBy: currentUser?.username || '',
          bleLastMessage: parsed.bleLastMessage || parsed.ble_last_message || bluetoothBridgeState.lastMessage || '',
          metadata: {
            ...metadata,
            bridge: 'web-bluetooth',
            rawBlePayload: parsedOk ? undefined : text,
          },
        };
      };

      const handleBleControlPayload = (parsed = {}) => {
        const type = String(parsed.type || '').toLowerCase();
        if (!type) return false;
        if (type === 'log_begin') {
          bluetoothBridgeState.logDumpCurrentUptimeMs = Number(parsed.current_uptime_ms ?? parsed.uptime_ms);
          setStatus('Syncing history', 'watch');
          setStoreStatus(`Receiving ${Number(parsed.count || 0)} cached M5 packets...`);
          return true;
        }
        if (type === 'log_end') {
          bluetoothBridgeState.logDumpCurrentUptimeMs = null;
          setStatus('Receiving', 'stable');
          setStoreStatus('M5 cached history sync finished.', 'ok');
          refreshDeviceTelemetry();
          return true;
        }
        if (type === 'ack') {
          bluetoothBridgeState.lastMessage = String(parsed.cmd || parsed.status || 'ack').slice(0, 40);
          setStoreStatus(`Device ack: ${bluetoothBridgeState.lastMessage}`);
          return true;
        }
        return false;
      };

      const storeTelemetryPayload = async (payload) => {
        if (!getAuthToken()) {
          setStoreStatus('BLE packet received. Sign in to store it on the backend.');
          return;
        }

        const response = await authJsonFetch('/api/device/telemetry', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Telemetry store failed.');
        }

        bluetoothBridgeState.storedCount += 1;
        if (storedCountEl) storedCountEl.textContent = String(bluetoothBridgeState.storedCount);
        setStoreStatus(`Stored packet ${bluetoothBridgeState.storedCount}.`, 'ok');
        if (data.telemetry) {
          queueDeviceTelemetryMerge([data.telemetry]);
        } else {
          refreshDeviceTelemetry();
        }
      };

      const processTelemetryMessage = async (text) => {
        const parsed = parseBleJsonObject(text);
        if (!Object.keys(parsed).length && String(text || '').trim().startsWith('{')) {
          setStatus('Dropped partial BLE packet', 'watch');
          setStoreStatus('Dropped an incomplete BLE packet; waiting for the next complete packet.', 'watch');
          return;
        }
        if (handleBleControlPayload(parsed)) return;
        latestPayloadEl.textContent = JSON.stringify(parsed || { raw: text }, null, 2).slice(0, 2400);
        setStatus('Provisioning only', 'watch');
        setHeaderWirelessStatus('WiFi telemetry');
        setStoreStatus('BLE telemetry storage is disabled. Use BLE only to send WiFi credentials; live data must arrive through WiFi.', 'error');
        return;

        const payload = buildTelemetryPayload(text, parsed);
        latestPayloadEl.textContent = JSON.stringify(payload, null, 2).slice(0, 2400);
        setStatus('Receiving', 'stable');
        setHeaderWirelessStatus('BLE receiving');
        queueDeviceTelemetryMerge([payload]);
        try {
          await storeTelemetryPayload(payload);
        } catch (err) {
          console.warn('BLE telemetry store failed', err);
          setStoreStatus(err instanceof Error ? err.message : 'Telemetry store failed.', 'error');
        }
      };

      const handleTelemetryNotification = async (event) => {
        const chunk = decodeValue(event.target?.value);
        if (!chunk) return;
        const messages = extractBleJsonMessages(chunk);
        if (!messages.length && chunk.startsWith('{')) setStatus('Receiving chunk', 'watch');
        for (const message of messages) {
          await processTelemetryMessage(message);
        }
      };

      const writeBleText = async (text) => {
        if (!bluetoothBridgeState.messageChar) {
          throw new Error('BLE message characteristic is not available.');
        }
        const bytes = new TextEncoder().encode(String(text || '').slice(0, 180));
        if (typeof bluetoothBridgeState.messageChar.writeValueWithoutResponse === 'function') {
          await bluetoothBridgeState.messageChar.writeValueWithoutResponse(bytes);
        } else if (typeof bluetoothBridgeState.messageChar.writeValueWithResponse === 'function') {
          await bluetoothBridgeState.messageChar.writeValueWithResponse(bytes);
        } else {
          await bluetoothBridgeState.messageChar.writeValue(bytes);
        }
      };

      const requestBleHistoryDump = async () => {
        if (!bluetoothBridgeState.messageChar) return;
        try {
          await writeBleText(`record:dump:${DEVICE_BLE_HISTORY_DUMP_LIMIT}`);
          setStoreStatus('Requesting cached M5 history...', 'ok');
        } catch (err) {
          console.warn('BLE history request failed', err);
        }
      };

      const handleDisconnected = () => {
        bluetoothBridgeState.telemetryChar = null;
        bluetoothBridgeState.messageChar = null;
        setStatus('Disconnected', 'watch');
        setHeaderWirelessStatus(bluetoothBridgeState.userDisconnected ? 'Wireless paused' : 'BLE reconnecting');
        updateButtons();
      };

      const connectKnownDevice = async (device, { manual = false } = {}) => {
        if (!navigator.bluetooth || !device?.gatt) {
          throw new Error('Bluetooth device is unavailable.');
        }
        if (bluetoothBridgeState.device?.gatt?.connected && bluetoothBridgeState.device === device) {
          return true;
        }

        bluetoothBridgeState.userDisconnected = false;
        bluetoothBridgeState.device = device;
        rememberBleDevice(device);
        device.addEventListener('gattserverdisconnected', handleDisconnected);
        if (deviceNameEl) deviceNameEl.textContent = device.name || 'PawTrace BLE';

        setStatus(manual ? 'Connecting' : 'Auto connecting', 'watch');
        setHeaderWirelessStatus(manual ? 'BLE connecting' : 'BLE auto connecting');
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(BLE_SERVICE_UUID);
        bluetoothBridgeState.telemetryChar = await service.getCharacteristic(BLE_TELEMETRY_UUID);
        bluetoothBridgeState.telemetryChar.addEventListener('characteristicvaluechanged', handleTelemetryNotification);
        await bluetoothBridgeState.telemetryChar.startNotifications();

        try {
          bluetoothBridgeState.messageChar = await service.getCharacteristic(BLE_MESSAGE_UUID);
        } catch {
          bluetoothBridgeState.messageChar = null;
          setStoreStatus('Connected, but firmware does not expose the writable message characteristic.', 'error');
        }

        setStatus('Connected', 'stable');
        setHeaderWirelessStatus('BLE connected');
        setStoreStatus('Wireless BLE connected. Live packets will update automatically.', 'ok');
        updateButtons();

        try {
          const initial = await bluetoothBridgeState.telemetryChar.readValue();
          await handleTelemetryNotification({ target: { value: initial } });
        } catch {}
        requestBleHistoryDump();
        return true;
      };

      const findRememberedBleDevice = async () => {
        if (!navigator.bluetooth || typeof navigator.bluetooth.getDevices !== 'function') return null;
        const remembered = getRememberedBleDevice();
        const devices = await navigator.bluetooth.getDevices();
        return devices.find((device) => {
          if (remembered.id && device.id === remembered.id) return true;
          if (remembered.name && device.name === remembered.name) return true;
          return /^PawTrace/i.test(device.name || '');
        }) || null;
      };

      const tryAutoReconnect = async ({ silent = false } = {}) => {
        if (!navigator.bluetooth || bluetoothBridgeState.userDisconnected || bluetoothBridgeState.autoReconnectBusy) return false;
        if (bluetoothBridgeState.device?.gatt?.connected) return true;
        if (typeof navigator.bluetooth.getDevices !== 'function') {
          if (!silent) {
            setStatus('Pair required', 'watch');
            setHeaderWirelessStatus('BLE pair required');
            setStoreStatus('Tap Connect once to authorize PawTrace BLE. After that, the app can reconnect automatically.');
          }
          return false;
        }

        bluetoothBridgeState.autoReconnectBusy = true;
        try {
          if (!silent) {
            setStatus('Auto searching', 'watch');
            setHeaderWirelessStatus('BLE auto search');
          }
          const device = await findRememberedBleDevice();
          if (!device) {
            if (!silent) {
              setStatus('Pair required', 'watch');
              setHeaderWirelessStatus('BLE pair required');
              setStoreStatus('No remembered PawTrace BLE device yet. Tap Connect once and choose PawTrace-001.');
            }
            return false;
          }
          await connectKnownDevice(device);
          return true;
        } catch (err) {
          console.warn('BLE auto reconnect failed', err);
          if (!silent) {
            setStatus('Reconnect failed', 'alert');
            setHeaderWirelessStatus('BLE reconnect failed');
            setStoreStatus(err instanceof Error ? err.message : 'BLE auto reconnect failed.', 'error');
          }
          return false;
        } finally {
          bluetoothBridgeState.autoReconnectBusy = false;
        }
      };

      const startAutoReconnect = () => {
        if (bluetoothBridgeState.autoReconnectTimer) {
          window.clearInterval(bluetoothBridgeState.autoReconnectTimer);
        }
        bluetoothBridgeState.userDisconnected = false;
        tryAutoReconnect();
        bluetoothBridgeState.autoReconnectTimer = window.setInterval(() => {
          tryAutoReconnect({ silent: true });
        }, BLE_AUTO_RECONNECT_MS);
      };

      const connect = async () => {
        if (!navigator.bluetooth) {
          setStatus('Unsupported', 'alert');
          setStoreStatus('This browser does not support Web Bluetooth. Use Chrome or Edge on localhost/HTTPS.', 'error');
          return;
        }

        setStatus('Scanning', 'watch');
        setStoreStatus('Choose PawTrace-001 in the Bluetooth picker.');
        try {
          const device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'PawTrace' }],
            optionalServices: [BLE_SERVICE_UUID],
          });
          await connectKnownDevice(device, { manual: true });
        } catch (err) {
          console.warn('BLE bridge connection failed', err);
          setStatus('Failed', 'alert');
          setHeaderWirelessStatus('BLE failed');
          setStoreStatus(err instanceof Error ? err.message : 'Bluetooth connection failed.', 'error');
          updateButtons();
        }
      };

      const disconnect = () => {
        bluetoothBridgeState.userDisconnected = true;
        if (bluetoothBridgeState.device?.gatt?.connected) {
          bluetoothBridgeState.device.gatt.disconnect();
        } else {
          handleDisconnected();
        }
        setHeaderWirelessStatus('Wireless paused');
      };

      const writeBleMessage = async (packet) => {
        await writeBleText(JSON.stringify(packet));
      };

      const sendPetDisplayInfo = async () => {
        if (!petSelect?.value) {
          setPetSyncStatus('Choose a pet first.', 'error');
          updateButtons();
          return;
        }
        const pet = getBlePetOptions().find((entry) => (entry.id || entry.nfcId || entry.name) === petSelect.value);
        if (!pet) {
          setPetSyncStatus('Selected pet was not found.', 'error');
          renderBlePetOptions();
          updateButtons();
          return;
        }
        const petName = sanitizeBleDisplayText(pet.name || 'Pet', 18);
        const petAge = sanitizeBleDisplayText(getPetAgeLabel(pet), 14);
        const petDisplayPacket = {
          type: 'pet_display',
          pet_name: petName,
          pet_age: petAge,
          source: 'pawtrace-web',
        };
        try {
          await writeBleMessage(petDisplayPacket);
          bluetoothBridgeState.lastMessage = 'pet_display';
          setPetSyncStatus(`Sent ${petName} · ${petAge}. Owner info was not transmitted.`, 'ok');
          setStoreStatus('Pet display card sent with name and age only.', 'ok');
        } catch (err) {
          console.warn('BLE pet display send failed', err);
          setPetSyncStatus(err instanceof Error ? err.message : 'BLE pet display send failed.', 'error');
        }
      };

      const sendMessage = async () => {
        const text = String(messageInput?.value || '').trim();
        if (!text || !bluetoothBridgeState.messageChar) return;
        const messagePacket = {
          message: text,
          source: 'pawtrace-web',
          sentAt: new Date().toISOString(),
        };
        try {
          await writeBleMessage(messagePacket);
          bluetoothBridgeState.lastMessage = 'message_sent';
          setStoreStatus('Message sent to PawTrace device.', 'ok');
          if (messageInput) messageInput.value = '';
        } catch (err) {
          console.warn('BLE message send failed', err);
          setStoreStatus(err instanceof Error ? err.message : 'BLE message send failed.', 'error');
        }
      };

      if (!navigator.bluetooth) {
        connectBtn.disabled = true;
        setStatus('Unsupported', 'alert');
        setHeaderWirelessStatus('BLE unsupported');
        setStoreStatus('Web Bluetooth is unavailable in this browser. Use Chrome or Edge on localhost/HTTPS.', 'error');
      } else {
        setStatus('Auto searching', 'watch');
        setHeaderWirelessStatus('BLE auto search');
      }

      connectBtn.addEventListener('click', connect);
      disconnectBtn?.addEventListener('click', disconnect);
      petSelect?.addEventListener('change', updateButtons);
      sendPetInfoBtn?.addEventListener('click', sendPetDisplayInfo);
      sendBtn?.addEventListener('click', sendMessage);
      messageInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          sendMessage();
        }
      });
      document.addEventListener(PETS_CHANGED_EVENT, () => {
        renderBlePetOptions();
        updateButtons();
      });
      renderBlePetOptions();
      updateButtons();
      stopBluetoothTelemetryBridge = () => {
        bluetoothBridgeState.userDisconnected = true;
        clearQueuedDeviceTelemetryMerge();
        if (bluetoothBridgeState.autoReconnectTimer) {
          window.clearInterval(bluetoothBridgeState.autoReconnectTimer);
          bluetoothBridgeState.autoReconnectTimer = null;
        }
        if (bluetoothBridgeState.device?.gatt?.connected) {
          bluetoothBridgeState.device.gatt.disconnect();
        }
        bluetoothBridgeState.telemetryChar = null;
        bluetoothBridgeState.messageChar = null;
      };
      if (navigator.bluetooth) startAutoReconnect();
    }

    function isSeededDefaultPetList(list = []) {
      const seedIds = ['pet-1', 'pet-2', 'pet-3'];
      const seedNames = ['Xiao Hei', 'Xiao Bai', 'Xiao Huang'];
      return Array.isArray(list)
        && list.length === seedIds.length
        && list.every((pet, index) => pet?.id === seedIds[index] && pet?.name === seedNames[index]);
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
        birthday: pet.birthday,
        gender: pet.gender,
        traits: Array.isArray(pet.traits) ? pet.traits : [],
        status: pet.status,
        health: pet.health,
        location: pet.location,
        nfcContact: pet.nfcContact,
        nfcNote: pet.nfcNote,
        temperature: latestVitals?.temperature ?? null,
        heartRate: latestVitals?.heartRate ?? null,
      };
    }

    function gatherOwnedPetsForPayload() {
      return getStoredPets().map(sanitizePetForPayload);
    }

    async function sendMonitoringPayload(payload = {}) {
      if (!window.PAWTRACE_ENABLE_MONITORING) return;
      if (isGuestSession()) return;
      try {
        await authJsonFetch(MONITORING_API, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Monitoring payload failed', err);
      }
    }

    function loadMyPetsFromStorage() {
      if (isGuestSession()) {
        return Array.isArray(guestMyPetStore) ? [...guestMyPetStore] : [];
      }
      try {
        return JSON.parse(localStorage.getItem(MY_PETS_KEY)) || [];
      } catch {
        return [];
      }
    }

    function saveMyPetsToStorage(list) {
      if (isGuestSession()) {
        guestMyPetStore = Array.isArray(list) ? [...list] : [];
        return;
      }
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
      const deviceIdEl = document.getElementById('health-device-id');
      const packetTimeEl = document.getElementById('health-packet-time');
      const packetSourceEl = document.getElementById('health-packet-source');
      const latestTempEl = document.getElementById('health-latest-temp');
      const latestHeartEl = document.getElementById('health-latest-heart');
      const latestSpo2El = document.getElementById('health-latest-spo2');
      const tempStatusEl = document.getElementById('health-temp-status');
      const heartStatusEl = document.getElementById('health-heart-status');
      const spo2StatusEl = document.getElementById('health-spo2-status');
      const tempMeterEl = document.getElementById('health-temp-meter');
      const heartMeterEl = document.getElementById('health-heart-meter');
      const spo2MeterEl = document.getElementById('health-spo2-meter');
      const activityMeterEl = document.getElementById('health-activity-meter');
      const activityStateEl = document.getElementById('health-activity-state');
      const activityScoreEl = document.getElementById('health-activity-score');
      const batteryStateEl = document.getElementById('health-battery-state');
      const batteryMetaEl = document.getElementById('health-battery-meta');
      const networkStateEl = document.getElementById('health-network-state');
      const wifiStateEl = document.getElementById('health-wifi-state');
      const wifiRssiEl = document.getElementById('health-wifi-rssi');
      const uploadStateEl = document.getElementById('health-upload-state');
      const uploadEnabledEl = document.getElementById('health-upload-enabled');
      const uploadCodeEl = document.getElementById('health-upload-code');
      const vitalsStateEl = document.getElementById('health-vitals-state');
      const vitalsSummaryEl = document.getElementById('health-vitals-summary');
      const locationStateEl = document.getElementById('health-location-state');
      const gpsStateEl = document.getElementById('health-gps-state');
      const gpsSatsEl = document.getElementById('health-gps-sats');
      const gpsHdopEl = document.getElementById('health-gps-hdop');
      const locationCoordsEl = document.getElementById('health-location-coords');
      const lastLocationValidEl = document.getElementById('health-last-location-valid');
      const trackSamplesEl = document.getElementById('health-track-samples');
      const geofenceEnabledEl = document.getElementById('health-geofence-enabled');
      const distanceStateEl = document.getElementById('health-distance-state');
      const lostAlertEl = document.getElementById('health-lost-alert');
      const heartFoundEl = document.getElementById('health-heart-found');
      const fingerStateEl = document.getElementById('health-finger-state');
      const spo2ValidDetailEl = document.getElementById('health-spo2-valid-detail');
      const historyCountEl = document.getElementById('health-history-count');
      const historyScrollEl = document.getElementById('health-history-scroll');
      const historyToggleBtn = document.getElementById('health-history-toggle');
      const historyToggleLabelEl = document.getElementById('health-history-toggle-label');
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
      const formStatus = document.getElementById('health-form-status');
      if (!petSelect) return;

      function setFormStatus(message = '', isError = false) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.classList.toggle('hidden', !message);
        formStatus.classList.toggle('text-red-500', Boolean(message) && isError);
        formStatus.classList.toggle('text-primary', Boolean(message) && !isError);
      }

      function setHistoryCollapsed(isCollapsed = true) {
        if (historyScrollEl) {
          historyScrollEl.classList.toggle('hidden', isCollapsed);
          historyScrollEl.setAttribute('aria-hidden', String(isCollapsed));
        }
        if (historyToggleBtn) {
          historyToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
          historyToggleBtn.setAttribute('aria-label', isCollapsed ? 'Show recent health records' : 'Hide recent health records');
          historyToggleBtn.setAttribute('title', isCollapsed ? 'Show records' : 'Hide records');
        }
        if (historyToggleLabelEl) {
          historyToggleLabelEl.textContent = isCollapsed ? 'Show' : 'Hide';
        }
      }

      function setHealthText(element, value = '--') {
        if (element) element.textContent = value;
      }

      function toneFromBand(band = 'unknown') {
        return ['stable', 'watch', 'alert'].includes(band) ? band : 'unknown';
      }

      function labelFromBand(band = 'unknown', fallback = 'No reading yet') {
        if (band === 'stable') return 'Stable';
        if (band === 'watch') return 'Watch';
        if (band === 'alert') return 'Needs attention';
        return fallback;
      }

      function activityTone(activity = '') {
        const normalized = String(activity || '').toLowerCase();
        if (!normalized) return 'unknown';
        if (/(abnormal|shake|impact|alert|lost|risk)/.test(normalized)) return 'alert';
        if (/(running|high|active)/.test(normalized)) return 'watch';
        return 'stable';
      }

      function assessmentTone(assessment = {}) {
        return assessment.state === 'Stable'
          ? 'stable'
          : assessment.state === 'Watch closely' || assessment.state === 'Check contact'
            ? 'watch'
            : assessment.state === 'Needs attention'
              ? 'alert'
              : 'unknown';
      }

      function readableBool(value, trueLabel = 'Ready', falseLabel = 'Waiting', emptyLabel = '--') {
        const normalized = optionalBoolean(value);
        if (normalized === true) return trueLabel;
        if (normalized === false) return falseLabel;
        return emptyLabel;
      }

      function activityDisplayLabel(activity = '') {
        const normalized = String(activity || '').trim().toLowerCase();
        if (!normalized) return 'Waiting';
        if (normalized === 'rest' || normalized === 'resting') return 'Resting';
        if (normalized === 'walk' || normalized === 'walking') return 'Walking';
        if (normalized === 'run' || normalized === 'running') return 'Running';
        return toTitleLabel(activity);
      }

      function activityCareHint(activity = '', activityScore = null) {
        const normalized = String(activity || '').toLowerCase();
        if (!activity) return 'No movement yet';
        if (/(run|running|high|active)/.test(normalized)) return 'High energy now';
        if (/(walk|walking)/.test(normalized)) return 'Light movement';
        if (hasTelemetryNumber(activityScore) && Number(activityScore) > 0.45) return 'Active movement';
        return 'Calm movement';
      }

      function trackerConnectionLabel(value) {
        return readableBool(value, 'Live tracker', 'Tracker offline', 'Tracker waiting');
      }

      function syncLabel(value) {
        return readableBool(value, 'Synced', 'Sync waiting', 'No sync yet');
      }

      function locationLabel(value) {
        return readableBool(value, 'On map', 'Finding location', 'Location waiting');
      }

      function gpsFixLabel(value) {
        return hasTelemetryNumber(value) && Number(value) > 0 ? 'GPS locked' : 'GPS searching';
      }

      function sensorFitLabel(heartFound, finger) {
        if (optionalBoolean(heartFound) === true && optionalBoolean(finger) === true) return 'Good contact';
        if (optionalBoolean(heartFound) === false || optionalBoolean(finger) === false) return 'Adjust sensor';
        return 'Contact waiting';
      }

      function safeZoneLabel(distanceM, lostAlert) {
        if (optionalBoolean(lostAlert) === true) return 'Outside safe zone';
        if (hasTelemetryNumber(distanceM) && Number(distanceM) > 0) return `${Math.round(Number(distanceM))} m from home`;
        return 'Inside safe zone';
      }

      function setHealthTone(element, tone = 'unknown') {
        if (!element) return;
        const normalized = toneFromBand(tone);
        element.dataset.status = normalized;
        const tile = element.closest('.health-primary-card, .health-focus-item, .health-metric-tile, .health-summary-callout, .health-hero-card, .health-status-pill');
        if (tile) tile.dataset.status = normalized;
      }

      function setHealthMeter(element, value, min, max, tone = 'unknown') {
        if (!element) return;
        let percent = 0;
        if (hasTelemetryNumber(value) && Number.isFinite(min) && Number.isFinite(max) && max > min) {
          percent = ((Number(value) - min) / (max - min)) * 100;
        }
        const clamped = Math.max(0, Math.min(100, percent));
        element.style.width = `${clamped}%`;
        element.dataset.status = toneFromBand(tone);
      }

      function activityMeterValue(activity = '', activityScore = null, tone = 'unknown') {
        if (hasTelemetryNumber(activityScore)) return Math.max(0, Math.min(100, Number(activityScore) * 100));
        if (tone === 'alert') return 96;
        if (tone === 'watch') return 68;
        if (tone === 'stable') return /walk/i.test(String(activity || '')) ? 42 : 24;
        return 0;
      }

      function setPacketDetailEmpty(summary = 'Add a health reading to start monitoring.') {
        setHealthText(deviceIdEl, '--');
        setHealthText(packetTimeEl, '--');
        setHealthText(packetSourceEl, '--');
        setHealthText(latestTempEl, '--');
        setHealthText(latestHeartEl, '--');
        setHealthText(latestSpo2El, '--');
        setHealthText(tempStatusEl, 'No reading yet');
        setHealthTone(tempStatusEl, 'unknown');
        setHealthText(heartStatusEl, 'No reading yet');
        setHealthTone(heartStatusEl, 'unknown');
        setHealthText(spo2StatusEl, 'No reading yet');
        setHealthTone(spo2StatusEl, 'unknown');
        setHealthMeter(tempMeterEl, NaN, 35, 42.5, 'unknown');
        setHealthMeter(heartMeterEl, NaN, 40, 220, 'unknown');
        setHealthMeter(spo2MeterEl, NaN, 80, 100, 'unknown');
        setHealthMeter(activityMeterEl, NaN, 0, 100, 'unknown');
        setHealthText(activityStateEl, 'Waiting');
        setHealthText(activityScoreEl, 'No movement yet');
        setHealthTone(activityScoreEl, 'unknown');
        setHealthText(batteryStateEl, '--');
        setHealthTone(batteryStateEl, 'unknown');
        setHealthText(batteryMetaEl, 'Tracker battery');
        setHealthText(networkStateEl, 'Tracker waiting');
        setHealthTone(networkStateEl, 'unknown');
        setHealthText(wifiStateEl, 'Tracker waiting');
        setHealthText(wifiRssiEl, '--');
        setHealthText(uploadStateEl, 'No sync yet');
        setHealthText(uploadEnabledEl, '--');
        setHealthText(uploadCodeEl, '--');
        setHealthText(vitalsStateEl, 'Waiting');
        setHealthText(vitalsSummaryEl, summary);
        setHealthTone(vitalsSummaryEl, 'unknown');
        setHealthText(locationStateEl, 'Location waiting');
        setHealthTone(locationStateEl, 'unknown');
        setHealthText(gpsStateEl, 'GPS searching');
        setHealthText(gpsSatsEl, '--');
        setHealthText(gpsHdopEl, '--');
        setHealthText(locationCoordsEl, '--');
        setHealthText(lastLocationValidEl, '--');
        setHealthText(trackSamplesEl, '--');
        setHealthText(geofenceEnabledEl, 'Safe zone --');
        setHealthText(distanceStateEl, '--');
        setHealthText(lostAlertEl, 'Alert clear');
        setHealthText(heartFoundEl, 'Contact waiting');
        setHealthTone(heartFoundEl, 'unknown');
        setHealthText(fingerStateEl, 'Sensor waiting');
        setHealthText(spo2ValidDetailEl, 'Oxygen waiting');
      }

      function render() {
        const pets = getStoredPets();
        const previousSelection = petSelect.value;
        petSelect.innerHTML = '';
        if (!pets.length) {
          petSelect.innerHTML = '<option value="">No pets available</option>';
          setPacketDetailEmpty();
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
        const deviceId = firstTelemetryValue(latestVitals?.deviceId, activePet.deviceId);
        const packetTimestamp = firstTelemetryValue(latestVitals?.timestamp, activePet.telemetryUpdatedAt);
        const packetSource = firstTelemetryValue(latestVitals?.source, activePet.telemetrySource, deviceId ? 'm5stack' : latestVitals ? 'manual' : '--');
        const packetTransport = firstTelemetryValue(latestVitals?.transport, activePet.telemetryTransport);
        const batteryPct = firstTelemetryValue(latestVitals?.batteryPct, activePet.batteryPct);
        const batteryMv = firstTelemetryValue(latestVitals?.batteryMv, activePet.batteryMv);
        const activity = firstTelemetryValue(latestVitals?.activity, activePet.activity);
        const activityScore = firstTelemetryValue(latestVitals?.activityScore, activePet.activityScore);
        const heartFound = firstTelemetryValue(latestVitals?.heartFound, activePet.heartFound);
        const finger = firstTelemetryValue(latestVitals?.finger, activePet.finger);
        const spo2Valid = firstTelemetryValue(latestVitals?.spo2Valid, activePet.spo2Valid);
        const gpsFix = firstTelemetryValue(latestVitals?.gpsFix, activePet.gpsFix);
        const gpsSatsUsed = firstTelemetryValue(latestVitals?.gpsSatsUsed, activePet.gpsSatsUsed);
        const gpsVisible = firstTelemetryValue(latestVitals?.gpsVisible, activePet.gpsVisible);
        const gpsHdop = firstTelemetryValue(latestVitals?.gpsHdop, activePet.gpsHdop);
        const lat = firstTelemetryValue(latestVitals?.lat, activePet.lat);
        const lon = firstTelemetryValue(latestVitals?.lon, activePet.lon);
        const locationValid = optionalBoolean(firstTelemetryValue(latestVitals?.locationValid, activePet.locationValid, activePet.gpsValid));
        const lastLocationValid = firstTelemetryValue(latestVitals?.lastLocationValid, activePet.lastLocationValid);
        const trackSamples = firstTelemetryValue(latestVitals?.trackSamples, activePet.trackSamples);
        const geofenceEnabled = firstTelemetryValue(latestVitals?.geofenceEnabled, activePet.geofenceEnabled);
        const distanceM = firstTelemetryValue(latestVitals?.distanceM, activePet.distanceM);
        const lostAlert = firstTelemetryValue(latestVitals?.lostAlert, activePet.lostAlert);
        const wifiConnected = firstTelemetryValue(latestVitals?.wifiConnected, activePet.wifiConnected);
        const wifiRssi = firstTelemetryValue(latestVitals?.wifiRssi, activePet.wifiRssi);
        const uploadEnabled = firstTelemetryValue(latestVitals?.uploadEnabled, activePet.uploadEnabled);
        const uploadOk = firstTelemetryValue(latestVitals?.uploadOk, activePet.uploadOk);
        const uploadCode = firstTelemetryValue(latestVitals?.uploadCode, activePet.uploadCode);
        const coordsLabel = hasValidCoordinate(lat, lon)
          ? `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`
          : '--';
        const gpsSatsLabel = hasTelemetryNumber(gpsSatsUsed) || hasTelemetryNumber(gpsVisible)
          ? `${telemetryIntegerLabel(gpsSatsUsed)} used / ${telemetryIntegerLabel(gpsVisible)} visible`
          : '--';
        const hasPacketSignals = Boolean(deviceId)
          || hasTelemetryNumber(gpsFix)
          || hasTelemetryValue(locationValid)
          || hasTelemetryValue(wifiConnected)
          || hasTelemetryValue(uploadOk);

        setHealthText(deviceIdEl, deviceId || '--');
        setHealthText(packetTimeEl, packetTimestamp ? formatReadingTimestamp(packetTimestamp) : '--');
        setHealthText(packetSourceEl, telemetrySourceLabel(packetSource, packetTransport));
        setHealthText(latestTempEl, assessment.tempLabel);
        setHealthText(latestHeartEl, assessment.heartLabel);
        setHealthText(latestSpo2El, hasTelemetryNumber(latestVitals?.spo2Pct) ? `${Math.round(Number(latestVitals.spo2Pct))}%` : '--');
        setHealthText(tempStatusEl, latestVitals ? labelFromBand(assessment.tempBand) : 'No reading yet');
        setHealthTone(tempStatusEl, assessment.tempBand);
        setHealthMeter(tempMeterEl, latestVitals?.temperature, 35, 42.5, assessment.tempBand);
        const heartTone = heartFound === false || finger === false ? 'watch' : assessment.heartBand;
        setHealthText(heartStatusEl, latestVitals
          ? (heartFound === false || finger === false ? 'Check sensor contact' : labelFromBand(assessment.heartBand))
          : 'No reading yet');
        setHealthTone(heartStatusEl, heartTone);
        setHealthMeter(heartMeterEl, latestVitals?.heartRate, 40, 220, heartTone);
        const spo2Tone = spo2Valid === false ? 'watch' : assessment.spo2Band;
        setHealthText(spo2StatusEl, hasTelemetryNumber(latestVitals?.spo2Pct)
          ? labelFromBand(assessment.spo2Band, spo2Valid === false ? 'Check sensor contact' : 'Reading captured')
          : 'No reading yet');
        setHealthTone(spo2StatusEl, spo2Tone);
        setHealthMeter(spo2MeterEl, latestVitals?.spo2Pct, 80, 100, spo2Tone);
        setHealthText(activityStateEl, activityDisplayLabel(activity));
        const activityStatusTone = activityTone(activity);
        setHealthText(activityScoreEl, activityCareHint(activity, activityScore));
        setHealthTone(activityScoreEl, activityStatusTone);
        setHealthMeter(activityMeterEl, activityMeterValue(activity, activityScore, activityStatusTone), 0, 100, activityStatusTone);
        setHealthText(batteryStateEl, hasTelemetryNumber(batteryPct) ? `${Math.round(Number(batteryPct))}%` : '--');
        setHealthTone(batteryStateEl, hasTelemetryNumber(batteryPct) ? (Number(batteryPct) < 20 ? 'alert' : Number(batteryPct) < 35 ? 'watch' : 'stable') : 'unknown');
        setHealthText(batteryMetaEl, hasTelemetryNumber(batteryMv) ? `${Math.round(Number(batteryMv))} mV tracker battery` : 'Tracker battery');
        setHealthText(networkStateEl, trackerConnectionLabel(wifiConnected));
        setHealthTone(networkStateEl, optionalBoolean(wifiConnected) === true ? 'stable' : optionalBoolean(wifiConnected) === false ? 'watch' : 'unknown');
        setHealthText(wifiStateEl, trackerConnectionLabel(wifiConnected));
        setHealthText(wifiRssiEl, hasTelemetryNumber(wifiRssi) ? `${Math.round(Number(wifiRssi))} dBm` : '--');
        setHealthText(uploadStateEl, syncLabel(uploadOk));
        setHealthText(uploadEnabledEl, readableBool(uploadEnabled, 'Auto sync on', 'Auto sync off', 'Auto sync --'));
        setHealthText(uploadCodeEl, telemetryIntegerLabel(uploadCode));
        setHealthText(vitalsStateEl, assessment.displayState || assessment.state);
        setHealthText(locationStateEl, locationLabel(locationValid));
        setHealthTone(locationStateEl, locationValid === true ? 'stable' : locationValid === false ? 'watch' : 'unknown');
        setHealthText(gpsStateEl, gpsFixLabel(gpsFix));
        setHealthText(gpsSatsEl, hasTelemetryNumber(gpsSatsUsed) || hasTelemetryNumber(gpsVisible)
          ? `${telemetryIntegerLabel(gpsSatsUsed)} of ${telemetryIntegerLabel(gpsVisible)} satellites`
          : gpsSatsLabel);
        setHealthText(gpsHdopEl, telemetryNumberLabel(gpsHdop, { digits: 1 }));
        setHealthText(locationCoordsEl, coordsLabel);
        setHealthText(lastLocationValidEl, readableBool(lastLocationValid, 'recent', 'stale', '--'));
        setHealthText(trackSamplesEl, telemetryIntegerLabel(trackSamples));
        setHealthText(geofenceEnabledEl, readableBool(geofenceEnabled, 'Safe zone on', 'Safe zone off', 'Safe zone --'));
        setHealthText(distanceStateEl, safeZoneLabel(distanceM, lostAlert));
        setHealthText(lostAlertEl, readableBool(lostAlert, 'Alert active', 'Alert clear', 'Alert --'));
        setHealthText(heartFoundEl, sensorFitLabel(heartFound, finger));
        setHealthTone(heartFoundEl, heartFound === true && finger === true ? 'stable' : heartFound === false || finger === false ? 'watch' : 'unknown');
        setHealthText(fingerStateEl, readableBool(finger, 'Contact good', 'Contact loose', 'Sensor waiting'));
        setHealthText(spo2ValidDetailEl, readableBool(spo2Valid, 'Oxygen signal good', 'Oxygen signal weak', 'Oxygen waiting'));
        if (vitalsSummaryEl) {
          vitalsSummaryEl.textContent = assessment.summary;
          setHealthTone(vitalsSummaryEl, assessmentTone(assessment));
        }
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
          const entryAssessment = getVitalsAssessment(entry);
          const entryTone = entryAssessment.state === 'Stable'
            ? 'stable'
            : entryAssessment.state === 'Watch closely' || entryAssessment.state === 'Check contact'
              ? 'watch'
              : entryAssessment.state === 'Needs attention'
                ? 'alert'
                : 'unknown';
          row.innerHTML = `
            <div class="health-history-row__meta">
              <p class="font-semibold text-dark">${formatReadingTimestamp(entry.timestamp)}</p>
              <p class="text-[10px] text-gray-500">${petName} · ${escapeHtml(entryAssessment.displayState || entryAssessment.state)}</p>
            </div>
            <div class="health-history-row__stats">
              <span class="health-status-pill">Temp ${Number.isFinite(entry.temperature) ? `${entry.temperature.toFixed(1)}°C` : '--'}</span>
              <span class="health-status-pill">HR ${Number.isFinite(entry.heartRate) ? `${Math.round(entry.heartRate)} bpm` : '--'}</span>
              <span class="health-status-pill">SpO2 ${Number.isFinite(entry.spo2Pct) ? `${Math.round(entry.spo2Pct)}%` : '--'}</span>
              <span class="health-status-pill">${escapeHtml(activityDisplayLabel(entry.activity || 'REST'))}</span>
              <span class="health-status-pill" data-status="${entryTone}">${escapeHtml(entryAssessment.displayState || entryAssessment.state)}</span>
            </div>
          `;
          historyListEl.appendChild(row);
        });
      }

      function saveReading() {
        const pets = getStoredPets();
        const petId = petSelect.value;
        const selectedPet = pets.find((pet) => pet.id === petId);
        if (!selectedPet) {
          setFormStatus('Select a pet first.', true);
          return;
        }
        const nextTemperature = tempInput && tempInput.value.trim() !== '' ? Number(tempInput.value) : NaN;
        const nextHeartRate = heartInput && heartInput.value.trim() !== '' ? Number(heartInput.value) : NaN;
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
            ].slice(0, DEVICE_TELEMETRY_HISTORY_LIMIT),
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
        saveBtn?.addEventListener('click', () => saveReading());
        historyToggleBtn?.addEventListener('click', () => {
          const isExpanded = historyToggleBtn.getAttribute('aria-expanded') === 'true';
          setHistoryCollapsed(isExpanded);
        });
        document.addEventListener(PETS_CHANGED_EVENT, () => render());
      }
      setHistoryCollapsed(historyToggleBtn?.getAttribute('aria-expanded') !== 'true');
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
      const nfcPetResult = document.getElementById('nfc-pet-result');
      const petSkeleton = document.getElementById('pet-skeleton');
      const communitySkeleton = document.getElementById('community-skeleton');
      const communityError = document.getElementById('community-error');
      let openPetId = null;
      const petFormHeading = document.getElementById('pet-form-heading');
      const petFormSubtitle = document.getElementById('pet-form-subtitle');
      const petFormSubmitLabel = document.getElementById('pet-form-submit-label');
      const petFormError = document.getElementById('pet-form-error');
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

      function getTodayDateValue() {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        return today.toISOString().slice(0, 10);
      }

      function normalizePetSingleLine(value = '', maxLength = 80) {
        return String(value || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, maxLength);
      }

      function normalizePetNote(value = '', maxLength = 220) {
        return String(value || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, maxLength);
      }

      function normalizePetTraitsInput(value = '') {
        const seen = new Set();
        return String(value || '')
          .split(/[,，;；]/)
          .map((trait) => normalizePetSingleLine(trait, 24))
          .filter(Boolean)
          .filter((trait) => {
            const key = trait.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .slice(0, 6);
      }

      function getDefaultPetTraits(type = '') {
        if (/cat/i.test(type)) return ['Curious'];
        if (/dog/i.test(type)) return ['Friendly'];
        return ['Care profile'];
      }

      function isFuturePetDate(value = '') {
        if (!value) return false;
        const selected = new Date(`${value}T00:00:00`);
        if (Number.isNaN(selected.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected > today;
      }

      function setPetFormError(message = '', field = null) {
        Object.values(newPetInputs).forEach((input) => input?.setCustomValidity?.(''));
        if (petFormError) {
          petFormError.textContent = message;
          petFormError.classList.toggle('hidden', !message);
        }
        if (message && field) {
          field.setCustomValidity?.(message);
          field.focus?.({ preventScroll: false });
          field.reportValidity?.();
        }
      }

      function readPetFormValues() {
        return {
          name: normalizePetSingleLine(newPetInputs.name?.value, 40),
          type: normalizePetSingleLine(newPetInputs.type?.value, 32),
          breed: normalizePetSingleLine(newPetInputs.breed?.value, 50),
          birthday: normalizePetSingleLine(newPetInputs.birthday?.value, 10),
          gender: normalizePetSingleLine(newPetInputs.gender?.value, 20),
          status: normalizePetSingleLine(newPetInputs.status?.value, 80),
          health: normalizePetSingleLine(newPetInputs.health?.value, 120),
          location: normalizePetSingleLine(newPetInputs.location?.value, 80),
          nfcContact: normalizePetSingleLine(newPetInputs.nfcContact?.value, 80),
          nfcNote: normalizePetNote(newPetInputs.nfcNote?.value, 220),
          traits: normalizePetTraitsInput(newPetInputs.traits?.value),
        };
      }

      function validatePetFormValues(values, file) {
        if (!values.name) {
          return { message: 'Add the pet name first.', field: newPetInputs.name };
        }
        if (!/[A-Za-z0-9\u4e00-\u9fff]/.test(values.name)) {
          return { message: 'Pet name should include letters or numbers.', field: newPetInputs.name };
        }
        if (!values.type) {
          return { message: 'Choose or type a species, such as Dog, Cat, or Rabbit.', field: newPetInputs.type };
        }
        if (!/[A-Za-z\u4e00-\u9fff]/.test(values.type)) {
          return { message: 'Species should describe the kind of pet, not only symbols or numbers.', field: newPetInputs.type };
        }
        if (values.birthday) {
          const birthdayDate = new Date(`${values.birthday}T00:00:00`);
          if (Number.isNaN(birthdayDate.getTime())) {
            return { message: 'Use a valid birthday or adoption date.', field: newPetInputs.birthday };
          }
          if (isFuturePetDate(values.birthday)) {
            return { message: 'Birthday or adoption date cannot be in the future.', field: newPetInputs.birthday };
          }
        }
        if (!values.nfcContact) {
          return { message: 'Add an emergency contact so the pet card is useful if the pet is found.', field: newPetInputs.nfcContact };
        }
        if (values.nfcContact.length < 3) {
          return { message: 'Emergency contact is too short. Use a phone, email, or WeChat ID.', field: newPetInputs.nfcContact };
        }
        if (file && !file.type.startsWith('image/')) {
          return { message: 'Pet photo must be an image file.', field: newPetInputs.image };
        }
        if (file && file.size > 5 * 1024 * 1024) {
          return { message: 'Please choose an image under 5MB.', field: newPetInputs.image };
        }
        return null;
      }

      if (newPetInputs.birthday) {
        newPetInputs.birthday.max = getTodayDateValue();
      }
      Object.values(newPetInputs).forEach((input) => {
        input?.addEventListener?.('input', () => setPetFormError(''));
        input?.addEventListener?.('change', () => setPetFormError(''));
      });

      function buildPetNfcPayload(pet = {}) {
        return buildPublicNfcPetPayload(pet, getCurrentUser() || getDefaultUser());
      }

      function buildPetNfcLink(pet = {}) {
        return buildStablePublicNfcLink(pet);
      }

      function buildPetEmbeddedNfcLink(pet = {}) {
        return buildEmbeddedPublicNfcLink(pet);
      }

      async function publishPublicNfcPetCard(pet = {}) {
        const stableLink = buildPetNfcLink(pet);
        const embeddedLink = buildPetEmbeddedNfcLink(pet);
        const cardId = getPublicNfcCardId(pet);
        if (!cardId) {
          return { ok: false, link: embeddedLink, reason: 'Missing card ID.' };
        }
        if (!getAuthToken()) {
          return {
            ok: false,
            link: embeddedLink,
            reason: 'Sign in before publishing a fixed public URL.',
          };
        }
        try {
          const response = await authJsonFetch(`/api/nfc-pet-cards/${encodeURIComponent(cardId)}`, {
            method: 'PUT',
            body: JSON.stringify({ pet: buildPetNfcPayload(pet) }),
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Public card publish failed.');
          }
          return { ok: true, link: stableLink, reason: '' };
        } catch (err) {
          console.warn('Public NFC card publish failed', err);
          return {
            ok: false,
            link: embeddedLink,
            reason: 'Public card service is unavailable, using an embedded public link.',
          };
        }
      }

      async function copyTextToClipboard(text = '') {
        const value = String(text || '');
        if (!value) return false;
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch {
          window.prompt('Copy this URL', value);
          return false;
        }
      }

      function setPetNfcButtonBusy(button, busy) {
        if (!button) return;
        button.disabled = Boolean(busy);
        button.classList.toggle('opacity-60', Boolean(busy));
        button.classList.toggle('cursor-not-allowed', Boolean(busy));
      }

      function canUseWebNfcWriter() {
        return Boolean('NDEFReader' in window && window.isSecureContext);
      }

      async function writePetNfcLinkToTag(pet = {}, trigger = null) {
        const result = await publishPublicNfcPetCard(pet);
        const link = result.link;
        if (!canUseWebNfcWriter()) {
          await copyTextToClipboard(link);
          alert('This mobile browser cannot write NFC tags directly. The public URL was copied; use your phone NFC writer app to write it.');
          return;
        }
        try {
          const reader = new NDEFReader();
          await reader.write({
            records: [{ recordType: 'url', data: link }],
          });
          alert(result.ok ? 'NFC card written with the public pet URL.' : `NFC card written with fallback public URL. ${result.reason}`);
        } catch (err) {
          console.warn('NFC write failed', err);
          await copyTextToClipboard(link);
          alert('NFC write did not complete. The public URL was copied so you can write it manually.');
        } finally {
          setPetNfcButtonBusy(trigger, false);
        }
      }

      function renderNfcPetResult() {
        if (!nfcPetResult) return;
        if (!activeNfcPetCard) {
          nfcPetResult.classList.add('hidden');
          nfcPetResult.innerHTML = '';
          return;
        }
        const pet = normalizeNfcPetPayload(activeNfcPetCard);
        activeNfcPetCard = pet;
        const href = contactHref(pet.nfcContact);
        const directLink = window.location.href;
        nfcPetResult.classList.remove('hidden');
        nfcPetResult.innerHTML = `
          <div class="nfc-pet-card pixel-card">
            <div class="nfc-pet-card__media">
              <img src="${escapeHtml(safeImageSrc(pet.avatar, DEFAULT_PET_AVATAR))}" alt="${escapeHtml(pet.name)}" loading="eager" decoding="async" />
            </div>
            <div class="nfc-pet-card__body">
              <div class="nfc-pet-card__head">
                <div>
                  <p class="nfc-pet-card__eyebrow"><i class="fas fa-id-card"></i> NFC Emergency Pet Card</p>
                  <h3>${escapeHtml(pet.name)}</h3>
                  <p>${escapeHtml(pet.type)} · ${escapeHtml(pet.breed)} · ${escapeHtml(pet.location)}</p>
                </div>
                <span class="pet-nfc-card__code">${escapeHtml(pet.nfcId)}</span>
              </div>
              <div class="nfc-pet-card__grid">
                <div>
                  <span>Owner</span>
                  <strong>${escapeHtml(pet.ownerName || 'Pet owner')}</strong>
                  <p>${escapeHtml(pet.ownerCampus || 'Taicang')}</p>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>${escapeHtml(pet.nfcContact || 'Not provided')}</strong>
                  <p>Use this contact to return the pet.</p>
                </div>
                <div>
                  <span>Care Note</span>
                  <strong>${escapeHtml(pet.nfcNote || 'Please contact the owner if found.')}</strong>
                  <p>${escapeHtml(pet.health || 'No health notes provided.')}</p>
                </div>
              </div>
              <div class="nfc-pet-card__actions">
                ${href ? `<a class="pixel-button text-xs" href="${escapeHtml(href)}"><i class="fas fa-phone"></i><span>Contact owner</span></a>` : ''}
                <button type="button" class="pixel-button text-xs bg-white/80 text-dark border border-primary/30" data-copy-nfc-contact>
                  <i class="fas fa-copy"></i><span>Copy contact</span>
                </button>
                <button type="button" class="pixel-button text-xs bg-white/80 text-dark border border-primary/30" data-copy-current-nfc-link>
                  <i class="fas fa-link"></i><span>Copy link</span>
                </button>
              </div>
            </div>
          </div>
        `;
        nfcPetResult.querySelector('[data-copy-nfc-contact]')?.addEventListener('click', async () => {
          const text = pet.nfcContact || '';
          if (!text) return;
          try {
            await navigator.clipboard.writeText(text);
            alert('Owner contact copied.');
          } catch {
            alert(text);
          }
        });
        nfcPetResult.querySelector('[data-copy-current-nfc-link]')?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(directLink);
            alert('NFC link copied.');
          } catch {
            alert(directLink);
          }
        });
      }

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
        setPetFormError('');
        petForm?.reset();
        resetPetImagePreview();
      }

      function hydratePets() {
        const stored = getStoredPets();
        pets = isSeededDefaultPetList(stored) ? [] : stored;
        if (stored.length && pets.length === 0) setStoredPets([]);
      }

      function resetPetImagePreview() {
        if (petImagePreviewImg) {
          setPreviewImageSource(petImagePreviewImg, '');
          petImagePreviewImg.classList.add('hidden');
        }
        petImagePlaceholder?.classList.remove('hidden');
        if (newPetInputs.image) {
          newPetInputs.image.value = '';
        }
      }

      function setPetImagePreview(src) {
        if (!petImagePreviewImg) return;
        setPreviewImageSource(petImagePreviewImg, src);
        petImagePreviewImg.classList.remove('hidden');
        petImagePlaceholder?.classList.add('hidden');
      }

      function loadPetIntoForm(pet) {
        if (!petForm) return;
        setPetFormError('');
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
        renderNfcPetResult();
        petList.innerHTML = '';
        petSkeleton?.classList.add('hidden');
        if (petSkeleton) petSkeleton.style.display = 'none';
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
          const publicNfcLink = buildPetNfcLink(p);
          const publicNfcLinkEsc = escapeHtml(publicNfcLink);
          const nfcWriterLabel = canUseWebNfcWriter() ? 'Write NFC Card' : 'Copy for NFC App';
          const telemetryBadge = p.deviceId
            ? `<p class="text-[10px] text-gray-500 mt-1">Device ${escapeHtml(p.deviceId)}${Number.isFinite(Number(p.batteryPct)) ? ` · ${Math.round(Number(p.batteryPct))}% battery` : ''}</p>`
            : '';
          const traitMarkup = (p.traits || [])
            .map(t => `<span class="px-2 py-0.5 rounded-full bg-secondary text-dark">${escapeHtml(t)}</span>`)
            .join('');
          const mobileLayout = window.innerWidth <= 768;
          const isOpen = openPetId ? openPetId === p.id : (!mobileLayout && idx === 0);
          if (!openPetId && !mobileLayout && idx === 0) openPetId = p.id;
          const card = document.createElement('div');
          card.className = `pixel-card pet-owned-card flex flex-col gap-2 ${isOpen ? 'is-open' : ''}`;
          card.dataset.petCardId = p.id || '';
          card.dataset.petNfcId = p.nfcId || '';
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
                  <p><span class="font-semibold">Birth/adoption:</span> ${petBirthday}</p>
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
                  ${telemetryBadge}
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
                    <p class="text-[10px] uppercase tracking-[0.28em] text-gray-500">Emergency Pet Card</p>
                    <p class="font-semibold text-sm text-dark">${petName}</p>
                  </div>
                  <span class="pet-nfc-card__code">${petNfcId}</span>
                </div>
                <div class="space-y-1 text-[11px] text-gray-700">
                  <p><span class="font-semibold">Emergency:</span> ${petNfcContact}</p>
                  <p><span class="font-semibold">Care note:</span> ${petNfcNote}</p>
                </div>
                <div class="pet-nfc-url-box">
                  <div class="flex items-center justify-between gap-2">
                    <span>Public NFC URL</span>
                    <button type="button" data-copy-nfc-link="${petId}">Copy</button>
                  </div>
                  <code title="${publicNfcLinkEsc}">${publicNfcLinkEsc}</code>
                </div>
                <div class="flex flex-wrap gap-2 pt-1">
                  <button type="button" class="pet-action-link" data-copy-nfc="${petId}">
                    <i class="fas fa-id-card"></i><span>Copy Emergency Card</span>
                  </button>
                  <button type="button" class="pet-action-link" data-copy-nfc-link="${petId}">
                    <i class="fas fa-link"></i><span>Copy NFC URL</span>
                  </button>
                  <button type="button" class="pet-action-link" data-write-nfc="${petId}">
                    <i class="fas fa-wifi"></i><span>${nfcWriterLabel}</span>
                  </button>
                  <button type="button" class="pet-action-link" data-open-nfc-link="${petId}">
                    <i class="fas fa-arrow-up-right-from-square"></i><span>Open Public Card</span>
                  </button>
                  <button type="button" class="pet-action-link" data-open-map="${petId}">
                    <i class="fas fa-location-arrow"></i><span>Locate on Map</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        petList.appendChild(card);
        card.querySelectorAll('img').forEach((img) => {
          setPreviewImageSource(img, img.getAttribute('src') || '', DEFAULT_PET_AVATAR);
        });
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
            setPetNfcButtonBusy(btn, true);
            const publishResult = await publishPublicNfcPetCard(pet);
            const nfcLink = publishResult.link;
            const cardText = [
              `PAWTRACE Emergency Card · ${pet.name}`,
              `Card ID: ${pet.nfcId}`,
              `Type: ${pet.type} · ${pet.breed}`,
              `Location: ${pet.location || 'Campus'}`,
              `Emergency: ${pet.nfcContact || 'Not set'}`,
              `Care note: ${pet.nfcNote || 'None'}`,
              `NFC link: ${nfcLink}`,
            ].join('\n');
            try {
              await copyTextToClipboard(cardText);
              alert(publishResult.ok
                ? `Copied ${pet.name}'s emergency card with the public NFC URL.`
                : `Copied ${pet.name}'s emergency card. ${publishResult.reason}`);
            } catch (err) {
              console.warn('Clipboard copy failed', err);
              alert(cardText);
            } finally {
              setPetNfcButtonBusy(btn, false);
            }
          });
        });
        petList.querySelectorAll('[data-copy-nfc-link]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-copy-nfc-link');
            const pet = pets.find((entry) => entry.id === id);
            if (!pet) return;
            setPetNfcButtonBusy(btn, true);
            const publishResult = await publishPublicNfcPetCard(pet);
            await copyTextToClipboard(publishResult.link);
            alert(publishResult.ok
              ? `Copied ${pet.name}'s fixed public NFC URL. Write this URL to the NFC card.`
              : `Copied a public fallback NFC URL. ${publishResult.reason}`);
            setPetNfcButtonBusy(btn, false);
          });
        });
        petList.querySelectorAll('[data-write-nfc]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-write-nfc');
            const pet = pets.find((entry) => entry.id === id);
            if (!pet) return;
            setPetNfcButtonBusy(btn, true);
            await writePetNfcLinkToTag(pet, btn);
          });
        });
        petList.querySelectorAll('[data-open-nfc-link]').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-open-nfc-link');
            const pet = pets.find((entry) => entry.id === id);
            if (!pet) return;
            setPetNfcButtonBusy(btn, true);
            const publishResult = await publishPublicNfcPetCard(pet);
            window.open(publishResult.link, '_blank', 'noopener,noreferrer');
            setPetNfcButtonBusy(btn, false);
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
        communitySkeleton?.classList.add('hidden');
        if (communitySkeleton) communitySkeleton.style.display = 'none';
        communityError?.classList.add('hidden');
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
          card.className = 'pixel-card community-card flex flex-col gap-2';
          card.innerHTML = `
            <div class="community-cover pixel-border">
              <img src="${petPhoto}" alt="${petName}" loading="lazy" decoding="async" />
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
          card.querySelectorAll('img').forEach((img) => {
            setPreviewImageSource(img, img.getAttribute('src') || '', DEFAULT_PET_AVATAR);
          });
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
      };

      window.openNfcPetDeepLink = () => {
        if (!activeNfcPetCard && !activeNfcTargetId) return;
        const target = String(activeNfcTargetId || activeNfcPetCard?.id || activeNfcPetCard?.nfcId || '').trim();
        const matchedPet = target
          ? pets.find((pet) => pet.id === target || pet.nfcId === target)
          : null;
        if (matchedPet) {
          openPetId = matchedPet.id;
          activeNfcPetCard = null;
          render();
        } else {
          renderNfcPetResult();
        }
        activateAppTab?.('pets');
        if (window.location.hash.split('?')[0] !== '#pets') {
          history.replaceState(null, '', `${window.location.pathname}${window.location.search}#pets`);
        }
        window.requestAnimationFrame(() => {
          const petCardEl = Array.from(petList.querySelectorAll('[data-pet-card-id]'))
            .find((card) => card.getAttribute('data-pet-card-id') === openPetId);
          const targetEl = activeNfcPetCard
            ? nfcPetResult
            : petCardEl;
          targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      };

      newPetInputs.image?.addEventListener('change', () => {
        const file = newPetInputs.image.files && newPetInputs.image.files[0];
        if (!file) {
          resetPetImagePreview();
          return;
        }
        if (!file.type.startsWith('image/')) {
          setPetFormError('Pet photo must be an image file.', newPetInputs.image);
          newPetInputs.image.value = '';
          resetPetImagePreview();
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setPetFormError('Please choose an image under 5MB.', newPetInputs.image);
          newPetInputs.image.value = '';
          resetPetImagePreview();
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
          setPetFormError('');
          const formValues = readPetFormValues();
          const file = newPetInputs.image?.files && newPetInputs.image.files[0];
          const validationError = validatePetFormValues(formValues, file);
          if (validationError) {
            setPetFormError(validationError.message, validationError.field);
            return;
          }
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
          const birthdayValue = formValues.birthday;
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
            name: formValues.name,
            type: formValues.type,
            breed: formValues.breed || 'Mixed / Unknown',
            age: birthdayLabel,
            birthday: birthdayValue,
            gender: formValues.gender || 'Unknown',
            avatar,
            traits: formValues.traits.length ? formValues.traits : getDefaultPetTraits(formValues.type),
            status: formValues.status || `${formValues.name} is ready for care tracking.`,
            health: formValues.health || 'No known health notes.',
            location: formValues.location || existingPet?.location || getDefaultTrackedZone(pets.length).label,
            nfcContact: formValues.nfcContact,
            nfcNote: formValues.nfcNote || existingPet?.nfcNote || `${formValues.name} is friendly. Please contact the owner if found.`,
            mapCoords: existingPet?.mapCoords || getDefaultTrackedZone(pets.length).coords,
            vitalsHistory: existingPet?.vitalsHistory || createStarterVitals(existingPet || { name: formValues.name, type: formValues.type }, pets.length),
          };

          if (isEdit && existingPet) {
            pets = pets.map(p => p.id === existingPet.id ? updatedPet : p);
          } else {
            pets.push(updatedPet);
          }
          setStoredPets(pets);
          if (getAuthToken()) {
            void publishPublicNfcPetCard(updatedPet);
          }
          render();
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

    // --- Chat assistant integration ---
    let CHAT_STATE = {
      contacts: [
        {
          id: 'c1',
          name: 'Lily (Team Lead)',
          avatar: '/assets/people/person1.png',
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
          avatar: '/assets/people/person2.png',
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
          avatar: '/assets/people/person3.png',
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
          avatar: '/assets/people/person4.png',
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
          avatar: '/assets/people/person5.png',
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
          avatar: '/assets/people/person6.png',
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
          avatar: '/assets/people/person7.png',
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
      historyLoaded: {},
      activeId: null,
    };

    const LOCAL_CHAT_REPLIES = [
      'Okay, I understand. That sounds worth tracking with your pet’s mood and energy today. Did anything change around food, walks, or playtime?',
      'That’s great to hear. My pet usually reacts better when the routine stays predictable. Do you want to plan a short walk together this week?',
      'Let’s meet this weekend if the weather is comfortable. I can bring a few treats and we can keep the first meetup relaxed. What time works for you?',
      'My pet loves this kind of activity too. I would start gently and watch whether they get tired, excited, or nervous. How did your pet behave afterward?',
      'Thanks for letting me know. I’ll keep that in mind and compare it with appetite, sleep, and activity later. Has this happened before?',
      'Sounds good. We can keep the plan simple and pet-friendly so they do not feel rushed. Should we meet near the campus green or the cafe area?',
    ];
    const CHAT_STICKERS = Array.from({ length: 36 }, (_, index) => {
      const stickerNumber = String(index + 1).padStart(2, '0');
      const id = `paw-sticker-${stickerNumber}`;
      return {
        id,
        label: `Pet sticker ${stickerNumber}`,
        src: `/assets/stickers/${id}.png`,
      };
    });
    const CHAT_STICKER_SIZE_KEY = 'pawtraceChatStickerSize';
    const CHAT_STICKER_SIZE_MIN = 58;
    const CHAT_STICKER_SIZE_MAX = 108;
    const CHAT_STICKER_SIZE_DEFAULT = 78;
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
      const { type, contact, contactId, messages = [] } = payload;
      let fallback = payload.fallback;
      const summaryPrompt = type === 'owner-pet-summary' && contact
        ? {
            role: 'user',
            content: `Give a concise owner-side pet profile summary for the chat sidebar. Keep it under 34 words.\n${buildContactProfile(contact)}`
          }
        : null;
      if (type === 'owner-pet-summary' && contact) {
        const generator = LOCAL_PET_SUMMARIES[Math.floor(Math.random() * LOCAL_PET_SUMMARIES.length)];
        fallback = (generator ? generator(contact) : fallback) || 'No recent pet update yet.';
      }
      if (!contactId) return fallback || 'Message received.';
      const sourceMessages = summaryPrompt ? [summaryPrompt] : messages;
      const sanitizedHistory = sourceMessages
        .slice(-12)
        .map(m => {
          let content = (m.content || '').trim();
          if (m.media?.type === 'image') {
            const note = m.media.src?.startsWith('data:image/')
              ? 'Shared image attachment from device upload.'
              : `Shared image link: ${m.media.src || ''}`;
            content = content ? `${content}\n${note}` : note;
          } else if (m.media?.type === 'sticker') {
            const note = `Sent sticker: ${m.media.label || m.content || 'pet sticker'}.`;
            content = content ? `${content}\n${note}` : note;
          }
          return {
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content
          };
        })
        .filter(m => m.content);
      try {
        const response = await authJsonFetch('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            contactId,
            contactProfile: buildContactProfile(contact),
            messages: sanitizedHistory
          })
        });
        if (!response.ok) throw new Error('AI request failed');
        const data = await response.json();
        if (!data.reply) throw new Error('Empty reply');
        lastChatAssistantSource = data.source || 'unknown';
        lastChatAssistantWarning = data.warning || '';
        return data.reply.trim();
      } catch (error) {
        console.warn('Assistant bridge failed', error);
        lastChatAssistantSource = 'frontend-local';
        lastChatAssistantWarning = String(error);
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
      const shareCameraFileInput = document.getElementById('share-camera-file');
      const shareOpenCameraBtn = document.getElementById('share-open-camera');
      const shareOpenLibraryBtn = document.getElementById('share-open-library');
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
      const chatStickerTrigger = document.getElementById('chat-open-stickers');
      const chatStickerPanel = document.getElementById('chat-sticker-panel');
      const chatStickerGrid = document.getElementById('chat-sticker-grid');
      const chatStickerCount = document.getElementById('chat-sticker-count');
      const chatStickerSizeInput = document.getElementById('chat-sticker-size');
      const chatStickerSizeValue = document.getElementById('chat-sticker-size-value');
      const chatStickerClose = document.getElementById('chat-close-stickers');
      if (!chatHoverCard) {
        chatHoverCard = document.createElement('div');
        chatHoverCard.className = 'contact-hover-card';
        chatHoverCard.innerHTML = `
          <button type="button" class="contact-hover-close" data-hover-close aria-label="Close profile">
            <span aria-hidden="true">x</span>
          </button>
          <div class="flex items-center gap-2 mb-2 pr-7">
            <img id="hover-avatar" src="${DEFAULT_USER_AVATAR}" data-fallback-src="${DEFAULT_USER_AVATAR}" class="w-9 h-9 rounded-full object-cover pixel-border bg-secondary" alt="Avatar preview" />
            <div class="min-w-0">
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
      const hideHoverCard = () => hoverCard.classList.remove('show');
      const canShowContactHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 768;
      hoverCard.querySelector('[data-hover-close]')?.addEventListener('click', hideHoverCard);
      document.addEventListener('pointerdown', (event) => {
        if (!hoverCard.classList.contains('show')) return;
        const target = event.target;
        if (target instanceof Element && (hoverCard.contains(target) || target.closest('.chat-contact-item'))) return;
        hideHoverCard();
      });

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
      const greetingForContact = (contact) => ({
        role: 'assistant',
        content: `Hi! I'm ${contact.name} and this is ${contact.petName}.`
      });

      function normalizeSavedChatHistory(rows = [], contact) {
        const normalized = (Array.isArray(rows) ? rows : [])
          .map((message) => ({
            role: message?.role === 'assistant' ? 'assistant' : 'user',
            content: String(message?.content || '').trim()
          }))
          .filter((message) => message.content);
        return normalized.length ? normalized : [greetingForContact(contact)];
      }

      async function loadSavedChatHistory(contactId, contact) {
        if (!getAuthToken() || isGuestSession() || CHAT_STATE.historyLoaded[contactId]) return false;
        try {
          const response = await authJsonFetch(`/api/chat/history/${encodeURIComponent(contactId)}`);
          if (!response.ok) throw new Error('Chat history unavailable');
          const data = await response.json().catch(() => ({}));
          if (Array.isArray(data.history) && data.history.length) {
            CHAT_STATE.history[contactId] = normalizeSavedChatHistory(data.history, contact);
            const latest = CHAT_STATE.history[contactId].at(-1);
            if (latest?.content) contact.lastPreview = latest.content.slice(0, 96);
          } else if (!CHAT_STATE.history[contactId]) {
            CHAT_STATE.history[contactId] = [greetingForContact(contact)];
          }
          CHAT_STATE.historyLoaded[contactId] = true;
          return true;
        } catch (err) {
          console.warn('Chat history load failed', err);
          CHAT_STATE.historyLoaded[contactId] = true;
          return false;
        }
      }

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
        const avatar = escapeHtml(safeImageSrc(c.avatar, DEFAULT_USER_AVATAR));
          const name = escapeHtml(c.name || 'Friend');
          const preview = escapeHtml(c.lastPreview || '');
          item.innerHTML = `
              <img src="${avatar}" data-fallback-src="${DEFAULT_USER_AVATAR}" loading="lazy" decoding="async" class="w-8 h-8 rounded-full object-cover pixel-border bg-secondary" alt="${name}" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-xs truncate">${name}</p>
                <p class="text-[11px] text-gray-600 truncate">${preview}</p>
              </div>
            `;
            const showHover = (event) => {
              if (!canShowContactHover()) return;
              const rect = item.getBoundingClientRect();
              const data = c;
              const avatarEl = hoverCard.querySelector('#hover-avatar');
              const nameEl = hoverCard.querySelector('#hover-name');
              const petTagEl = hoverCard.querySelector('#hover-pet-tag');
              const summaryEl = hoverCard.querySelector('#hover-summary');
              const healthEl = hoverCard.querySelector('#hover-health');
              const tagsEl = hoverCard.querySelector('#hover-tags');
              setPreviewImageSource(avatarEl, data.avatar, DEFAULT_USER_AVATAR);
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
            const hideHover = () => {
              if (!canShowContactHover()) return;
              hoverCard.classList.remove('show');
            };
            item.addEventListener('mouseenter', showHover);
            item.addEventListener('mouseleave', hideHover);
            item.addEventListener('focus', showHover);
            item.addEventListener('blur', hideHover);
            item.addEventListener('click', () => {
              hideHoverCard();
              activateContact(c.id);
            });
            listEl.appendChild(item);
            setPreviewImageSource(item.querySelector('img'), c.avatar, DEFAULT_USER_AVATAR);
          });
      }

      function renderHistory(contactId) {
        if (!chatMessages) return;
        chatMessages.innerHTML = '';
        const history = CHAT_STATE.history[contactId] || [];
        history.forEach(msg => appendMessageBubble(msg, contactId, false));
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      function setStickerPanelOpen(isOpen) {
        if (!chatStickerPanel) return;
        chatStickerPanel.classList.toggle('hidden', !isOpen);
        chatStickerPanel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        chatStickerTrigger?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      function getSavedStickerSize() {
        try {
          return clampNumber(
            localStorage.getItem(CHAT_STICKER_SIZE_KEY),
            CHAT_STICKER_SIZE_MIN,
            CHAT_STICKER_SIZE_MAX,
            CHAT_STICKER_SIZE_DEFAULT
          );
        } catch (err) {
          return CHAT_STICKER_SIZE_DEFAULT;
        }
      }

      function applyStickerSize(value) {
        const size = Math.round(clampNumber(
          value,
          CHAT_STICKER_SIZE_MIN,
          CHAT_STICKER_SIZE_MAX,
          CHAT_STICKER_SIZE_DEFAULT
        ));
        chatStickerPanel?.style.setProperty('--chat-sticker-size', `${size}px`);
        if (chatStickerSizeInput) chatStickerSizeInput.value = String(size);
        if (chatStickerSizeValue) chatStickerSizeValue.textContent = String(size);
        return size;
      }

      function renderStickerPanel() {
        if (!chatStickerGrid) return;
        chatStickerGrid.innerHTML = '';
        if (chatStickerCount) chatStickerCount.textContent = String(CHAT_STICKERS.length);
        CHAT_STICKERS.forEach((sticker) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'chat-sticker-item';
          button.setAttribute('aria-label', sticker.label);
          button.innerHTML = `
            <img src="${escapeHtml(safeImageSrc(sticker.src, DEFAULT_STICKER_IMAGE))}" data-fallback-src="${DEFAULT_STICKER_IMAGE}" loading="lazy" decoding="async" alt="${escapeHtml(sticker.label)}" />
          `;
          button.addEventListener('click', () => {
            sendStickerMessage(sticker);
          });
          chatStickerGrid.appendChild(button);
        });
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
          const mediaSrc = escapeHtml(safeImageSrc(media.src, DEFAULT_PET_AVATAR));
          bubble.innerHTML = `
            <img src="${mediaSrc}" data-fallback-src="${DEFAULT_PET_AVATAR}" class="w-full h-auto object-cover rounded-sm border-2 border-dark mb-1" alt="Shared image" />
            ${safeContent ? `<p class="text-[11px]">${safeContent}</p>` : ''}
          `;
        } else if (media?.type === 'sticker') {
          bubble.className += ' bubble-sticker';
          const mediaSrc = escapeHtml(safeImageSrc(media.src, DEFAULT_STICKER_IMAGE));
          const stickerLabel = escapeHtml(media.label || content || 'Sticker');
          bubble.innerHTML = `
            <img src="${mediaSrc}" data-fallback-src="${DEFAULT_STICKER_IMAGE}" class="chat-sticker-image" alt="${stickerLabel}" />
          `;
        } else {
          bubble.innerHTML = `<p class="text-[11px]">${safeContent}</p>`;
        }
        const avatar = document.createElement('img');
        const contact = CHAT_STATE.contacts.find(x => x.id === contactId);
        avatar.loading = 'lazy';
        avatar.decoding = 'async';
        avatar.className = 'w-7 h-7 rounded-full object-cover pixel-border bg-secondary';
        setPreviewImageSource(
          avatar,
          isUser ? normalizeUserAvatar(getCurrentUser()?.avatar || document.getElementById('current-user-avatar')?.src) : safeImageSrc(contact?.avatar, DEFAULT_USER_AVATAR),
          DEFAULT_USER_AVATAR
        );
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
        if (chatStatus) {
          chatStatus.textContent = lastChatAssistantSource === 'qwen'
            ? `Online · ${contact.petType} owner · AI`
            : `Online · ${contact.petType} owner · Local fallback`;
          chatStatus.title = lastChatAssistantWarning || '';
        }
      };

      function activateContact(id) {
        CHAT_STATE.activeId = id;
        const c = CHAT_STATE.contacts.find(x => x.id === id);
        if (!c) return;
        if (window.innerWidth <= 1024 && chatPane && chatPane.classList.contains('open')) {
          chatPane.classList.remove('open');
          setChatToggleLabel(chatToggle, 'Show friends');
        }
        setPreviewImageSource(chatAvatar, c.avatar, DEFAULT_USER_AVATAR);
        if (chatName) chatName.textContent = c.name;
        if (chatPetTag) {
          chatPetTag.textContent = c.petName + ' · ' + c.petType;
          chatPetTag.classList.remove('hidden');
        }
        if (chatStatus) chatStatus.textContent = 'Online · ' + c.petType + ' owner';
        updateOwnerPetPanel(c);
        renderContacts(searchEl?.value || '');
        if (!CHAT_STATE.history[id]) {
          CHAT_STATE.history[id] = [greetingForContact(c)];
        }
        renderHistory(id);
        loadSavedChatHistory(id, c).then((loaded) => {
          if (!loaded || CHAT_STATE.activeId !== id) return;
          renderContacts(searchEl?.value || '');
          renderHistory(id);
        });
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
        contact.lastPreview = caption || 'Shared a photo';
        appendMessageBubble(imageMessage, contact.id);
        renderContacts(searchEl?.value || '');
        closeShareImageModal();
        await handleAssistantReply(contact, contact.id, `${contact.petName} got a new photo!`);
      }

      async function sendStickerMessage(sticker) {
        const contact = getActiveContact();
        if (!contact) {
          if (chatError) chatError.textContent = 'Select a friend first.';
          return;
        }
        const stickerMessage = {
          role: 'user',
          content: sticker.label || 'Sent a sticker',
          media: { type: 'sticker', src: sticker.src, label: sticker.label }
        };
        const history = CHAT_STATE.history[contact.id] || [];
        history.push(stickerMessage);
        CHAT_STATE.history[contact.id] = history;
        contact.lastPreview = `[Sticker] ${sticker.label || 'Pet sticker'}`;
        appendMessageBubble(stickerMessage, contact.id);
        renderContacts(searchEl?.value || '');
        setStickerPanelOpen(false);
        await handleAssistantReply(contact, contact.id, `${contact.petName} likes that sticker.`);
      }

      applyStickerSize(getSavedStickerSize());
      renderStickerPanel();
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
        setChatToggleLabel(chatToggle, 'Show friends');
      });
      chatStickerTrigger?.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextOpen = chatStickerPanel?.classList.contains('hidden') ?? true;
        setStickerPanelOpen(nextOpen);
      });
      chatStickerClose?.addEventListener('click', () => {
        setStickerPanelOpen(false);
      });
      chatStickerSizeInput?.addEventListener('input', () => {
        const size = applyStickerSize(chatStickerSizeInput.value);
        try {
          localStorage.setItem(CHAT_STICKER_SIZE_KEY, String(size));
        } catch (err) {
          // Ignore storage failures; the live control still works for this session.
        }
      });
      document.addEventListener('click', (event) => {
        if (chatStickerPanel?.classList.contains('hidden')) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('#chat-sticker-panel') || target.closest('#chat-open-stickers')) return;
        setStickerPanelOpen(false);
      });
      const chatAttachImage = document.getElementById('chat-attach-image');
      chatAttachImage?.addEventListener('click', () => {
        setStickerPanelOpen(false);
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
              setPreviewImageSource(sharePreviewImg, '');
            }
          } else {
            shareImageSource = url;
            shareImageIsUpload = false;
            if (shareImageFileInput) shareImageFileInput.value = '';
            if (shareCameraFileInput) shareCameraFileInput.value = '';
            setPreviewImageSource(sharePreviewImg, url);
            sharePreviewWrapper?.classList.remove('hidden');
          }
        });
      }

      function clearShareFileInputs(activeInput = null) {
        if (shareImageFileInput && shareImageFileInput !== activeInput) shareImageFileInput.value = '';
        if (shareCameraFileInput && shareCameraFileInput !== activeInput) shareCameraFileInput.value = '';
      }

      async function handleShareImageFileInput(input) {
        const file = input?.files && input.files[0];
        if (!file) {
          shareImageIsUpload = false;
          shareImageSource = shareImageUrlInput?.value.trim() || '';
          clearShareFileInputs(input);
          if (!shareImageSource) {
            setPreviewImageSource(sharePreviewImg, '');
            sharePreviewWrapper?.classList.add('hidden');
          }
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('Please choose an image file.');
          input.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Please choose an image under 5MB.');
          input.value = '';
          return;
        }
        try {
          const data = await fileToDataURL(file);
          shareImageSource = data;
          shareImageIsUpload = true;
          clearShareFileInputs(input);
          if (shareImageUrlInput) shareImageUrlInput.value = '';
          setPreviewImageSource(sharePreviewImg, data);
          sharePreviewWrapper?.classList.remove('hidden');
        } catch (err) {
          console.warn('Image upload failed', err);
          alert('Unable to load that image.');
          input.value = '';
          shareImageSource = '';
          shareImageIsUpload = false;
        }
      }

      function triggerShareInputOnKeyboard(event, input) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        input?.click();
      }

      shareOpenCameraBtn?.addEventListener('keydown', (event) => {
        triggerShareInputOnKeyboard(event, shareCameraFileInput);
      });
      shareOpenLibraryBtn?.addEventListener('keydown', (event) => {
        triggerShareInputOnKeyboard(event, shareImageFileInput);
      });
      shareCameraFileInput?.addEventListener('change', () => handleShareImageFileInput(shareCameraFileInput));
      shareImageFileInput?.addEventListener('change', () => handleShareImageFileInput(shareImageFileInput));

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
          if (isGuestSession()) return { ...guestCheckInStore };
          const data = localStorage.getItem('pawtrace_checkins');
          return data ? JSON.parse(data) : {};
        }

        function saveCheckInData(data) {
          if (isGuestSession()) {
            guestCheckInStore = { ...(data || {}) };
            return;
          }
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
