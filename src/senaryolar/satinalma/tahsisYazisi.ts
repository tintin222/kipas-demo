import { partiBul, tedarikciBul } from "@/data/satinalma";
import type { LotCostBreakdown } from "@/lib/satinalma";
import { tl, ton } from "@/lib/bicim";

/**
 * Tedarikçiye gönderilecek tahsis yazısının taslağı.
 *
 * Taslak taslaktır: bu fonksiyon metin üretir, hiçbir şey göndermez. Şirketi
 * fiilen bir alıma bağlayabilen bir ajan demo olmaz, o yüzden gönderme yolu
 * bilerek yok.
 */
export function tahsisYazisi(b: LotCostBreakdown, gerekce: string): string {
  const lot = partiBul(b.lotId)!;
  const tedarikci = tedarikciBul(lot.supplierId)!;

  return [
    `Sayın ${tedarikci.name} yetkilisi,`,
    "",
    `${lot.deliveryBy} tarihine kadar teslim edilmek üzere teklif ettiğiniz ` +
      `${ton(lot.tonnesAsIs)} mısır partisi (${lot.id}, ${lot.origin} menşeli) için ` +
      `tahsis kararı alınmıştır.`,
    "",
    `Teklif koşulları: ${lot.priceTlPerKg.toLocaleString("tr-TR")} TL/kg, ` +
      `%${lot.moisturePct.toLocaleString("tr-TR")} nem, ` +
      `%${lot.declaredStarchPctDry.toLocaleString("tr-TR")} beyan nişasta (kuru maddede), ` +
      `%${lot.foreignMatterPct.toLocaleString("tr-TR")} yabancı madde, ` +
      `${lot.paymentTermDays === 0 ? "peşin ödeme" : `${lot.paymentTermDays} gün vade`}.`,
    "",
    `Gerekçe: ${gerekce}`,
    "",
    "Teslimat sırasında fabrika laboratuvarımızca alınacak numune sonuçları esas " +
      "alınacak, beyan edilen değerlerden sapma hâlinde sözleşmedeki fiyat düzeltme " +
      "maddesi uygulanacaktır.",
    "",
    "Saygılarımızla,",
    "Kipaş Nişasta — Hammadde Tedarik",
  ].join("\n");
}

/** Seçilen parti için tek cümlelik gerekçe; yazının içine giriyor. */
export function gerekceYaz(
  secilen: LotCostBreakdown,
  oneri: LotCostBreakdown,
): string {
  if (secilen.lotId === oneri.lotId) {
    return (
      `Geri kazanılabilir nişasta tonu başına ${tl(
        secilen.effectiveCostTlPerTonneStarch,
      )} ile açık teklifler arasında en düşük gerçek maliyet; ` +
      `${ton(secilen.tonnesStarchRecoverable)} geri kazanılabilir nişasta.`
    );
  }
  const fark =
    secilen.effectiveCostTlPerTonneStarch - oneri.effectiveCostTlPerTonneStarch;
  return (
    `Ton nişasta başına ${tl(secilen.effectiveCostTlPerTonneStarch)}; ` +
    `en düşük maliyetli ${oneri.lotId} partisine göre ${tl(Math.abs(fark))} ` +
    `${fark > 0 ? "daha yüksek" : "daha düşük"}. Teslim tarihi ve nakit tercihi ` +
    `dikkate alınarak seçilmiştir.`
  );
}
