import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/session";

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

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type Updater<T> = T[] | ((prev: T[]) => T[]);

function useSynced<T extends { id: string }>(
  table: "projects" | "clients",
  companyId: string | undefined,
  fromRow: (row: Record<string, unknown>) => T,
  toRow: (item: T) => Record<string, unknown>,
) {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!companyId) {
      setItems([]);
      return;
    }
    void supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!cancelled && data) setItems(data.map((r) => fromRow(r as Record<string, unknown>)));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, companyId]);

  const update = useCallback(
    (updater: Updater<T>) => {
      setItems((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater;
        if (!companyId) return next;

        const prevMap = new Map(prev.map((i) => [i.id, i]));
        const nextMap = new Map(next.map((i) => [i.id, i]));

        for (const item of next) {
          const before = prevMap.get(item.id);
          if (!before) {
            void supabase.from(table).insert({ id: item.id, company_id: companyId, ...toRow(item) } as never);
          } else if (JSON.stringify(toRow(before)) !== JSON.stringify(toRow(item))) {
            void supabase.from(table).update(toRow(item) as never).eq("id", item.id);
          }
        }
        for (const item of prev) {
          if (!nextMap.has(item.id)) void supabase.from(table).delete().eq("id", item.id);
        }
        return next;
      });
    },
    [table, companyId, toRow],
  );

  return [items, update] as const;
}

export function useProjects() {
  const { data: me } = useMe();
  return useSynced<Project>(
    "projects",
    me?.profile?.company_id,
    (r) => ({
      id: String(r['id']),
      name: String(r['name'] ?? ""),
      client: String(r['client'] ?? ""),
      status: (r['status'] as ProjectStatus) ?? "قيد التنفيذ",
      progress: Number(r['progress'] ?? 0),
      createdAt: String(r['created_at'] ?? new Date().toISOString()),
    }),
    (p) => ({ name: p.name, client: p.client, status: p.status, progress: p.progress }),
  );
}

export function useClients() {
  const { data: me } = useMe();
  const [projects] = useProjects();
  const [clients, setClients] = useSynced<Client>(
    "clients",
    me?.profile?.company_id,
    (r) => ({
      id: String(r['id']),
      name: String(r['name'] ?? ""),
      contact: String(r['contact'] ?? ""),
      email: String(r['email'] ?? ""),
      phone: String(r['phone'] ?? ""),
      deals: Number(r['deals'] ?? 0),
      active: Boolean(r['active']),
      projects: [],
      createdAt: String(r['created_at'] ?? new Date().toISOString()),
    }),
    (c) => ({
      name: c.name,
      contact: c.contact,
      email: c.email,
      phone: c.phone,
      deals: c.deals,
      active: c.active,
    }),
  );

  const withProjects = clients.map((c) => ({
    ...c,
    projects: projects.filter((p) => p.client === c.name).map((p) => p.name),
  }));

  return [withProjects, setClients] as const;
}
