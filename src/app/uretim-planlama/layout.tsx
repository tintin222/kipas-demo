import { AltNav } from "@/components/Kabuk";
import { PlanSaglayici } from "@/senaryolar/uretim-planlama/Saglayici";

export default function UretimPlanlamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AltNav senaryoId="uretim-planlama" />
      <PlanSaglayici>{children}</PlanSaglayici>
    </>
  );
}
