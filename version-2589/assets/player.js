(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (block) {
      var video = block.querySelector("video");
      var overlay = block.querySelector(".player-overlay");
      var source = block.getAttribute("data-m3u8");
      var hlsInstance = null;
      var started = false;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function start() {
        if (!video || !source) {
          return;
        }
        hideOverlay();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.getAttribute("src") !== source) {
            video.setAttribute("src", source);
          }
          video.play().catch(function () {});
          started = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
          started = true;
          return;
        }
        if (video.getAttribute("src") !== source) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {});
        started = true;
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
            return;
          }
          if (video.paused) {
            video.play().catch(function () {});
          }
        });
        video.addEventListener("play", hideOverlay);
      }
    });
  });
})();
