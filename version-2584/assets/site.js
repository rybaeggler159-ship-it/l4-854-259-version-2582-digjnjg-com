(() => {
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const showSlide = (nextIndex) => {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        const startTimer = () => {
            stopTimer();
            timer = window.setInterval(() => showSlide(index + 1), 5000);
        };

        const stopTimer = () => {
            if (timer) {
                window.clearInterval(timer);
            }
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot));
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                showSlide(index + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    const filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        const input = filterPanel.querySelector('[data-filter-input]');
        const type = filterPanel.querySelector('[data-type-filter]');
        const count = filterPanel.querySelector('[data-filter-count]');
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        const empty = document.querySelector('[data-empty-state]');

        const applyFilter = () => {
            const keyword = (input?.value || '').trim().toLowerCase();
            const typeValue = type?.value || '';
            let visible = 0;

            cards.forEach((card) => {
                const textMatch = !keyword || (card.dataset.search || '').includes(keyword);
                const typeMatch = !typeValue || card.dataset.type === typeValue;
                const shouldShow = textMatch && typeMatch;

                card.hidden = !shouldShow;

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `${visible} 部影片`;
            }

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        input?.addEventListener('input', applyFilter);
        type?.addEventListener('change', applyFilter);
        applyFilter();
    }

    const searchInput = document.querySelector('[data-global-search]');
    const searchResults = document.querySelector('[data-search-results]');
    const searchCount = document.querySelector('[data-search-count]');
    const searchEmpty = document.querySelector('[data-search-empty]');

    if (searchInput && searchResults && Array.isArray(window.MOVIES)) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        const createCard = (movie) => {
            const article = document.createElement('article');
            article.className = 'movie-card';
            article.innerHTML = `
                <a href="movies/${movie.id}.html" class="movie-card-link" aria-label="观看 ${escapeHtml(movie.title)}">
                    <div class="poster-frame">
                        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                        <span class="type-badge">${escapeHtml(movie.type)}</span>
                        <span class="play-hover" aria-hidden="true">▶</span>
                    </div>
                    <div class="movie-card-body">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p>${escapeHtml(movie.year)} · ${escapeHtml(movie.region)}</p>
                        <p class="movie-genre">${escapeHtml(movie.genre)}</p>
                    </div>
                </a>
            `;

            const image = article.querySelector('img');
            image.addEventListener('error', () => image.classList.add('is-missing'));

            return article;
        };

        const runSearch = () => {
            const keyword = searchInput.value.trim().toLowerCase();
            searchResults.innerHTML = '';

            if (!keyword) {
                if (searchCount) {
                    searchCount.textContent = '请输入关键词';
                }

                if (searchEmpty) {
                    searchEmpty.hidden = false;
                    searchEmpty.textContent = '请输入关键词开始搜索。';
                }

                return;
            }

            const matched = window.MOVIES
                .filter((movie) => movie.search.includes(keyword))
                .slice(0, 120);

            matched.forEach((movie) => searchResults.appendChild(createCard(movie)));

            if (searchCount) {
                searchCount.textContent = `${matched.length} 个结果`;
            }

            if (searchEmpty) {
                searchEmpty.hidden = matched.length !== 0;
                searchEmpty.textContent = '没有找到匹配的影片，请尝试更换关键词。';
            }
        };

        searchInput.addEventListener('input', runSearch);
        runSearch();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
})();
