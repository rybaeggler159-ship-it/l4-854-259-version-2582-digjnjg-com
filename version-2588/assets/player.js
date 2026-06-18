import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(card) {
  const video = card.querySelector('.js-hls-player');
  const button = card.querySelector('[data-player-button]');
  const status = card.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-src');
  let initialized = false;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (initialized || !source) {
      return;
    }

    initialized = true;
    setStatus('正在加载播放源');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成');
      });

      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载异常，可尝试刷新页面');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('播放源加载完成');
    } else {
      video.src = source;
      setStatus('浏览器将尝试直接播放');
    }
  }

  async function play() {
    initialize();
    try {
      await video.play();
      card.classList.add('is-playing');
      setStatus('正在播放');
    } catch (error) {
      card.classList.remove('is-playing');
      setStatus('请再次点击播放或检查浏览器自动播放设置');
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    card.classList.add('is-playing');
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    card.classList.remove('is-playing');
    setStatus('已暂停');
  });

  video.addEventListener('loadedmetadata', function () {
    setStatus('播放器准备就绪');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player-card]').forEach(setupPlayer);
