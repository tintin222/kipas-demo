import { AltNav } from "@/components/Kabuk";
import { SatinalmaSaglayici } from "@/senaryolar/satinalma/Saglayici";

export default function SatinalmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AltNav senaryoId="satinalma" />
      <SatinalmaSaglayici>{children}</SatinalmaSaglayici>
    </>
  );
}
