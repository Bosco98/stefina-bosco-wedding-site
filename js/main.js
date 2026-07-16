/* ══════════════════════════════════════════════════════════════
   Bosco & Stefina — scroll choreography
   One pinned master timeline: sealed envelope → wax snaps →
   flap lifts → the painting blooms out of the envelope.
   ══════════════════════════════════════════════════════════════ */

/* the .js class is added inline in <head> so the envelope room is
   there at first paint; if the GSAP CDN never arrived, fall back to
   the static no-JS presentation instead of a dead sealed envelope */
if (!window.gsap || !window.ScrollTrigger) {
  document.documentElement.classList.remove("js");
  throw new Error("GSAP failed to load — using static fallback");
}

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add("(prefers-reduced-motion: no-preference)", () => {

  /* ── 1. The intro — a single pinned, scrubbed sequence.
        Everything happens inside one viewport: no dead zones. ── */

  const intro = gsap.timeline({
    scrollTrigger: {
      trigger: "#intro",
      start: "top top",
      end: "+=260%",
      scrub: 0.5,
      pin: true,
      anticipatePin: 1
    },
    defaults: { ease: "none" }
  });

  intro
    // the hint retires as soon as the guest commits
    .to("#envHint", { autoAlpha: 0, y: -12, duration: 0.05 }, 0)
    // unlike the hint, the arrow stays for the whole pinned sequence —
    // the page isn't visually moving yet, so it keeps asking for scroll
    // until just before the pin releases
    .to("#envArrow", { autoAlpha: 0, duration: 0.08 }, 0.88)

    // the wax releases whole: a brief press, then the seal lifts off
    // the paper intact and dissolves — never broken (a cracked seal
    // reads as a bad omen)
    .to("#envSealWrap", { scale: 1.05, duration: 0.025, ease: "power1.out" }, 0.03)
    .to("#envSealWrap", { y: -34, scale: 1.16, autoAlpha: 0, duration: 0.085, ease: "power1.in" }, 0.06)

    // the flap lifts past the guest; its inner face darkens as it turns
    .to("#envFlap", { rotateX: -168, duration: 0.16, ease: "power1.inOut" }, 0.13)
    .to(".env-flap-inner", { opacity: 1, duration: 0.08 }, 0.17)
    .set("#envFlap", { zIndex: 1 }, 0.21)

    // the card rises just far enough to be read…
    .to("#envCard", { yPercent: -78, scale: 1.08, duration: 0.10, ease: "power1.out" }, 0.26)

    // …then the painting blooms out of the card's spot while the same
    // growing circle eats the envelope room away — one morph, no fade:
    // the hero renders exactly where the envelope disappears
    .to("#envCard", { yPercent: -100, scale: 1.7, autoAlpha: 0, duration: 0.14, ease: "power2.in" }, 0.36)
    .to("#introHero", { "--bloom": "175%", duration: 0.36, ease: "none" }, 0.32)
    .to("#envLayer", { "--hole": "175%", duration: 0.36, ease: "none" }, 0.32)
    .to(".envelope", { scale: 1.12, y: 30, duration: 0.2, ease: "power1.in" }, 0.36)
    .set("#envLayer", { autoAlpha: 0 }, 0.72)

    // names settle into the sky
    .fromTo("#heroTitles [data-reveal]",
      { autoAlpha: 0, y: 26, filter: "blur(10px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.16, stagger: 0.035, ease: "power2.out" }, 0.58)

    // and the painting breathes gently until the pin releases — anchored to
    // its bottom edge so it grows upward and never overhangs the section
    // foot (an overhang gets clipped into a hard straight line)
    .fromTo("#heroChurch", { scale: 1.05, transformOrigin: "50% 100%" },
      { scale: 1, duration: 0.40, ease: "none" }, 0.56);

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
