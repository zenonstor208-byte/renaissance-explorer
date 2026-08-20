import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Loader2, CheckCircle2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  PROJECT_STATUSES,
  newId,
  useClients,
  useProjects,
  type ProjectStatus,
} from "@/lib/data";
import { can, useCompany } from "@/lib/company";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "المشاريع | Renaissance Lite Manager" },
      { name: "description", content: "متابعة المشاريع حسب الحالة: قيد التنفيذ، مراجعة، مكتمل." },
      { property: "og:title", content: "المشاريع | Renaissance Lite Manager" },
      {
        property: "og:description",
        content: "متابعة المشاريع حسب الحالة: قيد التنفيذ، مراجعة، مكتمل.",
      },
    ],
  }),
  component: Projects,
});

const meta: Record<ProjectStatus, { icon: typeof Loader2; tone: string; bar: string }> = {
  "قيد التنفيذ": { icon: Loader2, tone: "text-primary", bar: "bg-primary" },
  "قيد المراجعة": {
    icon: Eye,
    tone: "text-accent-foreground",
    bar: "bg-gradient-to-l from-primary to-accent",
  },
  مكتمل: { icon: CheckCircle2, tone: "text-emerald-600", bar: "bg-emerald-500" },
};

const emptyForm = {
  name: "",
  client: "",
  status: "قيد التنفيذ" as ProjectStatus,
  progress: "0",
};

function Projects() {
  const [projects, setProjects] = useProjects();
  const [clients] = useClients();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0));
    setProjects((p) => [
      ...p,
      { id: newId(), name: form.name.trim(), client: form.client.trim(), status: form.status, progress },
    ]);
    setForm(emptyForm);
    setOpen(false);
    toast.success("تمت إضافة المشروع");
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="المشاريع" subtitle="نظرة سريعة على حالة كل مشروع ونسبة الإنجاز." />
        {canEdit ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus size={16} /> مشروع جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مشروع</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="p-name">اسم المشروع</Label>
                  <Input
                    id="p-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-client">الزبون</Label>
                  <Input
                    id="p-client"
                    list="clients-list"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                  />
                  <datalist id="clients-list">
                    {clients.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-progress">نسبة الإنجاز %</Label>
                    <Input
                      id="p-progress"
                      type="number"
                      min={0}
                      max={100}
                      value={form.progress}
                      onChange={(e) => setForm({ ...form, progress: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    حفظ المشروع
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PROJECT_STATUSES.map((status) => {
          const col = meta[status];
          const items = projects
            .filter((p) => p.status === status)
            .sort((a, b) => b.progress - a.progress);
          return (
            <section
              key={status}
              className="glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <header className="flex items-center justify-between">
                <h2 className={`flex items-center gap-2 font-semibold ${col.tone}`}>
                  <col.icon size={16} />
                  {status}
                </h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </header>
              <ul className="mt-4 space-y-3">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-xl bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.client || "—"}</p>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
                      <div
                        className={`h-1.5 rounded-full transition-all ${col.bar}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{p.progress}%</p>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                    لا توجد مشاريع
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
