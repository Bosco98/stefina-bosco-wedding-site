/* ══════════════════════════════════════════════════════════════
   Stefina & Bosco — /palliyils choreography
   TAP TO OPEN: the page is held on a sealed envelope; a tap plays
   the open sequence (wax dissolves → flap lifts → the painting
   blooms out of the card) and comes to REST at the couple's names.
   Scroll then unlocks for the rest of the page.

   This is a route-specific copy of js/main.js — only the intro
   (section 1) differs (tap-driven timeline vs the main site's
   scroll-pinned scrub), so /correas is left untouched.
   ══════════════════════════════════════════════════════════════ */

/* the .js class is added inline in <head> so the envelope room is
   there at first paint; if the GSAP CDN never arrived, fall back to
   the static no-JS presentation instead of a dead sealed envelope */
if (!window.gsap || !window.ScrollTrigger) {
  document.documentElement.classList.remove("js");
  throw new Error("GSAP failed to load — using static fallback");
}

gsap.registerPlugin(ScrollTrigger);

// optional: a controlled glide to the invitation after the envelope opens.
// If the CDN missed, we fall back to native smooth scroll below.
const canGlide = !!window.ScrollToPlugin;
if (canGlide) gsap.registerPlugin(ScrollToPlugin);

/* "Play again" restarts the whole experience from the sealed envelope.
   Wired at top level so it works under reduced motion too: it flags a
   replay and reloads; on the fresh load the open sequence auto-plays. */
(() => {
  const btn = document.getElementById("playAgain");
  if (!btn) return;
  btn.addEventListener("click", () => {
    try { sessionStorage.setItem("pl_replay", "1"); } catch (e) { /* private mode */ }
    location.reload();
  });
})();

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {

  /* ── 1. The intro — TAP TO OPEN.
        The page is locked on the sealed envelope until the guest taps;
        the open sequence then plays as a timed animation and comes to
        rest at the couple's names. Scroll unlocks on completion. ── */

  const root = document.documentElement;
  root.classList.add("is-sealed");                     // hold the page at the top

  // the hero titles wait, invisible, behind the still-closed bloom
  gsap.set("#heroTitles [data-reveal]", { autoAlpha: 0 });

  // gentle idle life invites the tap
  const idle = gsap.to(".envelope",
    { y: -8, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  const sealPulse = gsap.to("#envSealWrap",
    { scale: 1.05, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

  const introTL = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.out" },
    onComplete: () => {
      root.classList.remove("is-sealed");              // release the page to scroll
      ScrollTrigger.refresh();

      // …then keep going: after a beat on the names, glide down and come
      // to rest on the invitation's opening line ("With hearts full of
      // joy, and with the blessings of…"), not on the church hero.
      // Gentle guided descent: ease slowly down to each anchor, settle for a
      // beat, then move on. The Ceremony and Reception are their own anchors
      // so the descent slows through them instead of skimming past.
      //
      // Leg time is proportional to distance (steady slow speed), so adding
      // anchors does NOT lengthen the journey — it only adds brief slow-downs.
      const HOLD = 0.25;                 // barely a beat at each anchor
      const SPEED = 5.5;                 // seconds per viewport of travel (slow, steady)
      const MIN_LEG = 2.5;               // even a short hop eases gently
      const vh = window.innerHeight;
      const OFFSET = Math.round(vh * 0.1);   // leave a little room above each anchor

      const resolveY = (s) => {
        if (s === "max") return Math.max(0, document.documentElement.scrollHeight - vh);
        const el = document.querySelector(s);
        if (!el) return null;
        return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY) - OFFSET);
      };

      const targets = [];
      ["#interlude1", "#details", "#actCeremony", "#actReception", "#interlude2", "#gallery", "#closing", "max"]
        .forEach((s) => {
          const y = resolveY(s);
          if (y == null) return;
          // skip anchors that resolve to essentially the same spot as the last
          // one (e.g. the two acts sit side-by-side on desktop)
          if (targets.length && Math.abs(y - targets[targets.length - 1]) < 60) return;
          targets.push(y);
        });

      if (canGlide && targets.length) {
        const journey = gsap.timeline({ paused: true });
        let prev = window.scrollY;
        targets.forEach((y, i) => {
          const dur = Math.max(MIN_LEG, (Math.abs(y - prev) / vh) * SPEED);
          prev = y;
          journey.to(window, {
            duration: dur, ease: "sine.inOut",
            scrollTo: { y: y, autoKill: true }
          }, i === 0 ? 0 : "+=" + HOLD);
        });

        // the moment the guest scrolls or presses a key, hand control back
        const halt = () => { journey.kill(); off(); };
        function off() {
          window.removeEventListener("wheel", halt);
          window.removeEventListener("touchstart", halt);
          window.removeEventListener("keydown", halt);
        }
        journey.eventCallback("onComplete", off);
        window.addEventListener("wheel", halt, { passive: true });
        window.addEventListener("touchstart", halt, { passive: true });
        window.addEventListener("keydown", halt);

        gsap.delayedCall(0.7, () => journey.play());
      } else {
        const verse = document.getElementById("interlude1");
        gsap.delayedCall(0.7, () => {
          if (verse) verse.scrollIntoView({ behavior: "smooth", block: "start" });
          gsap.delayedCall(4, () =>
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" }));
        });
      }
    }
  });

  introTL
    // the hint and scroll-cue retire the moment the guest commits
    .to("#envHint",  { autoAlpha: 0, y: -12, duration: 0.4 }, 0)
    .to("#envArrow", { autoAlpha: 0, duration: 0.3 }, 0)

    // the wax dissolves whole — never cracked (a broken seal reads as ill omen)
    .to("#envSealWrap", { autoAlpha: 0, scale: 1.7, duration: 0.55, ease: "power3.out" }, 0.1)

    // the flap lifts past the guest; its inner face darkens as it turns
    .to("#envFlap", { rotateX: -168, duration: 0.75, ease: "power1.inOut" }, 0.35)
    .to(".env-flap-inner", { opacity: 1, duration: 0.35 }, 0.45)
    .set("#envFlap", { zIndex: 1 }, 0.6)

    // the card rises just far enough to be read…
    .to("#envCard", { yPercent: -78, scale: 1.08, duration: 0.55, ease: "power1.out" }, 0.95)

    // …then the painting blooms out of the card's spot while the same
    // growing circle eats the envelope room away — one morph, no fade
    .to("#envCard", { yPercent: -100, scale: 1.7, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 1.5)
    .to("#introHero", { "--bloom": "175%", duration: 1.15, ease: "power1.inOut" }, 1.35)
    .to("#envLayer",  { "--hole": "175%", duration: 1.15, ease: "power1.inOut" }, 1.35)
    .to(".envelope",  { scale: 1.12, y: 30, duration: 0.8, ease: "power1.in" }, 1.4)
    .set("#envLayer", { autoAlpha: 0 }, 2.5)

    // the couple's names settle into the sky — this is the resting frame
    .fromTo("#heroTitles [data-reveal]",
      { autoAlpha: 0, y: 26, filter: "blur(10px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.12, ease: "power2.out" }, 2.15)

    // the painting eases to rest — anchored to its bottom edge so it grows
    // upward and never overhangs the section foot
    .fromTo("#heroChurch", { scale: 1.06, transformOrigin: "50% 100%" },
      { scale: 1, duration: 1.6, ease: "power2.out" }, 2.0);

  let opened = false;
  function open() {
    if (opened) return;
    opened = true;
    idle.kill();
    sealPulse.kill();
    gsap.set(".envelope", { y: 0 });                   // clear idle offsets before the run
    gsap.set("#envSealWrap", { scale: 1 });
    introTL.play();
  }

  // the whole sealed envelope room is the tap target
  const envLayer = document.getElementById("envLayer");
  envLayer.style.cursor = "pointer";
  envLayer.setAttribute("role", "button");
  envLayer.setAttribute("tabindex", "0");
  envLayer.setAttribute("aria-label", "Tap to open your invitation");
  envLayer.addEventListener("click", open);
  envLayer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });

  // "Play again" surfaces as the closing (resealed) envelope arrives
  const playBtn = document.getElementById("playAgain");
  if (playBtn) {
    gsap.fromTo(playBtn,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: "#miniEnvelope", start: "top 78%", toggleActions: "play none none reverse" }
      });
  }

  // arrived here via "Play again"? replay the open sequence straight away,
  // no second tap needed
  if (sessionStorage.getItem("pl_replay")) {
    sessionStorage.removeItem("pl_replay");
    gsap.delayedCall(0.4, open);
  }

  /* ── 2. Interludes — verses diffuse in like pigment ───────── */

  document.querySelectorAll(".interlude").forEach((section) => {
    gsap.fromTo(section.querySelector(".interlude-inner"),
      { autoAlpha: 0, scale: 0.94, filter: "blur(14px)" },
      {
        autoAlpha: 1, scale: 1, filter: "blur(0px)",
        duration: 1.4, ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 55%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });

  /* ── 3. Details — words bloom in over the living watercolor ── */

  // wrap each word so it can be revealed individually
  document.querySelectorAll("#details [data-words]").forEach((el) => {
    el.innerHTML = el.innerHTML.trim().split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`).join(" ");
  });

  gsap.fromTo("#details .details-open .w, #details .details-parents .w",
    { autoAlpha: 0, y: 18, filter: "blur(6px)" },
    {
      autoAlpha: 1, y: 0, filter: "blur(0px)",
      duration: 0.8, stagger: 0.045, ease: "power2.out",
      scrollTrigger: { trigger: "#details", start: "top 62%", toggleActions: "play none none none" }
    }
  );

  gsap.fromTo("#details .details-names",
    { autoAlpha: 0, y: 34, filter: "blur(12px)" },
    {
      autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: "#details .details-names", start: "top 74%", toggleActions: "play none none none" }
    }
  );
  gsap.fromTo("#details .details-sub .w",
    { autoAlpha: 0, y: 16, filter: "blur(6px)" },
    {
      autoAlpha: 1, y: 0, filter: "blur(0px)",
      duration: 0.8, stagger: 0.05, ease: "power2.out",
      scrollTrigger: { trigger: "#details .details-names", start: "top 68%", toggleActions: "play none none none" }
    }
  );

  // each act settles as its own moment: sprig drifts down, time rises
  // out of a clip, the gold rule draws itself
  document.querySelectorAll("#details .act").forEach((act) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: act, start: "top 72%", toggleActions: "play none none none" },
      defaults: { ease: "power3.out" }
    });
    tl.fromTo(act.querySelector(".act-sprig"),
        { autoAlpha: 0, y: -22 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
      .fromTo(act.querySelector(".act-label"),
        { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.1)
      .fromTo(act.querySelector(".act-time"),
        { clipPath: "inset(0 0 100% 0)", y: 26 },
        { clipPath: "inset(0 0 -8% 0)", y: 0, duration: 1 }, 0.18)
      .fromTo(act.querySelector(".act-rule"),
        { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, 0.42)
      .fromTo([act.querySelector(".act-date"), act.querySelector(".act-venue"), act.querySelector(".act-place"), act.querySelector(".act-map")],
        { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.5);
  });

  gsap.fromTo("#details .acts-divider",
    { scaleY: 0 },
    {
      scaleY: 1, duration: 1.2, ease: "power2.inOut",
      scrollTrigger: { trigger: "#details .acts", start: "top 70%", toggleActions: "play none none none" }
    }
  );

  /* ── 4. Gallery frames — 3D in two layers.

        Entry (scrubbed to the frames' own travel up the screen):
        each frame lies deep in the page, hinged back and turned
        toward the center like an open gatefold, casting a wide
        soft shadow; by mid-viewport it stands upright and the
        shadow tightens under the settled paper.

        Wobble (scroll velocity): fast scrolling tips the whole
        shelf of frames away in perspective; when the scroll rests
        it springs back level with a papery wibble.

        (The resting paper tilt is the CSS `rotate` property, which
        composes with these 3D transforms and is never touched.) ── */

  const frameShadowFar  = "0 70px 60px -30px rgba(42, 20, 32, 0.45)";
  const frameShadowRest = "0 6px 8px -4px rgba(42, 20, 32, 0.25)";

  [[".frame--left", 1], [".frame--right", -1]].forEach(([sel, side]) => {
    gsap.fromTo(sel,
      {
        autoAlpha: 0,
        x: -46 * side, y: 110, z: -220, scale: 0.92,
        rotateX: 26, rotateY: 34 * side,
        boxShadow: frameShadowFar
      },
      {
        autoAlpha: 1,
        x: 0, y: 0, z: 0, scale: 1,
        rotateX: 0, rotateY: 0,
        boxShadow: frameShadowRest,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".gallery-frames",
          start: "top 95%",
          end: "top 45%",
          scrub: 0.6
        }
      }
    );
  });

  const shelfTip = { rot: 0 };
  const tipSetter = gsap.quickSetter(".gallery-frames", "rotateX", "deg");
  const tipClamp = gsap.utils.clamp(-12, 12);

  ScrollTrigger.create({
    trigger: "#gallery",
    start: "top bottom",
    end: "bottom top",
    onUpdate(self) {
      const rot = tipClamp(self.getVelocity() / 120);
      // only take over when the new impulse outweighs what's still settling
      if (Math.abs(rot) > Math.abs(shelfTip.rot)) {
        shelfTip.rot = rot;
        gsap.to(shelfTip, {
          rot: 0,
          duration: 1.4,
          ease: "elastic.out(1, 0.45)",
          overwrite: true,
          onUpdate: () => tipSetter(shelfTip.rot)
        });
      }
    }
  });

  /* ── 5. Blossoms — sprays that dissolve with their section:
        pigment gathers (blur clears) as the section arrives, and
        diffuses away as it leaves. A gentle parallax drift (a few px
        against the scroll, per-element via data-drift) sits on top;
        GSAP folds each spray's CSS flip/rotation into its own
        transform, so those survive the drift. ── */

  document.querySelectorAll(".blossom").forEach((b) => {
    const trigger = {
      trigger: b.closest("section"),
      start: "top bottom",
      end: "bottom top",
      scrub: 0.8
    };
    const tl = gsap.timeline({ scrollTrigger: trigger, defaults: { ease: "none" } });
    tl.fromTo(b,
        { autoAlpha: 0, filter: "blur(14px)" },
        { autoAlpha: 1, filter: "blur(0px)", duration: 0.3, ease: "power1.out" }, 0.06)
      .to(b, { autoAlpha: 0, filter: "blur(14px)", duration: 0.26, ease: "power1.in" }, 0.72);

    const drift = parseFloat(b.dataset.drift) || 0;
    if (drift) {
      gsap.fromTo(b, { y: drift }, { y: -drift, ease: "none", scrollTrigger: { ...trigger } });
    }
  });

  /* ── 6. Closing — the card folds back into the envelope ──── */

  // end at max scroll: the mini envelope sits at the page foot, so a
  // viewport-relative end would be unreachable and the seal would never stamp
  const sealTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#miniEnvelope",
      start: "top 95%",
      end: "max",
      scrub: 0.6
    },
    defaults: { ease: "none" }
  });

  sealTl
    // the envelope rises and settles into the stage's center at exactly
    // the intro envelope's size and spot — the last frame is the first
    .fromTo(".mini-env-body",
      { y: 150, scale: 0.55, transformOrigin: "50% 50%" },
      { y: 0, scale: 1, duration: 1, ease: "power1.out" }, 0)
    .fromTo("#miniFlap", { rotateX: -180 }, { rotateX: 0, duration: 0.35 }, 0.3)
    .fromTo("#miniSeal",
      { opacity: 0, scale: 1.7 },
      { opacity: 1, scale: 1, duration: 0.18, ease: "power3.in" }, 0.68)
    .fromTo(".mini-env-caption",
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.15 }, 0.85);
});

/* Reduced motion: CSS hides the envelope layer and unmasks the hero. */

/* ══════════════════════════════════════════════════════════════
   Living watercolor — one WebGL fragment-shader painter drives
   every washed surface (details, both interludes, the closing).

   - "light" variant: rani-pink and gold pigment floating on the
     page cream, with a calm zone behind the text.
   - "dark" variant: a very light plum veil with soft pink blooms
     and gold flecks — pale enough for ink text. Its top and bottom
     edges are torn by noise, so the color dissolves into the page
     like a real brush stroke — no hard section lines.
   - The pigment field slides with scroll (u_scroll) and breathes
     with time; each canvas gets its own seed so no two match.
   - Fallbacks: without WebGL the CSS image backgrounds remain;
     under prefers-reduced-motion each canvas paints one still
     frame and never animates.
   ══════════════════════════════════════════════════════════════ */

(() => {
  const VERT = `
    attribute vec2 a;
    void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

  const FRAG = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_scroll;
    uniform float u_dark;
    uniform float u_seed;
    uniform float u_cover;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.03 + vec2(17.3, 9.1);
        a *= 0.55;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 1.7 + u_seed * 11.0;
      float t = u_time * 0.06;

      /* the field slides as the guest scrolls — pigment streams past */
      p.y += u_scroll * 1.7;

      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
      vec2 r = vec2(fbm(p + 2.1 * q + vec2(1.7, 9.2) + t * 0.3), fbm(p + 2.3 * q + vec2(8.3, 2.8)));
      float f = fbm(p + 2.0 * r - t * 0.25);

      /* torn edges: the wash's boundary wanders like a drying brush line.
         Noise varies in BOTH axes (x-only noise smears into streaks), the
         feather is tight, and a guard forces alpha to zero before the box
         edge so no straight line can ever show. */
      float eCoarse = fbm(vec2(p.x * 1.8, uv.y * 4.0 + u_seed * 3.0));
      float eFine = noise(vec2(p.x * 7.0, uv.y * 14.0 + u_seed * 5.0));
      float torn = (eCoarse - 0.5) * 0.22 + (eFine - 0.5) * 0.06;
      float band = smoothstep(0.02, 0.24, (1.0 - uv.y) + torn)
                 * smoothstep(0.02, 0.24, uv.y + torn);
      band *= smoothstep(0.0, 0.025, uv.y) * smoothstep(1.0, 0.975, uv.y);

      float depth = 0.55 + 0.45 * (1.0 - abs(u_scroll - 0.5) * 2.0);
      float cov = smoothstep(0.44, 0.92, f) * depth;
      float gold = smoothstep(0.58, 0.98, fbm(p * 2.4 + r * 1.6 + vec2(3.7, 7.7)));

      /* calm zone: pigment recedes behind the centered verse */
      float d = distance(uv, vec2(0.5, 0.52));
      cov *= 0.35 + 0.65 * smoothstep(0.14, 0.52, d);

      vec3 cream = vec3(0.980, 0.953, 0.910);
      vec3 pinkC = vec3(0.835, 0.000, 0.427);
      vec3 goldC = vec3(0.776, 0.631, 0.357);
      /* very light plum: a pale mauve veil that still reads as
         pigment, with ink text sitting on top */
      vec3 plum  = vec3(0.878, 0.780, 0.843);
      vec3 plumHi = vec3(0.953, 0.910, 0.937);

      /* light: floating pigment on the page cream */
      vec3 lightCol = mix(cream, pinkC, 0.55);
      lightCol = mix(lightCol, goldC, gold * 0.5);
      float lightA = cov * band * 0.55;

      /* dark: layered wine washes — translucent, marbled, never a slab.
         Density varies with the marble so cream breathes through like
         overlapping brush passes. */
      float marble = fbm(p * 1.3 + r);
      float glow = smoothstep(0.55, 0.94, fbm(p * 1.1 + q * 1.4 + vec2(2.2, 4.4) + t * 0.5));
      vec3 darkCol = mix(plum, plumHi, marble * 0.85);
      darkCol = mix(darkCol, pinkC, glow * 0.22);
      darkCol = mix(darkCol, goldC, gold * smoothstep(0.5, 1.0, marble) * 0.16);
      /* lighten toward cream behind the centered text so ink stays legible */
      darkCol = mix(darkCol, cream, 0.45 * smoothstep(0.55, 0.05, d));
      float darkA = band * (0.72 + marble * 0.16 + cov * 0.08 + u_cover * 0.04)
                  * (0.9 + 0.1 * smoothstep(0.5, 0.1, d)); /* fullest behind the text */

      vec3 col = mix(lightCol, darkCol, u_dark);
      float a = mix(lightA, darkA, u_dark) * max(u_cover, 1.0 - u_dark);

      /* paper grain */
      col += (hash(gl_FragCoord.xy) - 0.5) * 0.03;

      gl_FragColor = vec4(col * a, a); /* premultiplied */
    }`;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initWC(canvas) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return false;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      scroll: gl.getUniformLocation(prog, "u_scroll"),
      dark: gl.getUniformLocation(prog, "u_dark"),
      seed: gl.getUniformLocation(prog, "u_seed"),
      cover: gl.getUniformLocation(prog, "u_cover")
    };

    const dark = canvas.dataset.wc === "dark" ? 1 : 0;
    const seed = parseFloat(canvas.dataset.seed || "1");
    const cover = parseFloat(canvas.dataset.cover || "1");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.7; // soft pigment needs no crisp pixels
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    let scrollPos = 0.5;
    let running = false;
    let rafId = 0;

    function frame(ms) {
      resize();
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, ms / 1000);
      gl.uniform1f(u.scroll, scrollPos);
      gl.uniform1f(u.dark, dark);
      gl.uniform1f(u.seed, seed);
      gl.uniform1f(u.cover, cover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (running && !reduced) rafId = requestAnimationFrame(frame);
    }

    const section = canvas.closest("section");
    section.classList.add("wc-live");

    if (reduced) {
      requestAnimationFrame(frame);
      return true;
    }

    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => { scrollPos = self.progress; },
      onToggle: (self) => {
        running = self.isActive;
        if (running) rafId = requestAnimationFrame(frame);
        else cancelAnimationFrame(rafId);
      }
    });
    return true;
  }

  document.querySelectorAll("canvas.wc").forEach(initWC);
})();

/* Recalculate trigger positions once all imagery has loaded. */
window.addEventListener("load", () => ScrollTrigger.refresh());
