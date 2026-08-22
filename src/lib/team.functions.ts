import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ensureAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { companyName?: string; fullName?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, company_id, role")
      .eq("id", userId)
      .maybeSingle();

    if (existing) return { created: false, companyId: existing.company_id };

    const companyName = (data.companyName ?? "").trim();
    if (!companyName) {
      throw new Error("لا يوجد حساب مرتبط بهذا البريد. تواصل مع مدير شركتك.");
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({ name: companyName, logo: companyName.charAt(0).toUpperCase() || "R" })
      .select("id")
      .single();
    if (companyError || !company) throw new Error("تعذر إنشاء الشركة");

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      company_id: company.id,
      full_name: (data.fullName ?? "").trim() || (authUser?.user?.email ?? ""),
      email: authUser?.user?.email ?? "",
      role: "admin",
    });
    if (profileError) throw new Error("تعذر ربط الحساب بالشركة");

    return { created: true, companyId: company.id };
  });

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      fullName: string;
      email: string;
      password: string;
      jobTitle?: string;
      dept?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { data: caller } = await context.supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", context.userId)
      .maybeSingle();

    if (!caller || caller.role !== "admin") throw new Error("هذه العملية للمدير فقط");
    if (!data.email.trim() || data.password.length < 6) {
      throw new Error("البريد مطلوب وكلمة السر 6 أحرف على الأقل");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim(),
      password: data.password,
      email_confirm: true,
    });
    if (error || !created?.user) throw new Error(error?.message ?? "تعذر إنشاء الحساب");

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: created.user.id,
      company_id: caller.company_id,
      full_name: data.fullName.trim(),
      email: data.email.trim(),
      role: "staff",
      job_title: (data.jobTitle ?? "").trim(),
      dept: (data.dept ?? "").trim(),
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("تعذر ربط الموظف بالشركة");
    }

    return { id: created.user.id };
  });

export const deleteEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: caller } = await context.supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", context.userId)
      .maybeSingle();
    if (!caller || caller.role !== "admin") throw new Error("هذه العملية للمدير فقط");
    if (data.id === context.userId) throw new Error("لا يمكنك حذف حسابك");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin
      .from("profiles")
      .select("id, company_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!target || target.company_id !== caller.company_id) throw new Error("غير مسموح");

    await supabaseAdmin.auth.admin.deleteUser(data.id);
    return { ok: true };
  });
