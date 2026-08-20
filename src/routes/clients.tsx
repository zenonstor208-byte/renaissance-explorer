import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Building2, CircleCheck, CirclePause, Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { newId, useClients, useProjects } from "@/lib/data";
import { can, useCompany } from "@/lib/company";

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

const emptyForm = { name: "", contact: "", email: "", phone: "", deals: "0", active: true };

function Clients() {
  const [clients, setClients] = useClients();
  const [projects] = useProjects();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setClients((p) => [
      ...p,
      {
        id: newId(),
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        deals: Math.max(0, Number(form.deals) || 0),
        active: form.active,
        projects: [],
      },
    ]);
    setForm(emptyForm);
    setOpen(false);
    toast.success("تم تسجيل الزبون");
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="الزبائن" subtitle="بطاقات عرض تحتوي معلومات التواصل والمشاريع المرتبطة." />
        {canEdit ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus size={16} /> زبون جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل زبون</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="c-name">اسم الجهة</Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-contact">مسؤول التواصل</Label>
                  <Input
                    id="c-contact"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="c-email">البريد</Label>
                    <Input
                      id="c-email"
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-phone">الهاتف</Label>
                    <Input
                      id="c-phone"
                      dir="ltr"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 items-end gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="c-deals">عدد الصفقات</Label>
                    <Input
                      id="c-deals"
                      type="number"
                      min={0}
                      value={form.deals}
                      onChange={(e) => setForm({ ...form, deals: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
                    <Label htmlFor="c-active">نشط</Label>
                    <Switch
                      id="c-active"
                      checked={form.active}
                      onCheckedChange={(v) => setForm({ ...form, active: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    حفظ الزبون
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => {
          const linked = Array.from(
            new Set([...c.projects, ...projects.filter((p) => p.client === c.name).map((p) => p.name)]),
          );
          return (
            <article
              key={c.id}
              className="glass rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
                  {c.name.charAt(0)}
                </span>
                <div className="flex-1">
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{c.contact || "—"}</p>
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
                  <span dir="ltr">{c.email || "—"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  <span dir="ltr">{c.phone || "—"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building2 size={14} />
                  <span>{c.deals} صفقات</span>
                </li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {linked.map((p) => (
                  <span key={p} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
