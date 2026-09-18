import {
  BUGUN,
  GECIS_MATRISI,
  HATLAR,
  MEVCUT_PROGRAM,
  RISK_ESIGI_GUN,
  SIPARISLER,
  STOK_LOTLARI,
  UFUK_GUN,
  URUNLER,
  YILLIK_FINANSMAN,
  gecisMaliyeti,
  hatBul,
  urunBul,
} from "@/data/seed";
import type { AgentStep, Finding } from "@/lib/ajan/cekirdek";
import type {
  Campaign,
  LineId,
  LineResult,
  Order,
  OrderResult,
  PlanHedefi,
  PlanlamaBulguTipi,
  PlanResult,
  ScheduledCampaign,
} from "@/lib/types";

const GUN_MS = 24 * 60 * 60 * 1000;

export const gunFarki = (isoA: string, isoB: string): number =>
  Math.round((Date.parse(isoB) - Date.parse(isoA)) / GUN_MS);

export const bugundenGun = (iso: string): number => gunFarki(BUGUN, iso);

export const gunuTariheCevir = (gun: number): string => {
  const d = new Date(Date.parse(BUGUN) + Math.round(gun * GUN_MS));
  return d.toISOString().slice(0, 10);
};

/* ------------------------------------------------------------------ */
/* Stok                                                                */
/* ------------------------------------------------------------------ */

export interface LotDurumu {
  lotNo: string;
  sku: string;
  ton: number;
  uretimTarihi: string;
  yasGun: number;
  kalanRafGun: number;
  finansmanTL: number;
}

export interface StokDurumu {
  sku: string;
  stokTon: number;
  lotlar: LotDurumu[];
  enYasliGun: number;
  acikSiparisTon: number;
  ufuktakiTalepTon: number;
  gunlukTalep: number;
  gunKapsama: number;
  netIhtiyacTon: number;
  fazlaStokTon: number;
  stokDegeriTL: number;
  birikmisFinansmanTL: number;
}

export const lotDurumu = (): LotDurumu[] =>
  STOK_LOTLARI.map((lot) => {
    const urun = urunBul(lot.sku);
    const yasGun = gunFarki(lot.uretimTarihi, BUGUN);
    return {
      lotNo: lot.lotNo,
      sku: lot.sku,
      ton: lot.ton,
      uretimTarihi: lot.uretimTarihi,
      yasGun,
      kalanRafGun: urun.rafOmruGun - yasGun,
      finansmanTL: (lot.ton * urun.maliyetTon * YILLIK_FINANSMAN * yasGun) / 365,
    };
  });

/** Sipariş defterinin kapsadığı toplam gün sayısı (kapsama hesabı için). */
const siparisPenceresi = (): number => {
  const gunler = SIPARISLER.map((s) => bugundenGun(s.terminTarihi));
  return Math.max(...gunler, 1);
};

export const stokDurumu = (): StokDurumu[] => {
  const lotlar = lotDurumu();
  const pencere = siparisPenceresi();

  return URUNLER.map((urun) => {
    const urunLotlari = lotlar.filter((l) => l.sku === urun.sku);
    const stokTon = urunLotlari.reduce((t, l) => t + l.ton, 0);
    const siparisler = SIPARISLER.filter((s) => s.sku === urun.sku);
    const acikSiparisTon = siparisler.reduce((t, s) => t + s.ton, 0);
    const ufuktakiTalepTon = siparisler
      .filter((s) => bugundenGun(s.terminTarihi) <= UFUK_GUN)
      .reduce((t, s) => t + s.ton, 0);
    const gunlukTalep = acikSiparisTon / pencere;
    const netIhtiyacTon = Math.max(
      0,
      acikSiparisTon + urun.emniyetStogu - stokTon,
    );

    return {
      sku: urun.sku,
      stokTon,
      lotlar: urunLotlari.sort((a, b) => b.yasGun - a.yasGun),
      enYasliGun: urunLotlari.reduce((m, l) => Math.max(m, l.yasGun), 0),
      acikSiparisTon,
      ufuktakiTalepTon,
      gunlukTalep,
      gunKapsama: gunlukTalep > 0 ? stokTon / gunlukTalep : 999,
      netIhtiyacTon,
      fazlaStokTon: Math.max(0, stokTon - acikSiparisTon - urun.emniyetStogu),
      stokDegeriTL: stokTon * urun.maliyetTon,
      birikmisFinansmanTL: urunLotlari.reduce((t, l) => t + l.finansmanTL, 0),
    };
  });
};

export const stokDurumuBul = (sku: string): StokDurumu => {
  const d = stokDurumu().find((s) => s.sku === sku);
  if (!d) throw new Error(`Stok durumu bulunamadı: ${sku}`);
  return d;
};

/* ------------------------------------------------------------------ */
/* Simülasyon                                                          */
/* ------------------------------------------------------------------ */

interface UretimDilimi {
  sku: string;
  baslangic: number;
  bitis: number;
  ton: number;
}

/** Bir hattın kampanya listesini zamana yayar. */
const hattiZamanaYay = (
  hatId: LineId,
  kampanyalar: Campaign[],
): { planlanan: ScheduledCampaign[]; dilimler: UretimDilimi[] } => {
  const hat = hatBul(hatId);
  let oncekiUrun: string | null = hat.mevcutUrun;
  let t = 0;
  const planlanan: ScheduledCampaign[] = [];
  const dilimler: UretimDilimi[] = [];

  for (const k of kampanyalar) {
    if (k.ton <= 0) continue;
    const urun = urunBul(k.sku);
    const gecis = gecisMaliyeti(oncekiUrun, k.sku);
    t += gecis.saat / 24;
    const baslangic = t;
    t += k.ton / urun.hizTonGun;
    planlanan.push({
      ...k,
      hat: hatId,
      baslangicGun: baslangic,
      bitisGun: t,
      gecisSaati: gecis.saat,
      gecisMaliyeti: gecis.maliyetTL,
      gerekce: "",
    });
    dilimler.push({ sku: k.sku, baslangic, bitis: t, ton: k.ton });
    oncekiUrun = k.sku;
  }

  return { planlanan, dilimler };
};

/** τ anına kadar üretilmiş toplam ton (doğrusal üretim varsayımı). */
const uretilenTon = (dilimler: UretimDilimi[], sku: string, t: number): number =>
  dilimler
    .filter((d) => d.sku === sku)
    .reduce((toplam, d) => {
      if (t <= d.baslangic) return toplam;
      if (t >= d.bitis) return toplam + d.ton;
      const oran = (t - d.baslangic) / (d.bitis - d.baslangic);
      return toplam + d.ton * oran;
    }, 0);

/** Kümülatif üretim ilk kez hedefe ulaştığı an. */
const ulasmaAni = (
  dilimler: UretimDilimi[],
  sku: string,
  hedefTon: number,
): number => {
  if (hedefTon <= 0) return 0;
  let birikim = 0;
  const sirali = dilimler
    .filter((d) => d.sku === sku)
    .sort((a, b) => a.baslangic - b.baslangic);
  for (const d of sirali) {
    if (birikim + d.ton >= hedefTon) {
      const oran = (hedefTon - birikim) / d.ton;
      return d.baslangic + (d.bitis - d.baslangic) * oran;
    }
    birikim += d.ton;
  }
  return Infinity;
};

interface HatSonucu {
  hatSonuc: LineResult;
  siparisSonuclari: OrderResult[];
  finansmanTL: number;
  donemSonuStokTon: number;
  donemSonuStokDegeriTL: number;
  ortalamaBagliSermayeTL: number;
  uretilenTonToplam: number;
  maliyetTL: number;
}

/** Bir hattı ve o hattın ürünlerine ait siparişleri değerlendirir. */
export const hattiSimuleEt = (
  hatId: LineId,
  kampanyalar: Campaign[],
): HatSonucu => {
  const { planlanan, dilimler } = hattiZamanaYay(hatId, kampanyalar);
  const hatUrunleri = URUNLER.filter((u) => u.hat === hatId);
  const siparisSonuclari: OrderResult[] = [];

  for (const urun of hatUrunleri) {
    const stok = STOK_LOTLARI.filter((l) => l.sku === urun.sku).reduce(
      (t, l) => t + l.ton,
      0,
    );
    const siparisler = SIPARISLER.filter((s) => s.sku === urun.sku).sort(
      (a, b) => Date.parse(a.terminTarihi) - Date.parse(b.terminTarihi),
    );

    let kumulatif = 0;
    for (const siparis of siparisler) {
      const oncekiKumulatif = kumulatif;
      kumulatif += siparis.ton;
      const stoktan = Math.max(0, Math.min(siparis.ton, stok - oncekiKumulatif));
      const uretimden = siparis.ton - stoktan;
      const uretimIhtiyaci = Math.max(0, kumulatif - stok);
      const hazirGun = uretimIhtiyaci <= 0 ? 0 : ulasmaAni(dilimler, urun.sku, uretimIhtiyaci);
      const terminGun = bugundenGun(siparis.terminTarihi);
      const karsilanamayan =
        hazirGun === Infinity
          ? Math.max(0, uretimIhtiyaci - uretilenTon(dilimler, urun.sku, Infinity))
          : 0;
      const gecikmeGun =
        hazirGun === Infinity
          ? Math.max(0, UFUK_GUN - terminGun)
          : Math.max(0, hazirGun - terminGun);
      const cezaTL =
        Math.ceil(gecikmeGun) *
        siparis.gecikmeCezasiGunluk *
        siparis.ton *
        siparis.fiyatTon;

      siparisSonuclari.push({
        siparis,
        hazirGun,
        terminGun,
        gecikmeGun,
        cezaTL,
        stoktanKarsilananTon: stoktan,
        uretimdenKarsilananTon: uretimden,
        karsilanamayanTon: karsilanamayan,
      });
    }
  }

  /* Stok finansmanı: ufuk boyunca bağlı sermayenin integrali. */
  let toplamBagli = 0;
  let orneklem = 0;
  const adim = 0.25;
  for (let t = 0; t <= UFUK_GUN; t += adim) {
    let anlikDeger = 0;
    for (const urun of hatUrunleri) {
      const stok = STOK_LOTLARI.filter((l) => l.sku === urun.sku).reduce(
        (a, l) => a + l.ton,
        0,
      );
      const uretim = uretilenTon(dilimler, urun.sku, t);
      const sevk = siparisSonuclari
        .filter((r) => r.siparis.sku === urun.sku)
        .filter((r) => Math.max(r.hazirGun, r.terminGun) <= t)
        .reduce((a, r) => a + r.siparis.ton, 0);
      anlikDeger += Math.max(0, stok + uretim - sevk) * urun.maliyetTon;
    }
    toplamBagli += anlikDeger;
    orneklem += 1;
  }
  const ortalamaBagliSermayeTL = orneklem > 0 ? toplamBagli / orneklem : 0;
  const finansmanTL =
    (ortalamaBagliSermayeTL * YILLIK_FINANSMAN * UFUK_GUN) / 365;

  let donemSonuStokTon = 0;
  let donemSonuStokDegeriTL = 0;
  for (const urun of hatUrunleri) {
    const stok = STOK_LOTLARI.filter((l) => l.sku === urun.sku).reduce(
      (a, l) => a + l.ton,
      0,
    );
    const uretim = uretilenTon(dilimler, urun.sku, UFUK_GUN);
    const sevk = siparisSonuclari
      .filter((r) => r.siparis.sku === urun.sku)
      .filter((r) => Math.max(r.hazirGun, r.terminGun) <= UFUK_GUN)
      .reduce((a, r) => a + r.siparis.ton, 0);
    const kalan = Math.max(0, stok + uretim - sevk);
    donemSonuStokTon += kalan;
    donemSonuStokDegeriTL += kalan * urun.maliyetTon;
  }

  const gecisMaliyetiTL = planlanan.reduce((t, k) => t + k.gecisMaliyeti, 0);
  const gecisSaati = planlanan.reduce((t, k) => t + k.gecisSaati, 0);
  const kullanilanGun = planlanan.reduce((m, k) => Math.max(m, k.bitisGun), 0);
  const gecikmeCezasiTL = siparisSonuclari.reduce((t, r) => t + r.cezaTL, 0);

  return {
    hatSonuc: {
      hat: hatId,
      kampanyalar: planlanan,
      gecisMaliyetiTL,
      gecisSaati,
      kullanilanGun,
      kapasiteKullanimi: kullanilanGun / UFUK_GUN,
    },
    siparisSonuclari,
    finansmanTL,
    donemSonuStokTon,
    donemSonuStokDegeriTL,
    ortalamaBagliSermayeTL,
    uretilenTonToplam: planlanan.reduce((t, k) => t + k.ton, 0),
    maliyetTL: gecisMaliyetiTL + gecikmeCezasiTL + finansmanTL,
  };
};

export const simuleEt = (
  ad: string,
  program: Record<LineId, Campaign[]>,
): PlanResult => {
  const hatSonuclari = HATLAR.map((h) => hattiSimuleEt(h.id, program[h.id] ?? []));
  const siparisler = hatSonuclari.flatMap((s) => s.siparisSonuclari);

  const gecisMaliyetiTL = hatSonuclari.reduce(
    (t, s) => t + s.hatSonuc.gecisMaliyetiTL,
    0,
  );
  const gecikmeCezasiTL = siparisler.reduce((t, r) => t + r.cezaTL, 0);
  const stokFinansmaniTL = hatSonuclari.reduce((t, s) => t + s.finansmanTL, 0);

  /* Net ihtiyacı olmayan ürüne ayrılan üretim: doğrudan bağlanan işletme sermayesi. */
  const durum = stokDurumu();
  let ihtiyacDisiUretimTon = 0;
  let ihtiyacDisiSermayeTL = 0;
  for (const h of hatSonuclari) {
    for (const k of h.hatSonuc.kampanyalar) {
      const d = durum.find((x) => x.sku === k.sku);
      if (d && d.netIhtiyacTon <= 0) {
        ihtiyacDisiUretimTon += k.ton;
        ihtiyacDisiSermayeTL += k.ton * urunBul(k.sku).maliyetTon;
      }
    }
  }

  return {
    ad,
    hatlar: hatSonuclari.map((s) => s.hatSonuc),
    siparisler: siparisler.sort((a, b) => a.terminGun - b.terminGun),
    gecisMaliyetiTL,
    gecikmeCezasiTL,
    stokFinansmaniTL,
    toplamMaliyetTL: gecisMaliyetiTL + gecikmeCezasiTL + stokFinansmaniTL,
    gecikenSiparis: siparisler.filter((r) => r.gecikmeGun > 0).length,
    riskliSiparis: siparisler.filter(
      (r) => r.gecikmeGun <= 0 && r.terminGun - r.hazirGun < RISK_ESIGI_GUN,
    ).length,
    uretilenTon: hatSonuclari.reduce((t, s) => t + s.uretilenTonToplam, 0),
    ihtiyacDisiUretimTon,
    ihtiyacDisiSermayeTL,
    karsilanamayanTon: siparisler.reduce((t, r) => t + r.karsilanamayanTon, 0),
    donemSonuStokTon: hatSonuclari.reduce((t, s) => t + s.donemSonuStokTon, 0),
    donemSonuStokDegeriTL: hatSonuclari.reduce(
      (t, s) => t + s.donemSonuStokDegeriTL,
      0,
    ),
    ortalamaBagliSermayeTL: hatSonuclari.reduce(
      (t, s) => t + s.ortalamaBagliSermayeTL,
      0,
    ),
  };
};

/* ------------------------------------------------------------------ */
/* Optimizasyon                                                        */
/* ------------------------------------------------------------------ */

const permutasyonlar = <T,>(dizi: T[]): T[][] => {
  if (dizi.length <= 1) return [dizi];
  const sonuc: T[][] = [];
  dizi.forEach((eleman, i) => {
    const kalan = [...dizi.slice(0, i), ...dizi.slice(i + 1)];
    for (const alt of permutasyonlar(kalan)) sonuc.push([eleman, ...alt]);
  });
  return sonuc;
};

/** Hattın ürün bazında üretilmesi gereken net miktarları. */
export const hatIhtiyaclari = (hatId: LineId): Campaign[] => {
  const durum = stokDurumu();
  return URUNLER.filter((u) => u.hat === hatId)
    .map((u) => {
      const d = durum.find((s) => s.sku === u.sku)!;
      if (d.netIhtiyacTon <= 0) return { sku: u.sku, ton: 0 };
      return {
        sku: u.sku,
        ton: Math.max(u.minKampanyaTon, Math.ceil(d.netIhtiyacTon / 10) * 10),
      };
    })
    .filter((k) => k.ton > 0);
};

export interface OptimizasyonSonucu {
  program: Record<LineId, Campaign[]>;
  denenenAlternatif: number;
}

interface TalepNoktasi {
  gun: number;
  gerekenUretim: number;
}

/** Bir ürünün sipariş terminlerine göre kümülatif üretim ihtiyacı çizelgesi. */
const talepNoktalari = (sku: string): TalepNoktasi[] => {
  const stok = STOK_LOTLARI.filter((l) => l.sku === sku).reduce(
    (t, l) => t + l.ton,
    0,
  );
  let kumulatif = 0;
  const noktalar: TalepNoktasi[] = [];
  for (const siparis of SIPARISLER.filter((x) => x.sku === sku).sort(
    (a, b) => Date.parse(a.terminTarihi) - Date.parse(b.terminTarihi),
  )) {
    kumulatif += siparis.ton;
    const gereken = kumulatif - stok;
    if (gereken > 0) {
      noktalar.push({
        gun: bugundenGun(siparis.terminTarihi),
        gerekenUretim: gereken,
      });
    }
  }
  return noktalar;
};

/**
 * Termin baskısı ile ürün geçiş maliyetini tartan sıralama sezgiseli.
 * `gecisIsteksizligi` büyüdükçe kampanyalar birleşir, küçüldükçe terminlere
 * göre bölünür. Farklı değerlerle çalıştırılıp en iyisi seçilir.
 */
const sezgiselProgram = (
  hatId: LineId,
  gecisIsteksizligi: number,
): Campaign[] => {
  const hat = hatBul(hatId);
  const ihtiyac = hatIhtiyaclari(hatId);
  const kalan = new Map<string, number>(ihtiyac.map((k) => [k.sku, k.ton]));
  const uretilen = new Map<string, number>(ihtiyac.map((k) => [k.sku, 0]));
  const noktalar = new Map<string, TalepNoktasi[]>(
    ihtiyac.map((k) => [k.sku, talepNoktalari(k.sku)]),
  );

  const siradakiNokta = (sku: string): TalepNoktasi | undefined =>
    noktalar
      .get(sku)!
      .find((n) => n.gerekenUretim > (uretilen.get(sku) ?? 0) + 0.001);

  const kampanyalar: Campaign[] = [];
  let t = 0;
  let mevcutUrun: string | null = hat.mevcutUrun;
  let koruma = 0;

  while ([...kalan.values()].some((v) => v > 0.001) && koruma++ < 40) {
    const adaylar = [...kalan.entries()]
      .filter(([, v]) => v > 0.001)
      .map(([sku, v]) => {
        const urun = urunBul(sku);
        const nokta = siradakiNokta(sku);
        const acilIhtiyac = nokta
          ? nokta.gerekenUretim - (uretilen.get(sku) ?? 0)
          : v;
        const gecis = gecisMaliyeti(mevcutUrun, sku);
        const hazirOlma = t + gecis.saat / 24 + acilIhtiyac / urun.hizTonGun;
        const bosluk = nokta ? nokta.gun - hazirOlma : 60;
        return {
          sku,
          urun,
          kalanTon: v,
          acilIhtiyac,
          gecis,
          skor: bosluk + gecisIsteksizligi * (gecis.maliyetTL / 50000),
        };
      })
      .sort((a, b) => a.skor - b.skor);

    const secilen = adaylar[0];
    const baslangic = t + secilen.gecis.saat / 24;

    /* Başka bir ürünün termini ne zaman sıkışıyor? */
    const digerKritik = adaylar
      .slice(1)
      .map((a) => {
        const nokta = siradakiNokta(a.sku);
        if (!nokta) return Infinity;
        const gecis = gecisMaliyeti(secilen.sku, a.sku);
        return (
          nokta.gun - a.acilIhtiyac / a.urun.hizTonGun - gecis.saat / 24
        );
      })
      .reduce((m, v) => Math.min(m, v), Infinity);

    const tumunuBitirme = baslangic + secilen.kalanTon / secilen.urun.hizTonGun;
    let ton: number;
    if (tumunuBitirme <= digerKritik) {
      ton = secilen.kalanTon;
    } else {
      const sigan = (digerKritik - baslangic) * secilen.urun.hizTonGun;
      ton = Math.max(secilen.acilIhtiyac, Math.min(secilen.kalanTon, sigan));
    }
    ton = Math.min(secilen.kalanTon, Math.max(ton, Math.min(secilen.kalanTon, 80)));
    ton = Math.min(secilen.kalanTon, Math.ceil(ton / 10) * 10);
    /* Geriye anlamsız küçük bir bakiye kalıyorsa kampanyaya dahil et. */
    if (secilen.kalanTon - ton < 60) ton = secilen.kalanTon;

    kampanyalar.push({ sku: secilen.sku, ton });
    uretilen.set(secilen.sku, (uretilen.get(secilen.sku) ?? 0) + ton);
    kalan.set(secilen.sku, secilen.kalanTon - ton);
    t = baslangic + ton / secilen.urun.hizTonGun;
    mevcutUrun = secilen.sku;
  }

  /* Arka arkaya gelen aynı ürün kampanyalarını birleştir. */
  return kampanyalar.reduce<Campaign[]>((liste, k) => {
    const son = liste[liste.length - 1];
    if (son && son.sku === k.sku) son.ton += k.ton;
    else liste.push({ ...k });
    return liste;
  }, []);
};

/**
 * Saf termin odaklı sıralama: her adımda payı en az kalan ürüne geçilir ve
 * yalnızca o terminin gerektirdiği kadar üretilir. Geçiş sayısını artırır ama
 * hiçbir siparişi geciktirmemeyi hedefler.
 */
const terminOdakliProgram = (hatId: LineId): Campaign[] => {
  const hat = hatBul(hatId);
  const ihtiyac = hatIhtiyaclari(hatId);
  const kalan = new Map<string, number>(ihtiyac.map((k) => [k.sku, k.ton]));
  const uretilen = new Map<string, number>(ihtiyac.map((k) => [k.sku, 0]));
  const noktalar = new Map<string, TalepNoktasi[]>(
    ihtiyac.map((k) => [k.sku, talepNoktalari(k.sku)]),
  );

  const kampanyalar: Campaign[] = [];
  let t = 0;
  let mevcutUrun: string | null = hat.mevcutUrun;
  let koruma = 0;

  while ([...kalan.values()].some((v) => v > 0.001) && koruma++ < 40) {
    const adaylar = [...kalan.entries()]
      .filter(([, v]) => v > 0.001)
      .map(([sku, v]) => {
        const urun = urunBul(sku);
        const nokta = noktalar
          .get(sku)!
          .find((n) => n.gerekenUretim > (uretilen.get(sku) ?? 0) + 0.001);
        const acilIhtiyac = nokta
          ? Math.min(v, nokta.gerekenUretim - (uretilen.get(sku) ?? 0))
          : v;
        const gecis = gecisMaliyeti(mevcutUrun, sku);
        const bitis = t + gecis.saat / 24 + acilIhtiyac / urun.hizTonGun;
        return {
          sku,
          urun,
          kalanTon: v,
          acilIhtiyac,
          gecis,
          pay: nokta ? nokta.gun - bitis : 90,
        };
      })
      .sort((a, b) => a.pay - b.pay);

    const secilen = adaylar[0];
    let ton = Math.min(secilen.kalanTon, Math.ceil(secilen.acilIhtiyac / 10) * 10);
    if (secilen.kalanTon - ton < 10) ton = secilen.kalanTon;

    kampanyalar.push({ sku: secilen.sku, ton });
    uretilen.set(secilen.sku, (uretilen.get(secilen.sku) ?? 0) + ton);
    kalan.set(secilen.sku, secilen.kalanTon - ton);
    t = t + secilen.gecis.saat / 24 + ton / secilen.urun.hizTonGun;
    mevcutUrun = secilen.sku;
  }

  return kampanyalar.reduce<Campaign[]>((liste, k) => {
    const son = liste[liste.length - 1];
    if (son && son.sku === k.sku) son.ton += k.ton;
    else liste.push({ ...k });
    return liste;
  }, []);
};

/** Bir ürünün yakın terminli siparişleri için stok üstü gereken miktar. */
const acilMiktar = (sku: string): number => {
  const stok = STOK_LOTLARI.filter((l) => l.sku === sku).reduce(
    (t, l) => t + l.ton,
    0,
  );
  const acilSiparisler = SIPARISLER.filter(
    (s) => s.sku === sku && bugundenGun(s.terminTarihi) <= 10,
  ).reduce((t, s) => t + s.ton, 0);
  return Math.max(0, acilSiparisler - stok);
};

const GECIKME_AGIRLIGI: Record<PlanHedefi, number> = {
  maliyet: 1,
  "sifir-gecikme": 40,
};

const imza = (kampanyalar: Campaign[]): string =>
  kampanyalar.map((k) => `${k.sku}:${Math.round(k.ton)}`).join("|");

export const programOptimizeEt = (
  hedef: PlanHedefi = "maliyet",
): OptimizasyonSonucu => {
  const program = {} as Record<LineId, Campaign[]>;
  let denenenAlternatif = 0;
  const agirlik = GECIKME_AGIRLIGI[hedef];

  for (const hat of HATLAR) {
    const ihtiyac = hatIhtiyaclari(hat.id);
    if (ihtiyac.length === 0) {
      program[hat.id] = [];
      continue;
    }

    const adaylar: Campaign[][] = [];
    const gorulen = new Set<string>();
    const ekle = (k: Campaign[]) => {
      const anahtar = imza(k);
      if (k.length === 0 || gorulen.has(anahtar)) return;
      gorulen.add(anahtar);
      adaylar.push(k);
    };

    /* Tek kampanyalı bütün sıralamalar ve bunların "acil kısmı öne al" varyantları. */
    for (const sira of permutasyonlar(ihtiyac)) {
      ekle(sira);
      const ilk = sira[0];
      const acil = acilMiktar(ilk.sku);
      const acilYuvarlanmis = Math.ceil(acil / 10) * 10;
      if (sira.length > 1 && acilYuvarlanmis > 0 && acilYuvarlanmis < ilk.ton - 50) {
        ekle([
          { sku: ilk.sku, ton: acilYuvarlanmis },
          ...sira.slice(1),
          { sku: ilk.sku, ton: ilk.ton - acilYuvarlanmis },
        ]);
      }
    }
    /* Geçiş maliyetine farklı duyarlılıklarla sezgisel programlar. */
    for (const isteksizlik of [0, 0.3, 1, 2.5, 6, 15, 40]) {
      ekle(sezgiselProgram(hat.id, isteksizlik));
    }
    /* Terminleri şart koşan sıralama. */
    ekle(terminOdakliProgram(hat.id));

    let enIyi: Campaign[] = ihtiyac;
    let enIyiMaliyet = Infinity;
    for (const aday of adaylar) {
      denenenAlternatif += 1;
      const sonuc = hattiSimuleEt(hat.id, aday);
      const gecikme = sonuc.siparisSonuclari.reduce((t, r) => t + r.cezaTL, 0);
      const maliyet =
        sonuc.hatSonuc.gecisMaliyetiTL + agirlik * gecikme + sonuc.finansmanTL;
      if (maliyet < enIyiMaliyet - 0.5) {
        enIyiMaliyet = maliyet;
        enIyi = aday;
      }
    }
    program[hat.id] = enIyi;
  }

  return { program, denenenAlternatif };
};

/** Kampanyalara insan tarafından okunabilir gerekçe yazar. */
export const gerekceYaz = (plan: PlanResult): PlanResult => {
  for (const hat of plan.hatlar) {
    const sayac = new Map<string, number>();
    hat.kampanyalar.forEach((k, i) => {
      const urun = urunBul(k.sku);
      const kalanKampanya = hat.kampanyalar.filter((x) => x.sku === k.sku).length;
      const sira = (sayac.get(k.sku) ?? 0) + 1;
      sayac.set(k.sku, sira);

      const ilgili = plan.siparisler
        .filter((r) => r.siparis.sku === k.sku)
        .sort((a, b) => a.terminGun - b.terminGun);
      const enYakin = ilgili[0];

      const parcalar: string[] = [];
      if (i === 0 && enYakin) {
        parcalar.push(
          `${urun.kisaAd} hatta ilk sırada: en yakın termin ${enYakin.siparis.id} (${enYakin.siparis.musteri}), ${tarihKisa(enYakin.siparis.terminTarihi)}`,
        );
      } else if (enYakin) {
        parcalar.push(
          `${urun.kisaAd}; bu kampanya ${enYakin.siparis.id} ve sonrasını besliyor`,
        );
      }
      if (k.gecisSaati > 0) {
        parcalar.push(
          `hat geçişi ${k.gecisSaati} saat / ${(k.gecisMaliyeti / 1000).toFixed(0)} bin TL`,
        );
      } else {
        parcalar.push("hat zaten bu üründe, geçiş maliyeti yok");
      }
      if (kalanKampanya === 1 && ilgili.length > 1) {
        parcalar.push(
          `${ilgili.length} sipariş tek kampanyada toplandı, ek geçiş yok`,
        );
      }
      if (kalanKampanya > 1) {
        parcalar.push(
          sira === 1
            ? "acil siparişler için bölündü"
            : "kalan miktar termini uzak siparişler için sona alındı",
        );
      }
      k.gerekce = parcalar.join("; ") + ".";
    });
  }
  return plan;
};

const tarihKisa = (iso: string): string => {
  const [, ay, gun] = iso.split("-");
  return `${gun}.${ay}`;
};

/* ------------------------------------------------------------------ */
/* Bulgular                                                            */
/* ------------------------------------------------------------------ */

export const bulgulariCikar = (
  mevcut: PlanResult,
  oneri: PlanResult,
): Finding<PlanlamaBulguTipi>[] => {
  const bulgular: Finding<PlanlamaBulguTipi>[] = [];
  const durum = stokDurumu();

  /* 1. Stoğu açık siparişleri karşılamayan ürünler */
  for (const d of durum) {
    if (d.netIhtiyacTon > 0 && d.stokTon < d.ufuktakiTalepTon) {
      const urun = urunBul(d.sku);
      const acik = d.ufuktakiTalepTon - d.stokTon;
      bulgular.push({
        id: `stok-${d.sku}`,
        tip: "stok-yetersiz",
        seviye: d.gunKapsama < 4 ? "kritik" : "uyari",
        baslik: `${urun.kisaAd}: stok açık siparişleri karşılamıyor`,
        detay: `Stok ${Math.round(d.stokTon)} ton, ${UFUK_GUN} gün içindeki termini olan sipariş ${Math.round(d.ufuktakiTalepTon)} ton. Açık ${Math.round(acik)} ton, mevcut stok ${d.gunKapsama.toFixed(1)} günlük talebi karşılıyor.`,
        etkiTL: acik * urun.listeFiyatTon,
        etkiTipi: "risk",
        etkiEtiketi: "Sevk edilemeyecek sipariş tutarı",
        baglam: { sku: d.sku },
        oneri: `${Math.round(d.netIhtiyacTon)} ton üretim programa alınmalı.`,
      });
    }
  }

  /* 2. Mevcut programda termini riske giren siparişler */
  for (const r of mevcut.siparisler) {
    if (r.gecikmeGun > 0) {
      const oneriDurumu = oneri.siparisler.find(
        (x) => x.siparis.id === r.siparis.id,
      );
      const duzeldi = oneriDurumu ? oneriDurumu.gecikmeGun <= 0 : false;
      bulgular.push({
        id: `termin-${r.siparis.id}`,
        tip: "termin-riski",
        seviye: "kritik",
        baslik: `${r.siparis.id} termini kaçıyor: ${r.siparis.musteri}`,
        detay: `${urunBul(r.siparis.sku).kisaAd} ${Math.round(r.siparis.ton)} ton, termin ${tarihKisa(r.siparis.terminTarihi)}. Mevcut programla ${r.gecikmeGun.toFixed(1)} gün gecikiyor; sözleşme cezası ${Math.round(r.cezaTL).toLocaleString("tr-TR")} TL.`,
        etkiTL: r.cezaTL,
        etkiTipi: duzeldi ? "tasarruf" : "risk",
        etkiEtiketi: duzeldi ? "Önerilen programla önlenen ceza" : "Sözleşme cezası",
        baglam: { siparisId: r.siparis.id, sku: r.siparis.sku },
        oneri: duzeldi
          ? "Önerilen sıralamada termin zamanında karşılanıyor."
          : "Üretim sırası değişse de kapasite yetmiyor; miktar bölünmeli ya da müşteriyle termin revize edilmeli.",
      });
    } else if (r.terminGun - r.hazirGun < RISK_ESIGI_GUN) {
      bulgular.push({
        id: `risk-${r.siparis.id}`,
        tip: "termin-riski",
        seviye: "uyari",
        baslik: `${r.siparis.id} terminine az pay kalıyor`,
        detay: `${r.siparis.musteri} için ${urunBul(r.siparis.sku).kisaAd}; üretim ${tarihKisa(gunuTariheCevir(r.hazirGun))} tarihinde bitiyor, termin ${tarihKisa(r.siparis.terminTarihi)}. Pay yalnızca ${(r.terminGun - r.hazirGun).toFixed(1)} gün.`,
        etkiTL: r.siparis.ton * r.siparis.fiyatTon * r.siparis.gecikmeCezasiGunluk,
        etkiTipi: "risk",
        etkiEtiketi: "Bir günlük gecikmenin cezası",
        baglam: { siparisId: r.siparis.id, sku: r.siparis.sku },
        oneri: "Hat duruşu olursa ilk etkilenecek sipariş; takipte tutulmalı.",
      });
    }
  }

  /* 3. Mevcut programda gereksiz üretim */
  for (const hat of mevcut.hatlar) {
    for (const k of hat.kampanyalar) {
      const d = durum.find((s) => s.sku === k.sku)!;
      if (d.netIhtiyacTon <= 0) {
        const urun = urunBul(k.sku);
        const bagli = k.ton * urun.maliyetTon;
        bulgular.push({
          id: `fazla-${k.sku}`,
          tip: "fazla-uretim",
          seviye: "kritik",
          baslik: `${urun.kisaAd}: stok zaten fazlayken ${Math.round(k.ton)} ton daha programda`,
          detay: `Stok ${Math.round(d.stokTon)} ton, açık sipariş ${Math.round(d.acikSiparisTon)} ton, kapsama ${d.gunKapsama.toFixed(0)} gün. Mevcut program ${Math.round(k.ton)} ton daha üretiyor; ${Math.round(bagli).toLocaleString("tr-TR")} TL işletme sermayesi bağlanıyor ve hatta ${((k.ton / urunBul(k.sku).hizTonGun) + k.gecisSaati / 24).toFixed(1)} gün kapasite harcanıyor.`,
          etkiTL: (bagli * YILLIK_FINANSMAN * UFUK_GUN) / 365 + k.gecisMaliyeti,
          etkiTipi: "tasarruf",
          etkiEtiketi: `${Math.round(bagli).toLocaleString("tr-TR")} TL sermayenin ${UFUK_GUN} günlük finansman ve geçiş maliyeti`,
          baglam: { sku: k.sku },
          oneri: "Bu kampanya programdan çıkarılıp kapasite açığı olan ürüne verilmeli.",
        });
      }
    }
  }

  /* 4. Yavaş / yaşlanan stok ve raf ömrü */
  for (const d of durum) {
    const urun = urunBul(d.sku);
    for (const lot of d.lotlar) {
      const rafOrani = lot.kalanRafGun / urun.rafOmruGun;
      if (lot.yasGun >= 60 && (d.fazlaStokTon > 0 || rafOrani < 0.5)) {
        bulgular.push({
          id: `yavas-${lot.lotNo}`,
          tip: rafOrani < 0.45 ? "raf-omru" : "yavas-stok",
          seviye: rafOrani < 0.35 ? "kritik" : "uyari",
          baslik: `${urun.kisaAd} lot ${lot.lotNo}: ${lot.yasGun} gündür stokta`,
          detay: `${Math.round(lot.ton)} ton, ${tarihKisa(lot.uretimTarihi)} üretimi. Bugüne kadar ${Math.round(lot.finansmanTL).toLocaleString("tr-TR")} TL finansman maliyeti oluşturdu, raf ömrünün ${lot.kalanRafGun} günü kaldı.`,
          etkiTL: lot.finansmanTL,
          etkiTipi: "maliyet",
          etkiEtiketi: "Bugüne kadar oluşan finansman maliyeti",
          baglam: { sku: d.sku, lotNo: lot.lotNo },
          oneri:
            rafOrani < 0.45
              ? "Spot satış ya da mevcut müşteriye erken sevk teklifiyle eritilmeli."
              : "Bu üründe yeni üretim durdurulmalı, sevkler bu lottan yapılmalı.",
        });
      }
    }
  }

  /* 5. Sıralama optimizasyonu */
  const gecisFark = mevcut.gecisMaliyetiTL - oneri.gecisMaliyetiTL;
  if (gecisFark > 0) {
    bulgular.push({
      id: "sira-gecis",
      tip: "sira-optimizasyonu",
      seviye: "uyari",
      baslik: `Üretim sırası değişirse ${Math.round(gecisFark).toLocaleString("tr-TR")} TL geçiş maliyeti düşüyor`,
      detay: `Mevcut programda ${mevcut.hatlar.reduce((t, h) => t + h.kampanyalar.filter((k) => k.gecisSaati > 0).length, 0)} ürün geçişi var (${Math.round(mevcut.gecisMaliyetiTL).toLocaleString("tr-TR")} TL, ${mevcut.hatlar.reduce((t, h) => t + h.gecisSaati, 0)} saat). Önerilen programda ${oneri.hatlar.reduce((t, h) => t + h.kampanyalar.filter((k) => k.gecisSaati > 0).length, 0)} geçiş kalıyor.`,
      etkiTL: gecisFark,
      etkiTipi: "tasarruf",
      etkiEtiketi: "21 günlük dönemde önlenebilir geçiş maliyeti",
      oneri: "Aynı ürünün siparişleri tek kampanyada toplanmalı.",
    });
  }

  /* 6. Kârlılık sıralaması */
  const marjlar = SIPARISLER.map((s) => {
    const urun = urunBul(s.sku);
    return {
      siparis: s,
      marj: (s.fiyatTon - urun.maliyetTon) / s.fiyatTon,
      tutar: (s.fiyatTon - urun.maliyetTon) * s.ton,
    };
  }).sort((a, b) => b.marj - a.marj);
  const enIyi = marjlar[0];
  const enKotu = marjlar[marjlar.length - 1];
  bulgular.push({
    id: "karlilik",
    tip: "karlilik",
    seviye: "bilgi",
    baslik: "Sipariş kârlılıkları üretim önceliğini etkiliyor",
    detay: `En yüksek marj ${enIyi.siparis.id} (${enIyi.siparis.musteri}, ${urunBul(enIyi.siparis.sku).kisaAd}) %${(enIyi.marj * 100).toFixed(1)}, katkı ${Math.round(enIyi.tutar).toLocaleString("tr-TR")} TL. En düşük marj ${enKotu.siparis.id} (${enKotu.siparis.musteri}) %${(enKotu.marj * 100).toFixed(1)}. Kapasite çakışmasında öncelik yüksek marjlı ve termini yakın siparişe verildi.`,
    etkiTL: enIyi.tutar,
    etkiTipi: "risk",
    etkiEtiketi: "En yüksek marjlı siparişin katkısı",
    baglam: { siparisId: enIyi.siparis.id },
    oneri: "Kapasite darboğazında düşük marjlı siparişin termini müşteriyle yeniden konuşulmalı.",
  });

  const siralama = { kritik: 0, uyari: 1, bilgi: 2 } as const;
  return bulgular.sort(
    (a, b) => siralama[a.seviye] - siralama[b.seviye] || b.etkiTL - a.etkiTL,
  );
};

/* ------------------------------------------------------------------ */
/* Ajan çalıştırması                                                   */
/* ------------------------------------------------------------------ */

export interface AjanCiktisi {
  adimlar: AgentStep[];
  mevcut: PlanResult;
  oneri: PlanResult;
  /** Hiçbir siparişin gecikmemesini şart koşan alternatif senaryo. */
  alternatif: PlanResult;
  bulgular: Finding<PlanlamaBulguTipi>[];
  program: Record<LineId, Campaign[]>;
  alternatifProgram: Record<LineId, Campaign[]>;
  denenenAlternatif: number;
}

export const ajaniCalistir = (): AjanCiktisi => {
  const mevcut = gerekceYaz(simuleEt("Mevcut program", MEVCUT_PROGRAM));

  const maliyetOdakli = programOptimizeEt("maliyet");
  const oneri = gerekceYaz(simuleEt("Ajan önerisi", maliyetOdakli.program));

  const gecikmesiz = programOptimizeEt("sifir-gecikme");
  const alternatif = gerekceYaz(
    simuleEt("Termin öncelikli alternatif", gecikmesiz.program),
  );

  const denenenAlternatif =
    maliyetOdakli.denenenAlternatif + gecikmesiz.denenenAlternatif;
  const bulgular = bulgulariCikar(mevcut, oneri);

  /* İki senaryo arasında gerçek bir ödünleşme varsa kararı kullanıcıya bırak. */
  if (
    alternatif.gecikenSiparis < oneri.gecikenSiparis &&
    alternatif.toplamMaliyetTL > oneri.toplamMaliyetTL
  ) {
    const fark = alternatif.toplamMaliyetTL - oneri.toplamMaliyetTL;
    const gecikenler = oneri.siparisler
      .filter((r) => r.gecikmeGun > 0)
      .map((r) => `${r.siparis.id} (${r.siparis.musteri})`)
      .join(", ");
    bulgular.unshift({
      id: "odunlesme",
      tip: "sira-optimizasyonu",
      seviye: "uyari",
      baslik: "Bu kararı ajan tek başına vermiyor: gecikme mi, ek ürün geçişi mi?",
      detay: `Maliyet odaklı programda ${gecikenler} ${oneri.siparisler.filter((r) => r.gecikmeGun > 0).reduce((m, r) => Math.max(m, r.gecikmeGun), 0).toFixed(1)} gün gecikiyor ve sözleşme cezası ${Math.round(oneri.gecikmeCezasiTL).toLocaleString("tr-TR")} TL oluyor. Hiçbir sipariş gecikmesin denirse hatta ek ürün geçişi gerekiyor ve toplam maliyet ${Math.round(fark).toLocaleString("tr-TR")} TL artıyor.`,
      etkiTL: fark,
      etkiTipi: "maliyet",
      etkiEtiketi: "Termin önceliğinin ek maliyeti",
      oneri:
        "Müşteri ilişkisi öncelikliyse termin odaklı senaryo, saf maliyet öncelikliyse mevcut öneri seçilmeli.",
    });
  }

  const durum = stokDurumu();
  const acikUrun = durum.filter((d) => d.netIhtiyacTon > 0).length;
  const fazlaUrun = durum.filter((d) => d.fazlaStokTon > 0).length;
  const toplamSiparisTon = SIPARISLER.reduce((t, s) => t + s.ton, 0);
  const stokTon = STOK_LOTLARI.reduce((t, l) => t + l.ton, 0);
  const yasliLot = lotDurumu().filter((l) => l.yasGun >= 60);
  const netIhtiyacToplam = HATLAR.reduce(
    (t, h) => t + hatIhtiyaclari(h.id).reduce((a, k) => a + k.ton, 0),
    0,
  );

  const adimlar: AgentStep[] = [
    {
      baslik: "Sipariş defteri okundu",
      detay: `${SIPARISLER.length} açık sipariş, ${Math.round(toplamSiparisTon).toLocaleString("tr-TR")} ton, ${new Set(SIPARISLER.map((s) => s.musteri)).size} müşteri. Planlama ufku ${UFUK_GUN} gün.`,
    },
    {
      baslik: "Stok ve lot yaşları kontrol edildi",
      detay: `${STOK_LOTLARI.length} lot, ${Math.round(stokTon).toLocaleString("tr-TR")} ton mamul. ${yasliLot.length} lot 60 günden yaşlı; bu lotların bugüne kadar oluşturduğu finansman maliyeti ${Math.round(yasliLot.reduce((t, l) => t + l.finansmanTL, 0)).toLocaleString("tr-TR")} TL.`,
    },
    {
      baslik: "Net ihtiyaç ve gün kapsama hesaplandı",
      detay: `${acikUrun} üründe stok siparişleri karşılamıyor, ${fazlaUrun} üründe ihtiyacın üzerinde stok var. Emniyet stokları dahil net üretim ihtiyacı ${Math.round(netIhtiyacToplam).toLocaleString("tr-TR")} ton.`,
    },
    {
      baslik: "Üretim müdürünün mevcut programı simüle edildi",
      detay: `${mevcut.gecikenSiparis} sipariş termini kaçırıyor, ${mevcut.riskliSiparis} sipariş sınırda. Ürün geçiş maliyeti ${Math.round(mevcut.gecisMaliyetiTL).toLocaleString("tr-TR")} TL; ihtiyaç dışı ${Math.round(mevcut.ihtiyacDisiUretimTon)} ton üretim ${Math.round(mevcut.ihtiyacDisiSermayeTL).toLocaleString("tr-TR")} TL sermaye bağlıyor.`,
    },
    {
      baslik: "Hat bazında sıralama alternatifleri denendi",
      detay: `${denenenAlternatif} alternatif sıralama ve kampanya bölme senaryosu; her biri termin cezası, ürün geçiş maliyeti ve stok finansmanı toplamına göre puanlandı.`,
    },
    {
      baslik: "Kârlılık ve termin ödünleşmesi değerlendirildi",
      detay: `Kapasite çakışan siparişlerde öncelik, ton başına katkı marjı ve gecikme cezası birlikte ağırlıklandırıldı. Terminleri şart koşan alternatif senaryo da ayrıca hesaplandı.`,
    },
    {
      baslik: "Program önerisi hazır",
      detay: `${oneri.gecikenSiparis} geciken sipariş, ${Math.round(oneri.gecisMaliyetiTL).toLocaleString("tr-TR")} TL geçiş maliyeti, ihtiyaç dışı üretim ${Math.round(oneri.ihtiyacDisiUretimTon)} ton. Mevcut programa göre ${Math.round(mevcut.toplamMaliyetTL - oneri.toplamMaliyetTL).toLocaleString("tr-TR")} TL doğrudan iyileşme.`,
    },
  ];

  return {
    adimlar,
    mevcut,
    oneri,
    alternatif,
    bulgular,
    program: maliyetOdakli.program,
    alternatifProgram: gecikmesiz.program,
    denenenAlternatif,
  };
};
