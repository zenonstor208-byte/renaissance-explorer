import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureAccount } from "@/lib/team.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | Renaissance Lite Manager" },
      { name: "description", content: "سجّل دخولك أو أنشئ حساب شركة جديد لإدارة فريقك وزبائنك." },
      { property: "og:title", content: "تسجيل الدخول | Renaissance Lite Manager" },
      {
        property: "og:description",
        content: "سجّل دخولك أو أنشئ حساب شركة جديد لإدارة فريقك وزبائنك.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ensure = useServerFn(ensureAccount);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!companyName.trim()) throw new Error("اسم الشركة مطلوب");
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw new Error("تم إنشاء الحساب، فعّل بريدك ثم سجّل الدخول");
        await ensure({ data: { companyName: companyName.trim(), fullName: fullName.trim() } });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw new Error("بيانات الدخول غير صحيحة");
        await ensure({ data: {} });
      }

      await queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("أهلاً بك");
      await navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <form onSubmit={submit} className="glass w-full space-y-5 rounded-2xl p-7">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب شركة"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "ادخل ببريدك وكلمة السر التي زوّدك بها المدير."
              : "أنشئ شركتك وسيتم ربط حسابك بها كمدير."}
          </p>
        </div>

        {mode === "signup" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة</Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname">اسمك</Label>
              <Input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">كلمة السر</Label>
          <Input
            id="password"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جارٍ المعالجة..." : mode === "signin" ? "دخول" : "إنشاء الشركة"}
        </Button>

        <button
          type="button"
          className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "ليس لديك شركة؟ أنشئ حساب مدير" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </form>
    </div>
  );
}
