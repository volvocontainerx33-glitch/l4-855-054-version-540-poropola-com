(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-empty');
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  const filterPanels = document.querySelectorAll('[data-filter-panel]');

  filterPanels.forEach(function (panel) {
    const input = panel.querySelector('[data-filter-text]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const scope = document.querySelector(panel.getAttribute('data-filter-scope'));
    const empty = document.querySelector(panel.getAttribute('data-filter-empty'));

    if (!scope) {
      return;
    }

    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

    const apply = function () {
      const q = input ? input.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const okText = !q || haystack.indexOf(q) !== -1;
        const okYear = !yearValue || card.dataset.year === yearValue;
        const okType = !typeValue || card.dataset.type === typeValue;
        const ok = okText && okYear && okType;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });

    const button = panel.querySelector('button');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        apply();
      });
    }
  });
})();
