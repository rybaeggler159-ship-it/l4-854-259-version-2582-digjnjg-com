(function () {
  var panels = document.querySelectorAll('[data-player]');

  panels.forEach(function (panel) {
    var video = panel.querySelector('video');
    var button = panel.querySelector('[data-play-button]');
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready || !video) {
        return;
      }
      var source = video.getAttribute('data-src');
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      prepare();
      panel.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          panel.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        panel.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
