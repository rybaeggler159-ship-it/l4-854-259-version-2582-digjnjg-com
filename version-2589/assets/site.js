(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menuPanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && menuPanel) {
      menuButton.addEventListener("click", function () {
        var open = menuPanel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var target = input.getAttribute("data-filter-input");
      var scope = target ? document.querySelector(target) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-search]")) : [];
      var empty = scope ? scope.querySelector("[data-empty]") : null;

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      var query = new URLSearchParams(window.location.search).get("q");
      if (query && input.hasAttribute("data-query-fill")) {
        input.value = query;
      }
      applyFilter();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
          dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
        });
      };

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      show(0);
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });
})();
