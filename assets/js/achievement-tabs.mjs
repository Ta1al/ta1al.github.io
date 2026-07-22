const root = document.querySelector('[data-achievement-tabs]');

if (root) {
  const tabs = [...root.querySelectorAll('[data-achievement-tab]')];
  const panels = [...root.querySelectorAll('[data-achievement-panel]')];
  const validIds = new Set(tabs.map((tab) => tab.dataset.achievementTab));

  const activate = (id, { focus = false, updateHash = true } = {}) => {
    if (!validIds.has(id)) id = 'distinctions';
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
  activate(validIds.has(location.hash.slice(1)) ? location.hash.slice(1) : 'distinctions', { updateHash: false });

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

  const lightbox = root.querySelector('[data-achievement-lightbox]');
  const lightboxImage = lightbox?.querySelector('[data-achievement-lightbox-image]');
  const lightboxCaption = lightbox?.querySelector('[data-achievement-lightbox-caption]');
  const lightboxClose = lightbox?.querySelector('[data-achievement-lightbox-close]');
  const achievementImages = [...root.querySelectorAll('[data-achievement-image]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeImage;
  let closeTimer;

  const closeLightbox = () => {
    if (!lightbox?.open) return;
    window.clearTimeout(closeTimer);
    lightbox.classList.remove('is-open');
    const finish = () => {
      lightbox.close();
      document.body.classList.remove('lightbox-open');
      activeImage?.focus();
    };
    if (reducedMotion.matches) finish();
    else closeTimer = window.setTimeout(finish, 200);
  };

  const openLightbox = (image) => {
    if (!lightbox || !lightboxImage || image.hidden) return;
    window.clearTimeout(closeTimer);
    activeImage = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightboxCaption.hidden = !image.alt;
    document.body.classList.add('lightbox-open');
    lightbox.showModal();
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lightboxClose?.focus();
  };

  achievementImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Enlarge image: ${image.alt || 'achievement image'}`);
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openLightbox(image);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    const clickedImage = event.target === lightboxImage;
    const clickedClose = event.target.closest('[data-achievement-lightbox-close]');
    if (!clickedImage && !clickedClose) closeLightbox();
  });
  lightbox?.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (validIds.has(id)) activate(id, { updateHash: false });
  });
}
