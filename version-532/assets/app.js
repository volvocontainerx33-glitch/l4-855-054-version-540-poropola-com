(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var toggle = one("[data-menu-toggle]");
    var panel = one("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = one("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = all("[data-hero-slide]", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = one("[data-hero-prev]", hero);
    var next = one("[data-hero-next]", hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  }

  function setupFilters() {
    var lists = all("[data-filter-list]");

    lists.forEach(function (list) {
      var scope = list.parentElement || document;
      var search = one("[data-card-search]", scope);
      var category = one("[data-card-category]", scope);
      var type = one("[data-card-type]", scope);
      var empty = one("[data-empty-state]", scope);
      var cards = all("[data-card]", list);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";

      if (search && query) {
        search.value = query;
      }

      function filter() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var cat = category ? category.value : "";
        var kind = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-index") || "").toLowerCase();
          var cardCategory = card.getAttribute("data-category") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (q && text.indexOf(q) === -1) {
            matched = false;
          }

          if (cat && cardCategory !== cat) {
            matched = false;
          }

          if (kind && cardType.indexOf(kind) === -1) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, category, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });

      filter();
    });
  }

  function setupPlayer() {
    var shell = one("[data-player]");

    if (!shell) {
      return;
    }

    var video = one("video", shell);
    var button = one("[data-play]", shell);
    var stream = shell.getAttribute("data-stream");
    var prepared = false;
    var hls = null;

    function attach() {
      if (prepared || !video || !stream) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      video.controls = true;

      if (button) {
        button.classList.add("is-hidden");
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
