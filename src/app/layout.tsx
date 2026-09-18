import type { Metadata } from "next";
import { UstBar } from "@/components/Kabuk";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kipaş Ajan Platformu · Nişasta Fabrikası Demo",
  description:
    "Sipariş, stok ve üretim planlamayı tek ekranda birleştiren ve üretim programı öneren ajan demosu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <UstBar />
        {children}
        <div className="sayfa">
          <p className="dipnot">
            Bu ekranlardaki ürün, sipariş, stok ve maliyet verilerinin tamamı
            gösterim amacıyla üretilmiş örnek verilerdir. Gerçek Kipaş verisi
            kullanılmamıştır.
          </p>
        </div>
      </body>
    </html>
  );
}
