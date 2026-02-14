const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pageTransitionListenerAttached = false;
let revealObserver = null;

const setLoadedState = () => {
  document.body.classList.remove("is-loading", "is-leaving");
  document.body.classList.add("is-loaded");
};

const handlePageTransitionClick = (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  const isExternal = link.target === "_blank" || href.startsWith("http");
  const isAnchor = href.startsWith("#");
  if (isExternal || isAnchor || link.hasAttribute("download")) return;

  event.preventDefault();
  document.body.classList.add("is-leaving");
  setTimeout(() => {
    window.location.href = href;
  }, 180);
};

const handlePageTransitions = () => {
  if (prefersReducedMotion) {
    setLoadedState();
  } else {
    requestAnimationFrame(setLoadedState);
  }

  if (!pageTransitionListenerAttached) {
    document.addEventListener("click", handlePageTransitionClick);
    pageTransitionListenerAttached = true;
  }
};

const handleScrollReveal = () => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (prefersReducedMotion) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  if (revealObserver) {
    revealObserver.disconnect();
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
    revealObserver.observe(item);
  });
};

// Centralized initializer used on first load and bfcache restores.
const initPage = () => {
  handlePageTransitions();
  handleScrollReveal();
};

document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("pageshow", (event) => {
  // When returning from bfcache, JS state can be stale. Re-run setup safely.
  if (event.persisted) {
    initPage();
  }
});
