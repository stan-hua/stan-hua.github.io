/* Ambient rhythm strip behind the page.
   Scrolling PQRST traces, generated rather than looped. The trace nearest the
   pointer gains amplitude and takes the accent colour. Homepage only. */
(function () {
    var canvas = document.getElementById("field");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var AMP = 0.55;          // "subtle"
    var ROWS = 6;
    var MIN_WIDTH = 800;     // below this there is no pointer and no margin to draw in

    var W = 0, H = 0, raf = 0, pal = null, running = false;
    var m = { x: 0, y: 0, tx: 0, ty: 0, on: false };

    function readPalette() {
        var cs = getComputedStyle(document.documentElement);
        var dark = document.documentElement.getAttribute("data-theme") === "dark";
        pal = {
            base: cs.getPropertyValue("--muted").trim() || "#6E7681",
            lit: cs.getPropertyValue("--accent").trim() || "#12507F",
            baseAlpha: dark ? 0.13 : 0.10,
            litAlpha: dark ? 0.42 : 0.34
        };
    }

    function rgba(hex, a) {
        var h = hex.replace("#", "");
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }

    /* one PQRST complex over phase u in [0,1) */
    function beat(u) {
        function g(c, wd, amp) {
            var d = u - c;
            return amp * Math.exp(-(d * d) / (2 * wd * wd));
        }
        return g(0.18, 0.028, 0.12) + g(0.31, 0.008, -0.20) + g(0.34, 0.007, 1) +
               g(0.375, 0.010, -0.28) + g(0.55, 0.045, 0.24);
    }

    function size() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (!m.on) { m.x = m.tx = W / 2; m.y = m.ty = H / 2; }
    }

    function draw(t) {
        raf = 0;
        ctx.clearRect(0, 0, W, H);
        if (W < MIN_WIDTH) { running = false; return; }

        m.x += (m.tx - m.x) * 0.09;
        m.y += (m.ty - m.y) * 0.09;

        for (var r = 0; r < ROWS; r++) {
            var y0 = H * (r + 0.5) / ROWS;
            var near = m.on ? Math.max(0, 1 - Math.abs(y0 - m.y) / (H / ROWS * 1.5)) : 0;
            var amp = (H / ROWS * 0.34) * (0.45 + near * 0.85) * AMP;
            var speed = 0.00013 + r * 0.000012;
            var lit = near > 0.35;

            ctx.strokeStyle = rgba(lit ? pal.lit : pal.base, pal.baseAlpha + near * pal.litAlpha);
            ctx.lineWidth = lit ? 1.5 : 1;
            ctx.beginPath();
            for (var x = 0; x <= W; x += 2) {
                var u = ((x * 0.0022 + t * speed * AMP) % 1 + 1) % 1;
                var y = y0 - beat(u) * amp;
                if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
            }
            ctx.stroke();
        }

        if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
        else running = false;
    }

    function start() {
        if (running || raf || document.hidden || W < MIN_WIDTH) return;
        running = true;
        raf = requestAnimationFrame(draw);
    }

    window.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        m.tx = e.clientX; m.ty = e.clientY; m.on = true;
        start();
    }, { passive: true });

    window.addEventListener("resize", function () { size(); start(); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });

    /* keep the traces in step with the theme toggle */
    new MutationObserver(function () { readPalette(); start(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    readPalette();
    size();
    if (reduced) draw(0); else start();
})();
