import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type Employee = { name: string; role: string; dept: string };

const initial: Employee[] = [
  { name: "ليان الحسن", role: "مديرة منتج", dept: "المنتج" },
  { name: "عمر ناصر", role: "مطور واجهات", dept: "التقنية" },
  { name: "سارة مروان", role: "مصممة تجربة", dept: "التصميم" },
  { name: "كريم فؤاد", role: "محاسب", dept: "المالية" },
];

function Employees() {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState<Employee>({ name: "", role: "", dept: "" });
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  return (
    <div>
      <PageHeader title="الموظفون" subtitle="إدارة فريق العمل بشكل سريع ومباشر." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`glass overflow-hidden rounded-2xl ${canEdit ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">الاسم</th>
                <th className="p-3 font-medium">المسمى</th>
                <th className="p-3 font-medium">القسم</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-muted-foreground">{r.role}</td>
                  <td className="p-3 text-muted-foreground">{r.dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {canEdit ? (
        <form
          className="glass space-y-4 rounded-2xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            setRows((p) => [...p, form]);
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