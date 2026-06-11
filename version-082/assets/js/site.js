(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('.poster-shell img, .hero-slide__image').forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.poster-shell');
        if (shell) {
          shell.classList.add('is-missing');
        }
      });
    });
  }

  function setupCarousel() {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
      var prev = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      var current = 0;
      var timer = null;

      if (slides.length <= 1) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function setupLocalFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.closest('main') || document;
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      var counter = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var emptyState = scope.querySelector('[data-empty-state]');

      function applyFilters() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
        var activeFilters = {};
        var visibleCount = 0;

        selects.forEach(function (select) {
          if (select.value) {
            activeFilters[select.getAttribute('data-filter-select')] = select.value;
          }
        });

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-category'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesSelects = Object.keys(activeFilters).every(function (name) {
            return card.getAttribute('data-' + name) === activeFilters[name];
          });
          var isVisible = matchesKeyword && matchesSelects;

          card.style.display = isVisible ? '' : 'none';
          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = '当前显示 ' + visibleCount + ' 部';
        }
        if (emptyState) {
          emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
      }

      if (keywordInput) {
        keywordInput.addEventListener('input', applyFilters);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', applyFilters);
      });
      applyFilters();
    });
  }

  function readQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root) {
      return;
    }

    var dataUrl = root.getAttribute('data-index-url');
    var keywordInput = root.querySelector('[data-search-input]');
    var typeSelect = root.querySelector('[data-search-type]');
    var regionSelect = root.querySelector('[data-search-region]');
    var resultCount = root.querySelector('[data-search-count]');
    var resultList = root.querySelector('[data-search-results]');
    var template = root.querySelector('[data-result-template]');
    var movies = [];

    keywordInput.value = readQuery('q');
    if (typeSelect && readQuery('type')) {
      typeSelect.value = readQuery('type');
    }
    if (regionSelect && readQuery('region')) {
      regionSelect.value = readQuery('region');
    }

    function createResult(movie) {
      var node = template.content.firstElementChild.cloneNode(true);
      var link = node.querySelector('a');
      var image = node.querySelector('img');
      var title = node.querySelector('[data-result-title]');
      var desc = node.querySelector('[data-result-desc]');
      var meta = node.querySelector('[data-result-meta]');

      link.href = movie.url;
      image.src = movie.cover;
      image.alt = movie.title;
      title.textContent = movie.title;
      desc.textContent = movie.one_line;
      meta.textContent = [movie.year, movie.region_group, movie.category, movie.type_group].join(' · ');
      return node;
    }

    function render() {
      var keyword = keywordInput.value.trim().toLowerCase();
      var type = typeSelect.value;
      var region = regionSelect.value;
      var matches = movies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.one_line,
          movie.category,
          movie.genre,
          movie.region,
          movie.region_group,
          movie.type_group,
          movie.year,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!type || movie.type_group === type) &&
          (!region || movie.region_group === region);
      }).slice(0, 120);

      resultList.innerHTML = '';
      matches.forEach(function (movie) {
        resultList.appendChild(createResult(movie));
      });
      resultCount.textContent = '找到 ' + matches.length + ' 条结果，最多显示前 120 条';
    }

    fetch(dataUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        movies = data;
        render();
      })
      .catch(function () {
        resultCount.textContent = '搜索索引加载失败，请直接浏览分类或片库。';
      });

    [keywordInput, typeSelect, regionSelect].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
  }

  ready(function () {
    setupMobileNav();
    setupImageFallbacks();
    setupCarousel();
    setupLocalFilters();
    setupSearchPage();
  });
})();
