"use client";

import Link from "next/link";
import { BulguKarti, Kpi, Rozet } from "@/components/Parcalar";
import { tlKisa, ton, yuzde } from "@/lib/bicim";
import { GUNLER } from "@/data/bakim";
import { useBakimBaglami } from "@/senaryolar/bakim/Saglayici";

export default function BakimKontrolKulesi() {
  const { kosu, cikti } = useBakimBaglami();
  const { analiz, basEgilim } = cikti;

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Üretim kaybı kontrol kulesi</h1>
          <p>
            {GUNLER.length} günlük dönem, {ton(analiz.islenenMisirTon)} işlenen
            mısır. Girenden çıkması gereken nişasta ile fiilen çıkan arasındaki
            fark, proses adımlarına dağıtılmış hâlde.
          </p>
        </div>
        <Rozet tur={analiz.kayipOrani > 0.015 ? "kritik" : "uyari"}>
          {yuzde(analiz.kayipOrani, 1)} kayıp
        </Rozet>
      </div>

      <div className="izgara izgara-4">
        {kosu.ozetMetrikler.map((m) => (
          <Kpi
            key={m.etiket}
            etiket={m.etiket}
            deger={m.deger}
            aciklama={m.aciklama}
            yon={m.yon}
          />
        ))}
      </div>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Kayıp nerede oluşuyor?</h2>
            <p>
              Adım verimlerinin logaritmik ayrıştırması. Payların toplamı tam
              olarak %100 eder; yuvarlama artığı ya da &quot;diğer&quot; kalemi
              yok, tablo elle toplanıp tutturulabilir.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Proses adımı</th>
                  <th className="sayisal">Referans</th>
                  <th className="sayisal">Ölçülen</th>
                  <th className="sayisal">Sapma</th>
                  <th className="sayisal">Kayıptaki pay</th>
                  <th className="sayisal">Nişasta</th>
                  <th className="sayisal">Tutar</th>
                  <th className="sayisal">Doğrulayan not</th>
                </tr>
              </thead>
              <tbody>
                {analiz.adimlar.map((a, i) => (
                  <tr key={a.adimId}>
                    <td>
                      <div className="satir">
                        <b>{a.adimAd}</b>
                        {i === 0 ? <Rozet tur="kritik">En büyük pay</Rozet> : null}
                      </div>
                    </td>
                    <td className="sayisal">{yuzde(a.referans, 1)}</td>
                    <td className="sayisal">{yuzde(a.olculen, 1)}</td>
                    <td className="sayisal">
                      {((a.olculen - a.referans) * 100).toFixed(1).replace(".", ",")}{" "}
                      puan
                    </td>
                    <td className="sayisal">
                      <b>{yuzde(a.pay, 0)}</b>
                    </td>
                    <td className="sayisal">{ton(a.kayipTon)}</td>
                    <td className="sayisal">{tlKisa(a.kayipTL)}</td>
                    <td className="sayisal">
                      {a.notlar.length > 0 ? `${a.notlar.length} not` : "—"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <b>Toplam</b>
                  </td>
                  <td className="sayisal">{yuzde(analiz.referansVerim, 1)}</td>
                  <td className="sayisal">{yuzde(analiz.gerceklesenVerim, 1)}</td>
                  <td className="sayisal">
                    {((analiz.gerceklesenVerim - analiz.referansVerim) * 100)
                      .toFixed(1)
                      .replace(".", ",")}{" "}
                    puan
                  </td>
                  <td className="sayisal">
                    <b>
                      {yuzde(
                        analiz.adimlar.reduce((t, a) => t + a.pay, 0),
                        0,
                      )}
                    </b>
                  </td>
                  <td className="sayisal">
                    <b>{ton(analiz.kayipTon)}</b>
                  </td>
                  <td className="sayisal">
                    <b>{tlKisa(analiz.kayipTL)}</b>
                  </td>
                  <td className="sayisal">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          {basEgilim.bozuluyor ? (
            <div className="uyari-kutu" style={{ marginTop: 12 }}>
              {analiz.basAdim.adimAd} verimi dönem başında{" "}
              {yuzde(basEgilim.bas, 1)} iken sonunda {yuzde(basEgilim.son, 1)}.
              Sabit bir sapma ayar meselesi olurdu; düşerek giden bir eğilim
              aşınan bir parçaya işaret eder ve müdahale edilmezse kayıp
              büyümeye devam eder.
            </div>
          ) : null}
          <p className="dipnot">
            Günlük ölçümler için{" "}
            <Link href="/bakim/kayitlar">kayıtlar ekranına</Link>, açılan iş
            kalemi için <Link href="/bakim/is-kalemi">iş kalemine</Link> bakın.
          </p>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Bulgular</h2>
            <p>
              Randıman kaybı ve duruş ayrı kalemler; duruşta mısır hiç işlenmedi,
              dolayısıyla ikisi toplanmaz.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="yigin">
            {kosu.bulgular.map((b) => (
              <BulguKarti key={b.id} bulgu={b} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
