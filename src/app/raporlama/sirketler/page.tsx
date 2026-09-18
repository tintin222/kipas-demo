"use client";

import { Rozet } from "@/components/Parcalar";
import { tlKisa, ton, yuzde } from "@/lib/bicim";
import { AYLAR, SIRKETLER, sirketKayitlari } from "@/data/raporlama";
import { kalemOrani, marj, type MaliyetKalemleri } from "@/lib/raporlama";
import { ayAdi } from "@/senaryolar/raporlama/senaryo";
import { useRaporBaglami } from "@/senaryolar/raporlama/Saglayici";

const KALEMLER: Array<{ anahtar: keyof MaliyetKalemleri; ad: string }> = [
  { anahtar: "hammadde", ad: "Hammadde" },
  { anahtar: "enerji", ad: "Enerji" },
  { anahtar: "iscilik", ad: "İşçilik" },
  { anahtar: "diger", ad: "Diğer" },
];

export default function SirketlerSayfasi() {
  const { cikti } = useRaporBaglami();

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Şirketler</h1>
          <p>
            {AYLAR.length} dönemlik eğilim. Marj satırındaki hareket, sapma
            eşiğinin baktığı yer; maliyet kalemleri ise sapmanın sebebini
            gösteriyor.
          </p>
        </div>
      </div>

      {SIRKETLER.map((s) => {
        const kayitlar = sirketKayitlari(s.id);
        const ilk = kayitlar[0]!;
        const son = kayitlar[kayitlar.length - 1]!;
        const puanFarki = (marj(son) - marj(ilk)) * 100;
        const sapmalar = cikti.sapmalar.filter((x) => x.sirketId === s.id);

        return (
          <section className="kart" key={s.id} style={{ marginTop: 16 }}>
            <div className="kart-baslik">
              <div>
                <h2>{s.ad}</h2>
                <p>
                  {s.sektor} · dönem cirosu {tlKisa(son.ciroTL)} · marj{" "}
                  {yuzde(marj(son), 1)} ({puanFarki > 0 ? "+" : ""}
                  {puanFarki.toFixed(1).replace(".", ",")} puan)
                </p>
              </div>
              {sapmalar.length > 0 ? (
                <Rozet tur="uyari">
                  {sapmalar.map((x) => x.baslik.toLowerCase()).join(", ")}
                </Rozet>
              ) : (
                <Rozet tur="iyi">Bant içinde</Rozet>
              )}
            </div>
            <div className="kart-govde">
              <div className="tablo-sarmal">
                <table className="tablo">
                  <thead>
                    <tr>
                      <th>Dönem</th>
                      <th className="sayisal">Ciro</th>
                      <th className="sayisal">Plan</th>
                      <th className="sayisal">Marj</th>
                      {KALEMLER.map((k) => (
                        <th className="sayisal" key={k.anahtar}>
                          {k.ad}
                        </th>
                      ))}
                      {s.kapasiteTon > 0 ? <th className="sayisal">Kapasite</th> : null}
                      <th className="sayisal">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kayitlar.map((k) => (
                      <tr key={k.ay}>
                        <td>{ayAdi(k.ay)}</td>
                        <td className="sayisal">{tlKisa(k.ciroTL)}</td>
                        <td className="sayisal">
                          {yuzde(k.ciroTL / k.planCiroTL, 0)}
                        </td>
                        <td className="sayisal">
                          <b>{yuzde(marj(k), 1)}</b>
                        </td>
                        {KALEMLER.map((kalem) => (
                          <td className="sayisal" key={kalem.anahtar}>
                            {yuzde(kalemOrani(k, kalem.anahtar), 1)}
                          </td>
                        ))}
                        {s.kapasiteTon > 0 ? (
                          <td className="sayisal">
                            {yuzde(k.kapasiteKullanimi, 0)}
                            <div className="ikincil">{ton(k.uretimTon)}</div>
                          </td>
                        ) : null}
                        <td className="sayisal">
                          {k.stokGunKapsama} gün
                          <div className="ikincil">{tlKisa(k.stokDegeriTL)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="dipnot">
                Maliyet kalemleri ciroya oranıdır; toplamları brüt marjın
                tamamlayanıdır. Bir kalemin payındaki artış, marjdaki düşüşün o
                kalemden gelen kısmıdır.
              </p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
