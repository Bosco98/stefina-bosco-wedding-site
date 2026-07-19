/* ══════════════════════════════════════════════════════════════
   Bosco & Stefina — /stephens choreography
   Tap the wax seal → the envelope opens → a Lenis smooth-scroll
   journey through the invitation (blue azulejo · marigold · lace).
   ══════════════════════════════════════════════════════════════ */

/* .js is added inline in <head> so the sealed envelope is the opening
   frame. If any CDN never arrived, fall back to the static, scrollable
   page rather than a dead sealed envelope. */
if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
  document.documentElement.classList.remove("js");
  throw new Error("A dependency (GSAP / ScrollTrigger / Lenis) failed to load — static fallback");
}

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Reduced motion: skip the seal lock and smooth scroll entirely.
      Reveal everything, open the envelope statically, native scroll. ── */
if (reduced) {
  const opened = document.getElementById("opened");
  const sealed = document.getElementById("sealed");
  if (opened) { opened.style.opacity = 1; }
  if (sealed) { sealed.style.display = "none"; }
  ScrollTrigger.refresh();
} else {
  runAnimated();
}

function runAnimated() {
  /* lock the page until the guest opens the envelope */
  root.classList.add("is-sealed");

  /* ── Lenis smooth scroll, wired into the GSAP ticker ── */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4
  });
  lenis.stop();                                   // sealed: no scroll yet
  window.__lenis = lenis;                          // handle for tooling / a11y
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ── 1. Tap to open → the card rises out → dissolve into P3 ──── */

  const stage   = document.getElementById("stage");
  const sealed  = document.getElementById("sealed");
  const opened  = document.getElementById("opened");
  const tapHint = document.getElementById("tapHint");
  let isOpen = false;

  // the sealed envelope lives in a full-screen overlay so, once opened, it
  // can dissolve away and reveal the wedding-name slide (P3) beneath it
  stage.classList.add("is-overlay");

  function open() {
    if (isOpen) return;
    isOpen = true;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        stage.style.display = "none";        // overlay gone; P3 is now the top
        root.classList.remove("is-sealed");  // unlock the page
        lenis.start();
        ScrollTrigger.refresh();
      }
    });

    tl
      // the wax seal lifts away — never cracked (a broken seal reads as ill omen)
      .to("#envSeal", { scale: 1.5, autoAlpha: 0, rotate: 8, duration: 0.45, ease: "power2.in" }, 0)
      .to(tapHint,    { autoAlpha: 0, y: -10, duration: 0.3 }, 0)
      // the sealed envelope opens into the same envelope, now unsealed
      .to(sealed,     { autoAlpha: 0, scale: 1.03, duration: 0.5, ease: "power1.inOut" }, 0.16)
      .set(sealed,    { display: "none" }, 0.64)
      .fromTo(opened, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0.28)
      // the flap swings up and open
      .fromTo(".op-flap", { rotateX: -150, transformOrigin: "50% 100%" },
                          { rotateX: 0, duration: 0.7, ease: "power2.out" }, 0.32)
      // the invitation card rises up and OUT of the envelope
      .fromTo(".op-card", { yPercent: 44, autoAlpha: 0, scale: 0.9 },
                          { yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.85, ease: "back.out(1.5)" }, 0.5)
      .fromTo(".op-pocket", { yPercent: 10, autoAlpha: 0 },
                            { yPercent: 0, autoAlpha: 1, duration: 0.5 }, 0.48)
      // it settles, lifted clear of the envelope, and holds a beat
      .to(".op-card", { y: -12, duration: 0.7, ease: "sine.out" }, 1.3)

      // ── dissolve into the wedding-name slide (P3) ──
      .addLabel("diss", 1.95)
      .to(stage, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, "diss")
      .fromTo("#hero", { autoAlpha: 0.3, scale: 1.05, transformOrigin: "50% 40%" },
                       { autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" }, "diss")
      .fromTo("#hero .hero-eyebrow, #hero .hero-title",
              { autoAlpha: 0, y: 24, filter: "blur(9px)" },
              { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, stagger: 0.14, ease: "power3.out" }, "diss+=0.25");
  }

  // the whole sealed area opens on tap/click
  sealed.addEventListener("click", open);
  sealed.style.cursor = "pointer";

  /* idle life while sealed: the envelope breathes, the seal glimmers */
  gsap.to("#env", { y: -8, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to("#envSeal", { scale: 1.04, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

  /* ── 2. Section reveals ─────────────────────────────────────── */

  // wrap each word so typewriter lines can bloom in one at a time
  document.querySelectorAll("[data-words]").forEach((el) => {
    el.innerHTML = el.innerHTML.trim().split(/\s+/)
      .map((w) => `<span class="w" style="display:inline-block">${w}</span>`).join(" ");
  });

  // simple blur-up reveals for [data-reveal]
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.fromTo(el,
      { autoAlpha: 0, y: 26, filter: "blur(8px)" },
      {
        autoAlpha: 1, y: 0, filter: "blur(0px)",
        duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" }
      }
    );
  });

  // word-by-word reveals for typewriter paragraphs
  document.querySelectorAll("[data-words]").forEach((el) => {
    gsap.fromTo(el.querySelectorAll(".w"),
      { autoAlpha: 0, y: 14, filter: "blur(5px)" },
      {
        autoAlpha: 1, y: 0, filter: "blur(0px)",
        duration: 0.7, stagger: 0.05, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" }
      }
    );
  });

  /* ── 3. Hero church frame — a gentle scrubbed rise ──────────── */
  gsap.fromTo("#heroFrame",
    { y: 60, scale: 0.94 },
    {
      y: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: "#heroFrame", start: "top 92%", end: "top 45%", scrub: 0.6 }
    }
  );

  /* ── 4. Photo reel — falls down out of the silver slot as you scroll.
        The .film-feed clips its top, so it reads as fed through the slot. ── */
  gsap.fromTo("#filmStrip",
    { yPercent: -100 },
    {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".film", start: "top 88%", end: "top 40%", scrub: 0.7 }
    }
  );

  /* ── 5. Car drives in from the left, cans jiggling ──────────── */
  const carTl = gsap.timeline({
    scrollTrigger: { trigger: "#finale", start: "top 72%", toggleActions: "play none none none" }
  });
  carTl
    .fromTo("#carWrap", { x: "-115%", rotate: -1 },
      { x: "0%", rotate: 0, duration: 1.1, ease: "power2.out" })
    .to("#carWrap", { x: "+=6", yoyo: true, repeat: 3, duration: 0.09, ease: "sine.inOut" }, 0.5)
    .fromTo(".can", { rotate: 0 },
      { rotate: 34, yoyo: true, repeat: 5, duration: 0.12, stagger: 0.03, ease: "sine.inOut" }, 0.35);

  /* ── 6. Blossom parallax (a few px against the scroll) ──────── */
  document.querySelectorAll(".bloom").forEach((b) => {
    const drift = parseFloat(b.dataset.drift) || 0;
    if (!drift) return;
    gsap.fromTo(b, { y: drift }, {
      y: -drift, ease: "none",
      scrollTrigger: { trigger: b.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.8 }
    });
  });

  /* recalc once fonts + imagery settle */
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
