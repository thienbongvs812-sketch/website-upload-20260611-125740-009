function setupMobileMenu() {
  var button = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (!slides.length) {
    return;
  }
  var current = 0;
  var timer = null;

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
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
  }

  start();
}

function setupSearch() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  inputs.forEach(function (input) {
    var selector = input.getAttribute('data-target') || '.movie-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-meta') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered', keyword && text.indexOf(keyword) === -1);
      });
    });
  });
}

function setupImageState() {
  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });
}

function setupPlayer() {
  var video = document.querySelector('[data-player]');
  var gate = document.querySelector('[data-play-gate]');
  var message = document.querySelector('[data-player-message]');
  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var loaded = false;
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function requestPlay() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setMessage('点击视频区域继续播放');
      });
    }
  }

  function start() {
    if (!stream) {
      setMessage('播放加载失败，请稍后再试');
      return;
    }

    if (gate) {
      gate.classList.add('is-hidden');
    }

    if (loaded) {
      requestPlay();
      return;
    }

    loaded = true;
    setMessage('');

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        requestPlay();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放加载失败，请稍后再试');
        }
      });
      return;
    }

    video.src = stream;
    video.load();
    requestPlay();
  }

  if (gate) {
    gate.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!loaded) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHero();
  setupSearch();
  setupImageState();
  setupPlayer();
});
