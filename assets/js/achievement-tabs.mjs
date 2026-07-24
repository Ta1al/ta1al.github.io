import { createImageLightbox } from "./lib/lightbox.mjs";
import { createTabSet } from "./lib/tabs.mjs";

const root = document.querySelector("[data-achievement-tabs]");

if (root) {
  const viewTabs = [...root.querySelectorAll("[data-achievement-view-tab]")];
  const views = [...root.querySelectorAll("[data-achievement-view]")];
  const categoryTabs = [...root.querySelectorAll("[data-achievement-tab]")];
  const panels = [...root.querySelectorAll("[data-achievement-panel]")];

  const viewSet = createTabSet({
    tabs: viewTabs,
    panels: views,
    getTabId: (tab) => tab.dataset.achievementViewTab,
    getPanelId: (view) => view.dataset.achievementView,
    defaultId: "curated",
    hashForId: (id) => `#${id}`,
  });
  const categorySet = createTabSet({
    tabs: categoryTabs,
    panels,
    getTabId: (tab) => tab.dataset.achievementTab,
    getPanelId: (panel) => panel.dataset.achievementPanel,
    defaultId: "distinctions",
    hashForId: (id) => `#${id}`,
    onActivate: () => viewSet.activate("all", { updateHash: false }),
  });

  root.classList.add("achievement-tabs--ready");
  const activateHash = () => {
    const id = location.hash.slice(1);
    if (categorySet.validIds.has(id)) {
      categorySet.activate(id, { updateHash: false });
    } else {
      viewSet.activate(viewSet.validIds.has(id) ? id : "curated", {
        updateHash: false,
      });
    }
  };
  activateHash();
  window.addEventListener("hashchange", activateHash);

  const achievementImages = [
    ...root.querySelectorAll("[data-achievement-image]"),
  ];
  achievementImages.forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      image.closest(".achievement-card")?.classList.add("is-image-unavailable");
    });
  });

  createImageLightbox({
    dialog: root.querySelector("[data-achievement-lightbox]"),
    images: achievementImages,
    imageSelector: "[data-achievement-lightbox-image]",
    captionSelector: "[data-achievement-lightbox-caption]",
    closeSelector: "[data-achievement-lightbox-close]",
    label: "achievement image",
  });
}
