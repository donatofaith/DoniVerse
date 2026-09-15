"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export const FUTAGO_GUEST_KEY = "futago-guest-mode";

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

const openRoutes = new Set(["/auth", "/auth/callback", "/onboarding", "/reset-password"]);
const immersiveRoutes = new Set(["/auth", "/auth/callback", "/reset-password"]);

export default function AppAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      setReady(false);

      if (openRoutes.has(pathname)) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (cancelled) return;

      const session = error ? null : data.session;

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (!profile?.onboarding_completed) {
          router.replace("/onboarding");
          return;
        }

        setReady(true);
        return;
      }

      const guestMode = window.localStorage.getItem(FUTAGO_GUEST_KEY) === "1";

      if (guestMode) {
        setReady(true);
        return;
      }

      router.replace("/auth");
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f5ef] px-6 text-[#132118] dark:bg-[#07100b] dark:text-white">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#123f29] text-white shadow-[0_18px_50px_rgba(18,63,41,0.18)] dark:bg-[#91eab0] dark:text-[#082013]">
            <GraduationCap size={25} />
          </div>
          <p className="mt-4 text-xl font-black tracking-[-0.045em]">FUTAGO</p>
          <p className="mt-1 text-xs text-black/40 dark:text-white/35">Know where to go.</p>
          <div className="mt-5 h-1.5 w-20 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#34744c] dark:bg-[#8ce6ad]" />
          </div>
        </div>
      </main>
    );
  }

  if (immersiveRoutes.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="futago-campus-background" aria-hidden="true">
        <div
          className="futago-campus-background__image"
          style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }}
        />
        <div className="futago-campus-background__veil" />
      </div>
      <div className="futago-app-surface">{children}</div>
    </>
  );
}
