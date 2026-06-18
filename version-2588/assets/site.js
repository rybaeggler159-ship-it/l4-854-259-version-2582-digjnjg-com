(function () {
  'use strict';

  var rootPrefix = document.body ? document.body.getAttribute('data-root-prefix') || '' : '';

  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initHeader() {
    var header = qs('[data-header]');
    var button = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    function syncHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (!button || !mobileNav) {
      return;
    }

    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });
  }

  function initHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initCatalogFilters() {
    var toolbar = qs('[data-catalog-toolbar]');
    var grid = qs('[data-catalog-grid]');
    if (!toolbar || !grid) {
      return;
    }

    var searchInput = qs('[data-filter-search]', toolbar);
    var yearSelect = qs('[data-filter-year]', toolbar);
    var sortSelect = qs('[data-sort]', toolbar);
    var visibleCount = qs('[data-visible-count]', toolbar);
    var emptyState = qs('[data-empty-state]');
    var cards = qsa('.movie-card', grid);

    function yearMatches(card, value) {
      if (!value) {
        return true;
      }
      var yearNumber = Number(card.getAttribute('data-year-number') || 0);
      if (value === 'classic') {
        return yearNumber > 0 && yearNumber < 2021;
      }
      return String(card.getAttribute('data-year') || '').indexOf(value) !== -1;
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = (!keyword || haystack.indexOf(keyword) !== -1) && yearMatches(card, year);
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(shown);
      }
      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    function applySort() {
      var value = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        if (value === 'score-desc') {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        }
        if (value === 'year-desc') {
          return Number(b.getAttribute('data-year-number') || 0) - Number(a.getAttribute('data-year-number') || 0);
        }
        if (value === 'year-asc') {
          return Number(a.getAttribute('data-year-number') || 0) - Number(b.getAttribute('data-year-number') || 0);
        }
        if (value === 'title-asc') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilters();
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilters);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }
    applyFilters();
  }

  function movieResultCard(movie) {
    var image = rootPrefix + movie.image + '.jpg';
    var href = rootPrefix + 'movies/' + movie.id + '.html';
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + href + '">',
      '    <div class="poster-wrap">',
      '      <img class="poster-img" src="' + image + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
      '      <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-play">播放</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="card-title-row"><h3>' + escapeHtml(movie.title) + '</h3><strong>' + escapeHtml(movie.score) + '</strong></div>',
      '      <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var input = qs('[data-search-page-input]');
    var typeSelect = qs('[data-search-page-type]');
    var yearSelect = qs('[data-search-page-year]');
    var results = qs('[data-search-results]');
    var count = qs('[data-search-count]');
    var movies = window.__MOVIES__ || [];

    if (!input || !results || !Array.isArray(movies)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
    }

    function matchesYear(movie, value) {
      if (!value) {
        return true;
      }
      if (value === 'classic') {
        return Number(movie.yearNumber || 0) > 0 && Number(movie.yearNumber || 0) < 2021;
      }
      return String(movie.year || '').indexOf(value) !== -1;
    }

    function render() {
      var keyword = normalize(input.value);
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var yearValue = yearSelect ? yearSelect.value : '';
      var filtered = movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var typeOk = !typeValue || normalize(movie.type + ' ' + movie.genre).indexOf(typeValue) !== -1;
        var yearOk = matchesYear(movie, yearValue);
        return keywordOk && typeOk && yearOk;
      });

      if (count) {
        count.textContent = String(filtered.length);
      }
      results.innerHTML = filtered.slice(0, 160).map(movieResultCard).join('') || '<p class="empty-state">暂无匹配影片，请更换关键词。</p>';
    }

    input.addEventListener('input', render);
    if (typeSelect) {
      typeSelect.addEventListener('change', render);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHeroCarousel();
    initCatalogFilters();
    initSearchPage();
  });
}());
