import { PARTILER, PIYASA, TEDARIKCILER, tedarikciBul } from "@/data/satinalma";
import {
  etiketFiyatiCelisiyorMu,
  FABRIKA,
  partiMaliyeti,
  partileriSirala,
  VARSAYIMLAR,
  yillikFayda,
  type LotCostBreakdown,
  type SiralamaKarsilastirmasi,
} from "@/lib/satinalma";
import type {
  AgentStep,
  AjanKosusu,
  AjanSenaryosu,
  Finding,
} from "@/lib/ajan/cekirdek";
import { tl, tlKisa, ton, yuzde } from "@/lib/bicim";

export const KOK = "/satinalma";

export type SatinalmaBulguTipi =
  | "etiket-yaniltiyor"
  | "beyan-sapmasi"
  | "vade-degeri"
  | "nem-cezasi"
  | "alim-zamani";

export interface SatinalmaCiktisi {
  siralama: LotCostBreakdown[];
  karsilastirma: SiralamaKarsilastirmasi;
  /** Önerilen parti. Sıralamanın ilk sırası. */
  oneri: LotCostBreakdown;
  /** İkinci sıradaki parti; öneriyle arasındaki fark kullanıcıya gösterilir. */
  ikinci: LotCostBreakdown;
  tonBasinaKazancTl: number;
  yillik: ReturnType<typeof yillikFayda>;
  /** Mısır fiyatının son 30 gündeki değişimi, oran. */
  piyasaEgilimi: number;
}

const yuzdeFark = (a: number, b: number) => (a - b) / b;

/** Hesabı yapar; adım metinleri ve bulgular da bu çıktıdan türetilir. */
export function satinalmayiCalistir(): SatinalmaCiktisi {
  const breakdowns = PARTILER.map((lot) =>
    partiMaliyeti(lot, tedarikciBul(lot.supplierId)!, PIYASA),
  );
  const siralama = partileriSirala(breakdowns);
  const karsilastirma = etiketFiyatiCelisiyorMu(breakdowns);
  const oneri = siralama[0]!;
  const ikinci = siralama[1]!;
  const tonBasinaKazancTl =
    karsilastirma.medyanaGoreKazancTl / oneri.tonnesStarchRecoverable;

  return {
    siralama,
    karsilastirma,
    oneri,
    ikinci,
    tonBasinaKazancTl,
    yillik: yillikFayda(tonBasinaKazancTl),
    piyasaEgilimi: yuzdeFark(PIYASA.cornSpotTlPerKg, PIYASA.cornSpot30dAgoTlPerKg),
  };
}

function adimlariYaz(c: SatinalmaCiktisi): AgentStep[] {
  const { oneri, ikinci, karsilastirma } = c;
  const enKotuBeyan = [...c.siralama].sort(
    (a, b) => a.credibilityFactor - b.credibilityFactor,
  )[0]!;

  return [
    {
      baslik: "Açık teklifler alındı",
      detay: `${PARTILER.length} tedarikçiden toplam ${ton(
        PARTILER.reduce((t, p) => t + p.tonnesAsIs, 0),
      )} mısır teklifi açık. Etiket fiyatları ${
        Math.min(...PARTILER.map((p) => p.priceTlPerKg)).toLocaleString("tr-TR")
      } – ${
        Math.max(...PARTILER.map((p) => p.priceTlPerKg)).toLocaleString("tr-TR")
      } TL/kg aralığında.`,
    },
    {
      baslik: "Tedarikçi sicilleri okundu",
      detay: `Her tedarikçinin geçmiş partilerinde beyan ettiği nişasta oranı, fabrika laboratuvarının ölçtüğüyle karşılaştırıldı. ${
        enKotuBeyan.supplierName
      } beyanının ortalama ${yuzde(
        1 - enKotuBeyan.credibilityFactor,
        1,
      )} altında teslim ediyor; beyanı bu oranda kırpıldı.`,
    },
    {
      baslik: "Kütle dengesi kuruldu",
      detay:
        "Her parti için natürel tonajdan yabancı madde ve su düşüldü, kalan kuru maddeden düzeltilmiş nişasta oranı alındı, değirmen verimi uygulandı. Fabrikanın satın aldığı şey mısır değil, geri kazanılabilir nişasta.",
    },
    {
      baslik: "Navlun, kurutma ve vade fiyatlandı",
      detay: `Mesafe, sözleşme nemi üstündeki kurutma ve ödeme vadesinin bugünkü değeri maliyete eklendi. %${PIYASA.commercialTlRatePct} ticari TL faizinde ${
        PARTILER.find((p) => p.id === oneri.lotId)!.paymentTermDays
      } gün vade tek başına ${tlKisa(oneri.financingCreditTl)} ediyor.`,
    },
    {
      baslik: "Sıralama çıkarıldı",
      detay: karsilastirma.celisiyor
        ? `Etiket fiyatına göre en ucuz parti ${
            karsilastirma.etiketeGoreEnUcuz.lotId
          }, gerçek maliyete göre en ucuz parti ${
            karsilastirma.gercekteEnUcuz.lotId
          }. Sıralama çelişiyor: etiketin en ucuzu gerçek maliyette ${
            c.siralama.findIndex((b) => b.lotId === karsilastirma.etiketeGoreEnUcuz.lotId) + 1
          }. sıraya düşüyor.`
        : "Etiket fiyatı ve gerçek maliyet sıralaması bu hafta aynı sonucu veriyor.",
    },
    {
      baslik: "Alım zamanı değerlendirildi",
      detay: `Mısır spot fiyatı 30 günde ${yuzde(c.piyasaEgilimi, 1)} yükseldi ve açık tekliflerin tamamı ${PIYASA.cornSpotTlPerKg.toLocaleString(
        "tr-TR",
      )} TL/kg spot fiyatın altında. Beklemek bu tabloda pahalı.`,
    },
    {
      baslik: "Öneri hazırlandı",
      detay: `${oneri.lotId} (${oneri.supplierName}) öneriliyor: ${tl(
        oneri.effectiveCostTlPerTonneStarch,
      )}/ton nişasta. İkinci sıradaki ${ikinci.lotId} ile arasında ${yuzde(
        yuzdeFark(
          ikinci.effectiveCostTlPerTonneStarch,
          oneri.effectiveCostTlPerTonneStarch,
        ),
        1,
      )} fark var — yakın, dolayısıyla teslim tarihi ya da nakit tercihi bu kararı değiştirebilir.`,
    },
  ];
}

function bulgulariYaz(c: SatinalmaCiktisi): Finding<SatinalmaBulguTipi>[] {
  const { oneri, karsilastirma } = c;
  const bulgular: Finding<SatinalmaBulguTipi>[] = [];

  if (karsilastirma.celisiyor) {
    const etiket = karsilastirma.etiketeGoreEnUcuz;
    bulgular.push({
      id: "etiket-yaniltiyor",
      tip: "etiket-yaniltiyor",
      seviye: "kritik",
      baslik: "Kilogram fiyatı en ucuz parti, gerçekte en ucuz parti değil",
      detay: `${etiket.lotId} kilogramda ${tl(
        etiket.stickerCostTlPerTonneCorn / 1000,
      ).replace(" TL", " TL/kg")} ile en ucuz görünüyor, ancak %${
        PARTILER.find((p) => p.id === etiket.lotId)!.moisturePct
      } nem, %${
        PARTILER.find((p) => p.id === etiket.lotId)!.foreignMatterPct
      } yabancı madde, beyan sapması ve peşin ödeme birlikte maliyeti ${tl(
        etiket.effectiveCostTlPerTonneStarch,
      )}/ton nişastaya çıkarıyor. Önerilen parti ${tl(
        oneri.effectiveCostTlPerTonneStarch,
      )}/ton.`,
      etkiTL: karsilastirma.kazancTl,
      etkiTipi: "tasarruf",
      etkiEtiketi: "Bu alımda önlenen maliyet",
      oneri: `${oneri.lotId} partisini tahsis et; ${etiket.lotId} ancak fiyat düzeltmesiyle rekabetçi olur.`,
    });
  }

  // Beyan sapmaları da tek bulguda: tedarikçi başına ayrı kart, aynı cümleyi
  // isim değiştirerek tekrarlıyordu.
  const sapanlar = [...c.siralama]
    .filter((b) => b.credibilityFactor < 0.995)
    .sort((a, b) => a.credibilityFactor - b.credibilityFactor);
  if (sapanlar.length > 0) {
    const farkTon = (b: LotCostBreakdown) =>
      b.tonnesStarchDeclared - b.tonnesStarchAdjusted;
    const toplamEtki = sapanlar.reduce(
      (t, b) => t + farkTon(b) * b.effectiveCostTlPerTonneStarch,
      0,
    );
    const enKotu = sapanlar[0]!;

    bulgular.push({
      id: "beyan-sapmasi",
      tip: "beyan-sapmasi",
      seviye: enKotu.credibilityFactor < 0.985 ? "uyari" : "bilgi",
      baslik: `${sapanlar.length} tedarikçi beyanının altında teslim ediyor`,
      detay:
        sapanlar
          .map(
            (b) =>
              `${b.supplierName}: ortalama ${yuzde(
                1 - b.credibilityFactor,
                1,
              )} sapma, bu partide ${ton(farkTon(b))} nişasta`,
          )
          .join(". ") +
        ". Sapma, geçmiş partilerde beyan edilen oran ile fabrika laboratuvarının ölçtüğü oranın farkıdır.",
      etkiTL: toplamEtki,
      etkiTipi: "risk",
      etkiEtiketi: "Beyana göre fazladan ödenen",
      oneri: `Sözleşmeye giriş analizine göre fiyat düzeltme maddesi koy; en büyük sapma ${enKotu.supplierName} tarafında, onunla ayrıca konuş.`,
    });
  }

  const vadeli = c.siralama.filter((b) => b.financingCreditTl > 0);
  if (vadeli.length > 0) {
    const enIyi = vadeli.sort((a, b) => b.financingCreditTl - a.financingCreditTl)[0]!;
    bulgular.push({
      id: "vade-degeri",
      tip: "vade-degeri",
      seviye: "bilgi",
      baslik: "Ödeme vadesi, fiyat farklarından daha belirleyici",
      detay: `%${PIYASA.commercialTlRatePct} ticari TL faizinde ${
        PARTILER.find((p) => p.id === enIyi.lotId)!.paymentTermDays
      } gün vade, ${enIyi.lotId} partisinde ${tlKisa(
        enIyi.financingCreditTl,
      )} ediyor — partiler arasındaki etiket fiyatı farkının üzerinde. Peşin iskonto pazarlığı bu rakamın altında kalıyorsa vadeli almak daha ucuz.`,
      etkiTL: enIyi.financingCreditTl,
      etkiTipi: "tasarruf",
      etkiEtiketi: "Vadenin bugünkü değeri",
      oneri:
        "Peşin ödeme talep eden tedarikçilerden, vadenin değerinden büyük bir iskonto iste.",
    });
  }

  // Nem cezası tek bulguda toplanıyor: parti başına ayrı kart açmak, aynı şeyi
  // üç kez söyleyen bir liste üretiyordu.
  const nemli = c.siralama.filter((b) => b.moisturePenaltyPoints > 0);
  if (nemli.length > 0) {
    const kayipTon = (b: LotCostBreakdown) =>
      b.tonnesStarchAdjusted * (FABRIKA.baseRecoveryRate - b.recoveryRate);
    const toplamEtki = nemli.reduce(
      (t, b) => t + kayipTon(b) * b.effectiveCostTlPerTonneStarch + b.dryingTl,
      0,
    );
    const enKotu = [...nemli].sort(
      (a, b) => b.moisturePenaltyPoints - a.moisturePenaltyPoints,
    )[0]!;

    bulgular.push({
      id: "nem-cezasi",
      tip: "nem-cezasi",
      seviye: "bilgi",
      baslik: `${nemli.length} partide nem, değirmen verimini düşürüyor`,
      detay:
        nemli
          .map((b) => {
            const lot = PARTILER.find((p) => p.id === b.lotId)!;
            // Aralığın altındaki mısır da en az üstündeki kadar sorun; kuru tane
            // eşit ıslanmıyor. İkisini aynı cümleyle anlatmak yanlış olurdu.
            const yon =
              lot.moisturePct < FABRIKA.optimalMoistureBand.min
                ? "fazla kuru"
                : "fazla nemli";
            const kurutma =
              b.dryingTl > 0 ? `, ${tlKisa(b.dryingTl)} kurutma maliyeti` : "";
            return `${b.lotId} %${lot.moisturePct.toLocaleString(
              "tr-TR",
            )} (${yon}): verim ${yuzde(b.recoveryRate, 1)}, ${ton(
              kayipTon(b),
            )} nişasta geri kazanılamıyor${kurutma}`;
          })
          .join(". ") +
        `. Değirmenin sevdiği aralık %${FABRIKA.optimalMoistureBand.min}–%${FABRIKA.optimalMoistureBand.max}.`,
      etkiTL: toplamEtki,
      etkiTipi: "maliyet",
      etkiEtiketi: "Verim kaybı ve kurutma",
      oneri: `Nem farkını teklif fiyatına yansıtacak şekilde pazarlık et; en büyük sapma ${enKotu.lotId} partisinde.`,
    });
  }

  bulgular.push({
    id: "alim-zamani",
    tip: "alim-zamani",
    seviye: c.piyasaEgilimi > 0.03 ? "uyari" : "bilgi",
    baslik:
      c.piyasaEgilimi > 0
        ? "Mısır yükseliyor, beklemek pahalı"
        : "Mısır geriliyor, beklemek değerlendirilebilir",
    detay: `Spot fiyat 30 günde ${PIYASA.cornSpot30dAgoTlPerKg.toLocaleString(
      "tr-TR",
    )} TL/kg'dan ${PIYASA.cornSpotTlPerKg.toLocaleString("tr-TR")} TL/kg'a geldi (${yuzde(
      c.piyasaEgilimi,
      1,
    )}). Açık tekliflerin tamamı spotun altında. Aynı eğilim sürerse bir ay beklemek, önerilen parti büyüklüğünde ${tlKisa(
      oneri.cornCostTl * c.piyasaEgilimi,
    )} ek maliyet demek.`,
    etkiTL: oneri.cornCostTl * Math.abs(c.piyasaEgilimi),
    etkiTipi: c.piyasaEgilimi > 0 ? "risk" : "tasarruf",
    etkiEtiketi: "Bir ay beklemenin bedeli",
    oneri:
      "Teslim penceresi uygunsa tahsisi bu hafta kapat; stok kapasitesi elverirse ek tonaj opsiyonu iste.",
  });

  return bulgular;
}

export const satinalmaKosusu = (): AjanKosusu<SatinalmaCiktisi> => {
  const c = satinalmayiCalistir();
  const { oneri, ikinci, karsilastirma } = c;

  return {
    adimlar: adimlariYaz(c),
    bulgular: bulgulariYaz(c),
    ayrinti: c,
    // Bulguların toplamı değil: vade kazancı parti değişiminin kazancının
    // içinde, ikisi toplanınca aynı para iki kez sayılıyor.
    vitrin: { tutar: karsilastirma.kazancTl, etiket: "önlenen maliyet" },
    ozetMetrikler: [
      {
        etiket: "Önerilen partinin gerçek maliyeti",
        deger: `${tl(oneri.effectiveCostTlPerTonneStarch)}/ton nişasta`,
        aciklama: `${oneri.lotId} · ${oneri.supplierName}`,
        yon: "iyi",
      },
      {
        etiket: "Etiket fiyatı en ucuz partiye fark",
        deger: yuzde(
          yuzdeFark(
            karsilastirma.etiketeGoreEnUcuz.effectiveCostTlPerTonneStarch,
            oneri.effectiveCostTlPerTonneStarch,
          ),
          1,
        ),
        aciklama: `Bu alımda ${tlKisa(karsilastirma.kazancTl)} önlenen maliyet`,
        yon: karsilastirma.celisiyor ? "iyi" : "notr",
      },
      {
        etiket: "Geri kazanılabilir nişasta",
        deger: ton(oneri.tonnesStarchRecoverable),
        aciklama: `${ton(oneri.tonnesAsIs)} natürel mısırdan, %${(
          oneri.recoveryRate * 100
        ).toFixed(1).replace(".", ",")} değirmen verimiyle`,
        yon: "notr",
      },
      {
        etiket: "Yıllık fayda tahmini",
        deger: tlKisa(c.yillik.noktaTl),
        aciklama: `${tlKisa(c.yillik.altTl)} – ${tlKisa(
          c.yillik.ustTl,
        )} aralığı; karar değişim oranı ${yuzde(
          VARSAYIMLAR.kararDegisimOrani,
        )} ve yakalama oranı ${yuzde(VARSAYIMLAR.yakalamaOrani)} varsayımıyla`,
        yon: "notr",
      },
    ],
    kararlar: [
      {
        id: "tahsis",
        baslik: "Hangi parti tahsis edilsin?",
        aciklama: `Ajan iki partiyi de hesapladı; aradaki fark ton nişasta başına ${tl(
          ikinci.effectiveCostTlPerTonneStarch - oneri.effectiveCostTlPerTonneStarch,
        )}. Teslim tarihi ya da nakit tercihi bu kararı değiştirebilir.`,
        secenekler: [
          {
            id: oneri.lotId,
            etiket: `${oneri.lotId} — ${oneri.supplierName}`,
            ozet: `${tl(oneri.effectiveCostTlPerTonneStarch)}/ton nişasta, ${ton(
              oneri.tonnesStarchRecoverable,
            )} geri kazanılabilir`,
          },
          {
            id: ikinci.lotId,
            etiket: `${ikinci.lotId} — ${ikinci.supplierName}`,
            ozet: `${tl(ikinci.effectiveCostTlPerTonneStarch)}/ton nişasta, ${ton(
              ikinci.tonnesStarchRecoverable,
            )} geri kazanılabilir`,
          },
          {
            id: karsilastirma.etiketeGoreEnUcuz.lotId,
            etiket: `${karsilastirma.etiketeGoreEnUcuz.lotId} — etiket fiyatı en ucuz`,
            ozet: `${tl(
              karsilastirma.etiketeGoreEnUcuz.effectiveCostTlPerTonneStarch,
            )}/ton nişasta; kilogram fiyatı düşük ama gerçek maliyeti yüksek`,
          },
        ],
        onerilen: oneri.lotId,
      },
    ],
  };
};

export const satinalmaSenaryosu: AjanSenaryosu<SatinalmaCiktisi> = {
  id: "satinalma",
  ad: "Mısır Alım ve Tedarikçi Verimi",
  kisaAd: "Mısır Alım",
  ozet:
    "Açık mısır tekliflerini geri kazanılabilir nişasta tonu başına gerçek maliyete çevirir, tedarikçi beyanını siciliyle düzeltir ve tahsis yazısını hazırlar.",
  birim: "Nişasta Fabrikası",
  ikon: "MA",
  kokUrl: KOK,
  durum: "aktif",
  bolumler: [
    { ad: "Kontrol kulesi", href: KOK },
    { ad: "Partiler", href: `${KOK}/partiler` },
    { ad: "Tahsis", href: `${KOK}/tahsis` },
  ],
  calistir: satinalmaKosusu,
};

/** Tedarikçi listesi, tahsis ekranında kullanılıyor. */
export { TEDARIKCILER };
