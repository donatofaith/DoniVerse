"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  Compass,
  Dumbbell,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Search,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "food", label: "Food", icon: Utensils },
  { id: "community", label: "Communities", icon: Users },
  { id: "sports", label: "Sports", icon: Dumbbell },
  { id: "support", label: "Services", icon: HeartHandshake },
] as const;

type CategoryId = (typeof categories)[number]["id"];

type DiscoverItem = {
  id: string;
  title: string;
  category: Exclude<CategoryId, "all" | "events">;
  label: string;
  description: string;
  location: string;
  icon: typeof BookOpen;
  featured?: boolean;
};

const discoverItems: DiscoverItem[] = [
  {
    id: "library",
    title: "FUTA Library",
    category: "study",
    label: "Study",
    description:
      "A core campus study destination for reading, research and focused work.",
    location: "Albert Ilemobade Library",
    icon: BookOpen,
    featured: true,
  },
  {
    id: "student-affairs",
    title: "Student Affairs",
    category: "support",
    label: "Student services",
    description:
      "A useful starting point for student welfare, guidance and campus support matters.",
    location: "Student Affairs Division",
    icon: HeartHandshake,
  },
  {
    id: "campus-food",
    title: "Food around campus",
    category: "food",
    label: "Food & hangouts",
    description:
      "Discover student-friendly places to eat and relax around FUTA as verified spots are added.",
    location: "FUTA campus",
    icon: Coffee,
  },
  {
    id: "student-communities",
    title: "Student communities",
    category: "community",
    label: "Communities",
    description:
      "Find academic, faith, creative and student-led communities as FUTAGO verifies their details.",
    location: "Across campus",
    icon: Users,
  },
  {
    id: "sports",
    title: "Sports & recreation",
    category: "sports",
    label: "Sports",
    description:
      "Explore campus recreation spaces and student sporting activities.",
    location: "FUTA campus",
    icon: Dumbbell,
  },
];

export default function DiscoverPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return discoverItems.filter((item) => {
      const categoryMatch = activeCategory === "all" || activeCategory === item.category;
      const searchMatch =
        !normalized ||
        `${item.title} ${item.label} ${item.description} ${item.location}`
          .toLowerCase()
          .includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, query]);

  const openExplore = (place?: string) => {
    router.push(place ? `/explore?q=${encodeURIComponent(place)}` : "/explore");
  };

  const showEvents = activeCategory === "all" || activeCategory === "events";
  const showDiscoverItems = activeCategory !== "events";

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f3ed] pb-32 text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
              <Compass size={15} /> Discover FUTA
            </div>
            <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
              Campus life,
              <span className="block text-[#34744c] dark:text-[#8ce6ad]">in one place.</span>
            </h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-[17px] bg-[#153f2a] text-[#9bedb7] shadow-lg sm:flex">
            <Sparkles size={21} />
          </div>
        </header>

        <p className="mt-4 max-w-[610px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
          Find what is happening, where students gather, useful campus services and places worth knowing.
        </p>

        <section className="mt-7 overflow-hidden rounded-[30px] bg-[#123f29] text-white shadow-[0_24px_70px_rgba(18,63,41,0.16)]">
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute right-10 top-12 h-28 w-28 rounded-full bg-[#d9bd55]/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a9efc1]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#9bedb7]" /> Campus pulse
                </div>
                <h2 className="mt-4 max-w-[540px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                  See what&apos;s happening around FUTA.
                </h2>
                <p className="mt-3 max-w-[540px] text-sm leading-6 text-white/55">
                  Events appear here only when FUTAGO can verify the organiser, date or official source. No random forwarded dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory("events")}
                className="flex min-h-12 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[16px] bg-[#9bedb7] px-5 text-sm font-extrabold text-[#0b2b1b] transition active:scale-[0.98]"
              >
                Browse events <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {showEvents && (
          <section className="mt-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#397151] dark:text-[#8ce6ad]">Events & campus updates</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">What&apos;s happening</h2>
              </div>
              <CalendarDays size={20} className="text-[#397151] dark:text-[#8ce6ad]" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.14fr_.86fr]">
              <article className="relative overflow-hidden rounded-[28px] bg-[#173f2b] p-5 text-white sm:p-6">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#9bedb7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.11em] text-[#0b2b1b]">Upcoming</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/50">
                      <CheckCircle2 size={13} /> Official FUTA listing
                    </span>
                  </div>
                  <h3 className="mt-5 max-w-[580px] text-[26px] font-black leading-[1.03] tracking-[-0.04em] sm:text-[31px]">13th SAAT Annual Conference 2026</h3>
                  <p className="mt-3 max-w-[620px] text-sm leading-6 text-white/58">
                    FUTA currently lists the 13th School of Agriculture and Agricultural Technology Annual Conference 2026 among its featured official links. The accessible listing does not expose a confirmed event date yet, so FUTAGO will not guess one.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold text-white/55">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2"><CalendarDays size={14} /> Date awaiting official confirmation</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-2"><MapPin size={14} /> FUTA</span>
                  </div>
                  <a
                    href="https://futa.edu.ng/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-[15px] bg-[#9bedb7] px-4 text-sm font-extrabold text-[#0b2b1b] transition active:scale-[0.98]"
                  >
                    Check official FUTA page <ExternalLink size={15} />
                  </a>
                </div>
              </article>

              <div className="grid gap-4">
                <article className="rounded-[26px] border border-black/[0.055] bg-white/75 p-5 dark:border-white/[0.07] dark:bg-white/[0.035]">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf5ee] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.11em] text-black/35 dark:text-white/35">Happening now</p>
                      <h3 className="mt-2 text-base font-black">No verified live campus event right now</h3>
                      <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">
                        When a verified event is live, this card will show its time, venue and directions.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[26px] bg-[#eee9dc] p-5 dark:bg-[#e0c563]/[0.07]">
                  <p className="text-xs font-extrabold uppercase tracking-[0.11em] text-[#7b6424] dark:text-[#e0c563]">Recently held</p>
                  <h3 className="mt-2 text-base font-black">FUTA 206th Inaugural Lecture</h3>
                  <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">
                    Professor Kenneth Kanayo Alaneme delivered FUTA&apos;s 206th Inaugural Lecture on 8 September 2026.
                  </p>
                </article>
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex min-h-[58px] items-center gap-3 rounded-[20px] border border-black/[0.055] bg-white/80 px-4 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.045]">
          <Search size={18} className="shrink-0 text-black/35 dark:text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search places, communities, services..."
            className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/28"
          />
        </div>

        <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex min-h-11 shrink-0 touch-manipulation items-center gap-2 rounded-full border px-4 text-xs font-extrabold transition active:scale-[0.98] ${
                  active
                    ? "border-[#2e7048] bg-[#1c5a39] text-white dark:border-[#8ce6ad]/30 dark:bg-[#8ce6ad] dark:text-[#092417]"
                    : "border-black/[0.055] bg-white/65 text-black/48 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-white/45"
                }`}
              >
                <Icon size={15} /> {category.label}
              </button>
            );
          })}
        </div>

        {showDiscoverItems && (
          <section className="mt-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#397151] dark:text-[#8ce6ad]">Explore campus life</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">Useful around FUTA</h2>
              </div>
              <span className="text-xs font-bold text-black/30 dark:text-white/30">{filteredItems.length} shown</span>
            </div>

            {filteredItems.length ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.id} className={`group flex min-h-[235px] flex-col rounded-[26px] border p-5 transition hover:-translate-y-0.5 ${item.featured ? "border-[#2e7048]/15 bg-[#e8f0e7] dark:border-[#8ce6ad]/10 dark:bg-[#102318]" : "border-black/[0.05] bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.035]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/80 text-[#2f7048] shadow-sm dark:bg-white/[0.07] dark:text-[#8ce6ad]">
                          <Icon size={19} />
                        </div>
                        <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.09em] text-black/38 dark:bg-white/[0.06] dark:text-white/35">{item.label}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">{item.description}</p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-black/35 dark:text-white/30">
                          <MapPin size={14} className="shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <button type="button" onClick={() => openExplore(item.location)} className="flex min-h-10 shrink-0 touch-manipulation items-center gap-1 rounded-full bg-[#153f2a] px-3 text-xs font-extrabold text-white dark:bg-[#8ce6ad] dark:text-[#092417]">
                          Directions <ChevronRight size={14} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-black/10 p-8 text-center dark:border-white/10">
                <Search size={22} className="mx-auto text-black/25 dark:text-white/25" />
                <p className="mt-3 text-sm font-bold">Nothing matches that search yet.</p>
              </div>
            )}
          </section>
        )}

        <section className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-black/[0.05] bg-[#eee9dc] p-5 dark:border-white/[0.06] dark:bg-[#111b14]">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#7b6424] dark:text-[#e0c563]"><Clock3 size={15} /> Event quality</div>
            <p className="mt-3 text-sm leading-6 text-black/48 dark:text-white/42">Dates, venues and organisers are shown only after they are verified from an official FUTA source or a trusted organiser.</p>
          </div>
          <button type="button" onClick={() => openExplore()} className="group flex min-h-[132px] touch-manipulation items-center justify-between gap-5 rounded-[24px] bg-[#173f2b] p-5 text-left text-white">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#9bedb7]">Need the map?</p>
              <p className="mt-2 text-lg font-black">Open Explore</p>
              <p className="mt-1 text-xs leading-5 text-white/50">Find a place and get directions.</p>
            </div>
            <ChevronRight size={21} className="transition group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    </main>
  );
}
