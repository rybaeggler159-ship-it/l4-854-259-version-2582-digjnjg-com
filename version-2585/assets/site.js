(function () {
  function initMenu() {
    var button = document.querySelector('.nav-toggle');
    if (!button) return;
    button.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dots button'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute('data-search-input');
      var scope = targetSelector ? document.querySelector(targetSelector) : document;
      if (!scope) return;
      var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
      var empty = scope.querySelector('.empty-state');

      function filterItems() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var haystack = item.getAttribute('data-search').toLowerCase();
          var matched = haystack.indexOf(value) !== -1;
          item.style.display = matched ? '' : 'none';
          if (matched) visible += 1;
        });
        if (empty) {
          empty.parentElement.classList.toggle('has-empty', visible === 0);
        }
      }

      input.addEventListener('input', filterItems);
      filterItems();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
