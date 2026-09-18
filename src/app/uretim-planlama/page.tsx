"use client";

import Link from "next/link";
import { BUGUN, UFUK_GUN, urunBul } from "@/data/seed";
import { gunuTariheCevir, lotDurumu, stokDurumu } from "@/lib/planner";
import { BulguKarti, Kpi, Rozet } from "@/components/Parcalar";
import { gun, tarih, tarihKisa, tl, tlKisa, ton, yuzde } from "@/lib/bicim";
import { usePlanBaglami } from "@/senaryolar/uretim-planlama/Saglayici";

export default function KontrolKulesi() {
  const { kosu, cikti } = usePlanBaglami();
  const { mevcut, oneri } = cikti;
  const durum = stokDurumu();
  const lotlar = lotDurumu();

  const acikUrunler = durum.filter((d) => d.stokTon < d.ufuktakiTalepTon);
  const acikTon = acikUrunler.reduce(
    (t, d) => t + (d.ufuktakiTalepTon - d.stokTon),
    0,
  );
  const yasliLotlar = lotlar.filter((l) => l.yasGun >= 60);
  const yasliFinansman = yasliLotlar.reduce((t, l) => t + l.finansmanTL, 0);
  const riskliSiparisler = mevcut.siparisler.filter(
    (r) => r.gecikmeGun > 0 || r.terminGun - r.hazirGun < 1.5,
  );
  const kapasite =
    mevcut.hatlar.reduce((t, h) => t + h.kapasiteKullanimi, 0) /
    mevcut.hatlar.length;
  const onlenebilir = kosu.bulgular
    .filter((b) => b.etkiTipi === "tasarruf")
    .reduce((t, b) => t + b.etkiTL, 0);

  const enDusukKapsama = [...durum].sort((a, b) => a.gunKapsama - b.gunKapsama)[0];
  const enYuksekKapsama = [...durum].sort((a, b) => b.gunKapsama - a.gunKapsama)[0];
  const fazlaUretilen = durum.filter((d) => d.fazlaStokTon > 0);
  /* Her ürünün önerilen programdaki ilk kampanyası. */
  const ilkKampanyalar = oneri.hatlar
    .flatMap((h) => h.kampanyalar)
    .reduce<{ sku: string; baslangicGun: number }[]>((liste, k) => {
      if (!liste.some((x) => x.sku === k.sku))
        liste.push({ sku: k.sku, baslangicGun: k.baslangicGun });
      return liste;
    }, [])
    .sort((a, b) => a.baslangicGun - b.baslangicGun);

  const sorular: { soru: string; cevap: React.ReactNode }[] = [
    {
      soru: "Hangi ürünün stoğu siparişleri karşılamıyor?",
      cevap: (
        <>
          {acikUrunler.length} ürün. En kritiği{" "}
          <b>{urunBul(enDusukKapsama.sku).kisaAd}</b>: stok{" "}
          {ton(enDusukKapsama.stokTon)}, {UFUK_GUN} gün içindeki sipariş{" "}
          {ton(enDusukKapsama.ufuktakiTalepTon)}. Toplam açık {ton(acikTon)}.
        </>
      ),
    },
    {
      soru: "Hangi üründen gereğinden fazla üretim yapılmış?",
      cevap: (
        <>
          {fazlaUretilen
            .map(
              (d) =>
                `${urunBul(d.sku).kisaAd} ${Math.round(d.fazlaStokTon)} t fazla`,
            )
            .join(", ")}
          . Üstelik mevcut program bu ürünlerden{" "}
          {ton(mevcut.ihtiyacDisiUretimTon)} daha üretiyor.
        </>
      ),
    },
    {
      soru: "Mevcut stok kaç günlük ihtiyacı karşılıyor?",
      cevap: (
        <>
          Ürüne göre {gun(enDusukKapsama.gunKapsama)} ile{" "}
          {Math.round(enYuksekKapsama.gunKapsama)} gün arasında.{" "}
          <b>{urunBul(enDusukKapsama.sku).kisaAd}</b> en kısası,{" "}
          <b>{urunBul(enYuksekKapsama.sku).kisaAd}</b> en uzunu.
        </>
      ),
    },
    {
      soru: "Hangi siparişin termini risk altında?",
      cevap: (
        <>
          {riskliSiparisler.length} sipariş. {mevcut.gecikenSiparis} tanesi
          mevcut programla termini kaçırıyor; sözleşme cezası{" "}
          {tl(mevcut.gecikmeCezasiTL)}.
        </>
      ),
    },
    {
      soru: "Hangi ürün ne zaman üretime alınmalı?",
      cevap: (
        <>
          {ilkKampanyalar
            .map(
              (k) =>
                `${urunBul(k.sku).kisaAd} ${tarihKisa(gunuTariheCevir(k.baslangicGun))}`,
            )
            .join(", ")}
          . Tam program Üretim Programı sekmesinde.
        </>
      ),
    },
    {
      soru: "Hangi stok finansman maliyeti oluşturuyor?",
      cevap: (
        <>
          60 günden yaşlı {yasliLotlar.length} lot, {ton(
            yasliLotlar.reduce((t, l) => t + l.ton, 0),
          )}
          . Bugüne kadar oluşan finansman maliyeti {tl(yasliFinansman)}.
        </>
      ),
    },
    {
      soru: "Üretim sırası değişirse maliyet azalır mı?",
      cevap: (
        <>
          Evet. Aynı üretim miktarıyla ürün geçiş maliyeti{" "}
          {tl(mevcut.gecisMaliyetiTL)} yerine {tl(oneri.gecisMaliyetiTL)};{" "}
          {UFUK_GUN} günde {tl(mevcut.gecisMaliyetiTL - oneri.gecisMaliyetiTL)}{" "}
          fark.
        </>
      ),
    },
    {
      soru: "Kârlılık üretim önceliğini değiştirmeli mi?",
      cevap: (
        <>
          Kapasite çakışmasında evet.{" "}
          {kosu.bulgular.find((b) => b.tip === "karlilik")?.detay.split(". ")[0]}
          .
        </>
      ),
    },
  ];

  return (
    <main className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Kontrol Kulesi · Nişasta Fabrikası</h1>
          <p>
            {tarih(BUGUN)} · Açık siparişler, mamul stoğu ve üç haftalık üretim
            programı tek ekranda. Aşağıdaki bulguları ajan kendisi çıkardı.
          </p>
        </div>
        <Link href="/uretim-planlama/plan" className="dugme birincil">
          Planlama ajanını çalıştır →
        </Link>
      </div>

      <div className="izgara izgara-4" style={{ marginBottom: 16 }}>
        <Kpi
          etiket="Termini riskli sipariş"
          deger={`${riskliSiparisler.length}`}
          aciklama={`${mevcut.gecikenSiparis} tanesi geciyor · ${tl(mevcut.gecikmeCezasiTL)} ceza`}
          yon={mevcut.gecikenSiparis > 0 ? "kotu" : "iyi"}
        />
        <Kpi
          etiket="Stoğu yetmeyen ürün"
          deger={`${acikUrunler.length} / ${durum.length}`}
          aciklama={`${ton(acikTon)} açık, en düşük kapsama ${gun(enDusukKapsama.gunKapsama)}`}
          yon="kotu"
        />
        <Kpi
          etiket="60 günden yaşlı stok"
          deger={ton(yasliLotlar.reduce((t, l) => t + l.ton, 0))}
          aciklama={`${tl(yasliFinansman)} finansman maliyeti oluştu`}
          yon="kotu"
        />
        <Kpi
          etiket="Önlenebilir maliyet"
          deger={tlKisa(onlenebilir)}
          aciklama={`${UFUK_GUN} günlük dönemde, ajanın önerisiyle`}
          yon="iyi"
        />
      </div>

      <div className="izgara izgara-2">
        <section className="kart">
          <div className="kart-baslik">
            <div>
              <h2>Ajanın çıkardığı bulgular</h2>
              <p>
                Sipariş defteri, stok lotları ve mevcut program karşılaştırılarak
                üretildi.
              </p>
            </div>
            <Rozet tur="kritik">
              {kosu.bulgular.filter((b) => b.seviye === "kritik").length} kritik
            </Rozet>
          </div>
          <div className="kart-govde">
            <div className="yigin">
              {kosu.bulgular.slice(0, 5).map((b) => (
                <BulguKarti key={b.id} bulgu={b} />
              ))}
              <Link href="/uretim-planlama/plan" className="dugme">
                {kosu.bulgular.length} bulgunun tamamını ve program önerisini gör
              </Link>
            </div>
          </div>
        </section>

        <div className="yigin">
          <section className="kart">
            <div className="kart-baslik">
              <div>
                <h2>Termini risk altındaki siparişler</h2>
                <p>Üretim müdürünün hazırladığı mevcut programa göre.</p>
              </div>
            </div>
            <div className="kart-govde sikisik">
              <div className="tablo-sarmal">
                <table className="tablo">
                  <thead>
                    <tr>
                      <th>Sipariş</th>
                      <th>Ürün</th>
                      <th className="sayi">Miktar</th>
                      <th>Termin</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskliSiparisler.map((r) => (
                      <tr key={r.siparis.id}>
                        <td>
                          <div className="kalin">{r.siparis.id}</div>
                          <div className="ikincil">{r.siparis.musteri}</div>
                        </td>
                        <td>{urunBul(r.siparis.sku).kisaAd}</td>
                        <td className="sayi">{ton(r.siparis.ton)}</td>
                        <td>{tarihKisa(r.siparis.terminTarihi)}</td>
                        <td>
                          {r.gecikmeGun > 0 ? (
                            <Rozet tur="kritik">
                              {gun(r.gecikmeGun)} gecikme
                            </Rozet>
                          ) : (
                            <Rozet tur="uyari">
                              {gun(r.terminGun - r.hazirGun)} pay
                            </Rozet>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="kart">
            <div className="kart-baslik">
              <div>
                <h2>Hat kapasitesi</h2>
                <p>
                  {UFUK_GUN} günlük dönemde ortalama kullanım {yuzde(kapasite)}.
                </p>
              </div>
            </div>
            <div className="kart-govde">
              <div className="yigin">
                {mevcut.hatlar.map((h) => {
                  const hatAdi = {
                    NIS: "Nişasta Hattı",
                    SUR: "Şurup Hattı",
                    YAN: "Yan Ürün Hattı",
                  }[h.hat];
                  return (
                    <div key={h.hat}>
                      <div className="satir aralik">
                        <span>{hatAdi}</span>
                        <span className="ikincil sayisal">
                          {yuzde(h.kapasiteKullanimi)} · {h.gecisSaati} saat
                          ürün geçişi
                        </span>
                      </div>
                      <div className="cubuk" style={{ marginTop: 5 }}>
                        <span
                          style={{
                            width: `${Math.min(100, h.kapasiteKullanimi * 100)}%`,
                            background:
                              h.kapasiteKullanimi > 0.9
                                ? "var(--kritik)"
                                : "var(--vurgu)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Yönetimin sorduğu sorular</h2>
            <p>
              Her cevap, bu ekrandaki veriden hesaplandı; sabit metin değil.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="izgara izgara-2">
            {sorular.map((s) => (
              <div key={s.soru}>
                <div className="kalin" style={{ fontSize: 13 }}>
                  {s.soru}
                </div>
                <div className="ikincil" style={{ marginTop: 3 }}>
                  {s.cevap}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
