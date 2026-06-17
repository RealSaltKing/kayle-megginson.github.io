(function () {
  function initMobileNav() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initRevealAnimations() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initActiveNav() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
    if (!sections.length || !links.length) return;

    const byId = new Map(
      links.map(function (link) {
        return [link.getAttribute("href").slice(1), link];
      })
    );

    const observer = new IntersectionObserver(
      function (entries) {
        const visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          })[0];

        if (!visible) return;

        links.forEach(function (link) {
          link.classList.remove("active");
        });

        const active = byId.get(visible.target.id);
        if (active) active.classList.add("active");
      },
      { threshold: [0.2, 0.35, 0.55, 0.75] }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function initRoleRotator() {
    const node = document.getElementById("role-rotator");
    if (!node) return;

    const values = [
      "software systems",
      "data-driven modeling",
      "controls and dynamics",
      "technical storytelling",
      "engineering systems"
    ];

    let index = 0;

    setInterval(function () {
      index = (index + 1) % values.length;
      node.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-8px)" },
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 550, easing: "ease" }
      );
      window.setTimeout(function () {
        node.textContent = values[index];
      }, 250);
    }, 2600);
  }

  function initSpotlightCards() {
    const cards = document.querySelectorAll(".glass-card");
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--spot-x", x + "%");
        card.style.setProperty("--spot-y", y + "%");
      });
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = "Sending...";
      status.style.color = "var(--muted)";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Request failed");
          return response.json();
        })
        .then(function () {
          status.textContent = "Message sent successfully.";
          status.style.color = "var(--accent)";
          form.reset();
        })
        .catch(function () {
          status.textContent = "Could not send message. Please try again.";
          status.style.color = "#ffb4b4";
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initMobileNav();
    initRevealAnimations();
    initActiveNav();
    initRoleRotator();
    initSpotlightCards();
    initContactForm();
  });
})();
