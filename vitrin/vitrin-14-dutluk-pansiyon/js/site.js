(function () {
  "use strict";
  var giris = document.getElementById("giris");
  var cikis = document.getElementById("cikis");
  var oda = document.getElementById("oda");

  function iso(d) {
    var z = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }
  if (giris && cikis) {
    var bugun = new Date();
    giris.min = iso(bugun);
    giris.addEventListener("change", function () {
      if (!giris.value) return;
      var g = new Date(giris.value + "T12:00:00");
      g.setDate(g.getDate() + 1);
      cikis.min = iso(g);
      if (cikis.value && cikis.value < cikis.min) cikis.value = cikis.min;
    });
    cikis.min = giris.min;
  }

  // "Bu oda için fiyat sor" bağlantıları formdaki oda seçimini doldurur
  Array.prototype.forEach.call(document.querySelectorAll("[data-oda]"), function (a) {
    a.addEventListener("click", function () {
      if (oda) oda.value = a.getAttribute("data-oda");
    });
  });

  // galeri büyütme
  var kutu = document.getElementById("buyut");
  if (kutu && typeof kutu.showModal === "function") {
    var resim = kutu.querySelector("img");
    Array.prototype.forEach.call(document.querySelectorAll(".galeri button"), function (b) {
      b.addEventListener("click", function () {
        var k = b.querySelector("img");
        resim.src = k.getAttribute("data-buyuk") || k.src;
        resim.alt = k.alt;
        kutu.showModal();
      });
    });
    kutu.addEventListener("click", function (e) { if (e.target === kutu || e.target.tagName === "BUTTON") kutu.close(); });
  }
})();
