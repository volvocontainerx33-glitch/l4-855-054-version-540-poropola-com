(function () {
  const form = document.querySelector('[data-site-search]');
  const input = document.querySelector('[data-site-search-input]');
  const results = document.querySelector('[data-search-results]');
  const empty = document.querySelector('[data-search-empty]');

  if (!form || !input || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    return;
  }

  const render = function (items) {
    results.innerHTML = items.map(function (item) {
      return [
        '<article class="movie-card" data-movie-card>',
        '  <a class="movie-cover" href="' + item.file + '" aria-label="' + item.title + '">',
        '    <img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
        '    <span class="score-badge">' + item.score + '</span>',
        '    <span class="play-badge">▶</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + item.file + '">' + item.title + '</a></h3>',
        '    <p>' + item.oneLine + '</p>',
        '    <div class="meta-row"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
        '    <div class="tag-row"><span>' + item.category + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');

    if (empty) {
      empty.classList.toggle('is-visible', items.length === 0);
    }
  };

  const search = function () {
    const q = input.value.trim().toLowerCase();
    const items = !q ? window.MOVIE_SEARCH_INDEX.slice(0, 24) : window.MOVIE_SEARCH_INDEX.filter(function (item) {
      return item.text.indexOf(q) !== -1;
    }).slice(0, 120);
    render(items);
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    search();
  });

  input.addEventListener('input', search);

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');

  if (q) {
    input.value = q;
  }

  search();
})();
