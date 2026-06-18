(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('.hero-slide', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        restart();
    }

    function setupRails() {
        selectAll('.rail-section').forEach(function (section) {
            var rail = section.querySelector('[data-rail]');
            var left = section.querySelector('[data-rail-left]');
            var right = section.querySelector('[data-rail-right]');
            if (!rail) {
                return;
            }
            if (left) {
                left.addEventListener('click', function () {
                    rail.scrollBy({ left: -420, behavior: 'smooth' });
                });
            }
            if (right) {
                right.addEventListener('click', function () {
                    rail.scrollBy({ left: 420, behavior: 'smooth' });
                });
            }
        });
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = selectAll('[data-meta]', list);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input.hasAttribute('data-query-sync') && query) {
            input.value = query;
        }

        function apply() {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var meta = (card.getAttribute('data-meta') || '').toLowerCase();
                card.classList.toggle('is-hidden', Boolean(value) && meta.indexOf(value) === -1);
            });
        }

        input.addEventListener('input', apply);
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupRails();
        setupFilters();
    });
})();
