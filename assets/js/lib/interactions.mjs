const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapTabKey(event, container) {
  if (event.key !== "Tab") return;
  const items = [...container.querySelectorAll(focusableSelector)].filter(
    (item) => !item.hidden && item.getAttribute("aria-hidden") !== "true",
  );
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function listenForHorizontalSwipe({
  target = document,
  mediaQuery,
  onSwipe,
  capture = false,
  stopPropagation = false,
  threshold = 56,
}) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onStart = (event) => {
    tracking = mediaQuery.matches && event.touches.length === 1;
    if (!tracking) return;
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  };
  const onEnd = (event) => {
    if (!tracking || event.changedTouches.length !== 1) return;
    tracking = false;
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    if (
      Math.abs(deltaX) <= threshold ||
      Math.abs(deltaX) <= Math.abs(deltaY) * 1.35
    ) {
      return;
    }
    const handled = onSwipe(deltaX < 0 ? "left" : "right");
    if (!handled) return;
    event.preventDefault();
    if (stopPropagation) event.stopImmediatePropagation();
  };
  const onCancel = () => {
    tracking = false;
  };
  const options = { passive: true, capture };

  target.addEventListener("touchstart", onStart, options);
  target.addEventListener("touchend", onEnd, {
    passive: false,
    capture,
  });
  target.addEventListener("touchcancel", onCancel, options);

  return () => {
    target.removeEventListener("touchstart", onStart, options);
    target.removeEventListener("touchend", onEnd, { capture });
    target.removeEventListener("touchcancel", onCancel, options);
  };
}
