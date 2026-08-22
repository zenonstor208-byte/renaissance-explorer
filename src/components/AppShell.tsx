import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, LayoutDashboard, Users, Briefcase, FolderKanban, Settings, LogOut } from "lucide-react";
import { ROLES, useCompany, useTheme } from "@/lib/company";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, adminOnly: false },
  { to: "/employees", label: "الموظفون", icon: Users, adminOnly: false },
  { to: "/clients", label: "الزبائن", icon: Briefcase, adminOnly: false },
  { to: "/projects", label: "المشاريع", icon: FolderKanban, adminOnly: false },
  { to: "/settings", label: "الإعدادات", icon: Settings, adminOnly: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { company, me } = useCompany();
  useTheme(company);
  const roleLabel = ROLES.find((r) => r.id === company.role)?.label ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signedIn = Boolean(me?.profile);
  const isAdmin = company.role === "admin";
  const showNav = signedIn && pathname !== "/auth";

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 glass border-x-0 border-t-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to={signedIn ? "/dashboard" : "/auth"} className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground shadow-sm">
              {company.logo}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-bold">{company.name}</span>
              {showNav ? <span className="text-[11px] text-muted-foreground">{roleLabel}</span> : null}
            </span>
          </Link>
          {showNav ? (
            <nav className="flex flex-1 flex-wrap items-center justify-end gap-1">
              {nav
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                  >
                    <item.icon size={15} />
                    {item.label}
                  </Link>
                ))}
            </nav>
          ) : (
            <div className="flex-1" />
          )}
          {showNav ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="الإشعارات"
                className="relative grid size-9 place-items-center rounded-xl bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Bell size={16} />
                <span className="absolute end-2 top-2 size-1.5 rounded-full bg-primary" />
              </button>
              <button
                type="button"
                onClick={signOut}
                aria-label="تسجيل الخروج"
                className="grid size-9 place-items-center rounded-xl bg-secondary/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut size={16} />
              </button>
              <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {(me?.profile?.full_name || company.name).charAt(0)}
              </span>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="glass mt-8 border-x-0 border-b-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Renaissance Lite — جميع الحقوق محفوظة</span>
          <nav className="flex items-center gap-4">
            <a href="#support" className="transition-colors hover:text-foreground">
              الدعم الفني
            </a>
            <a href="#privacy" className="transition-colors hover:text-foreground">
              سياسة الخصوصية
            </a>
            <a href="#terms" className="transition-colors hover:text-foreground">
              شروط الاستخدام
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
