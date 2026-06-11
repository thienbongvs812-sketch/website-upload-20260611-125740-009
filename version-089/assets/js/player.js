(function () {
  var hlsPromise = null;
  function loadHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (hlsPromise) return hlsPromise;
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = function () { resolve(window.Hls); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }
  function attach(video, url) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }
    return loadHls().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    }).catch(function () {
      video.src = url;
    });
  }
  document.querySelectorAll('[data-player]').forEach(function (box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('[data-play-button]');
    var status = box.querySelector('[data-player-status]');
    var url = box.getAttribute('data-play-url');
    var ready = false;
    if (!video || !url) return;
    function message(text) {
      if (status) status.textContent = text || '';
    }
    function play() {
      message('正在加载影片...');
      var wait = ready ? Promise.resolve() : attach(video, url).then(function () { ready = true; });
      wait.then(function () {
        if (cover) cover.classList.add('is-hidden');
        return video.play();
      }).then(function () {
        message('');
      }).catch(function () {
        message('播放加载失败，请稍后重试');
        if (cover) cover.classList.remove('is-hidden');
      });
    }
    if (cover) cover.addEventListener('click', play);
    video.addEventListener('play', function () {
      if (cover) cover.classList.add('is-hidden');
    });
    video.addEventListener('error', function () {
      message('播放加载失败，请稍后重试');
      if (cover) cover.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (video._hls) video._hls.destroy();
    });
  });
})();
