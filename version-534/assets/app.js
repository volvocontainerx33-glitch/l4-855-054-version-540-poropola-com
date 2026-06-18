(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        schedule();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function initSearch() {
    document.querySelectorAll("[data-search-area]").forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var root = area.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var buttons = Array.prototype.slice.call(area.querySelectorAll("[data-filter-value]"));
      var empty = root.querySelector("[data-empty]");
      var activeFilter = "all";

      function render() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-title") || "").toLowerCase();
          var kind = card.getAttribute("data-kind") || "";
          var matchText = !query || haystack.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || kind.indexOf(activeFilter) !== -1;
          var show = matchText && matchFilter;
          card.classList.toggle("is-filtered", !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", render);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          render();
        });
      });

      render();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var startButton = box.querySelector(".player-start");
      var stream = box.getAttribute("data-stream");
      var hlsInstance = null;
      var started = false;

      if (!video || !stream) {
        return;
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      function start() {
        if (started) {
          playVideo();
          return;
        }

        started = true;

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }

        video.src = stream;
        playVideo();
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      if (startButton) {
        startButton.addEventListener("click", function (event) {
          event.stopPropagation();
          start();
        });
      }

      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayers();
  });
})();
