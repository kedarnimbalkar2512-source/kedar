"use client";

import {
  Activity,
  FileHeart,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { cn, getAccessLabel, maskPhoneNumber } from "@/lib/utils";
import type { ProfileSummary, SessionRole } from "@/types";

const navigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/dashboard/identity",
    label: "Medical ID",
    icon: FileHeart
  },
  {
    href: "/dashboard/diagnosis",
    label: "Collaborative Diagnosis",
    icon: Stethoscope
  },
  {
    href: "/dashboard/credentials",
    label: "Verified Credentials",
    icon: ShieldCheck
  }
];

interface DashboardSidebarProps {
  demoMode: boolean;
  profile: ProfileSummary;
  viewerRole: SessionRole;
  licenseNumber: string | null;
  licenseVerified: boolean;
}

export function DashboardSidebar({
  demoMode,
  profile,
  viewerRole,
  licenseNumber,
  licenseVerified
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen lg:w-[290px] lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-4 py-5 lg:px-5">
        <div className="mb-5 flex items-center justify-between gap-3 lg:mb-10 lg:flex-col lg:items-start">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <Activity className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Vital ID
              </p>
              <h1 className="font-serif text-2xl text-white">Clinical Hub</h1>
            </div>
          </Link>
          <Badge
            className="shrink-0 border-white/10 bg-white/5 text-slate-100"
            variant="outline"
          >
            {demoMode ? "Demo mode" : "Authenticated"} / {getAccessLabel(viewerRole)}
          </Badge>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-300">Primary record</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{profile.fullName}</h2>
          <p className="mt-2 text-sm text-slate-300">
            {profile.role} / Blood group {profile.bloodType}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            {viewerRole === "doctor" ? "Licence status" : "Privacy mode"}
          </p>
          <p className="mt-1 text-sm text-slate-200">
            {viewerRole === "doctor"
              ? licenseVerified && licenseNumber
                ? `Verified / ${licenseNumber}`
                : "Doctor verification pending"
              : "Internal clinician notes are hidden"}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-500">
            Emergency contact
          </p>
          <p className="mt-1 text-sm text-slate-200">
            {viewerRole === "doctor"
              ? profile.emergencyContact
              : maskPhoneNumber(profile.emergencyContact)}
          </p>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-1 lg:flex-col lg:overflow-visible">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-slate-900 shadow-lg shadow-black/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
