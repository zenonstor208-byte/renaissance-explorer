import { useEffect, useState } from "react";

export type ProjectStatus = "قيد التنفيذ" | "قيد المراجعة" | "مكتمل";

export type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  deals: number;
  active: boolean;
  projects: string[];
  createdAt: string;
};

export const PROJECT_STATUSES: ProjectStatus[] = ["قيد التنفيذ", "قيد المراجعة", "مكتمل"];

const DEFAULT_PROJECTS: Project[] = [
  { id: "p1", name: "منصة الأفق", client: "شركة الأفق", status: "قيد التنفيذ", progress: 62, createdAt: "2026-01-15T10:00:00.000Z" },
  { id: "p2", name: "تطبيق نهضة", client: "مجموعة نهضة", status: "قيد التنفيذ", progress: 35, createdAt: "2026-02-03T09:30:00.000Z" },
  { id: "p3", name: "هوية دار المعمار", client: "دار المعمار", status: "قيد المراجعة", progress: 88, createdAt: "2026-03-10T14:20:00.000Z" },
  { id: "p4", name: "موقع تِك لاين", client: "تِك لاين", status: "مكتمل", progress: 100, createdAt: "2026-04-22T11:00:00.000Z" },
  { id: "p5", name: "لوحة تقارير", client: "شركة الأفق", status: "مكتمل", progress: 100, createdAt: "2026-05-18T08:45:00.000Z" },
];

const DEFAULT_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "شركة الأفق",
    contact: "نور العلي",
    email: "nour@ofoq.com",
    phone: "+963 900 111 222",
    deals: 6,
    active: true,
    projects: ["منصة الأفق", "لوحة تقارير"],
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "c2",
    name: "مجموعة نهضة",
    contact: "خالد سمير",
    email: "khaled@nahda.co",
    phone: "+963 900 333 444",
    deals: 3,
    active: true,
    projects: ["تطبيق نهضة"],
    createdAt: "2026-02-14T12:00:00.000Z",
  },
  {
    id: "c3",
    name: "دار المعمار",
    contact: "رنا يوسف",
    email: "rana@dar.sa",
    phone: "+963 900 555 666",
    deals: 2,
    active: false,
    projects: ["هوية دار المعمار"],
    createdAt: "2026-03-22T15:30:00.000Z",
  },
  {
    id: "c4",
    name: "تِك لاين",
    contact: "فادي جابر",
    email: "fadi@techline.io",
    phone: "+963 900 777 888",
    deals: 9,
    active: true,
    projects: ["موقع تِك لاين"],
    createdAt: "2026-04-05T10:15:00.000Z",
  },
];

function withCreatedAt<T extends { createdAt?: string }>(item: T): T & { createdAt: string } {
  return { ...item, createdAt: item.createdAt ?? new Date().toISOString() };
}

function useStored<T extends { createdAt?: string }>(key: string, fallback: T[]) {
  const [items, setItems] = useState<T[]>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T[];
        setItems(parsed.map(withCreatedAt));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(items));
  }, [key, items, ready]);

  return [items, setItems] as const;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const useProjects = () => useStored<Project>("rlm-projects", DEFAULT_PROJECTS);
export const useClients = () => useStored<Client>("rlm-clients", DEFAULT_CLIENTS);
