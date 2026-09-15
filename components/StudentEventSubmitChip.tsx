"use client";

import { CalendarPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function StudentEventSubmitChip() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname !== "/discover") return null;

  const openSubmission = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/auth");
      return;
    }
    router.push("/discover/submit-event");
  };

  return (
    <button
      type="button"
      onClick={() => void openSubmission()}
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-[85] flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-[#174d31]/94 px-4 text-xs font-black text-white shadow-[0_18px_55px_rgba(18,63,41,0.25)] backdrop-blur-3xl transition active:scale-[0.97] dark:border-white/10 dark:bg-[#9bedb7] dark:text-[#0b2717] sm:right-6"
      aria-label="Submit a campus event"
    >
      <CalendarPlus size={17} />
      Submit event
    </button>
  );
}
