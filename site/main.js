/* Abdulrahman Nagy — portfolio interactions */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n (EN / DE) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const DE = window.I18N_DE || {};
  const originals = new Map();
  $$("[data-i18n]").forEach((el) => originals.set(el, el.innerHTML));

  let roles = [];
  function applyLang(lang) {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = lang === "de" && DE[key] ? DE[key] : originals.get(el);
    });
    $$(".lang-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    roles = (lang === "de" ? window.ROLES_DE : window.ROLES_EN) || [];
    store.set("lang", lang);
  }
  $$(".lang-switch button").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));
  const initial = store.get("lang") || ((navigator.language || "").toLowerCase().startsWith("de") ? "de" : "en");
  applyLang(initial);

  /* ---------- role typewriter ---------- */
  const rot = $(".rot");
  if (rot) {
    let i = 0, pos = 0, deleting = false;
    const tick = () => {
      const word = roles[i % roles.length] || "";
      if (reduced) { rot.textContent = word; i++; return setTimeout(tick, 2600); }
      if (!deleting) {
        pos++;
        rot.textContent = word.slice(0, pos);
        if (pos >= word.length) { deleting = true; return setTimeout(tick, 1700); }
        return setTimeout(tick, 55);
      }
      pos--;
      rot.textContent = word.slice(0, pos);
      if (pos <= 0) { deleting = false; i++; return setTimeout(tick, 250); }
      setTimeout(tick, 28);
    };
    tick();
  }

  /* ---------- nav hide on scroll ---------- */
  const nav = $(".nav");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("hide", y > lastY && y > 400);
    lastY = y;
  }, { passive: true });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = Number(el.dataset.count);
      countIO.unobserve(el);
      if (reduced) { el.firstChild.nodeValue = end; return; }
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.firstChild.nodeValue = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- service spotlight ---------- */
  $$(".service").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- work filters ---------- */
  const filterBtns = $$(".filters button");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      $$(".work-grid .card").forEach((card) => {
        card.hidden = f !== "all" && !card.dataset.cat.split(" ").includes(f);
      });
    });
  });

  /* ---------- video modal ---------- */
  const modal = $(".modal");
  const frame = $(".modal-frame");
  const mTitle = $(".modal-title");
  let lastFocus = null;
  function openModal(src, title, vertical) {
    lastFocus = document.activeElement;
    frame.classList.toggle("vertical", !!vertical);
    frame.innerHTML = `<iframe src="${src}" title="${title.replace(/"/g, "&quot;")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    mTitle.textContent = title;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".modal-close").focus();
  }
  function closeModal() {
    modal.classList.remove("open");
    frame.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-embed]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // allow open-in-new-tab
      e.preventDefault();
      openModal(a.dataset.embed, a.dataset.title || a.getAttribute("aria-label") || "", a.dataset.vertical === "1");
    });
  });
  $(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  /* ---------- inline films: sound toggle + play only while visible ---------- */
  $$(".film").forEach((wrap) => {
    const v = $("video", wrap);
    const btn = $(".sound", wrap);
    btn.addEventListener("click", () => {
      v.muted = !v.muted;
      if (!v.muted) v.play().catch(() => {});
      btn.setAttribute("aria-pressed", String(!v.muted));
      btn.setAttribute("aria-label", v.muted ? "Unmute" : "Mute");
      btn.innerHTML = v.muted ? ICON_MUTED : ICON_SOUND;
    });
    if (!reduced) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      }, { threshold: 0.35 }).observe(v);
    }
  });

  /* hero video: skip autoplay for reduced motion or data saver */
  const heroV = $(".hero-bg video");
  if (heroV && (reduced || (navigator.connection && navigator.connection.saveData))) {
    heroV.removeAttribute("autoplay");
    heroV.pause();
  }

  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();

const ICON_MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/></svg>';
const ICON_SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
