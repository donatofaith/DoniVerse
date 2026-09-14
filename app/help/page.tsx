"use client";

import {
  ArrowRight,
  Building2,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Landmark,
  LifeBuoy,
  MapPin,
  Search,
  ShieldCheck,
  UserRoundSearch,
  WifiOff,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type HelpTopic = {
  id: string;
  title: string;
  description: string;
  icon: typeof CircleHelp;
  actionLabel: string;
  actionType: "official" | "explore" | "journey";
  href?: string;
};

const helpTopics: HelpTopic[] = [
  {
    id: "registration",
    title: "Registration help",
    description:
      "Use FUTAGO Journey to understand the registration sequence, then complete every official action on FUTA's own systems.",
    icon: GraduationCap,
    actionLabel: "Open My Journey",
    actionType: "journey",
  },
  {
    id: "portal",
    title: "Portal or account issue",
    description:
      "For login, registration, screening or portal problems, use FUTA's official undergraduate helpdesk.",
    icon: LifeBuoy,
    actionLabel: "Official FUTA helpdesk",
    actionType: "official",
    href: "https://helpdesk.futa.edu.ng/undergraduate",
  },
  {
    id: "department",
    title: "Find my department or office",
    description:
      "Search FUTAGO Explore for departments, Student Affairs, the library, Health Centre and other mapped campus locations.",
    icon: Building2,
    actionLabel: "Find on Explore",
    actionType: "explore",
  },
  {
    id: "lost",
    title: "I'm lost on campus",
    description:
      "Open the campus map, search for where you need to go and use directions from your current location when available.",
    icon: MapPin,
    actionLabel: "Open campus map",
    actionType: "explore",
  },
];

const guidance = [
  {
    title: "Official FUTA support",
    description:
      "Use this for university records, portal access, registration status, payments, screening and other matters only FUTA can confirm.",
    icon: ShieldCheck,
  },
  {
    title: "FUTAGO guidance",
    description:
      "Use FUTAGO to understand processes, find places and navigate campus. FUTAGO cannot change your official university record.",
    icon: HeartHandshake,
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filteredTopics = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return helpTopics;
    return helpTopics.filter((topic) =>
      `${topic.title} ${topic.description}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  const handleTopic = (topic: HelpTopic) => {
    if (topic.actionType === "explore") {
      router.push("/explore");
      return;
    }

    if (topic.actionType === "journey") {
      router.push("/journey");
      return;
    }

    if (topic.href) {
      window.open(topic.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f3ed] pb-32 text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
              <HeartHandshake size={15} /> Help
            </div>
            <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
              Get unstuck,
              <span className="block text-[#34744c] dark:text-[#8ce6ad]">without guessing.</span>
            </h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-[17px] bg-[#153f2a] text-[#9bedb7] shadow-lg sm:flex">
            <CircleHelp size={21} />
          </div>
        </header>

        <p className="mt-4 max-w-[660px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
          Start here when you need help with registration, the portal, finding an office or moving around campus.
        </p>

        <section className="mt-7 overflow-hidden rounded-[30px] bg-[#123f29] p-5 text-white shadow-[0_24px_70px_rgba(18,63,41,0.16)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_.78fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a9efc1]">
                <LifeBuoy size={14} /> Help centre
              </div>
              <h2 className="mt-4 max-w-[560px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                The right help, from the right place.
              </h2>
              <p className="mt-3 max-w-[580px] text-sm leading-6 text-white/55">
                FUTAGO can guide and navigate you, but official university matters should always go through FUTA's own channels.
              </p>
            </div>

            <a
              href="https://helpdesk.futa.edu.ng/undergraduate"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 touch-manipulation items-center justify-between gap-3 rounded-[17px] bg-[#9bedb7] px-4 text-sm font-extrabold text-[#0b2b1b] transition active:scale-[0.98]"
            >
              Open official FUTA helpdesk
              <ExternalLink size={16} />
            </a>
          </div>
        </section>

        <div className="mt-6 flex min-h-[58px] items-center gap-3 rounded-[20px] border border-black/[0.055] bg-white/80 px-4 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.045]">
          <Search size={18} className="shrink-0 text-black/35 dark:text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What do you need help with?"
            className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/28"
          />
        </div>

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#397151] dark:text-[#8ce6ad]">
              Common help
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">What do you need?</h2>
          </div>

          {filteredTopics.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <article
                    key={topic.id}
                    className="flex min-h-[215px] flex-col rounded-[26px] border border-black/[0.05] bg-white/72 p-5 shadow-[0_12px_35px_rgba(28,58,39,0.04)] dark:border-white/[0.07] dark:bg-white/[0.035]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#edf5ee] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">{topic.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">
                      {topic.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTopic(topic)}
                      className="mt-auto flex min-h-11 touch-manipulation items-center justify-between pt-5 text-sm font-extrabold text-[#2f7048] dark:text-[#8ce6ad]"
                    >
                      {topic.actionLabel}
                      {topic.actionType === "official" ? <ExternalLink size={15} /> : <ArrowRight size={16} />}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-black/10 p-8 text-center dark:border-white/10">
              <CircleHelp size={22} className="mx-auto text-black/25 dark:text-white/25" />
              <p className="mt-3 text-sm font-bold">No matching help topic yet.</p>
              <p className="mt-1 text-xs leading-5 text-black/35 dark:text-white/30">
                Try a shorter search, or use the official FUTA helpdesk for university-specific issues.
              </p>
            </div>
          )}
        </section>

        <section className="mt-7 grid gap-3 md:grid-cols-2">
          {guidance.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[26px] border border-black/[0.05] bg-[#eee9dc] p-5 dark:border-white/[0.06] dark:bg-[#111b14]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/70 text-[#34744c] dark:bg-white/[0.06] dark:text-[#8ce6ad]">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-black tracking-[-0.025em]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-black/48 dark:text-white/42">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="flex min-h-[108px] touch-manipulation items-center justify-between gap-4 rounded-[24px] bg-[#173f2b] p-5 text-left text-white"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.11em] text-[#9bedb7]"><MapPin size={14} /> Find a place</div>
              <p className="mt-2 text-sm font-bold text-white/70">Open Explore and get campus directions.</p>
            </div>
            <ArrowRight size={19} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/journey")}
            className="flex min-h-[108px] touch-manipulation items-center justify-between gap-4 rounded-[24px] border border-black/[0.05] bg-white/70 p-5 text-left dark:border-white/[0.06] dark:bg-white/[0.035]"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.11em] text-[#397151] dark:text-[#8ce6ad]"><Landmark size={14} /> Registration</div>
              <p className="mt-2 text-sm font-bold text-black/55 dark:text-white/50">Review the fresher registration journey.</p>
            </div>
            <ArrowRight size={19} />
          </button>
        </section>

        <section className="mt-7 rounded-[24px] border border-black/[0.05] bg-white/55 p-5 dark:border-white/[0.06] dark:bg-white/[0.025]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#fff2c8] text-[#806315] dark:bg-[#e0c563]/10 dark:text-[#e0c563]">
              <WifiOff size={18} />
            </div>
            <div>
              <p className="text-sm font-black">If a portal is temporarily unavailable</p>
              <p className="mt-1 text-xs leading-5 text-black/40 dark:text-white/35">
                Avoid paying anyone to bypass official systems. Retry later or use the official FUTA helpdesk for confirmation.
              </p>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-7 max-w-[760px] text-center text-[11px] leading-5 text-black/32 dark:text-white/28">
          FUTAGO is an independent student companion. It can guide students and help them find places, but it cannot confirm, edit or override official FUTA records.
        </p>
      </div>
    </main>
  );
}
