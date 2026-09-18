"use client";

import { Rozet } from "@/components/Parcalar";
import { ton, yuzde } from "@/lib/bicim";
import { GUNLUK_KAYITLAR, PROSES_ADIMLARI, VARDIYA_NOTLARI } from "@/data/bakim";
import { gunlukVerim, mevcutNisastaTon, notlariEslestir } from "@/lib/bakim";
import { useBakimBaglami } from "@/senaryolar/bakim/Saglayici";

export default function KayitlarSayfasi() {
  const { cikti } = useBakimBaglami();
  const bas = cikti.analiz.basAdim;
  const basNotlari = new Set(
    notlariEslestir(bas.adimId, VARDIYA_NOTLARI).map((n) => `${n.gun}-${n.vardiya}`),
  );

  return (
    <div className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Günlük kayıtlar</h1>
          <p>
            Ölçümler ve vardiya notları yan yana. Ayrı ayrı bakıldığında ikisi de
            sıradan görünüyor; birlikte okununca {bas.adimAd.toLowerCase()}{" "}
            adımındaki kayıp tesadüf olmaktan çıkıyor.
          </p>
        </div>
      </div>

      <section className="kart">
        <div className="kart-baslik">
          <div>
            <h2>Ölçümler</h2>
            <p>
              Her günün girdisi, adım verimleri ve çıkan nişasta. Renkli sütun,
              kaybın büyük kısmını taşıyan adım.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="tablo-sarmal">
            <table className="tablo">
              <thead>
                <tr>
                  <th>Gün</th>
                  <th className="sayisal">İşlenen mısır</th>
                  <th className="sayisal">Nem</th>
                  <th className="sayisal">Nişasta (kuru)</th>
                  {PROSES_ADIMLARI.map((a) => (
                    <th className="sayisal" key={a.id}>
                      {a.ad}
                    </th>
                  ))}
                  <th className="sayisal">Toplam verim</th>
                  <th className="sayisal">Üretilen</th>
                  <th className="sayisal">Duruş</th>
                </tr>
              </thead>
              <tbody>
                {GUNLUK_KAYITLAR.map((k) => {
                  const verim = gunlukVerim(k, PROSES_ADIMLARI);
                  return (
                    <tr key={k.gun}>
                      <td>{k.gun.slice(8)} Eyl</td>
                      <td className="sayisal">{ton(k.islenenMisirTon)}</td>
                      <td className="sayisal">
                        %{k.nemPct.toLocaleString("tr-TR")}
                      </td>
                      <td className="sayisal">
                        %{k.nisastaPctKuru.toLocaleString("tr-TR")}
                        <div className="ikincil">{ton(mevcutNisastaTon(k))}</div>
                      </td>
                      {PROSES_ADIMLARI.map((a) => (
                        <td
                          className="sayisal"
                          key={a.id}
                          style={
                            a.id === bas.adimId
                              ? { fontWeight: 600, color: "var(--kotu, #b91c1c)" }
                              : undefined
                          }
                        >
                          {yuzde(k.adimVerimleri[a.id] ?? 0, 1)}
                        </td>
                      ))}
                      <td className="sayisal">{yuzde(verim, 1)}</td>
                      <td className="sayisal">{ton(k.uretilenNisastaTon)}</td>
                      <td className="sayisal">
                        {k.durusSaat > 0
                          ? `${k.durusSaat.toFixed(1).replace(".", ",")} sa`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="dipnot">
            Toplam verim, adım verimlerinin çarpımıdır. Referans{" "}
            {yuzde(cikti.analiz.referansVerim, 1)}; dönem ortalaması{" "}
            {yuzde(cikti.analiz.gerceklesenVerim, 1)}.
          </p>
        </div>
      </section>

      <section className="kart" style={{ marginTop: 16 }}>
        <div className="kart-baslik">
          <div>
            <h2>Vardiya notları</h2>
            <p>
              {VARDIYA_NOTLARI.length} not. Çoğu gürültü; işaretli olanlar{" "}
              {bas.adimAd.toLowerCase()} adımını ilgilendiriyor. Bir insan
              bunları göz ucuyla geçer, aracın işe yaradığı yer hepsini okuması.
            </p>
          </div>
        </div>
        <div className="kart-govde">
          <div className="yigin">
            {VARDIYA_NOTLARI.map((n) => {
              const ilgili = basNotlari.has(`${n.gun}-${n.vardiya}`);
              return (
                <div
                  key={`${n.gun}-${n.vardiya}`}
                  className={`bulgu ${ilgili ? "uyari" : "bilgi"}`}
                  style={{ padding: 12 }}
                >
                  <div className="satir">
                    <span className="ikincil">
                      {n.gun} · {n.vardiya} vardiyası
                    </span>
                    {ilgili ? (
                      <Rozet tur="uyari">{bas.adimAd} ile ilgili</Rozet>
                    ) : null}
                  </div>
                  <p style={{ margin: "6px 0 0" }}>{n.metin}</p>
                </div>
              );
            })}
          </div>
          <p className="dipnot">
            Eşleştirme anahtar kelimeyle yapılıyor. Gerçek kurulumda burada bir
            dil modeli olurdu ve notu okuyup adımı kendisi söylerdi; arayüz hangi
            yöntemin çalıştığını gizlememeli.
          </p>
        </div>
      </section>
    </div>
  );
}
