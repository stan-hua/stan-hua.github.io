/* ==========================================================================
   Pixel hanabi.

   Click anywhere that isn't text or a control and a shell opens there, drawn
   the way Japanese fireworks are drawn rather than photographed: pixel stars
   on radiating lines, snapped to a fixed grid. It always paints behind the
   page, so a burst never sits on top of anything being read.

   Every click picks a different shell, because Japanese shells are a named
   catalogue of shapes rather than one effect -- see TYPES below. Two of them
   are the symmetric spheres makers are judged on; two fall, which is what the
   drawings of yanagi and kamuro actually depict; one is a flat ring seen at an
   angle. The same star model draws all of them, and each type is only a set of
   numbers: how fast the stars leave, how much drag and gravity they carry, and
   how long a line they draw behind themselves.

   Clicking faster escalates it. Every click adds to a `heat` value that decays
   between clicks, so a single click on a quiet page opens one modest shell and
   a fast run of them opens a barrage of large ones. Heat drives `power`, which
   scales how many stars a shell throws, how far, and how long they burn.

   Deliberately cheap: nothing happens without a fine pointer (so no phone or
   tablet ever pays for it), nothing happens under prefers-reduced-motion, the
   live star count is capped, and the animation loop exists only while a star
   is alive.
   ========================================================================== */

(function () {
  "use strict";

  var PIXEL  = 3;    // star size in CSS px, and the grid everything snaps to
  var SLACK  = 3;    // px of margin around a line of text that still counts as text
  var STARS  = 800;  // hard ceiling on live stars, so a mashed mouse stays smooth
  var DENSE  = 350;  // above this, stop sub-stepping trails (see paint)

  /* Escalation. Each click adds GAIN to heat, which decays with a TAU-ms half
     life, so cadence -- not click count -- is what raises it. */
  var GAIN = 0.30;
  var TAU  = 850;
  var TOKENS = ["--fw-1", "--fw-2", "--fw-3", "--fw-4", "--fw-5", "--fw-6"];
  var SKIP   = "a, button, input, textarea, select, label, summary, code, pre";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine   = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!fine.matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "hanabi";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  /* ------------------------------------------------------------- canvas --- */

  var w = 0, h = 0;

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size);

  /* ------------------------------------------------------------ palette --- */

  /* Read the colours off the stylesheet, so the palette is tuned in one place
     (the --fw-* tokens in :root), and read them again when the theme flips. */
  var palette = [];
  var ember = [150, 40, 10];

  function hexToRgb(hex, fallback) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length !== 6) return fallback;
    return [parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16)];
  }

  function readPalette() {
    var cs = getComputedStyle(document.documentElement);
    palette = TOKENS.map(function (t) {
      return hexToRgb(cs.getPropertyValue(t).trim(), [110, 118, 129]);
    });
    ember = hexToRgb(cs.getPropertyValue("--fw-ember").trim(), [150, 40, 10]);
  }
  readPalette();
  new MutationObserver(readPalette).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"]
  });

  /* A burning star cools as it falls behind its own head, so the drawn line
     runs from the flame colour at the tip back toward dull ember. */
  function cool(rgb, t) {
    return [rgb[0] + (ember[0] - rgb[0]) * t,
            rgb[1] + (ember[1] - rgb[1]) * t,
            rgb[2] + (ember[2] - rgb[2]) * t];
  }

  var GOLD = 2;   // --fw-3, the sodium gold a real willow shell burns

  /* n distinct colours, optionally forcing the first one. */
  function colours(n, first) {
    var pick = [];
    if (first !== undefined) pick.push(first);
    var guard = 0;
    while (pick.length < n && guard++ < 60) {
      var c = (Math.random() * palette.length) | 0;
      if (pick.indexOf(c) === -1) pick.push(c);
    }
    return pick.map(function (i) { return palette[i]; });
  }

  /* -------------------------------------------------------------- stars --- */

  var stars = [];
  var pending = [];   // shells waiting to break, for the multi-break types

  function emit(o) {
    if (stars.length >= STARS) return;
    stars.push({
      x: o.x, y: o.y, vx: o.vx, vy: o.vy,
      rgb: o.rgb,
      life: o.life, max: o.life,
      drag: o.drag, grav: o.grav,
      tail: o.tail,               // how many frames of line it draws behind it
      fade: o.fade || 2,          // exponent -- higher dies sooner
      trail: []
    });
  }

  /* Set from the click cadence, 1 at rest and 2 at full heat. Every entry in
     TYPES is written at power 1 and scaled through here, so the table stays a
     description of shape and nothing else. */
  var power = 1;

  /* Fire fn in `frames` frames at the power in force right now, not the power
     in force when it finally runs. */
  function later(frames, fn) {
    var p = power;
    pending.push({ t: frames, run: function () { power = p; fn(); } });
  }

  /* A ring of stars leaving one point at one speed. Everything below is built
     out of this; `squash` flattens the ring into the ellipse a katamono ring
     shell is drawn as. */
  function shell(o) {
    var spin = o.spin === undefined ? Math.random() * Math.PI * 2 : o.spin;
    var squash = o.squash === undefined ? 1 : o.squash;

    var count = Math.round(o.count * (1 + (power - 1) * 0.50));
    var speed = o.speed * (1 + (power - 1) * 0.80);
    var life  = o.life  * (1 + (power - 1) * 0.28);

    for (var i = 0; i < count; i++) {
      var a = spin + (i / count) * Math.PI * 2;
      var s = speed * (1 + (Math.random() - 0.5) * (o.jitter || 0));
      emit({
        x: o.x, y: o.y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s * squash,
        rgb: o.rgb,
        life: life * (1 + (Math.random() - 0.5) * (o.lifeJitter || 0)),
        drag: o.drag, grav: o.grav, tail: o.tail, fade: o.fade
      });
    }
  }

  /* -------------------------------------------------------------- types --- */

  /* Each entry is one shell from the catalogue. They differ in silhouette, not
     just in colour, so the style of a click is obvious at a glance. */
  var TYPES = {

    /* 菊 sanjuushin -- the triple-cored chrysanthemum, three concentric rings
       each burning a different salt. Judged on sphericity, so: no jitter,
       heavy drag, almost no gravity. The circle stays a circle. */
    kiku: function (x, y) {
      var c = colours(3);
      var ring = [
        { count: 32, speed: 3.5, life: 78, tail: 13 },
        { count: 20, speed: 2.1, life: 70, tail: 11 },
        { count: 12, speed: 1.0, life: 62, tail:  9 }
      ];
      var spin = Math.random() * Math.PI * 2;
      for (var i = 0; i < 3; i++) {
        shell({
          x: x, y: y, spin: spin + i * 0.12,
          count: ring[i].count, speed: ring[i].speed, life: ring[i].life,
          drag: 0.105, grav: 0.014, tail: ring[i].tail, rgb: c[i]
        });
      }
    },

    /* 牡丹 botan -- the peony: stars without tails, so it reads as a ring of
       bare dots. The quietest of the five. */
    botan: function (x, y) {
      var c = colours(2);
      shell({ x: x, y: y, count: 30, speed: 3.1, life: 72,
              drag: 0.085, grav: 0.030, tail: 3, rgb: c[0], jitter: 0.06 });
      shell({ x: x, y: y, count: 14, speed: 1.4, life: 58,
              drag: 0.085, grav: 0.030, tail: 3, rgb: c[1], jitter: 0.06 });
    },

    /* 枝垂柳 shidare-yanagi -- the weeping willow. Little drag and real
       gravity, so the stars arc over and fall in long drooping lines; this is
       the shape the drawings of a falling shell actually show. Gold, because
       that is what a willow burns. */
    yanagi: function (x, y) {
      var c = colours(2, GOLD);
      shell({ x: x, y: y, count: 22, speed: 2.7, life: 120, lifeJitter: 0.3,
              drag: 0.030, grav: 0.080, tail: 30, rgb: c[0], jitter: 0.18, fade: 1.3 });
      shell({ x: x, y: y, count: 10, speed: 1.3, life: 96, lifeJitter: 0.3,
              drag: 0.030, grav: 0.080, tail: 24, rgb: c[1], jitter: 0.18, fade: 1.3 });
    },

    /* 冠 kamuro -- the crown. A willow pulled tighter and hung longer: it
       barely spreads, then drapes almost straight down. */
    kamuro: function (x, y) {
      var c = colours(1, GOLD);
      shell({ x: x, y: y, count: 26, speed: 1.9, life: 140, lifeJitter: 0.25,
              drag: 0.020, grav: 0.105, tail: 36, rgb: c[0], jitter: 0.22, fade: 1.2 });
    },

    /* 型物 katamono -- the shaped shell. A single flat ring of stars, drawn as
       the tilted ellipse a ring shell is always illustrated as, held rather
       than thrown. */
    katamono: function (x, y) {
      var c = colours(2);
      shell({ x: x, y: y, count: 38, speed: 3.4, life: 76, squash: 0.40,
              drag: 0.135, grav: 0.016, tail: 5, rgb: c[0] });
      shell({ x: x, y: y, count: 6, speed: 0.5, life: 46,
              drag: 0.135, grav: 0.016, tail: 4, rgb: c[1] });
    },

    /* 千輪 senrin -- thousand flowers. One small break, then a scatter of tiny
       peonies opening a beat later where its stars got to. */
    senrin: function (x, y) {
      var c = colours(2);
      shell({ x: x, y: y, count: 10, speed: 1.5, life: 40,
              drag: 0.10, grav: 0.02, tail: 6, rgb: c[0] });

      var spin = Math.random() * Math.PI * 2;
      var mini = function (mx, my, rgb) {
        return function () {
          shell({ x: mx, y: my, count: 9, speed: 1.15, life: 46,
                  drag: 0.09, grav: 0.030, tail: 4, rgb: rgb, jitter: 0.2 });
        };
      };
      for (var i = 0; i < 7; i++) {
        var a = spin + (i / 7) * Math.PI * 2;
        var r = 34 + Math.random() * 12;
        later(15 + Math.random() * 7,
              mini(x + Math.cos(a) * r, y + Math.sin(a) * r,
                   Math.random() < 0.5 ? c[0] : c[1]));
      }
    }
  };

  var NAMES = Object.keys(TYPES);
  var lastType = "";

  /* One shell, never the same kind twice running. */
  function fire(x, y) {
    var name = NAMES[(Math.random() * NAMES.length) | 0];
    if (name === lastType) name = NAMES[(NAMES.indexOf(name) + 1) % NAMES.length];
    lastType = name;
    TYPES[name](x, y);
  }

  var heat = 0;
  var lastClick = 0;

  function burst(x, y) {
    /* Decay first, by however long the pause was, then add this click. Cadence
       is what raises heat: hammering the mouse climbs, pausing resets. */
    var now = performance.now();
    heat = heat * Math.exp(-(now - lastClick) / TAU) + GAIN;
    if (heat > 1) heat = 1;
    lastClick = now;
    power = 1 + heat;

    fire(x, y);

    /* Past a certain heat one shell stops being enough and it becomes a
       barrage: extra shells walking outward from the click, a beat apart. */
    var extra = Math.floor(heat * 2.8);
    var trail = function (tx, ty) { return function () { fire(tx, ty); }; };
    for (var i = 0; i < extra; i++) {
      var spread = 60 + i * 55;
      later(7 + i * 9 + Math.random() * 7,
            trail(x + (Math.random() - 0.5) * spread * 2,
                  y + (Math.random() - 0.5) * spread * 1.4));
    }
  }

  /* --------------------------------------------------------------- draw --- */

  function px(x, y, rgb, alpha) {
    if (alpha <= 0.015) return;
    ctx.fillStyle = "rgba(" + (rgb[0] | 0) + "," + (rgb[1] | 0) + "," + (rgb[2] | 0) +
                    "," + (alpha > 1 ? 1 : alpha).toFixed(3) + ")";
    ctx.fillRect(Math.round(x / PIXEL) * PIXEL, Math.round(y / PIXEL) * PIXEL, PIXEL, PIXEL);
  }

  /* The head of a star: one pixel with four shoulders, so it reads as a point
     of light and not merely the end of a line. */
  function head(x, y, rgb, alpha) {
    px(x, y, rgb, alpha);
    px(x - PIXEL, y, rgb, alpha * 0.5);
    px(x + PIXEL, y, rgb, alpha * 0.5);
    px(x, y - PIXEL, rgb, alpha * 0.5);
    px(x, y + PIXEL, rgb, alpha * 0.5);
  }

  function step(k) {
    var i, p;

    for (i = pending.length - 1; i >= 0; i--) {
      pending[i].t -= k;
      if (pending[i].t > 0) continue;
      var run = pending[i].run;
      pending.splice(i, 1);
      run();
    }

    for (i = stars.length - 1; i >= 0; i--) {
      p = stars[i];

      p.trail.push(p.x, p.y);
      if (p.trail.length > p.tail * 2) p.trail.splice(0, 2);

      p.vx *= 1 - p.drag * k;
      p.vy *= 1 - p.drag * k;
      p.vy += p.grav * k;
      p.x  += p.vx * k;
      p.y  += p.vy * k;
      p.life -= k;

      if (p.life <= 0) stars.splice(i, 1);
    }
  }

  function paint() {
    ctx.clearRect(0, 0, w, h);

    /* Sub-stepping each trail segment is what makes a fast star draw a solid
       stroke, and it is also the expensive part. In the middle of a barrage
       there is too much on screen to tell, so drop it and stay at frame rate. */
    var dense = stars.length > DENSE;

    for (var s = 0; s < stars.length; s++) {
      var p = stars[s];
      var t = p.life / p.max;
      var a = Math.pow(t, p.fade);

      /* Twinkle out over the last stretch, the way a real star does. */
      if (t < 0.28) a *= 0.5 + Math.random() * 0.5;
      if (a <= 0.015) continue;

      /* Walk the trail as a drawn line: step along each segment at the grid
         pitch so fast stars leave a continuous stroke, not a dotted one. */
      var n = p.trail.length / 2;
      for (var i = 0; i < n - 1; i++) {
        var x0 = p.trail[i * 2],     y0 = p.trail[i * 2 + 1];
        var x1 = p.trail[i * 2 + 2], y1 = p.trail[i * 2 + 3];
        var age = n > 1 ? i / (n - 1) : 1;          // 0 oldest, 1 nearest the head
        var rgb = cool(p.rgb, (1 - age) * 0.6);
        var al  = a * (0.07 + age * 0.45);

        var dx = x1 - x0, dy = y1 - y0;
        var steps = dense ? 1 : (Math.ceil(Math.sqrt(dx * dx + dy * dy) / PIXEL) || 1);
        for (var q = 0; q < steps; q++) {
          px(x0 + dx * (q / steps), y0 + dy * (q / steps), rgb, al);
        }
      }

      head(p.x, p.y, p.rgb, a);
    }
  }

  /* --------------------------------------------------------------- loop --- */

  var raf = 0, last = 0;

  function frame(now) {
    var k = (now - last) / 16.667;
    last = now;
    if (k > 3) k = 3;
    if (k < 0.2) k = 0.2;

    step(k);
    paint();

    if (stars.length || pending.length) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    stars.length = pending.length = 0;
    ctx.clearRect(0, 0, w, h);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
  });

  /* -------------------------------------------------------------- click --- */

  /* Is the pointer actually over a glyph? Measuring the line boxes of the
     element's own text nodes is the only reliable way to tell: the click target
     is a <p> whether you hit a word or the ragged space after it, and only the
     rects know the difference. Whitespace between tags is not text. */
  var range = document.createRange();

  function onText(el, x, y) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType !== 3 || !/\S/.test(n.nodeValue)) continue;
      range.selectNodeContents(n);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (x >= r.left - SLACK && x <= r.right + SLACK &&
            y >= r.top - SLACK && y <= r.bottom + SLACK) return true;
      }
    }
    return false;
  }

  document.addEventListener("click", function (e) {
    if (reduce.matches || !fine.matches) return;
    if (e.target.closest(SKIP)) return;
    if (window.getSelection && String(window.getSelection())) return;
    if (onText(e.target, e.clientX, e.clientY)) return;

    burst(e.clientX, e.clientY);
    start();
  });
})();
