import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Building2, CircleCheck, CirclePause } from "lucide-react";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "الزبائن | Renaissance Lite Manager" },
      { name: "description", content: "قائمة الزبائن مع بطاقة عرض تفاصيل سريعة." },
      { property: "og:title", content: "الزبائن | Renaissance Lite Manager" },
      { property: "og:description", content: "قائمة الزبائن مع بطاقة عرض تفاصيل سريعة." },
    ],
  }),
  component: Clients,
});

type Client = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  deals: number;
  active: boolean;
  projects: string[];
};

const clients: Client[] = [
  {
    name: "شركة الأفق",
    contact: "نور العلي",
    email: "nour@ofoq.com",
    phone: "+963 900 111 222",
    deals: 6,
    active: true,
    projects: ["منصة الأفق", "لوحة تقارير"],
  },
  {
    name: "مجموعة نهضة",
    contact: "خالد سمير",
    email: "khaled@nahda.co",
    phone: "+963 900 333 444",
    deals: 3,
    active: true,
    projects: ["تطبيق نهضة"],
  },
  {
    name: "دار المعمار",
    contact: "رنا يوسف",
    email: "rana@dar.sa",
    phone: "+963 900 555 666",
    deals: 2,
    active: false,
    projects: ["هوية دار المعمار"],
  },
  {
    name: "تِك لاين",
    contact: "فادي جابر",
    email: "fadi@techline.io",
    phone: "+963 900 777 888",
    deals: 9,
    active: true,
    projects: ["موقع تِك لاين"],
  },
];

function Clients() {
  return (
    <div>
      <PageHeader title="الزبائن" subtitle="بطاقات عرض تحتوي معلومات التواصل والمشاريع المرتبطة." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <article
            key={c.name}
            className="glass rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
                {c.name.charAt(0)}
              </span>
              <div className="flex-1">
                <h2 className="font-semibold">{c.name}</h2>
                <p className="text-xs text-muted-foreground">{c.contact}</p>
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                  c.active
                    ? "bg-accent/50 text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {c.active ? <CircleCheck size={12} /> : <CirclePause size={12} />}
                {c.active ? "نشط" : "متوقف"}
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span dir="ltr">{c.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span dir="ltr">{c.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 size={14} />
                <span>{c.deals} صفقات</span>
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.projects.map((p) => (
                <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                  {p}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}