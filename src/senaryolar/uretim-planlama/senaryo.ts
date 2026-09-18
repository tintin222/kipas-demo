import { UFUK_GUN } from "@/data/seed";
import { ajaniCalistir, type AjanCiktisi } from "@/lib/planner";
import type { AjanKosusu, AjanSenaryosu } from "@/lib/ajan/cekirdek";

const tl = (n: number) => `${Math.round(n).toLocaleString("tr-TR")} TL`;

export const KOK = "/uretim-planlama";

export const uretimPlanlamaKosusu = (): AjanKosusu<AjanCiktisi> => {
  const cikti = ajaniCalistir();
  const { mevcut, oneri, alternatif } = cikti;

  return {
    adimlar: cikti.adimlar,
    bulgular: cikti.bulgular,
    ayrinti: cikti,
    ozetMetrikler: [
      {
        etiket: "Termini kaçan sipariş",
        deger: `${mevcut.gecikenSiparis} → ${oneri.gecikenSiparis}`,
        aciklama: `Mevcut programda ${tl(mevcut.gecikmeCezasiTL)} sözleşme cezası`,
        yon: oneri.gecikenSiparis < mevcut.gecikenSiparis ? "iyi" : "notr",
      },
      {
        etiket: "Ürün geçiş maliyeti",
        deger: `${tl(mevcut.gecisMaliyetiTL)} → ${tl(oneri.gecisMaliyetiTL)}`,
        aciklama: `${UFUK_GUN} günlük dönem, aynı üretim miktarı`,
        yon: oneri.gecisMaliyetiTL < mevcut.gecisMaliyetiTL ? "iyi" : "notr",
      },
      {
        etiket: "İhtiyaç dışı üretim",
        deger: `${Math.round(mevcut.ihtiyacDisiUretimTon)} t → ${Math.round(oneri.ihtiyacDisiUretimTon)} t`,
        aciklama: `${tl(mevcut.ihtiyacDisiSermayeTL)} işletme sermayesi serbest kalıyor`,
        yon:
          oneri.ihtiyacDisiUretimTon < mevcut.ihtiyacDisiUretimTon
            ? "iyi"
            : "notr",
      },
      {
        etiket: "Termin öncelikli alternatif",
        deger: `${alternatif.gecikenSiparis} geciken sipariş`,
        aciklama: `${tl(alternatif.toplamMaliyetTL - oneri.toplamMaliyetTL)} ek maliyet`,
        yon: "notr",
      },
    ],
    kararlar: [
      {
        id: "plan-hedefi",
        baslik: "Üç haftalık üretim programı hangi hedefe göre kurulsun?",
        aciklama:
          "Ajan iki programı da hesapladı. Fark, şurup hattında bir ürün geçişi daha yapıp yapmamakta.",
        secenekler: [
          {
            id: "maliyet",
            etiket: "Toplam maliyet en düşük",
            ozet: `${oneri.gecikenSiparis} sipariş gecikiyor, toplam ${tl(oneri.toplamMaliyetTL)}`,
          },
          {
            id: "termin",
            etiket: "Hiçbir sipariş gecikmesin",
            ozet: `0 gecikme, toplam ${tl(alternatif.toplamMaliyetTL)}`,
          },
          {
            id: "mevcut",
            etiket: "Mevcut programda kal",
            ozet: `${mevcut.gecikenSiparis} sipariş gecikiyor, toplam ${tl(mevcut.toplamMaliyetTL)}`,
          },
        ],
        onerilen: "maliyet",
      },
    ],
  };
};

export const uretimPlanlamaSenaryosu: AjanSenaryosu<AjanCiktisi> = {
  id: "uretim-planlama",
  ad: "Stok, Sipariş ve Üretim Planlama",
  ozet:
    "Siparişleri, mamul stoğunu ve hat kapasitesini tek ekranda birleştirir; termini riske giren siparişleri çıkarır ve üç haftalık üretim programını gerekçesiyle önerir.",
  birim: "Nişasta Fabrikası",
  ikon: "ÜP",
  kokUrl: KOK,
  durum: "aktif",
  bolumler: [
    { ad: "Kontrol Kulesi", href: KOK },
    { ad: "Stok ve Kapsama", href: `${KOK}/stok` },
    { ad: "Siparişler", href: `${KOK}/siparisler` },
    { ad: "Üretim Programı", href: `${KOK}/plan` },
  ],
  calistir: uretimPlanlamaKosusu,
};
