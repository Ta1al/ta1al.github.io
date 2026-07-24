import { createTabSet } from "./lib/tabs.mjs";

const tabsRoot = document.querySelector("[data-cv-tabs]");
const tabList = tabsRoot?.querySelector('[role="tablist"]');

if (tabList && tabsRoot) {
  const tabs = [...tabList.querySelectorAll("[data-cv-tab]")];
  const panels = [...tabsRoot.querySelectorAll("[data-cv-panel]")];
  const downloads = [...document.querySelectorAll("[data-cv-download]")];
  const tabSet = createTabSet({
    tabs,
    panels,
    getTabId: (tab) => tab.dataset.cvTab,
    getPanelId: (panel) => panel.dataset.cvPanel,
    defaultId: "soc",
    activeClass: "is-active",
    hashForId: (id) => `#cv-${id}`,
    onActivate: (id) => {
      downloads.forEach((download) => {
        download.hidden = download.dataset.cvDownload !== id;
      });
    },
  });

  tabsRoot.classList.add("cv-tabs--ready");
  const activateHash = () => {
    const id = location.hash.replace("#cv-", "");
    tabSet.activate(tabSet.validIds.has(id) ? id : "soc", {
      updateHash: false,
    });
  };
  activateHash();
  window.addEventListener("hashchange", activateHash);

  const feedbackTimers = new WeakMap();
  downloads.forEach((download) => {
    download.addEventListener("click", () => {
      window.clearTimeout(feedbackTimers.get(download));
      download.classList.remove("is-downloading");
      void download.offsetWidth;
      download.classList.add("is-downloading");
      feedbackTimers.set(
        download,
        window.setTimeout(() => {
          download.classList.remove("is-downloading");
          feedbackTimers.delete(download);
        }, 750),
      );
    });
  });
}

const skillGroups = [...document.querySelectorAll("[data-skill-group]")];

if (skillGroups.length) {
  const mobileViewport = window.matchMedia("(max-width: 46rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new WeakMap();

  const configure = () => {
    skillGroups.forEach((group) => {
      const button = group.querySelector(".skill-group__toggle");
      const content = group.querySelector(".skill-group__content");
      if (!button || !content) return;
      animations.get(content)?.cancel();
      if (mobileViewport.matches) {
        button.disabled = false;
        if (!group.dataset.mobileFoldInitialized) {
          group.dataset.mobileFoldInitialized = "true";
          button.setAttribute("aria-expanded", "false");
          content.hidden = true;
        }
      } else {
        delete group.dataset.mobileFoldInitialized;
        button.disabled = true;
        button.setAttribute("aria-expanded", "true");
        content.hidden = false;
      }
    });
  };

  skillGroups.forEach((group) => {
    const button = group.querySelector(".skill-group__toggle");
    const content = group.querySelector(".skill-group__content");
    if (!button || !content) return;

    button.addEventListener("click", () => {
      if (!mobileViewport.matches) return;
      const opening = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(opening));
      animations.get(content)?.cancel();
      if (reducedMotion.matches || !content.animate) {
        content.hidden = !opening;
        return;
      }
      if (opening) content.hidden = false;
      const startHeight = opening ? 0 : content.scrollHeight;
      const endHeight = opening ? content.scrollHeight : 0;
      const animation = content.animate(
        [
          { height: `${startHeight}px`, opacity: opening ? 0 : 1 },
          { height: `${endHeight}px`, opacity: opening ? 1 : 0 },
        ],
        { duration: 220, easing: "ease", fill: "both" },
      );
      animations.set(content, animation);
      animation.onfinish = () => {
        if (!opening && button.getAttribute("aria-expanded") === "false") {
          content.hidden = true;
        }
        animation.cancel();
        animations.delete(content);
      };
    });
  });

  configure();
  mobileViewport.addEventListener("change", configure);
}
