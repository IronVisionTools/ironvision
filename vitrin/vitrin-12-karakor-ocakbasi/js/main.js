(function () {
  "use strict";
  var form = document.getElementById("rez-form");
  var mesaj = document.getElementById("f-mesaj");
  var tarih = document.getElementById("f-tarih");
  if (tarih) {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    tarih.min = d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  function doldur(metin) {
    if (!mesaj) return;
    if (mesaj.value.indexOf(metin) === -1) mesaj.value = (mesaj.value ? mesaj.value + " " : "") + metin;
  }
  document.querySelectorAll("[data-tabak]").forEach(function (a) {
    a.addEventListener("click", function () {
      doldur(a.getAttribute("data-tabak") + " için bilgi/sipariş istiyorum.");
    });
  });
  document.querySelectorAll("[data-mesaj]").forEach(function (a) {
    a.addEventListener("click", function () { doldur(a.getAttribute("data-mesaj").trim()); });
  });
  // mobil sabit çubuk: hero geçilince, form görünene kadar
  var yapis = document.getElementById("yapis");
  var hero = document.querySelector(".hero");
  var rez = document.getElementById("rezervasyon");
  if (yapis && hero && "IntersectionObserver" in window) {
    var heroGorunur = true, rezGorunur = false;
    var guncelle = function () { yapis.classList.toggle("goster", !heroGorunur && !rezGorunur); };
    new IntersectionObserver(function (e) { heroGorunur = e[0].isIntersecting; guncelle(); }).observe(hero);
    new IntersectionObserver(function (e) { rezGorunur = e[0].isIntersecting; guncelle(); }).observe(rez);
  }
  // KVKK onayı işaretli değilse göndermeyi vitrin-form'dan önce durdur
  if (form) {
    document.addEventListener("submit", function (e) {
      if (e.target !== form) return;
      var k = form.querySelector('input[name="kvkk"]');
      if (k && !k.checked) {
        e.preventDefault(); e.stopImmediatePropagation();
        k.focus();
        k.setCustomValidity("Devam etmek için onaylayın.");
        k.reportValidity();
        k.addEventListener("change", function () { k.setCustomValidity(""); }, { once: true });
      }
    }, true);
  }
})();
