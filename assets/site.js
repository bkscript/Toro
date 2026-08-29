(() => {
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  document.querySelectorAll("[data-collections-menu]").forEach((menu) => {
    const trigger = menu.querySelector(".collections-menu__trigger");
    const panel = menu.querySelector(".collections-menu__panel");
    if (!trigger || !panel) return;

    const setOpen = (open) => {
      if (open) {
        document.querySelectorAll("[data-collections-menu]").forEach((otherMenu) => {
          if (otherMenu === menu) return;
          otherMenu.classList.remove("is-open");
          otherMenu.querySelector(".collections-menu__trigger")?.setAttribute("aria-expanded", "false");
        });
      }
      menu.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    trigger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("pointerenter", () => { if (supportsHover.matches) setOpen(true); });
    menu.addEventListener("pointerleave", () => { if (supportsHover.matches) setOpen(false); });
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) setOpen(false);
    });
  });

  document.querySelectorAll("[data-product-gallery]").forEach((gallery) => {
    const mainImage = gallery.querySelector("[data-product-main]");
    const mainWebpSource = mainImage?.closest("picture")?.querySelector('source[type="image/webp"]');
    const thumbnails = [...gallery.querySelectorAll("[data-product-thumb]")];
    if (!mainImage || !thumbnails.length) return;

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", () => {
        mainImage.src = thumbnail.dataset.src;
        if (mainWebpSource && thumbnail.dataset.webpSrc) mainWebpSource.srcset = thumbnail.dataset.webpSrc;
        mainImage.alt = thumbnail.dataset.alt || "";
        thumbnails.forEach((item) => {
          if (item === thumbnail) item.setAttribute("aria-current", "true");
          else item.removeAttribute("aria-current");
        });
      });
    });
  });
})();
