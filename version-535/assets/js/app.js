(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        showSlide(0);
        startHero();
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');

    function filterCards(value) {
        if (!filterList) {
            return;
        }

        var terms = value.toLowerCase().split(/\s+/).filter(Boolean);
        var items = Array.prototype.slice.call(filterList.children);

        items.forEach(function (item) {
            var text = ((item.getAttribute('data-search') || '') + ' ' + item.textContent).toLowerCase();
            var matched = terms.every(function (term) {
                return text.indexOf(term) !== -1;
            });

            item.classList.toggle('is-hidden', terms.length > 0 && !matched);
        });
    }

    if (filterInput) {
        if (query) {
            filterInput.value = query;
            filterCards(query);
        }

        filterInput.addEventListener('input', function () {
            filterCards(filterInput.value.trim());
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var hlsInstance = null;
        var mounted = false;
        var playButtons = Array.prototype.slice.call(player.querySelectorAll('[data-play-toggle]'));
        var muteButton = player.querySelector('[data-mute-toggle]');
        var fullscreenButton = player.querySelector('[data-fullscreen-toggle]');
        var playIcon = player.querySelector('.play-round span');

        function mountStream() {
            if (mounted || !stream) {
                return;
            }

            mounted = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = stream;
                    }
                });
                return;
            }

            video.src = stream;
        }

        function updateState() {
            player.classList.toggle('is-playing', !video.paused);

            playButtons.forEach(function (button) {
                if (!button.classList.contains('play-round')) {
                    button.textContent = video.paused ? '播放' : '暂停';
                }
            });

            if (playIcon) {
                playIcon.textContent = video.paused ? '▶' : 'Ⅱ';
            }

            if (muteButton) {
                muteButton.textContent = video.muted ? '取消静音' : '静音';
            }
        }

        function togglePlay(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            mountStream();

            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener('click', togglePlay);
        });

        video.addEventListener('click', togglePlay);
        video.addEventListener('play', updateState);
        video.addEventListener('pause', updateState);
        video.addEventListener('ended', updateState);

        if (muteButton) {
            muteButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                video.muted = !video.muted;
                updateState();
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }

        mountStream();
        updateState();
    });
})();
