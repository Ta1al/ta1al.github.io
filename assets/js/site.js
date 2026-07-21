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
