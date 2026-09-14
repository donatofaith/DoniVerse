"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type AdminRole = "admin" | "super_admin";

type AdminRow = {
  user_id: string;
  email: string | null;
  role: AdminRole;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.replace("/auth");
      return;
    }

    setCurrentUserId(session.user.id);

    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    setRole(adminRow.role as AdminRole);

    const { data: adminList, error: listError } = await supabase.rpc(
      "list_futago_admins",
    );

    if (listError) {
      setError("Admin access is active, but the admin management setup is not complete yet.");
      setLoading(false);
      return;
    }

    setAdmins((adminList ?? []) as AdminRow[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const addAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || role !== "super_admin") return;

    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) {
      setError("Enter the email address of a registered FUTAGO user.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { error: addError } = await supabase.rpc("set_futago_admin_by_email", {
      target_email: cleanedEmail,
      target_role: newRole,
    });

    if (addError) {
      setError(addError.message || "We could not add this admin.");
      setSaving(false);
      return;
    }

    setMessage(`${cleanedEmail} now has ${newRole === "super_admin" ? "super admin" : "admin"} access.`);
    setEmail("");
    setNewRole("admin");
    setSaving(false);
    await loadAdminData();
  };

  const removeAdmin = async (admin: AdminRow) => {
    if (role !== "super_admin" || admin.user_id === currentUserId || removingId) return;

    const confirmed = window.confirm(
      `Remove admin access from ${admin.email ?? "this user"}?`,
    );
    if (!confirmed) return;

    setRemovingId(admin.user_id);
    setError("");
    setMessage("");

    const { error: removeError } = await supabase.rpc("remove_futago_admin", {
      target_user_id: admin.user_id,
    });

    if (removeError) {
      setError(removeError.message || "We could not remove this admin.");
      setRemovingId(null);
      return;
    }

    setMessage("Admin access removed.");
    setRemovingId(null);
    await loadAdminData();
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[26px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/70">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Opening FUTAGO Admin...</p>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="w-full max-w-md rounded-[30px] border border-white/60 bg-white/55 p-6 text-center shadow-[0_24px_70px_rgba(16,46,28,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72">
          <ShieldCheck className="mx-auto text-[#397151] dark:text-[#9bedb7]" size={30} />
          <h1 className="mt-4 text-2xl font-black tracking-[-0.04em]">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-black/50 dark:text-white/45">
            This area is only available to FUTAGO administrators.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-5 min-h-12 rounded-[16px] border border-white/65 bg-white/55 px-5 text-sm font-extrabold text-[#214f34] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
          >
            Back to FUTAGO
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-12 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[1080px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#397151] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">
            {role === "super_admin" ? "Super Admin" : "Admin"}
          </div>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/45 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#397151] dark:text-[#9bedb7]">
                <ShieldCheck size={16} /> FUTAGO Admin
              </div>
              <h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[46px]">
                Manage the team.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">
                Add trusted FUTAGO administrators and control who can manage campus content.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[20px] border border-white/60 bg-white/38 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
              <Users size={19} className="text-[#397151] dark:text-[#9bedb7]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-black/35 dark:text-white/35">Admin team</p>
                <p className="text-lg font-black">{admins.length}</p>
              </div>
            </div>
          </div>
        </section>

        {role === "super_admin" && (
          <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-5 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/60 bg-white/52 text-[#397151] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#9bedb7]">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em]">Add an admin</h2>
                <p className="text-xs text-black/42 dark:text-white/38">They must already have a FUTAGO account.</p>
              </div>
            </div>

            <form onSubmit={addAdmin} className="mt-5 grid gap-3 md:grid-cols-[1fr_190px_auto]">
              <div className="flex min-h-[56px] items-center gap-3 rounded-[18px] border border-white/65 bg-white/48 px-4 backdrop-blur-xl focus-within:border-[#69a87f]/50 dark:border-white/10 dark:bg-[#101914]/70">
                <Mail size={18} className="shrink-0 text-black/35 dark:text-white/35" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-black/28 dark:text-white dark:placeholder:text-white/25"
                />
              </div>

              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value as AdminRole)}
                className="min-h-[56px] rounded-[18px] border border-white/65 bg-white/80 px-4 text-base font-bold text-[#102017] outline-none dark:border-white/10 dark:bg-[#101914] dark:text-white"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <button
                type="submit"
                disabled={saving}
                className="flex min-h-[56px] items-center justify-center gap-2 rounded-[18px] border border-[#77b68d]/35 bg-[#dff3e5]/90 px-5 text-sm font-black text-[#17462d] shadow-sm transition active:scale-[0.99] disabled:opacity-60 dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]"
              >
                {saving ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
                Add admin
              </button>
            </form>
          </section>
        )}

        {(error || message) && (
          <div
            className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold backdrop-blur-2xl ${
              error
                ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300"
                : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-4 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">Access</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.03em]">Current admins</h2>
            </div>
            <Users size={20} className="text-[#397151] dark:text-[#9bedb7]" />
          </div>

          <div className="space-y-3">
            {admins.map((admin) => {
              const isYou = admin.user_id === currentUserId;
              return (
                <div
                  key={admin.user_id}
                  className="flex flex-col gap-3 rounded-[20px] border border-white/55 bg-white/38 p-4 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black">{admin.email ?? "Unknown email"}</p>
                      {isYou && (
                        <span className="rounded-full bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#286140] dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-semibold capitalize text-black/40 dark:text-white/35">
                      {admin.role === "super_admin" ? "Super admin" : "Admin"}
                    </p>
                  </div>

                  {role === "super_admin" && !isYou && (
                    <button
                      type="button"
                      onClick={() => void removeAdmin(admin)}
                      disabled={removingId === admin.user_id}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-[15px] border border-red-400/15 bg-red-400/[0.07] px-4 text-xs font-black text-red-700 transition disabled:opacity-50 dark:text-red-300"
                    >
                      {removingId === admin.user_id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
