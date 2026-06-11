(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                start();
            });
        });

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(index + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(index - 1);
                start();
            });
        }

        start();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('[data-movie-search]');
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-field]'));
    var sortSelect = document.querySelector('[data-sort]');
    var emptyState = document.querySelector('[data-empty-state]');
    var list = document.querySelector('[data-movie-list]');

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && searchInput) {
        searchInput.value = q;
    }

    var normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    var filterCards = function () {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var activeFilters = {};
        var visible = 0;

        filters.forEach(function (field) {
            if (field.value) {
                activeFilters[field.getAttribute('data-filter-field')] = normalize(field.value);
            }
        });

        cards.forEach(function (card) {
            var haystack = normalize(card.textContent + ' ' + (card.getAttribute('data-tags') || '') + ' ' + (card.getAttribute('data-title') || ''));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;

            Object.keys(activeFilters).forEach(function (key) {
                var value = normalize(card.getAttribute('data-' + key));
                if (value.indexOf(activeFilters[key]) === -1) {
                    matched = false;
                }
            });

            card.classList.toggle('is-hidden', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-active', visible === 0);
        }
    };

    var sortCards = function () {
        if (!sortSelect || !list) {
            return;
        }

        var value = sortSelect.value;
        var sorted = cards.slice();

        if (value === 'year-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            });
        }

        if (value === 'heat-desc') {
            sorted.sort(function (a, b) {
                return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
            });
        }

        if (value === 'title-asc') {
            sorted.sort(function (a, b) {
                return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
            });
        }

        sorted.forEach(function (card) {
            list.appendChild(card);
        });
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    filters.forEach(function (field) {
        field.addEventListener('change', filterCards);
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards();
            filterCards();
        });
    }

    if (cards.length) {
        filterCards();
    }
})();
