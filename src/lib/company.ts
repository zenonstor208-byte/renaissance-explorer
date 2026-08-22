import { useEffect, useState } from "react";

export type Role = "admin" | "staff" | "viewer";

export const ROLES: { id: Role; label: string }[] = [
  { id: "admin", label: "مدير" },
  { id: "staff", label: "موظف" },
  { id: "viewer", label: "مشاهدة فقط" },
];

export const ACCENTS = [
  { id: "teal", label: "تركوازي", primary: "oklch(0.58 0.09 205)", ring: "oklch(0.66 0.08 200)" },
  { id: "violet", label: "بنفسجي", primary: "oklch(0.55 0.13 295)", ring: "oklch(0.64 0.11 295)" },
  { id: "amber", label: "عنبري", primary: "oklch(0.62 0.12 70)", ring: "oklch(0.7 0.1 70)" },
  { id: "rose", label: "وردي", primary: "oklch(0.58 0.14 15)", ring: "oklch(0.66 0.12 15)" },
] as const;

export const BACKDROPS = [
  {
    id: "aurora",
    label: "شفق",
    value:
      "radial-gradient(1200px 600px at 100% 0%, oklch(0.88 0.07 190 / 60%), transparent 60%), radial-gradient(900px 500px at 0% 100%, oklch(0.89 0.06 280 / 45%), transparent 60%)",
  },
  {
    id: "sunrise",
    label: "شروق",
    value:
      "radial-gradient(1100px 600px at 0% 0%, oklch(0.9 0.07 70 / 55%), transparent 60%), radial-gradient(900px 500px at 100% 100%, oklch(0.88 0.06 20 / 45%), transparent 60%)",
  },
  {
    id: "mist",
    label: "ضباب",
    value:
      "radial-gradient(1000px 600px at 50% 0%, oklch(0.92 0.02 230 / 70%), transparent 65%)",
  },
] as const;

export type Company = {
  name: string;
  logo: string;
  role: Role;
  accent: string;
  backdrop: string;
  lang: "ar" | "en";
};

export { useCompany } from "@/lib/session";


export function useTheme(company: Company) {
  useEffect(() => {
    const accent = ACCENTS.find((a) => a.id === company.accent) ?? ACCENTS[0];
    const backdrop = BACKDROPS.find((b) => b.id === company.backdrop) ?? BACKDROPS[0];
    const root = document.documentElement;
    root.style.setProperty("--primary", accent.primary);
    root.style.setProperty("--ring", accent.ring);
    root.style.setProperty("--gradient-canvas", backdrop.value);
  }, [company.accent, company.backdrop]);
}

export const can = (role: Role, action: "edit" | "manage") =>
  action === "manage" ? role === "admin" : role !== "viewer";