(function () {
    'use strict';

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMobileMenu() {
        var button = qs('.js-menu-toggle');
        var nav = qs('.js-mobile-nav');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.hidden = !nav.hidden;
            button.textContent = nav.hidden ? '☰' : '×';
        });
    }

    function initHero() {
        var root = qs('.js-hero-carousel');

        if (!root) {
            return;
        }

        var slides = qsa('.hero-slide', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

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

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function initGlobalSearch() {
        qsa('.js-global-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);

                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
            });
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '    <a class="poster-wrap" href="vod/' + escapeHtml(movie.id) + '.html">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="play-float">▶</span>',
            '        <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '    </a>',
            '    <div class="card-body">',
            '        <a class="card-title" href="vod/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '        <div class="meta-row">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <a href="category/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var panel = qs('[data-search-page]');

        if (!panel || !window.MOVIES) {
            return;
        }

        var input = qs('.js-search-input', panel);
        var region = qs('.js-filter-region', panel);
        var type = qs('.js-filter-type', panel);
        var year = qs('.js-filter-year', panel);
        var category = qs('.js-filter-category', panel);
        var resultCount = qs('.js-result-count', panel);
        var results = qs('.js-search-results', panel);
        var reset = qs('.js-reset-search', panel);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input) {
            input.value = query;
        }

        function filterMovies() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var categoryValue = normalize(category && category.value);

            var filtered = window.MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(' '),
                    movie.category
                ].join(' '));

                return (!keyword || haystack.indexOf(keyword) !== -1)
                    && (!regionValue || normalize(movie.region) === regionValue)
                    && (!typeValue || normalize(movie.type) === typeValue)
                    && (!yearValue || normalize(movie.year) === yearValue)
                    && (!categoryValue || normalize(movie.category) === categoryValue);
            });

            if (resultCount) {
                resultCount.textContent = '找到 ' + filtered.length + ' 部影片';
            }

            if (results) {
                results.innerHTML = filtered.slice(0, 400).map(movieCard).join('');
                if (filtered.length > 400) {
                    results.insertAdjacentHTML('beforeend', '<div class="toolbar-line"><strong>结果较多，已展示前 400 部，请继续输入关键词缩小范围。</strong></div>');
                }
            }
        }

        [input, region, type, year, category].forEach(function (element) {
            if (!element) {
                return;
            }

            element.addEventListener('input', filterMovies);
            element.addEventListener('change', filterMovies);
        });

        if (reset) {
            reset.addEventListener('click', function () {
                [input, region, type, year, category].forEach(function (element) {
                    if (element) {
                        element.value = '';
                    }
                });
                filterMovies();
            });
        }

        filterMovies();
    }

    function initPlayers() {
        qsa('.js-movie-player').forEach(function (video) {
            var shell = video.closest('.player-shell');
            var start = shell ? qs('.js-player-start', shell) : null;
            var message = shell ? qs('.js-player-message', shell) : null;
            var loaded = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.hidden = false;
            }

            function attachSource() {
                var url = video.getAttribute('data-video');

                if (!url) {
                    showMessage('当前播放源为空。');
                    return;
                }

                if (loaded) {
                    return;
                }

                loaded = true;

                if (/\.m3u8(\?|$)/i.test(url)) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                    } else {
                        showMessage('当前浏览器暂不支持 HLS 播放，请更换支持 HLS 的浏览器。');
                    }
                } else {
                    video.src = url;
                }
            }

            function play() {
                attachSource();
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        showMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
                    });
                }

                if (start) {
                    start.hidden = true;
                }
            }

            if (start) {
                start.addEventListener('click', play);
            }

            video.addEventListener('play', function () {
                if (start) {
                    start.hidden = true;
                }
            });

            video.addEventListener('pause', function () {
                if (start && video.currentTime === 0) {
                    start.hidden = false;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initGlobalSearch();
        initSearchPage();
        initPlayers();
    });
}());
