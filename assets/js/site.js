(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let updateQueued = false;
  const updateHeader = () => {
    header.classList.toggle('site-header--scrolled', window.scrollY > 16);
    updateQueued = false;
  };
  const queueUpdate = () => {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(updateHeader);
  };

  updateHeader();
  window.addEventListener('scroll', queueUpdate, { passive: true });
})();

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
    const isHorizontalSwipe = Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35;
    if (isHorizontalSwipe) {
      const menuIsOpen = button.getAttribute('aria-expanded') === 'true';
      if (!menuIsOpen && deltaX > 0) return;
      event.preventDefault();
      menuIsOpen ? closeMenu() : openMenu();
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
  const groups = [...document.querySelectorAll('[data-skill-group]')];
  if (!groups.length) return;

  const mobileViewport = window.matchMedia('(max-width: 46rem)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new WeakMap();

  const configure = () => {
    groups.forEach((group) => {
      const button = group.querySelector('.skill-group__toggle');
      const content = group.querySelector('.skill-group__content');
      if (!button || !content) return;

      animations.get(content)?.cancel();
      if (mobileViewport.matches) {
        button.disabled = false;
        if (!group.dataset.mobileFoldInitialized) {
          group.dataset.mobileFoldInitialized = 'true';
          button.setAttribute('aria-expanded', 'false');
          content.hidden = true;
        }
      } else {
        delete group.dataset.mobileFoldInitialized;
        button.disabled = true;
        button.setAttribute('aria-expanded', 'true');
        content.hidden = false;
      }
    });
  };

  groups.forEach((group) => {
    const button = group.querySelector('.skill-group__toggle');
    const content = group.querySelector('.skill-group__content');
    if (!button || !content) return;

    button.addEventListener('click', () => {
      if (!mobileViewport.matches) return;
      const opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      animations.get(content)?.cancel();

      if (reducedMotion.matches || !content.animate) {
        content.hidden = !opening;
        return;
      }

      if (opening) content.hidden = false;
      const startHeight = opening ? 0 : content.scrollHeight;
      const endHeight = opening ? content.scrollHeight : 0;
      const animation = content.animate(
        [{ height: `${startHeight}px`, opacity: opening ? 0 : 1 }, { height: `${endHeight}px`, opacity: opening ? 1 : 0 }],
        { duration: 220, easing: 'ease', fill: 'both' }
      );
      animations.set(content, animation);
      animation.onfinish = () => {
        if (!opening && button.getAttribute('aria-expanded') === 'false') content.hidden = true;
        animation.cancel();
        animations.delete(content);
      };
    });
  });

  configure();
  mobileViewport.addEventListener('change', configure);
})();

(() => {
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const projects = [...document.querySelectorAll('[data-project-discipline]')];
  const status = document.querySelector('.filter-status');
  if (!filters.length || !projects.length) return;

  const activateFilter = (button, { focus = false } = {}) => {
    const selected = button.dataset.projectFilter;
    let visible = 0;
    filters.forEach((item) => {
      const active = item === button;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    projects.forEach((project) => {
      const show = selected === 'all' || project.dataset.projectDiscipline === selected;
      project.hidden = !show;
      if (show) visible += 1;
    });
    if (status) status.textContent = `${visible} project${visible === 1 ? '' : 's'} shown.`;
    if (focus) button.focus();
  };

  filters.forEach((button, index) => {
    button.addEventListener('click', () => activateFilter(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + filters.length) % filters.length;
      if (event.key === 'ArrowRight') next = (index + 1) % filters.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = filters.length - 1;
      activateFilter(filters[next], { focus: true });
    });
  });
})();
