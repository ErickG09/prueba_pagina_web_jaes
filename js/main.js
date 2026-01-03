(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  /* =========================
     Topbar
     - Burger: abre/cierra menú móvil 
  ========================= */
  const initTopbar = () => {
    const topbar = qs(".s-topbar");
    if (!topbar) return;
    const burger = qs(".topbar__burger", topbar);
    const navLinks = qsa(".topbar__menu a", topbar);
    const setOpen = (open) => {
      topbar.classList.toggle("is-open", open);
      if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    };
    if (burger) {
      burger.addEventListener("click", () => {
        setOpen(!topbar.classList.contains("is-open"));
      });
    }
    navLinks.forEach((a) => a.addEventListener("click", () => setOpen(false)));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    const getY = () =>
      window.scrollY ??
      window.pageYOffset ??
      document.documentElement.scrollTop ??
      0;

    let ticking = false;
    const applyScrolled = () => {
      ticking = false;
      topbar.classList.toggle("is-scrolled", getY() > 10);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(applyScrolled);
    };

    applyScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", applyScrolled, { passive: true });
    window.addEventListener("resize", applyScrolled, { passive: true });
  };

  const initActiveLinks = () => {
    const links = qsa(".topbar__menu a");
    if (!links.length) return;

    const setActiveByHash = () => {
      const hash = window.location.hash || "#home";
      links.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === hash);
      });
    };

    window.addEventListener("hashchange", setActiveByHash);
    setActiveByHash();
  };

  const initReveal = () => {
    const revealEls = qsa(".reveal");
    if (!revealEls.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const forceVisibleInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach((el) => {
        if (el.classList.contains("is-in")) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) el.classList.add("is-in");
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target); // solo animar una vez
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px 12% 0px",
      }
    );

    revealEls.forEach((el) => io.observe(el));

    forceVisibleInView();
    window.addEventListener("load", forceVisibleInView, { passive: true });
    window.addEventListener("resize", forceVisibleInView, { passive: true });
    window.addEventListener("scroll", forceVisibleInView, { passive: true });
  };

  document.addEventListener("DOMContentLoaded", () => {
    /* Marca el body como listo en el siguiente frame para que la animación arranque suave */
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));

    initTopbar();
    initActiveLinks();
    initReveal();
  });
})();