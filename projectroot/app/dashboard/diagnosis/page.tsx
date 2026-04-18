import { DiagnosisWorkspace } from "@/components/dashboard/diagnosis-workspace";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function DiagnosisPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        eyebrow="Collaborative Diagnosis"
        title="Case-based specialist collaboration"
        description="Support multi-author diagnosis workflows where multiple care-team entries can be attached to a single case thread and reviewed together."
        demoMode={data.demoMode}
      />
      <DiagnosisWorkspace
        demoMode={data.demoMode}
        initialEntries={data.diagnoses}
        canEdit={data.viewer.role === "doctor"}
        canViewSensitive={data.viewer.canViewSensitive}
      />
    </>
  );
}
