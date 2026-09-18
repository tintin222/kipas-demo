import { AltNav } from "@/components/Kabuk";
import { BakimSaglayici } from "@/senaryolar/bakim/Saglayici";

export default function BakimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AltNav senaryoId="bakim" />
      <BakimSaglayici>{children}</BakimSaglayici>
    </>
  );
}
