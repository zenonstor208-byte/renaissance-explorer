import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCENTS, BACKDROPS, ROLES, useCompany, type Company } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات | Renaissance Lite Manager" },
      { name: "description", content: "تغيير اسم الشركة وحرف الشعار الظاهر في الواجهة." },
      { property: "og:title", content: "الإعدادات | Renaissance Lite Manager" },
      { property: "og:description", content: "تغيير اسم الشركة وحرف الشعار الظاهر في الواجهة." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { company, setCompany } = useCompany();
  const [name, setName] = useState(company.name);
  const [logo, setLogo] = useState(company.logo);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(company.name);
    setLogo(company.logo);
  }, [company.name, company.logo]);

  const patch = (next: Partial<Company>) => setCompany({ ...company, ...next });

  return (
    <div>
      <PageHeader title="الإعدادات" subtitle="خصّص هوية شركتك داخل النظام." />
      <div className="grid gap-4 lg:grid-cols-2">
      <form
        className="glass space-y-5 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          patch({
            name: name.trim() || "Renaissance Lite",
            logo: logo.trim().charAt(0) || "R",
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
            {logo.charAt(0) || "R"}
          </span>
          <span className="text-lg font-semibold">{name || "اسم الشركة"}</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">اسم الشركة</Label>
          <Input id="company" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">حرف الشعار</Label>
          <Input id="logo" maxLength={2} value={logo} onChange={(e) => setLogo(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit">حفظ التغييرات</Button>
          {saved ? <span className="text-sm text-muted-foreground">تم الحفظ ✓</span> : null}
        </div>
      </form>

      <div className="glass space-y-6 rounded-2xl p-6">
        <div className="space-y-2">
          <Label>لون النظام</Label>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => patch({ accent: a.id })}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-all hover:scale-[1.03] ${
                  company.accent === a.id ? "border-primary bg-secondary/70" : "border-border"
                }`}
              >
                <span className="size-4 rounded-full" style={{ background: a.primary }} />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>صورة الخلفية</Label>
          <div className="grid grid-cols-3 gap-2">
            {BACKDROPS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => patch({ backdrop: b.id })}
                className={`overflow-hidden rounded-xl border p-0 text-xs transition-all hover:scale-[1.02] ${
                  company.backdrop === b.id ? "border-primary" : "border-border"
                }`}
              >
                <span className="block h-12 w-full" style={{ backgroundImage: b.value }} />
                <span className="block py-1">{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>الصلاحية</Label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => patch({ role: r.id })}
                className={`rounded-xl border px-3 py-1.5 text-sm transition-all hover:scale-[1.03] ${
                  company.role === r.id ? "border-primary bg-secondary/70 font-semibold" : "border-border"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            المدير: كل الصلاحيات · الموظف: إضافة وتعديل · مشاهدة فقط: عرض البيانات.
          </p>
        </div>

        <div className="space-y-2">
          <Label>اللغة</Label>
          <div className="flex gap-2">
            {(["ar", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => patch({ lang: l })}
                className={`rounded-xl border px-3 py-1.5 text-sm transition-all hover:scale-[1.03] ${
                  company.lang === l ? "border-primary bg-secondary/70 font-semibold" : "border-border"
                }`}
              >
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}