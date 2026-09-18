import Link from "next/link";
import { SENARYOLAR } from "@/lib/ajan/senaryolar";
import { Rozet } from "@/components/Parcalar";
import { tlKisa } from "@/lib/bicim";

/**
 * Kartın altındaki özet, senaryonun KENDİ koşusundan geliyor.
 *
 * Tek aktif senaryo varken burada bir koşu hesaplanıp bütün kartlarda
 * gösteriliyordu; dört senaryo olunca hepsi planlama senaryosunun rakamlarını
 * gösterir oldu. Her kart kendi `calistir()` çıktısını okuyor.
 *
 * Rakam da senaryonun kendi seçtiği manşet (`vitrin`). Bulguları toplamak
 * yalnızca kalemleri birbirinden bağımsız olan senaryolarda doğru; satın almada
 * vade kazancı parti değişiminin içinde, üretim kaybında randıman ile duruş
 * farklı tabanda ölçülüyor. Kartta ekrandakinden büyük bir rakam çıkması, bu
 * demonun tek iddiası olan "rakamın arkasındaki aritmetik görünür" cümlesini
 * çürütürdü.
 */
function senaryoOzeti(kosu: ReturnType<NonNullable<(typeof SENARYOLAR)[number]["calistir"]>>) {
  const kritik = kosu.bulgular.filter((b) => b.seviye === "kritik").length;
  if (kosu.vitrin) {
    return { kritik, tutar: kosu.vitrin.tutar, etiket: kosu.vitrin.etiket };
  }
  // Manşet bildirmeyen senaryoda bulgular toplanır; kalemler bağımsızsa
  // (ör. ayrı ayrı geciken siparişler) toplam anlamlıdır.
  const tasarruf = kosu.bulgular
    .filter((b) => b.etkiTipi === "tasarruf")
    .reduce((t, b) => t + b.etkiTL, 0);
  const maliyet = kosu.bulgular
    .filter((b) => b.etkiTipi === "maliyet")
    .reduce((t, b) => t + b.etkiTL, 0);
  return {
    kritik,
    tutar: tasarruf > 0 ? tasarruf : maliyet,
    etiket: tasarruf > 0 ? "önlenebilir maliyet" : "oluşan kayıp",
  };
}

export default function SenaryoListesi() {

  return (
    <main className="sayfa">
      <div className="sayfa-basligi">
        <div>
          <h1>Ajan senaryoları</h1>
          <p>
            Her senaryo, bir iş probleminin verisini okuyup kendi başına bulgu
            çıkaran ve karar öneren bir ajandır. Öneriyi uygulayan kişidir; ajan
            gerekçesini ve finansal etkisini yazar.
          </p>
        </div>
      </div>

      <div className="izgara izgara-2">
        {SENARYOLAR.map((s) => {
          const ozet = s.durum === "aktif" && s.calistir ? senaryoOzeti(s.calistir()) : null;
          return s.durum === "aktif" ? (
            <Link key={s.id} href={s.kokUrl} className="senaryo">
              <span className="senaryo-ikon">{s.ikon}</span>
              <div>
                <h3>{s.ad}</h3>
                <p>{s.ozet}</p>
                <div className="senaryo-alt">
                  <Rozet tur="iyi">Çalışır durumda</Rozet>
                  <span className="ikincil">{s.birim}</span>
                  {ozet && ozet.kritik > 0 ? (
                    <span className="ikincil">
                      · {ozet.kritik} kritik bulgu, {tlKisa(ozet.tutar)}{" "}
                      {ozet.etiket}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : (
            <div key={s.id} className="senaryo pasif">
              <span className="senaryo-ikon">{s.ikon}</span>
              <div>
                <h3>{s.ad}</h3>
                <p>{s.ozet}</p>
                <div className="senaryo-alt">
                  <Rozet tur="notr">Sırada</Rozet>
                  <span className="ikincil">{s.birim}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
