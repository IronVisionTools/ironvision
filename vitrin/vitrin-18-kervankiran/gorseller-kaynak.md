Lisans: Pexels License — https://www.pexels.com/license/ (ticari kullanım serbest, atıf zorunlu değil, stok siteye yeniden yükleme yasak).

## GÖRSELLER

- `hero-samanyolu.webp` · Pexels foto #31021507 · https://www.pexels.com/photo/31021507/ · fotoğrafçı: Aarin Husain · genişlik 1800px · 141.7 KB
- `hero-mobil.webp` · Pexels foto #17954395 · https://www.pexels.com/photo/17954395/ · fotoğrafçı: Ademir Mattos · genişlik 800px · 51.1 KB
- `bungalov-gece.webp` · Pexels foto #9890740 · https://www.pexels.com/photo/9890740/ · fotoğrafçı: Erik Mclean · genişlik 1000px · 48.2 KB
- `teleskop.webp` · Pexels foto #2646380 · https://www.pexels.com/photo/2646380/ · fotoğrafçı: Lucas Pezeta · genişlik 900px · 44.7 KB
- `bozkir-gunduz.webp` · Pexels foto #10407599 · https://www.pexels.com/photo/10407599/ · fotoğrafçı: Constantin Chernishov · genişlik 1000px · 53.7 KB
- `yildiz-izi.webp` · Pexels foto #18364792 · https://www.pexels.com/photo/18364792/ · fotoğrafçı: Eclipse Chasers · genişlik 900px · 45.3 KB

TOPLAM: 384.6 KB

## ALT METİNLERİ

- `hero-samanyolu.webp` — "Kurak bozkır ufku üzerinde parlak Samanyolu kavsi, yıldız dolu gece gökyüzü"
- `hero-mobil.webp` — "Dikey kadrajda gece gökyüzünde yükselen Samanyolu ve sayısız yıldız"
- `bungalov-gece.webp` — "Yıldızlı gece gökyüzü altında sıcak ışıklı pencereli ahşap kulübe"
- `teleskop.webp` — "Gece gökyüzüne dönük teleskop silueti, arkada yıldız dolu Samanyolu"
- `bozkir-gunduz.webp` — "Gündüz açık mavi gökyüzü altında uçsuz bucaksız kurak bozkır düzlüğü"
- `yildiz-izi.webp` — "Karanlık ufuk çizgisi üzerinde uzun pozlamayla çekilmiş dairesel yıldız izleri"

## 03.09 EKLEME — Kervan kartı
Sebep: kartta "taş yapı" anlatılıyordu ama fotoğrafta yapı yoktu (boş bozkır);
alt metni de var olmayan taş yapılardan söz ediyordu. Şef denetiminde yakalandı.
- `tas-yapi.webp` · Pexels #11022607 · https://www.pexels.com/photo/11022607/ ·
  fotoğrafçı: Mathias Reding · 880×587 (dikey orijinal 3:2'ye kırpıldı) · 33,0 KB ·
  Pexels License (https://www.pexels.com/license/)
- `bozkir-gunduz.webp` artık sayfada KULLANILMIYOR (silinmedi, depoda duruyor).

## 03.09 EKLEME — GÖSTERİ TURU: hero videosu + yeni poster
Sebep: Demir 02:48 sesli emri — hero fotoğrafı düşük kaliteli duruyordu, sayfada
"gerçek hareket" yoktu. `hero-samanyolu.webp`/`hero-mobil.webp` SİLİNMEDİ, depoda
duruyor (tek kopya kuralı + "eskiyi silme" talimatı); sayfa artık `-v2` uzantılı
yeni dosyaları kullanıyor.

- **`video/hero-gece.webm`** · Pexels Video #32063954 "Stunning Timelapse of
  Milky Way Over Hills" · https://www.pexels.com/video/stunning-timelapse-of-milky-way-over-hills-32063954/
  · videografı: emreayata (https://www.pexels.com/@emreayata/) · orijinal
  2560×1440 30fps, 7,3 sn · dönüştürülmüş: VP9/webm, 1440×810, sessiz (`-an`),
  crf 36, **2,22 MB** · Pexels License (https://www.pexels.com/license/, ticari
  kullanım serbest, atıf zorunlu değil).
- **`hero-samanyolu-v2.webp`** — aynı kaynak videonun ilk karesinden (t=0,2 sn)
  alınan durağan görüntü, 1400×788, webp q60, **41,2 KB** — hem masaüstü poster
  hem `<video poster>`; video başladığında görüntüde sıçrama olmuyor çünkü poster
  videonun kendi ilk karesi.
- **`hero-mobil-v2.webp`** — aynı karenin Samanyolu'na odaklı dikey kırpımı
  (2560×1440'tan 1050×1440 kırpılıp 800px genişliğe küçültüldü), webp q60,
  **43,9 KB**.
  Eski posterlerden (141,7 KB + 51,1 KB = 192,8 KB) daha küçük VE daha temiz —
  eski dosyalardaki bloklanma, kaynağın kendisinin daha gürültülü/yüksek ISO
  olmasından kaynaklanıyordu; yeni kaynak görüntü daha temiz, aynı q'da daha az
  veri istiyor (genişlik düşürüldü, kalite q≥40 tutuldu — reçete gereği).
- Video davranışı: `prefers-reduced-motion:reduce`, ekran ≤640px ya da
  `navigator.connection.saveData` açıksa `<video>`'ya hiç `<source>` eklenmiyor,
  sıfır istek gidiyor, poster tek başına kalıyor (bkz. `js/site.js` `heroVideo()`).
