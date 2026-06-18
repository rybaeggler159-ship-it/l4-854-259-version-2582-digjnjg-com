(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var button = document.getElementById('play-button');
    if (!video || !source) return;

    var attached = false;
    var hlsInstance = null;

    function attachSource() {
      if (attached) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attachSource();
      if (cover) cover.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
      if (cover) cover.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };
})();
