"use client";

import { useEffect } from "react";
import { Rozet } from "@/components/Parcalar";
import { tlKisa } from "@/lib/bicim";
import { ayAdi } from "@/senaryolar/raporlama/senaryo";
import { useRaporBaglami } from "@/senaryolar/raporlama/Saglayici";

export default function OzetSayfasi() {
  const { kosu, cikti, durum, gorunurAdim, ajaniBaslat, oncelik, oncelikSec } =
    useRaporBaglami();

  useEffect(() => {
    if (durum === "hazir") ajaniBaslat();
  }, [durum, ajaniBaslat]);

  const bitti = durum === "tamam";
  const karar = kosu.kararlar[0];
  const secilen = cikti.sapmalar.find((s) => `${s.tip}-${s.sirketId}` === oncelik);

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Yönetim özeti</h1>
          <p>
            {ayAdi(cikti.donem)} dönemi. Ajan şirket verilerini topladı,
            eşikleri uyguladı, en büyük sapmayı bir alt kırılıma indirdi ve
            özeti yazdı.
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
              Özetin içindeki her rakam bu adımlarda hesaplandı; metin şablona
              sayı yerleştirmiyor, sapmaların kendisi cümleyi belirliyor.
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
                <h2>Yönetim kuruluna özet</h2>
                <p>{ayAdi(cikti.donem)} · {cikti.sapmalar.length} sapma</p>
              </div>
              <Rozet tur="bilgi">Taslak</Rozet>
            </div>
            <div className="kart-govde">
              {cikti.ozet.map((p, i) => (
                <p key={i} style={{ lineHeight: 1.7, marginTop: i === 0 ? 0 : 12 }}>
                  {p}
                </p>
              ))}
              <div className="uyari-kutu" style={{ marginTop: 16 }}>
                Bu bir demodur. Özet hiçbir yere gönderilmez; rakamların tamamı
                kurgu veriden hesaplanmıştır.
              </div>
            </div>
          </section>

          {karar ? (
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
                      className={`secenek ${oncelik === s.id ? "secili" : ""}`}
                      onClick={() => oncelikSec(s.id)}
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
                {secilen?.kirilim ? (
                  <div className="vurgu-kutu" style={{ marginTop: 12 }}>
                    <b>{secilen.sirketAd}</b> için kırılım:{" "}
                    {secilen.kirilim
                      .filter((k) => Math.abs(k.puan) >= 0.1)
                      .map(
                        (k) =>
                          `${k.ad.toLowerCase()} ${k.puan > 0 ? "+" : ""}${k.puan
                            .toFixed(1)
                            .replace(".", ",")} puan (${tlKisa(k.tl)})`,
                      )
                      .join(", ")}
                    . {secilen.oneri}
                  </div>
                ) : secilen ? (
                  <div className="vurgu-kutu" style={{ marginTop: 12 }}>
                    <b>{secilen.sirketAd}</b>: {secilen.oneri}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
