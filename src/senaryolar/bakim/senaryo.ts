import {
  DONEM_SONU,
  GUNLER,
  GUNLUK_KAYITLAR,
  NISASTA_FIYAT_TL_TON,
  PROSES_ADIMLARI,
  VARDIYA_NOTLARI,
} from "@/data/bakim";
import { egilim, kaybiCozumle, type KayipAnalizi } from "@/lib/bakim";
import type {
  AgentStep,
  AjanKosusu,
  AjanSenaryosu,
  Finding,
} from "@/lib/ajan/cekirdek";
import { tl, tlKisa, ton, yuzde } from "@/lib/bicim";

export const KOK = "/bakim";

/**
 * Duruşta kaybedilen ton başına katkı payı oranı.
 *
 * Randıman kaybı ile duruş kaybı aynı fiyattan değerlenemez. Randımanda mısır
 * satın alınmış ve işlenmiştir; para ödenmiş, nişasta çıkmamıştır, yani kayıp
 * satış değerinin tamamıdır. Duruşta ise mısır hiç işlenmemiştir; o mısır
 * duruyor ve yarın işlenecek, kaybedilen yalnızca o tonajın taşıdığı katkı
 * payıdır. İkisini aynı fiyattan saymak duruşu olduğundan üç kat büyük
 * gösteriyordu.
 */
const DURUS_KATKI_ORANI = 0.3;

export type BakimBulguTipi =
  | "randiman-farki"
  | "adim-kaybi"
  | "bozulma-egilimi"
  | "not-dogrulamasi"
  | "durus";

export interface BakimCiktisi {
  analiz: KayipAnalizi;
  /** Aylığa ve yıla ölçeklenmiş kayıp; dönem 14 gün. */
  aylikKayipTL: number;
  yillikKayipTL: number;
  basEgilim: ReturnType<typeof egilim>;
  /** Baş adımı doğrulayan, dönem öncesinden gelen not — varsa. */
  erkenNot: (typeof VARDIYA_NOTLARI)[number] | undefined;
}

export function bakimiCalistir(): BakimCiktisi {
  const analiz = kaybiCozumle(
    GUNLUK_KAYITLAR,
    PROSES_ADIMLARI,
    VARDIYA_NOTLARI,
    NISASTA_FIYAT_TL_TON,
  );
  const gunSayisi = GUNLER.length;
  const gunlukKayip = analiz.kayipTL / gunSayisi;

  // Baş adımı doğrulayan notların en eskisi; dönemden önceye gidiyorsa asıl
  // bulgu odur — sorun kayıtlarda dönem başlamadan önce görünmüş demektir.
  const erkenNot = [...analiz.basAdim.notlar].sort((a, b) =>
    a.gun.localeCompare(b.gun),
  )[0];

  return {
    analiz,
    aylikKayipTL: gunlukKayip * 30,
    yillikKayipTL: gunlukKayip * 330, // yılda ~330 gün üretim
    basEgilim: egilim(GUNLUK_KAYITLAR, analiz.basAdim.adimId),
    erkenNot,
  };
}

function adimlariYaz(c: BakimCiktisi): AgentStep[] {
  const { analiz, basEgilim, erkenNot } = c;
  const bas = analiz.basAdim;

  return [
    {
      baslik: "Dönem girdisi okundu",
      detay: `${GUNLER.length} günde ${ton(
        analiz.islenenMisirTon,
      )} mısır işlendi. Her gün için nem ve kuru maddedeki nişasta oranı laboratuvar kaydından alındı.`,
    },
    {
      baslik: "Teorik üretim hesaplandı",
      detay: `Girenden çıkması gereken nişasta ${ton(
        analiz.teorikTon,
      )}. Referans değirmen verimi ${yuzde(
        analiz.referansVerim,
        1,
      )}; bu, proses adımlarının tasarım verimlerinin çarpımı.`,
    },
    {
      baslik: "Gerçekleşen üretimle karşılaştırıldı",
      detay: `Fiilen üretilen ${ton(analiz.gercekTon)}. Fark ${ton(
        analiz.kayipTon,
      )}, teorik üretimin ${yuzde(analiz.kayipOrani, 1)} kadarı. Gerçekleşen verim ${yuzde(
        analiz.gerceklesenVerim,
        1,
      )}.`,
    },
    {
      baslik: "Kayıp proses adımlarına dağıtıldı",
      detay: `Adım verimlerinin logaritmik ayrıştırmasıyla: ${analiz.adimlar
        .filter((a) => a.pay >= 0.01)
        .map((a) => `${a.adimAd.toLowerCase()} ${yuzde(a.pay, 0)}`)
        .join(", ")}. Payların toplamı tam olarak ${yuzde(
        analiz.adimlar.reduce((t, a) => t + a.pay, 0),
        0,
      )}; "diğer" kalemi yok, tablo elle toplanıp tutturulabilir.`,
    },
    {
      baslik: "Eğilim kontrol edildi",
      detay: basEgilim.bozuluyor
        ? `${bas.adimAd} verimi dönem başında ${yuzde(
            basEgilim.bas,
            1,
          )} iken sonunda ${yuzde(
            basEgilim.son,
            1,
          )}. Sabit bir düşüklük değil, gitgide bozulan bir eğilim; bu, ayar değil aşınan bir parça demek ve aciliyeti başkadır.`
        : `${bas.adimAd} verimi dönem boyunca sabit kaldı. Kayıp var ama bozulma yok; bu bir ayar meselesine benziyor.`,
    },
    {
      baslik: "Vardiya notları okundu",
      detay: erkenNot
        ? `${VARDIYA_NOTLARI.length} not tarandı. ${erkenNot.gun} tarihli ${erkenNot.vardiya} vardiyası kaydı ölçümlerin işaret ettiği yeri doğruluyor: "${erkenNot.metin}" Bu not, dönem başlamadan önceye ait — sorun kayıtlarda zaten görünmüş, kimse ölçümle birleştirmemiş.`
        : `${VARDIYA_NOTLARI.length} not tarandı; ölçümlerin işaret ettiği adımı doğrulayan bir kayıt bulunamadı.`,
    },
    {
      baslik: "İş kalemi oluşturuldu",
      detay: `${bas.adimAd} için ${tlKisa(
        bas.kayipTL,
      )} dönem etkisiyle iş kalemi açıldı. Aynı hızda devam ederse aylık ${tlKisa(
        c.aylikKayipTL * bas.pay,
      )}.`,
    },
  ];
}

function bulgulariYaz(c: BakimCiktisi): Finding<BakimBulguTipi>[] {
  const { analiz, basEgilim, erkenNot } = c;
  const bas = analiz.basAdim;
  const bulgular: Finding<BakimBulguTipi>[] = [];

  bulgular.push({
    id: "randiman-farki",
    tip: "randiman-farki",
    seviye: analiz.kayipOrani > 0.015 ? "kritik" : "uyari",
    baslik: "Teorik ve gerçekleşen randıman arasında fark var",
    detay: `${GUNLER.length} günde giren mısırdan ${ton(
      analiz.teorikTon,
    )} nişasta çıkması gerekirken ${ton(analiz.gercekTon)} çıktı. Fark ${ton(
      analiz.kayipTon,
    )} — teorik üretimin ${yuzde(analiz.kayipOrani, 1)} kadarı. Gerçekleşen verim ${yuzde(
      analiz.gerceklesenVerim,
      1,
    )}, referans ${yuzde(analiz.referansVerim, 1)}.`,
    etkiTL: analiz.kayipTL,
    etkiTipi: "maliyet",
    etkiEtiketi: "Dönemde oluşan kayıp",
    oneri: `Kaybın ${yuzde(bas.pay, 0)} kadarı ${bas.adimAd.toLowerCase()} adımında. Önce oraya bak.`,
  });

  bulgular.push({
    id: `adim-${bas.adimId}`,
    tip: "adim-kaybi",
    seviye: "kritik",
    baslik: `Kaybın büyük kısmı ${bas.adimAd.toLowerCase()} adımında`,
    detay: `${bas.adimAd} verimi dönem ortalamasında ${yuzde(
      bas.olculen,
      1,
    )}, referansı ${yuzde(bas.referans, 1)}. Bu adım tek başına ${ton(
      bas.kayipTon,
    )} nişasta, yani toplam kaybın ${yuzde(bas.pay, 0)} kadarı. Diğer adımlar: ${analiz.adimlar
      .slice(1)
      .map((a) => `${a.adimAd.toLowerCase()} ${yuzde(a.pay, 0)}`)
      .join(", ")}.`,
    etkiTL: bas.kayipTL,
    etkiTipi: "maliyet",
    etkiEtiketi: "Bu adımın dönem kaybı",
    baglam: { adimId: bas.adimId },
    oneri: `${bas.adimAd} ekipmanının bakım kaydını aç ve devir, besleme ve katı madde ölçümlerini referansla karşılaştır.`,
  });

  if (basEgilim.bozuluyor) {
    bulgular.push({
      id: "bozulma-egilimi",
      tip: "bozulma-egilimi",
      seviye: "kritik",
      baslik: `${bas.adimAd} verimi dönem boyunca bozuluyor`,
      detay: `Dönem başında ${yuzde(basEgilim.bas, 1)}, sonunda ${yuzde(
        basEgilim.son,
        1,
      )}. Sabit bir sapma olsaydı ayar meselesi olurdu; düşerek giden bir eğilim aşınan bir parçaya işaret eder ve müdahale edilmezse kayıp büyümeye devam eder. Aynı eğim sürerse aylık kayıp ${tlKisa(
        c.aylikKayipTL * bas.pay,
      )}, yıllık ${tlKisa(c.yillikKayipTL * bas.pay)}.`,
      etkiTL: c.aylikKayipTL * bas.pay,
      etkiTipi: "risk",
      etkiEtiketi: "Müdahale edilmezse aylık kayıp",
      baglam: { adimId: bas.adimId },
      oneri:
        "Bakım planına acil iş olarak al; eğilim sürüyorsa beklemek her gün para kaybettiriyor.",
    });
  }

  if (erkenNot) {
    bulgular.push({
      id: "not-dogrulamasi",
      tip: "not-dogrulamasi",
      seviye: "uyari",
      baslik: "Vardiya notu, ölçümlerin işaret ettiği yeri doğruluyor",
      detay: `${erkenNot.gun} tarihli ${erkenNot.vardiya} vardiyası: "${erkenNot.metin}" Bu kayıt dönem başlamadan önceye ait. Ölçümler ve not ayrı ayrı duruyordu; ikisi birleşince ${bas.adimAd.toLowerCase()} adımındaki kayıp tesadüf olmaktan çıkıyor.`,
      etkiTL: 0,
      etkiTipi: "risk",
      etkiEtiketi: "Doğrulama, ayrı bir maliyeti yok",
      oneri:
        "Açılmış bakım formunun neden kapanmadığını sor; sorun üç haftadır kayıtlarda duruyor.",
    });
  }

  if (analiz.toplamDurusSaat > 0) {
    // Duruş, randıman kaybından ayrı bir şey: o tonaj hiç üretilmedi, işlenen
    // mısırdan kaybedilmedi. İkisini toplamak çift sayma olurdu.
    bulgular.push({
      id: "durus",
      tip: "durus",
      seviye: "bilgi",
      baslik: "Plansız duruşlar",
      detay: `Dönemde toplam ${analiz.toplamDurusSaat
        .toFixed(1)
        .replace(".", ",")} saat plansız duruş var. Randıman kaybından ayrı bir kalem ve ayrı fiyatlanır: randımanda mısır satın alınıp işlendi, para ödendi ve nişasta çıkmadı, o yüzden kayıp satış değerinin tamamı. Duruşta mısır hiç işlenmedi, duruyor ve yarın işlenecek; kaybedilen yalnızca o tonajın taşıdığı katkı payı (${yuzde(
        DURUS_KATKI_ORANI,
        0,
      )}). İkisi toplanmaz.`,
      etkiTL:
        (analiz.toplamDurusSaat / (GUNLER.length * 24)) *
        analiz.gercekTon *
        NISASTA_FIYAT_TL_TON *
        DURUS_KATKI_ORANI,
      etkiTipi: "risk",
      etkiEtiketi: "Duruşta kaybedilen katkı payı",
      oneri:
        "Duruş sebeplerini ayrı izle; kapasite kullanımı holding raporunda ayrıca görünüyor.",
    });
  }

  return bulgular;
}

export const bakimKosusu = (): AjanKosusu<BakimCiktisi> => {
  const c = bakimiCalistir();
  const { analiz, basEgilim } = c;
  const bas = analiz.basAdim;

  return {
    adimlar: adimlariYaz(c),
    bulgular: bulgulariYaz(c),
    ayrinti: c,
    // Randıman kaybı tam değerinden (mısır alındı ve işlendi), duruş yalnızca
    // katkı payından ölçülüyor. Farklı taban, dolayısıyla toplanmıyor; kart da
    // ekranın manşetiyle aynı rakamı gösteriyor.
    vitrin: { tutar: analiz.kayipTL, etiket: "randıman kaybı" },
    ozetMetrikler: [
      {
        etiket: "Teorik – gerçekleşen fark",
        deger: ton(analiz.kayipTon),
        aciklama: `${ton(analiz.teorikTon)} beklenen, ${ton(
          analiz.gercekTon,
        )} gerçekleşen`,
        yon: "kotu",
      },
      {
        etiket: "Dönemde oluşan kayıp",
        deger: tlKisa(analiz.kayipTL),
        aciklama: `${GUNLER.length} gün · ton başına ${tl(NISASTA_FIYAT_TL_TON)}`,
        yon: "kotu",
      },
      {
        etiket: "En büyük pay",
        deger: `${bas.adimAd} ${yuzde(bas.pay, 0)}`,
        aciklama: `Verim ${yuzde(bas.olculen, 1)}, referans ${yuzde(bas.referans, 1)}`,
        yon: "kotu",
      },
      {
        etiket: "Müdahale edilmezse yıllık",
        deger: tlKisa(c.yillikKayipTL * bas.pay),
        aciklama: "Yalnızca bu adım, aynı eğim sürerse; ~330 üretim günü",
        yon: "notr",
      },
    ],
    kararlar: [
      {
        id: "is-kalemi",
        baslik: `${bas.adimAd} için ne yapılsın?`,
        aciklama: basEgilim.bozuluyor
          ? `Verim düşerek gidiyor, yani beklemek her gün pahalıya geliyor. Ajan üç seçeneği de fiyatladı.`
          : `Verim sabit düşük. Duruş maliyeti ile kayıp arasındaki denge kararı belirliyor.`,
        secenekler: [
          {
            id: "acil",
            etiket: "Acil bakıma al",
            ozet: `Kayıp durur. Planlı duruş gerekir; günlük kayıp ${tlKisa(
              (c.aylikKayipTL * bas.pay) / 30,
            )}.`,
          },
          {
            id: "planli",
            etiket: "Planlı bakıma ekle",
            ozet: `Bir sonraki duruşa kadar bekler. Eğilim sürerse aradaki her gün ${tlKisa(
              (c.aylikKayipTL * bas.pay) / 30,
            )} ekler.`,
          },
          {
            id: "izle",
            etiket: "Bir hafta daha izle",
            ozet:
              "Ölçüm doğrulanır ama kayıp devam eder. Vardiya notu üç haftadır sorunu söylüyor olduğu için gerekçesi zayıf.",
          },
        ],
        onerilen: basEgilim.bozuluyor ? "acil" : "planli",
      },
    ],
  };
};

export const bakimSenaryosu: AjanSenaryosu<BakimCiktisi> = {
  id: "bakim",
  ad: "Üretim Kaybı ve Hat Uyarısı",
  kisaAd: "Üretim Kaybı",
  ozet:
    "Giren mısırdan çıkması gereken nişasta ile fiilen çıkanı karşılaştırır, farkı proses adımlarına dağıtır, vardiya notlarıyla çapraz kontrol eder ve iş kalemi açar.",
  birim: "Nişasta Fabrikası",
  ikon: "ÜK",
  kokUrl: KOK,
  durum: "aktif",
  bolumler: [
    { ad: "Kontrol kulesi", href: KOK },
    { ad: "Günlük kayıtlar", href: `${KOK}/kayitlar` },
    { ad: "İş kalemi", href: `${KOK}/is-kalemi` },
  ],
  calistir: bakimKosusu,
};

export { DONEM_SONU };
