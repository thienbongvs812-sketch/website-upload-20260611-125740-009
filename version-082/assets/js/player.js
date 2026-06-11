import { H as Hls } from './video-vendor-dru42stk.js';

function setupPlayer(shell) {
  const video = shell.querySelector('.js-hls-player');
  const startButton = shell.querySelector('.js-player-start');
  const status = shell.querySelector('.js-player-status');
  const source = video ? video.getAttribute('data-src') : '';
  let hls = null;
  let loaded = false;

  if (!video || !source) {
    if (status) {
      status.textContent = '未找到播放地址';
    }
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function loadSource() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;
    setStatus('正在加载高清片源…');

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('片源已就绪，点击画面可播放或暂停');
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在重试…');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在恢复…');
          hls.recoverMediaError();
        } else {
          setStatus('当前浏览器无法播放该片源');
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('片源已就绪，点击画面可播放或暂停');
    } else {
      setStatus('当前浏览器不支持 HLS 播放');
    }

    return Promise.resolve();
  }

  function play() {
    loadSource().then(function () {
      video.controls = true;
      video.play().then(function () {
        if (startButton) {
          startButton.classList.add('is-hidden');
        }
        setStatus('正在播放');
      }).catch(function () {
        setStatus('请再次点击播放按钮开始播放');
      });
    });
  }

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      play();
    } else {
      video.pause();
      setStatus('已暂停');
    }
  });

  video.addEventListener('play', function () {
    if (startButton) {
      startButton.classList.add('is-hidden');
    }
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    setStatus('已暂停');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('.player-shell').forEach(setupPlayer);
