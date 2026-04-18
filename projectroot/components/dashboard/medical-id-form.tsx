"use client";

import { HeartPulse, LoaderCircle, ShieldPlus } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { MedicalRecord, ProfileSummary } from "@/types";

interface MedicalIdFormProps {
  demoMode: boolean;
  latestRecord: MedicalRecord;
  profile: ProfileSummary;
  canEdit: boolean;
}

function toCsv(values: string[]) {
  return values.join(", ");
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MedicalIdForm({
  demoMode,
  latestRecord,
  profile,
  canEdit
}: MedicalIdFormProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [dob, setDob] = useState(profile.dob);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [insuranceProvider, setInsuranceProvider] = useState(
    profile.insuranceProvider
  );
  const [bloodPressure, setBloodPressure] = useState(latestRecord.bloodPressure);
  const [heartRate, setHeartRate] = useState(String(latestRecord.heartRate));
  const [oxygenSaturation, setOxygenSaturation] = useState(
    String(latestRecord.oxygenSaturation)
  );
  const [temperature, setTemperature] = useState(latestRecord.temperature);
  const [heightCm, setHeightCm] = useState(String(latestRecord.heightCm));
  const [weightKg, setWeightKg] = useState(String(latestRecord.weightKg));
  const [allergies, setAllergies] = useState(toCsv(latestRecord.allergies));
  const [conditions, setConditions] = useState(toCsv(latestRecord.conditions));
  const [medications, setMedications] = useState(toCsv(latestRecord.medications));
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const profileHighlights = useMemo(
    () => [
      { label: "Blood Group", value: profile.bloodType },
      { label: "Active Allergies", value: fromCsv(allergies).length.toString() },
      { label: "Current Medications", value: fromCsv(medications).length.toString() }
    ],
    [allergies, medications, profile.bloodType]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      const supabase = createBrowserSupabaseClient();

      if (supabase && !demoMode) {
        const profilePayload = {
          id: profile.id,
          full_name: fullName,
          role: profile.role,
          blood_type: profile.bloodType,
          emergency_contact: emergencyContact,
          insurance_provider: insuranceProvider,
          dob
        };

        const recordPayload = {
          recorded_at: new Date().toISOString(),
          blood_pressure: bloodPressure,
          heart_rate: Number(heartRate),
          oxygen_saturation: Number(oxygenSaturation),
          temperature,
          height_cm: Number(heightCm),
          weight_kg: Number(weightKg),
          allergies: fromCsv(allergies),
          conditions: fromCsv(conditions),
          medications: fromCsv(medications)
        };

        const [profileResult, recordResult] = await Promise.all([
          supabase.from("profiles").upsert([profilePayload]),
          supabase.from("medical_records").insert([recordPayload])
        ]);

        if (profileResult.error || recordResult.error) {
          throw new Error(
            profileResult.error?.message ??
              recordResult.error?.message ??
              "Unable to save medical record."
          );
        }
      }

      setStatus(
        demoMode
          ? "Saved to demo session. Connect Supabase to persist the profile."
          : "Medical ID updated and latest vitals recorded."
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save medical ID.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-teal-700" />
            {canEdit ? "Medical ID editor" : "Medical ID summary"}
          </CardTitle>
          <CardDescription>
            {canEdit
              ? "Capture a trusted snapshot of patient identity, core vitals, and long-term history in one view."
              : "Patient mode provides a read-only summary. Protected medical fields can only be edited by doctors."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Patient name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-contact">Emergency contact</Label>
                <Input
                  id="emergency-contact"
                  value={emergencyContact}
                  onChange={(event) => setEmergencyContact(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance-provider">Insurance provider</Label>
                <Input
                  id="insurance-provider"
                  value={insuranceProvider}
                  onChange={(event) => setInsuranceProvider(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="blood-pressure">Blood pressure</Label>
                <Input
                  id="blood-pressure"
                  value={bloodPressure}
                  onChange={(event) => setBloodPressure(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart rate</Label>
                <Input
                  id="heart-rate"
                  type="number"
                  value={heartRate}
                  onChange={(event) => setHeartRate(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygen">Oxygen saturation</Label>
                <Input
                  id="oxygen"
                  type="number"
                  value={oxygenSaturation}
                  onChange={(event) => setOxygenSaturation(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={temperature}
                  onChange={(event) => setTemperature(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">History</Label>
                <Textarea
                  id="conditions"
                  value={conditions}
                  onChange={(event) => setConditions(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea
                  id="medications"
                  value={medications}
                  onChange={(event) => setMedications(event.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>

            {status ? (
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {status}
              </div>
            ) : null}

            {canEdit ? (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving record
                  </>
                ) : (
                  "Save medical ID"
                )}
              </Button>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Doctor login is required to edit protected medical identity fields.
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-teal-700" />
            Live summary
          </CardTitle>
          <CardDescription>
            A compact high-trust display designed for intake desks, emergency
            review, and specialist handoffs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl bg-slate-950 px-5 py-6 text-slate-50">
            <p className="text-sm text-slate-300">{profile.role}</p>
            <h3 className="mt-2 font-serif text-3xl">{fullName}</h3>
            <p className="mt-4 text-sm text-slate-300">Insurance</p>
            <p className="mt-1 text-base">{insuranceProvider}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {profileHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel-muted grid gap-3 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Blood pressure</span>
              <span className="font-semibold text-slate-900">{bloodPressure}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Heart rate</span>
              <span className="font-semibold text-slate-900">{heartRate} bpm</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Oxygen</span>
              <span className="font-semibold text-slate-900">
                {oxygenSaturation}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-semibold text-slate-900">{weightKg} kg</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
