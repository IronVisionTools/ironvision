/* IRON VISION tools — görünüm seçici (Klasik · Yörünge · Derin Uzay). Üç görünümde ortak, bağımsız küçük betik. */
(function () {
  'use strict';
  var KEY = 'ivt-gorunum', d = document, de = d.documentElement;
  var p = location.pathname;
  var cur = p.indexOf('/gorunum/yorunge') === 0 ? 'yorunge' : p.indexOf('/gorunum/derin-uzay') === 0 ? 'derin-uzay' : 'klasik';
  var V = [['klasik', 'Klasik', 'Classic'], ['yorunge', 'Yörünge', 'Orbit'], ['derin-uzay', 'Derin Uzay', 'Deep Space']];
  function lang() {
    var l = (de.getAttribute('data-lang') || de.lang || 'tr').toLowerCase();
    if (cur === 'klasik') l = p.indexOf('/en/') === 0 ? 'en' : 'tr';
    return l.indexOf('en') === 0 ? 'en' : 'tr';
  }
  function href(v, l) {
    if (v === 'klasik') return l === 'en' ? '/en/' : '/';
    return '/gorunum/' + v + '/' + (l === 'en' ? '?lang=en' : '');
  }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  if (cur !== "klasik") save(cur);

  var css = '.ivt-gs{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:2147483000;display:flex;align-items:center;gap:2px;padding:3px;border-radius:999px;background:rgba(8,10,18,.82);border:1px solid rgba(160,190,255,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:600 11px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.02em;box-shadow:0 4px 18px rgba(0,0,0,.45)}' +
    '.ivt-gs b{font-weight:600;color:#9aa6c4;padding:0 6px 0 9px;font-size:10px;text-transform:uppercase;letter-spacing:.08em}' +
    '.ivt-gs a{color:#cfd6ea;text-decoration:none;padding:7px 10px;border-radius:999px;white-space:nowrap;min-height:14px}' +
    '.ivt-gs a:hover{background:rgba(255,255,255,.1);color:#fff}' +
    '.ivt-gs a[aria-current=page]{background:#dfe7ff;color:#0a0e1c}' +
    '.ivt-gs a:focus-visible{outline:2px solid #7fb0ff;outline-offset:1px}' +
    '@media (max-width:560px){.ivt-gs b{display:none}.ivt-gs{left:8px;bottom:max(8px,env(safe-area-inset-bottom));font-size:10.5px}.ivt-gs a{padding:7px 8px}body{padding-bottom:46px}}' +
    '@media (prefers-reduced-motion:no-preference){.ivt-gs a{transition:background .2s,color .2s}}';
  function build() {
    if (d.querySelector('.ivt-gs')) return;
    var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);
    var nav = d.createElement('nav'); nav.className = 'ivt-gs';
    var lab = d.createElement('b'); nav.appendChild(lab);
    V.forEach(function (v) {
      var a = d.createElement('a'); a.setAttribute('data-v', v[0]);
      if (v[0] === cur) a.setAttribute('aria-current', 'page');
      a.addEventListener('click', function () { save(v[0]); });
      a.addEventListener('auxclick', function () { save(v[0]); });
      nav.appendChild(a);
    });
    d.body.appendChild(nav);
    function upd() {
      var l = lang(), en = l === 'en';
      nav.setAttribute('aria-label', en ? 'View' : 'Görünüm');
      lab.textContent = en ? 'View' : 'Görünüm';
      lab.setAttribute('aria-hidden', 'true');
      V.forEach(function (v, i) {
        var a = nav.children[i + 1]; a.textContent = en ? v[2] : v[1]; a.href = href(v[0], l);
      });
      var dl = d.querySelectorAll('a[data-demo]');
      for (var i = 0; i < dl.length; i++) dl[i].href = en ? '/en/#contact' : '/#contact';
    }
    upd();
    try { new MutationObserver(upd).observe(de, { attributes: true, attributeFilter: ['lang', 'data-lang'] }); } catch (e) {}
  }
  if (d.body) build(); else d.addEventListener('DOMContentLoaded', build);
})();
