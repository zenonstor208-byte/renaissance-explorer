import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { can, useCompany } from "@/lib/company";

export const Route = createFileRoute("/employees")({
  head: () => ({
    meta: [
      { title: "الموظفون | Renaissance Lite Manager" },
      { name: "description", content: "جدول خفيف لإدارة الموظفين وإضافة موظف جديد." },
      { property: "og:title", content: "الموظفون | Renaissance Lite Manager" },
      { property: "og:description", content: "جدول خفيف لإدارة الموظفين وإضافة موظف جديد." },
    ],
  }),
  component: Employees,
});

type Employee = { name: string; role: string; dept: string; createdAt: string };

const initial: Employee[] = [
  { name: "ليان الحسن", role: "مديرة منتج", dept: "المنتج", createdAt: "2026-01-12T09:00:00.000Z" },
  { name: "عمر ناصر", role: "مطور واجهات", dept: "التقنية", createdAt: "2026-02-20T09:00:00.000Z" },
  { name: "سارة مروان", role: "مصممة تجربة", dept: "التصميم", createdAt: "2026-03-15T09:00:00.000Z" },
  { name: "كريم فؤاد", role: "محاسب", dept: "المالية", createdAt: "2026-04-28T09:00:00.000Z" },
];

function matchesDateRange(createdAt: string, from: string, to: string) {
  const ts = new Date(createdAt).getTime();
  if (from && ts < new Date(from).setHours(0, 0, 0, 0)) return false;
  if (to && ts > new Date(to).setHours(23, 59, 59, 999)) return false;
  return true;
}

function Employees() {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState({ name: "", role: "", dept: "" });
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  const depts = useMemo(() => Array.from(new Set(rows.map((r) => r.dept).filter(Boolean))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (deptFilter !== "all" && r.dept !== deptFilter) return false;
      if (
        q &&
        !(
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.dept.toLowerCase().includes(q)
        )
      )
        return false;
      if (!matchesDateRange(r.createdAt, fromDate, toDate)) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateSort === "newest" ? diff : -diff;
    });
  }, [rows, query, deptFilter, fromDate, toDate, dateSort]);

  const hasActiveFilters = query || deptFilter !== "all" || fromDate || toDate || dateSort !== "newest";
  const clearFilters = () => {
    setQuery("");
    setDeptFilter("all");
    setFromDate("");
    setToDate("");
    setDateSort("newest");
  };


  return (
    <div>
      <PageHeader title="الموظفون" subtitle="إدارة فريق العمل بشكل سريع ومباشر." />

      <div className="mb-5 rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="e-search">البحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="e-search"
                placeholder="الاسم، المسمى الوظيفي أو القسم"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
          <div className="w-full space-y-2 lg:w-44">
            <Label htmlFor="e-dept">القسم</Label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger id="e-dept">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {depts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-72">
            <div className="space-y-2">
              <Label htmlFor="e-from">من</Label>
              <Input id="e-from" type="date" dir="ltr" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-to">إلى</Label>
              <Input id="e-to" type="date" dir="ltr" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="w-full space-y-2 lg:w-44">
            <Label htmlFor="e-sort">الترتيب حسب التاريخ</Label>
            <Select value={dateSort} onValueChange={(v) => setDateSort(v as "newest" | "oldest")}>
              <SelectTrigger id="e-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" className="mb-0.5" onClick={clearFilters}>
              مسح التصفية
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`glass overflow-hidden rounded-2xl ${canEdit ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">الاسم</th>
                <th className="p-3 font-medium">المسمى</th>
                <th className="p-3 font-medium">القسم</th>
                <th className="p-3 font-medium">تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={`${r.name}-${i}`} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-muted-foreground">{r.role}</td>
                  <td className="p-3 text-muted-foreground">{r.dept}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("ar-SY")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>


        {canEdit ? (
        <form
          className="glass space-y-4 rounded-2xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            setRows((p) => [...p, { ...form, createdAt: new Date().toISOString() }]);
            setForm({ name: "", role: "", dept: "" });
          }}
        >
          <h2 className="text-lg font-semibold">إضافة موظف</h2>
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">المسمى الوظيفي</Label>
            <Input
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">القسم</Label>
            <Input
              id="dept"
              value={form.dept}
              onChange={(e) => setForm({ ...form, dept: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            إضافة
          </Button>
        </form>
        ) : null}
      </div>
    </div>
  );
}