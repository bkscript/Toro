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

  const whatsappToggle = document.querySelector("[data-whatsapp-toggle]");
  const whatsappCard = document.querySelector("[data-whatsapp-card]");
  const whatsappClose = document.querySelector("[data-whatsapp-close]");

  if (whatsappToggle && whatsappCard && whatsappClose) {
    const setWhatsappCardOpen = (open, returnFocus = false) => {
      whatsappCard.hidden = !open;
      whatsappToggle.setAttribute("aria-expanded", String(open));
      if (returnFocus) whatsappToggle.focus();
    };

    whatsappToggle.addEventListener("click", () => setWhatsappCardOpen(whatsappCard.hidden));
    whatsappClose.addEventListener("click", () => setWhatsappCardOpen(false, true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !whatsappCard.hidden) setWhatsappCardOpen(false, true);
    });
    document.addEventListener("click", (event) => {
      if (!whatsappCard.hidden && !whatsappCard.contains(event.target) && !whatsappToggle.contains(event.target)) {
        setWhatsappCardOpen(false);
      }
    });
  }

  document.querySelectorAll("[data-whatsapp-time]").forEach((time) => {
    time.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  });

  document.querySelectorAll("[data-whatsapp-form]").forEach((form) => {
    const phone = form.dataset.whatsappPhone;
    const message = form.querySelector("[data-whatsapp-message]");
    if (!phone || !message) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = message.value.trim() || "Hello! I'm interested in your products. Can you help me?";
      const chat = window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      if (chat) chat.opener = null;
    });
  });
})();
