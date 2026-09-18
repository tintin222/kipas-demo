import type {
  Campaign,
  LineId,
  Order,
  Product,
  ProductionLine,
  StockLot,
} from "@/lib/types";

/**
 * Tüm veriler bu dosyada üretilmiş örnek (demo) verilerdir.
 * Gerçek Kipaş verisi içermez; mısır yaş öğütme tesisi mantığına göre kurgulanmıştır.
 */

export const BUGUN = "2026-09-18";
/** Planlama ufku (gün). */
export const UFUK_GUN = 21;
/** Yıllık finansman maliyeti (TL faiz oranı). */
export const YILLIK_FINANSMAN = 0.45;
/** Termin riski eşiği: bu kadar gün içinde sıkışan sipariş "riskli" sayılır. */
export const RISK_ESIGI_GUN = 1.5;

export const HATLAR: ProductionLine[] = [
  {
    id: "NIS",
    ad: "Nişasta Hattı",
    aciklama: "Kurutma ve modifikasyon; tek seferde tek ürün çalışır.",
    mevcutUrun: "MLT-DE18",
  },
  {
    id: "SUR",
    ad: "Şurup Hattı",
    aciklama: "Sakarifikasyon, izomerizasyon ve evaporasyon.",
    mevcutUrun: "GLU-42",
  },
  {
    id: "YAN",
    ad: "Yan Ürün Hattı",
    aciklama: "Gluten, kepek ve mısır özsuyu kurutma / konsantrasyon.",
    mevcutUrun: "KEP-21",
  },
];

export const URUNLER: Product[] = [
  {
    sku: "NIS-YERLI",
    ad: "Yerli Mısır Nişastası",
    kisaAd: "Mısır Nişastası",
    hat: "NIS",
    hizTonGun: 130,
    maliyetTon: 21500,
    listeFiyatTon: 26400,
    minKampanyaTon: 120,
    rafOmruGun: 540,
    emniyetStogu: 120,
  },
  {
    sku: "NIS-MOD",
    ad: "Modifiye Nişasta (E1422)",
    kisaAd: "Modifiye Nişasta",
    hat: "NIS",
    hizTonGun: 70,
    maliyetTon: 30200,
    listeFiyatTon: 41500,
    minKampanyaTon: 80,
    rafOmruGun: 360,
    emniyetStogu: 60,
  },
  {
    sku: "MLT-DE18",
    ad: "Maltodekstrin DE18",
    kisaAd: "Maltodekstrin",
    hat: "NIS",
    hizTonGun: 90,
    maliyetTon: 27800,
    listeFiyatTon: 35900,
    minKampanyaTon: 80,
    rafOmruGun: 450,
    emniyetStogu: 50,
  },
  {
    sku: "GLU-42",
    ad: "Glukoz Şurubu 42 DE",
    kisaAd: "Glukoz 42 DE",
    hat: "SUR",
    hizTonGun: 180,
    maliyetTon: 18900,
    listeFiyatTon: 23200,
    minKampanyaTon: 150,
    rafOmruGun: 180,
    emniyetStogu: 150,
  },
  {
    sku: "GLU-63",
    ad: "Glukoz Şurubu 63 DE",
    kisaAd: "Glukoz 63 DE",
    hat: "SUR",
    hizTonGun: 160,
    maliyetTon: 19800,
    listeFiyatTon: 24600,
    minKampanyaTon: 150,
    rafOmruGun: 180,
    emniyetStogu: 120,
  },
  {
    sku: "FRK-55",
    ad: "Fruktoz Şurubu F55",
    kisaAd: "Fruktoz F55",
    hat: "SUR",
    hizTonGun: 140,
    maliyetTon: 24500,
    listeFiyatTon: 31800,
    minKampanyaTon: 150,
    rafOmruGun: 150,
    emniyetStogu: 100,
  },
  {
    sku: "GLT-60",
    ad: "Mısır Gluteni %60 Protein",
    kisaAd: "Mısır Gluteni",
    hat: "YAN",
    hizTonGun: 60,
    maliyetTon: 16200,
    listeFiyatTon: 22800,
    minKampanyaTon: 60,
    rafOmruGun: 270,
    emniyetStogu: 40,
  },
  {
    sku: "KEP-21",
    ad: "Mısır Kepeği (Gluten Yemi)",
    kisaAd: "Mısır Kepeği",
    hat: "YAN",
    hizTonGun: 150,
    maliyetTon: 6100,
    listeFiyatTon: 8450,
    minKampanyaTon: 80,
    rafOmruGun: 180,
    emniyetStogu: 80,
  },
  {
    sku: "CSL-48",
    ad: "Mısır Özsuyu (CSL %48)",
    kisaAd: "Mısır Özsuyu",
    hat: "YAN",
    hizTonGun: 110,
    maliyetTon: 5400,
    listeFiyatTon: 7300,
    minKampanyaTon: 60,
    rafOmruGun: 120,
    emniyetStogu: 50,
  },
];

export const STOK_LOTLARI: StockLot[] = [
  { lotNo: "L-2609-A", sku: "NIS-YERLI", ton: 160, uretimTarihi: "2026-09-08" },
  { lotNo: "L-2608-C", sku: "NIS-YERLI", ton: 80, uretimTarihi: "2026-08-30" },
  { lotNo: "L-2606-B", sku: "NIS-MOD", ton: 300, uretimTarihi: "2026-06-22" },
  { lotNo: "L-2607-F", sku: "NIS-MOD", ton: 220, uretimTarihi: "2026-07-30" },
  { lotNo: "L-2609-D", sku: "MLT-DE18", ton: 60, uretimTarihi: "2026-09-12" },
  { lotNo: "L-2609-E", sku: "GLU-42", ton: 180, uretimTarihi: "2026-09-14" },
  { lotNo: "L-2606-G", sku: "GLU-63", ton: 240, uretimTarihi: "2026-06-05" },
  { lotNo: "L-2608-H", sku: "GLU-63", ton: 170, uretimTarihi: "2026-08-18" },
  { lotNo: "L-2609-J", sku: "FRK-55", ton: 120, uretimTarihi: "2026-09-10" },
  { lotNo: "L-2609-K", sku: "GLT-60", ton: 130, uretimTarihi: "2026-09-05" },
  { lotNo: "L-2609-M", sku: "KEP-21", ton: 260, uretimTarihi: "2026-09-11" },
  { lotNo: "L-2607-N", sku: "CSL-48", ton: 110, uretimTarihi: "2026-07-01" },
  { lotNo: "L-2609-P", sku: "CSL-48", ton: 70, uretimTarihi: "2026-09-09" },
];

export const SIPARISLER: Order[] = [
  { id: "SIP-2425", musteri: "Anadolu İçecek San. A.Ş.", sku: "FRK-55", ton: 620, terminTarihi: "2026-09-26", fiyatTon: 33400, gecikmeCezasiGunluk: 0.005 },
  { id: "SIP-2427", musteri: "Akdeniz Meşrubat A.Ş.", sku: "GLU-42", ton: 600, terminTarihi: "2026-09-25", fiyatTon: 22600, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2429", musteri: "Trakya Hazır Gıda Ltd.", sku: "NIS-MOD", ton: 120, terminTarihi: "2026-09-26", fiyatTon: 43900, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2430", musteri: "Toros Yem San. A.Ş.", sku: "KEP-21", ton: 340, terminTarihi: "2026-09-25", fiyatTon: 8200, gecikmeCezasiGunluk: 0.002 },
  { id: "SIP-2431", musteri: "Marmara Bisküvi A.Ş.", sku: "NIS-YERLI", ton: 420, terminTarihi: "2026-09-24", fiyatTon: 26900, gecikmeCezasiGunluk: 0.005 },
  { id: "SIP-2433", musteri: "Marmara Bisküvi A.Ş.", sku: "GLU-63", ton: 260, terminTarihi: "2026-09-28", fiyatTon: 24100, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2435", musteri: "Toros Besicilik Koop.", sku: "GLT-60", ton: 300, terminTarihi: "2026-09-27", fiyatTon: 23600, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2436", musteri: "Anadolu İçecek San. A.Ş.", sku: "MLT-DE18", ton: 180, terminTarihi: "2026-09-27", fiyatTon: 36800, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2438", musteri: "Doruk Un ve Gıda A.Ş.", sku: "NIS-YERLI", ton: 380, terminTarihi: "2026-09-29", fiyatTon: 25900, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2440", musteri: "Çukurova Şekerleme A.Ş.", sku: "GLU-42", ton: 450, terminTarihi: "2026-09-30", fiyatTon: 23400, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2442", musteri: "Biyokim Fermentasyon A.Ş.", sku: "CSL-48", ton: 90, terminTarihi: "2026-10-01", fiyatTon: 7250, gecikmeCezasiGunluk: 0.002 },
  { id: "SIP-2444", musteri: "Ege Gıda Sanayi A.Ş.", sku: "NIS-YERLI", ton: 300, terminTarihi: "2026-10-03", fiyatTon: 27300, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2447", musteri: "Akdeniz Meşrubat A.Ş.", sku: "FRK-55", ton: 480, terminTarihi: "2026-10-02", fiyatTon: 32100, gecikmeCezasiGunluk: 0.005 },
  { id: "SIP-2449", musteri: "Bereket Bebek Maması A.Ş.", sku: "MLT-DE18", ton: 150, terminTarihi: "2026-10-05", fiyatTon: 38200, gecikmeCezasiGunluk: 0.004 },
  { id: "SIP-2451", musteri: "Levent Şekerleme Ltd.", sku: "NIS-YERLI", ton: 250, terminTarihi: "2026-10-06", fiyatTon: 25400, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2452", musteri: "Gülsan Reçel ve Konserve", sku: "GLU-42", ton: 350, terminTarihi: "2026-10-04", fiyatTon: 22900, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2454", musteri: "Çukurova Besicilik A.Ş.", sku: "GLT-60", ton: 250, terminTarihi: "2026-10-07", fiyatTon: 22400, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2456", musteri: "Anadolu Süt Yem Ltd.", sku: "KEP-21", ton: 220, terminTarihi: "2026-10-06", fiyatTon: 8350, gecikmeCezasiGunluk: 0.002 },
  { id: "SIP-2457", musteri: "Anadolu Kağıt San. A.Ş.", sku: "NIS-YERLI", ton: 450, terminTarihi: "2026-10-08", fiyatTon: 24800, gecikmeCezasiGunluk: 0.003 },
  { id: "SIP-2459", musteri: "Toros Fırıncılık A.Ş.", sku: "GLU-42", ton: 400, terminTarihi: "2026-10-09", fiyatTon: 23800, gecikmeCezasiGunluk: 0.003 },
];

/**
 * Ürün geçiş (changeover) matrisi: temizlik / yıkama süresi ve maliyeti.
 * Anahtar: "KAYNAK>HEDEF". Simetrik kabul edilir.
 */
export const GECIS_MATRISI: Record<string, { saat: number; maliyetTL: number }> = {
  "NIS-YERLI>NIS-MOD": { saat: 6, maliyetTL: 42000 },
  "NIS-YERLI>MLT-DE18": { saat: 5, maliyetTL: 35000 },
  "NIS-MOD>MLT-DE18": { saat: 8, maliyetTL: 58000 },
  "GLU-42>GLU-63": { saat: 3, maliyetTL: 18000 },
  "GLU-42>FRK-55": { saat: 10, maliyetTL: 96000 },
  "GLU-63>FRK-55": { saat: 9, maliyetTL: 88000 },
  "GLT-60>KEP-21": { saat: 2, maliyetTL: 9000 },
  "GLT-60>CSL-48": { saat: 3, maliyetTL: 14000 },
  "KEP-21>CSL-48": { saat: 2, maliyetTL: 8000 },
};

/**
 * Üretim müdürünün elde hazırladığı mevcut 3 haftalık program.
 * Telefon ve mesajla toplanan bilgiye göre kurulmuştur.
 */
export const MEVCUT_PROGRAM: Record<LineId, Campaign[]> = {
  NIS: [
    { sku: "MLT-DE18", ton: 270 },
    { sku: "NIS-YERLI", ton: 900 },
    { sku: "NIS-MOD", ton: 180 },
    { sku: "NIS-YERLI", ton: 660 },
  ],
  SUR: [
    { sku: "FRK-55", ton: 420 },
    { sku: "GLU-42", ton: 720 },
    { sku: "FRK-55", ton: 560 },
    { sku: "GLU-42", ton: 900 },
  ],
  YAN: [
    { sku: "CSL-48", ton: 110 },
    { sku: "KEP-21", ton: 300 },
    { sku: "GLT-60", ton: 420 },
  ],
};

export const urunBul = (sku: string): Product => {
  const u = URUNLER.find((p) => p.sku === sku);
  if (!u) throw new Error(`Ürün bulunamadı: ${sku}`);
  return u;
};

export const hatBul = (id: LineId): ProductionLine => {
  const h = HATLAR.find((l) => l.id === id);
  if (!h) throw new Error(`Hat bulunamadı: ${id}`);
  return h;
};

export const gecisMaliyeti = (
  kaynak: string | null,
  hedef: string,
): { saat: number; maliyetTL: number } => {
  if (!kaynak || kaynak === hedef) return { saat: 0, maliyetTL: 0 };
  return (
    GECIS_MATRISI[`${kaynak}>${hedef}`] ??
    GECIS_MATRISI[`${hedef}>${kaynak}`] ?? { saat: 4, maliyetTL: 25000 }
  );
};
