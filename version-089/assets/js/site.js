(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;
    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
    if (next) next.addEventListener('click', function () { show(current + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var keyword = form.querySelector('[data-keyword]');
    var year = form.querySelector('[data-year]');
    var region = form.querySelector('[data-region]');
    var type = form.querySelector('[data-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResult = document.querySelector('[data-no-result]');
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) keyword.value = params.get('q');
    if (year && params.get('year')) year.value = params.get('year');
    if (region && params.get('region')) region.value = params.get('region');
    if (type && params.get('type')) type.value = params.get('type');
    function value(el) {
      return el ? String(el.value || '').trim().toLowerCase() : '';
    }
    function apply() {
      var q = value(keyword);
      var y = value(year);
      var r = value(region);
      var t = value(type);
      var shown = 0;
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = true;
        if (q && hay.indexOf(q) === -1) ok = false;
        if (y && String(card.dataset.year || '').toLowerCase() !== y) ok = false;
        if (r && String(card.dataset.region || '').toLowerCase() !== r) ok = false;
        if (t && String(card.dataset.type || '').toLowerCase() !== t) ok = false;
        card.classList.toggle('hidden-card', !ok);
        if (ok) shown += 1;
      });
      if (noResult) noResult.classList.toggle('is-visible', shown === 0);
    }
    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, apply);
    });
    form.addEventListener('submit', function (event) {
      if (cards.length) event.preventDefault();
      apply();
    });
    apply();
  });
})();
