(function () {
  "use strict";
  var $ = function (s, k) { return (k || document).querySelector(s); };
  var $$ = function (s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); };

  var form = $("#randevu-formu");
  var randevu = $("#randevu");

  function hizmetSec(ad) {
    if (!ad) return;
    $$('input[name="hizmet"]', form).forEach(function (i) { if (i.value === ad) i.checked = true; });
  }
  function gunSec(ad) {
    $$('input[name="gun_tercihi"]', form).forEach(function (i) { i.checked = (i.value === ad); });
  }
  function git() {
    randevu.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    var ad = $('input[name="ad_soyad"]', form);
    setTimeout(function () { if (ad && !ad.value) ad.focus({ preventScroll: true }); }, 700);
  }

  // Hero hızlı kutusu: seçimi uzun forma taşır, yeni veri uç noktası yok.
  $("#hizli").addEventListener("submit", function (e) {
    e.preventDefault();
    hizmetSec($("#hz-hizmet").value);
    gunSec($("#hz-gun").value);
    git();
  });

  // Hizmet satırlarındaki "Bu hizmet için randevu" düğmeleri
  $$("[data-hizmet]").forEach(function (b) {
    b.addEventListener("click", function () { hizmetSec(b.getAttribute("data-hizmet")); git(); });
  });

  // Geçmiş tarih seçilemesin
  var t = $("#tarih");
  if (t) {
    var d = new Date();
    t.min = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  // Bugünün çalışma saati satırını vurgula
  var gun = String(new Date().getDay());
  $$(".saat li").forEach(function (li) {
    if ((li.getAttribute("data-gunler") || "").split(",").indexOf(gun) > -1) li.classList.add("bugun");
  });

  // Üst çubuk gölgesi + mobil sabit düğme (form görünürken gizlenir)
  var ust = $("#ust"), sabit = $("#sabit"), formda = false;
  function kaydir() {
    ust.classList.toggle("kayik", window.scrollY > 8);
    if (sabit) sabit.classList.toggle("acik", window.scrollY > 520 && !formda);
  }
  window.addEventListener("scroll", kaydir, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (k) { formda = k[0].isIntersecting; kaydir(); }, { threshold: 0.05 }).observe(randevu);
  }
  kaydir();
})();
