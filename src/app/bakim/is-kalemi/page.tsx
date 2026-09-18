"use client";

import { useEffect } from "react";
import { Rozet } from "@/components/Parcalar";
import { tlKisa, ton, yuzde } from "@/lib/bicim";
import { GUNLER } from "@/data/bakim";
import { useBakimBaglami } from "@/senaryolar/bakim/Saglayici";

export default function IsKalemiSayfasi() {
  const { kosu, cikti, durum, gorunurAdim, ajaniBaslat, secim, secimYap } =
    useBakimBaglami();

  useEffect(() => {
    if (durum === "hazir") ajaniBaslat();
  }, [durum, ajaniBaslat]);

  const bitti = durum === "tamam";
  const karar = kosu.kararlar[0]!;
  const { analiz, basEgilim, erkenNot } = cikti;
  const bas = analiz.basAdim;
  const gunlukKayip = (cikti.aylikKayipTL * bas.pay) / 30;

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>İş kalemi</h1>
          <p>
            Ajan randıman farkını hesapladı, proses adımlarına dağıttı, vardiya
            notlarıyla çapraz kontrol etti ve bir iş kalemi açtı. Karar sizde.
          </p>
        </div>
        <button className="dugme" onClick={ajaniBaslat} disabled={durum === "calisiyor"}>
          {durum === "calisiyor" ? "Ajan çalışıyor…" : "Ajanı yeniden çalıştır"}
        </button>
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Ajan çalışması</h2>
            <p>
              {GUNLER.length} günlük ölçüm ve {cikti.analiz.adimlar.length} proses
              adımı incelendi; her adımda ne bulduğu aşağıda.
            </p>
          </div>
          {bitti ? <Rozet tur="iyi">Tamamlandı</Rozet> : <Rozet tur="bilgi">Çalışıyor</Rozet>}
        </div>
        <div className="kart-govde">
          <div className="adim-listesi">
            {kosu.adimlar.map((a, i) => {
              const gorunur = i < gorunurAdim;
              const calisiyor = i === gorunurAdim - 1 && durum === "calisiyor";
              return (
                <div
                  key={a.baslik}
                  className={`adim ${gorunur ? "gorunur" : ""} ${
                    gorunur && !calisiyor ? "tamam" : ""
                  } ${calisiyor ? "calisiyor" : ""}`}
                >
                  <div className="adim-isaret">{gorunur && !calisiyor ? "✓" : i + 1}</div>
                  <div>
                    <div className="adim-baslik">{a.baslik}</div>
                    <div className="adim-detay">{a.detay}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {bitti ? (
        <>
          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>Açılan iş kalemi</h2>
                <p>
                  {bas.adimAd} · dönem etkisi {tlKisa(bas.kayipTL)} · günlük{" "}
                  {tlKisa(gunlukKayip)}
                </p>
              </div>
              <Rozet tur={basEgilim.bozuluyor ? "kritik" : "uyari"}>
                {basEgilim.bozuluyor ? "Bozulan eğilim" : "Sabit sapma"}
              </Rozet>
            </div>
            <div className="kart-govde">
              <div className="izgara izgara-3">
                <div className="kpi">
                  <div className="kpi-etiket">Ölçülen verim</div>
                  <div className="kpi-deger kotu">{yuzde(bas.olculen, 1)}</div>
                  <div className="kpi-aciklama">
                    Referans {yuzde(bas.referans, 1)}
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi-etiket">Kaybedilen nişasta</div>
                  <div className="kpi-deger kotu">{ton(bas.kayipTon)}</div>
                  <div className="kpi-aciklama">
                    Dönem kaybının {yuzde(bas.pay, 0)} kadarı
                  </div>
                </div>
                <div className="kpi">
                  <div className="kpi-etiket">Beklemenin günlük bedeli</div>
                  <div className="kpi-deger kotu">{tlKisa(gunlukKayip)}</div>
                  <div className="kpi-aciklama">
                    Aynı eğim sürerse; yıllık {tlKisa(cikti.yillikKayipTL * bas.pay)}
                  </div>
                </div>
              </div>

              {erkenNot ? (
                <div className="vurgu-kutu" style={{ marginTop: 16 }}>
                  <b>Kayıtlarda zaten duruyordu.</b> {erkenNot.gun} tarihli{" "}
                  {erkenNot.vardiya} vardiyası: &ldquo;{erkenNot.metin}&rdquo; Bu
                  not dönem başlamadan önceye ait. Ölçüm ve not ayrı ayrı
                  duruyordu; kimse ikisini birleştirmemiş.
                </div>
              ) : null}
            </div>
          </section>

          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>{karar.baslik}</h2>
                <p>{karar.aciklama}</p>
              </div>
            </div>
            <div className="kart-govde">
              <div className="secenekler">
                {karar.secenekler.map((s) => (
                  <button
                    key={s.id}
                    className={`secenek ${secim === s.id ? "secili" : ""}`}
                    onClick={() => secimYap(s.id)}
                  >
                    <div className="secenek-etiket">
                      {s.etiket}
                      {karar.onerilen === s.id ? (
                        <Rozet tur="iyi">Ajanın önerisi</Rozet>
                      ) : null}
                    </div>
                    <div className="secenek-ozet">{s.ozet}</div>
                  </button>
                ))}
              </div>
              <div className="uyari-kutu" style={{ marginTop: 12 }}>
                Ajan kaybı bulur ve fiyatlar; tasarrufu kendisi getirmez. Rakam
                ancak iş kalemi yapıldığında gerçekleşir — demo bunu gizlememeli.
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
