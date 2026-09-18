"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SENARYOLAR } from "@/lib/ajan/senaryolar";

export function UstBar() {
  const yol = usePathname();
  const aktifler = SENARYOLAR.filter((s) => s.durum === "aktif");

  return (
    <header className="ust-bar">
      <div className="ust-bar-ic">
        <Link href="/" className="marka">
          <span className="marka-isaret">KP</span>
          <span>
            Kipaş Ajan Platformu
            <small>Frameworks · örnek uygulama</small>
          </span>
        </Link>
        <nav className="ust-nav">
          <Link href="/" className={yol === "/" ? "etkin" : undefined}>
            Senaryolar
          </Link>
          {aktifler.map((s) => (
            <Link
              key={s.id}
              href={s.kokUrl}
              className={yol.startsWith(s.kokUrl) ? "etkin" : undefined}
            >
              {s.ad}
            </Link>
          ))}
          <span className="demo-etiketi">Demo verisi</span>
        </nav>
      </div>
    </header>
  );
}

export function AltNav({ senaryoId }: { senaryoId: string }) {
  const yol = usePathname();
  const senaryo = SENARYOLAR.find((s) => s.id === senaryoId);
  if (!senaryo || senaryo.bolumler.length === 0) return null;

  return (
    <div className="alt-nav">
      <div className="alt-nav-ic">
        {senaryo.bolumler.map((b) => (
          <Link key={b.href} href={b.href} className={yol === b.href ? "etkin" : undefined}>
            {b.ad}
          </Link>
        ))}
      </div>
    </div>
  );
}
