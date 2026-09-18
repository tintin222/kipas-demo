import { AltNav } from "@/components/Kabuk";
import { RaporSaglayici } from "@/senaryolar/raporlama/Saglayici";

export default function RaporlamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AltNav senaryoId="raporlama" />
      <RaporSaglayici>{children}</RaporSaglayici>
    </>
  );
}
