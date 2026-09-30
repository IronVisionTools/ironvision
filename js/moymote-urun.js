// MoyMote ürün bölümü (moymote.com açılışından): telefonun üzerinde sürükleyince parlaklık %5 adımlarla değişir.
// Telefon ekranı her adımda gerçek bir MoyMote ekran görüntüsüdür; monitör ve oda ışığı --lux'u izler.
(function () {
  "use strict";
  var input = document.getElementById("mm-lux");
  var img = document.getElementById("mm-frame");
  var screen = document.querySelector("#mm-demo .mm-device-screen");
  if (!input || !img || !screen) return;

  var lang = document.documentElement.lang === "tr" ? "tr" : "en";
  var MIN = 5, MAX = 100, STEP = 5;
  // Ekran görüntüsündeki parlaklık çubuğunun sol/sağ ucu, ekran genişliğine oranla (karelerden ölçüldü).
  var TRACK_L = 0.113, TRACK_R = 0.937;
  var ALT = lang === "tr"
    ? "Koyu görünümde MoyMote telefon paneli, parlaklık %{v}"
    : "MoyMote phone panel in dark appearance, brightness at {v}%";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lit = [].slice.call(document.querySelectorAll(".mm-screen img, .mm-glow, .mm-dim"));
  var value = 50, lux = 0.5, queued = 0;

  function src(n) { return "/assets/moymote/frames/b" + ("00" + n).slice(-3) + "-" + lang + ".webp"; }
  function paint() {
    queued = 0;
    var l = lux.toFixed(3);
    for (var i = 0; i < lit.length; i++) lit[i].style.setProperty("--lux", l);
  }
  function set(raw) {
    raw = Math.max(MIN, Math.min(MAX, raw));
    lux = raw / 100;
    if (!queued) queued = requestAnimationFrame(paint);
    var n = Math.round(raw / STEP) * STEP;
    if (n === value) return;
    value = n;
    img.src = src(n);
    img.alt = ALT.replace("{v}", n);
    input.value = n;
  }
  paint();

  input.addEventListener("input", function () { stop(); set(+input.value); });

  // Fare hemen sürükler; dokunmatikte yalnız yatay hareket sürükler (dikey kaydırma serbest kalır) ya da dokunuş.
  var drag = null;
  function fromX(x) {
    var r = screen.getBoundingClientRect();
    set(MIN + ((x - r.left) / r.width - TRACK_L) / (TRACK_R - TRACK_L) * (MAX - MIN));
  }
  screen.addEventListener("pointerdown", function (e) {
    stop();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, on: e.pointerType === "mouse" };
    if (drag.on) { screen.setPointerCapture(e.pointerId); fromX(e.clientX); e.preventDefault(); }
  });
  screen.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (e.cancelable && drag.on) e.preventDefault();
    if (!drag.on) {
      var dx = Math.abs(e.clientX - drag.x), dy = Math.abs(e.clientY - drag.y);
      if (dx > 6 && dx > dy) { drag.on = true; try { screen.setPointerCapture(e.pointerId); } catch (_) {} }
      else return;
    }
    fromX(e.clientX);
  });
  screen.addEventListener("pointerup", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on && Math.abs(e.clientX - drag.x) < 6 && Math.abs(e.clientY - drag.y) < 6) fromX(e.clientX);
    drag = null;
  });
  screen.addEventListener("pointercancel", function () { drag = null; });

  // Bölüm görünür olunca, bütün kareler yüklendikten sonra yumuşak bir tanıtım döngüsü; ilk dokunuş kalıcı durdurur.
  var KEYS = [[0, 50], [2.6, 20], [4.2, 20], [7.4, 90], [9, 90], [11.6, 50], [15, 50]];
  var playing = !reduce, visible = false, loaded = false, raf = 0, t0 = 0;
  function stop() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function ease(t) { return 0.5 - Math.cos(Math.PI * t) / 2; }
  function frame(now) {
    raf = 0;
    if (!playing || !visible) return;
    if (!t0) t0 = now;
    var t = ((now - t0) / 1000) % KEYS[KEYS.length - 1][0];
    for (var i = 0; i < KEYS.length - 1; i++) {
      var a = KEYS[i], b = KEYS[i + 1];
      if (t >= a[0] && t < b[0]) { set(a[1] + (b[1] - a[1]) * ease((t - a[0]) / (b[0] - a[0]))); break; }
    }
    raf = requestAnimationFrame(frame);
  }
  function go() { if (playing && visible && loaded && !raf) { t0 = 0; raf = requestAnimationFrame(frame); } }
  function preload() {
    var left = 0;
    for (var n = MIN; n <= MAX; n += STEP) {
      left++;
      var im = new Image();
      im.onload = im.onerror = function () { if (--left === 0) { loaded = true; setTimeout(go, 800); } };
      im.src = src(n);
    }
  }
  var stage = document.getElementById("mm-stage");
  if ("IntersectionObserver" in window && stage) {
    var started = false;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !started) { started = true; preload(); }
      go();
    }, { rootMargin: "200px 0px" }).observe(stage);
  }
})();
