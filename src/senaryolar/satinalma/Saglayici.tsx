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
  satinalmaKosusu,
  type SatinalmaCiktisi,
} from "@/senaryolar/satinalma/senaryo";

interface Baglam {
  kosu: AjanKosusu<SatinalmaCiktisi>;
  cikti: SatinalmaCiktisi;
  durum: "hazir" | "calisiyor" | "tamam";
  gorunurAdim: number;
  ajaniBaslat: () => void;
  /** Kullanıcının tahsis için seçtiği parti. Başlangıçta ajanın önerisi. */
  secilenParti: string;
  partiSec: (lotId: string) => void;
  onaylandi: boolean;
  onayla: () => void;
  onayiGeriAl: () => void;
}

const SatinalmaBaglami = createContext<Baglam | null>(null);

export function SatinalmaSaglayici({ children }: { children: React.ReactNode }) {
  const kosu = useMemo(() => satinalmaKosusu(), []);
  const cikti = kosu.ayrinti;

  const [durum, setDurum] = useState<"hazir" | "calisiyor" | "tamam">("hazir");
  const [gorunurAdim, setGorunurAdim] = useState(0);
  const [secilenParti, setSecilenParti] = useState(cikti.oneri.lotId);
  const [onaylandi, setOnaylandi] = useState(false);

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

  const partiSec = useCallback((lotId: string) => {
    setSecilenParti(lotId);
    // Seçim değişince onay düşer; tahsis yazısı artık başka bir partiye ait.
    setOnaylandi(false);
  }, []);

  const deger = useMemo<Baglam>(
    () => ({
      kosu,
      cikti,
      durum,
      gorunurAdim,
      ajaniBaslat,
      secilenParti,
      partiSec,
      onaylandi,
      onayla: () => setOnaylandi(true),
      onayiGeriAl: () => setOnaylandi(false),
    }),
    [kosu, cikti, durum, gorunurAdim, ajaniBaslat, secilenParti, partiSec, onaylandi],
  );

  return (
    <SatinalmaBaglami.Provider value={deger}>{children}</SatinalmaBaglami.Provider>
  );
}

export function useSatinalmaBaglami(): Baglam {
  const baglam = useContext(SatinalmaBaglami);
  if (!baglam) {
    throw new Error("useSatinalmaBaglami, SatinalmaSaglayici içinde kullanılmalı.");
  }
  return baglam;
}
