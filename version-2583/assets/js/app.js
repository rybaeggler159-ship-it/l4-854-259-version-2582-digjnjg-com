(function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('mobileNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }
})();

(function () {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            show(Number(dot.getAttribute('data-hero-dot')) || 0);
            start();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            show(current + 1);
            start();
        });
    }

    show(0);
    start();
})();

(function () {
    var input = document.getElementById('siteSearch');
    var yearFilter = document.getElementById('yearFilter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!input && !yearFilter) {
        return;
    }

    function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearFilter ? yearFilter.value : '';
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear));
        });
    }

    if (input) {
        input.addEventListener('input', applyFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilter);
    }
})();

(function () {
    var wrap = document.querySelector('[data-player]');
    if (!wrap) {
        return;
    }
    var video = wrap.querySelector('video');
    var overlay = wrap.querySelector('.player-overlay');
    var payloadNode = document.getElementById('movie-player-data');
    var payload = {};
    try {
        payload = JSON.parse(payloadNode ? payloadNode.textContent : '{}');
    } catch (error) {
        payload = {};
    }
    var src = payload.src || '';
    var ready = false;

    function begin() {
        if (!video || !src) {
            return;
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', src);
            }
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!ready) {
                var hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
                ready = true;
            }
            video.play().catch(function () {});
            return;
        }
        if (!video.getAttribute('src')) {
            video.setAttribute('src', src);
        }
        video.play().catch(function () {});
    }

    if (overlay) {
        overlay.addEventListener('click', begin);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
    }
})();
