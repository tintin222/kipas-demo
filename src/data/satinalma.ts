import type { CornLot, MarketContext, Supplier } from "@/lib/satinalma";

/**
 * Mısır alım senaryosunun tohum verisi.
 *
 * Tedarikçiler ve partiler kurgudur. Piyasa rakamları Eylül 2026 koşullarına
 * göre ölçeklenmiştir; müşteriye güncel diye gösterilmeden önce tazelenmelidir.
 */

/** Kararın alındığı gün. Veri bu tarihe göre kurgulanmıştır. */
export const BUGUN = "2026-09-18";

export const PIYASA: MarketContext = {
  "asOf": "2026-09-18",
  "cornSpotTlPerKg": 14.9,
  "cornSpot30dAgoTlPerKg": 14.1,
  "policyRatePct": 37,
  "commercialTlRatePct": 45,
  "usdTry": 48.8,
  "starchUsdPerTonne": 828
};

export const TEDARIKCILER: Supplier[] = [
  {
    "id": "TED-01",
    "name": "Anadolu Tarım Ürünleri A.Ş.",
    "history": [
      {
        "lotId": "H-1104",
        "date": "2026-06-11",
        "declaredStarchPctDry": 71.8,
        "measuredStarchPctDry": 70.5
      },
      {
        "lotId": "H-1167",
        "date": "2026-07-02",
        "declaredStarchPctDry": 71.4,
        "measuredStarchPctDry": 70.1
      },
      {
        "lotId": "H-1230",
        "date": "2026-08-19",
        "declaredStarchPctDry": 72.0,
        "measuredStarchPctDry": 70.8
      }
    ]
  },
  {
    "id": "TED-02",
    "name": "Çukurova Hububat Ltd. Şti.",
    "history": [
      {
        "lotId": "H-1098",
        "date": "2026-06-05",
        "declaredStarchPctDry": 70.8,
        "measuredStarchPctDry": 70.9
      },
      {
        "lotId": "H-1181",
        "date": "2026-07-14",
        "declaredStarchPctDry": 71.2,
        "measuredStarchPctDry": 71.1
      },
      {
        "lotId": "H-1245",
        "date": "2026-08-27",
        "declaredStarchPctDry": 71.0,
        "measuredStarchPctDry": 71.0
      }
    ]
  },
  {
    "id": "TED-03",
    "name": "Maraş Tohum ve Tarım",
    "history": [
      {
        "lotId": "H-1120",
        "date": "2026-06-20",
        "declaredStarchPctDry": 71.6,
        "measuredStarchPctDry": 71.1
      },
      {
        "lotId": "H-1199",
        "date": "2026-07-29",
        "declaredStarchPctDry": 71.9,
        "measuredStarchPctDry": 71.4
      }
    ]
  },
  {
    "id": "TED-04",
    "name": "Konya Ova Tarım Koop.",
    "history": [
      {
        "lotId": "H-1112",
        "date": "2026-06-16",
        "declaredStarchPctDry": 72.2,
        "measuredStarchPctDry": 72.5
      },
      {
        "lotId": "H-1203",
        "date": "2026-08-01",
        "declaredStarchPctDry": 72.0,
        "measuredStarchPctDry": 72.2
      },
      {
        "lotId": "H-1251",
        "date": "2026-09-02",
        "declaredStarchPctDry": 72.5,
        "measuredStarchPctDry": 72.6
      }
    ]
  },
  {
    "id": "TED-05",
    "name": "Trakya Agro Tedarik A.Ş.",
    "history": [
      {
        "lotId": "H-1087",
        "date": "2026-05-28",
        "declaredStarchPctDry": 70.5,
        "measuredStarchPctDry": 69.1
      },
      {
        "lotId": "H-1175",
        "date": "2026-07-09",
        "declaredStarchPctDry": 70.9,
        "measuredStarchPctDry": 69.4
      },
      {
        "lotId": "H-1238",
        "date": "2026-08-22",
        "declaredStarchPctDry": 70.2,
        "measuredStarchPctDry": 68.8
      }
    ]
  }
];

export const PARTILER: CornLot[] = [
  {
    "id": "LOT-2026-0912",
    "supplierId": "TED-01",
    "origin": "Adana",
    "tonnesAsIs": 1200,
    "priceTlPerKg": 14.35,
    "moisturePct": 16.9,
    "declaredStarchPctDry": 71.8,
    "foreignMatterPct": 2.1,
    "distanceKm": 220,
    "paymentTermDays": 0,
    "deliveryBy": "2026-09-26"
  },
  {
    "id": "LOT-2026-0915",
    "supplierId": "TED-02",
    "origin": "Osmaniye",
    "tonnesAsIs": 1000,
    "priceTlPerKg": 14.8,
    "moisturePct": 15.2,
    "declaredStarchPctDry": 71.2,
    "foreignMatterPct": 1.2,
    "distanceKm": 95,
    "paymentTermDays": 45,
    "deliveryBy": "2026-09-29"
  },
  {
    "id": "LOT-2026-0916",
    "supplierId": "TED-03",
    "origin": "Kahramanmaraş",
    "tonnesAsIs": 900,
    "priceTlPerKg": 14.6,
    "moisturePct": 16.2,
    "declaredStarchPctDry": 71.5,
    "foreignMatterPct": 1.7,
    "distanceKm": 310,
    "paymentTermDays": 30,
    "deliveryBy": "2026-09-24"
  },
  {
    "id": "LOT-2026-0918",
    "supplierId": "TED-04",
    "origin": "Konya",
    "tonnesAsIs": 800,
    "priceTlPerKg": 15.05,
    "moisturePct": 13.6,
    "declaredStarchPctDry": 72.2,
    "foreignMatterPct": 1.0,
    "distanceKm": 140,
    "paymentTermDays": 30,
    "deliveryBy": "2026-10-02"
  },
  {
    "id": "LOT-2026-0919",
    "supplierId": "TED-05",
    "origin": "Tekirdağ",
    "tonnesAsIs": 1500,
    "priceTlPerKg": 14.5,
    "moisturePct": 15.8,
    "declaredStarchPctDry": 70.6,
    "foreignMatterPct": 1.9,
    "distanceKm": 480,
    "paymentTermDays": 0,
    "deliveryBy": "2026-10-05"
  }
];

export const tedarikciBul = (id: string): Supplier | undefined =>
  TEDARIKCILER.find((t) => t.id === id);

export const partiBul = (id: string): CornLot | undefined =>
  PARTILER.find((p) => p.id === id);
