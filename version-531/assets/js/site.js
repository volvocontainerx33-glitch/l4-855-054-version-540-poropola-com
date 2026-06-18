(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function fillSelect(select, cards, attr) {
    var values = [];

    cards.forEach(function (card) {
      var value = card.getAttribute('data-' + attr);

      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initListingTools() {
    var tools = document.querySelector('[data-listing-tools]');
    var list = document.querySelector('[data-movie-list]');

    if (!tools || !list) {
      return;
    }

    var input = tools.querySelector('.movie-search');
    var selects = Array.prototype.slice.call(tools.querySelectorAll('[data-filter]'));
    var clear = tools.querySelector('[data-clear-filters]');
    var empty = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-role="movie-card"]'));
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get('q');

    selects.forEach(function (select) {
      fillSelect(select, cards, select.getAttribute('data-filter'));
    });

    if (incoming && input) {
      input.value = incoming;
    }

    function normalize(text) {
      return String(text || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));

        var matched = !keyword || haystack.indexOf(keyword) > -1;

        selects.forEach(function (select) {
          var attr = select.getAttribute('data-filter');
          var value = select.value;

          if (value && card.getAttribute('data-' + attr) !== value) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        selects.forEach(function (select) {
          select.value = '';
        });

        apply();
      });
    }

    apply();
  }

  initHero();
  initListingTools();
})();
