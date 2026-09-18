"use client";

import { UFUK_GUN, URUNLER, YILLIK_FINANSMAN, urunBul } from "@/data/seed";
import { lotDurumu, stokDurumu } from "@/lib/planner";
import { Kpi, Rozet } from "@/components/Parcalar";
import { gun, tarihKisa, tl, tlKisa, ton, yuzde } from "@/lib/bicim";

export default function StokSayfasi() {
  const durum = stokDurumu();
  const lotlar = lotDurumu();

  const toplamStok = durum.reduce((t, d) => t + d.stokTon, 0);
  const toplamDeger = durum.reduce((t, d) => t + d.stokDegeriTL, 0);
  const fazlaDeger = durum.reduce(
    (t, d) => t + d.fazlaStokTon * urunBul(d.sku).maliyetTon,
    0,
  );
  const birikmisFinansman = lotlar.reduce((t, l) => t + l.finansmanTL, 0);

  const kapsamaRengi = (kapsama: number) =>
    kapsama < 5 ? "var(--kritik)" : kapsama > 45 ? "var(--uyari)" : "var(--iyi)";

  return (
    <main className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Stok ve kapsama</h1>
          <p>
            Mamul stoğu yalnızca miktar olarak değil, kaç günlük siparişi
            karşıladığı, ne kadar beklediği ve ne kadar sermaye bağladığıyla
            birlikte gösteriliyor.
          </p>
        </div>
      </div>

      <div className="izgara izgara-4" style={{ marginBottom: 16 }}>
        <Kpi etiket="Toplam mamul stoğu" deger={ton(toplamStok)} aciklama={`${lotlar.length} lot, ${tlKisa(toplamDeger)} maliyet değeri`} />
        <Kpi
          etiket="İhtiyaç fazlası stok"
          deger={ton(durum.reduce((t, d) => t + d.fazlaStokTon, 0))}
          aciklama={`${tlKisa(fazlaDeger)} bağlı işletme sermayesi`}
          yon="kotu"
        />
        <Kpi
          etiket="Birikmiş finansman maliyeti"
          deger={tlKisa(birikmisFinansman)}
          aciklama={`Yıllık ${yuzde(YILLIK_FINANSMAN)} finansman maliyetiyle`}
          yon="kotu"
        />
        <Kpi
          etiket="Stoğu 5 günden az ürün"
          deger={`${durum.filter((d) => d.gunKapsama < 5).length}`}
          aciklama="Sipariş hızına göre kapsama süresi"
          yon="kotu"
        />
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Ürün bazında stok durumu</h2>
            <p>
              Net ihtiyaç, emniyet stoğu dahil edilerek hesaplanır: açık sipariş
              + emniyet stoğu − mevcut stok.
            </p>
          </div>
        </div>
        <div className="kart-govde sikisik">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th className="sayi">Stok</th>
                  <th className="sayi">Açık sipariş</th>
                  <th className="sayi">{UFUK_GUN} gün içi termin</th>
                  <th className="sayi">Net ihtiyaç</th>
                  <th>Gün kapsama</th>
                  <th className="sayi">En yaşlı lot</th>
                  <th className="sayi">Bağlı sermaye</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {URUNLER.map((u) => {
                  const d = durum.find((x) => x.sku === u.sku)!;
                  const acik = d.stokTon < d.ufuktakiTalepTon;
                  return (
                    <tr key={u.sku}>
                      <td>
                        <div className="kalin">{u.kisaAd}</div>
                        <div className="ikincil">{u.sku}</div>
                      </td>
                      <td className="sayi">{ton(d.stokTon)}</td>
                      <td className="sayi">{ton(d.acikSiparisTon)}</td>
                      <td className="sayi">{ton(d.ufuktakiTalepTon)}</td>
                      <td className="sayi kalin">
                        {d.netIhtiyacTon > 0 ? ton(d.netIhtiyacTon) : "—"}
                      </td>
                      <td>
                        <div className="satir" style={{ gap: 8 }}>
                          <div className="cubuk" style={{ width: 70, minWidth: 70 }}>
                            <span
                              style={{
                                width: `${Math.min(100, (d.gunKapsama / 60) * 100)}%`,
                                background: kapsamaRengi(d.gunKapsama),
                              }}
                            />
                          </div>
                          <span className="sayisal ikincil">
                            {d.gunKapsama > 300 ? "—" : gun(d.gunKapsama)}
                          </span>
                        </div>
                      </td>
                      <td className="sayi">{d.enYasliGun} gün</td>
                      <td className="sayi">{tlKisa(d.stokDegeriTL)}</td>
                      <td>
                        {acik ? (
                          <Rozet tur="kritik">Açık var</Rozet>
                        ) : d.fazlaStokTon > 0 ? (
                          <Rozet tur="uyari">
                            {ton(d.fazlaStokTon)} fazla
                          </Rozet>
                        ) : (
                          <Rozet tur="iyi">Dengeli</Rozet>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Lot bazında bekleme ve finansman maliyeti</h2>
            <p>
              Finansman maliyeti = lot değeri × yıllık {yuzde(YILLIK_FINANSMAN)}{" "}
              × stokta beklediği gün / 365.
            </p>
          </div>
        </div>
        <div className="kart-govde sikisik">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Ürün</th>
                  <th className="sayi">Miktar</th>
                  <th>Üretim</th>
                  <th className="sayi">Bekleme</th>
                  <th className="sayi">Kalan raf ömrü</th>
                  <th className="sayi">Finansman maliyeti</th>
                </tr>
              </thead>
              <tbody>
                {[...lotlar]
                  .sort((a, b) => b.finansmanTL - a.finansmanTL)
                  .map((l) => {
                    const u = urunBul(l.sku);
                    const rafOrani = l.kalanRafGun / u.rafOmruGun;
                    return (
                      <tr key={l.lotNo}>
                        <td className="kalin">{l.lotNo}</td>
                        <td>{u.kisaAd}</td>
                        <td className="sayi">{ton(l.ton)}</td>
                        <td>{tarihKisa(l.uretimTarihi)}</td>
                        <td className="sayi">
                          {l.yasGun >= 60 ? (
                            <Rozet tur={l.yasGun >= 90 ? "kritik" : "uyari"}>
                              {l.yasGun} gün
                            </Rozet>
                          ) : (
                            `${l.yasGun} gün`
                          )}
                        </td>
                        <td className="sayi">
                          {l.kalanRafGun} gün
                          {rafOrani < 0.45 ? (
                            <div className="ikincil">
                              raf ömrünün {yuzde(1 - rafOrani)}&apos;i doldu
                            </div>
                          ) : null}
                        </td>
                        <td className="sayi kalin">{tl(l.finansmanTL)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
