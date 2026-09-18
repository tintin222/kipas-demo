# Kipaş Ajan Platformu — Nişasta Fabrikası Demosu

Mısır yaş öğütme (nişasta) fabrikası için **stok, sipariş ve üretim planlama**
ajanının çalışır demosu. Bugün telefonla ve mesajla koordine edilen siparişleri,
mamul stoğunu ve üretim programını tek ekranda birleştirir; riskleri kendisi
çıkarır ve üç haftalık üretim programını **gerekçesi ve TL karşılığıyla** önerir.

Kararı veren insandır: ajan programı önerir, kullanıcı hedefi seçer, sırayı
elle değiştirebilir, sonra onaylar.

> Ekranlardaki ürün, sipariş, stok ve maliyet verilerinin tamamı gösterim için
> üretilmiş örnek verilerdir. Gerçek Kipaş verisi kullanılmamıştır.

## Çalıştırma

```bash
npm install
npm run dev     # http://localhost:3000
```

Üretim derlemesi için `npm run build && npm run start`.

## İki dakikalık demo akışı

1. **Senaryolar** (`/`) — platformda hangi ajanın çalıştığı, hangilerinin sırada
   olduğu. Nişasta planlama ajanına girilir.
2. **Kontrol Kulesi** (`/uretim-planlama`) — 9 üründen 6'sının stoğu açık
   siparişleri karşılamıyor, 5 siparişin termini risk altında, 650 ton stok 60
   günden uzun süredir bekliyor. Sayfanın altındaki *Yönetimin sorduğu sorular*
   bloğu, müşterinin mektubunda sorduğu sekiz sorunun her birini ekrandaki
   veriden hesaplayarak cevaplar.
3. **Planlama ajanını çalıştır** → ajan adım adım ne yaptığını yazar: sipariş
   defterini okur, lot yaşlarını kontrol eder, net ihtiyacı çıkarır, üretim
   müdürünün mevcut programını simüle eder, 44 sıralama alternatifi dener.
4. **Karar** — ajan iki programı da hesaplar ve kararı kullanıcıya bırakır:
   *toplam maliyet en düşük* (1 sipariş 1,4 gün gecikir) ya da *hiçbir sipariş
   gecikmesin* (şurup hattında iki ürün geçişi daha, ~146 bin TL ek maliyet).
5. **Ölçülen fark** — mevcut program → seçilen program: geciken sipariş 2 → 1,
   ürün geçiş maliyeti 528.000 → 236.000 TL, ihtiyaç dışı üretim 290 t → 0 t
   (6,0 mn TL işletme sermayesi serbest kalır).
6. **Program** — hatlara göre Gantt, her kampanyanın gerekçesi. Sıra ok
   tuşlarıyla değiştirilir ve **rakamlar anında yeniden hesaplanır**; yanlış bir
   sıralama dönem kazancını 324.401 TL'den 59.592 TL'ye düşürür.
7. **Onayla** — program üretim, planlama ve satış için tek kaynak olur; başarı
   ölçüsü de ekranda yazılıdır.

## Ajan ne hesaplıyor

`src/lib/planner.ts` içindeki motor, ekranlarda gösterilen her rakamı üretir:

| Soru | Hesap |
| --- | --- |
| Hangi ürünün stoğu yetmiyor | Açık sipariş + emniyet stoğu − mevcut stok |
| Kaç günlük ihtiyaç karşılanıyor | Stok / sipariş defterinden gelen günlük talep |
| Hangi termin risk altında | Hat kapasitesi ve ürün geçişleriyle gün gün simülasyon |
| Hangi stok finansman maliyeti üretiyor | Lot değeri × yıllık faiz × bekleme günü / 365 |
| Sıra değişirse ne kazanılır | Geçiş maliyeti + gecikme cezası + stok finansmanı toplamının karşılaştırması |
| Kârlılık önceliği değiştirir mi | Ton başına katkı marjı ile gecikme cezasının birlikte ağırlıklandırılması |

Sıralama araması üç kaynaktan aday üretir: bütün tek kampanyalı permütasyonlar,
geçiş maliyetine farklı duyarlılıktaki sezgisel programlar ve terminleri şart
koşan program. Her aday simüle edilip toplam maliyete göre puanlanır.

### Bilinçli basitleştirmeler

Demo, gerçek bir APS kurulumunun yerine geçmez. Kasıtlı olarak sadeleştirilenler:
tek ürün çalışan hatlar, sabit üretim hızları, doğrusal üretim, sevkiyatın termin
gününde yapılması, mısır alımı ve randıman tarafının kapsam dışı olması.

## Yapı

```
src/lib/ajan/          Ortak ajan çatısı: senaryo sözleşmesi ve senaryo listesi
src/lib/planner.ts     Planlama motoru: simülasyon, optimizasyon, bulgular
src/lib/types.ts       Alan modeli
src/data/seed.ts       Örnek fabrika verisi (ürün, hat, stok, sipariş, geçiş matrisi)
src/senaryolar/…       Senaryoya özel ekran mantığı ve durum yönetimi
src/app/…              Next.js App Router sayfaları
```

### Yeni senaryo ekleme

Kabuk, navigasyon ve ajan paneli senaryodan bağımsızdır. Yeni bir iş senaryosu
(satın alma, bakım, holding raporlaması) için:

1. `src/senaryolar/<senaryo>/senaryo.ts` içinde `AjanSenaryosu` sözleşmesini
   uygula: `bolumler` navigasyonu, `calistir()` ise ajan koşusunu
   (`adimlar`, `bulgular`, `ozetMetrikler`, `kararlar`) döndürür.
2. `src/lib/ajan/senaryolar.ts` listesine ekle.
3. Sayfaları `src/app/<senaryo>/` altına koy.

Üst navigasyon, senaryo kartları ve alt sekmeler kendiliğinden çalışır.
