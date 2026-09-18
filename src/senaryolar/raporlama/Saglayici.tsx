"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AjanKosusu } from "@/lib/ajan/cekirdek";
import {
  raporlamaKosusu,
  type RaporlamaCiktisi,
} from "@/senaryolar/raporlama/senaryo";

interface Baglam {
  kosu: AjanKosusu<RaporlamaCiktisi>;
  cikti: RaporlamaCiktisi;
  durum: "hazir" | "calisiyor" | "tamam";
  gorunurAdim: number;
  ajaniBaslat: () => void;
  /** Yönetimin bu dönem öne aldığı sapma. Başlangıçta ajanın önerisi. */
  oncelik: string;
  oncelikSec: (id: string) => void;
}

const RaporBaglami = createContext<Baglam | null>(null);

export function RaporSaglayici({ children }: { children: React.ReactNode }) {
  const kosu = useMemo(() => raporlamaKosusu(), []);
  const cikti = kosu.ayrinti;

  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "tamam">("hazir");
  const [gorunurAdim, setGorunurAdim] = useState(0);
  const [oncelik, setOncelik] = useState(kosu.kararlar[0]?.onerilen ?? "");

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

  const oncelikSec = useCallback((id: string) => setOncelik(id), []);

  const deger = useMemo<Baglam>(
    () => ({ kosu, cikti, durum, gorunurAdim, ajaniBaslat, oncelik, oncelikSec }),
    [kosu, cikti, durum, gorunurAdim, ajaniBaslat, oncelik, oncelikSec],
  );

  return <RaporBaglami.Provider value={deger}>{children}</RaporBaglami.Provider>;
}

export function useRaporBaglami(): Baglam {
  const baglam = useContext(RaporBaglami);
  if (!baglam) throw new Error("useRaporBaglami, RaporSaglayici içinde kullanılmalı.");
  return baglam;
}
