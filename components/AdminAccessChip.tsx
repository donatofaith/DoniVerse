"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

const hiddenPaths = new Set(["/auth", "/onboarding", "/reset-password", "/admin", "/admin/events"]);

export default function AdminAccessChip() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (hiddenPaths.has(pathname) || pathname.startsWith("/admin/")) {
        if (!cancelled) setIsAdmin(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (!cancelled) setIsAdmin(false);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!cancelled) setIsAdmin(Boolean(adminRow));
    }

    void checkAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void checkAdmin();
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => router.push("/admin")}
      className="fixed right-4 top-[max(72px,calc(env(safe-area-inset-top)+64px))] z-[90] flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/58 px-4 text-xs font-black text-[#245c3a] shadow-[0_16px_50px_rgba(16,46,28,0.16)] backdrop-blur-3xl transition active:scale-[0.97] dark:border-white/12 dark:bg-[#0b1410]/72 dark:text-[#a9efc1]"
      aria-label="Open FUTAGO Admin"
    >
      <ShieldCheck size={16} />
      Admin
    </button>
  );
}
