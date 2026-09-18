import type { Finding } from "@/lib/ajan/cekirdek";
import type { ScheduledCampaign } from "@/lib/types";
import { UFUK_GUN } from "@/data/seed";
import { tl, tlKisa } from "@/lib/bicim";

export function Kpi({
  etiket,
  deger,
  aciklama,
  yon = "notr",
}: {
  etiket: string;
  deger: string;
  aciklama?: string;
  yon?: "iyi" | "kotu" | "notr";
}) {
  return (
    <div className="kpi">
      <div className="kpi-etiket">{etiket}</div>
      <div className={`kpi-deger ${yon}`}>{deger}</div>
      {aciklama ? <div className="kpi-aciklama">{aciklama}</div> : null}
    </div>
  );
}

export function Rozet({
  tur,
  children,
}: {
  tur: "kritik" | "uyari" | "iyi" | "bilgi" | "notr";
  children: React.ReactNode;
}) {
  return (
    <span className={`rozet ${tur}`}>
      <span className="nokta" />
      {children}
    </span>
  );
}

const SEVIYE_ETIKETI = {
  kritik: "Kritik",
  uyari: "Uyarı",
  bilgi: "Bilgi",
} as const;

const ETKI_ETIKETI = {
  risk: "risk altında",
  tasarruf: "kazanç",
  maliyet: "maliyet",
} as const;

export function BulguKarti({ bulgu }: { bulgu: Finding }) {
  return (
    <article className={`bulgu ${bulgu.seviye}`}>
      <div className="bulgu-ust">
        <div>
          <div className="satir">
            <Rozet tur={bulgu.seviye === "bilgi" ? "bilgi" : bulgu.seviye}>
              {SEVIYE_ETIKETI[bulgu.seviye]}
            </Rozet>
            <span className="bulgu-baslik">{bulgu.baslik}</span>
          </div>
          <p className="bulgu-detay">{bulgu.detay}</p>
        </div>
        <div className="bulgu-etki">
          <div className="tutar">{tlKisa(bulgu.etkiTL)}</div>
          <div className="tur">{ETKI_ETIKETI[bulgu.etkiTipi]}</div>
        </div>
      </div>
      <div className="bulgu-oneri">
        <b>Ajanın önerisi</b>
        <span>{bulgu.oneri}</span>
      </div>
      <div className="ikincil" style={{ marginTop: 6 }}>
        {bulgu.etkiEtiketi}: {tl(bulgu.etkiTL)}
      </div>
    </article>
  );
}

const HAT_RENGI: Record<string, string> = {
  "NIS-YERLI": "#0f766e",
  "NIS-MOD": "#7c3aed",
  "MLT-DE18": "#0369a1",
  "GLU-42": "#b45309",
  "GLU-63": "#a16207",
  "FRK-55": "#be123c",
  "GLT-60": "#15803d",
  "KEP-21": "#4d7c0f",
  "CSL-48": "#0e7490",
};

export const kampanyaRengi = (sku: string): string => HAT_RENGI[sku] ?? "#475569";

export function GanttCizgisi({
  kampanyalar,
  kisaAd,
}: {
  kampanyalar: ScheduledCampaign[];
  kisaAd: (sku: string) => string;
}) {
  const olcek = (g: number) => Math.max(0, Math.min(100, (g / UFUK_GUN) * 100));

  return (
    <div className="gantt-cizgi">
      {kampanyalar.map((k, i) => {
        const gecisGun = k.gecisSaati / 24;
        return (
          <span key={`${k.sku}-${i}`}>
            {k.gecisSaati > 0 ? (
              <span
                className="gantt-gecis"
                title={`Ürün geçişi: ${k.gecisSaati} saat, ${tl(k.gecisMaliyeti)}`}
                style={{
                  left: `${olcek(k.baslangicGun - gecisGun)}%`,
                  width: `${olcek(gecisGun)}%`,
                }}
              />
            ) : null}
            <span
              className="gantt-kampanya"
              title={`${kisaAd(k.sku)} · ${Math.round(k.ton)} ton · ${k.baslangicGun.toFixed(1)}-${k.bitisGun.toFixed(1)}. gün`}
              style={{
                left: `${olcek(k.baslangicGun)}%`,
                width: `${Math.max(2, olcek(k.bitisGun) - olcek(k.baslangicGun))}%`,
                background: kampanyaRengi(k.sku),
              }}
            >
              {kisaAd(k.sku)} · {Math.round(k.ton)} t
            </span>
          </span>
        );
      })}
    </div>
  );
}
