"use client";

import { CalendarPlus2, ChevronRight, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function SubmitEventPrompt() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname !== "/discover") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+86px)] z-[85] px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[390px] sm:px-0">
      <button
        type="button"
        onClick={() => router.push("/discover/submit-event")}
        className="pointer-events-auto group flex w-full items-center gap-3 rounded-[22px] border border-white/70 bg-[#0d2619]/92 p-3.5 text-left text-white shadow-[0_20px_60px_rgba(5,32,18,0.34)] backdrop-blur-3xl transition hover:-translate-y-0.5 active:scale-[0.99] dark:border-white/10 dark:bg-[#10261a]/94"
        aria-label="Submit a campus event"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/10 text-[#a9efc1]">
          <CalendarPlus2 size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#9bedb7]">
            <Sparkles size={12} /> Got something happening?
          </div>
          <p className="mt-0.5 text-sm font-black tracking-[-0.02em]">Put your event on DoniVerse</p>
          <p className="mt-0.5 text-[11px] text-white/55">Submit it for review and reach students across campus.</p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9bedb7] text-[#0b2717] transition group-hover:translate-x-0.5">
          <ChevronRight size={17} />
        </div>
      </button>
    </div>
  );
}
