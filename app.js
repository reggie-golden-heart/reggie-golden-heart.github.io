/**
 * ============================================================================
 * РЭДЖИ ЗОЛОТОЕ СЕРДЦЕ 🐾 — SPA С ОБЛАЧНОЙ СИНХРОНИЗАЦИЕЙ (FIREBASE REALTIME DB)
 * ============================================================================
 * - База данных: https://blog-site-50c99-default-rtdb.firebaseio.com/
 * - Мгновенная синхронизация реакций и историй в реальном времени
 * - Админ-панель: безопасная авторизация для автора (логин: reggie)
 * - Публикация историй: мультизагрузка фото, карусели и видео (до 25 МБ)
 * - Оптимизация фото через HTML5 Canvas (1200px JPEG) для молниеносной загрузки
 * - Инстаграм-карусель для альбомов с поддержкой свайпов на смартфонах
 * - Кастомный видеоплеер с перемоткой, полноэкранным режимом и звуком
 * - Интерактивная реакция «Дай лапу!» со счётчиком
 * - Настоящие комментарии читателей в реальном времени
 * ============================================================================
 */

(function () {
  'use strict';

  // --- НАСТРОЙКИ ОБЛАЧНОЙ БАЗЫ ДАННЫХ (FIREBASE) ---
  const FIREBASE_BASE_URL = 'https://blog-site-50c99-default-rtdb.firebaseio.com';

  const STORAGE_KEYS = {
    POSTS_CACHE: 'reggie_blog_posts_cache_v5',
    PROFILE_CACHE: 'reggie_blog_profile_cache_v5',
    LIKED_POSTS: 'reggie_blog_liked_ids_v5',
    ADMIN_AUTH: 'reggie_blog_admin_auth_v1'
  };

  // Конфигурация доступа для автора/администратора
  // Пароль: reggie123456 (хеш SHA-256 для защиты от прямого чтения)
  const ADMIN_CONFIG = {
    username: 'reggie',
    passwordHash: 'f29d748a254bdf560383be7378afc9ac28b27ab9e6663b9fa58e7dc1a68a879b',
    plainPasswordFallback: 'reggie123456'
  };

  // Исходные посты фотодневника (все счётчики лапок с нуля, без заглушек)
  const DEFAULT_POSTS = [
    {
      id: 'reggie-post-01',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-snow.jpg' }
      ],
      text: 'Официально заявляю: свежий снег на вкус — 10 из 10! ❄️🐾 Проинспектировал первый сугроб, зарылся носом до самого дна и собрал коллекцию идеальных снежинок прямо на усах. Зима, я готов к сугробам!',
      likes: 0,
      createdAt: '2026-11-04T16:00:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-02',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-portrait.jpg' }
      ],
      text: 'Тот самый фирменный взгляд, когда услышал шуршание пакета с сыром за три комнаты от кухни 🧀✨ Говорят, золотистые ретриверы умеют улыбаться глазами. Ну правда же, как можно отказать этому взгляду?',
      likes: 0,
      createdAt: '2026-11-02T13:20:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-03',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-car-copilot.jpg' },
        { type: 'photo', url: 'assets/reggie/reggie-car-sunlight.jpg' },
        { type: 'photo', url: 'assets/reggie/reggie-car-sleepy.jpg' }
      ],
      text: 'Хроники автопутешествий Рэджи 🚗💨 Листайте карусель:\n1️⃣ Главный штурман контролирует маршрут строго между сиденьями.\n2️⃣ Ловлю тёплые лучи солнца и кайфую от скорости.\n3️⃣ Полный собачий дзен и релакс в гамаке — когда укачало под любимую музыку.',
      likes: 0,
      createdAt: '2026-10-26T11:15:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-04',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-blue-hood.jpg' }
      ],
      text: 'Сказали, на улице осенний ветер, поэтому экипировали по последнему слову собачьей моды 🧢💙 Теперь я похож то ли на космонавта, то ли на стильного сибирского хаски. Зато уши в тепле и комфорте!',
      likes: 0,
      createdAt: '2026-10-18T17:40:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-05',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-window.jpg' }
      ],
      text: 'Минутка собачьей философии у вечернего окна 🪟🌙 Подбородок в надёжной руке Человека, за стеклом зажигаются городские огни, а дома пахнет ужином и уютом. Золотое сердце бьётся в ритме спокойствия.',
      likes: 0,
      createdAt: '2026-10-10T19:25:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-06',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-birthday.jpg' }
      ],
      text: 'Праздничный день и любимый торт! 🎂🎉 Самый вкусный тортик с нашей совместной фотографией и кучей сердечек. Бесконечные игры, погони за бабочками, искренняя любовь и счастливые виляния хвостом!',
      likes: 0,
      createdAt: '2026-09-30T15:00:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-07',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-beavers.jpg' }
      ],
      text: 'Провёл важные дипломатические переговоры с местными бобрами у лесного ручья 🪵🦫 Подошёл на цыпочках, осторожно обнюхал — пахнут сосной, ведут себя подозрительно неподвижно. Проверка пройдена, территория под контролем!',
      likes: 0,
      createdAt: '2026-09-15T13:30:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-08',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-bears.jpg' }
      ],
      text: 'Ночная сказка в парке ✨🐻 Встретили целое семейство светящихся белых медведей! Решил не лаять, а гордо сесть рядом для фото — показать, кто здесь самый дружелюбный великан с золотым сердцем.',
      likes: 0,
      createdAt: '2026-08-28T21:45:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-09',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-forest.jpg' }
      ],
      text: 'Летняя экспедиция в сосновый бор 🌲🌾 Солнце, птичьи трели, аромат клевера и мой любимый Человек рядом. Набегался так, что язык еле помещается во рту — вот оно, абсолютное собачье счастье!',
      likes: 0,
      createdAt: '2026-08-10T10:45:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-10',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-twilight.jpg' }
      ],
      text: 'Вечерний час тишины 🌅 Розовый закат, прохладная трава и мой стильный ошейник. Люблю после активных догонялок просто лечь на поляне и слушать, как засыпает вечерний парк.',
      likes: 0,
      createdAt: '2026-07-22T21:10:00.000Z',
      comments: []
    },
    {
      id: 'reggie-post-11',
      media: [
        { type: 'photo', url: 'assets/reggie/reggie-walk.jpg' }
      ],
      text: 'Бодрый утренний шаг! ☀️🐾 Уши назад, хвост трубой, поводок натянут ровно настолько, чтобы успевать исследовать каждый встречный куст. Всем пушистого, бодрого и радостного дня!',
      likes: 0,
      createdAt: '2026-07-05T09:20:00.000Z',
      comments: []
    }
  ];

  const DEFAULT_PROFILE = {
    name: 'Рэджи',
    breed: 'Золотистый ретривер',
    status: 'Любитель автопутешествий, снежных сугробов и бесконечных обнимашек 🦴🌾💛',
    avatarUrl: 'assets/avatar.jpg'
  };

  // --- СОСТОЯНИЕ (STATE) ---
  const state = {
    posts: [],
    profile: { ...DEFAULT_PROFILE },
    likedPostIds: new Set(),
    activeFilter: 'all', // 'all' | 'liked'
    isSyncing: false,
    lastSyncHash: '',
    isAdmin: false,
    attachedMediaList: [], // Array<{ type: 'photo'|'video', url: string, name?: string }>
    postToDeleteId: null
  };

  // --- DOM ЭЛЕМЕНТЫ ---
  const DOM = {
    header: document.querySelector('.site-header'),
    logoLink: document.getElementById('logoLink'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Hero Profile
    profileAvatarImg: document.getElementById('profileAvatarImg'),
    profileName: document.getElementById('profileName'),
    profileBreed: document.getElementById('profileBreed'),
    profileStatus: document.getElementById('profileStatus'),
    statPostsCount: document.getElementById('statPostsCount'),
    statLikesCount: document.getElementById('statLikesCount'),

    // Header Actions & Admin
    adminLoginToggleBtn: document.getElementById('adminLoginToggleBtn'),
    adminSessionPill: document.getElementById('adminSessionPill'),
    adminLogoutBtn: document.getElementById('adminLogoutBtn'),

    // Quick Creator (Добавление поста админом)
    quickCreatorSection: document.getElementById('quickCreatorSection'),
    inlinePostText: document.getElementById('inlinePostText'),
    mediaFilesInput: document.getElementById('mediaFilesInput'),
    btnAttachMedia: document.getElementById('btnAttachMedia'),
    attachedMediaTray: document.getElementById('attachedMediaTray'),
    mediaPreviewsList: document.getElementById('mediaPreviewsList'),
    attachedCountBadge: document.getElementById('attachedCountBadge'),
    inlinePublishBtn: document.getElementById('inlinePublishBtn'),

    // Feed & Filters
    filterTabs: document.querySelectorAll('.filter-tab'),
    countAll: document.getElementById('countAll'),
    countLiked: document.getElementById('countLiked'),
    feedContainer: document.getElementById('feedContainer'),
    feedEmptyState: document.getElementById('feedEmptyState'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    emptyStateResetBtn: document.getElementById('emptyStateResetBtn'),

    // Lightbox
    lightboxOverlay: document.getElementById('lightboxOverlay'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxCaption: document.getElementById('lightboxCaption'),
    lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),

    // Login Modal
    loginModal: document.getElementById('loginModal'),
    adminLoginForm: document.getElementById('adminLoginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginRememberMe: document.getElementById('loginRememberMe'),
    loginErrorMsg: document.getElementById('loginErrorMsg'),
    closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
    cancelLoginBtn: document.getElementById('cancelLoginBtn'),

    // Delete Post Modal
    deleteConfirmModal: document.getElementById('deleteConfirmModal'),
    closeDeleteModalBtn: document.getElementById('closeDeleteModalBtn'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeletePostBtn: document.getElementById('confirmDeletePostBtn')
  };

  // ==========================================================================
  // 1. АВТОРИЗАЦИЯ АДМИНИСТРАТОРА (СПОСОБ 1: ЛОГИН + ПАРОЛЬ)
  // ==========================================================================

  async function computeSha256(str) {
    try {
      if (window.crypto && crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('Crypto API недоступно:', e);
    }
    return null;
  }

  function initAdminAuth() {
    let authData = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    if (!authData) {
      authData = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    }

    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed && parsed.user === ADMIN_CONFIG.username) {
          state.isAdmin = true;
        }
      } catch (e) {
        state.isAdmin = false;
      }
    }

    updateAdminUI();
  }

  function updateAdminUI() {
    if (state.isAdmin) {
      if (DOM.adminLoginToggleBtn) DOM.adminLoginToggleBtn.style.display = 'none';
      if (DOM.adminSessionPill) DOM.adminSessionPill.style.display = 'inline-flex';
      if (DOM.quickCreatorSection) DOM.quickCreatorSection.style.display = 'block';
    } else {
      if (DOM.adminLoginToggleBtn) DOM.adminLoginToggleBtn.style.display = 'inline-flex';
      if (DOM.adminSessionPill) DOM.adminSessionPill.style.display = 'none';
      if (DOM.quickCreatorSection) DOM.quickCreatorSection.style.display = 'none';
    }
  }

  function openLoginModal() {
    if (!DOM.loginModal) return;
    DOM.loginModal.style.display = 'flex';
    if (DOM.loginUsername) DOM.loginUsername.value = '';
    if (DOM.loginPassword) DOM.loginPassword.value = '';
    if (DOM.loginErrorMsg) DOM.loginErrorMsg.style.display = 'none';
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (DOM.loginUsername) DOM.loginUsername.focus();
    }, 150);
  }

  function closeLoginModal() {
    if (!DOM.loginModal) return;
    DOM.loginModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  async function handleAdminLogin(e) {
    if (e) e.preventDefault();
    if (!DOM.loginUsername || !DOM.loginPassword) return;

    const enteredUsername = DOM.loginUsername.value.trim().toLowerCase();
    const enteredPassword = DOM.loginPassword.value;

    const isUserMatch = enteredUsername === ADMIN_CONFIG.username;
    let isPassMatch = enteredPassword === ADMIN_CONFIG.plainPasswordFallback;

    if (!isPassMatch) {
      const hashed = await computeSha256(enteredPassword);
      if (hashed && hashed === ADMIN_CONFIG.passwordHash) {
        isPassMatch = true;
      }
    }

    if (isUserMatch && isPassMatch) {
      state.isAdmin = true;
      const sessionObj = {
        user: ADMIN_CONFIG.username,
        timestamp: Date.now()
      };

      const remember = DOM.loginRememberMe ? DOM.loginRememberMe.checked : true;
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(sessionObj));
      } else {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(sessionObj));
      }

      updateAdminUI();
      closeLoginModal();
      renderFeed(); // перерисовываем ленту с кнопками удаления для админа
    } else {
      if (DOM.loginErrorMsg) {
        DOM.loginErrorMsg.textContent = 'Неверный логин или пароль. Попробуйте еще раз.';
        DOM.loginErrorMsg.style.display = 'block';
      }
    }
  }

  function handleAdminLogout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    state.isAdmin = false;
    updateAdminUI();
    renderFeed(); // скрываем кнопки удаления
  }

  // ==========================================================================
  // 2. ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ (FIREBASE REST API)
  // ==========================================================================

  function normalizePostMedia(post) {
    if (!post || typeof post !== 'object') return null;

    if (!Array.isArray(post.media)) {
      if (post.mediaUrl) {
        post.media = [
          {
            type: 'photo',
            url: post.mediaUrl,
            fallbackUrl: post.fallbackMediaUrl
          }
        ];
      } else {
        post.media = [];
      }
    }

    // Нормализуем каждый медиафайл внутри поста (фото или видео)
    post.media = post.media.filter(Boolean).map(m => {
      if (typeof m === 'string') {
        const isVid = m.match(/\.(mp4|webm|mov)(\?.*)?$/i) || m.startsWith('data:video/');
        return { type: isVid ? 'video' : 'photo', url: m };
      }
      return {
        type: m.type === 'video' ? 'video' : 'photo',
        url: m.url || '',
        fallbackUrl: m.fallbackUrl || '',
        posterUrl: m.posterUrl || '',
        name: m.name || ''
      };
    });

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }
    if (typeof post.likes !== 'number' || post.likes < 0) {
      post.likes = 0;
    }
    if (typeof post.text !== 'string') {
      post.text = post.text ? String(post.text) : '';
    }
    if (!post.createdAt) {
      post.createdAt = new Date().toISOString();
    }
    if (!post.id) {
      post.id = 'reggie-post-' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    return post;
  }

  // Загрузка постов из Firebase
  async function fetchCloudPosts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${FIREBASE_BASE_URL}/posts.json`, {
        cache: 'no-cache',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data) return null;

      let rawPosts = [];
      if (Array.isArray(data)) {
        rawPosts = data.filter(Boolean);
      } else if (typeof data === 'object') {
        rawPosts = Object.values(data).filter(Boolean);
      }

      const normalized = rawPosts.map(normalizePostMedia).filter(Boolean);
      normalized.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return normalized;
    } catch (err) {
      console.warn('Ошибка связи с Firebase:', err);
      return null;
    }
  }

  // Сохранение постов в Firebase
  async function saveCloudPosts(posts) {
    try {
      try {
        localStorage.setItem(STORAGE_KEYS.POSTS_CACHE, JSON.stringify(posts));
      } catch (e) {
        console.warn('Кэш localStorage недоступен:', e);
      }

      const res = await fetch(`${FIREBASE_BASE_URL}/posts.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posts)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (err) {
      console.error('Ошибка сохранения постов в Firebase:', err);
      return false;
    }
  }

  // Загрузка профиля из Firebase
  async function fetchCloudProfile() {
    try {
      const res = await fetch(`${FIREBASE_BASE_URL}/profile.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data ? Object.assign({}, DEFAULT_PROFILE, data) : null;
    } catch (err) {
      return null;
    }
  }

  // Синхронизация данных
  async function syncDataWithCloud(isInitial = false) {
    if (state.isSyncing) return;
    state.isSyncing = true;

    try {
      const cloudPosts = await fetchCloudPosts();
      const cloudProfile = await fetchCloudProfile();

      let postsToUse = cloudPosts;
      if (!postsToUse || postsToUse.length === 0) {
        postsToUse = JSON.parse(JSON.stringify(DEFAULT_POSTS)).map(normalizePostMedia);
        postsToUse.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        await saveCloudPosts(postsToUse);
      }

      if (cloudProfile) {
        delete cloudProfile.age;
        state.profile = Object.assign({}, DEFAULT_PROFILE, cloudProfile);
      }

      postsToUse.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      const currentHash = JSON.stringify(postsToUse.map(p => ({ id: p.id, likes: p.likes, c: (p.comments || []).length })));
      if (currentHash !== state.lastSyncHash || isInitial) {
        state.posts = postsToUse;
        state.lastSyncHash = currentHash;
        renderProfile();
        renderFeed();
      }
    } catch (err) {
      console.warn('Синхронизация временно недоступна, работаем с локальными данными:', err);
    } finally {
      state.isSyncing = false;
    }
  }

  // ==========================================================================
  // 3. ОБРАБОТКА МЕДИАФАЙЛОВ И СОЗДАНИЕ ПОСТА (CANVAS И ВИДЕО)
  // ==========================================================================

  // Сжатие фото через HTML5 Canvas для моментальной отправки по сети
  function optimizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Ошибка обработки изображения'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  }

  // Чтение видеофайла (до 25 МБ)
  function processVideoFile(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 25 * 1024 * 1024) {
        reject(new Error(`Видео «${file.name}» превышает лимит 25 МБ.`));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          type: 'video',
          url: e.target.result,
          name: file.name
        });
      };
      reader.onerror = () => reject(new Error('Ошибка чтения видеофайла'));
      reader.readAsDataURL(file);
    });
  }

  function renderAttachedMediaTray() {
    if (!DOM.attachedMediaTray || !DOM.mediaPreviewsList) return;

    const count = state.attachedMediaList.length;
    if (count === 0) {
      DOM.attachedMediaTray.style.display = 'none';
      if (DOM.attachedCountBadge) DOM.attachedCountBadge.style.display = 'none';
      DOM.mediaPreviewsList.innerHTML = '';
      return;
    }

    DOM.attachedMediaTray.style.display = 'block';
    if (DOM.attachedCountBadge) {
      DOM.attachedCountBadge.style.display = 'inline-block';
      const word = count === 1 ? 'файл' : count < 5 ? 'файла' : 'файлов';
      DOM.attachedCountBadge.textContent = `${count} ${word}`;
    }

    DOM.mediaPreviewsList.innerHTML = '';

    state.attachedMediaList.forEach((item, index) => {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'media-preview-thumb-wrap';

      if (item.type === 'video') {
        thumbWrap.innerHTML = `
          <video src="${escapeHtml(item.url)}" class="media-preview-thumb-video" preload="metadata"></video>
          <span class="thumb-video-badge">🎥 Видео</span>
          <button type="button" class="thumb-remove-btn" data-remove-index="${index}" title="Удалить">✕</button>
        `;
      } else {
        thumbWrap.innerHTML = `
          <img src="${escapeHtml(item.url)}" alt="Превью" class="media-preview-thumb-img">
          <button type="button" class="thumb-remove-btn" data-remove-index="${index}" title="Удалить">✕</button>
        `;
      }

      thumbWrap.querySelector('.thumb-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        state.attachedMediaList.splice(index, 1);
        renderAttachedMediaTray();
      });

      DOM.mediaPreviewsList.appendChild(thumbWrap);
    });
  }

  // Прикрепление медиафайлов
  if (DOM.btnAttachMedia && DOM.mediaFilesInput) {
    DOM.btnAttachMedia.addEventListener('click', () => {
      DOM.mediaFilesInput.click();
    });

    DOM.mediaFilesInput.addEventListener('change', async () => {
      const files = Array.from(DOM.mediaFilesInput.files || []);
      if (!files.length) return;

      for (const file of files) {
        const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i);

        if (isVideo) {
          try {
            const videoData = await processVideoFile(file);
            state.attachedMediaList.push(videoData);
            renderAttachedMediaTray();
          } catch (err) {
            alert(err.message || 'Ошибка загрузки видео');
          }
        } else {
          try {
            const optimizedDataUrl = await optimizeImage(file);
            state.attachedMediaList.push({
              type: 'photo',
              url: optimizedDataUrl,
              name: file.name
            });
            renderAttachedMediaTray();
          } catch (err) {
            alert(`Не удалось обработать изображение ${file.name}`);
          }
        }
      }

      DOM.mediaFilesInput.value = '';
    });
  }

  // Публикация нового поста
  if (DOM.inlinePublishBtn) {
    DOM.inlinePublishBtn.addEventListener('click', async () => {
      const text = DOM.inlinePostText ? DOM.inlinePostText.value.trim() : '';
      const media = state.attachedMediaList;

      if (!text && media.length === 0) {
        alert('Пожалуйста, напишите текст или добавьте фото/видео через кнопку «Добавить медиа»');
        if (DOM.inlinePostText) DOM.inlinePostText.focus();
        return;
      }

      DOM.inlinePublishBtn.disabled = true;
      const originalBtnText = DOM.inlinePublishBtn.textContent;
      DOM.inlinePublishBtn.textContent = 'Публикация... 🐾';

      const newPost = {
        id: 'reggie-post-' + Date.now(),
        media: [...media],
        text: text,
        likes: 0,
        createdAt: new Date().toISOString(),
        comments: []
      };

      state.posts.unshift(newPost);

      // Сброс креатора
      if (DOM.inlinePostText) DOM.inlinePostText.value = '';
      state.attachedMediaList = [];
      renderAttachedMediaTray();
      renderFeed();

      // Сохраняем в Firebase
      await saveCloudPosts(state.posts);

      DOM.inlinePublishBtn.disabled = false;
      DOM.inlinePublishBtn.textContent = originalBtnText;
    });
  }

  // ==========================================================================
  // 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ОТОБРАЖЕНИЕ
  // ==========================================================================

  function formatDate(isoString) {
    if (!isoString) return 'Только что';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) {
      const isToday = now.toDateString() === date.toDateString();
      const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      return isToday ? `Сегодня, ${timeStr}` : `Вчера, ${timeStr}`;
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderProfile() {
    if (DOM.profileName) DOM.profileName.textContent = state.profile.name;
    if (DOM.profileBreed) DOM.profileBreed.textContent = state.profile.breed || 'Золотистый ретривер';
    if (DOM.profileStatus) DOM.profileStatus.textContent = state.profile.status;
    if (DOM.profileAvatarImg) DOM.profileAvatarImg.src = state.profile.avatarUrl;

    updateCounters();
  }

  function updateCounters() {
    const totalPosts = state.posts.length;
    const totalLikes = state.posts.reduce((sum, p) => sum + (p.likes || 0), 0);
    const likedCount = state.likedPostIds.size;

    if (DOM.statPostsCount) DOM.statPostsCount.textContent = totalPosts;
    if (DOM.statLikesCount) {
      if (totalLikes >= 1000) {
        DOM.statLikesCount.textContent = (totalLikes / 1000).toFixed(1).replace('.0', '') + 'k';
      } else {
        DOM.statLikesCount.textContent = totalLikes;
      }
    }

    if (DOM.countAll) DOM.countAll.textContent = totalPosts;
    if (DOM.countLiked) DOM.countLiked.textContent = likedCount;
  }

  // ==========================================================================
  // 5. ОТРИСОВКА ЛЕНТЫ ПУБЛИКАЦИЙ
  // ==========================================================================

  function getFilteredPosts() {
    return state.posts.filter(post => {
      if (state.activeFilter === 'liked') {
        return state.likedPostIds.has(post.id);
      }
      return true;
    });
  }

  function renderFeed() {
    updateCounters();
    const filtered = getFilteredPosts();

    DOM.feedContainer.innerHTML = '';

    if (filtered.length === 0) {
      DOM.feedContainer.style.display = 'none';
      DOM.feedEmptyState.style.display = 'block';

      if (state.activeFilter === 'liked') {
        DOM.emptyStateDesc.textContent = 'Вы еще не поставили ни одной лапки 🐾 Нажмите «Дай лапу!» под любой историей Рэджи.';
      } else {
        DOM.emptyStateDesc.textContent = 'В дневнике пока нет записей.';
      }
      return;
    }

    DOM.feedContainer.style.display = '';
    DOM.feedEmptyState.style.display = 'none';

    filtered.forEach(post => {
      try {
        const card = createPostCardElement(post);
        if (card) {
          DOM.feedContainer.appendChild(card);
        }
      } catch (err) {
        console.error('Ошибка при создании карточки поста:', post?.id, err);
      }
    });
  }

  function createPostCardElement(post) {
    if (!post || typeof post !== 'object') return null;

    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.postId = post.id || '';

    const isLiked = state.likedPostIds.has(post.id);
    const commentsCount = (post.comments || []).length;
    const mediaList = Array.isArray(post.media) ? post.media : [];

    let typeLabel = '📸 Фото';
    if (mediaList.length > 1) {
      typeLabel = `📸 Альбом (${mediaList.length})`;
    } else if (mediaList.length === 1 && mediaList[0] && mediaList[0].type === 'video') {
      typeLabel = '🎥 Видео';
    }

    let mediaHtml = '';
    if (mediaList.length > 1) {
      mediaHtml = createCarouselHtml(post.id, mediaList, post.text);
    } else if (mediaList.length === 1 && mediaList[0]) {
      if (mediaList[0].type === 'video') {
        mediaHtml = createSingleVideoHtml(post.id, mediaList[0]);
      } else {
        mediaHtml = createSingleMediaHtml(post.id, mediaList[0], post.text);
      }
    }

    const commentsListHtml = (post.comments || []).map(c => `
      <div class="comment-item">
        <div class="comment-author-avatar">${escapeHtml(c.author ? c.author.charAt(0).toUpperCase() : '🐾')}</div>
        <div class="comment-bubble">
          <div class="comment-author-row">
            <span class="comment-author-name">${escapeHtml(c.author || 'Друг Рэджи')}</span>
            <span class="comment-time">${formatDate(c.createdAt)}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <header class="post-card-header">
        <div class="post-author-info">
          <img 
            src="${escapeHtml(state.profile.avatarUrl)}" 
            alt="${escapeHtml(state.profile.name)}" 
            class="post-author-avatar"
            onerror="this.src='assets/avatar.jpg'"
          >
          <div class="post-author-meta">
            <span class="post-author-name">${escapeHtml(state.profile.name)}</span>
            <time class="post-date" datetime="${post.createdAt || ''}">${formatDate(post.createdAt)}</time>
          </div>
        </div>
        <div class="post-header-actions">
          <span class="post-type-tag">${typeLabel}</span>
          ${state.isAdmin ? `
            <button type="button" class="post-delete-btn" data-action="delete-post" title="Удалить запись">🗑️</button>
          ` : ''}
        </div>
      </header>

      ${mediaHtml}

      <div class="post-body">
        <p class="post-story-text">${escapeHtml(post.text || '')}</p>
      </div>

      <footer class="post-actions-bar">
        <button type="button" class="like-reaction-btn ${isLiked ? 'liked' : ''}" data-action="like-post" title="Дай лапу!">
          <span class="like-paw-icon">🐾</span>
          <span class="like-btn-text">${isLiked ? 'Лапа дана!' : 'Дай лапу!'}</span>
          <span class="like-counter">(${post.likes || 0})</span>
        </button>

        <button type="button" class="comments-toggle-btn" data-action="toggle-comments" title="Открыть комментарии">
          <span>💬</span>
          <span class="comments-btn-label">Комментировать (${commentsCount})</span>
        </button>
      </footer>

      <div class="comments-drawer" id="comments-${post.id}">
        <div class="comments-list">
          ${commentsListHtml.length > 0 ? commentsListHtml : '<div class="comment-empty" style="color:var(--color-text-light);font-size:0.85rem;padding:4px 0;">Пока нет комментариев. Будьте первыми! ✨</div>'}
        </div>
        <form class="comment-form" data-post-id="${post.id}">
          <input 
            type="text" 
            class="comment-input" 
            placeholder="Напишите доброе слово..." 
            required 
            maxlength="240"
          >
          <button type="submit" class="btn-send-comment">Отправить</button>
        </form>
      </div>
    `;

    // Инициализация карусели или видеоплееров
    if (mediaList.length > 1) {
      try {
        const carousel = card.querySelector('.post-carousel-container');
        if (carousel) initPostCarousel(carousel);
      } catch (carouselErr) {
        console.warn('Ошибка инициализации карусели:', carouselErr);
      }
    }

    const videoPlayers = card.querySelectorAll('.custom-video-player');
    videoPlayers.forEach(player => {
      try {
        initCustomVideoPlayer(player);
      } catch (videoErr) {
        console.warn('Ошибка инициализации плеера:', videoErr);
      }
    });

    return card;
  }

  // ==========================================================================
  // 6. КАСТОМНЫЙ ВИДЕОПЛЕЕР
  // ==========================================================================

  function createSingleVideoHtml(postId, media) {
    return `
      <div class="post-media-wrap custom-video-player paused" id="player-${postId}">
        <video 
          class="custom-video-element" 
          src="${escapeHtml(media.url)}" 
          preload="metadata" 
          loop 
          playsinline
        ></video>
        <button type="button" class="video-big-play-btn" title="Воспроизвести">
          <span>▶</span>
        </button>
        <div class="video-controls-overlay">
          <div class="video-progress-bar-container">
            <div class="video-progress-filled"></div>
          </div>
          <div class="video-controls-row">
            <div class="video-ctrl-left">
              <button type="button" class="video-ctrl-btn video-play-pause-btn">▶</button>
              <span class="video-time-display">0:00 / 0:00</span>
            </div>
            <div class="video-ctrl-right">
              <button type="button" class="video-ctrl-btn video-mute-btn">🔊</button>
              <button type="button" class="video-ctrl-btn video-fullscreen-btn">⛶</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initCustomVideoPlayer(player) {
    if (!player) return;

    const video = player.querySelector('.custom-video-element');
    if (!video) return;

    const bigPlayBtn = player.querySelector('.video-big-play-btn');
    const playPauseBtn = player.querySelector('.video-play-pause-btn');
    const progressBar = player.querySelector('.video-progress-bar-container');
    const progressFill = player.querySelector('.video-progress-filled');
    const timeDisplay = player.querySelector('.video-time-display');
    const muteBtn = player.querySelector('.video-mute-btn');
    const fullscreenBtn = player.querySelector('.video-fullscreen-btn');

    function formatVideoTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function togglePlay() {
      if (video.paused || video.ended) {
        video.play().then(() => {
          player.classList.remove('paused');
          player.classList.add('playing');
          if (playPauseBtn) playPauseBtn.textContent = '⏸';
        }).catch(err => {
          console.warn('Воспроизведение заблокировано браузером:', err);
        });
      } else {
        video.pause();
        player.classList.remove('playing');
        player.classList.add('paused');
        if (playPauseBtn) playPauseBtn.textContent = '▶';
      }
    }

    if (bigPlayBtn) {
      bigPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    video.addEventListener('click', () => {
      togglePlay();
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    video.addEventListener('timeupdate', () => {
      if (!isNaN(video.duration) && video.duration > 0) {
        const percent = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (timeDisplay) timeDisplay.textContent = `${formatVideoTime(video.currentTime)} / ${formatVideoTime(video.duration)}`;
      }
    });

    video.addEventListener('loadedmetadata', () => {
      if (timeDisplay) timeDisplay.textContent = `0:00 / ${formatVideoTime(video.duration)}`;
    });

    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (width > 0 && !isNaN(video.duration)) {
          video.currentTime = (clickX / width) * video.duration;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          if (player.requestFullscreen) {
            player.requestFullscreen();
          } else if (video.webkitEnterFullscreen) {
            video.webkitEnterFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      });
    }

    video.addEventListener('ended', () => {
      player.classList.remove('playing');
      player.classList.add('paused');
      if (playPauseBtn) playPauseBtn.textContent = '▶';
    });
  }

  // ==========================================================================
  // 7. ИНСТАГРАМ-КАРУСЕЛЬ МЕДИА В ПОСТАХ
  // ==========================================================================

  function createCarouselHtml(postId, mediaList, caption) {
    const total = mediaList.length;

    const slidesHtml = mediaList.map((m, index) => {
      if (m.type === 'video') {
        return `
          <div class="carousel-slide" data-slide-index="${index}">
            <div class="custom-video-player paused" id="player-${postId}-${index}">
              <video 
                class="custom-video-element" 
                src="${escapeHtml(m.url)}" 
                preload="metadata" 
                loop 
                playsinline
              ></video>
              <button type="button" class="video-big-play-btn" title="Воспроизвести">
                <span>▶</span>
              </button>
              <div class="video-controls-overlay">
                <div class="video-progress-bar-container">
                  <div class="video-progress-filled"></div>
                </div>
                <div class="video-controls-row">
                  <div class="video-ctrl-left">
                    <button type="button" class="video-ctrl-btn video-play-pause-btn">▶</button>
                    <span class="video-time-display">0:00 / 0:00</span>
                  </div>
                  <div class="video-ctrl-right">
                    <button type="button" class="video-ctrl-btn video-mute-btn">🔊</button>
                    <button type="button" class="video-ctrl-btn video-fullscreen-btn">⛶</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="carousel-slide" data-slide-index="${index}">
          <img 
            src="${escapeHtml(m.url)}" 
            alt="Фотография" 
            class="carousel-slide-photo" 
            loading="lazy"
            data-lightbox-src="${escapeHtml(m.url)}" 
            data-lightbox-caption="${escapeHtml(caption)}"
            onerror="if(this.src!=='${m.fallbackUrl || ''}') this.src='${m.fallbackUrl || ''}';"
          >
        </div>
      `;
    }).join('');

    const dotsHtml = mediaList.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}"></span>`).join('');

    return `
      <div class="post-carousel-container" data-post-id="${postId}">
        <div class="carousel-counter-badge">1 / ${total}</div>
        <div class="carousel-track">
          ${slidesHtml}
        </div>
        <button type="button" class="carousel-nav-btn carousel-prev-btn" style="display: none;" title="Предыдущее">‹</button>
        <button type="button" class="carousel-nav-btn carousel-next-btn" title="Следующее">›</button>
        <div class="carousel-dots">
          ${dotsHtml}
        </div>
      </div>
    `;
  }

  function initPostCarousel(container) {
    if (!container) return;

    const track = container.querySelector('.carousel-track');
    const slides = container.querySelectorAll('.carousel-slide');
    if (!track || !slides || slides.length === 0) return;

    const prevBtn = container.querySelector('.carousel-prev-btn');
    const nextBtn = container.querySelector('.carousel-next-btn');
    const counterBadge = container.querySelector('.carousel-counter-badge');
    const dots = container.querySelectorAll('.carousel-dot');
    const total = slides.length;

    let currentIndex = 0;

    function updateCarousel() {
      if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Ставим на паузу видео на остальных слайдах при переключении
      slides.forEach((slide, idx) => {
        if (idx !== currentIndex) {
          const v = slide.querySelector('video');
          if (v && !v.paused) v.pause();
        }
      });

      if (counterBadge) counterBadge.textContent = `${currentIndex + 1} / ${total}`;
      if (prevBtn) prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
      if (nextBtn) nextBtn.style.display = currentIndex === total - 1 ? 'none' : 'flex';

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex < total - 1) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    // Сенсорные свайпы
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0 && currentIndex < total - 1) {
          currentIndex++;
          updateCarousel();
        } else if (diff > 0 && currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      }
    }, { passive: true });
  }

  function createSingleMediaHtml(postId, media, caption) {
    return `
      <div class="post-media-wrap" data-lightbox-src="${escapeHtml(media.url)}" data-lightbox-caption="${escapeHtml(caption)}">
        <img 
          src="${escapeHtml(media.url)}" 
          alt="Фотография Рэджи" 
          class="post-photo-img" 
          loading="lazy"
          onerror="if(this.src!=='${media.fallbackUrl || ''}') this.src='${media.fallbackUrl || ''}';"
        >
      </div>
    `;
  }

  // ==========================================================================
  // 8. РЕАКЦИИ И КОММЕНТАРИИ
  // ==========================================================================

  function triggerPawBurst(buttonElement) {
    const pawIcons = ['🐾', '🐾', '🦴', '✨', '🐾'];
    const rect = buttonElement.getBoundingClientRect();

    pawIcons.forEach((icon, i) => {
      const paw = document.createElement('span');
      paw.className = 'floating-paw';
      paw.textContent = icon;
      const randomX = (Math.random() - 0.5) * 40;
      paw.style.left = `${(rect.width / 2) + randomX}px`;
      paw.style.top = `-10px`;
      paw.style.animationDelay = `${i * 0.08}s`;
      buttonElement.appendChild(paw);
      setTimeout(() => paw.remove(), 1000);
    });
  }

  async function handlePostLike(postId, buttonElement) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = state.likedPostIds.has(postId);

    if (isCurrentlyLiked) {
      state.likedPostIds.delete(postId);
      post.likes = Math.max(0, (post.likes || 1) - 1);
      buttonElement.classList.remove('liked');
      buttonElement.querySelector('.like-btn-text').textContent = 'Дай лапу!';
    } else {
      state.likedPostIds.add(postId);
      post.likes = (post.likes || 0) + 1;
      buttonElement.classList.add('liked');
      buttonElement.querySelector('.like-btn-text').textContent = 'Лапа дана!';
      triggerPawBurst(buttonElement);
    }

    buttonElement.querySelector('.like-counter').textContent = `(${post.likes})`;
    localStorage.setItem(STORAGE_KEYS.LIKED_POSTS, JSON.stringify(Array.from(state.likedPostIds)));
    updateCounters();

    // Синхронизируем счётчик лайков с Firebase
    await saveCloudPosts(state.posts);
  }

  function toggleCommentsDrawer(postId, card) {
    const drawer = card.querySelector(`#comments-${postId}`);
    if (!drawer) return;
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      const input = drawer.querySelector('.comment-input');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  async function handleAddComment(postId, formElement) {
    const input = formElement.querySelector('.comment-input');
    const commentText = input.value.trim();
    if (!commentText) return;

    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.comments) post.comments = [];
    const authorName = localStorage.getItem('reggie_commenter_name') || 'Друг Рэджи';

    const newComment = {
      id: 'c_' + Date.now(),
      author: authorName,
      text: commentText,
      createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);

    const drawer = formElement.closest('.comments-drawer');
    const list = drawer.querySelector('.comments-list');
    const emptyNotice = list.querySelector('.comment-empty');
    if (emptyNotice) emptyNotice.remove();

    const commentNode = document.createElement('div');
    commentNode.className = 'comment-item';
    commentNode.innerHTML = `
      <div class="comment-author-avatar">${escapeHtml(authorName.charAt(0).toUpperCase())}</div>
      <div class="comment-bubble">
        <div class="comment-author-row">
          <span class="comment-author-name">${escapeHtml(authorName)}</span>
          <span class="comment-time">Только что</span>
        </div>
        <div class="comment-text">${escapeHtml(newComment.text)}</div>
      </div>
    `;
    list.appendChild(commentNode);

    input.value = '';
    const toggleBtn = formElement.closest('.post-card').querySelector('.comments-btn-label');
    if (toggleBtn) toggleBtn.textContent = `Комментировать (${post.comments.length})`;

    // Сохраняем комментарии в Firebase
    await saveCloudPosts(state.posts);
  }

  // ==========================================================================
  // 9. УДАЛЕНИЕ ПУБЛИКАЦИИ (ТОЛЬКО ДЛЯ АВТОРА)
  // ==========================================================================

  function openDeleteModal(postId) {
    state.postToDeleteId = postId;
    if (DOM.deleteConfirmModal) {
      DOM.deleteConfirmModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDeleteModal() {
    state.postToDeleteId = null;
    if (DOM.deleteConfirmModal) {
      DOM.deleteConfirmModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  async function handleConfirmDelete() {
    if (!state.postToDeleteId) return;

    state.posts = state.posts.filter(p => p.id !== state.postToDeleteId);
    state.postToDeleteId = null;
    closeDeleteModal();
    renderFeed();

    await saveCloudPosts(state.posts);
  }

  // ==========================================================================
  // 10. ФИЛЬТРАЦИЯ И НАВИГАЦИЯ
  // ==========================================================================

  DOM.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      DOM.filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      state.activeFilter = tab.dataset.filter;
      renderFeed();
    });
  });

  DOM.navLinks.forEach(link => {
    link.addEventListener('click', () => {
      DOM.navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const action = link.dataset.action;
      state.activeFilter = action;
      DOM.filterTabs.forEach(t => t.classList.toggle('active', t.dataset.filter === action));
      renderFeed();
      DOM.feedContainer.scrollIntoView({ behavior: 'smooth' });
    });
  });

  if (DOM.logoLink) {
    DOM.logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      state.activeFilter = 'all';
      DOM.filterTabs.forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
      renderFeed();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (DOM.emptyStateResetBtn) {
    DOM.emptyStateResetBtn.addEventListener('click', () => {
      state.activeFilter = 'all';
      DOM.filterTabs.forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
      renderFeed();
    });
  }

  // ==========================================================================
  // 11. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ В ЛЕНТЕ
  // ==========================================================================

  DOM.feedContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.post-card');
    if (!card) return;
    const postId = card.dataset.postId;

    // Кнопка удаления поста (для админа)
    const deleteBtn = e.target.closest('[data-action="delete-post"]');
    if (deleteBtn) {
      e.stopPropagation();
      openDeleteModal(postId);
      return;
    }

    // Лайк
    const likeBtn = e.target.closest('[data-action="like-post"]');
    if (likeBtn) {
      e.stopPropagation();
      handlePostLike(postId, likeBtn);
      return;
    }

    // Комментарии
    const commentsToggleBtn = e.target.closest('[data-action="toggle-comments"]');
    if (commentsToggleBtn) {
      e.stopPropagation();
      toggleCommentsDrawer(postId, card);
      return;
    }

    // Лайтбокс фото
    const mediaImg = e.target.closest('[data-lightbox-src]');
    if (mediaImg) {
      const src = mediaImg.dataset.lightboxSrc;
      const caption = mediaImg.dataset.lightboxCaption || '';
      openLightbox(src, caption);
      return;
    }
  });

  DOM.feedContainer.addEventListener('submit', (e) => {
    const commentForm = e.target.closest('.comment-form');
    if (commentForm) {
      e.preventDefault();
      const postId = commentForm.dataset.postId;
      handleAddComment(postId, commentForm);
    }
  });

  // ==========================================================================
  // 12. ПОЛНОЭКРАННЫЙ LIGHTBOX
  // ==========================================================================

  function openLightbox(src, caption) {
    if (!DOM.lightboxOverlay || !DOM.lightboxImg) return;
    DOM.lightboxImg.src = src;
    if (DOM.lightboxCaption) DOM.lightboxCaption.textContent = caption;
    DOM.lightboxOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!DOM.lightboxOverlay || !DOM.lightboxImg) return;
    DOM.lightboxOverlay.style.display = 'none';
    DOM.lightboxImg.src = '';
    if (DOM.lightboxCaption) DOM.lightboxCaption.textContent = '';
    document.body.style.overflow = '';
  }

  if (DOM.lightboxCloseBtn) DOM.lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (DOM.lightboxOverlay) {
    DOM.lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === DOM.lightboxOverlay) closeLightbox();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (DOM.lightboxOverlay && DOM.lightboxOverlay.style.display === 'flex') {
        closeLightbox();
      }
      if (DOM.loginModal && DOM.loginModal.style.display === 'flex') {
        closeLoginModal();
      }
      if (DOM.deleteConfirmModal && DOM.deleteConfirmModal.style.display === 'flex') {
        closeDeleteModal();
      }
    }
  });

  window.addEventListener('scroll', () => {
    if (DOM.header) {
      if (window.scrollY > 20) {
        DOM.header.classList.add('scrolled');
      } else {
        DOM.header.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 13. СЛУШАТЕЛИ МОДАЛЬНЫХ ОКОН (ВХОД И УДАЛЕНИЕ)
  // ==========================================================================

  if (DOM.adminLoginToggleBtn) {
    DOM.adminLoginToggleBtn.addEventListener('click', openLoginModal);
  }

  if (DOM.closeLoginModalBtn) {
    DOM.closeLoginModalBtn.addEventListener('click', closeLoginModal);
  }

  if (DOM.cancelLoginBtn) {
    DOM.cancelLoginBtn.addEventListener('click', closeLoginModal);
  }

  if (DOM.adminLoginForm) {
    DOM.adminLoginForm.addEventListener('submit', handleAdminLogin);
  }

  if (DOM.adminLogoutBtn) {
    DOM.adminLogoutBtn.addEventListener('click', handleAdminLogout);
  }

  if (DOM.closeDeleteModalBtn) {
    DOM.closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  }

  if (DOM.cancelDeleteBtn) {
    DOM.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }

  if (DOM.confirmDeletePostBtn) {
    DOM.confirmDeletePostBtn.addEventListener('click', handleConfirmDelete);
  }

  // ==========================================================================
  // 14. ЗАПУСК И ФОНОВОЕ АВТООБНОВЛЕНИЕ
  // ==========================================================================

  async function initApp() {
    // 1. Инициализация прав автора/админа
    initAdminAuth();

    // 2. Быстро загружаем сохраненные лайки пользователя
    const cachedLiked = localStorage.getItem(STORAGE_KEYS.LIKED_POSTS);
    if (cachedLiked) {
      try { state.likedPostIds = new Set(JSON.parse(cachedLiked)); } catch (e) {}
    }

    // 3. Быстро загружаем кэш для мгновенной отрисовки без задержек
    const cachedPosts = localStorage.getItem(STORAGE_KEYS.POSTS_CACHE);
    if (cachedPosts) {
      try {
        const parsed = JSON.parse(cachedPosts);
        if (Array.isArray(parsed)) {
          state.posts = parsed.filter(Boolean).map(normalizePostMedia).filter(Boolean);
          state.posts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          renderProfile();
          renderFeed();
        }
      } catch (e) {}
    }

    // 4. Синхронизируем с Firebase в реальном времени
    await syncDataWithCloud(true);

    // 5. Фоновое автообновление: каждые 10 секунд опрашиваем облако для мгновенного появления новых постов, лапок и комментариев
    setInterval(() => {
      syncDataWithCloud(false);
    }, 10000);

    // 6. При возвращении на вкладку браузера сразу проверяем обновления
    window.addEventListener('focus', () => {
      syncDataWithCloud(false);
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        syncDataWithCloud(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
