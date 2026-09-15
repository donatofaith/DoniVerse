"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, MapPinned, ShieldCheck, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

const hiddenPaths = new Set(["/auth", "/auth/callback", "/onboarding", "/reset-password"]);

export default function AdminAccessChip() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (hiddenPaths.has(pathname)) {
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

  useEffect(() => {
    if (!open) return;

    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!isAdmin || pathname.startsWith("/admin/")) return null;

  return (
    <div ref={rootRef} className="fixed right-4 top-[max(72px,calc(env(safe-area-inset-top)+64px))] z-[90]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/58 px-4 text-xs font-black text-[#245c3a] shadow-[0_16px_50px_rgba(16,46,28,0.16)] backdrop-blur-3xl transition active:scale-[0.97] dark:border-white/12 dark:bg-[#0b1410]/72 dark:text-[#a9efc1]"
        aria-label="Open DoniVerse admin menu"
        aria-expanded={open}
      >
        <ShieldCheck size={16} />
        Admin
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[20px] border border-white/70 bg-white/90 p-2 shadow-[0_20px_60px_rgba(16,46,28,0.18)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/94">
          <AdminLink icon={ShieldCheck} label="Admin dashboard" onClick={() => router.push("/admin")} />
          <AdminLink icon={MapPinned} label="Manage places" onClick={() => router.push("/admin/places")} />
          <AdminLink icon={CalendarDays} label="Manage events" onClick={() => router.push("/admin/events")} />
          <AdminLink icon={Users} label="Manage communities" onClick={() => router.push("/admin/communities")} />
        </div>
      )}
    </div>
  );
}

function AdminLink({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 text-left text-sm font-extrabold text-[#244f35] transition hover:bg-black/[0.04] dark:text-[#a9efc1] dark:hover:bg-white/[0.05]"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
