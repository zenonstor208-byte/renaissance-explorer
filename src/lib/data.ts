import { useEffect, useState } from "react";

export type ProjectStatus = "قيد التنفيذ" | "قيد المراجعة" | "مكتمل";

export type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
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
};

export const PROJECT_STATUSES: ProjectStatus[] = ["قيد التنفيذ", "قيد المراجعة", "مكتمل"];

const DEFAULT_PROJECTS: Project[] = [
  { id: "p1", name: "منصة الأفق", client: "شركة الأفق", status: "قيد التنفيذ", progress: 62 },
  { id: "p2", name: "تطبيق نهضة", client: "مجموعة نهضة", status: "قيد التنفيذ", progress: 35 },
  { id: "p3", name: "هوية دار المعمار", client: "دار المعمار", status: "قيد المراجعة", progress: 88 },
  { id: "p4", name: "موقع تِك لاين", client: "تِك لاين", status: "مكتمل", progress: 100 },
  { id: "p5", name: "لوحة تقارير", client: "شركة الأفق", status: "مكتمل", progress: 100 },
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
  },
];

function useStored<T>(key: string, fallback: T[]) {
  const [items, setItems] = useState<T[]>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw) as T[]);
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
