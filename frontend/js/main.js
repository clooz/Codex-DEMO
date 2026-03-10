(function () {
  'use strict';

  // 检查登录状态并更新UI
  function checkLoginStatus() {
    var loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

    var token = localStorage.getItem('auth_token');
    var userInfo = localStorage.getItem('user_info');

    if (token && userInfo) {
      try {
        var user = JSON.parse(userInfo);
        // 已登录状态
        loginBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>' + user.name + '</span>';
        loginBtn.title = '点击退出登录';
        loginBtn.classList.add('is-logged-in');
        
        loginBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_info');
            window.location.reload();
          }
        });
      } catch (e) {
        console.error('Parse user info error:', e);
      }
    }
  }

  var header = document.getElementById('header');
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  var searchWrap = document.getElementById('searchWrap');
  var searchBtn = document.getElementById('searchBtn');
  var searchInline = document.getElementById('searchInline');
  var searchInput = document.getElementById('searchInput');
  var searchClose = document.getElementById('searchClose');
  var searchForm = document.getElementById('searchForm');
  var searchDropdown = document.getElementById('searchDropdown');
  var searchHistoryList = document.getElementById('searchHistoryList');
  var searchSuggestionsList = document.getElementById('searchSuggestionsList');
  var searchHistoryBlock = document.getElementById('searchHistoryBlock');
  var searchSuggestionsBlock = document.getElementById('searchSuggestionsBlock');

  var SEARCH_HISTORY_KEY = 'university_search_history';
  var SEARCH_HISTORY_MAX = 10;
  var SUGGESTIONS = ['新闻动态', '招生信息', '院系设置', '人才培养', '科学研究', '国际交流', '校园生活', '学校概况', '本科招生', '研究生招生', '就业服务'];

  function getHistory() {
    try {
      var raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveToHistory(word) {
    var wordTrim = (word || '').trim();
    if (!wordTrim) return;
    var list = getHistory().filter(function (w) { return w !== wordTrim; });
    list.unshift(wordTrim);
    list = list.slice(0, SEARCH_HISTORY_MAX);
    try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function fuzzyMatch(keyword, text) {
    if (!keyword) return true;
    var k = keyword.toLowerCase().replace(/\s/g, '');
    var t = (text || '').toLowerCase().replace(/\s/g, '');
    return t.indexOf(k) !== -1;
  }
  function renderDropdown() {
    if (!searchDropdown || !searchHistoryList || !searchSuggestionsList) return;
    var keyword = (searchInput && searchInput.value) ? searchInput.value.trim() : '';
    var history = getHistory();
    var filteredHistory = keyword ? history.filter(function (h) { return fuzzyMatch(keyword, h); }) : history;
    var filteredSuggestions = keyword ? SUGGESTIONS.filter(function (s) { return fuzzyMatch(keyword, s); }) : SUGGESTIONS;

    searchHistoryList.innerHTML = '';
    if (filteredHistory.length) {
      filteredHistory.forEach(function (word) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = word;
        btn.addEventListener('click', function () {
          if (searchInput) searchInput.value = word;
          doSearch(word);
        });
        li.appendChild(btn);
        searchHistoryList.appendChild(li);
      });
    } else {
      var li = document.createElement('li');
      li.className = 'empty';
      li.textContent = history.length ? '无匹配历史' : '暂无历史搜索';
      searchHistoryList.appendChild(li);
    }

    searchSuggestionsList.innerHTML = '';
    if (filteredSuggestions.length) {
      filteredSuggestions.forEach(function (word) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = word;
        btn.addEventListener('click', function () {
          if (searchInput) searchInput.value = word;
          doSearch(word);
        });
        li.appendChild(btn);
        searchSuggestionsList.appendChild(li);
      });
    } else {
      var li = document.createElement('li');
      li.className = 'empty';
      li.textContent = '无匹配建议';
      searchSuggestionsList.appendChild(li);
    }

    var hasContent = filteredHistory.length > 0 || filteredSuggestions.length > 0 || (!keyword && (history.length > 0 || SUGGESTIONS.length > 0));
    if (hasContent) {
      searchDropdown.classList.add('is-visible');
      searchDropdown.setAttribute('aria-hidden', 'false');
    } else {
      searchDropdown.classList.remove('is-visible');
      searchDropdown.setAttribute('aria-hidden', 'true');
    }
  }
  function doSearch(word) {
    var w = (word || (searchInput && searchInput.value) || '').trim();
    if (w) saveToHistory(w);
    hideDropdown();
    if (searchInput) searchInput.value = w;
  }
  function showDropdown() { renderDropdown(); }
  function hideDropdown() {
    if (searchDropdown) {
      searchDropdown.classList.remove('is-visible');
      searchDropdown.setAttribute('aria-hidden', 'true');
    }
  }

  function openSearch() {
    if (!searchWrap || !searchInline || !searchInput) return;
    searchWrap.classList.add('is-expanded');
    searchInline.setAttribute('aria-hidden', 'false');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () {
      searchInput.focus();
      showDropdown();
    }, 80);
  }
  function closeSearch() {
    if (!searchWrap) return;
    searchWrap.classList.remove('is-expanded');
    if (searchInline) searchInline.setAttribute('aria-hidden', 'true');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
    hideDropdown();
    if (searchInput) searchInput.value = '';
  }
  if (searchWrap && searchBtn && searchInline) {
    searchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (searchWrap.classList.contains('is-expanded')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
    if (searchClose) {
      searchClose.addEventListener('click', function (e) {
        e.stopPropagation();
        closeSearch();
      });
    }
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        doSearch();
        closeSearch();
      });
    }
    if (searchInput) {
      searchInput.addEventListener('focus', showDropdown);
      searchInput.addEventListener('input', function () { renderDropdown(); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (searchWrap.classList.contains('is-expanded')) closeSearch();
      }
    });
    document.addEventListener('click', function (e) {
      if (!searchWrap.classList.contains('is-expanded')) return;
      var wrap = searchWrap;
      if (wrap && !wrap.contains(e.target)) {
        closeSearch();
      }
    });
  }

  // ---------- Hero 背景轮播（每 5.5s 切换，淡入淡出） ----------
  var heroSlides = document.querySelectorAll('.hero__bg-slide');
  if (heroSlides.length > 1) {
    var currentSlide = 0;
    setInterval(function () {
      heroSlides[currentSlide].setAttribute('data-active', 'false');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].setAttribute('data-active', 'true');
    }, 5500);
  }

  // ---------- 学校简介横向切换轮播 ----------
  var aboutTrack = document.getElementById('aboutTrack');
  var aboutPrev = document.getElementById('aboutPrev');
  var aboutNext = document.getElementById('aboutNext');
  var aboutDots = document.getElementById('aboutDots');
  var aboutTabs = document.getElementById('aboutTabs');
  if (aboutTrack && aboutDots) {
    var aboutSlides = aboutTrack.querySelectorAll('.about__slide');
    var aboutTotal = aboutSlides.length;
    var aboutIndex = 0;
    if (aboutSlides.length) {
      aboutSlides[0].classList.add('is-active');
    }
    function aboutSyncTabs() {
      if (!aboutTabs) return;
      var tabButtons = aboutTabs.querySelectorAll('.about__tab');
      tabButtons.forEach(function (btn, j) {
        btn.classList.toggle('is-active', j === aboutIndex);
        btn.setAttribute('aria-current', j === aboutIndex ? 'true' : 'false');
      });
    }
    function aboutGoTo(i) {
      aboutIndex = (i + aboutTotal) % aboutTotal;
      aboutTrack.style.transform = 'translateX(-' + aboutIndex * 100 + '%)';
      aboutSlides.forEach(function (slide, j) {
        slide.classList.toggle('is-active', j === aboutIndex);
      });
      var dots = aboutDots.querySelectorAll('button');
      dots.forEach(function (btn, j) {
        btn.classList.toggle('is-active', j === aboutIndex);
        btn.setAttribute('aria-current', j === aboutIndex ? 'true' : 'false');
      });
      aboutSyncTabs();
    }
    for (var d = 0; d < aboutTotal; d++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', '第' + (d + 1) + '项');
      btn.setAttribute('aria-current', d === 0 ? 'true' : 'false');
      if (d === 0) btn.classList.add('is-active');
      (function (idx) {
        btn.addEventListener('click', function () { aboutGoTo(idx); });
      })(d);
      aboutDots.appendChild(btn);
    }
    if (aboutPrev) aboutPrev.addEventListener('click', function () { aboutGoTo(aboutIndex - 1); });
    if (aboutNext) aboutNext.addEventListener('click', function () { aboutGoTo(aboutIndex + 1); });
    if (aboutTabs) {
      var aboutTabButtons = aboutTabs.querySelectorAll('.about__tab');
      aboutTabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idxAttr = btn.getAttribute('data-index');
          var idx = parseInt(idxAttr, 10);
          if (!isNaN(idx)) {
            aboutGoTo(idx);
          }
        });
      });
    }
  }

  // ---------- 导航栏滚动态 ----------
  function updateHeaderScroll() {
    if (!header) return;
    var scrollY = window.scrollY || window.pageYOffset;
    var heroHeight = Math.min(window.innerHeight * 0.7, 600);
    if (scrollY > heroHeight * 0.5) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  // ---------- 宣传图轮播：自动播放 + 指示点/箭头 ----------
  var heroEl = document.getElementById('hero');
  if (heroEl) {
    var bgSlides = heroEl.querySelectorAll('.hero__bg-slide');
    var contentSlides = heroEl.querySelectorAll('.hero__content-slide');
    var dots = heroEl.querySelectorAll('.hero__dot');
    var total = bgSlides.length;
    var current = 0;
    var HERO_INTERVAL = 5500;
    var heroTimer = null;

    function goToSlide(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      bgSlides.forEach(function (el, i) {
        el.setAttribute('data-active', i === current ? 'true' : 'false');
      });
      contentSlides.forEach(function (el, i) {
        el.setAttribute('data-active', i === current ? 'true' : 'false');
      });
      dots.forEach(function (el, i) {
        el.setAttribute('aria-current', i === current ? 'true' : null);
      });
    }

    function nextSlide() {
      goToSlide(current + 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      heroTimer = setInterval(nextSlide, HERO_INTERVAL);
    }
    function stopAutoPlay() {
      if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
        startAutoPlay();
      });
    });
    heroEl.addEventListener('mouseenter', stopAutoPlay);
    heroEl.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  // ---------- 移动端菜单 ----------
  function openMenu() {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMenu();
      else openMenu();
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // 移动端下拉菜单
  var mobileList = document.querySelector('.header__mobile-list');
  if (mobileList) {
    mobileList.querySelectorAll('.has-dropdown > a').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        // 阻止链接跳转
        e.preventDefault();
        var parent = toggle.parentElement;
        parent.classList.toggle('is-expanded');
      });
    });
  }

  // ---------- 进入视口动画（Intersection Observer），支持后续动态插入的 .reveal-item ----------
  var revealObserved = new Set();
  var revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.01 }
    );
  }
  function observeRevealItems() {
    if (!revealObserver) return;
    document.querySelectorAll('.reveal-item').forEach(function (el) {
      if (revealObserved.has(el)) return;
      revealObserved.add(el);
      revealObserver.observe(el);
    });
  }
  observeRevealItems();
  window.addEventListener('homepage:statsRendered', observeRevealItems);
  window.addEventListener('homepage:dynamicContentRendered', observeRevealItems);

  function observeStatNumbers() {
    var statNumbers = document.querySelectorAll('.stat-card__number[data-target]');
    if (!statNumbers.length || !('IntersectionObserver' in window)) return;
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target) || el.dataset.animated === 'true') return;
          el.dataset.animated = 'true';
          animateCount(el, 0, target, 1200);
        });
      },
      { rootMargin: '0px 0px -50px 0px', threshold: 0.2 }
    );
    statNumbers.forEach(function (el) {
      if (el.dataset.animated !== 'true') countObserver.observe(el);
    });
  }

  // ---------- 数字递增（CountUp）：初次 + 首页接口渲染后 ----------
  observeStatNumbers();
  window.addEventListener('homepage:statsRendered', observeStatNumbers);

  function animateCount(el, from, to, duration) {
    var start = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var easeOut = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(from + (to - from) * easeOut);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = to;
      }
    }
    requestAnimationFrame(step);
  }

  // 初始化登录状态检查
  checkLoginStatus();
})();
