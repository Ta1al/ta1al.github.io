import { listenForHorizontalSwipe, trapTabKey } from "./lib/interactions.mjs";

const header = document.querySelector(".site-header");

if (header) {
  let updateQueued = false;
  const updateHeader = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 16);
    updateQueued = false;
  };
  const queueUpdate = () => {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener("scroll", queueUpdate, { passive: true });
}

const button = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

if (button && menu) {
  let previousFocus;
  let hideTimer;
  const mobileViewport = window.matchMedia("(max-width: 35rem)");

  const closeMenu = () => {
    window.clearTimeout(hideTimer);
    menu.classList.remove("menu--open");
    button.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    hideTimer = window.setTimeout(() => {
      if (button.getAttribute("aria-expanded") === "false") menu.hidden = true;
    }, 180);
    previousFocus?.focus();
  };

  const openMenu = () => {
    window.clearTimeout(hideTimer);
    previousFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("menu--open"));
    button.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    menu.querySelector("a[href]")?.focus();
  };

  button.addEventListener("click", () => {
    if (button.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });
  menu.addEventListener("click", (event) => {
    if (event.target === menu) closeMenu();
  });

  listenForHorizontalSwipe({
    mediaQuery: mobileViewport,
    onSwipe: (direction) => {
      const open = button.getAttribute("aria-expanded") === "true";
      if (!open && direction === "right") return false;
      if (open) closeMenu();
      else openMenu();
      return true;
    },
  });

  document.addEventListener("keydown", (event) => {
    if (button.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") closeMenu();
    else trapTabKey(event, menu);
  });
}
