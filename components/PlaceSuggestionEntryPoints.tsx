"use client";

import { MapPinned, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function PlaceSuggestionEntryPoints() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/explore") {
    return (
      <section className="relative z-20 mx-auto -mt-20 w-full max-w-[1280px] px-4 pb-28 sm:px-6 md:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => router.push("/explore/suggest-place")}
          className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/60 bg-white/48 p-4 text-left shadow-[0_18px_55px_rgba(20,63,42,0.08)] backdrop-blur-[24px] transition active:scale-[0.995] dark:border-white/[0.08] dark:bg-white/[0.04] sm:p-5"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#dff3e5]/90 text-[#245f3c] dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]">
              <MapPinned size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black">Missing a campus place?</p>
              <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/40">Suggest it with the correct entrance pin and help other students find it.</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#dff3e5]/90 px-3 py-2 text-[11px] font-black text-[#245f3c] dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]">Suggest</span>
        </button>
      </section>
    );
  }

  if (pathname === "/admin") {
    return (
      <section className="relative z-20 mx-auto w-full max-w-[1080px] px-4 pb-12 sm:px-6 md:px-8">
        <button
          type="button"
          onClick={() => router.push("/admin/place-suggestions")}
          className="flex w-full items-center justify-between gap-4 rounded-[24px] border border-white/60 bg-white/45 p-5 text-left shadow-[0_18px_55px_rgba(20,63,42,0.08)] backdrop-blur-[24px] transition active:scale-[0.995] dark:border-white/[0.08] dark:bg-white/[0.04]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#dff3e5]/90 text-[#245f3c] dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-sm font-black">Review place suggestions</p>
              <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/40">Approve student-submitted places and correct their map pins before publishing.</p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-black text-[#397151] dark:text-[#9bedb7]">Open</span>
        </button>
      </section>
    );
  }

  return null;
}
