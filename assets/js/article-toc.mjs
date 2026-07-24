import { listenForHorizontalSwipe, trapTabKey } from "./lib/interactions.mjs";
import { createImageLightbox } from "./lib/lightbox.mjs";

const toc = document.querySelector("[data-article-toc]");

if (toc) {
  const trigger = document.querySelector("[data-toc-open]");
  const closeControls = [...document.querySelectorAll("[data-toc-close]")];
  const backdrop = document.querySelector(".toc-backdrop");
  const mobileViewport = window.matchMedia("(max-width: 46rem)");
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) =>
      document.getElementById(decodeURIComponent(link.hash.slice(1))),
    )
    .filter(Boolean);
  let previousFocus;

  const setActive = (section) => {
    links.forEach((link) => {
      const current =
        section && decodeURIComponent(link.hash.slice(1)) === section.id;
      link.classList.toggle("is-active", current);
      if (current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] },
    );
    sections.forEach((section) => observer.observe(section));
  } else {
    let queued = false;
    const update = () => {
      const threshold = window.innerHeight * 0.3;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= threshold) active = section;
      });
      setActive(active);
      queued = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
      },
      { passive: true },
    );
  }
  setActive(sections[0]);

  const closeToc = ({ restoreFocus = false } = {}) => {
    document.body.classList.remove("toc-open");
    trigger?.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.hidden = true;
    if (mobileViewport.matches) {
      toc.inert = true;
      toc.setAttribute("aria-hidden", "true");
    } else {
      toc.inert = false;
      toc.removeAttribute("aria-hidden");
    }
    if (restoreFocus) previousFocus?.focus();
  };

  const openToc = () => {
    if (
      !mobileViewport.matches ||
      document.body.classList.contains("menu-open")
    ) {
      return;
    }
    previousFocus = document.activeElement;
    toc.inert = false;
    toc.removeAttribute("aria-hidden");
    document.body.classList.add("toc-open");
    trigger?.setAttribute("aria-expanded", "true");
    if (backdrop) backdrop.hidden = false;
    toc.querySelector("[data-toc-close]")?.focus();
  };

  trigger?.addEventListener("click", openToc);
  closeControls.forEach((control) => {
    control.addEventListener("click", () => closeToc({ restoreFocus: true }));
  });
  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileViewport.matches) closeToc();
    });
  });
  listenForHorizontalSwipe({
    mediaQuery: mobileViewport,
    capture: true,
    stopPropagation: true,
    onSwipe: (direction) => {
      const open = document.body.classList.contains("toc-open");
      if (!open && direction === "left") return;
      if (open) closeToc();
      else openToc();
    },
  });

  document.addEventListener("keydown", (event) => {
    if (!document.body.classList.contains("toc-open")) return;
    if (event.key === "Escape") closeToc({ restoreFocus: true });
    else trapTabKey(event, toc);
  });
  mobileViewport.addEventListener("change", () => closeToc());
  closeToc();
}

const lightbox = document.querySelector("[data-article-lightbox]");
if (lightbox) {
  createImageLightbox({
    dialog: lightbox,
    images: [...document.querySelectorAll(".article .prose img")],
    imageSelector: "[data-lightbox-image]",
    captionSelector: "[data-lightbox-caption]",
    closeSelector: "[data-lightbox-close]",
    getSource: (image) =>
      image.dataset.lightboxSource || image.currentSrc || image.src,
    label: "article image",
  });
}
