export function createImageLightbox({
  dialog,
  images,
  imageSelector,
  captionSelector,
  closeSelector,
  getSource = (image) => image.currentSrc || image.src,
  label = "image",
}) {
  if (!dialog) return;
  const dialogImage = dialog.querySelector(imageSelector);
  const caption = dialog.querySelector(captionSelector);
  const closeButton = dialog.querySelector(closeSelector);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeImage;
  let closeTimer;

  const close = () => {
    if (!dialog.open) return;
    window.clearTimeout(closeTimer);
    dialog.classList.remove("is-open");
    const finish = () => {
      dialog.close();
      document.body.classList.remove("lightbox-open");
      activeImage?.focus();
    };
    if (reducedMotion.matches) finish();
    else closeTimer = window.setTimeout(finish, 200);
  };

  const open = (image) => {
    if (image.hidden) return;
    window.clearTimeout(closeTimer);
    activeImage = image;
    dialogImage.src = getSource(image);
    dialogImage.alt = image.alt;
    caption.textContent = image.alt;
    caption.hidden = !image.alt;
    document.body.classList.add("lightbox-open");
    dialog.showModal();
    requestAnimationFrame(() => dialog.classList.add("is-open"));
    closeButton?.focus();
  };

  images.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Enlarge image: ${image.alt || label}`);
    image.addEventListener("click", () => open(image));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open(image);
    });
  });

  closeButton?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  return { close, open };
}
