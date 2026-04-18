import type { DashboardData } from "@/types";

export const mockDashboardData: DashboardData = {
  demoMode: true,
  viewer: {
    role: "patient",
    canViewSensitive: false,
    licenseNumber: null,
    licenseVerified: false
  },
  profile: {
    id: "profile-demo-01",
    fullName: "Anika Sharma",
    role: "Patient",
    bloodType: "O+",
    emergencyContact: "+91 98765 44321",
    insuranceProvider: "Apollo Shield Gold",
    dob: "1992-08-14"
  },
  consultations: [
    {
      id: "consult-01",
      title: "Pulmonary follow-up",
      specialist: "Dr. Neel Rao",
      date: "2026-04-21T10:30:00.000Z",
      mode: "Virtual",
      status: "Confirmed"
    },
    {
      id: "consult-02",
      title: "Cardiology review",
      specialist: "Dr. Isha Menon",
      date: "2026-04-25T05:30:00.000Z",
      mode: "In Person",
      status: "Scheduled"
    }
  ],
  credentials: [
    {
      id: "cred-01",
      issuer: "National Medical Register",
      subject: "Dr. Isha Menon",
      type: "Consulting Cardiologist",
      status: "Verified",
      lastChecked: "2026-04-16T07:30:00.000Z"
    },
    {
      id: "cred-02",
      issuer: "Aster Care Network",
      subject: "Lab Partner: Precision Diagnostics",
      type: "Integrated Diagnostics Partner",
      status: "Verified",
      lastChecked: "2026-04-15T12:00:00.000Z"
    },
    {
      id: "cred-03",
      issuer: "Insurer Gateway",
      subject: "Coverage pre-authorisation",
      type: "Claims trust verification",
      status: "Pending Review",
      lastChecked: "2026-04-13T10:15:00.000Z"
    }
  ],
  diagnoses: [
    {
      id: "diag-01",
      caseId: "CASE-1024",
      authorName: "Dr. Neel Rao",
      specialty: "Pulmonology",
      note:
        "Suggest repeat spirometry and compare with last quarter trends before adjusting inhaled corticosteroid dosage.",
      status: "Shared",
      createdAt: "2026-04-17T08:30:00.000Z",
      confidenceScore: 0.91
    },
    {
      id: "diag-02",
      caseId: "CASE-1024",
      authorName: "Dr. Aditi Kapoor",
      specialty: "Internal Medicine",
      note:
        "Mild tachycardia may be reactive to disrupted sleep pattern. Recommend hydration review and CBC if symptoms persist.",
      status: "Needs Review",
      createdAt: "2026-04-17T10:00:00.000Z",
      confidenceScore: 0.76
    },
    {
      id: "diag-03",
      caseId: "CASE-0931",
      authorName: "Dr. Isha Menon",
      specialty: "Cardiology",
      note:
        "Previous ECG comparison stable. Continue current beta blocker regimen and reassess after ambulatory monitoring.",
      status: "Resolved",
      createdAt: "2026-04-14T14:15:00.000Z",
      confidenceScore: 0.88
    }
  ],
  medicalRecords: [
    {
      id: "record-01",
      recordedAt: "2026-04-17T07:15:00.000Z",
      bloodPressure: "118/78",
      heartRate: 76,
      oxygenSaturation: 98,
      temperature: "98.4 F",
      heightCm: 167,
      weightKg: 62,
      allergies: ["Penicillin", "Dust"],
      conditions: ["Asthma"],
      medications: ["Montelukast", "Budesonide"]
    },
    {
      id: "record-02",
      recordedAt: "2026-03-29T06:50:00.000Z",
      bloodPressure: "121/80",
      heartRate: 80,
      oxygenSaturation: 97,
      temperature: "98.2 F",
      heightCm: 167,
      weightKg: 61,
      allergies: ["Penicillin", "Dust"],
      conditions: ["Asthma"],
      medications: ["Montelukast"]
    },
    {
      id: "record-03",
      recordedAt: "2026-02-15T05:30:00.000Z",
      bloodPressure: "115/76",
      heartRate: 72,
      oxygenSaturation: 98,
      temperature: "98.1 F",
      heightCm: 167,
      weightKg: 61,
      allergies: ["Penicillin"],
      conditions: ["Asthma"],
      medications: ["Budesonide"]
    }
  ]
};
