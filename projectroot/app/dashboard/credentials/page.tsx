import { CredentialsTable } from "@/components/dashboard/credentials-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function CredentialsPage() {
  const data = await getDashboardData();

  return (
    <>
      <PageHeader
        eyebrow="Verified Credentials"
        title={
          data.viewer.canViewSensitive
            ? "Trust signals for every clinician and partner"
            : "Trusted providers connected to your care"
        }
        description={
          data.viewer.canViewSensitive
            ? "Give operations teams a professional verification ledger for medical staff, labs, insurers, and external networks participating in each care workflow."
            : "Patient mode shows trust coverage without exposing provider-sensitive verification metadata."
        }
        demoMode={data.demoMode}
      />
      <CredentialsTable
        credentials={data.credentials}
        canViewSensitive={data.viewer.canViewSensitive}
      />
    </>
  );
}
