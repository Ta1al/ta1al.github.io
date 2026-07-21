const tabList = document.querySelector('[role="tablist"]');
const tabsRoot = document.querySelector('[data-cv-tabs]');

if (tabList && tabsRoot) {
  const tabs = [...tabList.querySelectorAll('[data-cv-tab]')];
  const panels = [...tabsRoot.querySelectorAll('[data-cv-panel]')];
  const downloads = [...document.querySelectorAll('[data-cv-download]')];
  const validIds = new Set(tabs.map((tab) => tab.dataset.cvTab));

  const activate = (id, { focus = false, updateHash = true } = {}) => {
    if (!validIds.has(id)) id = 'soc';
    tabs.forEach((tab) => {
      const active = tab.dataset.cvTab === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => {
      const active = panel.dataset.cvPanel === id;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    downloads.forEach((download) => { download.hidden = download.dataset.cvDownload !== id; });
    if (updateHash) history.replaceState(null, '', `#cv-${id}`);
  };

  tabsRoot.classList.add('cv-tabs--ready');
  const initial = location.hash.replace('#cv-', '');
  activate(validIds.has(initial) ? initial : 'soc', { updateHash: false });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.cvTab));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next].dataset.cvTab, { focus: true });
    });
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#cv-', '');
    if (validIds.has(id)) activate(id, { updateHash: false });
  });
}
