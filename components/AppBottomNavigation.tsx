"use client";

import {
  BookOpenCheck,
  Compass,
  HeartHandshake,
  Home,
  Sparkles,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Explore", icon: Compass, href: "/explore" },
  { label: "Journey", icon: BookOpenCheck, href: "/journey" },
  { label: "Discover", icon: Sparkles, href: "/discover" },
  { label: "Help", icon: HeartHandshake, href: "/help" },
];

const supportedPaths = new Set([
  "/explore",
  "/journey",
  "/discover",
  "/help",
]);

export default function AppBottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (!supportedPaths.has(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(10px,env(safe-area-inset-bottom))] z-[100] px-3 sm:bottom-5">
      <div className="mx-auto max-w-[620px]">
        <nav className="pointer-events-auto relative flex min-h-[74px] items-center justify-around overflow-hidden rounded-[28px] border border-white/45 bg-white/55 px-2 shadow-[0_22px_70px_rgba(13,37,24,0.2)] backdrop-blur-[28px] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_45%,rgba(122,222,157,0.05))] dark:border-white/[0.1] dark:bg-[#0a1510]/70 dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)] dark:before:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015)_48%,rgba(140,230,173,0.04))]">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/25" />

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className="relative z-10 flex min-h-[58px] min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1 rounded-[20px] transition active:scale-[0.96]"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <div className="absolute inset-x-1.5 inset-y-1 rounded-[18px] border border-white/55 bg-white/65 shadow-[0_8px_24px_rgba(29,78,49,0.08)] backdrop-blur-xl dark:border-white/[0.1] dark:bg-white/[0.08] dark:shadow-none" />
                )}

                <div
                  className={`relative z-10 flex h-7 w-7 items-center justify-center transition-all duration-200 ${
                    active
                      ? "-translate-y-0.5 text-[#1f6b41] dark:text-[#9bf0b8]"
                      : "text-black/38 dark:text-white/40"
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                </div>

                <span
                  className={`relative z-10 max-w-full truncate text-[10px] font-extrabold tracking-[-0.01em] ${
                    active
                      ? "text-[#1f6b41] dark:text-[#9bf0b8]"
                      : "text-black/38 dark:text-white/40"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
