import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | Renaissance Lite Manager" },
      { name: "description", content: "نظرة سريعة على الموظفين والمشاريع والإيرادات." },
      { property: "og:title", content: "لوحة التحكم | Renaissance Lite Manager" },
      { property: "og:description", content: "نظرة سريعة على الموظفين والمشاريع والإيرادات." },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "الموظفون", value: "24", hint: "+3 هذا الشهر" },
  { label: "الزبائن", value: "58", hint: "+7 هذا الشهر" },
  { label: "المشاريع النشطة", value: "12", hint: "4 قيد المراجعة" },
  { label: "الإيرادات", value: "٨٤٫٢ ألف", hint: "الربع الحالي" },
];

const bars = [
  { m: "يناير", v: 45 },
  { m: "فبراير", v: 62 },
  { m: "مارس", v: 38 },
  { m: "أبريل", v: 74 },
  { m: "مايو", v: 58 },
  { m: "يونيو", v: 90 },
];

function Index() {
  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="ملخص ثابت لأداء الشركة هذا الربع." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">الإيرادات الشهرية</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {bars.map((b) => (
              <div key={b.m} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-primary/80"
                  style={{ height: `${b.v}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{b.m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold">آخر النشاطات</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "تم توقيع عقد مع شركة الأفق",
              "انضمام موظفة جديدة لقسم التصميم",
              "تسليم المرحلة الأولى من مشروع نهضة",
              "تحديث بيانات ٦ زبائن",
            ].map((t) => (
              <li key={t} className="flex gap-2 text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
