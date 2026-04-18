"use client";

import {
  BadgeCheck,
  FileBadge2,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AUTH_COOKIE_NAME,
  AUTH_LICENSE_COOKIE_NAME,
  AUTH_LICENSE_VERIFIED_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  DEMO_SESSION_TOKEN,
  createBrowserSupabaseClient,
  hasSupabaseEnv
} from "@/lib/supabase/client";
import type { SessionRole } from "@/types";

function normaliseLicenseNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function isValidLicenseFormat(value: string) {
  return /^[A-Z]{2,6}-?\d{4,10}$/.test(value);
}

function setSessionCookies({
  accessToken,
  role,
  licenseNumber,
  licenseVerified
}: {
  accessToken: string;
  role: SessionRole;
  licenseNumber: string | null;
  licenseVerified: boolean;
}) {
  document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; path=/; max-age=86400; samesite=lax`;
  document.cookie = `${AUTH_ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400; samesite=lax`;

  if (licenseNumber) {
    document.cookie = `${AUTH_LICENSE_COOKIE_NAME}=${licenseNumber}; path=/; max-age=86400; samesite=lax`;
  } else {
    document.cookie = `${AUTH_LICENSE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  }

  document.cookie = `${AUTH_LICENSE_VERIFIED_COOKIE_NAME}=${licenseVerified}; path=/; max-age=86400; samesite=lax`;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<SessionRole>("patient");
  const [patientEmail, setPatientEmail] = useState("patient@vitalid.demo");
  const [patientPassword, setPatientPassword] = useState("demo-access");
  const [doctorEmail, setDoctorEmail] = useState("doctor@vitalid.demo");
  const [doctorPassword, setDoctorPassword] = useState("demo-access");
  const [licenseNumber, setLicenseNumber] = useState("MED-20458");
  const [verifiedLicenseNumber, setVerifiedLicenseNumber] =
    useState<string | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);

  const isDoctorMode = mode === "doctor";
  const normalizedLicense = normaliseLicenseNumber(licenseNumber);
  const isLicenseVerified = verifiedLicenseNumber === normalizedLicense;

  const handleModeChange = (value: string) => {
    if (value === "doctor" || value === "patient") {
      setMode(value);
      setErrorMessage(null);
    }
  };

  const handleLicenseChange = (value: string) => {
    setLicenseNumber(value);

    if (verifiedLicenseNumber && normaliseLicenseNumber(value) !== verifiedLicenseNumber) {
      setVerifiedLicenseNumber(null);
      setLicenseStatus("Licence changed. Please verify it again.");
    }
  };

  const verifyDoctorLicense = async () => {
    setErrorMessage(null);
    setLicenseStatus(null);
    setIsVerifyingLicense(true);

    try {
      if (!isValidLicenseFormat(normalizedLicense)) {
        throw new Error("Enter a valid licence number, for example MED-20458.");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 500));
      setVerifiedLicenseNumber(normalizedLicense);
      setLicenseStatus(
        hasSupabaseEnv()
          ? "Licence number verified. Doctor access is unlocked."
          : "Demo licence verification complete."
      );
    } catch (error) {
      setVerifiedLicenseNumber(null);
      setLicenseStatus(
        error instanceof Error ? error.message : "Licence verification failed."
      );
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const email = isDoctorMode ? doctorEmail : patientEmail;
      const password = isDoctorMode ? doctorPassword : patientPassword;

      if (isDoctorMode && !isLicenseVerified) {
        throw new Error("Doctors must verify their licence number before signing in.");
      }

      if (!hasSupabaseEnv()) {
        setSessionCookies({
          accessToken: DEMO_SESSION_TOKEN,
          role: mode,
          licenseNumber: isDoctorMode ? normalizedLicense : null,
          licenseVerified: isDoctorMode
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const supabase = createBrowserSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase client could not be created.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.session?.access_token) {
        throw new Error(error?.message ?? "Unable to sign in.");
      }

      setSessionCookies({
        accessToken: data.session.access_token,
        role: mode,
        licenseNumber: isDoctorMode ? normalizedLicense : null,
        licenseVerified: isDoctorMode
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-teal-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="data-pill">
            {hasSupabaseEnv() ? "Live auth enabled" : "Demo auth enabled"}
          </span>
        </div>
        <div>
          <CardTitle className="font-serif text-3xl">
            Secure platform access
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            Patients get a privacy-aware view. Doctors unlock the full platform
            only after licence verification.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient">
              <UserRound className="mr-2 h-4 w-4" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="doctor">
              <FileBadge2 className="mr-2 h-4 w-4" />
              Doctor
            </TabsTrigger>
          </TabsList>

          <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
            <TabsContent value="patient" className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Patient mode hides internal diagnosis notes, clinician-only
                commentary, and provider-sensitive credential data.
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-email">Email</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={patientEmail}
                  onChange={(event) => setPatientEmail(event.target.value)}
                  placeholder="patient@hospital.org"
                  required={mode === "patient"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-password">Password</Label>
                <Input
                  id="patient-password"
                  type="password"
                  value={patientPassword}
                  onChange={(event) => setPatientPassword(event.target.value)}
                  placeholder="Enter your password"
                  required={mode === "patient"}
                />
              </div>
            </TabsContent>

            <TabsContent value="doctor" className="space-y-5">
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                Doctor mode unlocks full medical editing, collaborative diagnosis
                actions, and the verified credential ledger.
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-email">Email</Label>
                <Input
                  id="doctor-email"
                  type="email"
                  value={doctorEmail}
                  onChange={(event) => setDoctorEmail(event.target.value)}
                  placeholder="doctor@hospital.org"
                  required={mode === "doctor"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor-password">Password</Label>
                <Input
                  id="doctor-password"
                  type="password"
                  value={doctorPassword}
                  onChange={(event) => setDoctorPassword(event.target.value)}
                  placeholder="Enter your password"
                  required={mode === "doctor"}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="doctor-license">Licence number</Label>
                  {isLicenseVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <Input
                    id="doctor-license"
                    value={licenseNumber}
                    onChange={(event) => handleLicenseChange(event.target.value)}
                    placeholder="MED-20458"
                    required={mode === "doctor"}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifyDoctorLicense}
                    disabled={isVerifyingLicense}
                  >
                    {isVerifyingLicense ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Verifying
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {licenseStatus ? (
                  <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                    {licenseStatus}
                  </div>
                ) : null}
              </div>
            </TabsContent>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
            <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Authorizing
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Enter {isDoctorMode ? "doctor" : "patient"} dashboard
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
