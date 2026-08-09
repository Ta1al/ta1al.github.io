import { listenForHorizontalSwipe, trapTabKey } from "./lib/interactions.mjs";

const relativeAgeFormatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "always",
});
const relativeAgeUnits = [
  ["year", 31_557_600],
  ["month", 2_629_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

for (const timestamp of document.querySelectorAll("[data-relative-age]")) {
  const publishedAt = new Date(timestamp.dateTime);
  if (Number.isNaN(publishedAt.valueOf())) continue;

  const elapsedSeconds = (Date.now() - publishedAt.valueOf()) / 1_000;
  if (Math.abs(elapsedSeconds) < 60) {
    timestamp.textContent = "Published just now";
    continue;
  }

  const [unit, seconds] = relativeAgeUnits.find(
    ([, threshold]) => Math.abs(elapsedSeconds) >= threshold,
  );
  const value = Math.trunc(elapsedSeconds / seconds);
  timestamp.textContent = `Published ${relativeAgeFormatter.format(-value, unit)}`;
}

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
      if (button.getAttribute("aria-expanded") === "false") {
        menu.hidden = true;
        menu.classList.remove("menu--suppress-focus-ring");
      }
    }, 180);
    previousFocus?.focus();
  };

  const openMenu = ({ showFocusRing = false } = {}) => {
    window.clearTimeout(hideTimer);
    previousFocus = document.activeElement;
    menu.hidden = false;
    menu.classList.toggle("menu--suppress-focus-ring", !showFocusRing);
    requestAnimationFrame(() => menu.classList.add("menu--open"));
    button.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    menu.querySelector("a[href]")?.focus();
  };

  button.addEventListener("click", (event) => {
    if (button.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu({ showFocusRing: event.detail === 0 });
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
    menu.classList.remove("menu--suppress-focus-ring");
    if (event.key === "Escape") closeMenu();
    else trapTabKey(event, menu);
  });
}
