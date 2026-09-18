"use client";

import Link from "next/link";
import { BulguKarti, Kpi, Rozet } from "@/components/Parcalar";
import { tl, tlKisa, ton, yuzde } from "@/lib/bicim";
import { PARTILER, PIYASA } from "@/data/satinalma";
import { VARSAYIMLAR } from "@/lib/satinalma";
import { useSatinalmaBaglami } from "@/senaryolar/satinalma/Saglayici";

export default function KontrolKulesi() {
  const { kosu, cikti } = useSatinalmaBaglami();
  const { oneri, karsilastirma, yillik } = cikti;
  const etiket = karsilastirma.etiketeGoreEnUcuz;

  const etiketSirasi =
    cikti.siralama.findIndex((b) => b.lotId === etiket.lotId) + 1;
  const acikTonaj = PARTILER.reduce((t, p) => t + p.tonnesAsIs, 0);
  // Bulguların tasarruf kalemleri toplanmıyor: vadenin değeri zaten sıralamayı
  // çeviren farkın içinde, ikisini toplamak aynı parayı iki kez saymak olurdu.
  const onlenebilir = karsilastirma.celisiyor ? karsilastirma.kazancTl : 0;

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Mısır alım kontrol kulesi</h1>
          <p>
            {PARTILER.length} açık teklif, toplam {ton(acikTonaj)} mısır.
            Fabrika mısır değil, geri kazanılabilir nişasta satın alıyor; bu
            ekrandaki sıralama buna göre kurulu.
          </p>
        </div>
        <Rozet tur={karsilastirma.celisiyor ? "kritik" : "iyi"}>
          {karsilastirma.celisiyor
            ? "Etiket fiyatı yanıltıyor"
            : "Sıralamalar uyumlu"}
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

      {karsilastirma.celisiyor ? (
        <section className="kart" style={{ marginTop: 16 }}>
          <div className="kart-baslik">
            <div>
              <h2>Sıralamayı ne değiştiriyor?</h2>
              <p>
                Kilogram fiyatı en düşük parti, gerçek maliyette {etiketSirasi}.
                sıraya düşüyor. Aradaki farkı doğuran kalemler aşağıda; hepsi
                tohumlanmış veriden hesaplanıyor, hiçbiri metin değil.
              </p>
            </div>
          </div>
          <div className="kart-govde">
            <div className="tablo-sarmal">
                <table className="tablo">
                  <thead>
                    <tr>
                      <th>Kalem</th>
                      <th className="sayisal">
                        {etiket.lotId}
                        <div className="ikincil">etiket fiyatı en ucuz</div>
                      </th>
                      <th className="sayisal">
                        {oneri.lotId}
                        <div className="ikincil">ajanın önerisi</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Etiket fiyatı</td>
                      <td className="sayisal">
                        {(etiket.stickerCostTlPerTonneCorn / 1000).toLocaleString(
                          "tr-TR",
                        )}{" "}
                        TL/kg
                      </td>
                      <td className="sayisal">
                        {(oneri.stickerCostTlPerTonneCorn / 1000).toLocaleString(
                          "tr-TR",
                        )}{" "}
                        TL/kg
                      </td>
                    </tr>
                    <tr>
                      <td>Yabancı madde ve su düşülünce kuru madde</td>
                      <td className="sayisal">{ton(etiket.tonnesDryMatter)}</td>
                      <td className="sayisal">{ton(oneri.tonnesDryMatter)}</td>
                    </tr>
                    <tr>
                      <td>Beyan edilen nişasta</td>
                      <td className="sayisal">{ton(etiket.tonnesStarchDeclared)}</td>
                      <td className="sayisal">{ton(oneri.tonnesStarchDeclared)}</td>
                    </tr>
                    <tr>
                      <td>Sicile göre düzeltilmiş nişasta</td>
                      <td className="sayisal">
                        {ton(etiket.tonnesStarchAdjusted)}
                        <div className="ikincil">
                          güvenilirlik {etiket.credibilityFactor.toFixed(3).replace(".", ",")}
                        </div>
                      </td>
                      <td className="sayisal">
                        {ton(oneri.tonnesStarchAdjusted)}
                        <div className="ikincil">
                          güvenilirlik {oneri.credibilityFactor.toFixed(3).replace(".", ",")}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Değirmen verimi sonrası geri kazanılabilir</td>
                      <td className="sayisal">
                        {ton(etiket.tonnesStarchRecoverable)}
                        <div className="ikincil">{yuzde(etiket.recoveryRate, 1)}</div>
                      </td>
                      <td className="sayisal">
                        {ton(oneri.tonnesStarchRecoverable)}
                        <div className="ikincil">{yuzde(oneri.recoveryRate, 1)}</div>
                      </td>
                    </tr>
                    <tr>
                      <td>Navlun</td>
                      <td className="sayisal">{tlKisa(etiket.freightTl)}</td>
                      <td className="sayisal">{tlKisa(oneri.freightTl)}</td>
                    </tr>
                    <tr>
                      <td>Kurutma</td>
                      <td className="sayisal">{tlKisa(etiket.dryingTl)}</td>
                      <td className="sayisal">{tlKisa(oneri.dryingTl)}</td>
                    </tr>
                    <tr>
                      <td>Vadenin bugünkü değeri</td>
                      <td className="sayisal">
                        {etiket.financingCreditTl > 0
                          ? `− ${tlKisa(etiket.financingCreditTl)}`
                          : "peşin"}
                      </td>
                      <td className="sayisal">
                        {oneri.financingCreditTl > 0
                          ? `− ${tlKisa(oneri.financingCreditTl)}`
                          : "peşin"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b>Ton nişasta başına gerçek maliyet</b>
                      </td>
                      <td className="sayisal">
                        <b>{tl(etiket.effectiveCostTlPerTonneStarch)}</b>
                      </td>
                      <td className="sayisal">
                        <b>{tl(oneri.effectiveCostTlPerTonneStarch)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
            <div className="vurgu-kutu" style={{ marginTop: 12 }}>
              Bu alımda {tlKisa(karsilastirma.kazancTl)} fark ediyor. Rakam, etiket
              fiyatına bakan bir alıcının seçeceği partiye karşı hesaplanmıştır ve
              verinin desteklediği en yüksek iddiadır.
            </div>
            <p className="dipnot">
              Tam kütle dengesi ve bütün partiler için{" "}
              <Link href="/satinalma/partiler">partiler ekranına</Link> bakın.
            </p>
          </div>
        </section>
      ) : null}

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Bulgular</h2>
            <p>
              {onlenebilir > 0
                ? `Bu alımda ${tlKisa(onlenebilir)} önlenebilir maliyet.`
                : "Bu hafta sıralama çelişmiyor."}{" "}
              Aşağıdaki kalemler ayrı ayrı okunmalı; bir kısmı aynı farkın
              bileşeni olduğu için toplanmazlar.
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

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Yıllık fayda ve varsayımları</h2>
            <p>
              Tek bir alımdaki kazanç yıla çarpılamaz. Aşağıdaki rakam iki açık
              varsayımdan geçiyor; ikisi de tartışmaya açıktır.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="izgara izgara-3">
            <Kpi
              etiket="Kırpılmamış ölçek"
              deger={tlKisa(yillik.kirpilmamisTl)}
              aciklama="Her alımda tam farkın yakalandığı varsayımı — savunulabilir değil"
              yon="notr"
            />
            <Kpi
              etiket="Nokta tahmin"
              deger={tlKisa(yillik.noktaTl)}
              aciklama={`Karar değişim oranı ${yuzde(
                VARSAYIMLAR.kararDegisimOrani,
              )} × yakalama oranı ${yuzde(VARSAYIMLAR.yakalamaOrani)}`}
              yon="iyi"
            />
            <Kpi
              etiket="Aralık"
              deger={`${tlKisa(yillik.altTl)} – ${tlKisa(yillik.ustTl)}`}
              aciklama="Tek bir rakam, bu hesabın taşımadığı bir kesinlik izlenimi verir"
              yon="notr"
            />
          </div>
          <div className="uyari-kutu" style={{ marginTop: 12 }}>
            <b>Karar değişim oranı</b> ({yuzde(VARSAYIMLAR.kararDegisimOrani)}):
            sıralamanın ekibin mevcut tercihiyle çeliştiği alımların payı; geri
            kalanında araç yalnızca teyit eder. <b>Yakalama oranı</b> (
            {yuzde(VARSAYIMLAR.yakalamaOrani)}): çeliştiğinde farkın fiilen
            alınabilen kısmı — önerilen parti satılmış olabilir, ekip nemi zaten
            bir ölçüde gözüyle düzeltiyor.
          </div>
        </div>
      </section>

      <p className="dipnot">
        Piyasa verisi {PIYASA.asOf} tarihlidir; mısır {PIYASA.cornSpotTlPerKg.toLocaleString("tr-TR")} TL/kg,
        ticari TL faizi %{PIYASA.commercialTlRatePct}. Tedarikçiler ve partiler
        kurgudur. Müşteriye güncel diye gösterilmeden önce tazelenmelidir.
      </p>
    </div>
  );
}
