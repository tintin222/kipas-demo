import {
  AYLAR,
  DONEM,
  KAYITLAR,
  SIRKETLER,
  sirketKayitlari,
} from "@/data/raporlama";
import {
  ESIKLER,
  holdingToplami,
  marj,
  sirketSapmalari,
  type AylikKayit,
  type Sapma,
} from "@/lib/raporlama";
import type {
  AgentStep,
  AjanKosusu,
  AjanSenaryosu,
  Finding,
} from "@/lib/ajan/cekirdek";
import { tl, tlKisa, ton, yuzde } from "@/lib/bicim";

export const KOK = "/raporlama";

export type RaporlamaBulguTipi =
  | "marj-daralmasi"
  | "ciro-plan-alti"
  | "stok-sismesi"
  | "kapasite-dusuk";

export interface RaporlamaCiktisi {
  donem: string;
  /** Bütün şirketlerin sapmaları, TL etkisine göre sıralı. */
  sapmalar: Sapma[];
  donemKayitlari: AylikKayit[];
  ilkDonemKayitlari: AylikKayit[];
  toplam: ReturnType<typeof holdingToplami>;
  oncekiToplam: ReturnType<typeof holdingToplami>;
  /** Yönetim kuruluna yazılan özet, paragraflar hâlinde. */
  ozet: string[];
}

const ayAdi = (iso: string): string => {
  const AYLAR_TR = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const [yil, ay] = iso.split("-");
  return `${AYLAR_TR[Number(ay) - 1]} ${yil}`;
};

export function raporuCalistir(): RaporlamaCiktisi {
  const donemKayitlari = KAYITLAR.filter((k) => k.ay === DONEM);
  const ilkDonemKayitlari = KAYITLAR.filter((k) => k.ay === AYLAR[0]);

  // Sıralama iki kademeli. Önce fiilen oluşan kayıplar, sonra fırsat maliyetleri:
  // boşta kalan kapasite, talep bulunsaydı kazanılacak katkı payıdır ve bu ay
  // kimsenin cebinden çıkmamıştır. Tek anahtarla TL'ye göre sıralamak, özette
  // "ayrı tutuldu" denen kalemi listenin başına ve ajanın önerisine taşıyordu;
  // ekranın kendi kendisiyle çelişmesi demekti.
  const firsatMi = (s: Sapma) => (s.tip === "kapasite-dusuk" ? 1 : 0);
  const sapmalar = SIRKETLER.flatMap((s) =>
    sirketSapmalari(s, sirketKayitlari(s.id)),
  ).sort((a, b) => firsatMi(a) - firsatMi(b) || b.etkiTL - a.etkiTL);

  const toplam = holdingToplami(donemKayitlari);
  const oncekiToplam = holdingToplami(ilkDonemKayitlari);

  return {
    donem: DONEM,
    sapmalar,
    donemKayitlari,
    ilkDonemKayitlari,
    toplam,
    oncekiToplam,
    ozet: ozetYaz(DONEM, sapmalar, toplam, oncekiToplam),
  };
}

/**
 * Yönetim kurulu özeti.
 *
 * Metin rakamlardan üretiliyor; şablona sayı yerleştirmek yerine sapmaların
 * kendisi cümleyi belirliyor. Sapma yoksa özet de onu söylüyor — "her şey yolunda"
 * demek de bir bilgidir, uydurma bir endişe üretmekten iyidir.
 */
function ozetYaz(
  donem: string,
  sapmalar: Sapma[],
  toplam: ReturnType<typeof holdingToplami>,
  onceki: ReturnType<typeof holdingToplami>,
): string[] {
  const marjFarki = (toplam.marj - onceki.marj) * 100;
  const paragraflar: string[] = [];

  paragraflar.push(
    `${ayAdi(donem)} döneminde holding cirosu ${tlKisa(
      toplam.ciroTL,
    )}, brüt kâr ${tlKisa(toplam.brutKarTL)} ve brüt marj ${yuzde(
      toplam.marj,
      1,
    )} olarak gerçekleşti. Dönem başına göre marj ${Math.abs(marjFarki)
      .toFixed(1)
      .replace(".", ",")} puan ${marjFarki < 0 ? "daraldı" : "genişledi"}.`,
  );

  if (sapmalar.length === 0) {
    paragraflar.push(
      "Tanımlı eşiklerin dışına çıkan bir sapma yok. Şirketlerin tamamı marj, ciro, stok ve kapasite ölçütlerinde bant içinde kaldı.",
    );
    return paragraflar;
  }

  const bas = sapmalar[0]!;
  const basKirilim = bas.kirilim?.[0];
  paragraflar.push(
    `Fiilen oluşan sapmaların en büyüğü ${bas.sirketAd}: ${bas.baslik.toLowerCase()}, ${tlKisa(
      bas.etkiTL,
    )} etki.` +
      (basKirilim
        ? ` Daralmanın ${basKirilim.puan.toFixed(1).replace(".", ",")} puanı ${basKirilim.ad.toLowerCase()} kaleminden geliyor; bu tek başına ${tlKisa(
            basKirilim.tl,
          )} demek. Marj daralmasını genel bir maliyet baskısı olarak okumak yanlış olur, sebep tek bir kalemde toplanıyor.`
        : ""),
  );

  const digerleri = sapmalar.slice(1, 4);
  if (digerleri.length > 0) {
    paragraflar.push(
      `Sırada ${digerleri
        .map((s) => `${s.sirketAd} (${s.baslik.toLowerCase()}, ${tlKisa(s.etkiTL)})`)
        .join(", ")} geliyor.`,
    );
  }

  const olusan = sapmalar
    .filter((s) => s.tip !== "kapasite-dusuk")
    .reduce((t, s) => t + s.etkiTL, 0);
  const firsat = sapmalar
    .filter((s) => s.tip === "kapasite-dusuk")
    .reduce((t, s) => t + s.etkiTL, 0);
  const bilanco = sapmalar.reduce((t, s) => t + (s.bilancoTL ?? 0), 0);

  paragraflar.push(
    `Fiilen oluşan sapmaların aylık kâr etkisi ${tlKisa(
      olusan,
    )}; dönem brüt kârının ${yuzde(olusan / toplam.brutKarTL, 0)} kadarı. ` +
      (firsat > 0
        ? `Boşta kalan kapasitenin taşıdığı ${tlKisa(
            firsat,
          )} ayrı tutuldu: o gerçekleşmiş bir kayıp değil, talep bulunsaydı kazanılacak katkı payıdır. `
        : "") +
      (bilanco > 0
        ? `Bilanço tarafında ${tlKisa(
            bilanco,
          )} ek bağlanan işletme sermayesi var; aylık kâr etkisi içinde yalnızca bunun finansman maliyeti sayılıyor, tutarın kendisi değil.`
        : ""),
  );

  return paragraflar;
}

function adimlariYaz(c: RaporlamaCiktisi): AgentStep[] {
  const bas = c.sapmalar[0];
  // Alt kırılım yalnızca marj daralmasında tanımlı; "indim ama kırılım yok"
  // demek yerine kırılımı olan en büyük sapma seçiliyor.
  const kirilimli = c.sapmalar.find((s) => s.kirilim && s.kirilim.length > 0);
  const basKirilim = kirilimli?.kirilim?.[0];

  return [
    {
      baslik: "Şirket verileri toplandı",
      detay: `${SIRKETLER.length} şirketin ${AYLAR.length} dönemlik ciro, maliyet, üretim ve stok verisi okundu. ${ayAdi(
        c.donem,
      )} dönemi raporlanıyor.`,
    },
    {
      baslik: "Holding toplamı çıkarıldı",
      detay: `Ciro ${tlKisa(c.toplam.ciroTL)}, brüt kâr ${tlKisa(
        c.toplam.brutKarTL,
      )}, marj ${yuzde(c.toplam.marj, 1)}. Dönem başında marj ${yuzde(
        c.oncekiToplam.marj,
        1,
      )} idi.`,
    },
    {
      baslik: "Eşikler uygulandı",
      detay: `Marj ${ESIKLER.marjPuan.toFixed(1).replace(".", ",")} puan daralma, ciro planın %${
        ESIKLER.ciroPlanOrani * 100
      }'inin altı, stok kapsamasının ${ESIKLER.stokKatsayisi
        .toFixed(1)
        .replace(".", ",")} katına çıkması ve kapasite kullanımının %${
        ESIKLER.kapasiteOrani * 100
      }'in altı sapma sayıldı. ${c.sapmalar.length} sapma bulundu.`,
    },
    {
      baslik: "Aynı cinse çevrilip sıralandı",
      detay:
        "Sıralama yüzdeye değil TL etkisine göre yapıldı; aynı puanlık marj daralması büyük ciroda çok daha fazla para demek. Kalemler önce aynı cinse getirildi: eksik ciro, tutarı kadar değil taşıdığı katkı payı kadar; stok şişmesi, bilanço tutarı kadar değil bağladığı sermayenin aylık finansman maliyeti kadar sayıldı. Aksi hâlde bir bilanço kalemi aylık kâr kalemlerinin yanında olduğundan büyük görünür.",
    },
    {
      baslik: "Marj daralmaları bir alt kırılıma inildi",
      detay:
        kirilimli && basKirilim
          ? `${kirilimli.sirketAd}: ${kirilimli
              .kirilim!.filter((k) => k.puan > 0.1)
              .map((k) => `${k.ad.toLowerCase()} ${k.puan.toFixed(1).replace(".", ",")} puan`)
              .join(", ")}. Daralmanın sebebi genel bir maliyet baskısı değil, ${basKirilim.ad.toLowerCase()} kaleminde toplanıyor.`
          : "Marj daralması eşiği aşan şirket olmadığı için alt kırılıma gerek kalmadı.",
    },
    {
      baslik: "Yönetim özeti yazıldı",
      detay: `${c.ozet.length} paragraflık özet yazıldı ve ${c.sapmalar.length} sapmanın ilk üçü yönetim kararına taşındı. Özetin içindeki her rakam bu adımlarda hesaplandı.`,
    },
  ];
}

const SEVIYE = (
  etkiTL: number,
  brutKar: number,
  firsatMaliyeti: boolean,
): "kritik" | "uyari" | "bilgi" => {
  const seviye =
    etkiTL > brutKar * 0.04 ? "kritik" : etkiTL > brutKar * 0.015 ? "uyari" : "bilgi";
  // Fırsat maliyeti hiçbir büyüklükte "kritik" olmaz: bu ay kimsenin cebinden
  // çıkmış bir para değil. Kırmızı rozet, gerçekleşmiş kayıplara ait.
  return firsatMaliyeti && seviye === "kritik" ? "uyari" : seviye;
};

function bulgulariYaz(c: RaporlamaCiktisi): Finding<RaporlamaBulguTipi>[] {
  return c.sapmalar.map((s) => {
    const kirilimMetni = s.kirilim
      ?.filter((k) => Math.abs(k.puan) >= 0.1)
      .map(
        (k) =>
          `${k.ad.toLowerCase()} ${k.puan > 0 ? "+" : ""}${k.puan
            .toFixed(1)
            .replace(".", ",")} puan (${tlKisa(k.tl)})`,
      )
      .join(", ");

    const detay =
      s.tip === "marj-daralmasi"
        ? `Brüt marj ${yuzde(s.referans, 1)} seviyesinden ${yuzde(
            s.simdiki,
            1,
          )} seviyesine indi. Kırılım: ${kirilimMetni}.`
        : s.tip === "ciro-plan-alti"
          ? `Dönem cirosu ${tlKisa(s.simdiki)}, plan ${tlKisa(
              s.referans,
            )}. Gerçekleşme planın ${yuzde(s.simdiki / s.referans, 0)} kadarı; ${tlKisa(
              s.bilancoTL ?? 0,
            )} ciro eksik kaldı. Kâr etkisi bunun tamamı değil, üzerindeki katkı payı.`
          : s.tip === "stok-sismesi"
            ? `Stok kapsaması ${s.referans} günden ${s.simdiki} güne çıktı; ${tlKisa(
                s.bilancoTL ?? 0,
              )} ek işletme sermayesi bağlandı. Aylık kâr etkisi, bu tutarın %${ESIKLER.sermayeMaliyetiYillikPct} yıllık faizle finansman maliyeti.`
            : `Kapasite kullanımı ${yuzde(s.simdiki, 0)}; eşik ${yuzde(
                s.referans,
                0,
              )}. Boşta kalan kapasitenin taşıdığı katkı payı ${tlKisa(s.etkiTL)}.`;

    return {
      id: `${s.tip}-${s.sirketId}`,
      tip: s.tip,
      seviye: SEVIYE(s.etkiTL, c.toplam.brutKarTL, s.tip === "kapasite-dusuk"),
      baslik: `${s.sirketAd}: ${s.baslik.toLowerCase()}`,
      detay,
      etkiTL: s.etkiTL,
      etkiTipi: s.tip === "stok-sismesi" ? "maliyet" : "risk",
      // Etiket, yanındaki tutarın TAM OLARAK ne olduğunu söylemeli. Önceki
      // hâli ciro sapmasına "plana göre eksik ciro", stok sapmasına "ek
      // bağlanan işletme sermayesi" diyordu; oysa `etkiTL` ikisinde de o
      // büyüklük değil, onun aylık kâr karşılığı. Ekranda 364 mn TL eksik
      // cironun yanında 60,8 mn TL yazıyordu ve etiket yanlıştı.
      etkiEtiketi:
        s.tip === "marj-daralmasi"
          ? "Dönemde kaybedilen brüt kâr"
          : s.tip === "ciro-plan-alti"
            ? "Eksik cironun taşıdığı katkı payı"
            : s.tip === "stok-sismesi"
              ? "Bağlanan sermayenin aylık finansman maliyeti"
              : "Boşta kalan kapasitenin katkı payı",
      baglam: { sirketId: s.sirketId, donem: c.donem },
      oneri: s.oneri,
    };
  });
}

export const raporlamaKosusu = (): AjanKosusu<RaporlamaCiktisi> => {
  const c = raporuCalistir();
  const { toplam, oncekiToplam, sapmalar } = c;
  const marjFarki = (toplam.marj - oncekiToplam.marj) * 100;
  const bas = sapmalar[0];

  return {
    adimlar: adimlariYaz(c),
    bulgular: bulgulariYaz(c),
    ayrinti: c,
    // Ekrandaki "oluşan aylık kâr etkisi" ile aynı hesap: boşta kalan kapasite
    // fırsat maliyeti, gerçekleşmiş kayıp değil, o yüzden dışarıda.
    vitrin: {
      tutar: sapmalar
        .filter((s) => s.tip !== "kapasite-dusuk")
        .reduce((t, s) => t + s.etkiTL, 0),
      etiket: "aylık kâr etkisi",
    },
    ozetMetrikler: [
      {
        etiket: "Holding cirosu",
        deger: tlKisa(toplam.ciroTL),
        aciklama: `${ayAdi(c.donem)} · ${SIRKETLER.length} şirket`,
        yon: "notr",
      },
      {
        etiket: "Brüt marj",
        deger: yuzde(toplam.marj, 1),
        aciklama: `Dönem başına göre ${Math.abs(marjFarki)
          .toFixed(1)
          .replace(".", ",")} puan ${marjFarki < 0 ? "daralma" : "genişleme"}`,
        yon: marjFarki < 0 ? "kotu" : "iyi",
      },
      {
        etiket: "Karar bekleyen sapma",
        deger: `${sapmalar.length}`,
        aciklama: bas ? `En büyüğü ${bas.sirketAd}, ${tlKisa(bas.etkiTL)}` : "Sapma yok",
        yon: sapmalar.length > 0 ? "kotu" : "iyi",
      },
      {
        etiket: "Oluşan aylık kâr etkisi",
        deger: tlKisa(
          sapmalar
            .filter((s) => s.tip !== "kapasite-dusuk")
            .reduce((t, s) => t + s.etkiTL, 0),
        ),
        aciklama:
          "Kapasite boşluğu hariç; o gerçekleşmiş kayıp değil, fırsat maliyeti",
        yon: "kotu",
      },
    ],
    kararlar: bas
      ? [
          {
            id: "oncelik",
            baslik: "Bu dönem yönetimin dikkati nereye gitsin?",
            aciklama:
              "Fiilen oluşan kayıplar, TL etkisine göre sıralı; boşta kalan kapasite gibi fırsat kalemleri listenin sonunda. Hangisinin bu ay ele alınacağı yönetim kararı.",
            secenekler: sapmalar.slice(0, 3).map((s) => ({
              id: `${s.tip}-${s.sirketId}`,
              etiket: `${s.sirketAd} — ${s.baslik.toLowerCase()}`,
              ozet: `${tlKisa(s.etkiTL)} etki. ${s.oneri}`,
            })),
            onerilen: `${bas.tip}-${bas.sirketId}`,
          },
        ]
      : [],
  };
};

export const raporlamaSenaryosu: AjanSenaryosu<RaporlamaCiktisi> = {
  id: "raporlama",
  ad: "Holding Yönetim Raporu",
  ozet:
    "Şirketlerden gelen ciro, maliyet, üretim ve stok verisini toplar; sapmaları TL etkisine göre sıralar, en büyüğünü bir alt kırılıma indirir ve yönetim özetini yazar.",
  birim: "Holding",
  ikon: "YR",
  kokUrl: KOK,
  durum: "aktif",
  bolumler: [
    { ad: "Kontrol kulesi", href: KOK },
    { ad: "Şirketler", href: `${KOK}/sirketler` },
    { ad: "Yönetim özeti", href: `${KOK}/ozet` },
  ],
  calistir: raporlamaKosusu,
};

export { ayAdi, marj };
