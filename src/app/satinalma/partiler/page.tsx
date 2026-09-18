"use client";

import { Rozet } from "@/components/Parcalar";
import { tl, tlKisa, ton, yuzde } from "@/lib/bicim";
import { PARTILER, PIYASA, partiBul, tedarikciBul } from "@/data/satinalma";
import { FABRIKA } from "@/lib/satinalma";
import { useSatinalmaBaglami } from "@/senaryolar/satinalma/Saglayici";

export default function PartilerSayfasi() {
  const { cikti, secilenParti, partiSec } = useSatinalmaBaglami();
  const { siralama, karsilastirma } = cikti;

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Partiler</h1>
          <p>
            Her partinin natürel tonajdan geri kazanılabilir nişastaya kadar
            bütün kütle dengesi. Sıralama gerçek maliyete göre; etiket fiyatı
            sütunu karşılaştırma için duruyor.
          </p>
        </div>
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Gerçek maliyet sıralaması</h2>
            <p>
              Ton nişasta başına TL. Satıra tıklayarak tahsis için parti
              seçebilirsiniz.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Parti / tedarikçi</th>
                  <th className="sayisal">Etiket</th>
                  <th className="sayisal">Nem</th>
                  <th className="sayisal">Beyan</th>
                  <th className="sayisal">Güvenilirlik</th>
                  <th className="sayisal">Düzeltilmiş</th>
                  <th className="sayisal">Verim</th>
                  <th className="sayisal">Geri kazanılabilir</th>
                  <th className="sayisal">Gerçek maliyet</th>
                </tr>
              </thead>
              <tbody>
                {siralama.map((b, i) => {
                  const lot = partiBul(b.lotId)!;
                  const secili = b.lotId === secilenParti;
                  const etiketEnUcuz =
                    b.lotId === karsilastirma.etiketeGoreEnUcuz.lotId;
                  return (
                    <tr
                      key={b.lotId}
                      onClick={() => partiSec(b.lotId)}
                      style={{
                        cursor: "pointer",
                        background: secili ? "var(--secili, #eef2ff)" : undefined,
                      }}
                    >
                      <td className="sayisal">{i + 1}</td>
                      <td>
                        <div className="satir">
                          <b>{b.lotId}</b>
                          {i === 0 ? <Rozet tur="iyi">Ajanın önerisi</Rozet> : null}
                          {etiketEnUcuz && i !== 0 ? (
                            <Rozet tur="uyari">Etiketin en ucuzu</Rozet>
                          ) : null}
                        </div>
                        <div className="ikincil">
                          {b.supplierName} · {lot.origin} · {ton(lot.tonnesAsIs)} ·{" "}
                          {lot.paymentTermDays === 0
                            ? "peşin"
                            : `${lot.paymentTermDays} gün vade`}
                        </div>
                      </td>
                      <td className="sayisal">
                        {lot.priceTlPerKg.toLocaleString("tr-TR")} TL/kg
                      </td>
                      <td className="sayisal">
                        %{lot.moisturePct.toLocaleString("tr-TR")}
                        {b.moisturePenaltyPoints > 0 ? (
                          <div className="ikincil">
                            aralık dışı{" "}
                            {b.moisturePenaltyPoints.toFixed(1).replace(".", ",")} puan
                          </div>
                        ) : null}
                      </td>
                      <td className="sayisal">
                        %{lot.declaredStarchPctDry.toLocaleString("tr-TR")}
                      </td>
                      <td className="sayisal">
                        {b.credibilityFactor.toFixed(3).replace(".", ",")}
                      </td>
                      <td className="sayisal">
                        %{b.adjustedStarchPctDry.toFixed(1).replace(".", ",")}
                      </td>
                      <td className="sayisal">{yuzde(b.recoveryRate, 1)}</td>
                      <td className="sayisal">{ton(b.tonnesStarchRecoverable)}</td>
                      <td className="sayisal">
                        <b>{tl(b.effectiveCostTlPerTonneStarch)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="dipnot">
            Güvenilirlik, tedarikçinin geçmiş partilerinde ölçülen nişasta
            oranının beyan ettiğine bölümüdür; 1,000 doğru beyan demektir.
            Değirmen verimi, %{(FABRIKA.baseRecoveryRate * 100).toFixed(0)} taban
            verimden nem aralığı dışındaki her puan için{" "}
            {yuzde(FABRIKA.recoveryPenaltyPerPoint, 1)} düşer.
          </p>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Maliyet kırılımı</h2>
            <p>Partilerin toplam maliyeti ve bileşenleri.</p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Parti</th>
                  <th className="sayisal">Mısır</th>
                  <th className="sayisal">Navlun</th>
                  <th className="sayisal">Kurutma</th>
                  <th className="sayisal">Vade değeri</th>
                  <th className="sayisal">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {siralama.map((b) => (
                  <tr key={b.lotId}>
                    <td>
                      <b>{b.lotId}</b>
                      <div className="ikincil">{b.supplierName}</div>
                    </td>
                    <td className="sayisal">{tlKisa(b.cornCostTl)}</td>
                    <td className="sayisal">{tlKisa(b.freightTl)}</td>
                    <td className="sayisal">
                      {b.dryingTl > 0 ? tlKisa(b.dryingTl) : "—"}
                    </td>
                    <td className="sayisal">
                      {b.financingCreditTl > 0
                        ? `− ${tlKisa(b.financingCreditTl)}`
                        : "peşin"}
                    </td>
                    <td className="sayisal">
                      <b>{tlKisa(b.totalEffectiveCostTl)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dipnot">
            Vade değeri, %{PIYASA.commercialTlRatePct} yıllık ticari TL faiziyle
            iskonto edilmiş bugünkü değerdir. Partiler arasındaki etiket fiyatı
            farkından büyük olduğu için karşılaştırmadan çıkarılamaz.
          </p>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Tedarikçi sicilleri</h2>
            <p>
              Beyan edilen ve fabrika laboratuvarında ölçülen nişasta oranı.
              Güvenilirlik katsayısı buradan çıkıyor.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Tedarikçi</th>
                  <th>Geçmiş partiler</th>
                  <th className="sayisal">Katsayı</th>
                </tr>
              </thead>
              <tbody>
                {PARTILER.map((p) => tedarikciBul(p.supplierId)!)
                  .filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i)
                  .map((t) => {
                    const b = siralama.find((x) => x.supplierId === t.id)!;
                    return (
                      <tr key={t.id}>
                        <td>
                          <b>{t.name}</b>
                          <div className="ikincil">{t.id}</div>
                        </td>
                        <td>
                          {t.history.map((h) => (
                            <div key={h.lotId} className="ikincil">
                              {h.date}: beyan %
                              {h.declaredStarchPctDry.toLocaleString("tr-TR")} · ölçüm %
                              {h.measuredStarchPctDry.toLocaleString("tr-TR")}
                            </div>
                          ))}
                        </td>
                        <td className="sayisal">
                          <b>{b.credibilityFactor.toFixed(3).replace(".", ",")}</b>
                          {b.credibilityFactor < 0.995 ? (
                            <div className="ikincil">beyanın altında teslim</div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
