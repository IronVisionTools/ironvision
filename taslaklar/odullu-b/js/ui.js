/* IRON VISION — Gözlemevi: arayüz katmanı (reticle, görev şeridi, şifre çözme, sinyal hattı, ses, kara delik finali) */
(function () {
  'use strict';
  var doc = document, win = window, body = doc.body;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var qs = new URLSearchParams(location.search);

  var RM = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE = win.matchMedia('(pointer: coarse)').matches;
  var CAP = qs.get('cap');              // yalnız statik kare üretimi için
  if (qs.has('noui')) body.classList.add('noui');
  if (RM) body.classList.add('rm');
  if (!RM && !COARSE) body.classList.add('fine-ptr');

  /* ---------- dil ---------- */
  var EN = win.IVT_EN || {}, TR = {}, lang = 'tr';
  $$('[data-i18n]').forEach(function (el) { TR[el.getAttribute('data-i18n')] = el.innerHTML; });
  $$('[data-i18n-alt]').forEach(function (el) { TR['alt:' + el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
  $$('[data-i18n-aria]').forEach(function (el) { TR['aria:' + el.getAttribute('data-i18n-aria')] = el.getAttribute('aria-label'); });
  var TITLE = { tr: 'IRON VISION tools — Gözlemevi', en: 'IRON VISION tools — Observatory' };
  var DESC = { tr: $('meta[name=description]').content,
    en: 'AI tools that actually work: VyroN Agents OS, Voice Chief, MoyMote, social media automation. (Draft B)' };

  function setLang(l) {
    lang = l;
    $$('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n'), v = l === 'tr' ? TR[k] : EN[k];
      if (v == null) return;
      el.innerHTML = v;
      if (el.hasAttribute('data-decode')) { el.setAttribute('aria-label', el.textContent); el.classList.remove('pre'); }
    });
    $$('[data-i18n-alt]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-alt'); var v = l === 'tr' ? TR['alt:' + k] : EN[k]; if (v) el.setAttribute('alt', v);
    });
    $$('[data-i18n-aria]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-aria'); var v = l === 'tr' ? TR['aria:' + k] : EN[k]; if (v) el.setAttribute('aria-label', v);
    });
    doc.documentElement.lang = l;
    doc.title = TITLE[l]; $('meta[name=description]').content = DESC[l];
    $('#lang-t').textContent = l === 'tr' ? 'EN' : 'TR';
    $('#lang').setAttribute('aria-label', l === 'tr' ? 'Switch to English' : 'Türkçeye geç');
    $('#moy-img').src = 'img/b050-' + l + '.webp';
    $('#boot-l2').textContent = l === 'tr' ? 'OPTİK KALİBRASYON' : 'OPTICS CALIBRATING';
    updSndLabel(); updPlayLabel();
    $$('[data-decode]').forEach(function (el) { if (!el.classList.contains('pre')) el.textContent = el.textContent; });
    if (win.__ivt) layout();
  }
  var navLang = (qs.get('lang') || (navigator.language || 'tr')).toLowerCase();
  var startLang = navLang.indexOf('tr') === 0 ? 'tr' : (navLang.indexOf('en') === 0 ? 'en' : 'en');

  /* ---------- ses (WebAudio sentez, varsayılan KAPALI) ---------- */
  var AC = null, sndOn = false;
  function ensureAC() {
    if (!AC) { var C = win.AudioContext || win.webkitAudioContext; if (!C) return false; AC = new C(); }
    if (AC.state === 'suspended') AC.resume();
    return true;
  }
  function blip(f, d, type, v, f2) {
    if (!sndOn || !AC) return;
    var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.04, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function updSndLabel() {
    var t = $('#snd-t'); if (!t) return;
    t.textContent = (EN['snd.' + (sndOn ? 'on' : 'off')] && lang === 'en') ? EN['snd.' + (sndOn ? 'on' : 'off')] : (sndOn ? 'SES AÇIK' : 'SES KAPALI');
  }
  $('#snd').addEventListener('click', function () {
    if (!sndOn) { if (!ensureAC()) return; sndOn = true; blip(220, .5, 'sine', .05, 880); blip(880, .25, 'triangle', .03, 1320); }
    else { sndOn = false; }
    this.setAttribute('aria-pressed', sndOn ? 'true' : 'false'); updSndLabel();
  });
  doc.addEventListener('click', function (e) {
    if (sndOn && e.target.closest('a,button')) blip(520, .08, 'triangle', .05, 820);
  }, true);

  /* ---------- şifre çözme (decode) ---------- */
  var GL = '▓▒░█<>/\\|+*#%&01=_';
  function decode(el, dur) {
    var fin = el.getAttribute('aria-label') || el.textContent;
    if (RM) { el.textContent = fin; return; }
    var n = fin.length, t0 = performance.now(), lastTick = 0;
    el.classList.remove('pre');
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), rev = Math.floor(p * n * 1.15), s = '';
      for (var i = 0; i < n; i++) {
        var c = fin.charAt(i);
        s += (i < rev || c === ' ') ? c : GL.charAt((Math.random() * GL.length) | 0);
      }
      el.textContent = s;
      if (sndOn && now - lastTick > 55 && p < 1) { lastTick = now; blip(1800 + Math.random() * 1400, .012, 'square', .006); }
      if (p < 1) requestAnimationFrame(step); else el.textContent = fin;
    })(t0);
  }
  var decIO = null;
  function initDecode() {
    $$('[data-decode]').forEach(function (el) {
      el.setAttribute('aria-label', el.textContent);
      if (!RM) el.classList.add('pre');
    });
    if (RM) return;
    decIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { decIO.unobserve(e.target); decode(e.target, clamp(e.target.textContent.length * 38, 500, 1100)); }
      });
    }, { threshold: .25 });
    $$('[data-decode]').forEach(function (el) { if (!el.closest('#hero')) decIO.observe(el); });
  }
  function decodeHero() { if (decIO) $$('#hero [data-decode]').forEach(function (el) { decIO.observe(el); }); }

  /* ---------- görev şeridi ---------- */
  var strip = $('#urunler'), pin = $('#strip-pin'), track = $('#strip-track');
  var cards = $$('.card', track), native = true, sExtra = 0, sTop = 0;
  function layout() {
    native = RM || win.innerWidth < 900;
    strip.classList.toggle('native', native);
    track.style.transform = '';
    if (native) { strip.style.height = ''; }
    else {
      var last = cards[cards.length - 1], gut = parseFloat(getComputedStyle(track).paddingLeft) * 0 + Math.max(16, win.innerWidth * .04);
      sExtra = Math.max(0, last.offsetLeft + last.offsetWidth + gut - win.innerWidth);
      strip.style.height = (win.innerHeight + sExtra) + 'px';
    }
    sTop = strip.getBoundingClientRect().top + win.scrollY;
    stripUpdate();
  }
  var shN = $('#sh-n'), shFill = $('#sh-fill');
  function hud(idx, pr) {
    shN.textContent = ('0' + (idx + 1)).slice(-2) + ' / ' + ('0' + cards.length).slice(-2);
    shFill.style.width = (pr * 100).toFixed(1) + '%';
  }
  function stripUpdate() {
    if (native) {
      var m = track.scrollWidth - track.clientWidth, pr = m > 0 ? track.scrollLeft / m : 0;
      hud(Math.round(pr * (cards.length - 1)), pr); return;
    }
    var t = clamp(win.scrollY - sTop, 0, sExtra);
    track.style.transform = 'translate3d(' + (-t).toFixed(1) + 'px,0,0)';
    var pr2 = sExtra > 0 ? t / sExtra : 0;
    hud(Math.round(pr2 * (cards.length - 1)), pr2);
  }
  track.addEventListener('scroll', stripUpdate, { passive: true });
  pin.addEventListener('scroll', function () { pin.scrollLeft = 0; });
  function goCard(i) {
    var beh = RM ? 'auto' : 'smooth';
    if (native) {
      strip.scrollIntoView({ behavior: beh, block: 'start' });
      track.scrollTo({ left: cards[i].offsetLeft - track.offsetLeft - 16, behavior: beh });
    } else {
      var t = clamp(cards[i].offsetLeft - cards[0].offsetLeft, 0, sExtra);
      win.scrollTo({ top: sTop + t + (i === 0 ? 2 : 0), behavior: beh });
    }
  }
  $$('[data-go-card]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); goCard(+a.getAttribute('data-go-card')); });
  });
  $$('a[href="#urunler"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); win.scrollTo({ top: sTop, behavior: RM ? 'auto' : 'smooth' }); });
  });
  track.addEventListener('focusin', function (e) {
    var c = e.target.closest('.card'); if (!c || native) return;
    var r = c.getBoundingClientRect();
    if (r.left < 0 || r.right > win.innerWidth) goCard(cards.indexOf(c));
  });

  /* ---------- reticle + kilitlenme ---------- */
  var ret = $('#reticle'), lockEl = $('#lock'), lockTag = $('#lock-tag'), retRead = $('#ret-read');
  var tx = win.innerWidth / 2, ty = win.innerHeight * .46, rx = tx, ry = ty, touching = false, touchT = 0;
  var curLock = null, lastProbe = 0;
  function setLock(el) {
    if (el === curLock) return;
    curLock = el;
    if (!el) { lockEl.classList.remove('on'); ret.classList.remove('locked'); return; }
    lockTag.textContent = 'LOCK · ' + (el.getAttribute('data-lock') || 'TARGET');
    ret.classList.add('locked'); lockEl.classList.add('on'); placeLock(true);
    blip(1320, .05, 'square', .02, 1900);
  }
  function placeLock() {
    if (!curLock) return;
    var r = curLock.getBoundingClientRect();
    lockEl.style.transform = 'translate3d(' + (r.left - 6) + 'px,' + (r.top - 6) + 'px,0)';
    lockEl.style.width = (r.width + 12) + 'px'; lockEl.style.height = (r.height + 12) + 'px';
  }
  function probe() {
    var el = doc.elementFromPoint(rx, ry);
    setLock(el ? el.closest('[data-lock]') : null);
  }
  if (!RM) {
    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY; ret.classList.add('on');
      var el = e.target.closest ? e.target.closest('[data-lock]') : null;
      setLock(el);
    }, { passive: true });
    doc.addEventListener('pointerleave', function () { ret.classList.remove('on'); setLock(null); });
    doc.addEventListener('focusin', function (e) { var el = e.target.closest('[data-lock]'); if (el && e.target.matches(':focus-visible')) setLock(el); });
    doc.addEventListener('focusout', function () { setLock(null); });
    var ts = function (e) { var t = e.touches[0]; if (!t) return; touching = true; tx = t.clientX; ty = t.clientY; ret.classList.add('on'); };
    doc.addEventListener('touchstart', ts, { passive: true });
    doc.addEventListener('touchmove', ts, { passive: true });
    doc.addEventListener('touchend', function () { touching = false; touchT = performance.now(); }, { passive: true });
    if (COARSE) ret.classList.add('on');
  }
  win.addEventListener('keydown', function (e) { if (e.key === 'Escape') setLock(null); });

  /* ---------- sinyal hattı (osiloskop) ---------- */
  var sig = $('#sig'), sctx = sig.getContext('2d'), stages = $$('.st'), sigVis = false, sigW = 0, sigH = 0, sigDpr = 1;
  function sizeSig() {
    sigDpr = Math.min(2, win.devicePixelRatio || 1);
    sigW = sig.width = Math.round(sig.clientWidth * sigDpr); sigH = sig.height = Math.round(sig.clientHeight * sigDpr);
  }
  var wv = [
    function (u, t) { var s = 0, k, d; for (k = 0; k < 4; k++) { d = u - (.03 + k * .055); s += (d > 0 ? Math.exp(-d * 90) * Math.sin(d * 900) : 0) * (k % 2 ? -.9 : 1) + Math.exp(-d * d / .000018) * (k % 2 ? -1 : 1); } return clamp(s, -1, 1) * .85 + .02 * Math.sin(u * 400 + t * .001); },
    function (u, t) { var a = Math.sin(u * 150 - t * .004) * .32 * (.3 + Math.pow(Math.sin(u * 26), 2)) + Math.sin(u * 410 + t * .006) * .12 + Math.sin(u * 61) * .1; return a; },
    function (u, t) { var lv = [.45, -.35, .55, .05], i = Math.floor(((u - .5) / .25) * 8) % 4; var base = lv[(i + 4) % 4]; var q = Math.sin(((u - .5) / .25) * 8 * Math.PI * .5); return (q >= 0 ? base : -base * .6) * .8 + .03 * Math.sin(u * 700); },
    function (u, t) { return .06 * Math.sin(u * 90 - t * .002) + .62 * Math.exp(-Math.pow((u - .875) / .028, 2)) - .22 * Math.exp(-Math.pow((u - .915) / .02, 2)); }
  ];
  function sigY(u, t) {
    var y = 0, b = [0, .25, .5, .75, 1], i;
    for (i = 0; i < 4; i++) {
      var w = sstep(b[i] - .012, b[i] + .012, u) * (1 - sstep(b[i + 1] - .012, b[i + 1] + .012, u));
      if (i === 0) w = 1 - sstep(b[1] - .012, b[1] + .012, u);
      if (w > 0) y += w * wv[i](u, t);
    }
    return y;
  }
  var sigHead = 0, sigStart = 0;
  function drawSig(now) {
    var w = sigW, h = sigH, c = sctx, mid = h / 2, A = h * .34, x, i;
    c.clearRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,180,84,.08)'; c.lineWidth = 1; c.beginPath();
    for (i = 1; i < 12; i++) { c.moveTo(Math.round(i * w / 12) + .5, 0); c.lineTo(Math.round(i * w / 12) + .5, h); }
    for (i = 1; i < 6; i++) { c.moveTo(0, Math.round(i * h / 6) + .5); c.lineTo(w, Math.round(i * h / 6) + .5); }
    c.stroke();
    c.strokeStyle = 'rgba(255,180,84,.22)'; c.beginPath(); c.moveTo(0, mid + .5); c.lineTo(w, mid + .5); c.stroke();
    var head = RM ? 1.02 : ((now - sigStart) % 9500) / 9500 * 1.18;
    for (i = 0; i < 4; i++) {
      var nx = (i * .25 + .125) * w, on = head > i * .25 + .02;
      c.strokeStyle = on ? 'rgba(255,180,84,.55)' : 'rgba(160,185,215,.2)'; c.setLineDash([3, 5]);
      c.beginPath(); c.moveTo(nx, 0); c.lineTo(nx, h); c.stroke(); c.setLineDash([]);
      c.fillStyle = on ? '#ffb454' : 'rgba(160,185,215,.35)'; c.font = (11 * sigDpr) + 'px ui-monospace,monospace';
      c.fillText('0' + (i + 1), nx + 6 * sigDpr, 16 * sigDpr);
      stages[i].classList.toggle('on', on);
    }
    var pts = [], xs = Math.max(1, Math.round(1.6 * sigDpr));
    for (x = 0; x <= w; x += xs) pts.push([x, mid - sigY(x / w, now) * A]);
    c.lineJoin = 'round'; c.lineWidth = 1.2 * sigDpr; c.strokeStyle = 'rgba(255,180,84,.28)'; c.beginPath();
    pts.forEach(function (p, k) { k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke();
    var hx = Math.min(w, head * w), tail = Math.max(0, hx - w * .4);
    c.lineWidth = 2 * sigDpr; c.shadowColor = '#ffb454'; c.shadowBlur = 10 * sigDpr;
    var g = c.createLinearGradient(tail, 0, Math.max(tail + 1, hx), 0);
    g.addColorStop(0, 'rgba(255,180,84,0)'); g.addColorStop(1, RM ? 'rgba(255,180,84,.95)' : '#ffd9a0');
    c.strokeStyle = RM ? 'rgba(255,180,84,.95)' : g; c.beginPath(); var st = false;
    pts.forEach(function (p) { if (p[0] >= (RM ? 0 : tail) && p[0] <= hx) { st ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); st = true; } });
    c.stroke(); c.shadowBlur = 0;
    if (!RM && hx < w) { var hy = mid - sigY(hx / w, now) * A; c.fillStyle = '#fff'; c.shadowColor = '#ffb454'; c.shadowBlur = 16 * sigDpr; c.beginPath(); c.arc(hx, hy, 3.4 * sigDpr, 0, 6.3); c.fill(); c.shadowBlur = 0; }
  }

  /* ---------- Sesli Şef: gerçek ses + WebAudio analizör dalgası ---------- */
  var wave = $('#wave'), wctx = wave.getContext('2d'), waveVis = false, audio = null, AW = null, an = null, wbuf = null, playing = false;
  function sizeWave() {
    var d = Math.min(2, win.devicePixelRatio || 1);
    wave.width = Math.round(wave.clientWidth * d); wave.height = Math.round(wave.clientHeight * d);
  }
  function updPlayLabel() {
    var t = $('#play-t'), st = $('#wave-st'); if (!t) return;
    var L = function (k, tr) { return lang === 'en' ? EN[k] : tr; };
    t.textContent = playing ? L('s.stop', '■ Durdur') : L('s.play', '▶ Örnek konuşmayı dinle');
    st.textContent = playing ? L('s.on', 'örnek konuşma çalıyor') : L('s.off', 'ses kapalı · düğmeye basınca çalar');
    $('#play').setAttribute('aria-pressed', playing ? 'true' : 'false');
  }
  function stopAudio() { playing = false; if (audio) audio.pause(); updPlayLabel(); drawWave(performance.now(), true); }
  $('#play').addEventListener('click', function () {
    if (playing) { stopAudio(); return; }
    if (!audio) {
      audio = new Audio('audio/sesli-sef-ornek.mp3'); audio.preload = 'auto';
      audio.addEventListener('ended', stopAudio);
      var C = win.AudioContext || win.webkitAudioContext;
      if (C) {
        AW = new C(); an = AW.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = .6;
        var src = AW.createMediaElementSource(audio); src.connect(an); an.connect(AW.destination);
        wbuf = new Uint8Array(an.fftSize);
      }
    }
    if (AW && AW.state === 'suspended') AW.resume();
    audio.currentTime = 0;
    playing = true; updPlayLabel();
    var pr = audio.play(); if (pr && pr.catch) pr.catch(function () { playing = false; updPlayLabel(); });
  });
  function drawWave(now, force) {
    var w = wave.width, h = wave.height, c = wctx, mid = h / 2, i;
    c.clearRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,180,84,.1)'; c.lineWidth = 1; c.beginPath();
    for (i = 1; i < 8; i++) { c.moveTo(Math.round(i * w / 8) + .5, 0); c.lineTo(Math.round(i * w / 8) + .5, h); }
    c.moveTo(0, mid + .5); c.lineTo(w, mid + .5); c.stroke();
    c.lineWidth = 1.8 * (w / 560); c.strokeStyle = '#ffb454'; c.shadowColor = '#ffb454'; c.shadowBlur = 8; c.beginPath();
    if (playing && an) {
      an.getByteTimeDomainData(wbuf);
      for (i = 0; i < wbuf.length; i += 2) {
        var x = i / wbuf.length * w, y = mid + ((wbuf[i] - 128) / 128) * mid * 1.9;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
    } else {
      for (i = 0; i <= 120; i++) {
        var xx = i / 120 * w, yy = mid + (RM || force ? 0 : Math.sin(i * .6 + now * .002) * 1.2);
        i ? c.lineTo(xx, yy) : c.moveTo(xx, yy);
      }
    }
    c.stroke(); c.shadowBlur = 0;
  }

  /* ---------- sahne (shader) ---------- */
  var canvas = $('#sky'), gl = null, st = { time: 0, depth: 0, focus: 0, bh: 0, warp: 0, lens: 1, bhr: .1, pal: 0, mx: 0, my: 0, bx: 0, by: .12 };
  var mobile = win.innerWidth < 760 || (COARSE && win.innerWidth < 1000);
  var scale = mobile ? .5 : 1, fixedScale = qs.has('scale') || mobile, vw = 1, vh = 1;
  if (qs.has('scale')) scale = clamp(parseFloat(qs.get('scale')) || 1, .25, 1.5);
  function resizeGL() {
    vw = win.innerWidth; vh = canvas.clientHeight || win.innerHeight;
    if (gl) gl.resize(vw * scale, vh * scale);
  }
  function setStaticBH(b) { $('#sky-b').style.opacity = b.toFixed(2); }

  var sp = 0, bhS = 0, maxS = 1, lastT = 0, fAcc = 0, fN = 0, raf = 0, bootT0 = 0, bootDone = false, warpPh = 0, warpT0 = 0, bhSnd = false;
  var overAcc = 0, capN = 0, lastDraw = 0, SLOW = parseInt(qs.get('slow') || '0', 10) || 0;
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = clamp((now - lastT) / 1000, 0.0005, .1); lastT = now;
    if (!RM) {
      fAcc += dt; fN++;
      if (fN >= 30) {
        var avg = fAcc / fN; fAcc = 0; fN = 0;
        if (avg > .034 && scale > .5 && !fixedScale) { scale = Math.max(.5, scale - .125); resizeGL(); }
      }
    }
    var sy = win.scrollY; maxS = Math.max(1, doc.documentElement.scrollHeight - win.innerHeight);
    var P = clamp(sy / maxS, 0, 1);
    sp += (P - sp) * (1 - Math.exp(-dt * (qs.has('snap') ? 99 : 5)));
    var rem = (maxS - sy) / win.innerHeight;
    var bhT = sstep(0, 1, clamp((2.1 - rem) / 1.5, 0, 1));
    bhS += (bhT - bhS) * (1 - Math.exp(-dt * 4));
    var asp = win.innerWidth / win.innerHeight;
    st.time = now / 1000; st.depth = sp * 2.6; st.bh = bhS;
    st.pal = .5 + .5 * Math.sin(sp * 6);
    st.bhr = Math.min(.105, asp * .1) * (.62 + .38 * bhS);
    st.by = asp < .8 ? .2 : .14; st.bx = 0;
    if (!bootDone) { st.focus = easeOut(clamp((now - bootT0) / 3800, 0, 1)); }
    else st.focus = Math.min(1, easeOut(clamp((now - bootT0) / 3800, 0, 1)));
    if (CAP) capOverride();
    /* reticle */
    if (touching) { rx += (tx - rx) * (1 - Math.exp(-dt * 20)); ry += (ty - ry) * (1 - Math.exp(-dt * 20)); }
    else {
      if (COARSE && !touching && now - touchT > 900) { tx = win.innerWidth / 2; ty = win.innerHeight * .46; }
      rx += (tx - rx) * (1 - Math.exp(-dt * 16)); ry += (ty - ry) * (1 - Math.exp(-dt * 16));
    }
    ret.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    if (now - lastProbe > 110) {
      lastProbe = now;
      if (COARSE || curLock) probe();
      retRead.textContent = 'RA ' + (rx / win.innerWidth * 24).toFixed(2) + 'h · DEC ' + ((90 - ry / win.innerHeight * 180) >= 0 ? '+' : '') + (90 - ry / win.innerHeight * 180).toFixed(1) + '°';
    }
    if (curLock) placeLock();
    var lensT = curLock ? .25 : (COARSE ? .65 : 1);
    st.lens += (lensT - st.lens) * (1 - Math.exp(-dt * 8));
    st.mx = (rx - vw / 2) / vh; st.my = -(ry - vh / 2) / vh;
    /* geri dönüş (warp) */
    if (warpPh) {
      var wt = (now - warpT0) / 1000;
      if (warpPh === 1) { st.warp = easeOut(clamp(wt / .85, 0, 1)); $('#flash').style.opacity = String(clamp((wt - .45) / .4, 0, 1)); if (wt >= .9) { win.scrollTo(0, 0); sp = 0; bhS = 0; warpPh = 2; warpT0 = now; } }
      else { st.warp = 1 - easeOut(clamp(wt / 1.1, 0, 1)); $('#flash').style.opacity = String(1 - clamp(wt / .7, 0, 1)); if (wt >= 1.1) { warpPh = 0; st.warp = 0; $('#flash').style.opacity = '0'; } }
    }
    if (bhS > .55 && !bhSnd) { bhSnd = true; blip(80, 1.4, 'sine', .08, 32); }
    if (bhS < .2) bhSnd = false;
    if (gl && (!SLOW || now - lastDraw >= SLOW)) { lastDraw = now; gl.draw(st); }
    if (CAP && ++capN > 3) { cancelAnimationFrame(raf); raf = 0; }
    stripUpdate();
    $('#gauge-fill').style.top = (P * 134).toFixed(1) + 'px';
    $('#gauge-n').textContent = (sp * 2.6 * 3.26).toFixed(2);
    if (sigVis) drawSig(now);
    if (waveVis && playing) drawWave(now);
    if (bhS < .02 && !bootDone) { /* önyükleme sırasında */ }
  }
  function capOverride() {
    if (CAP === 'nebula') { st.depth = .33; st.bh = 0; st.focus = 1; st.lens = 0; st.mx = 3; st.my = 3; }
    if (CAP === 'bh') { st.depth = 1.05; st.bh = 1; st.bhr = Math.min(.105, win.innerWidth / win.innerHeight * .1); st.focus = 1; st.lens = 0; st.mx = 3; st.my = 3; }
  }
  function goHome() {
    if (warpPh) return;
    if (RM) { win.scrollTo(0, 0); return; }
    blip(180, 1, 'sawtooth', .04, 1800); warpPh = 1; warpT0 = performance.now();
  }
  $('#again').addEventListener('click', goHome);
  win.addEventListener('wheel', function (e) {
    if (RM) return;
    if (maxS - win.scrollY < 6 && e.deltaY > 0) { overAcc += e.deltaY; if (overAcc > 1100) { overAcc = 0; goHome(); } }
    else overAcc = Math.max(0, overAcc - 60);
  }, { passive: true });

  /* ---------- açılış ---------- */
  function boot(done) {
    var b = $('#boot'), bar = $('#boot-bar'), num = $('#boot-n'), t0 = performance.now();
    bootT0 = t0;
    var dur = 1900;
    (function s(now) {
      var p = clamp((now - t0) / dur, 0, 1), v = Math.round(easeOut(p) * 100);
      bar.style.width = v + '%'; num.textContent = ('00' + v).slice(-3);
      if (p < 1) return requestAnimationFrame(s);
      var t1 = performance.now(), mw = Math.hypot(win.innerWidth, win.innerHeight);
      (function o(n) {
        var q = clamp((n - t1) / 1100, 0, 1), R = easeOut(q) * mw * .55;
        var m = 'radial-gradient(circle at 50% 50%, transparent ' + R + 'px, #000 ' + (R + 60) + 'px)';
        b.style.webkitMaskImage = m; b.style.maskImage = m;
        if (q < 1) requestAnimationFrame(o); else { b.classList.add('gone'); body.classList.remove('booting'); done(); }
      })(t1);
    })(t0);
  }

  /* ---------- başlatma ---------- */
  function init() {
    setLang(startLang);
    initDecode();
    // reveal
    var rvSel = '.wcard,.sgrid>li,.st,.about .wrap,.finale-in,.flow .scope,.works .note,.steps .note';
    if (!RM) {
      var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: .12 });
      $$(rvSel).forEach(function (el) { el.classList.add('rv'); rio.observe(el); });
    }
    // görünürlük gözlemcileri
    new IntersectionObserver(function (es) { sigVis = es[0].isIntersecting; if (sigVis && !sigStart) sigStart = performance.now(); }, { threshold: .05 }).observe(sig);
    new IntersectionObserver(function (es) { waveVis = es[0].isIntersecting; }, { threshold: .05 }).observe(wave);
    sizeSig(); sizeWave(); layout();
    if (RM) { sigStart = 0; drawSig(0); drawWave(0, true); }
    win.addEventListener('resize', function () { sizeSig(); sizeWave(); layout(); resizeGL(); if (RM) { drawSig(0); drawWave(0, true); } });
    win.addEventListener('load', layout);
    drawWave(0, true);
    $('#lang').addEventListener('click', function () { setLang(lang === 'tr' ? 'en' : 'tr'); blip(660, .08, 'triangle', .04, 990); layout(); });

    // WebGL
    if (!RM) {
      try { gl = win.IVT_GL.create(canvas, {}); } catch (err) { gl = null; if (win.console) console.info('shader yok, statik sahne:', err.message); }
      if (!gl) body.classList.add('nogl');
      else {
        canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gl = null; body.classList.add('nogl'); });
        resizeGL();
      }
    }
    if (RM || !gl) {
      var upd = function () { maxS = Math.max(1, doc.documentElement.scrollHeight - win.innerHeight); var r = clamp((maxS - win.scrollY) / win.innerHeight, 0, 9); setStaticBH(sstep(0, 1, clamp((2.1 - r) / 1.5, 0, 1))); };
      win.addEventListener('scroll', upd, { passive: true }); win.addEventListener('load', upd); upd();
      body.classList.remove('booting');
      var bt = $('#boot'); if (bt) bt.classList.add('gone'); decodeHero();
      if (!RM) { win.addEventListener('scroll', stripUpdate, { passive: true }); }
      else win.addEventListener('scroll', stripUpdate, { passive: true });
      win.__ivt = { st: st };
      return;
    }
    win.addEventListener('scroll', function () {}, { passive: true });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
    });
    win.__ivt = { st: st, snap: function () { sp = clamp(win.scrollY / maxS, 0, 1); bhS = 1; } };
    lastT = performance.now(); bootT0 = lastT;
    raf = requestAnimationFrame(frame);
    if (CAP || qs.has('noboot')) { var bb = $('#boot'); bb.classList.add('gone'); body.classList.remove('booting'); bootDone = true; bootT0 = lastT - 9999; decodeHero(); }
    else boot(function () { bootDone = true; decodeHero(); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
