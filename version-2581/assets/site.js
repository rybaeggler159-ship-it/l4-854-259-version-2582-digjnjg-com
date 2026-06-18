(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  function initCarousel() {
    var carousel = $('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('[data-slide]', carousel);
    var dots = $all('[data-carousel-dot]', carousel);
    var prev = $('[data-carousel-prev]', carousel);
    var next = $('[data-carousel-next]', carousel);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPageFilter() {
    var input = $('[data-filter-input]');
    var select = $('[data-filter-select]');
    var cards = $all('[data-filter-card]');
    var note = $('[data-filter-note]');
    var empty = $('[data-empty-state]');
    if (!cards.length || (!input && !select)) {
      return;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var selected = select ? select.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var group = card.getAttribute('data-filter-group') || '';
        var ok = (!q || haystack.indexOf(q) !== -1) && (!selected || group.indexOf(selected) !== -1);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (note) {
        note.textContent = '当前显示 ' + shown + ' 部内容';
      }
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initPlayers() {
    $all('[data-player]').forEach(function (shell) {
      var video = $('video', shell);
      var button = $('[data-player-start]', shell);
      var status = $('[data-player-status]', shell);
      var source = shell.getAttribute('data-hls-src');
      var initialized = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function playVideo() {
        if (!video || !source) {
          return;
        }
        shell.classList.add('is-playing');
        setStatus('正在加载');

        function attemptPlay() {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              setStatus('点击播放器继续播放');
            });
          }
        }

        if (initialized) {
          attemptPlay();
          return;
        }
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', attemptPlay, { once: true });
          video.addEventListener('playing', function () {
            setStatus('');
          });
          video.load();
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('');
              attemptPlay();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('播放加载失败');
                if (hlsInstance) {
                  hlsInstance.destroy();
                }
              }
            });
          } else {
            video.src = source;
            video.addEventListener('loadedmetadata', attemptPlay, { once: true });
            video.load();
          }
        });
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video && initialized) {
          return;
        }
        playVideo();
      });
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
    });
  }

  function createResultCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card';
    article.setAttribute('data-filter-card', 'true');
    article.setAttribute('data-filter-text', [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' '));
    article.setAttribute('data-filter-group', movie.type + ' ' + movie.region);
    article.innerHTML = [
      '<a href="' + movie.url + '">',
      '<div class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-badge">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>',
      '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '</div>',
      '</a>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearchPage() {
    var root = $('[data-search-page]');
    if (!root || !window.MOVIE_DATA) {
      return;
    }
    var input = $('[data-search-input]', root);
    var typeSelect = $('[data-search-type]', root);
    var regionSelect = $('[data-search-region]', root);
    var results = $('[data-search-results]', root);
    var note = $('[data-search-note]', root);
    var limit = 80;

    function optionsFrom(key) {
      var map = {};
      window.MOVIE_DATA.forEach(function (movie) {
        if (movie[key]) {
          map[movie[key]] = true;
        }
      });
      return Object.keys(map).sort();
    }

    function fillSelect(select, values, label) {
      if (!select) {
        return;
      }
      select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
        return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
      }).join('');
    }

    fillSelect(typeSelect, optionsFrom('type').slice(0, 80), '全部类型');
    fillSelect(regionSelect, optionsFrom('region').slice(0, 120), '全部地区');

    function render() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var matched = window.MOVIE_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!type || movie.type === type) && (!region || movie.region === region);
      });
      results.innerHTML = '';
      matched.slice(0, limit).forEach(function (movie) {
        results.appendChild(createResultCard(movie));
      });
      if (note) {
        var suffix = matched.length > limit ? '，已显示前 ' + limit + ' 部' : '';
        note.textContent = '找到 ' + matched.length + ' 部内容' + suffix;
      }
    }

    [input, typeSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', render);
        node.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCarousel();
    initPageFilter();
    initPlayers();
    initSearchPage();
  });
}());
