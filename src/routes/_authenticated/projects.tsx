import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Loader2, CheckCircle2, Eye, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  type Project,
  type ProjectStatus,
} from "@/lib/data";
import { can, useCompany } from "@/lib/company";

export const Route = createFileRoute("/_authenticated/projects")({
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

function matchesProject(p: Project, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
}

function matchesDateRange(createdAt: string, from: string, to: string) {
  const ts = new Date(createdAt).getTime();
  if (from && ts < new Date(from).setHours(0, 0, 0, 0)) return false;
  if (to && ts > new Date(to).setHours(23, 59, 59, 999)) return false;
  return true;
}

function Projects() {
  const [projects, setProjects] = useProjects();
  const [clients] = useClients();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!matchesProject(p, query)) return false;
      if (!matchesDateRange(p.createdAt, fromDate, toDate)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return dateSort === "newest" ? diff : -diff;
    });
    return list;
  }, [projects, statusFilter, query, fromDate, toDate, dateSort]);

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      client: p.client,
      status: p.status,
      progress: String(p.progress),
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const progress = Math.min(100, Math.max(0, Number(form.progress) || 0));
    if (editingId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: form.name.trim(), client: form.client.trim(), status: form.status, progress }
            : p,
        ),
      );
      toast.success("تم تحديث المشروع");
    } else {
      setProjects((prev) => [
        ...prev,
        {
          id: newId(),
          name: form.name.trim(),
          client: form.client.trim(),
          status: form.status,
          progress,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success("تمت إضافة المشروع");
    }
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = () => {
    if (!deleteId) return;
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast.success("تم حذف المشروع");
  };

  const deletingProject = projects.find((p) => p.id === deleteId);

  const hasActiveFilters = query || statusFilter !== "all" || fromDate || toDate || dateSort !== "newest";
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setDateSort("newest");
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="المشاريع" subtitle="نظرة سريعة على حالة كل مشروع ونسبة الإنجاز." />
        {canEdit ? (
          <Button className="gap-1.5" onClick={startAdd}>
            <Plus size={16} /> مشروع جديد
          </Button>
        ) : null}
      </div>

      <div className="mb-5 rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="p-search">البحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="p-search"
                placeholder="اسم المشروع أو الزبون"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
          <div className="w-full space-y-2 lg:w-40">
            <Label htmlFor="p-status">الحالة</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | "all")}>
              <SelectTrigger id="p-status">
                <SelectValue placeholder="الكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-72">
            <div className="space-y-2">
              <Label htmlFor="p-from">من</Label>
              <Input id="p-from" type="date" dir="ltr" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-to">إلى</Label>
              <Input id="p-to" type="date" dir="ltr" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="w-full space-y-2 lg:w-44">
            <Label htmlFor="p-sort">الترتيب حسب التاريخ</Label>
            <Select value={dateSort} onValueChange={(v) => setDateSort(v as "newest" | "oldest")}>
              <SelectTrigger id="p-sort">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل مشروع" : "إضافة مشروع"}</DialogTitle>
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
                {editingId ? "حفظ التعديلات" : "حفظ المشروع"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المشروع "{deletingProject?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 md:grid-cols-3">
        {PROJECT_STATUSES.map((status) => {
          const col = meta[status];
          const items = filteredProjects
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.client || "—"}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("ar-SY")}
                        </p>
                      </div>
                      {canEdit ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="تعديل"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDelete(p.id)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : null}
                    </div>
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
