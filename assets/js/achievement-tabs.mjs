const root = document.querySelector('[data-achievement-tabs]');

if (root) {
  const tabs = [...root.querySelectorAll('[data-achievement-tab]')];
  const panels = [...root.querySelectorAll('[data-achievement-panel]')];
  const validIds = new Set(tabs.map((tab) => tab.dataset.achievementTab));

  const activate = (id, { focus = false, updateHash = true } = {}) => {
    if (!validIds.has(id)) id = 'personal';
    tabs.forEach((tab) => {
      const active = tab.dataset.achievementTab === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.achievementPanel !== id; });
    if (updateHash) history.replaceState(null, '', `#${id}`);
  };

  root.classList.add('achievement-tabs--ready');
  activate(validIds.has(location.hash.slice(1)) ? location.hash.slice(1) : 'personal', { updateHash: false });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.achievementTab));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[next].dataset.achievementTab, { focus: true });
    });
  });

  root.querySelectorAll('[data-achievement-image]').forEach((image) => {
    image.addEventListener('error', () => {
      image.hidden = true;
      image.closest('.achievement-card')?.classList.add('is-image-unavailable');
    });
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (validIds.has(id)) activate(id, { updateHash: false });
  });
}
