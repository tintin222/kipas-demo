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
  bakimKosusu,
  type BakimCiktisi,
} from "@/senaryolar/bakim/senaryo";

interface Baglam {
  kosu: AjanKosusu<BakimCiktisi>;
  cikti: BakimCiktisi;
  durum: "hazir" | "calisiyor" | "tamam";
  gorunurAdim: number;
  ajaniBaslat: () => void;
  /** Kullanıcının seçtiği aksiyon. Başlangıçta ajanın önerisi. */
  secim: string;
  secimYap: (id: string) => void;
}

const BakimBaglami = createContext<Baglam | null>(null);

export function BakimSaglayici({ children }: { children: React.ReactNode }) {
  const kosu = useMemo(() => bakimKosusu(), []);
  const cikti = kosu.ayrinti;

  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "tamam">("hazir");
  const [gorunurAdim, setGorunurAdim] = useState(0);
  const [secim, setSecim] = useState(kosu.kararlar[0]?.onerilen ?? "");

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

  const secimYap = useCallback((id: string) => setSecim(id), []);

  const deger = useMemo<Baglam>(
    () => ({ kosu, cikti, durum, gorunurAdim, ajaniBaslat, secim, secimYap }),
    [kosu, cikti, durum, gorunurAdim, ajaniBaslat, secim, secimYap],
  );

  return <BakimBaglami.Provider value={deger}>{children}</BakimBaglami.Provider>;
}

export function useBakimBaglami(): Baglam {
  const baglam = useContext(BakimBaglami);
  if (!baglam) throw new Error("useBakimBaglami, BakimSaglayici içinde kullanılmalı.");
  return baglam;
}
