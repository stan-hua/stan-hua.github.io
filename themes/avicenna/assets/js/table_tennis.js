/* ==========================================================================
   Berkeley Table Tennis Club rating.

   A hidden panel: the words "table tennis" in the Currently line are the
   button, and the chart lives between Currently and News. It starts closed and
   draws nothing until it is opened for the first time.

   One line, one dot per night he played. The x-axis is real time rather than
   one slot per night, so the gaps between visits are visible -- he goes every
   now and then, and that is most of the shape.

   Hovering (or arrowing) anywhere in the plot picks the nearest night and
   shows its matches and games. Everything the tooltip says is also in the
   table under the chart, so nothing is reachable only by pointer. Colours come
   from CSS custom properties, so a theme flip is just a redraw.
   ========================================================================== */

(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  var panel = document.getElementById("table-tennis");
  var host = document.getElementById("tt-chart");
  var raw = document.getElementById("tt-data");
  var trigger = document.querySelector(".tt-trigger");
  if (!panel || !host || !raw) return;

  /* Anything but a non-empty array means the payload was mangled on the way in
     (see the safeJS note in the partial) -- fail closed and leave the panel
     shut rather than throwing and taking the trigger down with it. */
  var data;
  try { data = JSON.parse(raw.textContent); } catch (e) { return; }
  if (!Array.isArray(data) || !data.length) return;

  data.forEach(function (d) { d.t = Date.parse(d.date + "T12:00:00Z"); });
  data.sort(function (a, b) { return a.t - b.t; });

  var START = data[0].rating_pre;   // the rating he walked in with, night one

  /* ---------------------------------------------------------------- shape --- */

  var M = { l: 38, r: 46, t: 18, b: 24 };
  var H = 172;

  var MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }

  function css(name) {
    return getComputedStyle(host).getPropertyValue(name).trim();
  }

  function txt(x, y, s, fill, anchor, cls) {
    var n = el("text", { x: x, y: y, fill: fill, "text-anchor": anchor, class: cls || "tt__ax" });
    n.appendChild(document.createTextNode(s));
    return n;
  }

  function niceStep(span, target) {
    var r = (span || 1) / target;
    var mag = Math.pow(10, Math.floor(Math.log(r) / Math.LN10));
    var norm = r / mag;
    return (norm > 5 ? 10 : norm > 2 ? 5 : norm > 1 ? 2 : 1) * mag;
  }

  function fmtFull(t) {
    var d = new Date(t);
    return MONTH[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }

  /* ----------------------------------------------------------------- draw --- */

  var tip = document.createElement("div");
  tip.className = "tt__tip";
  tip.hidden = true;
  host.appendChild(tip);

  var svg, X, Y, cross, dots = [], focus = -1;

  function render() {
    var W = host.clientWidth;
    if (!W) return;                       // still closed; nothing to measure

    var height = M.t + H + M.b;
    if (svg) svg.remove();
    svg = el("svg", { width: W, height: height, viewBox: "0 0 " + W + " " + height,
                      class: "tt__svg", "aria-hidden": "true", focusable: "false" });

    var muted = css("--tt-muted");
    var grid  = css("--tt-grid");
    var axis  = css("--tt-axis");
    var line  = css("--tt-line");
    var surf  = css("--tt-surface");
    var ink   = css("--tt-ink");

    var x0 = M.l, x1 = W - M.r, plotW = x1 - x0;

    var t0 = data[0].t, t1 = data[data.length - 1].t;
    var span = (t1 - t0) || 1;
    var pad = span * 0.05;
    X = function (t) { return x0 + ((t - (t0 - pad)) / (span + 2 * pad)) * plotW; };

    var vals = data.map(function (d) { return d.rating; }).concat([START]);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var step = niceStep(hi - lo, 3);
    var yLo = Math.floor(lo / step) * step - step * 0.4;
    var yHi = Math.ceil(hi / step) * step + step * 0.4;
    Y = function (v) { return M.t + H - ((v - yLo) / (yHi - yLo)) * H; };

    /* Grid: hairlines one shade off the surface, nothing louder. */
    for (var g = Math.ceil(yLo / step) * step; g <= yHi; g += step) {
      svg.appendChild(el("line", { x1: x0, x2: x1, y1: Y(g), y2: Y(g),
                                   stroke: grid, "stroke-width": 1 }));
      svg.appendChild(txt(x0 - 9, Y(g) + 3.5, String(g), muted, "end"));
    }

    /* Where he walked in on night one -- the line he has been above or below
       ever since, and the only number on the chart that isn't a dot. */
    svg.appendChild(el("line", { x1: x0, x2: x1, y1: Y(START), y2: Y(START),
                                 stroke: axis, "stroke-width": 1 }));
    svg.appendChild(txt(x1 + 6, Y(START) + 3.5, "start", muted, "start"));

    /* Months along the bottom, thinned to whatever fits. */
    var d0 = new Date(t0), d1 = new Date(t1);
    var months = (d1.getUTCFullYear() - d0.getUTCFullYear()) * 12 + (d1.getUTCMonth() - d0.getUTCMonth());
    var mStep = Math.max(1, Math.ceil((months + 1) / Math.max(2, Math.floor(plotW / 76))));
    var cur = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), 1));
    var seenYear = null, yAxis = M.t + H + 18;
    while (cur.getTime() <= t1 + 864e5 * 25) {
      var tx = X(cur.getTime());
      if (tx >= x0 - 2 && tx <= x1 + 2) {
        var yr = cur.getUTCFullYear();
        svg.appendChild(txt(tx, yAxis,
          MONTH[cur.getUTCMonth()] + (yr !== seenYear ? " ’" + String(yr).slice(2) : ""),
          muted, "middle"));
        seenYear = yr;
      }
      cur.setUTCMonth(cur.getUTCMonth() + mStep);
    }

    /* The line: round joins and caps, a touch heavier than the chrome. */
    svg.appendChild(el("path", {
      d: data.map(function (d, i) {
        return (i ? "L" : "M") + X(d.t).toFixed(1) + "," + Y(d.rating).toFixed(1);
      }).join(""),
      fill: "none", stroke: line, "stroke-width": 2.5,
      "stroke-linejoin": "round", "stroke-linecap": "round"
    }));

    /* One dot per night, each ringed in the surface colour so it stays legible
       where the line runs underneath it. */
    dots = data.map(function (d) {
      var c = el("circle", { cx: X(d.t), cy: Y(d.rating), r: 5,
                             fill: line, stroke: surf, "stroke-width": 2.5,
                             class: "tt__dot" });
      svg.appendChild(c);
      return c;
    });

    /* The one direct label: where he is now. */
    var last = data[data.length - 1];
    svg.appendChild(txt(X(last.t) + 11, Y(last.rating) + 4.5, String(last.rating), ink, "start", "tt__now"));

    cross = el("line", { x1: 0, x2: 0, y1: M.t, y2: M.t + H,
                         stroke: grid, "stroke-width": 1, opacity: 0 });
    svg.insertBefore(cross, svg.firstChild);

    host.insertBefore(svg, tip);
    if (focus >= 0) show(focus);
  }

  /* ---------------------------------------------------------------- hover --- */

  /* Nearest-point, so the reader only has to be closest to a dot rather than
     on it -- a 10px dot is a pinpoint nobody hits reliably. */
  function nearest(px) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < data.length; i++) {
      var d = Math.abs(X(data[i].t) - px);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function row(value, label) {
    var r = document.createElement("div");
    r.className = "tt__tiprow";
    var v = document.createElement("b");
    v.textContent = value;                 // never innerHTML
    var l = document.createElement("span");
    l.textContent = label;
    r.appendChild(v);
    r.appendChild(l);
    return r;
  }

  function show(i) {
    var d = data[i];
    focus = i;

    while (tip.firstChild) tip.removeChild(tip.firstChild);
    var head = document.createElement("div");
    head.className = "tt__tiphead";
    head.textContent = fmtFull(d.t);
    tip.appendChild(head);

    var delta = d.rating - d.rating_pre;
    tip.appendChild(row(d.rating + " (" + (delta >= 0 ? "+" : "") + delta + ")", "rating"));
    tip.appendChild(row(d.matches_won + "–" + (d.matches_played - d.matches_won), "matches"));
    tip.appendChild(row(d.games_won + "–" + d.games_lost, "games"));

    tip.hidden = false;
    var px = X(d.t), py = Y(d.rating);
    var left = px + 16;
    if (left + tip.offsetWidth > host.clientWidth - 2) left = px - tip.offsetWidth - 16;
    tip.style.left = Math.max(0, left) + "px";
    tip.style.top = Math.max(0, Math.min(py - 14, M.t + H - tip.offsetHeight)) + "px";

    cross.setAttribute("x1", px);
    cross.setAttribute("x2", px);
    cross.setAttribute("opacity", 1);
    dots.forEach(function (c, j) { c.setAttribute("r", j === i ? 7 : 5); });
  }

  function hide() {
    focus = -1;
    tip.hidden = true;
    if (cross) cross.setAttribute("opacity", 0);
    dots.forEach(function (c) { c.setAttribute("r", 5); });
  }

  host.addEventListener("pointermove", function (e) {
    if (!dots.length) return;
    show(nearest(e.clientX - host.getBoundingClientRect().left));
  });
  host.addEventListener("pointerleave", hide);
  host.addEventListener("blur", hide);

  host.setAttribute("tabindex", "0");
  host.addEventListener("keydown", function (e) {
    if (!dots.length) return;
    var i = focus < 0 ? data.length - 1 : focus;
    if (e.key === "ArrowRight") i = Math.min(data.length - 1, i + 1);
    else if (e.key === "ArrowLeft") i = Math.max(0, i - 1);
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = data.length - 1;
    else if (e.key === "Escape") { hide(); return; }
    else return;
    e.preventDefault();
    show(i);
  });

  /* --------------------------------------------------------------- toggle --- */

  function open() {
    panel.hidden = false;
    if (trigger) trigger.setAttribute("aria-expanded", "true");
    render();                                     // first measurable moment
    panel.classList.add("tt--in");
  }

  function close() {
    panel.hidden = true;
    panel.classList.remove("tt--in");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    hide();
  }

  if (trigger) {
    trigger.addEventListener("click", function () {
      if (panel.hidden) {
        open();
        /* Only scroll if the panel opened out of view -- never yank the page
           when it is already sitting right there. */
        var r = panel.getBoundingClientRect();
        if (r.bottom > window.innerHeight) {
          panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      } else {
        close();
      }
    });
  }

  /* --------------------------------------------------------------- redraw --- */

  function redrawIfOpen() { if (!panel.hidden) render(); }

  if (window.ResizeObserver) {
    var lastW = 0;
    new ResizeObserver(function () {
      if (!panel.hidden && host.clientWidth !== lastW) { lastW = host.clientWidth; render(); }
    }).observe(host);
  } else {
    window.addEventListener("resize", redrawIfOpen);
  }

  new MutationObserver(redrawIfOpen).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"]
  });
})();
