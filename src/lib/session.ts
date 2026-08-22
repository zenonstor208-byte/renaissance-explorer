import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company, Role } from "@/lib/company";

export type Me = {
  userId: string;
  email: string;
  profile: {
    id: string;
    company_id: string;
    full_name: string;
    email: string;
    role: Role;
    job_title: string;
    dept: string;
  } | null;
  company: {
    id: string;
    name: string;
    logo: string;
    accent: string;
    backdrop: string;
  } | null;
};

export function useMe() {
  return useQuery<Me | null>({
    queryKey: ["me"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      let company = null;
      if (profile) {
        const { data } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .maybeSingle();
        company = data;
      }

      return {
        userId: user.id,
        email: user.email ?? "",
        profile: (profile as Me["profile"]) ?? null,
        company: (company as Me["company"]) ?? null,
      };
    },
  });
}

const FALLBACK: Company = {
  name: "Renaissance Lite",
  logo: "R",
  role: "viewer",
  accent: "teal",
  backdrop: "aurora",
  lang: "ar",
};

export function useCompany() {
  const { data, isLoading } = useMe();
  const queryClient = useQueryClient();

  const company: Company = data?.company
    ? {
        name: data.company.name,
        logo: data.company.logo,
        accent: data.company.accent,
        backdrop: data.company.backdrop,
        role: (data.profile?.role as Role) ?? "viewer",
        lang: "ar",
      }
    : FALLBACK;

  const setCompany = async (next: Company) => {
    if (!data?.company) return;
    await supabase
      .from("companies")
      .update({
        name: next.name,
        logo: next.logo,
        accent: next.accent,
        backdrop: next.backdrop,
      })
      .eq("id", data.company.id);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  };

  return { company, setCompany, me: data ?? null, loading: isLoading };
}

export async function signOutEverywhere() {
  await supabase.auth.signOut();
}
