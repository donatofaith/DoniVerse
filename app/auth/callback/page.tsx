"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { FUTAGO_GUEST_KEY } from "@/components/AppAccessGate";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finishConfirmation() {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
          }
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session?.user) {
          throw new Error("We could not complete email confirmation. Please request a new confirmation email and try again.");
        }

        window.localStorage.removeItem(FUTAGO_GUEST_KEY);

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.session.user.id)
          .maybeSingle();

        if (cancelled) return;

        const requestedNext = searchParams.get("next");
        const next = requestedNext === "/" || requestedNext === "/onboarding" ? requestedNext : null;
        router.replace(profile?.onboarding_completed ? "/" : next ?? "/onboarding");
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Email confirmation failed. Please try again.");
        }
      }
    }

    void finishConfirmation();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#08110c] px-5 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/12 bg-white/[0.06] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-3xl">
        {error ? (
          <>
            <CheckCircle2 className="mx-auto text-red-300" size={30} />
            <h1 className="mt-4 text-2xl font-black">Confirmation needs another try</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">{error}</p>
            <button
              onClick={() => router.replace("/auth")}
              className="mt-6 min-h-12 w-full rounded-[16px] bg-[#a0efbb] px-5 text-sm font-extrabold text-[#082013]"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-[#a0efbb]" size={28} />
            <h1 className="mt-4 text-2xl font-black">Confirming your account...</h1>
            <p className="mt-3 text-sm leading-6 text-white/50">This should only take a moment.</p>
          </>
        )}
      </div>
    </main>
  );
}
