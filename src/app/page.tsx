import Link from "next/link";
import { SENARYOLAR } from "@/lib/ajan/senaryolar";
import { uretimPlanlamaKosusu } from "@/senaryolar/uretim-planlama/senaryo";
import { Rozet } from "@/components/Parcalar";
import { tlKisa } from "@/lib/bicim";

export default function SenaryoListesi() {
  const kosu = uretimPlanlamaKosusu();
  const kritik = kosu.bulgular.filter((b) => b.seviye === "kritik").length;
  const tasarruf = kosu.bulgular
    .filter((b) => b.etkiTipi === "tasarruf")
    .reduce((t, b) => t + b.etkiTL, 0);

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
        {SENARYOLAR.map((s) =>
          s.durum === "aktif" ? (
            <Link key={s.id} href={s.kokUrl} className="senaryo">
              <span className="senaryo-ikon">{s.ikon}</span>
              <div>
                <h3>{s.ad}</h3>
                <p>{s.ozet}</p>
                <div className="senaryo-alt">
                  <Rozet tur="iyi">Çalışır durumda</Rozet>
                  <span className="ikincil">{s.birim}</span>
                  {kritik > 0 ? (
                    <span className="ikincil">
                      · {kritik} kritik bulgu, {tlKisa(tasarruf)} önlenebilir
                      maliyet
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
          ),
        )}
      </div>
    </main>
  );
}
