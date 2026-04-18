import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SessionRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function maskPhoneNumber(value: string) {
  if (value.length <= 4) {
    return value;
  }

  return `${value.slice(0, 3)}${"*".repeat(Math.max(0, value.length - 5))}${value.slice(-2)}`;
}

export function getAccessLabel(role: SessionRole) {
  return role === "doctor" ? "Doctor access" : "Patient access";
}
