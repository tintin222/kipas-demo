/**
 * Mısır alım senaryosunun hesabı.
 *
 * Buradaki her şey saf fonksiyon. Bu bilinçli: ekrandaki hiçbir TL rakamı bir
 * modelin ya da bir metnin içinden çıkmıyor, hepsi bu dosyadaki aritmetikten
 * geliyor. Üretim müdürü öneriyi elle doğrulayabilmeli; ara adımların tamamı
 * bu yüzden saklanıp arayüze veriliyor.
 */

/** Tedarikçinin teklif ettiği bir mısır partisi. */
export interface CornLot {
  id: string;
  supplierId: string;
  /** Menşe. Kullanıcıya gösterilir, hesaba girmez. */
  origin: string;
  /** Teklif edilen tonaj, natürel halde (nem ve yabancı madde dahil). */
  tonnesAsIs: number;
  /** Teklif fiyatı, TL/kg, natürel bazda. */
  priceTlPerKg: number;
  /** Nem, natürel ağırlığın yüzdesi. */
  moisturePct: number;
  /** Tedarikçinin beyan ettiği nişasta oranı, kuru maddenin yüzdesi. */
  declaredStarchPctDry: number;
  /** Yabancı madde (kavuz, taş, kırık tane), natürel ağırlığın yüzdesi. */
  foreignMatterPct: number;
  /** Tedarikçi deposundan Kahramanmaraş fabrikasına karayolu mesafesi, km. */
  distanceKm: number;
  /** Ödemeye kalan gün. 0 peşin demektir. */
  paymentTermDays: number;
  /** Teslimin en geç yapılabileceği tarih (ISO). */
  deliveryBy: string;
}

/** Tedarikçi ve beyanına ne kadar güvenileceğini söyleyen geçmişi. */
export interface Supplier {
  id: string;
  name: string;
  /**
   * Geçmiş partiler: tedarikçinin beyan ettiği oran ile fabrika laboratuvarının
   * girişte ölçtüğü oran. Güvenilirlik düzeltmesinin dayanağı budur.
   */
  history: Array<{
    lotId: string;
    date: string;
    declaredStarchPctDry: number;
    measuredStarchPctDry: number;
  }>;
}

/** Karar anındaki piyasa ve finansman koşulları. */
export interface MarketContext {
  asOf: string;
  /** Mısır spot referans fiyatı, TL/kg. */
  cornSpotTlPerKg: number;
  /** 30 gün önceki mısır fiyatı, TL/kg — eğilim için. */
  cornSpot30dAgoTlPerKg: number;
  /** Politika faizi, yıllık %. */
  policyRatePct: number;
  /** Şirketin kısa vadeli TL kredisine fiilen ödediği faiz, yıllık %. */
  commercialTlRatePct: number;
  usdTry: number;
  /** Mısır nişastası referans ihracat fiyatı, USD/ton. */
  starchUsdPerTonne: number;
}

/** Fabrika sabitleri. Partiye değil, tesise ait değerler. */
export interface PlantParameters {
  /** Sözleşme nem bazı. Bunun üstündeki nem kurutma maliyeti doğurur. */
  contractMoisturePct: number;
  /** Bir ton mısırdan bir nem puanı almanın maliyeti, TL. */
  dryingTlPerTonnePerPoint: number;
  /** Navlunun sabit bileşeni, TL/ton. */
  freightBaseTlPerTonne: number;
  /** Navlunun mesafe bileşeni, TL/ton/km. */
  freightTlPerTonneKm: number;
  /** Optimum nemde değirmenin, mevcut nişastanın ne kadarını geri kazandığı. */
  baseRecoveryRate: number;
  /** Değirmenin istediği nem aralığı. */
  optimalMoistureBand: { min: number; max: number };
  /** Aralık dışındaki her nem puanı için kaybedilen verim oranı. */
  recoveryPenaltyPerPoint: number;
}

/** Bir partinin bütün hesabı; ara adımlar gösterim için saklanır. */
export interface LotCostBreakdown {
  lotId: string;
  supplierId: string;
  supplierName: string;

  // --- kütle dengesi, ton ---
  tonnesAsIs: number;
  tonnesClean: number;
  tonnesDryMatter: number;
  /** Tedarikçinin beyanına göre mevcut nişasta. */
  tonnesStarchDeclared: number;
  /** Beyan, tedarikçinin sicili ile düzeltildikten sonraki nişasta. */
  tonnesStarchAdjusted: number;
  /** Değirmenin fiilen geri kazandığı nişasta. Fabrikanın satın aldığı şey budur. */
  tonnesStarchRecoverable: number;

  // --- güvenilirlik düzeltmesi ---
  /** Geçmişte ölçülen / beyan edilen ortalaması. 1,0 doğru beyan demektir. */
  credibilityFactor: number;
  /** Düzeltmeden sonra kullanılan nişasta oranı. */
  adjustedStarchPctDry: number;

  // --- verim ---
  recoveryRate: number;
  moisturePenaltyPoints: number;

  // --- maliyetler, TL ---
  cornCostTl: number;
  freightTl: number;
  dryingTl: number;
  /** Bugün yerine vadede ödemenin değeri. Maliyeti düşürür. */
  financingCreditTl: number;
  totalEffectiveCostTl: number;

  // --- sonuç ---
  /** Geri kazanılabilir nişasta tonu başına gerçek maliyet. */
  effectiveCostTlPerTonneStarch: number;
  /** Naif karşılaştırma: teklif edildiği haliyle ton mısır başına fiyat. */
  stickerCostTlPerTonneCorn: number;
}

/** Kipaş Nişasta, Kahramanmaraş. Ölçek gerçek tesise göre, oranlar temsilîdir. */
export const FABRIKA: PlantParameters = {
  contractMoisturePct: 14,
  dryingTlPerTonnePerPoint: 62,
  freightBaseTlPerTonne: 180,
  freightTlPerTonneKm: 2.4,
  baseRecoveryRate: 0.94,
  optimalMoistureBand: { min: 14, max: 16 },
  recoveryPenaltyPerPoint: 0.012,
};

/**
 * Bu tedarikçinin beyanının ne kadarına inanmalı?
 *
 * Geçmişteki ölçülen/beyan oranlarının ortalaması. Sürekli beyanının altında
 * mal gönderen tedarikçinin bir sonraki beyanı aynı oranda kırpılır. Geçmişi
 * olmayan tedarikçinin beyanı olduğu gibi alınır; iyimser, ama yeni tedarikçiye
 * uydurma bir ceza yazmak daha kötü olurdu.
 */
export function guvenilirlikKatsayisi(supplier: Supplier): number {
  if (supplier.history.length === 0) return 1;
  const oranlar = supplier.history.map(
    (h) => h.measuredStarchPctDry / h.declaredStarchPctDry,
  );
  return oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
}

/**
 * Verilen nemde değirmen verimi.
 *
 * Değirmenin sevdiği bir nem aralığı var; dışında ıslatma ve ayırma birlikte
 * bozuluyor, verim aralıktan uzaklaştıkça yaklaşık doğrusal düşüyor. Fazla kuru
 * mısır da en az fazla yaş mısır kadar sorun: kuru tane eşit ıslanmıyor.
 */
export function degirmenVerimi(
  moisturePct: number,
  fabrika: PlantParameters = FABRIKA,
): { rate: number; penaltyPoints: number } {
  const { min, max } = fabrika.optimalMoistureBand;
  const penaltyPoints =
    moisturePct < min ? min - moisturePct : moisturePct > max ? moisturePct - max : 0;
  const rate = Math.max(
    0,
    fabrika.baseRecoveryRate - penaltyPoints * fabrika.recoveryPenaltyPerPoint,
  );
  return { rate, penaltyPoints };
}

/**
 * Bugün yerine N gün sonra ödemenin değeri.
 *
 * %45 ticari TL faizinde 60 gün vade, faturanın yaklaşık %7'si eder — partiler
 * arasındaki fiyat farklarından rahatça büyüktür, karşılaştırmadan çıkarılamaz
 * olmasının sebebi de budur. Basit faiz yerine iskonto edilir, yani gerçek
 * bugünkü değerdir.
 */
export function vadeKredisi(
  costTl: number,
  paymentTermDays: number,
  annualRatePct: number,
): number {
  if (paymentTermDays <= 0) return 0;
  const bugunkuDeger = costTl / (1 + (annualRatePct / 100) * (paymentTermDays / 365));
  return costTl - bugunkuDeger;
}

/** Partinin navlunu, TL. Sabit yükleme maliyetinin üstüne mesafeyle doğrusal. */
export function navlun(
  tonnesAsIs: number,
  distanceKm: number,
  fabrika: PlantParameters = FABRIKA,
): number {
  return (
    tonnesAsIs * (fabrika.freightBaseTlPerTonne + fabrika.freightTlPerTonneKm * distanceKm)
  );
}

/**
 * Kurutma maliyeti, TL. Sözleşme neminin üstündeki mısır depolanmadan önce
 * kurutulmalı; üstelik fazla su zaten mısır fiyatından satın alınmış oluyor.
 */
export function kurutmaMaliyeti(
  tonnesAsIs: number,
  moisturePct: number,
  fabrika: PlantParameters = FABRIKA,
): number {
  const fazlaPuan = Math.max(0, moisturePct - fabrika.contractMoisturePct);
  return tonnesAsIs * fazlaPuan * fabrika.dryingTlPerTonnePerPoint;
}

/**
 * Bir parti için bütün zincir: natürel ton girer, ton nişasta başına TL çıkar.
 *
 * Sıra önemli; her adım fabrikanın aslında satın almadığı bir şeyi çıkarıyor —
 * önce yabancı madde, sonra su, sonra beyanın tedarikçi sicilinin desteklemediği
 * kısmı, en sonda değirmenin geri kazanamadığı nişasta.
 */
export function partiMaliyeti(
  lot: CornLot,
  supplier: Supplier,
  market: MarketContext,
  fabrika: PlantParameters = FABRIKA,
): LotCostBreakdown {
  // 1. Kütle dengesi: önce mısır olmayanı, sonra kuru madde olmayanı çıkar.
  const tonnesClean = lot.tonnesAsIs * (1 - lot.foreignMatterPct / 100);
  const tonnesDryMatter = tonnesClean * (1 - lot.moisturePct / 100);

  // 2. Mevcut nişasta: önce beyan, sonra sicille düzeltilmiş hali.
  const credibility = guvenilirlikKatsayisi(supplier);
  const adjustedStarchPctDry = lot.declaredStarchPctDry * credibility;
  const tonnesStarchDeclared = tonnesDryMatter * (lot.declaredStarchPctDry / 100);
  const tonnesStarchAdjusted = tonnesDryMatter * (adjustedStarchPctDry / 100);

  // 3. Değirmenin fiilen çıkarabildiği.
  const { rate, penaltyPoints } = degirmenVerimi(lot.moisturePct, fabrika);
  const tonnesStarchRecoverable = tonnesStarchAdjusted * rate;

  // 4. Maliyetler.
  const cornCostTl = lot.tonnesAsIs * 1000 * lot.priceTlPerKg;
  const freightTl = navlun(lot.tonnesAsIs, lot.distanceKm, fabrika);
  const dryingTl = kurutmaMaliyeti(lot.tonnesAsIs, lot.moisturePct, fabrika);
  const financingCreditTl = vadeKredisi(
    cornCostTl,
    lot.paymentTermDays,
    market.commercialTlRatePct,
  );
  const totalEffectiveCostTl = cornCostTl + freightTl + dryingTl - financingCreditTl;

  return {
    lotId: lot.id,
    supplierId: supplier.id,
    supplierName: supplier.name,
    tonnesAsIs: lot.tonnesAsIs,
    tonnesClean,
    tonnesDryMatter,
    tonnesStarchDeclared,
    tonnesStarchAdjusted,
    tonnesStarchRecoverable,
    credibilityFactor: credibility,
    adjustedStarchPctDry,
    recoveryRate: rate,
    moisturePenaltyPoints: penaltyPoints,
    cornCostTl,
    freightTl,
    dryingTl,
    financingCreditTl,
    totalEffectiveCostTl,
    effectiveCostTlPerTonneStarch: totalEffectiveCostTl / tonnesStarchRecoverable,
    stickerCostTlPerTonneCorn: lot.priceTlPerKg * 1000,
  };
}

/** Partileri, önemli olan ölçüte göre ucuzdan pahalıya sırala. */
export function partileriSirala(breakdowns: LotCostBreakdown[]): LotCostBreakdown[] {
  return [...breakdowns].sort(
    (a, b) => a.effectiveCostTlPerTonneStarch - b.effectiveCostTlPerTonneStarch,
  );
}

export interface SiralamaKarsilastirmasi {
  celisiyor: boolean;
  etiketeGoreEnUcuz: LotCostBreakdown;
  gercekteEnUcuz: LotCostBreakdown;
  /**
   * Etiket fiyatına bakan bir alıcının seçeceği partiye karşı bu alımdaki kazanç.
   *
   * Demonun manşeti budur ve verinin desteklediği EN YÜKSEK iddiadır: alıcının
   * aksi halde gerçek maliyette en kötü partiyi seçeceğini varsayar. Yıla çarpma —
   * bu, tedarik ekibinin her seferinde mümkün olan en kötü kararı verdiğini
   * varsaymak olur ve müşteri bunu haklı olarak reddeder. Çarpılacaksa
   * `medyanaGoreKazancTl` kullanılmalı.
   */
  kazancTl: number;
  /**
   * Setteki medyan partiye karşı kazanç — araçsız çalışan yetkin bir alıcının
   * ortalama bir haftada varacağı yer. Ölçeklenecek rakam budur.
   */
  medyanaGoreKazancTl: number;
}

/**
 * Gerçek maliyet sıralaması, etiket fiyatı sıralamasıyla çelişiyor mu?
 *
 * Senaryonun var olma sebebi bu soru olduğu için, modelin fark etmesine
 * bırakılmayıp kendi fonksiyonu olarak yazıldı.
 */
export function etiketFiyatiCelisiyorMu(
  breakdowns: LotCostBreakdown[],
): SiralamaKarsilastirmasi {
  const etiketeGore = [...breakdowns].sort(
    (a, b) => a.stickerCostTlPerTonneCorn - b.stickerCostTlPerTonneCorn,
  );
  const gercegeGore = partileriSirala(breakdowns);
  const etiketeGoreEnUcuz = etiketeGore[0]!;
  const gercekteEnUcuz = gercegeGore[0]!;

  // Eşit zeminde karşılaştır: her parti aynı tonaj nişastayı vermek için ne
  // tutuyor. Partiler farklı büyüklükte olduğundan toplam maliyeti doğrudan
  // karşılaştırmak yanlış olurdu.
  const referansTon = gercekteEnUcuz.tonnesStarchRecoverable;
  const kazancTl =
    (etiketeGoreEnUcuz.effectiveCostTlPerTonneStarch -
      gercekteEnUcuz.effectiveCostTlPerTonneStarch) *
    referansTon;

  // Gerçek maliyette medyan parti, "araçsız yetkin alıcının varacağı yer" yerine
  // geçiyor. Çift sayıda partide ortalama almak yerine alt ortadaki alınıyor ki
  // rakam her zaman fiilen satın alınabilecek bir partiye ait olsun.
  const medyan = gercegeGore[Math.floor((gercegeGore.length - 1) / 2)]!;
  const medyanaGoreKazancTl =
    (medyan.effectiveCostTlPerTonneStarch -
      gercekteEnUcuz.effectiveCostTlPerTonneStarch) *
    referansTon;

  return {
    celisiyor: etiketeGoreEnUcuz.lotId !== gercekteEnUcuz.lotId,
    etiketeGoreEnUcuz,
    gercekteEnUcuz,
    kazancTl,
    medyanaGoreKazancTl,
  };
}

/**
 * Yıllık bir rakamın arkasındaki varsayımlar.
 *
 * Bunlar tahmindir; bir çarpma işleminin içine gömmek yerine tip olarak
 * adlandırılmasının sebebi, müşterinin her biriyle ayrı ayrı tartışabilmesi.
 * Ölçülebilir fayda karşılığında bütçe ayıracağını açıkça söylemiş biri, büyük
 * bir rakamı gördüğünde ilk olarak nereden çıktığını soracaktır. Arayüz bunları
 * saklamak yerine değiştirilebilir girdi olarak göstermeli.
 */
export interface FaydaVarsayimlari {
  /** Fabrikanın yılda ürettiği nişasta, ton. */
  yillikNisastaTon: number;
  /**
   * Gerçek maliyet sıralamasının, ekibin mevcut tercihiyle çeliştiği alım oranı.
   * Geri kalanında araç, zaten yapacakları şeyi onaylar ve bir tasarruf doğmaz.
   */
  kararDegisimOrani: number;
  /**
   * Sıralama çeliştiğinde farkın fiilen yakalanan kısmı. 1'in altında, çünkü
   * önerilen parti satılmış olabilir, yükler bölünür ve ekip nemi zaten bir
   * ölçüde gözüyle düzeltir — aracın katkısı, halihazırda elde etmedikleri kısım.
   */
  yakalamaOrani: number;
}

/** Bilinçli olarak temkinli. Fazla iddialı yakalanmaktansa yukarı çekilmek iyidir. */
export const VARSAYIMLAR: FaydaVarsayimlari = {
  yillikNisastaTon: 320_000,
  kararDegisimOrani: 0.3,
  yakalamaOrani: 0.5,
};

/**
 * Ton başına bir kazancı yıllık rakama ölçekler.
 *
 * Nokta tahminin yanında aralığı da döner; tek bir rakam, bu hesabın
 * taşıyamayacağı bir kesinlik izlenimi verir.
 */
export function yillikFayda(
  tonBasinaKazancTl: number,
  varsayimlar: FaydaVarsayimlari = VARSAYIMLAR,
): { noktaTl: number; altTl: number; ustTl: number; kirpilmamisTl: number } {
  const { yillikNisastaTon, kararDegisimOrani, yakalamaOrani } = varsayimlar;
  const kirpilmamisTl = tonBasinaKazancTl * yillikNisastaTon;
  const noktaTl = kirpilmamisTl * kararDegisimOrani * yakalamaOrani;
  return {
    noktaTl,
    altTl: noktaTl * 0.5,
    ustTl: Math.min(kirpilmamisTl, noktaTl * 2),
    kirpilmamisTl,
  };
}
