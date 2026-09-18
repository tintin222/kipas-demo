export type LineId = "NIS" | "SUR" | "YAN";

export interface ProductionLine {
  id: LineId;
  ad: string;
  aciklama: string;
  /** Hat üzerinde şu an üretimde olan ürün (program bu noktadan devam eder). */
  mevcutUrun: string;
}

export interface Product {
  sku: string;
  ad: string;
  kisaAd: string;
  hat: LineId;
  /** Hat bu ürünü çalıştırırken günlük üretim hızı (ton/gün). */
  hizTonGun: number;
  /** Standart üretim maliyeti (TL/ton). */
  maliyetTon: number;
  /** Liste satış fiyatı (TL/ton). */
  listeFiyatTon: number;
  /** Ekonomik en küçük kampanya büyüklüğü (ton). */
  minKampanyaTon: number;
  /** Raf ömrü (gün). */
  rafOmruGun: number;
  /** Emniyet stoğu (ton). */
  emniyetStogu: number;
}

export interface StockLot {
  lotNo: string;
  sku: string;
  ton: number;
  /** Üretim tarihi (ISO, YYYY-MM-DD). */
  uretimTarihi: string;
}

export interface Order {
  id: string;
  musteri: string;
  sku: string;
  ton: number;
  /** Termin tarihi (ISO, YYYY-MM-DD). */
  terminTarihi: string;
  /** Sipariş özel fiyatı (TL/ton). */
  fiyatTon: number;
  /** Gecikme cezası: sipariş tutarının günlük yüzdesi. */
  gecikmeCezasiGunluk: number;
}

export interface Campaign {
  sku: string;
  ton: number;
}

/** Simülasyon sonrası zaman bilgisi eklenmiş kampanya. */
export interface ScheduledCampaign extends Campaign {
  baslangicGun: number;
  bitisGun: number;
  gecisSaati: number;
  gecisMaliyeti: number;
  hat: LineId;
  gerekce: string;
}

export interface OrderResult {
  siparis: Order;
  /** Siparişin karşılanabildiği gün (bugünden itibaren gün sayısı). */
  hazirGun: number;
  terminGun: number;
  gecikmeGun: number;
  cezaTL: number;
  stoktanKarsilananTon: number;
  uretimdenKarsilananTon: number;
  karsilanamayanTon: number;
}

export interface LineResult {
  hat: LineId;
  kampanyalar: ScheduledCampaign[];
  gecisMaliyetiTL: number;
  gecisSaati: number;
  kullanilanGun: number;
  kapasiteKullanimi: number;
}

export interface PlanResult {
  ad: string;
  hatlar: LineResult[];
  siparisler: OrderResult[];
  gecisMaliyetiTL: number;
  gecikmeCezasiTL: number;
  stokFinansmaniTL: number;
  toplamMaliyetTL: number;
  gecikenSiparis: number;
  riskliSiparis: number;
  uretilenTon: number;
  /** Net ihtiyacı olmayan ürünlere programda ayrılan üretim (ton). */
  ihtiyacDisiUretimTon: number;
  /** İhtiyaç dışı üretimin bağladığı işletme sermayesi (TL). */
  ihtiyacDisiSermayeTL: number;
  /** Ufuk sonunda karşılanamamış sipariş miktarı (ton). */
  karsilanamayanTon: number;
  donemSonuStokTon: number;
  donemSonuStokDegeriTL: number;
  ortalamaBagliSermayeTL: number;
}

export type FindingSeverity = "kritik" | "uyari" | "bilgi";

export interface Finding {
  id: string;
  tip:
    | "stok-yetersiz"
    | "termin-riski"
    | "fazla-uretim"
    | "yavas-stok"
    | "raf-omru"
    | "sira-optimizasyonu"
    | "karlilik";
  seviye: FindingSeverity;
  baslik: string;
  detay: string;
  /** Finansal etki (TL). */
  etkiTL: number;
  /** Etkinin cinsi: kaçabilecek ciro, önlenebilir maliyet ya da hâlihazırda oluşan maliyet. */
  etkiTipi: "risk" | "tasarruf" | "maliyet";
  etkiEtiketi: string;
  sku?: string;
  siparisId?: string;
  oneri: string;
}

export type PlanHedefi = "maliyet" | "sifir-gecikme";

export interface AgentStep {
  baslik: string;
  detay: string;
}
