(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var heroTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }

      heroTimer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function resetHero() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }

      startHero();
    }

    document.querySelectorAll(".hero-prev").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current - 1);
        resetHero();
      });
    });

    document.querySelectorAll(".hero-next").forEach(function (button) {
      button.addEventListener("click", function () {
        showSlide(current + 1);
        resetHero();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        resetHero();
      });
    });

    showSlide(0);
    startHero();

    document.querySelectorAll(".rail-prev, .rail-next").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-rail");
        var rail = document.getElementById(id);

        if (!rail) {
          return;
        }

        var direction = button.classList.contains("rail-prev") ? -1 : 1;
        rail.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      });
    });

    function applyFilters(scope) {
      var queryInput = scope.querySelector("[data-filter-query]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      scope.querySelectorAll(".movie-card").forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();

        var okQuery = !query || text.indexOf(query) !== -1;
        var okYear = !year || (card.getAttribute("data-year") || "") === year;
        var okType = !type || (card.getAttribute("data-type") || "").indexOf(type) !== -1;

        card.classList.toggle("is-hidden", !(okQuery && okYear && okType));
      });
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      scope.querySelectorAll("input, select").forEach(function (control) {
        control.addEventListener("input", function () {
          applyFilters(scope);
        });

        control.addEventListener("change", function () {
          applyFilters(scope);
        });
      });
    });

    document.querySelectorAll("[data-filter-submit]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        var scope = button.closest("[data-filter-scope]");

        if (scope) {
          applyFilters(scope);
        }
      });
    });

    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var stream = shell.getAttribute("data-stream");
      var hls = null;
      var initialized = false;

      function beginPlayback() {
        if (!video || !stream) {
          return;
        }

        if (!initialized) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }

          initialized = true;
        }

        shell.classList.add("is-started");
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", beginPlayback);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!initialized) {
            beginPlayback();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();