"use client";

import { CalendarPlus2, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function SubmitEventPrompt() {
  const pathname = usePathname();
  const router = useRouter();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname !== "/discover") {
      setTarget(null);
      return;
    }

    const findTarget = () => {
      const upcomingLink = document.querySelector<HTMLAnchorElement>('a[href="#upcoming"]');
      setTarget(upcomingLink?.parentElement ?? null);
    };

    findTarget();

    const observer = new MutationObserver(findTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  if (pathname !== "/discover" || !target) return null;

  return createPortal(
    <div className="mt-4 rounded-[22px] border border-white/60 bg-white/34 p-4 shadow-sm backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:flex sm:items-center sm:justify-between sm:gap-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/60 bg-white/48 text-[#34744c] shadow-sm dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#9bedb7]">
          <CalendarPlus2 size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-[-0.02em] text-[#173b28] dark:text-white">
            Got something happening at FUTA?
          </p>
          <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/40">
            Submit your event to DoniVerse for review and let students discover it.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/discover/submit-event")}
        className="mt-4 inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[17px] bg-[#174d31] px-5 text-sm font-black text-white shadow-[0_16px_44px_rgba(23,77,49,0.20)] transition active:scale-[0.99] dark:bg-[#9bedb7] dark:text-[#0b2717] sm:mt-0 sm:w-auto"
      >
        <Plus size={17} /> Add an event
      </button>
    </div>,
    target,
  );
}
