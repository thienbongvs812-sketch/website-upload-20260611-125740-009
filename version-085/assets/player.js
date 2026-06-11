(function () {
    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('[data-player]');

        if (!shell) {
            return;
        }

        var video = shell.querySelector('video');
        var layer = shell.querySelector('[data-play-button]');
        var started = false;

        if (!video) {
            return;
        }

        var safePlay = function () {
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        };

        var start = function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', source);
                }

                safePlay();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!started) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });

                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(source);
                    });
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        safePlay();
                    });
                    video._hls = hls;
                    started = true;
                }

                safePlay();
                return;
            }

            if (!video.getAttribute('src')) {
                video.setAttribute('src', source);
            }

            safePlay();
        };

        if (layer) {
            layer.addEventListener('click', start);
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video && video.paused) {
                start();
            }
        });
    };
})();
