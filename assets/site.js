const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setLoadedState = () => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
};

const handlePageTransitions = () => {
  if (prefersReducedMotion) {
    setLoadedState();
    return;
  }

  requestAnimationFrame(setLoadedState);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    const isExternal = link.target === "_blank" || href.startsWith("http");
    const isAnchor = href.startsWith("#");
    if (isExternal || isAnchor || link.hasAttribute("download")) return;

    event.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => {
      window.location.href = href;
    }, 180);
  });
};

const handleScrollReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
    observer.observe(item);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  handlePageTransitions();
  handleScrollReveal();
});
