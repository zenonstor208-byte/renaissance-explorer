import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Building2, CircleCheck, CirclePause, Plus, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { newId, useClients, useProjects, type Client } from "@/lib/data";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { company } = useCompany();
  const canEdit = can(company.role, "edit");

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      contact: c.contact,
      email: c.email,
      phone: c.phone,
      deals: String(c.deals),
      active: c.active,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      deals: Math.max(0, Number(form.deals) || 0),
      active: form.active,
    };
    if (editingId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, ...payload, projects: c.projects }
            : c,
        ),
      );
      toast.success("تم تحديث بيانات الزبون");
    } else {
      setClients((prev) => [
        ...prev,
        { id: newId(), ...payload, projects: [] },
      ]);
      toast.success("تم تسجيل الزبون");
    }
    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = () => {
    if (!deleteId) return;
    setClients((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);
    toast.success("تم حذف الزبون");
  };

  const deletingClient = clients.find((c) => c.id === deleteId);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="الزبائن" subtitle="بطاقات عرض تحتوي معلومات التواصل والمشاريع المرتبطة." />
        {canEdit ? (
          <Button className="gap-1.5" onClick={startAdd}>
            <Plus size={16} /> زبون جديد
          </Button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل زبون" : "تسجيل زبون"}</DialogTitle>
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
                {editingId ? "حفظ التعديلات" : "حفظ الزبون"}
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
              هل أنت متأكد من حذف الزبون "{deletingClient?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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

              {canEdit ? (
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => startEdit(c)}>
                    <Pencil size={14} /> تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => confirmDelete(c.id)}
                  >
                    <Trash2 size={14} /> حذف
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
