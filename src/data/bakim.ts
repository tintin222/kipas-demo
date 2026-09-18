import type { GunlukKayit, ProsesAdimi, VardiyaNotu } from "@/lib/bakim";

/**
 * Üretim kaybı senaryosunun tohum verisi.
 *
 * Ondört günlük dönem. Rakamlar kurgudur ama ölçek gerçek tesise göredir:
 * günde ~900 ton mısır, referans değirmen verimi %92,5. Vardiya notları
 * bilerek dağınık ve çoğu gürültü; birinin işe yaraması, hepsinin okunmasıyla
 * ortaya çıkıyor.
 */

export const GUNLER = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-05",
  "2026-09-06",
  "2026-09-07",
  "2026-09-08",
  "2026-09-09",
  "2026-09-10",
  "2026-09-11",
  "2026-09-12",
  "2026-09-13",
  "2026-09-14"
];

/** Dönemin raporlandığı gün. */
export const DONEM_SONU = GUNLER[GUNLER.length - 1]!;

export const PROSES_ADIMLARI: ProsesAdimi[] = [
  {
    "id": "islatma",
    "ad": "Islatma",
    "referans": 0.985,
    "birim": "çözünme verimi"
  },
  {
    "id": "ogutme",
    "ad": "Öğütme",
    "referans": 0.975,
    "birim": "serbest nişasta"
  },
  {
    "id": "ayirma",
    "ad": "Ayırma",
    "referans": 0.965,
    "birim": "separatör verimi"
  },
  {
    "id": "kurutma",
    "ad": "Kurutma",
    "referans": 0.998,
    "birim": "kurutma verimi"
  }
];

export const GUNLUK_KAYITLAR: GunlukKayit[] = [
  {
    "gun": "2026-09-01",
    "islenenMisirTon": 950.4,
    "nemPct": 15.5,
    "nisastaPctKuru": 71.3,
    "adimVerimleri": {
      "islatma": 0.986,
      "ogutme": 0.9765,
      "ayirma": 0.9626,
      "kurutma": 0.9982
    },
    "uretilenNisastaTon": 529.7,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-02",
    "islenenMisirTon": 932.7,
    "nemPct": 15.0,
    "nisastaPctKuru": 71.4,
    "adimVerimleri": {
      "islatma": 0.9842,
      "ogutme": 0.9732,
      "ayirma": 0.9618,
      "kurutma": 0.9973
    },
    "uretilenNisastaTon": 520.1,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-03",
    "islenenMisirTon": 906.9,
    "nemPct": 14.8,
    "nisastaPctKuru": 71.5,
    "adimVerimleri": {
      "islatma": 0.9832,
      "ogutme": 0.9724,
      "ayirma": 0.9634,
      "kurutma": 0.9977
    },
    "uretilenNisastaTon": 507.7,
    "durusSaat": 1.2
  },
  {
    "gun": "2026-09-04",
    "islenenMisirTon": 924.5,
    "nemPct": 15.3,
    "nisastaPctKuru": 71.2,
    "adimVerimleri": {
      "islatma": 0.984,
      "ogutme": 0.9743,
      "ayirma": 0.9621,
      "kurutma": 0.9974
    },
    "uretilenNisastaTon": 512.9,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-05",
    "islenenMisirTon": 892.7,
    "nemPct": 15.0,
    "nisastaPctKuru": 71.1,
    "adimVerimleri": {
      "islatma": 0.9822,
      "ogutme": 0.9726,
      "ayirma": 0.9599,
      "kurutma": 0.9972
    },
    "uretilenNisastaTon": 493.3,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-06",
    "islenenMisirTon": 952.3,
    "nemPct": 15.2,
    "nisastaPctKuru": 70.9,
    "adimVerimleri": {
      "islatma": 0.9821,
      "ogutme": 0.9714,
      "ayirma": 0.9577,
      "kurutma": 0.9981
    },
    "uretilenNisastaTon": 522.1,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-07",
    "islenenMisirTon": 882.5,
    "nemPct": 14.7,
    "nisastaPctKuru": 71.5,
    "adimVerimleri": {
      "islatma": 0.9854,
      "ogutme": 0.9748,
      "ayirma": 0.9546,
      "kurutma": 0.9974
    },
    "uretilenNisastaTon": 492.3,
    "durusSaat": 2.1
  },
  {
    "gun": "2026-09-08",
    "islenenMisirTon": 944.0,
    "nemPct": 15.3,
    "nisastaPctKuru": 70.8,
    "adimVerimleri": {
      "islatma": 0.9837,
      "ogutme": 0.9767,
      "ayirma": 0.9513,
      "kurutma": 0.9976
    },
    "uretilenNisastaTon": 516.2,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-09",
    "islenenMisirTon": 896.4,
    "nemPct": 14.8,
    "nisastaPctKuru": 70.8,
    "adimVerimleri": {
      "islatma": 0.9835,
      "ogutme": 0.9748,
      "ayirma": 0.9466,
      "kurutma": 0.9978
    },
    "uretilenNisastaTon": 489.6,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-10",
    "islenenMisirTon": 932.4,
    "nemPct": 14.7,
    "nisastaPctKuru": 70.8,
    "adimVerimleri": {
      "islatma": 0.9839,
      "ogutme": 0.9737,
      "ayirma": 0.9433,
      "kurutma": 0.9977
    },
    "uretilenNisastaTon": 507.7,
    "durusSaat": 0.5
  },
  {
    "gun": "2026-09-11",
    "islenenMisirTon": 952.3,
    "nemPct": 15.6,
    "nisastaPctKuru": 71.3,
    "adimVerimleri": {
      "islatma": 0.9829,
      "ogutme": 0.9764,
      "ayirma": 0.9408,
      "kurutma": 0.9974
    },
    "uretilenNisastaTon": 516.1,
    "durusSaat": 0.5
  },
  {
    "gun": "2026-09-12",
    "islenenMisirTon": 916.4,
    "nemPct": 15.4,
    "nisastaPctKuru": 71.3,
    "adimVerimleri": {
      "islatma": 0.9848,
      "ogutme": 0.9749,
      "ayirma": 0.9383,
      "kurutma": 0.9975
    },
    "uretilenNisastaTon": 496.7,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-13",
    "islenenMisirTon": 909.3,
    "nemPct": 14.8,
    "nisastaPctKuru": 71.0,
    "adimVerimleri": {
      "islatma": 0.984,
      "ogutme": 0.9757,
      "ayirma": 0.9348,
      "kurutma": 0.9975
    },
    "uretilenNisastaTon": 492.4,
    "durusSaat": 0
  },
  {
    "gun": "2026-09-14",
    "islenenMisirTon": 886.2,
    "nemPct": 15.4,
    "nisastaPctKuru": 71.2,
    "adimVerimleri": {
      "islatma": 0.9857,
      "ogutme": 0.9734,
      "ayirma": 0.9297,
      "kurutma": 0.9983
    },
    "uretilenNisastaTon": 475.4,
    "durusSaat": 1.2
  }
];

/**
 * Vardiya notları. Serbest metin, Türkçe, düzensiz — gerçekte olduğu gibi.
 * Bir insan bunları göz ucuyla geçer; bütününü okumak aracın işe yaradığı yer.
 */
export const VARDIYA_NOTLARI: VardiyaNotu[] = [
  {
    "gun": "2026-08-26",
    "vardiya": "B",
    "metin": "2 numaralı separatör tamburunda titreşim arttı, devir 4.200'e düşürülerek çalışmaya devam edildi. Bakım formu açıldı."
  },
  {
    "gun": "2026-09-01",
    "vardiya": "A",
    "metin": "Vardiya sorunsuz. Buhar basıncı normal."
  },
  {
    "gun": "2026-09-02",
    "vardiya": "C",
    "metin": "Islatma tanklarında SO2 dozajı manuel ayarlandı, otomasyon uyarı verdi."
  },
  {
    "gun": "2026-09-04",
    "vardiya": "B",
    "metin": "Separatör çıkışında gluten hattı beklenenden koyu geldi, numune laboratuvara gönderildi."
  },
  {
    "gun": "2026-09-05",
    "vardiya": "A",
    "metin": "Kurutucu 1 fanında ses var, takibe alındı."
  },
  {
    "gun": "2026-09-06",
    "vardiya": "C",
    "metin": "Mısır silosu 3 boşaldı, siloya geçiş yapıldı."
  },
  {
    "gun": "2026-09-08",
    "vardiya": "B",
    "metin": "Separatör 2 devri hâlâ düşük çalışıyor, bakım formu bekliyor."
  },
  {
    "gun": "2026-09-09",
    "vardiya": "A",
    "metin": "Vardiya sorunsuz."
  },
  {
    "gun": "2026-09-10",
    "vardiya": "C",
    "metin": "Elek değişimi yapıldı, 40 dakika duruş."
  },
  {
    "gun": "2026-09-11",
    "vardiya": "B",
    "metin": "Gluten hattında katı madde yine yüksek. Ayırma tarafına bakılmalı."
  },
  {
    "gun": "2026-09-12",
    "vardiya": "A",
    "metin": "Buhar hattı vanası sızdırıyor, izole edildi."
  },
  {
    "gun": "2026-09-13",
    "vardiya": "C",
    "metin": "Vardiya sorunsuz, üretim programa uygun."
  }
];

/** Nişastanın ton başına satış değeri, kayıp fiyatlamada kullanılıyor. */
export const NISASTA_FIYAT_TL_TON = 28000;
