/**
 * Holding yönetim raporunun hesabı.
 *
 * Satın alma senaryosundaki kural burada da geçerli: ekrandaki her rakam bu
 * dosyadaki aritmetikten çıkıyor, hiçbiri metin değil. Farkı önemli olan nokta,
 * sapmaların yüzdeye değil TL etkisine göre sıralanması — bir gösterge panosu
 * yüzdeye baksa sıralama başka çıkardı ve yönetimin zamanı yanlış yere giderdi.
 */

export interface Sirket {
  id: string;
  ad: string;
  sektor: string;
  /** Aylık üretim kapasitesi, ton. Enerji için 0 (tonla ölçülmüyor). */
  kapasiteTon: number;
}

export interface MaliyetKalemleri {
  hammadde: number;
  enerji: number;
  iscilik: number;
  diger: number;
}

export interface AylikKayit {
  sirketId: string;
  /** YYYY-MM. */
  ay: string;
  ciroTL: number;
  planCiroTL: number;
  maliyetTL: number;
  maliyetKalemleri: MaliyetKalemleri;
  uretimTon: number;
  kapasiteTon: number;
  kapasiteKullanimi: number;
  /** Stoğun kaç günlük maliyeti karşıladığı. */
  stokGunKapsama: number;
  stokDegeriTL: number;
}

export type SapmaTipi =
  | "marj-daralmasi"
  | "ciro-plan-alti"
  | "stok-sismesi"
  | "kapasite-dusuk";

export interface Sapma {
  tip: SapmaTipi;
  sirketId: string;
  sirketAd: string;
  baslik: string;
  /**
   * Sapmanın bu dönemdeki TL etkisi — hepsi AYLIK KÂR CİNSİNDEN, karşılaştırılabilir
   * olsun diye.
   *
   * Buradaki tek kural, farklı cinsten büyüklükleri aynı sütunda toplamamak.
   * Stok şişmesi bir bilanço kalemi: 760 milyonluk stok artışını, aylık marj
   * kaybının yanına koyup toplamak sapmaların toplamını brüt kârın %115'i gibi
   * saçma bir yere götürüyordu. Onun yerine stoğun bağladığı sermayenin AYLIK
   * FİNANSMAN MALİYETİ alınıyor; o bir akım ve marj kaybıyla aynı cinsten.
   * Aynı şekilde eksik ciro, eksik ciro kadar değil onun taşıdığı katkı payı
   * kadar zarardır.
   */
  etkiTL: number;
  /**
   * Bilanço büyüklüğü, varsa: stok şişmesinde bağlanan ek işletme sermayesi.
   * Ayrı duruyor çünkü önemli ama `etkiTL` ile toplanamaz.
   */
  bilancoTL?: number;
  /** Ölçünün şimdiki ve karşılaştırma değeri; arayüzde ikisi de gösteriliyor. */
  simdiki: number;
  referans: number;
  /**
   * Sapmanın bir alt kırılımı. Marj daralmasında hangi maliyet kaleminin ne
   * kadar katkı verdiği; sapmayı yalnızca adlandırmak yerine sebebini söylemek
   * için. Yönetimin ihtiyacı olan şey "marj düştü" değil, "marjın 4,7 puanı
   * enerjiden" cümlesi.
   */
  kirilim?: Array<{ ad: string; puan: number; tl: number }>;
  oneri: string;
}

const MALIYET_ADI: Record<keyof MaliyetKalemleri, string> = {
  hammadde: "Hammadde",
  enerji: "Enerji",
  iscilik: "İşçilik",
  diger: "Diğer",
};

/** Brüt marj, oran olarak. */
export const marj = (k: AylikKayit): number => (k.ciroTL - k.maliyetTL) / k.ciroTL;

/** Bir maliyet kaleminin ciroya oranı. */
export const kalemOrani = (k: AylikKayit, kalem: keyof MaliyetKalemleri): number =>
  k.maliyetKalemleri[kalem] / k.ciroTL;

/**
 * Eşikler. Ayrı durmalarının sebebi, müşterinin kendi eşiğini söyleyebilmesi;
 * bunlar bizim seçtiğimiz makul başlangıç değerleri, kutsal değil.
 */
export const ESIKLER = {
  /** Marj, dönem başına göre kaç puan düşerse sapma sayılır. */
  marjPuan: 1.0,
  /** Ciro planın yüzde kaçının altına inerse sapma sayılır. */
  ciroPlanOrani: 0.95,
  /** Stok gün kapsaması, dönem başına göre kaç kat artarsa sapma sayılır. */
  stokKatsayisi: 1.4,
  /** Kapasite kullanımı bu oranın altına inerse sapma sayılır. */
  kapasiteOrani: 0.85,
  /** Bağlanan işletme sermayesinin yıllık maliyeti, ticari TL kredi faizi. */
  sermayeMaliyetiYillikPct: 45,
};

/**
 * Bir şirketin dönem sapmaları.
 *
 * Karşılaştırma, kayıtların ilk ayına göre yapılıyor; tek bir önceki aya bakmak
 * mevsimsel dalgalanmayı sapma sanmaya yol açardı.
 */
export function sirketSapmalari(
  sirket: Sirket,
  kayitlar: AylikKayit[],
): Sapma[] {
  const ilk = kayitlar[0]!;
  const son = kayitlar[kayitlar.length - 1]!;
  const sapmalar: Sapma[] = [];

  // 1. Marj daralması. Etkisi, aynı ciroda kaybedilen brüt kâr.
  const marjFarkiPuan = (marj(ilk) - marj(son)) * 100;
  if (marjFarkiPuan >= ESIKLER.marjPuan) {
    // Daralmanın hangi maliyet kaleminden geldiği: her kalemin ciro içindeki
    // payının ne kadar arttığı. Toplamları marj farkını verir.
    const kirilim = (Object.keys(MALIYET_ADI) as Array<keyof MaliyetKalemleri>)
      .map((kalem) => {
        const puan = (kalemOrani(son, kalem) - kalemOrani(ilk, kalem)) * 100;
        return {
          ad: MALIYET_ADI[kalem],
          puan,
          tl: (puan / 100) * son.ciroTL,
        };
      })
      .filter((x) => Math.abs(x.puan) >= 0.05)
      .sort((a, b) => b.puan - a.puan);

    const bas = kirilim[0];
    sapmalar.push({
      tip: "marj-daralmasi",
      sirketId: sirket.id,
      sirketAd: sirket.ad,
      baslik: "Brüt marj daralıyor",
      etkiTL: (marjFarkiPuan / 100) * son.ciroTL,
      simdiki: marj(son),
      referans: marj(ilk),
      kirilim,
      oneri: bas
        ? `Daralmanın en büyük kalemi ${bas.ad.toLowerCase()}: ${bas.puan
            .toFixed(1)
            .replace(".", ",")} puan. Önce bu kalemin birim maliyetine bak.`
        : "Maliyet kalemlerini ayrı ayrı incele.",
    });
  }

  // 2. Ciro planın altında. Etkisi, eksik kalan ciro.
  const planOrani = son.ciroTL / son.planCiroTL;
  if (planOrani < ESIKLER.ciroPlanOrani) {
    // Eksik ciro, eksik ciro kadar zarar değildir: o ciro gerçekleşseydi
    // maliyeti de oluşacaktı. Kaybedilen şey üzerindeki katkı payı.
    const eksikCiro = son.planCiroTL - son.ciroTL;
    sapmalar.push({
      tip: "ciro-plan-alti",
      sirketId: sirket.id,
      sirketAd: sirket.ad,
      baslik: "Ciro planın altında",
      etkiTL: eksikCiro * marj(son),
      bilancoTL: eksikCiro,
      simdiki: son.ciroTL,
      referans: son.planCiroTL,
      oneri:
        "Sipariş defteri mi zayıf, sevkiyat mı gecikiyor? İkisinin ayrımı satış ve üretim tarafında farklı aksiyon demek.",
    });
  }

  // 3. Stok şişmesi. Etkisi, bağlanan işletme sermayesindeki artış.
  if (son.stokGunKapsama >= ilk.stokGunKapsama * ESIKLER.stokKatsayisi) {
    const ekSermaye = son.stokDegeriTL - ilk.stokDegeriTL;
    sapmalar.push({
      tip: "stok-sismesi",
      sirketId: sirket.id,
      sirketAd: sirket.ad,
      baslik: "Stok kapsaması büyüyor",
      // Aylık finansman maliyeti; bilanço artışının kendisi `bilancoTL`'de.
      etkiTL: (ekSermaye * (ESIKLER.sermayeMaliyetiYillikPct / 100)) / 12,
      bilancoTL: ekSermaye,
      simdiki: son.stokGunKapsama,
      referans: ilk.stokGunKapsama,
      oneri:
        "Artış hangi üründe? Talep tahmini mi şaştı, yoksa üretim siparişten bağımsız mı çalışıyor?",
    });
  }

  // 4. Kapasite kullanımı düşük. Etkisi, boşta kalan kapasitenin taşıdığı
  //    katkı payı — üretilmeyen tonun brüt kârı.
  if (sirket.kapasiteTon > 0 && son.kapasiteKullanimi < ESIKLER.kapasiteOrani) {
    const bostaTon = son.kapasiteTon - son.uretimTon;
    const tonBasinaKatki =
      son.uretimTon > 0 ? ((son.ciroTL - son.maliyetTL) / son.uretimTon) : 0;
    sapmalar.push({
      tip: "kapasite-dusuk",
      sirketId: sirket.id,
      sirketAd: sirket.ad,
      baslik: "Kapasite kullanımı düşük",
      etkiTL: bostaTon * tonBasinaKatki,
      simdiki: son.kapasiteKullanimi,
      referans: ESIKLER.kapasiteOrani,
      oneri:
        "Boşta kalan kapasite talep yetersizliğinden mi, duruştan mı? Üretim kaybı senaryosu bu ayrımı açıyor.",
    });
  }

  return sapmalar;
}

/** Holding toplamı, bir dönem için. */
export function holdingToplami(kayitlar: AylikKayit[]): {
  ciroTL: number;
  maliyetTL: number;
  brutKarTL: number;
  marj: number;
  stokDegeriTL: number;
} {
  const ciroTL = kayitlar.reduce((t, k) => t + k.ciroTL, 0);
  const maliyetTL = kayitlar.reduce((t, k) => t + k.maliyetTL, 0);
  const stokDegeriTL = kayitlar.reduce((t, k) => t + k.stokDegeriTL, 0);
  return {
    ciroTL,
    maliyetTL,
    brutKarTL: ciroTL - maliyetTL,
    marj: (ciroTL - maliyetTL) / ciroTL,
    stokDegeriTL,
  };
}
