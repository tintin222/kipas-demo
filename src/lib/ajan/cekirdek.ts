/**
 * Ortak ajan çatısı.
 *
 * Her iş senaryosu (üretim planlama, satın alma, bakım, raporlama ...) bu
 * sözleşmeyi uygular. Kabuk, navigasyon ve ajan paneli senaryodan bağımsızdır;
 * yeni bir senaryo eklemek için `SENARYOLAR` listesine bir kayıt eklemek yeter.
 */

export interface AgentStep {
  baslik: string;
  detay: string;
}

export type FindingSeverity = "kritik" | "uyari" | "bilgi";

/**
 * Bir ajanın çıkardığı bulgu. `tip` senaryoya özeldir: her senaryo kendi
 * birliğini tanımlayıp `Finding<KendiTipi>` kullanır, ortak bileşenler ise
 * `Finding` (yani `Finding<string>`) alır.
 */
export interface Finding<TTip extends string = string> {
  id: string;
  tip: TTip;
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

export interface AjanBolumu {
  ad: string;
  href: string;
}

export interface AjanMetrigi {
  etiket: string;
  deger: string;
  aciklama?: string;
  yon?: "iyi" | "kotu" | "notr";
}

/** Ajanın kullanıcıya bıraktığı karar. */
export interface AjanKarari {
  id: string;
  baslik: string;
  aciklama: string;
  secenekler: { id: string; etiket: string; ozet: string }[];
  onerilen: string;
}

export interface AjanKosusu<TAyrinti = unknown> {
  adimlar: AgentStep[];
  bulgular: Finding[];
  ozetMetrikler: AjanMetrigi[];
  kararlar: AjanKarari[];
  /** Senaryoya özel çıktı (ör. üretim programı). */
  ayrinti: TAyrinti;
}

export interface AjanSenaryosu<TAyrinti = unknown> {
  id: string;
  ad: string;
  ozet: string;
  birim: string;
  ikon: string;
  kokUrl: string;
  durum: "aktif" | "planlanan";
  bolumler: AjanBolumu[];
  /** Planlanan senaryolarda tanımsızdır. */
  calistir?: () => AjanKosusu<TAyrinti>;
}
