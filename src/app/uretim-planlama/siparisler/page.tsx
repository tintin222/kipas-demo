"use client";

import { SIPARISLER, urunBul } from "@/data/seed";
import { gunuTariheCevir } from "@/lib/planner";
import { Kpi, Rozet } from "@/components/Parcalar";
import { gun, tarihKisa, tl, tlKisa, ton, yuzde } from "@/lib/bicim";
import { usePlanBaglami } from "@/senaryolar/uretim-planlama/Saglayici";

export default function SiparisSayfasi() {
  const { cikti, aktifPlan } = usePlanBaglami();
  const { mevcut } = cikti;

  const satirlar = SIPARISLER.map((s) => {
    const urun = urunBul(s.sku);
    const mevcutSonuc = mevcut.siparisler.find((r) => r.siparis.id === s.id)!;
    const aktifSonuc = aktifPlan.siparisler.find((r) => r.siparis.id === s.id)!;
    const marj = (s.fiyatTon - urun.maliyetTon) / s.fiyatTon;
    return {
      siparis: s,
      urun,
      mevcutSonuc,
      aktifSonuc,
      marj,
      katki: (s.fiyatTon - urun.maliyetTon) * s.ton,
      tutar: s.fiyatTon * s.ton,
    };
  }).sort(
    (a, b) =>
      Date.parse(a.siparis.terminTarihi) - Date.parse(b.siparis.terminTarihi),
  );

  const toplamTutar = satirlar.reduce((t, r) => t + r.tutar, 0);
  const toplamKatki = satirlar.reduce((t, r) => t + r.katki, 0);

  return (
    <main className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Açık siparişler</h1>
          <p>
            Her sipariş, mevcut programla ve ekranda seçili programla ne zaman
            sevk edilebileceğine göre karşılaştırılıyor. Kârlılık, ton başına
            katkı marjı üzerinden hesaplanır.
          </p>
        </div>
        <Rozet tur="notr">Seçili program: {aktifPlan.ad}</Rozet>
      </div>

      <div className="izgara izgara-4" style={{ marginBottom: 16 }}>
        <Kpi etiket="Açık sipariş" deger={`${SIPARISLER.length}`} aciklama={`${ton(SIPARISLER.reduce((t, s) => t + s.ton, 0))} toplam miktar`} />
        <Kpi etiket="Sipariş tutarı" deger={tlKisa(toplamTutar)} aciklama={`Katkı payı ${tlKisa(toplamKatki)} · ${yuzde(toplamKatki / toplamTutar, 1)}`} />
        <Kpi
          etiket="Mevcut programla geciken"
          deger={`${mevcut.gecikenSiparis}`}
          aciklama={`${tl(mevcut.gecikmeCezasiTL)} sözleşme cezası`}
          yon={mevcut.gecikenSiparis > 0 ? "kotu" : "iyi"}
        />
        <Kpi
          etiket="Seçili programla geciken"
          deger={`${aktifPlan.gecikenSiparis}`}
          aciklama={`${tl(aktifPlan.gecikmeCezasiTL)} sözleşme cezası`}
          yon={aktifPlan.gecikenSiparis < mevcut.gecikenSiparis ? "iyi" : "notr"}
        />
      </div>

      <section className="kart">
        <div className="kart-govde sikisik">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Sipariş</th>
                  <th>Ürün</th>
                  <th className="sayi">Miktar</th>
                  <th>Termin</th>
                  <th className="sayi">Tutar</th>
                  <th className="sayi">Katkı marjı</th>
                  <th>Mevcut program</th>
                  <th>{aktifPlan.ad}</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((r) => (
                  <tr key={r.siparis.id}>
                    <td>
                      <div className="kalin">{r.siparis.id}</div>
                      <div className="ikincil">{r.siparis.musteri}</div>
                    </td>
                    <td>{r.urun.kisaAd}</td>
                    <td className="sayi">{ton(r.siparis.ton)}</td>
                    <td>{tarihKisa(r.siparis.terminTarihi)}</td>
                    <td className="sayi">{tlKisa(r.tutar)}</td>
                    <td className="sayi">
                      <div className="kalin">{yuzde(r.marj, 1)}</div>
                      <div className="ikincil">{tlKisa(r.katki)}</div>
                    </td>
                    <td>
                      <DurumRozeti
                        gecikme={r.mevcutSonuc.gecikmeGun}
                        pay={r.mevcutSonuc.terminGun - r.mevcutSonuc.hazirGun}
                        hazirGun={r.mevcutSonuc.hazirGun}
                      />
                    </td>
                    <td>
                      <DurumRozeti
                        gecikme={r.aktifSonuc.gecikmeGun}
                        pay={r.aktifSonuc.terminGun - r.aktifSonuc.hazirGun}
                        hazirGun={r.aktifSonuc.hazirGun}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function DurumRozeti({
  gecikme,
  pay,
  hazirGun,
}: {
  gecikme: number;
  pay: number;
  hazirGun: number;
}) {
  if (gecikme > 0) {
    return <Rozet tur="kritik">{gun(gecikme)} gecikme</Rozet>;
  }
  const etiket =
    hazirGun <= 0
      ? "Stoktan"
      : `${tarihKisa(gunuTariheCevir(hazirGun))} hazır`;
  return (
    <>
      <Rozet tur={pay < 1.5 ? "uyari" : "iyi"}>{etiket}</Rozet>
      {pay < 1.5 && hazirGun > 0 ? (
        <div className="ikincil" style={{ marginTop: 3 }}>
          {gun(pay)} pay
        </div>
      ) : null}
    </>
  );
}
