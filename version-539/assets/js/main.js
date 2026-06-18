(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = queryAll("[data-hero-slide]", hero);
    var dots = queryAll("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function setupScrollRows() {
    queryAll("[data-scroll-left]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-left"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });

    queryAll("[data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-right"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function setupImageFallback() {
    queryAll("img.cover-image").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-hidden");
      });
    });
  }

  function setupLocalFilters() {
    var textInput = document.querySelector(".local-filter");
    var typeInput = document.querySelector(".type-filter");
    var cards = queryAll(".movie-card[data-search]");
    var empty = document.querySelector("[data-empty-state]");

    if (!cards.length || (!textInput && !typeInput)) {
      return;
    }

    function applyFilter() {
      var keyword = normalize(textInput ? textInput.value : "");
      var type = normalize(typeInput ? typeInput.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matchedText = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !type || cardType === type;
        var shouldShow = matchedText && matchedType;

        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (textInput) {
      textInput.addEventListener("input", applyFilter);
    }

    if (typeInput) {
      typeInput.addEventListener("change", applyFilter);
    }
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-movie-id=\"" + escapeHtml(movie.id) + "\">",
      "  <a class=\"poster\" href=\"" + escapeHtml(movie.url) + "\">",
      "    <img class=\"cover-image\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"card-category\">" + escapeHtml(movie.category) + "</span>",
      "    <span class=\"poster-play\">▶</span>",
      "  </a>",
      "  <div class=\"card-body\">",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine || movie.summary || "") + "</p>",
      "    <div class=\"card-meta\">",
      "      <span>" + escapeHtml(movie.region) + "</span>",
      "      <span>" + escapeHtml(movie.type) + "</span>",
      "      <span>" + escapeHtml(movie.year) + "</span>",
      "    </div>",
      "    <div class=\"tag-row\">" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var input = document.getElementById("searchPageInput");
    var title = document.getElementById("searchResultTitle");
    var empty = document.getElementById("searchEmpty");

    if (!results || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input) {
      input.value = query;
    }

    var normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      results.innerHTML = "";
      if (empty) {
        empty.classList.add("is-visible");
      }
      return;
    }

    var matched = window.MOVIE_INDEX.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(" "),
        movie.oneLine,
        movie.summary
      ].join(" ").toLowerCase();

      return text.indexOf(normalizedQuery) !== -1;
    }).slice(0, 200);

    if (title) {
      title.textContent = "“" + query + "” 的搜索结果";
    }

    results.innerHTML = matched.map(buildSearchCard).join("\n");
    setupImageFallback();

    if (empty) {
      empty.textContent = matched.length ? "" : "没有找到匹配影片。";
      empty.classList.toggle("is-visible", matched.length === 0);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupScrollRows();
    setupImageFallback();
    setupLocalFilters();
    setupSearchPage();
  });
})();
