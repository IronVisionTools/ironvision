/* mobil menu (hamburger): index.html'deki satir ici betikle ayni davranis, alt sayfalar icin */
(function () {
  var b = document.getElementById('nav-ac'), m = document.getElementById('nav-mobil');
  if (!b || !m) return;
  var tr = document.documentElement.lang !== 'en';
  function kapat() { m.classList.remove('acik'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', tr ? 'Menüyü aç' : 'Open menu'); }
  b.addEventListener('click', function () {
    var acik = m.classList.toggle('acik');
    b.setAttribute('aria-expanded', acik ? 'true' : 'false');
    b.setAttribute('aria-label', acik ? (tr ? 'Menüyü kapat' : 'Close menu') : (tr ? 'Menüyü aç' : 'Open menu'));
  });
  m.addEventListener('click', function (e) { if (e.target.tagName === 'A') kapat(); });
  document.addEventListener('click', function (e) { if (m.classList.contains('acik') && !m.contains(e.target) && !b.contains(e.target)) kapat(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('acik')) kapat(); });
})();
