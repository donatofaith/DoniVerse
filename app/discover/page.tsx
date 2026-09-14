"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Compass,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type View = "events" | "communities";
type LoadState = "loading" | "ready" | "unavailable";

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

export default function DiscoverPage() {
  const [view, setView] = useState<View>("events");
  const [query, setQuery] = useState("");
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
            "id,title,description,event_type,starts_at,ends_at,venue_name,organizer_name,official_url,is_featured",
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
    if (!normalized) return communities;

    return communities.filter((community) =>
      `${community.name} ${community.category} ${community.description ?? ""} ${community.location_name ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [communities, query]);

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f3ed] pb-32 text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
              <Compass size={15} /> Discover FUTA
            </div>
            <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
              What&apos;s happening,
              <span className="block text-[#34744c] dark:text-[#8ce6ad]">around campus.</span>
            </h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-[17px] bg-[#153f2a] text-[#9bedb7] shadow-lg sm:flex">
            <Sparkles size={21} />
          </div>
        </header>

        <p className="mt-4 max-w-[650px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
          See what&apos;s happening around campus and find communities you can join.
        </p>

        <div className="mt-6 inline-flex rounded-[18px] border border-black/[0.055] bg-white/70 p-1.5 dark:border-white/[0.07] dark:bg-white/[0.035]">
          {(["events", "communities"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`min-h-11 touch-manipulation rounded-[13px] px-5 text-sm font-extrabold capitalize transition ${
                view === item
                  ? "bg-[#153f2a] text-white shadow-sm dark:bg-[#8ce6ad] dark:text-[#092417]"
                  : "text-black/42 dark:text-white/42"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {view === "events" ? (
          <>
            <section className="mt-6 overflow-hidden rounded-[30px] bg-[#123f29] p-5 text-white shadow-[0_24px_70px_rgba(18,63,41,0.16)] sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a9efc1]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#9bedb7]" /> Campus pulse
              </div>
              <h2 className="mt-4 max-w-[560px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Don&apos;t miss what&apos;s happening at FUTA.
              </h2>
              <p className="mt-3 max-w-[610px] text-sm leading-6 text-white/58">
                See what&apos;s happening now, what&apos;s on this week and what&apos;s coming next.
              </p>
              <a
                href="#upcoming"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[16px] bg-[#9bedb7] px-5 text-sm font-extrabold text-[#0b2b1b]"
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
                <section className="mt-6 grid gap-4 md:grid-cols-2">
                  <EventGroupCard
                    eyebrow="Happening now"
                    title={
                      eventGroups.happeningNow.length
                        ? `${eventGroups.happeningNow.length} live ${eventGroups.happeningNow.length === 1 ? "event" : "events"}`
                        : "Nothing happening right now"
                    }
                    description={
                      eventGroups.happeningNow.length
                        ? "Open an event to see the time, venue and organiser."
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
                    <div className="grid gap-3 md:grid-cols-2">
                      {eventGroups.upcoming.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[26px] border border-dashed border-black/10 bg-white/40 p-7 text-center dark:border-white/10 dark:bg-white/[0.02]">
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
          <section className="mt-6">
            <div className="rounded-[28px] bg-[#173f2b] p-5 text-white sm:p-6">
              <Users size={22} className="text-[#9bedb7]" />
              <h2 className="mt-5 text-[27px] font-black tracking-[-0.045em]">Find your people.</h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-white/58">
                Student associations, fellowships, academic groups, clubs, creative communities and more.
              </p>
            </div>

            <div className="mt-5 flex min-h-[58px] items-center gap-3 rounded-[20px] border border-black/[0.055] bg-white/80 px-4 dark:border-white/[0.07] dark:bg-white/[0.045]">
              <Search size={18} className="shrink-0 text-black/35 dark:text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search communities..."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/30 dark:placeholder:text-white/28"
              />
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
              <div className="mt-5 rounded-[24px] border border-dashed border-black/10 p-8 text-center dark:border-white/10">
                <Users size={22} className="mx-auto text-black/25 dark:text-white/25" />
                <p className="mt-3 text-sm font-bold">No community matches that search.</p>
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
    <article
      className={`rounded-[26px] border p-5 ${
        green
          ? "border-[#2e7048]/15 bg-[#e8f0e7] dark:border-[#8ce6ad]/10 dark:bg-[#102318]"
          : "border-black/[0.055] bg-white/70 dark:border-white/[0.07] dark:bg-white/[0.035]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${
            green
              ? "bg-white/80 text-[#34744c] dark:bg-white/[0.07] dark:text-[#8ce6ad]"
              : "bg-[#eee9dc] text-[#7b6424] dark:bg-[#e0c563]/10 dark:text-[#e0c563]"
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
      <div className="mt-4 grid gap-3 md:grid-cols-2">
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
    <article className="rounded-[26px] border border-black/[0.055] bg-white/75 p-5 shadow-[0_12px_35px_rgba(28,58,39,0.04)] dark:border-white/[0.07] dark:bg-white/[0.035]">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#e9f3ea] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#397151] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
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

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-black/[0.05] pt-4 dark:border-white/[0.06]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/30 dark:text-white/28">Organiser</p>
          <p className="mt-1 text-xs font-bold">{event.organizer_name}</p>
        </div>
        {event.official_url && (
          <a
            href={event.official_url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-10 items-center gap-2 rounded-[14px] bg-[#153f2a] px-3 text-xs font-extrabold text-white dark:bg-[#8ce6ad] dark:text-[#092417]"
          >
            More info <ExternalLink size={13} />
          </a>
        )}
      </div>
    </article>
  );
}

function CommunityCard({ community }: { community: CommunityRecord }) {
  const destination = community.official_url || community.contact_url;

  return (
    <article className="rounded-[26px] border border-black/[0.05] bg-white/72 p-5 dark:border-white/[0.07] dark:bg-white/[0.035]">
      <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#edf5ee] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
        <Users size={19} />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.11em] text-[#397151] dark:text-[#8ce6ad]">{community.category}</p>
      <h3 className="mt-1 text-lg font-black tracking-[-0.03em]">{community.name}</h3>
      {community.description && (
        <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">{community.description}</p>
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
          className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-extrabold text-[#2f7048] dark:text-[#8ce6ad]"
        >
          View community <ExternalLink size={13} />
        </a>
      )}
    </article>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="mt-6 flex min-h-[120px] items-center justify-center gap-3 rounded-[24px] border border-black/[0.05] bg-white/55 text-sm font-bold text-black/45 dark:border-white/[0.06] dark:bg-white/[0.025] dark:text-white/40">
      <LoaderCircle size={18} className="animate-spin" /> {label}
    </div>
  );
}

function UnavailableCard({ label }: { label: "events" | "communities" }) {
  return (
    <div className="mt-6 rounded-[24px] border border-black/[0.05] bg-white/55 p-6 text-center dark:border-white/[0.06] dark:bg-white/[0.025]">
      <p className="text-sm font-black">We couldn&apos;t load {label} right now.</p>
      <p className="mt-2 text-xs leading-5 text-black/38 dark:text-white/32">Check your connection and try again in a moment.</p>
    </div>
  );
}
