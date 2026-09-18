import type { AjanSenaryosu } from "@/lib/ajan/cekirdek";
import { raporlamaSenaryosu } from "@/senaryolar/raporlama/senaryo";
import { satinalmaSenaryosu } from "@/senaryolar/satinalma/senaryo";
import { uretimPlanlamaSenaryosu } from "@/senaryolar/uretim-planlama/senaryo";

/**
 * Kabuğun tanıdığı bütün ajan senaryoları.
 * Yeni bir senaryo, kendi klasöründe `AjanSenaryosu` uygulayıp bu listeye
 * eklenerek devreye girer; navigasyon ve ajan paneli kendiliğinden çalışır.
 */
export const SENARYOLAR: AjanSenaryosu[] = [
  uretimPlanlamaSenaryosu as AjanSenaryosu,
  satinalmaSenaryosu as AjanSenaryosu,
  raporlamaSenaryosu as AjanSenaryosu,
  {
    id: "bakim",
    ad: "Duruş ve Bakım Önceliklendirme",
    ozet:
      "Plansız duruşları ve arıza kayıtlarını toplayıp bakım işlerini üretim kaybına göre sıraya koyar.",
    birim: "Nişasta Fabrikası",
    ikon: "BK",
    kokUrl: "/bakim",
    durum: "planlanan",
    bolumler: [],
  },
];

export const senaryoBul = (id: string): AjanSenaryosu | undefined =>
  SENARYOLAR.find((s) => s.id === id);
