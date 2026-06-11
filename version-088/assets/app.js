(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@latest";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var category = panel.querySelector("[data-filter-category]");
      var year = panel.querySelector("[data-filter-year]");
      var list = panel.parentElement.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var categoryValue = normalize(category ? category.value : "");
        var yearValue = normalize(year ? year.value : "");
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.textContent
          ].join(" "));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesCategory && matchesYear));
        });
      }

      [input, category, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q");
      if (queryFromUrl && input) {
        input.value = queryFromUrl;
      }
      apply();
    });
  }

  function loadHls(callback, fail) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback);
      existing.addEventListener("error", fail);
      return;
    }
    var script = document.createElement("script");
    script.src = hlsUrl;
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback);
    script.addEventListener("error", fail);
    document.head.appendChild(script);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var source = video ? video.getAttribute("data-m3u8") : "";
      var buttons = Array.prototype.slice.call(player.querySelectorAll("[data-play-button]"));
      var mute = player.querySelector("[data-mute-button]");
      var fullscreen = player.querySelector("[data-fullscreen-button]");
      var state = player.querySelector("[data-player-state]");
      var attached = false;
      var hlsInstance = null;

      function setState(text) {
        if (state) {
          state.textContent = text;
        }
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setState("点击后播放");
          });
        }
      }

      function attach(playAfterAttach) {
        if (!video || !source) {
          setState("暂无播放源");
          return;
        }
        if (attached) {
          if (playAfterAttach) {
            playVideo();
          }
          return;
        }
        attached = true;
        setState("正在载入");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            setState("可以播放");
            if (playAfterAttach) {
              playVideo();
            }
          }, { once: true });
          return;
        }

        loadHls(function () {
          if (!window.Hls || !window.Hls.isSupported()) {
            setState("浏览器暂不支持");
            return;
          }
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setState("可以播放");
            if (playAfterAttach) {
              playVideo();
            }
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setState("网络重连中");
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setState("正在恢复播放");
              hlsInstance.recoverMediaError();
            } else {
              setState("播放失败");
              hlsInstance.destroy();
            }
          });
        }, function () {
          setState("播放组件载入失败");
        });
      }

      function toggle() {
        if (!video) {
          return;
        }
        if (!attached) {
          attach(true);
          return;
        }
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        });
      });
      if (video) {
        video.addEventListener("click", toggle);
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
          setState("正在播放");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
          setState("已暂停");
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
          setState("播放结束");
        });
      }
      if (mute) {
        mute.addEventListener("click", function () {
          if (!video) {
            return;
          }
          video.muted = !video.muted;
          mute.textContent = video.muted ? "取消静音" : "静音";
        });
      }
      if (fullscreen) {
        fullscreen.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
