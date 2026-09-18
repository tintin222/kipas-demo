"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { HATLAR, MEVCUT_PROGRAM } from "@/data/seed";
import { gerekceYaz, simuleEt, type AjanCiktisi } from "@/lib/planner";
import type { AjanKosusu } from "@/lib/ajan/cekirdek";
import type { Campaign, LineId, PlanResult } from "@/lib/types";
import { uretimPlanlamaKosusu } from "@/senaryolar/uretim-planlama/senaryo";

export type Secim = "maliyet" | "termin" | "mevcut" | "duzenlenmis";

const PROGRAM_ADI: Record<Secim, string> = {
  maliyet: "Ajan önerisi",
  termin: "Termin öncelikli alternatif",
  mevcut: "Mevcut program",
  duzenlenmis: "Elde düzenlenmiş program",
};

interface Baglam {
  kosu: AjanKosusu<AjanCiktisi>;
  cikti: AjanCiktisi;
  durum: "hazir" | "calisiyor" | "tamam";
  gorunurAdim: number;
  ajaniBaslat: () => void;
  secim: Secim;
  secimiDegistir: (s: Secim) => void;
  aktifProgram: Record<LineId, Campaign[]>;
  aktifPlan: PlanResult;
  kampanyaTasi: (hat: LineId, sira: number, yon: -1 | 1) => void;
  onaylandi: boolean;
  onayla: () => void;
  onayiGeriAl: () => void;
}

const PlanBaglami = createContext<Baglam | null>(null);

const programKopyala = (
  p: Record<LineId, Campaign[]>,
): Record<LineId, Campaign[]> => {
  const kopya = {} as Record<LineId, Campaign[]>;
  for (const hat of HATLAR) kopya[hat.id] = (p[hat.id] ?? []).map((k) => ({ ...k }));
  return kopya;
};

export function PlanSaglayici({ children }: { children: React.ReactNode }) {
  const kosu = useMemo(() => uretimPlanlamaKosusu(), []);
  const cikti = kosu.ayrinti;

  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "tamam">("hazir");
  const [gorunurAdim, setGorunurAdim] = useState(0);
  const [secim, setSecim] = useState<Secim>("maliyet");
  const [onaylandi, setOnaylandi] = useState(false);
  const [aktifProgram, setAktifProgram] = useState<Record<LineId, Campaign[]>>(
    () => programKopyala(cikti.program),
  );

  useEffect(() => {
    if (durum !== "calisiyor") return;
    const zamanlayici = setInterval(() => {
      setGorunurAdim((n) => {
        if (n >= kosu.adimlar.length) {
          clearInterval(zamanlayici);
          setDurum("tamam");
          return n;
        }
        return n + 1;
      });
    }, 520);
    return () => clearInterval(zamanlayici);
  }, [durum, kosu.adimlar.length]);

  const ajaniBaslat = useCallback(() => {
    setGorunurAdim(0);
    setDurum("calisiyor");
  }, []);

  const secimiDegistir = useCallback(
    (yeni: Secim) => {
      setSecim(yeni);
      setOnaylandi(false);
      if (yeni === "maliyet") setAktifProgram(programKopyala(cikti.program));
      if (yeni === "termin")
        setAktifProgram(programKopyala(cikti.alternatifProgram));
      if (yeni === "mevcut") setAktifProgram(programKopyala(MEVCUT_PROGRAM));
    },
    [cikti],
  );

  const kampanyaTasi = useCallback(
    (hat: LineId, sira: number, yon: -1 | 1) => {
      setAktifProgram((onceki) => {
        const kopya = programKopyala(onceki);
        const liste = kopya[hat];
        const hedef = sira + yon;
        if (hedef < 0 || hedef >= liste.length) return onceki;
        [liste[sira], liste[hedef]] = [liste[hedef], liste[sira]];
        return kopya;
      });
      setSecim("duzenlenmis");
      setOnaylandi(false);
    },
    [],
  );

  const aktifPlan = useMemo(
    () => gerekceYaz(simuleEt(PROGRAM_ADI[secim], aktifProgram)),
    [secim, aktifProgram],
  );

  const deger: Baglam = {
    kosu,
    cikti,
    durum,
    gorunurAdim,
    ajaniBaslat,
    secim,
    secimiDegistir,
    aktifProgram,
    aktifPlan,
    kampanyaTasi,
    onaylandi,
    onayla: () => setOnaylandi(true),
    onayiGeriAl: () => setOnaylandi(false),
  };

  return <PlanBaglami.Provider value={deger}>{children}</PlanBaglami.Provider>;
}

export const usePlanBaglami = (): Baglam => {
  const b = useContext(PlanBaglami);
  if (!b) throw new Error("PlanSaglayici bulunamadı.");
  return b;
};
