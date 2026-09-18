"use client";

import { useEffect } from "react";
import { Rozet } from "@/components/Parcalar";
import { tl, tlKisa, ton } from "@/lib/bicim";
import { useSatinalmaBaglami } from "@/senaryolar/satinalma/Saglayici";
import {
  gerekceYaz,
  tahsisYazisi,
} from "@/senaryolar/satinalma/tahsisYazisi";

export default function TahsisSayfasi() {
  const {
    kosu,
    cikti,
    durum,
    gorunurAdim,
    ajaniBaslat,
    secilenParti,
    partiSec,
    onaylandi,
    onayla,
    onayiGeriAl,
  } = useSatinalmaBaglami();

  useEffect(() => {
    if (durum === "hazir") ajaniBaslat();
  }, [durum, ajaniBaslat]);

  const bitti = durum === "tamam";
  const karar = kosu.kararlar[0]!;
  const secilen =
    cikti.siralama.find((b) => b.lotId === secilenParti) ?? cikti.oneri;
  const gerekce = gerekceYaz(secilen, cikti.oneri);
  const yazi = tahsisYazisi(secilen, gerekce);

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Tahsis</h1>
          <p>
            Ajan açık teklifleri gerçek maliyete çevirdi, tedarikçi sicillerini
            okudu ve bir parti önerdi. Karar sizde; yazı taslak olarak kalır.
          </p>
        </div>
        <button
          className="dugme"
          onClick={ajaniBaslat}
          disabled={durum === "calisiyor"}
        >
          {durum === "calisiyor" ? "Ajan çalışıyor…" : "Ajanı yeniden çalıştır"}
        </button>
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Ajan çalışması</h2>
            <p>
              {cikti.siralama.length} parti için kütle dengesi kuruldu ve maliyet
              hesaplandı; her adımda ne bulduğu aşağıda.
            </p>
          </div>
          {bitti ? (
            <Rozet tur="iyi">Tamamlandı</Rozet>
          ) : (
            <Rozet tur="bilgi">Çalışıyor</Rozet>
          )}
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
                  <div className="adim-isaret">
                    {gorunur && !calisiyor ? "✓" : i + 1}
                  </div>
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
                <h2>{karar.baslik}</h2>
                <p>{karar.aciklama}</p>
              </div>
            </div>
            <div className="kart-govde">
              <div className="secenekler">
                {karar.secenekler.map((s) => (
                  <button
                    key={s.id}
                    className={`secenek ${secilenParti === s.id ? "secili" : ""}`}
                    onClick={() => partiSec(s.id)}
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
              {secilenParti !== cikti.oneri.lotId ? (
                <div className="uyari-kutu" style={{ marginTop: 12 }}>
                  Ajanın önerisinden başka bir parti seçtiniz. Ton nişasta başına
                  fark{" "}
                  {tl(
                    secilen.effectiveCostTlPerTonneStarch -
                      cikti.oneri.effectiveCostTlPerTonneStarch,
                  )}
                  ; bu partide toplam{" "}
                  {tlKisa(
                    (secilen.effectiveCostTlPerTonneStarch -
                      cikti.oneri.effectiveCostTlPerTonneStarch) *
                      secilen.tonnesStarchRecoverable,
                  )}{" "}
                  eder. Aşağıdaki yazı seçiminize göre yeniden yazıldı.
                </div>
              ) : null}
            </div>
          </section>

          <section className="kart" style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>Tahsis yazısı taslağı</h2>
                <p>
                  {secilen.lotId} · {secilen.supplierName} ·{" "}
                  {ton(secilen.tonnesStarchRecoverable)} geri kazanılabilir
                  nişasta
                </p>
              </div>
              {onaylandi ? (
                <Rozet tur="iyi">Onaylandı</Rozet>
              ) : (
                <Rozet tur="bilgi">Taslak</Rozet>
              )}
            </div>
            <div className="kart-govde">
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {yazi}
              </pre>
              <div className="satir" style={{ marginTop: 16 }}>
                {onaylandi ? (
                  <button className="dugme" onClick={onayiGeriAl}>
                    Onayı geri al
                  </button>
                ) : (
                  <button className="dugme" onClick={onayla}>
                    Taslağı onayla
                  </button>
                )}
              </div>
              <div className="uyari-kutu" style={{ marginTop: 12 }}>
                Bu bir demodur. Onay yalnızca bu ekranda kalır; yazı hiçbir yere
                gönderilmez, hiçbir sipariş oluşturulmaz.
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
