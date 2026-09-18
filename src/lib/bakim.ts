/**
 * Üretim kaybı senaryosunun hesabı.
 *
 * Soru basit: giren mısırdan çıkması gereken nişasta ile fiilen çıkan arasındaki
 * fark nerede kayboluyor? Fark bugün kimsenin tek bir rakamı değil; separatör
 * okumasına, kurutucu sıcaklığına, vardiya notuna dağılmış durumda.
 *
 * Buradaki ayrıştırma logaritmik ve tam: adım verimlerinin çarpımı toplam verimi
 * verdiği için, log'ların toplamı da toplam kaybı verir. Yani payların toplamı
 * her zaman %100 eder — yuvarlama artığı ya da "diğer" kalemi yok. Üretim
 * müdürünün tabloyu elle toplayıp tutturabilmesi bu yüzden önemli.
 */

export interface ProsesAdimi {
  id: string;
  ad: string;
  /** Adımın tasarım verimi; sapma buna göre ölçülüyor. */
  referans: number;
  birim: string;
}

export interface GunlukKayit {
  gun: string;
  islenenMisirTon: number;
  nemPct: number;
  /** Kuru maddedeki nişasta oranı, laboratuvar ölçümü. */
  nisastaPctKuru: number;
  /** Her proses adımının o günkü ölçülen verimi. */
  adimVerimleri: Record<string, number>;
  uretilenNisastaTon: number;
  durusSaat: number;
}

export interface VardiyaNotu {
  gun: string;
  vardiya: string;
  metin: string;
}

export interface AdimKaybi {
  adimId: string;
  adimAd: string;
  referans: number;
  /** Dönem boyunca ölçülen ortalama verim. */
  olculen: number;
  /** Bu adımın toplam kayıptaki payı, oran. */
  pay: number;
  kayipTon: number;
  kayipTL: number;
  /** Bu adımı doğrulayan vardiya notları. */
  notlar: VardiyaNotu[];
}

export interface KayipAnalizi {
  teorikTon: number;
  gercekTon: number;
  kayipTon: number;
  /** Kaybın teorik üretime oranı. */
  kayipOrani: number;
  kayipTL: number;
  referansVerim: number;
  gerceklesenVerim: number;
  adimlar: AdimKaybi[];
  /** Kaybın en büyük payını taşıyan adım. */
  basAdim: AdimKaybi;
  toplamDurusSaat: number;
  islenenMisirTon: number;
}

/**
 * Bir günde mevcut olan nişasta: natürel tonajdan su düşülür, kalan kuru
 * maddeden laboratuvarın ölçtüğü oran alınır. Satın alma senaryosundaki kütle
 * dengesinin aynısı; fabrikanın ölçtüğü şey her iki tarafta da aynı olmalı.
 */
export const mevcutNisastaTon = (k: GunlukKayit): number =>
  k.islenenMisirTon * (1 - k.nemPct / 100) * (k.nisastaPctKuru / 100);

/** Adım verimlerinin çarpımı: o günün fiilen gerçekleşen değirmen verimi. */
export const gunlukVerim = (
  k: GunlukKayit,
  adimlar: ProsesAdimi[],
): number => adimlar.reduce((c, a) => c * (k.adimVerimleri[a.id] ?? 1), 1);

/**
 * Bir vardiya notunun hangi proses adımını ilgilendirdiği.
 *
 * Anahtar kelimeyle eşleşiyor; basit ama demoda dürüst olan yol bu. Gerçek
 * kurulumda burada bir dil modeli olurdu ve notu okuyup adımı kendisi
 * söylerdi — arayüz hangi yöntemin çalıştığını gizlememeli.
 */
const ADIM_ANAHTARLARI: Record<string, string[]> = {
  islatma: ["islatma", "ıslatma", "so2", "tank", "çözünme"],
  ogutme: ["öğüt", "ogut", "değirmen", "elek", "kırıcı"],
  ayirma: ["separatör", "separator", "ayırma", "gluten", "siklon", "devir", "tambur"],
  kurutma: ["kurutucu", "kurutma", "fan", "sıcaklık", "buhar"],
};

export function notlariEslestir(
  adimId: string,
  notlar: VardiyaNotu[],
): VardiyaNotu[] {
  const anahtarlar = ADIM_ANAHTARLARI[adimId] ?? [];
  return notlar.filter((n) => {
    const metin = n.metin.toLocaleLowerCase("tr-TR");
    return anahtarlar.some((a) => metin.includes(a));
  });
}

/**
 * Dönemin kayıp analizi.
 *
 * Adım payları log ayrıştırmasıyla bulunuyor: toplam verim adım verimlerinin
 * çarpımı olduğu için ln(referans/ölçülen) toplamı, toplam kaybın logaritmasına
 * eşit. Payların toplamı tam olarak 1 eder.
 */
export function kaybiCozumle(
  kayitlar: GunlukKayit[],
  adimlar: ProsesAdimi[],
  notlar: VardiyaNotu[],
  nisastaFiyatTlTon: number,
): KayipAnalizi {
  const referansVerim = adimlar.reduce((c, a) => c * a.referans, 1);

  const mevcutToplam = kayitlar.reduce((t, k) => t + mevcutNisastaTon(k), 0);
  const teorikTon = mevcutToplam * referansVerim;
  const gercekTon = kayitlar.reduce((t, k) => t + k.uretilenNisastaTon, 0);
  const kayipTon = teorikTon - gercekTon;

  // Her adım için dönem boyunca biriken log sapması.
  const logSapmalar = adimlar.map((a) => {
    const toplamLog = kayitlar.reduce(
      (t, k) => t + Math.log(a.referans / (k.adimVerimleri[a.id] ?? a.referans)),
      0,
    );
    const olculen =
      kayitlar.reduce((t, k) => t + (k.adimVerimleri[a.id] ?? a.referans), 0) /
      kayitlar.length;
    return { adim: a, toplamLog: Math.max(0, toplamLog), olculen };
  });

  const logToplam = logSapmalar.reduce((t, x) => t + x.toplamLog, 0);

  const adimKayiplari: AdimKaybi[] = logSapmalar
    .map(({ adim, toplamLog, olculen }) => {
      const pay = logToplam > 0 ? toplamLog / logToplam : 0;
      return {
        adimId: adim.id,
        adimAd: adim.ad,
        referans: adim.referans,
        olculen,
        pay,
        kayipTon: pay * kayipTon,
        kayipTL: pay * kayipTon * nisastaFiyatTlTon,
        notlar: notlariEslestir(adim.id, notlar),
      };
    })
    .sort((a, b) => b.pay - a.pay);

  return {
    teorikTon,
    gercekTon,
    kayipTon,
    kayipOrani: kayipTon / teorikTon,
    kayipTL: kayipTon * nisastaFiyatTlTon,
    referansVerim,
    gerceklesenVerim: gercekTon / mevcutToplam,
    adimlar: adimKayiplari,
    basAdim: adimKayiplari[0]!,
    toplamDurusSaat: kayitlar.reduce((t, k) => t + k.durusSaat, 0),
    islenenMisirTon: kayitlar.reduce((t, k) => t + k.islenenMisirTon, 0),
  };
}

/**
 * Bir adımın veriminin dönem içinde bozulup bozulmadığı.
 *
 * İlk ve son üç günün ortalaması karşılaştırılıyor. Sabit bir düşüklük ile
 * gitgide kötüleşen bir eğilim farklı şeyler: ilki ayarla, ikincisi aşınan bir
 * parçayla ilgilidir ve aciliyeti başkadır.
 */
export function egilim(
  kayitlar: GunlukKayit[],
  adimId: string,
): { bas: number; son: number; bozuluyor: boolean } {
  const n = Math.min(3, Math.floor(kayitlar.length / 2));
  const ort = (dilim: GunlukKayit[]) =>
    dilim.reduce((t, k) => t + (k.adimVerimleri[adimId] ?? 0), 0) / dilim.length;
  const bas = ort(kayitlar.slice(0, n));
  const son = ort(kayitlar.slice(-n));
  return { bas, son, bozuluyor: son < bas - 0.002 };
}
