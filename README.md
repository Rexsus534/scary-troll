# SCARY TROLL

Tarayıcıda çalışan, Three.js tabanlı küçük bir 3D troll-korku oyunu.

## Çalıştırma
ES module ve importmap kullandığı için dosyayı doğrudan `file://` ile açmak yerine yerel sunucu kullan:
- VS Code: Live Server eklentisiyle `index.html` dosyasını aç.
- Python yüklüyse proje klasöründe terminal açıp `python3 -m http.server 8000` çalıştır; sonra `http://localhost:8000` adresine git.

Three.js CDN üzerinden yüklenir; ilk açılışta internet gerekir.

## Kontroller
PC: WASD, mouse, Shift, E. Mouse kilidi için oyun alanına tıkla.
Mobil: Sol joystick, sağ tarafta sürükleyerek bakış, KOŞ ve E butonları.

## Not
Bu başlangıç-tam-oynanabilir prototipte modeller geometrilerden kodla üretilmiştir; harici model/ses dosyası gerektirmez. Görseller ve performans cihazına göre değişebilir.
