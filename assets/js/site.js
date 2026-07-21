(() => {
  const button = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  if (!button || !menu) return;

  let previousFocus;
  const focusable = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];

  const closeMenu = () => {
    menu.classList.remove('menu--open');
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    window.setTimeout(() => { menu.hidden = true; }, 180);
    previousFocus?.focus();
  };

  const openMenu = () => {
    previousFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('menu--open'));
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    focusable()[0]?.focus();
  };

  button.addEventListener('click', () => button.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu());
  menu.addEventListener('click', (event) => { if (event.target === menu) closeMenu(); });

  let touchStartX = 0;
  let touchStartY = 0;
  let trackingSwipe = false;
  const mobileViewport = window.matchMedia('(max-width: 35rem)');
  document.addEventListener('touchstart', (event) => {
    trackingSwipe = mobileViewport.matches && event.touches.length === 1;
    if (!trackingSwipe) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (event) => {
    if (!trackingSwipe || event.changedTouches.length !== 1) return;
    trackingSwipe = false;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (deltaX < -56 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      event.preventDefault();
      button.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    }
  }, { passive: false });
  document.addEventListener('touchcancel', () => { trackingSwipe = false; }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (button.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') closeMenu();
    if (event.key === 'Tab') {
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();

(() => {
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const projects = [...document.querySelectorAll('[data-project-discipline]')];
  const status = document.querySelector('.filter-status');
  if (!filters.length || !projects.length) return;

  filters.forEach((button) => button.addEventListener('click', () => {
    const selected = button.dataset.projectFilter;
    let visible = 0;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projects.forEach((project) => {
      const show = selected === 'all' || project.dataset.projectDiscipline === selected;
      project.hidden = !show;
      if (show) visible += 1;
    });
    if (status) status.textContent = `${visible} project${visible === 1 ? '' : 's'} shown.`;
  }));
})();
