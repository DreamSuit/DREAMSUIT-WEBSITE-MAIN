/* ============================================================
   DreamSuit — scroll experience
   Vanilla JS. No dependencies. Reduced-motion aware.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* current year in footer */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (window.scrollY > 24) header.classList.add("is-stuck");
    else header.classList.remove("is-stuck");
  }

  /* ---------- progress rail ---------- */
  var railCharge = document.getElementById("railCharge");
  function onScrollRail() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
    railCharge.style.height = (pct * 100).toFixed(2) + "%";
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revObs.observe(el); });
  }

  /* ---------- count-up numbers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(target).split(".")[1] || "").length;
    if (reduce) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCount);
  } else {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- mission sticky sequence ---------- */
  var mission = document.getElementById("mission");
  var stageItems = Array.prototype.slice.call(document.querySelectorAll(".mission__list li"));
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-stage-panel]"));
  var activeStage = -1;

  function setStage(i) {
    if (i === activeStage) return;
    activeStage = i;
    stageItems.forEach(function (li, idx) { li.classList.toggle("is-active", idx === i); });
    panels.forEach(function (p, idx) { p.classList.toggle("is-active", idx === i); });
  }

  function onScrollMission() {
    if (!mission || reduce) return;
    var rect = mission.getBoundingClientRect();
    var total = mission.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var progressed = Math.min(Math.max(-rect.top / total, 0), 0.9999);
    setStage(Math.floor(progressed * panels.length));
  }

  /* On reduced motion / mobile static layout, show all panels + mark all active items */
  function missionStaticFallback() {
    var sticky = document.querySelector(".mission__sticky");
    if (!sticky) return;
    var staticLayout = window.getComputedStyle(sticky).position !== "sticky";
    if (reduce || staticLayout) {
      panels.forEach(function (p) { p.classList.add("is-active"); });
      stageItems.forEach(function (li) { li.classList.add("is-active"); });
    }
  }

  /* initialise first stage for desktop sticky */
  if (!reduce) setStage(0);
  missionStaticFallback();

  /* ---------- hero TENS vital-monitor oscilloscope ---------- */
  (function heroScope() {
    var canvas = document.getElementById("heroScope");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Channel A — biphasic TENS pulse train (sharp +phase then -phase, then rest)
    function tens(p) {
      var period = 58, w = 7, x = ((p % period) + period) % period;
      if (x < w * 0.42) return 1;       // positive phase
      if (x < w) return -0.82;          // negative (biphasic) phase
      return 0;
    }
    // Channel B — textured piezo waveform (layered sines)
    function piezo(p) {
      return Math.sin(p * 0.09) * 0.52 + Math.sin(p * 0.23 + 1) * 0.3 + Math.sin(p * 0.6) * 0.16;
    }

    function trace(fn, baseY, amp, color, phase, glow) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 2) {
        var p = phase - (W - x) * 0.6;  // newest sample at the right edge
        var y = baseY - fn(p) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.6;
      ctx.shadowColor = color; ctx.shadowBlur = glow;
      ctx.globalAlpha = 0.42; ctx.stroke();
      // leading "beam" node at the live edge
      ctx.globalAlpha = 1; ctx.beginPath();
      ctx.arc(W - 1.5, baseY - fn(phase) * amp, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.shadowBlur = 0;
    }

    function frame(phase) {
      ctx.clearRect(0, 0, W, H);
      // oscilloscope graticule
      ctx.globalAlpha = 1; ctx.strokeStyle = "rgba(90,130,170,0.10)"; ctx.lineWidth = 1;
      for (var gx = W - (phase * 0.9 % 90); gx > 0; gx -= 90) {
        ctx.beginPath(); ctx.moveTo(gx, H * 0.52); ctx.lineTo(gx, H * 0.96); ctx.stroke();
      }
      trace(tens, H * 0.72, H * 0.085, "rgba(47,228,228,1)", phase, 14);
      trace(piezo, H * 0.9, H * 0.045, "rgba(255,61,216,1)", phase * 0.92, 12);
      ctx.globalAlpha = 1;
    }

    if (reduce) { frame(40); return; }  // single static frame, no loop

    var phase = 0, running = false, rafId = 0;
    function loop() { if (!running) return; phase += 1.5; frame(phase); rafId = requestAnimationFrame(loop); }
    function start() { if (!running) { running = true; loop(); } }
    function stop() { running = false; cancelAnimationFrame(rafId); }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(canvas);
    } else { start(); }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  })();

  /* ---------- rAF-throttled scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      onScrollRail();
      onScrollMission();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { missionStaticFallback(); onScrollRail(); }, { passive: true });
  onScroll();
})();
