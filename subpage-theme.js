(function () {
  function prettyTitle(raw) {
    return raw
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, function (match) {
        return match.toUpperCase();
      });
  }

  function pageDescription(type, title) {
    if (type === "app") {
      return "An interactive portfolio project presented in the same visual system as the main site.";
    }
    if (type === "simple") {
      return "A compact portfolio subpage with the same polished look and navigation as the main experience.";
    }
    return "A project walkthrough and supporting material presented in the same portfolio style as the homepage.";
  }

  function injectBackdrop() {
    if (document.querySelector(".subpage-backdrop")) return;

    var backdrop = document.createElement("div");
    backdrop.className = "subpage-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.innerHTML =
      '<div class="subpage-aurora one"></div>' +
      '<div class="subpage-aurora two"></div>' +
      '<div class="subpage-grid"></div>';

    document.body.prepend(backdrop);
  }

  function injectHeader(backHref) {
    if (document.querySelector(".subpage-header")) return;

    var header = document.createElement("header");
    header.className = "subpage-header";
    header.innerHTML =
      '<a class="subpage-brand" href="' + backHref + '">' +
      '<span class="subpage-mark">KM</span>' +
      "<span>Kayle Megginson</span>" +
      "</a>" +
      '<nav class="subpage-nav" aria-label="Subpage">' +
      '<a class="subpage-link" href="' + backHref + '">Back to Portfolio</a>' +
      '<a class="subpage-link subpage-link-muted" href="' + backHref + '#projects">More Projects</a>' +
      "</nav>";

    document.body.prepend(header);
  }

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function appendOverview(hero, body) {
    var process = normalizeText(body.dataset.pageProcess);
    var results = normalizeText(body.dataset.pageResults);
    if (!process && !results) return;

    var overview = document.createElement("div");
    overview.className = "subpage-overview";

    if (process) {
      var processCard = document.createElement("article");
      processCard.className = "subpage-overview-card";
      processCard.innerHTML =
        "<h3>Process</h3>" +
        "<p>" + process + "</p>";
      overview.appendChild(processCard);
    }

    if (results) {
      var resultsCard = document.createElement("article");
      resultsCard.className = "subpage-overview-card";
      resultsCard.innerHTML =
        "<h3>Results</h3>" +
        "<p>" + results + "</p>";
      overview.appendChild(resultsCard);
    }

    hero.appendChild(overview);
  }

  function hideCell(cell) {
    cell.style.display = "none";
    cell.setAttribute("aria-hidden", "true");
  }

  function applyCaseStudyCleanup() {
    var body = document.body;
    if (!body || body.dataset.pageCleanup !== "case-study") return;

    var hidePatterns = [
      /to edit a text cell/i,
      /some resources for using python to study matrices/i,
      /a couple quick notes/i,
      /some useful matrix commands/i,
      /your work for questions/i,
      /enter your answer to question/i,
      /add your code for question/i,
      /instructions/i,
      /part i[,:\s-].*due/i,
      /part ii[,:\s-].*due/i
    ];

    var renameRules = [
      { pattern: /^answer for part 1$/i, replacement: "Process" },
      { pattern: /^answer for part 2$/i, replacement: "Results" },
      { pattern: /^part i[,:\s-]*homography$/i, replacement: "Homography Workflow" },
      { pattern: /^part ii[,:\s-]*homogenous coordinates$/i, replacement: "Coordinate Mapping" },
      { pattern: /^part i[,:\s-].*$/i, replacement: "Process" },
      { pattern: /^part ii[,:\s-].*$/i, replacement: "Results" }
    ];

    Array.from(document.querySelectorAll(".jp-Cell, .cell")).forEach(function (cell) {
      var text = normalizeText(cell.textContent);
      var heading = cell.querySelector("h1, h2, h3, h4");
      var headingText = heading ? normalizeText(heading.textContent.replace(/¶/g, "")) : "";

      if (/jupyter\s+nbconvert/i.test(text) || /\[NbConvertApp\]/i.test(text)) {
        hideCell(cell);
        return;
      }

      var shouldHide = hidePatterns.some(function (pattern) {
        return pattern.test(headingText) || pattern.test(text);
      });

      if (shouldHide) {
        hideCell(cell);
        return;
      }

      if (heading) {
        renameRules.some(function (rule) {
          if (rule.pattern.test(headingText)) {
            heading.textContent = rule.replacement;
            return true;
          }
          return false;
        });
      }
    });
  }

  function buildNotebookLayout(title, description) {
    var sourceMain = document.querySelector("main");
    if (!sourceMain) return;

    if (!sourceMain.parentElement.classList.contains("subpage-content")) {
      var shell = document.createElement("div");
      shell.className = "subpage-shell";

      var hero = document.createElement("section");
      hero.className = "subpage-hero";
      hero.innerHTML =
        '<p class="subpage-kicker">Project Detail</p>' +
        '<h1 class="subpage-title">' + title + "</h1>" +
        '<p class="subpage-description">' + description + "</p>";
      appendOverview(hero, document.body);

      var content = document.createElement("section");
      content.className = "subpage-content";

      sourceMain.parentNode.insertBefore(shell, sourceMain);
      content.appendChild(sourceMain);
      shell.appendChild(hero);
      shell.appendChild(content);
    }

    var oldButton = document.getElementById("backToMain");
    if (oldButton) oldButton.classList.add("legacy-back-button");

    Array.from(document.querySelectorAll(".jp-Cell, .cell")).forEach(function (cell) {
      var text = cell.textContent || "";
      if (/jupyter\s+nbconvert/i.test(text) || /\[NbConvertApp\]/i.test(text)) {
        cell.style.display = "none";
      }
    });

    applyCaseStudyCleanup();
  }

  function buildAppLayout(title, description) {
    var game = document.getElementById("game");
    var canvas = document.getElementById("gameCanvas");
    var heading = document.querySelector("h1");
    var target = game || canvas || heading;
    if (!target) return;

    var shell = document.createElement("div");
    shell.className = "subpage-shell";

    var hero = document.createElement("section");
    hero.className = "subpage-hero";
    hero.innerHTML =
      '<p class="subpage-kicker">Interactive Project</p>' +
      '<h1 class="subpage-title">' + title + "</h1>" +
      '<p class="subpage-description">' + description + "</p>";

    var app = document.createElement("section");
    app.className = "subpage-app-shell";

    target.parentNode.insertBefore(shell, target);
    shell.appendChild(hero);
    shell.appendChild(app);

    if (heading && heading.parentNode !== app) {
      app.appendChild(heading);
    }

    if (game && game.parentNode !== app) {
      app.appendChild(game);
    } else if (!game && canvas && canvas.parentNode !== app) {
      app.appendChild(canvas);
    }

    var resetButton = document.getElementById("resetGame");
    if (resetButton && resetButton.parentNode !== app) {
      app.appendChild(resetButton);
    }

    var oldButton = document.getElementById("backToMain");
    if (oldButton) oldButton.classList.add("legacy-back-button");
  }

  function buildSimpleLayout(title, description) {
    var bodyChildren = Array.from(document.body.children).filter(function (node) {
      return !node.classList.contains("subpage-backdrop") && !node.classList.contains("subpage-header");
    });

    var shell = document.createElement("div");
    shell.className = "subpage-shell";

    var hero = document.createElement("section");
    hero.className = "subpage-hero";
    hero.innerHTML =
      '<p class="subpage-kicker">Project Detail</p>' +
      '<h1 class="subpage-title">' + title + "</h1>" +
      '<p class="subpage-description">' + description + "</p>";

    var content = document.createElement("section");
    content.className = "subpage-content";

    document.body.appendChild(shell);
    shell.appendChild(hero);
    shell.appendChild(content);

    bodyChildren.forEach(function (node) {
      content.appendChild(node);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    if (!body) return;

    var type = body.dataset.pageType || "notebook";
    var title = body.dataset.pageTitle || prettyTitle(document.title || "Project Page");
    var description = body.dataset.pageDescription || pageDescription(type, title);
    var backHref = body.dataset.backLink || "../index.html";

    body.classList.add("portfolio-subpage");
    body.classList.add("portfolio-" + type);

    injectBackdrop();
    injectHeader(backHref);

    if (type === "app") {
      buildAppLayout(title, description);
      return;
    }

    if (type === "simple") {
      buildSimpleLayout(title, description);
      return;
    }

    buildNotebookLayout(title, description);
  });
})();
