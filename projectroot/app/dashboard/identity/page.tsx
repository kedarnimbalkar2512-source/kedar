import { PageHeader } from "@/components/dashboard/page-header";
import { MedicalIdForm } from "@/components/dashboard/medical-id-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/utils";

export default async function MedicalIdentityPage() {
  const data = await getDashboardData();
  const latestRecord = data.medicalRecords[0];
  const canEdit = data.viewer.role === "doctor";

  return (
    <>
      <PageHeader
        eyebrow="Medical ID"
        title="Portable patient identity with live clinical context"
        description={
          canEdit
            ? "Maintain a single trusted view of patient demographics, vitals, allergies, conditions, medications, and emergency information."
            : "Review your protected medical identity record. Editing remains restricted to verified doctor sessions."
        }
        demoMode={data.demoMode}
      />

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <MedicalIdForm
            demoMode={data.demoMode}
            latestRecord={latestRecord}
            profile={data.profile}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle>Medical record history</CardTitle>
                <CardDescription>
                  Previous vitals, conditions, and medication snapshots pulled
                  from the `medical_records` table.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Blood Pressure</TableHead>
                      <TableHead>Heart Rate</TableHead>
                      <TableHead>Medication</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.medicalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.recordedAt)}</TableCell>
                        <TableCell>{record.bloodPressure}</TableCell>
                        <TableCell>{record.heartRate} bpm</TableCell>
                        <TableCell>{record.medications.join(", ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current risk flags</CardTitle>
                <CardDescription>
                  Fast-read summary for intake desks and care escalation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-slate-950 p-5 text-slate-50">
                  <p className="text-sm text-slate-400">Emergency contact</p>
                  <p className="mt-2 text-xl font-semibold">
                    {data.profile.emergencyContact}
                  </p>
                </div>
                <div className="panel-muted p-5">
                  <p className="text-sm text-slate-500">Known allergies</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestRecord.allergies.map((allergy) => (
                      <Badge key={allergy} variant="warning">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="panel-muted p-5">
                  <p className="text-sm text-slate-500">Chronic conditions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {latestRecord.conditions.map((condition) => (
                      <Badge key={condition} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
