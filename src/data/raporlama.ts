import type { AylikKayit, Sirket } from "@/lib/raporlama";

/**
 * Holding yönetim raporu senaryosunun tohum verisi.
 *
 * Şirket adları gerçek Kipaş şirketlerinden esinlenmiştir; rakamların tamamı
 * kurgudur. Ölçek, USD/TRY 48,8 varsayımıyla büyük bir Türk holdingine göre
 * seçilmiştir; nişasta cirosu satın alma senaryosundaki 320.000 t/yıl kapasiteyle
 * tutarlıdır.
 */

/** Raporun kapsadığı dönemler, eskiden yeniye. */
export const AYLAR = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08"
];

/** Raporlanan dönem. */
export const DONEM = AYLAR[AYLAR.length - 1]!;

export const SIRKETLER: Sirket[] = [
  {
    "id": "TEK",
    "ad": "Kipaş Tekstil",
    "sektor": "Tekstil",
    "kapasiteTon": 18500
  },
  {
    "id": "CIM",
    "ad": "KÇS Çimento",
    "sektor": "Çimento ve Beton",
    "kapasiteTon": 310000
  },
  {
    "id": "KAG",
    "ad": "Kipaş Kağıt",
    "sektor": "Kağıt ve Ambalaj",
    "kapasiteTon": 42000
  },
  {
    "id": "NIS",
    "ad": "Kipaş Nişasta",
    "sektor": "Nişasta",
    "kapasiteTon": 27000
  },
  {
    "id": "ENE",
    "ad": "Kipaş Enerji",
    "sektor": "Enerji",
    "kapasiteTon": 0
  }
];

export const KAYITLAR: AylikKayit[] = [
  {
    "sirketId": "TEK",
    "ay": "2026-03",
    "ciroTL": 2632000000,
    "planCiroTL": 2800000000,
    "maliyetTL": 2158240000,
    "maliyetKalemleri": {
      "hammadde": 1368640000,
      "enerji": 184240000,
      "iscilik": 368480000,
      "diger": 236880000
    },
    "uretimTon": 16280,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.88,
    "stokGunKapsama": 38,
    "stokDegeriTL": 2733770667
  },
  {
    "sirketId": "TEK",
    "ay": "2026-04",
    "ciroTL": 2716000000,
    "planCiroTL": 2800000000,
    "maliyetTL": 2240700000,
    "maliyetKalemleri": {
      "hammadde": 1423184000,
      "enerji": 192836000,
      "iscilik": 380240000,
      "diger": 244440000
    },
    "uretimTon": 16650,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.9,
    "stokGunKapsama": 39,
    "stokDegeriTL": 2912910000
  },
  {
    "sirketId": "TEK",
    "ay": "2026-05",
    "ciroTL": 2800000000,
    "planCiroTL": 2856000000,
    "maliyetTL": 2293200000,
    "maliyetKalemleri": {
      "hammadde": 1447600000,
      "enerji": 201600000,
      "iscilik": 392000000,
      "diger": 252000000
    },
    "uretimTon": 17020,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.92,
    "stokGunKapsama": 41,
    "stokDegeriTL": 3134040000
  },
  {
    "sirketId": "TEK",
    "ay": "2026-06",
    "ciroTL": 2856000000,
    "planCiroTL": 2912000000,
    "maliyetTL": 2347632000,
    "maliyetKalemleri": {
      "hammadde": 1490832000,
      "enerji": 199920000,
      "iscilik": 399840000,
      "diger": 257040000
    },
    "uretimTon": 17205,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.93,
    "stokGunKapsama": 40,
    "stokDegeriTL": 3130176000
  },
  {
    "sirketId": "TEK",
    "ay": "2026-07",
    "ciroTL": 2772000000,
    "planCiroTL": 2940000000,
    "maliyetTL": 2297988000,
    "maliyetKalemleri": {
      "hammadde": 1458072000,
      "enerji": 202356000,
      "iscilik": 388080000,
      "diger": 249480000
    },
    "uretimTon": 16650,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.9,
    "stokGunKapsama": 42,
    "stokDegeriTL": 3217183200
  },
  {
    "sirketId": "TEK",
    "ay": "2026-08",
    "ciroTL": 2604000000,
    "planCiroTL": 2968000000,
    "maliyetTL": 2169132000,
    "maliyetKalemleri": {
      "hammadde": 1377516000,
      "enerji": 192696000,
      "iscilik": 364560000,
      "diger": 234360000
    },
    "uretimTon": 15540,
    "kapasiteTon": 18500,
    "kapasiteKullanimi": 0.84,
    "stokGunKapsama": 44,
    "stokDegeriTL": 3181393600
  },
  {
    "sirketId": "CIM",
    "ay": "2026-03",
    "ciroTL": 1012000000,
    "planCiroTL": 1045000000,
    "maliyetTL": 698280000,
    "maliyetKalemleri": {
      "hammadde": 212520000,
      "enerji": 293480000,
      "iscilik": 91080000,
      "diger": 101200000
    },
    "uretimTon": 257300,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.83,
    "stokGunKapsama": 14,
    "stokDegeriTL": 325864000
  },
  {
    "sirketId": "CIM",
    "ay": "2026-04",
    "ciroTL": 1056000000,
    "planCiroTL": 1078000000,
    "maliyetTL": 732864000,
    "maliyetKalemleri": {
      "hammadde": 219648000,
      "enerji": 311520000,
      "iscilik": 96096000,
      "diger": 105600000
    },
    "uretimTon": 269700,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.87,
    "stokGunKapsama": 13,
    "stokDegeriTL": 317574400
  },
  {
    "sirketId": "CIM",
    "ay": "2026-05",
    "ciroTL": 1111000000,
    "planCiroTL": 1100000000,
    "maliyetTL": 783255000,
    "maliyetKalemleri": {
      "hammadde": 236643000,
      "enerji": 335522000,
      "iscilik": 99990000,
      "diger": 111100000
    },
    "uretimTon": 282100,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.91,
    "stokGunKapsama": 12,
    "stokDegeriTL": 313302000
  },
  {
    "sirketId": "CIM",
    "ay": "2026-06",
    "ciroTL": 1155000000,
    "planCiroTL": 1133000000,
    "maliyetTL": 828135000,
    "maliyetKalemleri": {
      "hammadde": 243705000,
      "enerji": 362670000,
      "iscilik": 106260000,
      "diger": 115500000
    },
    "uretimTon": 291400,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.94,
    "stokGunKapsama": 12,
    "stokDegeriTL": 331254000
  },
  {
    "sirketId": "CIM",
    "ay": "2026-07",
    "ciroTL": 1166000000,
    "planCiroTL": 1144000000,
    "maliyetTL": 852346000,
    "maliyetKalemleri": {
      "hammadde": 243694000,
      "enerji": 385946000,
      "iscilik": 106106000,
      "diger": 116600000
    },
    "uretimTon": 294500,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.95,
    "stokGunKapsama": 13,
    "stokDegeriTL": 369349933
  },
  {
    "sirketId": "CIM",
    "ay": "2026-08",
    "ciroTL": 1144000000,
    "planCiroTL": 1133000000,
    "maliyetTL": 861432000,
    "maliyetKalemleri": {
      "hammadde": 242528000,
      "enerji": 398112000,
      "iscilik": 106392000,
      "diger": 114400000
    },
    "uretimTon": 288300,
    "kapasiteTon": 310000,
    "kapasiteKullanimi": 0.93,
    "stokGunKapsama": 14,
    "stokDegeriTL": 402001600
  },
  {
    "sirketId": "KAG",
    "ay": "2026-03",
    "ciroTL": 891000000,
    "planCiroTL": 882000000,
    "maliyetTL": 721710000,
    "maliyetKalemleri": {
      "hammadde": 409860000,
      "enerji": 142560000,
      "iscilik": 89100000,
      "diger": 80190000
    },
    "uretimTon": 37800,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.9,
    "stokGunKapsama": 31,
    "stokDegeriTL": 745767000
  },
  {
    "sirketId": "KAG",
    "ay": "2026-04",
    "ciroTL": 909000000,
    "planCiroTL": 900000000,
    "maliyetTL": 740835000,
    "maliyetKalemleri": {
      "hammadde": 420867000,
      "enerji": 147258000,
      "iscilik": 90900000,
      "diger": 81810000
    },
    "uretimTon": 38220,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.91,
    "stokGunKapsama": 34,
    "stokDegeriTL": 839613000
  },
  {
    "sirketId": "KAG",
    "ay": "2026-05",
    "ciroTL": 900000000,
    "planCiroTL": 900000000,
    "maliyetTL": 735300000,
    "maliyetKalemleri": {
      "hammadde": 419400000,
      "enerji": 144900000,
      "iscilik": 90000000,
      "diger": 81000000
    },
    "uretimTon": 37800,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.9,
    "stokGunKapsama": 39,
    "stokDegeriTL": 955890000
  },
  {
    "sirketId": "KAG",
    "ay": "2026-06",
    "ciroTL": 882000000,
    "planCiroTL": 900000000,
    "maliyetTL": 721476000,
    "maliyetKalemleri": {
      "hammadde": 409248000,
      "enerji": 144648000,
      "iscilik": 88200000,
      "diger": 79380000
    },
    "uretimTon": 36960,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.88,
    "stokGunKapsama": 46,
    "stokDegeriTL": 1106263200
  },
  {
    "sirketId": "KAG",
    "ay": "2026-07",
    "ciroTL": 873000000,
    "planCiroTL": 909000000,
    "maliyetTL": 716733000,
    "maliyetKalemleri": {
      "hammadde": 408564000,
      "enerji": 142299000,
      "iscilik": 87300000,
      "diger": 78570000
    },
    "uretimTon": 36540,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.87,
    "stokGunKapsama": 54,
    "stokDegeriTL": 1290119400
  },
  {
    "sirketId": "KAG",
    "ay": "2026-08",
    "ciroTL": 864000000,
    "planCiroTL": 909000000,
    "maliyetTL": 713664000,
    "maliyetKalemleri": {
      "hammadde": 406944000,
      "enerji": 142560000,
      "iscilik": 86400000,
      "diger": 77760000
    },
    "uretimTon": 36120,
    "kapasiteTon": 42000,
    "kapasiteKullanimi": 0.86,
    "stokGunKapsama": 63,
    "stokDegeriTL": 1498694400
  },
  {
    "sirketId": "NIS",
    "ay": "2026-03",
    "ciroTL": 741000000,
    "planCiroTL": 780000000,
    "maliyetTL": 622440000,
    "maliyetKalemleri": {
      "hammadde": 429780000,
      "enerji": 81510000,
      "iscilik": 51870000,
      "diger": 59280000
    },
    "uretimTon": 22680,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.84,
    "stokGunKapsama": 26,
    "stokDegeriTL": 539448000
  },
  {
    "sirketId": "NIS",
    "ay": "2026-04",
    "ciroTL": 764400000,
    "planCiroTL": 795600000,
    "maliyetTL": 648975600,
    "maliyetKalemleri": {
      "hammadde": 449467200,
      "enerji": 84848400,
      "iscilik": 53508000,
      "diger": 61152000
    },
    "uretimTon": 23220,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.86,
    "stokGunKapsama": 27,
    "stokDegeriTL": 584078040
  },
  {
    "sirketId": "NIS",
    "ay": "2026-05",
    "ciroTL": 780000000,
    "planCiroTL": 803400000,
    "maliyetTL": 654420000,
    "maliyetKalemleri": {
      "hammadde": 449280000,
      "enerji": 88140000,
      "iscilik": 54600000,
      "diger": 62400000
    },
    "uretimTon": 23760,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.88,
    "stokGunKapsama": 29,
    "stokDegeriTL": 632606000
  },
  {
    "sirketId": "NIS",
    "ay": "2026-06",
    "ciroTL": 787800000,
    "planCiroTL": 819000000,
    "maliyetTL": 668054400,
    "maliyetKalemleri": {
      "hammadde": 461650800,
      "enerji": 88233600,
      "iscilik": 55146000,
      "diger": 63024000
    },
    "uretimTon": 23490,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.87,
    "stokGunKapsama": 28,
    "stokDegeriTL": 623517440
  },
  {
    "sirketId": "NIS",
    "ay": "2026-07",
    "ciroTL": 772200000,
    "planCiroTL": 826800000,
    "maliyetTL": 661775400,
    "maliyetKalemleri": {
      "hammadde": 457914600,
      "enerji": 88030800,
      "iscilik": 54054000,
      "diger": 61776000
    },
    "uretimTon": 22410,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.83,
    "stokGunKapsama": 30,
    "stokDegeriTL": 661775400
  },
  {
    "sirketId": "NIS",
    "ay": "2026-08",
    "ciroTL": 733200000,
    "planCiroTL": 834600000,
    "maliyetTL": 631285200,
    "maliyetKalemleri": {
      "hammadde": 439186800,
      "enerji": 82118400,
      "iscilik": 51324000,
      "diger": 58656000
    },
    "uretimTon": 21060,
    "kapasiteTon": 27000,
    "kapasiteKullanimi": 0.78,
    "stokGunKapsama": 33,
    "stokDegeriTL": 694413720
  },
  {
    "sirketId": "ENE",
    "ay": "2026-03",
    "ciroTL": 632400000,
    "planCiroTL": 620000000,
    "maliyetTL": 347820000,
    "maliyetKalemleri": {
      "hammadde": 215016000,
      "enerji": 12648000,
      "iscilik": 50592000,
      "diger": 69564000
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.91,
    "stokGunKapsama": 4,
    "stokDegeriTL": 46376000
  },
  {
    "sirketId": "ENE",
    "ay": "2026-04",
    "ciroTL": 644800000,
    "planCiroTL": 626200000,
    "maliyetTL": 353350400,
    "maliyetKalemleri": {
      "hammadde": 216652800,
      "enerji": 12896000,
      "iscilik": 51584000,
      "diger": 72217600
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.93,
    "stokGunKapsama": 4,
    "stokDegeriTL": 47113387
  },
  {
    "sirketId": "ENE",
    "ay": "2026-05",
    "ciroTL": 638600000,
    "planCiroTL": 632400000,
    "maliyetTL": 353145800,
    "maliyetKalemleri": {
      "hammadde": 218401200,
      "enerji": 12772000,
      "iscilik": 51088000,
      "diger": 70884600
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.92,
    "stokGunKapsama": 5,
    "stokDegeriTL": 58857633
  },
  {
    "sirketId": "ENE",
    "ay": "2026-06",
    "ciroTL": 657200000,
    "planCiroTL": 638600000,
    "maliyetTL": 359488400,
    "maliyetKalemleri": {
      "hammadde": 219504800,
      "enerji": 13144000,
      "iscilik": 52576000,
      "diger": 74263600
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.95,
    "stokGunKapsama": 4,
    "stokDegeriTL": 47931787
  },
  {
    "sirketId": "ENE",
    "ay": "2026-07",
    "ciroTL": 669600000,
    "planCiroTL": 644800000,
    "maliyetTL": 363592800,
    "maliyetKalemleri": {
      "hammadde": 221637600,
      "enerji": 13392000,
      "iscilik": 53568000,
      "diger": 74995200
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.96,
    "stokGunKapsama": 4,
    "stokDegeriTL": 48479040
  },
  {
    "sirketId": "ENE",
    "ay": "2026-08",
    "ciroTL": 675800000,
    "planCiroTL": 651000000,
    "maliyetTL": 366959400,
    "maliyetKalemleri": {
      "hammadde": 222338200,
      "enerji": 13516000,
      "iscilik": 54064000,
      "diger": 77041200
    },
    "uretimTon": 0,
    "kapasiteTon": 0,
    "kapasiteKullanimi": 0.96,
    "stokGunKapsama": 5,
    "stokDegeriTL": 61159900
  }
];

export const sirketBul = (id: string): Sirket | undefined =>
  SIRKETLER.find((s) => s.id === id);

export const kayitBul = (sirketId: string, ay: string): AylikKayit | undefined =>
  KAYITLAR.find((k) => k.sirketId === sirketId && k.ay === ay);

/** Bir şirketin bütün dönemleri, eskiden yeniye. */
export const sirketKayitlari = (sirketId: string): AylikKayit[] =>
  AYLAR.map((ay) => kayitBul(sirketId, ay)!).filter(Boolean);
