(() => {
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
    const isWhatsappCardOpen = () => whatsappCard.classList.contains("is-open");
    const setWhatsappCardOpen = (open, returnFocus = false) => {
      whatsappCard.classList.toggle("is-open", open);
      whatsappCard.setAttribute("aria-hidden", String(!open));
      whatsappToggle.setAttribute("aria-expanded", String(open));
      if (returnFocus) whatsappToggle.focus();
    };

    setWhatsappCardOpen(false);
    window.addEventListener("pageshow", () => setWhatsappCardOpen(false));
    whatsappToggle.addEventListener("click", () => setWhatsappCardOpen(!isWhatsappCardOpen()));
    whatsappClose.addEventListener("click", () => setWhatsappCardOpen(false, true));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isWhatsappCardOpen()) setWhatsappCardOpen(false, true);
    });
    document.addEventListener("click", (event) => {
      if (isWhatsappCardOpen() && !whatsappCard.contains(event.target) && !whatsappToggle.contains(event.target)) {
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
