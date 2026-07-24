export function createTabSet({
  tabs,
  panels,
  getTabId,
  getPanelId,
  defaultId,
  activeClass,
  hashForId,
  onActivate,
}) {
  const validIds = new Set(tabs.map(getTabId));

  const activate = (requestedId, { focus = false, updateHash = true } = {}) => {
    const id = validIds.has(requestedId) ? requestedId : defaultId;
    tabs.forEach((tab) => {
      const active = getTabId(tab) === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = getPanelId(panel) === id;
      panel.hidden = !active;
      if (activeClass) panel.classList.toggle(activeClass, active);
    });
    onActivate?.(id);
    if (updateHash && hashForId) {
      history.replaceState(null, "", hashForId(id));
    }
    return id;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(getTabId(tab)));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(getTabId(tabs[next]), { focus: true });
    });
  });

  return { activate, validIds };
}
