(() => {
  const html = document.documentElement;
  const toggle = document.querySelector(".language-toggle");
  let language = localStorage.getItem("language") === "zh" ? "zh" : "en";

  function setLanguage(next) {
    language = next;
    html.lang = next === "zh" ? "zh-CN" : "en";
    localStorage.setItem("language", next);
    document.querySelectorAll("[data-en][data-zh]").forEach((node) => {
      node.textContent = node.dataset[next];
    });
    if (toggle) {
      toggle.classList.toggle("is-zh", next === "zh");
      toggle.setAttribute("aria-label", next === "zh" ? "Switch to English" : "切换到中文");
    }
    document.querySelectorAll(".media-slot[data-media-key] img, .media-slot[data-media-key] video").forEach((media) => {
      const key = media.closest(".media-slot").dataset.mediaKey;
      const item = window.G1_MEDIA?.[key];
      if (!item) return;
      const label = item.alt?.[next] || "G1 project media";
      if (media.tagName === "IMG") media.alt = label;
      else media.setAttribute("aria-label", label);
    });
  }

  function mountMedia() {
    document.querySelectorAll(".media-slot[data-media-key]").forEach((slot) => {
      const item = window.G1_MEDIA?.[slot.dataset.mediaKey];
      if (!item?.src) return;
      let media;
      if (item.type === "video") {
        media = document.createElement("video");
        media.controls = true;
        media.playsInline = true;
        media.preload = "metadata";
        if (item.poster) media.poster = item.poster;
        media.setAttribute("aria-label", item.alt?.[language] || "G1 project video");
      } else {
        media = document.createElement("img");
        media.loading = "lazy";
        media.decoding = "async";
        media.alt = item.alt?.[language] || "G1 project image";
      }
      media.src = item.src;
      media.addEventListener(item.type === "video" ? "loadedmetadata" : "load", () => slot.classList.add("is-loaded"));
      media.addEventListener("error", () => slot.classList.remove("is-loaded"));
      slot.appendChild(media);
    });
  }

  toggle?.addEventListener("click", () => setLanguage(language === "en" ? "zh" : "en"));

  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-25% 0px -60%", threshold: [0, .2, .6] });
  sections.forEach((section) => observer.observe(section));

  mountMedia();
  setLanguage(language);
})();
