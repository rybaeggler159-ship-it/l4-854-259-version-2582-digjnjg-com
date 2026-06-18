(function () {
  var toggles = document.querySelectorAll('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  toggles.forEach(function (button) {
    button.addEventListener('click', function () {
      if (panel) {
        panel.classList.toggle('is-open');
      }
    });
  });

  var inputs = document.querySelectorAll('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch(value) {
    var keyword = normalize(value);
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
    });
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      inputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      applySearch(input.value);
    });
  });

  var chips = document.querySelectorAll('[data-filter-chip]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var isActive = chip.classList.contains('is-active');
      chips.forEach(function (item) {
        item.classList.remove('is-active');
      });
      var value = isActive ? '' : chip.getAttribute('data-filter-chip');
      if (!isActive) {
        chip.classList.add('is-active');
      }
      inputs.forEach(function (input) {
        input.value = value;
      });
      applySearch(value);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;
  var timer = null;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(current);
      startHero();
    });
  });

  startHero();
})();
