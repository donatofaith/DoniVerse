"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type View = "events" | "communities";
type LoadState = "loading" | "ready" | "unavailable";
type CommunityCategory = "all" | "faith" | "academic" | "tech" | "creative" | "volunteering" | "student" | "sports" | "other";

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  organizer_name: string;
  official_url: string | null;
  image_url: string | null;
  is_featured: boolean;
};

type CommunityRecord = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location_name: string | null;
  contact_url: string | null;
  official_url: string | null;
  is_verified: boolean;
};

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

const communityCategories: { value: CommunityCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "student", label: "Student" },
  { value: "academic", label: "Academic" },
  { value: "tech", label: "Tech" },
  { value: "faith", label: "Faith" },
  { value: "creative", label: "Creative" },
  { value: "volunteering", label: "Volunteering" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

export default function DiscoverPage() {
  const [view, setView] = useState<View>("events");
  const [query, setQuery] = useState("");
  const [communityCategory, setCommunityCategory] = useState<CommunityCategory>("all");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [communities, setCommunities] = useState<CommunityRecord[]>([]);
  const [eventState, setEventState] = useState<LoadState>("loading");
  const [communityState, setCommunityState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadDiscover() {
      const [eventsResult, communitiesResult] = await Promise.all([
        supabase
          .from("events")
          .select(
            "id,title,description,event_type,starts_at,ends_at,venue_name,organizer_name,official_url,image_url,is_featured",
          )
          .order("starts_at", { ascending: true }),
        supabase
          .from("communities")
          .select(
            "id,name,category,description,location_name,contact_url,official_url,is_verified",
          )
          .order("name", { ascending: true }),
      ]);

      if (cancelled) return;

      if (eventsResult.error) {
        setEvents([]);
        setEventState("unavailable");
      } else {
        setEvents((eventsResult.data ?? []) as EventRecord[]);
        setEventState("ready");
      }

      if (communitiesResult.error) {
        setCommunities([]);
        setCommunityState("unavailable");
      } else {
        setCommunities((communitiesResult.data ?? []) as CommunityRecord[]);
        setCommunityState("ready");
      }
    }

    void loadDiscover();

    return () => {
      cancelled = true;
    };
  }, []);

  const eventGroups = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);

    const happeningNow: EventRecord[] = [];
    const thisWeek: EventRecord[] = [];
    const upcoming: EventRecord[] = [];

    for (const event of events) {
      const start = new Date(event.starts_at);
      const end = event.ends_at ? new Date(event.ends_at) : start;

      if (start <= now && end >= now) {
        happeningNow.push(event);
      } else if (start > now && start <= weekEnd) {
        thisWeek.push(event);
      } else if (start > weekEnd) {
        upcoming.push(event);
      }
    }

    return { happeningNow, thisWeek, upcoming };
  }, [events]);

  const filteredCommunities = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return communities.filter((community) => {
      if (communityCategory !== "all" && community.category !== communityCategory) return false;
      if (!normalized) return true;

      return `${community.name} ${community.category} ${community.description ?? ""} ${community.location_name ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [communities, query, communityCategory]);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#e9efe9] pb-32 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-[0.24] dark:opacity-[0.16]"
        style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(244,248,244,0.80)_0%,rgba(236,243,238,0.92)_40%,rgba(228,237,231,0.97)_100%)] dark:bg-[linear-gradient(180deg,rgba(5,11,7,0.72)_0%,rgba(5,11,7,0.90)_42%,rgba(5,11,7,0.97)_100%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed -right-24 top-16 h-72 w-72 rounded-full bg-[#8fddb0]/25 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none fixed -left-24 bottom-20 h-72 w-72 rounded-full bg-[#e4c469]/18 blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="rounded-[28px] border border-white/60 bg-white/38 p-5 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
                <Compass size={15} /> Discover DoniVerse
              </div>
              <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
                What&apos;s happening,
                <span className="block text-[#34744c] dark:text-[#8ce6ad]">around campus.</span>
              </h1>
            </div>

            <div className="hidden h-12 w-12 items-center justify-center rounded-[17px] border border-white/60 bg-white/46 text-[#34744c] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#9bedb7] sm:flex">
              <Sparkles size={21} />
            </div>
          </div>

          <p className="mt-4 max-w-[650px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
            See what&apos;s happening around campus and find communities you can join.
          </p>

          <div className="mt-5 inline-flex rounded-[18px] border border-white/60 bg-white/34 p-1.5 shadow-sm backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.04]">
            {(["events", "communities"] as View[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`min-h-11 touch-manipulation rounded-[13px] px-5 text-sm font-extrabold capitalize transition ${
                  view === item
                    ? "border border-white/65 bg-white/60 text-[#214f34] shadow-sm dark:border-white/[0.08] dark:bg-white/[0.08] dark:text-white"
                    : "text-black/42 dark:text-white/42"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        {view === "events" ? (
          <>
            <section className="mt-5 overflow-hidden rounded-[30px] border border-white/55 bg-white/32 p-5 shadow-[0_24px_70px_rgba(16,46,28,0.10)] backdrop-blur-3xl sm:p-7 dark:border-white/[0.08] dark:bg-white/[0.04]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/38 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2d6d47] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#a9efc1]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#65b886] dark:bg-[#9bedb7]" /> Campus pulse
              </div>
              <h2 className="mt-4 max-w-[560px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Don&apos;t miss what&apos;s happening on campus.
              </h2>
              <p className="mt-3 max-w-[610px] text-sm leading-6 text-black/50 dark:text-white/48">
                Posters first, then the details you need: time, venue and organiser.
              </p>
              <a
                href="#upcoming"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[16px] border border-white/65 bg-white/58 px-5 text-sm font-extrabold text-[#214f34] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
              >
                See upcoming <ArrowRight size={17} />
              </a>
            </section>

            {eventState === "loading" ? (
              <LoadingCard label="Loading campus events" />
            ) : eventState === "unavailable" ? (
              <UnavailableCard label="events" />
            ) : (
              <>
                <section className="mt-5 grid gap-4 md:grid-cols-2">
                  <EventGroupCard
                    eyebrow="Happening now"
                    title={
                      eventGroups.happeningNow.length
                        ? `${eventGroups.happeningNow.length} live ${eventGroups.happeningNow.length === 1 ? "event" : "events"}`
                        : "Nothing happening right now"
                    }
                    description={
                      eventGroups.happeningNow.length
                        ? "See the poster, time, venue and organiser below."
                        : "Check back soon for events happening around campus."
                    }
                    icon={<Clock3 size={20} />}
                    accent="green"
                  />
                  <EventGroupCard
                    eyebrow="This week"
                    title={
                      eventGroups.thisWeek.length
                        ? `${eventGroups.thisWeek.length} coming up this week`
                        : "Nothing on the calendar this week"
                    }
                    description="See what&apos;s coming up over the next seven days."
                    icon={<CalendarDays size={20} />}
                    accent="gold"
                  />
                </section>

                {eventGroups.happeningNow.length > 0 && (
                  <EventList title="Happening now" events={eventGroups.happeningNow} />
                )}

                {eventGroups.thisWeek.length > 0 && (
                  <EventList title="This week" events={eventGroups.thisWeek} />
                )}

                <section id="upcoming" className="mt-7">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#397151] dark:text-[#8ce6ad]">Coming up</p>
                      <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">Upcoming events</h2>
                    </div>
                    <CalendarDays size={20} className="text-[#397151] dark:text-[#8ce6ad]" />
                  </div>

                  {eventGroups.upcoming.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {eventGroups.upcoming.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[26px] border border-dashed border-white/60 bg-white/28 p-7 text-center backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.025]">
                      <CalendarDays size={22} className="mx-auto text-black/25 dark:text-white/25" />
                      <p className="mt-3 text-sm font-black">No upcoming events right now.</p>
                      <p className="mt-1 text-xs text-black/38 dark:text-white/32">Check back soon for what&apos;s next around campus.</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          <section className="mt-5">
            <div className="rounded-[28px] border border-white/55 bg-white/32 p-5 shadow-[0_22px_65px_rgba(16,46,28,0.09)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/60 bg-white/48 text-[#34744c] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#9bedb7]">
                    <Users size={22} />
                  </div>
                  <h2 className="mt-5 text-[27px] font-black tracking-[-0.045em]">Find your people.</h2>
                  <p className="mt-2 max-w-[620px] text-sm leading-6 text-black/50 dark:text-white/48">
                    Student associations, fellowships, academic groups, clubs, creative communities and more.
                  </p>
                </div>

                <a
                  href="/discover/submit-community"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[17px] bg-[#174d31] px-5 text-sm font-black text-white shadow-[0_16px_44px_rgba(23,77,49,0.20)] transition active:scale-[0.99] dark:bg-[#9bedb7] dark:text-[#0b2717]"
                >
                  <Plus size={17} /> Add your community
                </a>
              </div>
            </div>

            <div className="mt-4 flex min-h-[58px] items-center gap-3 rounded-[20px] border border-white/60 bg-white/40 px-4 shadow-sm backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04]">
              <Search size={18} className="shrink-0 text-black/35 dark:text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search communities..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/30 dark:placeholder:text-white/28"
              />
            </div>

            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {communityCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setCommunityCategory(category.value)}
                  className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black transition ${
                    communityCategory === category.value
                      ? "bg-[#174d31] text-white dark:bg-[#9bedb7] dark:text-[#0b2717]"
                      : "border border-white/60 bg-white/40 text-black/48 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/45"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {communityState === "loading" ? (
              <LoadingCard label="Loading communities" />
            ) : communityState === "unavailable" ? (
              <UnavailableCard label="communities" />
            ) : filteredCommunities.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-white/60 bg-white/26 p-8 text-center backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.025]">
                <Users size={22} className="mx-auto text-black/25 dark:text-white/25" />
                <p className="mt-3 text-sm font-bold">No community matches those filters.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function EventGroupCard({
  eyebrow,
  title,
  description,
  icon,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: "green" | "gold";
}) {
  const green = accent === "green";

  return (
    <article className="rounded-[26px] border border-white/55 bg-white/34 p-5 shadow-[0_16px_48px_rgba(16,46,28,0.07)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/60 bg-white/48 shadow-sm backdrop-blur-xl ${
            green
              ? "text-[#34744c] dark:text-[#8ce6ad]"
              : "text-[#7b6424] dark:text-[#e0c563]"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-black/35 dark:text-white/35">{eyebrow}</p>
          <h2 className="mt-2 text-lg font-black">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">{description}</p>
        </div>
      </div>
    </article>
  );
}

function EventList({ title, events }: { title: string; events: EventRecord[] }) {
  return (
    <section className="mt-7">
      <h2 className="text-xl font-black tracking-[-0.035em]">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventRecord }) {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;

  const date = start.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = start.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end
    ? end.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/55 bg-white/38 shadow-[0_18px_54px_rgba(16,46,28,0.09)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.045]">
      {event.image_url ? (
        <div className="relative overflow-hidden border-b border-white/45 bg-black/[0.04] dark:border-white/[0.06] dark:bg-black/20">
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-20 blur-2xl"
            style={{ backgroundImage: `url(${event.image_url})` }}
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={`${event.title} event poster`}
            loading="lazy"
            className="relative mx-auto aspect-[4/5] max-h-[520px] w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-[150px] items-center justify-center border-b border-white/45 bg-[radial-gradient(circle_at_20%_20%,rgba(140,230,173,0.18),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.35),rgba(255,255,255,0.12))] dark:border-white/[0.06] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(140,230,173,0.10),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          <div className="text-center">
            <CalendarDays size={24} className="mx-auto text-[#397151]/55 dark:text-[#8ce6ad]/60" />
            <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-black/28 dark:text-white/28">Campus event</p>
          </div>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#397151] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#8ce6ad]">
            {event.event_type}
          </span>
          {event.is_featured && (
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#8a6d20] dark:text-[#e0c563]">Featured</span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-black tracking-[-0.035em]">{event.title}</h3>
        {event.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/45 dark:text-white/40">{event.description}</p>
        )}

        <div className="mt-5 space-y-2 text-xs font-semibold text-black/48 dark:text-white/42">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[#397151] dark:text-[#8ce6ad]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={14} className="text-[#397151] dark:text-[#8ce6ad]" />
            <span>{startTime}{endTime ? ` – ${endTime}` : ""}</span>
          </div>
          {event.venue_name && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#397151] dark:text-[#8ce6ad]" />
              <span>{event.venue_name}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/55 pt-4 dark:border-white/[0.06]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30 dark:text-white/28">Organiser</p>
            <p className="mt-1 text-xs font-bold">{event.organizer_name}</p>
          </div>
          {event.official_url && (
            <a
              href={event.official_url}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-10 items-center gap-2 rounded-[14px] border border-white/60 bg-white/48 px-3 text-xs font-extrabold text-[#214f34] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white"
            >
              More info <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function CommunityCard({ community }: { community: CommunityRecord }) {
  const destination = community.official_url || community.contact_url;

  return (
    <article className="rounded-[26px] border border-white/55 bg-white/34 p-5 shadow-[0_16px_48px_rgba(16,46,28,0.07)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/60 bg-white/48 text-[#34744c] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#8ce6ad]">
          <Users size={19} />
        </div>
        {community.is_verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-800 dark:text-emerald-200">
            <ShieldCheck size={12} /> Verified
          </span>
        )}
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.11em] text-[#397151] dark:text-[#8ce6ad]">{community.category}</p>
      <h3 className="mt-1 text-lg font-black tracking-[-0.03em]">{community.name}</h3>
      {community.description && (
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-black/45 dark:text-white/40">{community.description}</p>
      )}
      {community.location_name && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-black/38 dark:text-white/34">
          <MapPin size={14} /> {community.location_name}
        </div>
      )}
      {destination && (
        <a
          href={destination}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[14px] border border-white/60 bg-white/45 px-3 text-xs font-extrabold text-[#2f7048] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#8ce6ad]"
        >
          Join or learn more <ExternalLink size={13} />
        </a>
      )}
    </article>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="mt-6 flex min-h-[120px] items-center justify-center gap-3 rounded-[24px] border border-white/55 bg-white/28 text-sm font-bold text-black/45 shadow-sm backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/40">
      <LoaderCircle size={18} className="animate-spin" /> {label}
    </div>
  );
}

function UnavailableCard({ label }: { label: "events" | "communities" }) {
  return (
    <div className="mt-6 rounded-[24px] border border-white/55 bg-white/28 p-6 text-center shadow-sm backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.03]">
      <p className="text-sm font-black">We couldn&apos;t load {label} right now.</p>
      <p className="mt-2 text-xs leading-5 text-black/38 dark:text-white/32">Check your connection and try again in a moment.</p>
    </div>
  );
}
