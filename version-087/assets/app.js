(function () {
  var navToggle = document.querySelector('[data-mobile-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  var searchToggle = document.querySelector('[data-search-toggle]');
  var navSearch = document.querySelector('[data-nav-search]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  if (searchToggle && navSearch) {
    searchToggle.addEventListener('click', function () {
      navSearch.classList.toggle('is-open');
      var input = navSearch.querySelector('input');
      if (input) {
        input.focus();
      }
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var q = input ? input.value.trim() : '';
      if (q) {
        window.location.href = 'search.html?q=' + encodeURIComponent(q);
      }
    });
  });

  var slides = document.querySelectorAll('[data-hero-slide]');
  var dots = document.querySelectorAll('[data-hero-dot]');
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQ = params.get('q');

    if (initialQ && keywordInput) {
      keywordInput.value = initialQ;
    }

    function includeByValue(current, expected) {
      return !expected || current === expected;
    }

    function runFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = (!keyword || text.indexOf(keyword) !== -1)
          && includeByValue(cardYear, year)
          && includeByValue(cardRegion, region)
          && includeByValue(cardType, type);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', runFilter);
        item.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }

  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var playButton = document.querySelector('[data-play-button]');

  if (video && typeof currentMediaUrl !== 'undefined') {
    var hlsItem = null;

    function prepareVideo() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentMediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsItem = new window.Hls();
        hlsItem.loadSource(currentMediaUrl);
        hlsItem.attachMedia(video);
      } else {
        video.src = currentMediaUrl;
      }
      video.setAttribute('data-ready', '1');
    }

    function startVideo() {
      prepareVideo();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        startVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }
})();
