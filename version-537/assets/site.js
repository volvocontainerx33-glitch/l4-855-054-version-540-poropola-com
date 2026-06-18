(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var button = $('[data-mobile-menu-button]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', nav.classList.contains('is-open'));
    });
  }

  function initHero() {
    var carousel = $('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
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
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFiltering() {
    var input = $('[data-filter-input]');
    var list = $('[data-card-list]');
    var empty = $('[data-empty-state]');
    if (!input || !list) {
      return;
    }
    var cards = $all('[data-movie-card]', list);
    function apply() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.category
        ].join(' '));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    input.addEventListener('input', apply);
    apply();

    $all('[data-view-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        $all('[data-view-button]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        list.classList.toggle('is-list', button.dataset.viewButton === 'list');
      });
    });
  }

  function initSearchPage() {
    var page = $('[data-search-page]');
    if (!page || !window.movieIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = $('[data-search-input]', page);
    var summary = $('[data-search-summary]', page);
    var results = $('[data-search-results]', page);
    if (input) {
      input.value = query;
    }

    function render(items) {
      results.innerHTML = items.map(function (item) {
        return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
          '<span class="card-cover">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="card-region">' + escapeHtml(item.region) + '</span>' +
            '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
            '<span class="card-play">▶</span>' +
          '</span>' +
          '<span class="card-body">' +
            '<span class="card-title">' + escapeHtml(item.title) + '</span>' +
            '<span class="card-desc">' + escapeHtml(item.oneLine) + '</span>' +
            '<span class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></span>' +
          '</span>' +
        '</a>';
      }).join('');
    }

    var keyword = normalize(query);
    if (!keyword) {
      summary.textContent = '请输入关键词开始搜索。';
      render(window.movieIndex.slice(0, 24));
      return;
    }

    var matched = window.movieIndex.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' '));
      return haystack.indexOf(keyword) !== -1;
    });
    summary.textContent = matched.length ? '搜索结果：' + query : '没有找到匹配内容：' + query;
    render(matched.slice(0, 120));
  }

  function initPlayer() {
    var player = $('[data-player]');
    if (!player) {
      return;
    }
    var video = $('video', player);
    var overlay = $('[data-player-overlay]', player);
    var hlsSrc = player.dataset.hlsSrc || '';
    var mp4Src = player.dataset.videoSrc || '';
    var hlsInstance = null;
    var sourceReady = false;

    function setMp4Source() {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      if (mp4Src && video.src !== mp4Src) {
        video.src = mp4Src;
      }
      sourceReady = true;
    }

    function attachSource() {
      if (sourceReady) {
        return;
      }
      if (hlsSrc && hlsSrc.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(hlsSrc);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          sourceReady = true;
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMp4Source();
          }
        });
        window.setTimeout(function () {
          if (!video.readyState && mp4Src) {
            setMp4Source();
          }
        }, 3500);
        return;
      }
      if (hlsSrc && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
        sourceReady = true;
        return;
      }
      setMp4Source();
    }

    function updateState() {
      player.classList.toggle('is-playing', !video.paused);
      player.classList.toggle('is-paused', video.paused);
      $all('[data-play-button]', player).forEach(function (button) {
        button.textContent = video.paused ? (button.classList.contains('player-main-button') ? '▶' : '播放') : (button.classList.contains('player-main-button') ? '❚❚' : '暂停');
      });
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (mp4Src) {
            setMp4Source();
            video.play().catch(function () {});
          }
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    $all('[data-play-button]', player).forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        togglePlay();
      });
    });

    var muteButton = $('[data-mute-button]', player);
    if (muteButton) {
      muteButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    var fullscreenButton = $('[data-fullscreen-button]', player);
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

    player.addEventListener('click', function (event) {
      if (event.target === player || event.target === video || event.target === overlay) {
        togglePlay();
      }
    });
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);
    attachSource();
    updateState();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFiltering();
    initSearchPage();
    initPlayer();
  });
})();
