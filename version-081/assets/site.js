(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCatalog() {
    var catalog = document.querySelector('[data-catalog]');
    if (!catalog) {
      return;
    }

    var searchInput = catalog.querySelector('[data-search-input]');
    var categoryFilter = catalog.querySelector('[data-category-filter]');
    var typeFilter = catalog.querySelector('[data-type-filter]');
    var sortSelect = catalog.querySelector('[data-sort-select]');
    var list = catalog.querySelector('[data-card-list]');
    var resultTitle = catalog.querySelector('[data-result-title]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    if (params.get('keyword') && searchInput) {
      searchInput.value = params.get('keyword');
    }

    if (params.get('category') && categoryFilter) {
      categoryFilter.value = params.get('category');
    }

    function getValue(el, name) {
      return (el.getAttribute(name) || '').toLowerCase();
    }

    function apply() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categoryFilter ? categoryFilter.value : 'all';
      var type = typeFilter ? typeFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = getValue(card, 'data-search');
        var cardCategory = card.getAttribute('data-category') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = category === 'all' || cardCategory === category;
        var matchedType = type === 'all' || cardType === type;
        var matched = matchedKeyword && matchedCategory && matchedType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (resultTitle) {
        resultTitle.textContent = visible ? '片库结果' : '未找到匹配影片';
      }
    }

    function sortCards() {
      if (!list || !sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'title') {
          return getValue(a, 'data-title').localeCompare(getValue(b, 'data-title'), 'zh-Hans-CN');
        }

        if (mode === 'hot') {
          return Number(b.getAttribute('data-hot')) - Number(a.getAttribute('data-hot'));
        }

        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    [searchInput, categoryFilter, typeFilter].forEach(function (field) {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    sortCards();
  }

  window.MovieSite = {
    mountPlayer: function (options) {
      var video = document.getElementById(options.videoId);
      var overlay = document.getElementById(options.overlayId);
      var src = options.src;
      var hls = null;
      var started = false;

      if (!video || !src) {
        return;
      }

      function prepare() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          return;
        }

        video.src = src;
      }

      function start() {
        if (started) {
          return;
        }

        started = true;
        prepare();

        if (overlay) {
          overlay.hidden = true;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  setupHero();
  setupCatalog();
})();
