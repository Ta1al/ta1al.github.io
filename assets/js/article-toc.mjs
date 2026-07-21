const toc = document.querySelector('[data-article-toc]');

if (toc) {
  const trigger = document.querySelector('[data-toc-open]');
  const closeControls = [...document.querySelectorAll('[data-toc-close]')];
  const backdrop = document.querySelector('.toc-backdrop');
  const mobileViewport = window.matchMedia('(max-width: 46rem)');
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const sections = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
  let previousFocus;
  let scrollQueued = false;

  const setActiveSection = () => {
    let active = sections[0];
    const threshold = window.innerHeight * 0.3;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= threshold) active = section;
    });
    links.forEach((link) => {
      const current = active && decodeURIComponent(link.hash.slice(1)) === active.id;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollQueued = false;
  };

  const queueSectionUpdate = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(setActiveSection);
  };

  const closeToc = ({ restoreFocus = false } = {}) => {
    document.body.classList.remove('toc-open');
    trigger?.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.hidden = true;
    if (mobileViewport.matches) {
      toc.inert = true;
      toc.setAttribute('aria-hidden', 'true');
    } else {
      toc.inert = false;
      toc.removeAttribute('aria-hidden');
    }
    if (restoreFocus) previousFocus?.focus();
  };

  const openToc = () => {
    if (!mobileViewport.matches || document.body.classList.contains('menu-open')) return;
    previousFocus = document.activeElement;
    toc.inert = false;
    toc.removeAttribute('aria-hidden');
    document.body.classList.add('toc-open');
    trigger?.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.hidden = false;
    toc.querySelector('[data-toc-close]')?.focus();
  };

  trigger?.addEventListener('click', openToc);
  closeControls.forEach((control) => control.addEventListener('click', () => closeToc({ restoreFocus: true })));
  links.forEach((link) => link.addEventListener('click', () => {
    if (mobileViewport.matches) closeToc();
  }));

  let touchStartX = 0;
  let touchStartY = 0;
  let trackingSwipe = false;
  document.addEventListener('touchstart', (event) => {
    trackingSwipe = mobileViewport.matches && event.touches.length === 1;
    if (!trackingSwipe) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true, capture: true });
  document.addEventListener('touchend', (event) => {
    if (!trackingSwipe || event.changedTouches.length !== 1) return;
    trackingSwipe = false;
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) <= 56 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.35) return;
    const isOpen = document.body.classList.contains('toc-open');
    if (!isOpen && deltaX < 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    isOpen ? closeToc() : openToc();
  }, { passive: false, capture: true });
  document.addEventListener('touchcancel', () => { trackingSwipe = false; }, { passive: true, capture: true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('toc-open')) closeToc({ restoreFocus: true });
  });
  mobileViewport.addEventListener('change', () => closeToc());
  window.addEventListener('scroll', queueSectionUpdate, { passive: true });
  window.addEventListener('resize', queueSectionUpdate, { passive: true });
  closeToc();
  setActiveSection();
}
