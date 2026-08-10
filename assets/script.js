(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector(".hero");
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    const threshold = hero ? Math.min(hero.offsetHeight * 0.72, 620) : 120;
    header?.classList.toggle("is-scrolled", window.scrollY > threshold);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader, { passive: true });

  const revealItems = [...document.querySelectorAll(".reveal")];

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -5% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-track]");
    const items = track ? [...track.children] : [];
    const current = carousel.querySelector("[data-current]");
    const total = carousel.querySelector("[data-total]");
    const previous = carousel.querySelector("[data-prev]");
    const next = carousel.querySelector("[data-next]");

    if (!track || !items.length) return;

    let activeIndex = 0;
    let frame = 0;

    const pad = (value) => String(value).padStart(2, "0");

    if (total) total.textContent = pad(items.length);

    const update = () => {
      const trackLeft = track.getBoundingClientRect().left;
      let nearestDistance = Number.POSITIVE_INFINITY;
      let nearestIndex = 0;

      items.forEach((item, index) => {
        const distance = Math.abs(item.getBoundingClientRect().left - trackLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      activeIndex = nearestIndex;
      if (current) current.textContent = pad(activeIndex + 1);
      if (previous) previous.disabled = activeIndex === 0;
      if (next) next.disabled = activeIndex === items.length - 1;
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const goTo = (index) => {
      const safeIndex = Math.max(0, Math.min(index, items.length - 1));
      items[safeIndex].scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "start"
      });
    };

    previous?.addEventListener("click", () => goTo(activeIndex - 1));
    next?.addEventListener("click", () => goTo(activeIndex + 1));

    track.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(activeIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goTo(items.length - 1);
      }
    });

    update();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });

      if (id !== "#top") {
        history.replaceState(null, "", id);
      }
    });
  });

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        image.closest("figure, .hero-media, .closing-image")?.classList.add("image-missing");
        image.hidden = true;
      },
      { once: true }
    );
  });
})();
