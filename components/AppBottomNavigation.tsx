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
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-0 right-0 z-[100] px-3 sm:bottom-5">
      <div className="mx-auto max-w-[620px]">
        <nav className="relative flex h-[72px] items-center justify-around overflow-hidden rounded-[25px] border border-white/50 bg-[#f9faf6]/90 px-2 shadow-[0_18px_55px_rgba(15,42,26,0.17)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0d1711]/95 dark:shadow-[0_18px_55px_rgba(0,0,0,0.36)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => router.push(item.href)}
                className="relative z-10 flex min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1"
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <div className="absolute inset-x-1 -inset-y-2 rounded-[18px] bg-[#e6f3e8] dark:bg-[#8ce6ad]/10" />
                )}

                <div
                  className={`relative z-10 transition-transform duration-200 ${
                    active
                      ? "-translate-y-0.5 text-[#215c3a] dark:text-[#8ce6ad]"
                      : "text-black/35 dark:text-white/35"
                  }`}
                >
                  <Icon size={19} />
                </div>

                <span
                  className={`relative z-10 max-w-full truncate text-[10px] font-bold ${
                    active
                      ? "text-[#215c3a] dark:text-[#8ce6ad]"
                      : "text-black/35 dark:text-white/35"
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
