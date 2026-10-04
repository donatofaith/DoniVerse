"use client";

import {
  ArrowRight,
  Bookmark,
  BookOpenCheck,
  Building2,
  Clock3,
  Compass,
  GraduationCap,
  Heart,
  MapPin,
  Send,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";

type StoredItem = {
  id: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  href?: string;
};

type SubmissionSummary = {
  places: number;
  events: number;
  communities: number;
};

const STORAGE_KEYS = {
  places: "doniverse-saved-places",
  events: "doniverse-saved-events",
  communities: "doniverse-joined-communities",
  recent: "doniverse-recent-activity",
};

function readStoredItems(key: string): StoredItem[] {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function MyCampusPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<StoredItem[]>([]);
  const [savedEvents, setSavedEvents] = useState<StoredItem[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<StoredItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<StoredItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionSummary>({
    places: 0,
    events: 0,
    communities: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSavedPlaces(readStoredItems(STORAGE_KEYS.places));
      setSavedEvents(readStoredItems(STORAGE_KEYS.events));
      setJoinedCommunities(readStoredItems(STORAGE_KEYS.communities));
      setRecentActivity(readStoredItems(STORAGE_KEYS.recent));

      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (cancelled) return;

      setSignedIn(Boolean(user));

      if (user) {
        const [placeResult, eventResult, communityResult] = await Promise.all([
          supabase
            .from("place_suggestions")
            .select("id", { count: "exact", head: true })
            .eq("submitted_by", user.id),
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("created_by", user.id),
          supabase
            .from("communities")
            .select("id", { count: "exact", head: true })
            .eq("created_by", user.id),
        ]);

        if (!cancelled) {
          setSubmissions({
            places: placeResult.count ?? 0,
            events: eventResult.count ?? 0,
            communities: communityResult.count ?? 0,
          });
        }
      }

      if (!cancelled) setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalSaved = savedPlaces.length + savedEvents.length + joinedCommunities.length;
  const totalSubmissions = submissions.places + submissions.events + submissions.communities;

  const recentPreview = useMemo(() => recentActivity.slice(0, 3), [recentActivity]);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#e9efe9] pb-32 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-10 pt-[max(18px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="rounded-[30px] border border-white/65 bg-white/46 p-5 shadow-[0_24px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.045] sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-black text-[#2f6e48] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#9ae9b6]">
                <Sparkles size={14} /> Your DoniVerse
              </div>
              <h1 className="mt-4 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">My Campus</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/48 sm:text-base">
                Everything you save, join, submit and want to come back to — in one place.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#174d31] text-white shadow-[0_16px_40px_rgba(23,77,49,0.24)]">
              <GraduationCap size={23} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
            <Stat label="Saved" value={ready ? totalSaved : "—"} />
            <Stat label="Recent" value={ready ? recentActivity.length : "—"} />
            <Stat label="Submitted" value={ready ? totalSubmissions : "—"} />
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Saved places"
            description={savedPlaces.length ? `${savedPlaces.length} campus place${savedPlaces.length === 1 ? "" : "s"} saved` : "Keep useful campus locations close."}
            icon={MapPin}
            action="Explore places"
            onClick={() => router.push("/explore")}
          />
          <FeatureCard
            title="Saved events"
            description={savedEvents.length ? `${savedEvents.length} event${savedEvents.length === 1 ? "" : "s"} saved` : "Save events you do not want to miss."}
            icon={Bookmark}
            action="Discover events"
            onClick={() => router.push("/discover")}
          />
          <FeatureCard
            title="Joined communities"
            description={joinedCommunities.length ? `${joinedCommunities.length} communit${joinedCommunities.length === 1 ? "y" : "ies"} joined` : "Your campus communities will live here."}
            icon={UsersRound}
            action="Find communities"
            onClick={() => router.push("/discover")}
          />
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
          <div className="rounded-[28px] border border-white/60 bg-white/42 p-5 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#397950] dark:text-[#8ce6ad]">Recent activity</p>
                <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">Pick up where you left off</h2>
              </div>
              <Clock3 size={20} className="text-[#397950] dark:text-[#8ce6ad]" />
            </div>

            <div className="mt-4 space-y-2">
              {recentPreview.length > 0 ? (
                recentPreview.map((item) => (
                  <button
                    key={`${item.id}-${item.href ?? "recent"}`}
                    type="button"
                    onClick={() => item.href && router.push(item.href)}
                    className="flex min-h-14 w-full items-center justify-between rounded-[18px] border border-white/60 bg-white/45 px-4 text-left transition active:scale-[0.99] dark:border-white/[0.07] dark:bg-white/[0.035]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{item.title ?? item.name ?? "Campus activity"}</p>
                      {item.subtitle ? <p className="mt-0.5 truncate text-xs text-black/42 dark:text-white/38">{item.subtitle}</p> : null}
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-black/35 dark:text-white/35" />
                  </button>
                ))
              ) : (
                <EmptyState icon={Clock3} text="Places and things you revisit will appear here." />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/journey")}
            className="group relative overflow-hidden rounded-[28px] border border-white/60 bg-[#174d31] p-6 text-left text-white shadow-[0_24px_70px_rgba(23,77,49,0.20)] transition active:scale-[0.99] dark:border-white/[0.08]"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="relative z-10 flex h-full min-h-48 flex-col justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white/12">
                <BookOpenCheck size={21} />
              </div>
              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/58">Inside My Campus</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.045em]">My Journey</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">Your fresher registration guide is still here whenever you need it.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black">Open Journey <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </div>
            </div>
          </button>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-5 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/[0.08] dark:bg-white/[0.04] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#397950] dark:text-[#8ce6ad]">My submissions</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">Things you have contributed</h2>
            </div>
            <Send size={20} className="text-[#397950] dark:text-[#8ce6ad]" />
          </div>

          {!signedIn && ready ? (
            <div className="mt-4 rounded-[20px] border border-[#d8e6dc] bg-[#f5faf6]/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">
              <p className="text-sm font-black">Sign in to track submissions</p>
              <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/42">Guest mode can still use DoniVerse, but submission history belongs to your account.</p>
              <button type="button" onClick={() => router.push("/auth")} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#174d31] px-4 text-xs font-black text-white">Sign in <ArrowRight size={14} /></button>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <SubmissionTile icon={MapPin} label="Places" count={submissions.places} onClick={() => router.push("/explore/suggest-place")} />
              <SubmissionTile icon={Compass} label="Events" count={submissions.events} onClick={() => router.push("/discover/submit-event")} />
              <SubmissionTile icon={UsersRound} label="Communities" count={submissions.communities} onClick={() => router.push("/discover/submit-community")} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[18px] border border-white/60 bg-white/45 px-3 py-3 backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.035]">
      <p className="text-lg font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/38 dark:text-white/35">{label}</p>
    </div>
  );
}

function FeatureCard({ title, description, icon: Icon, action, onClick }: { title: string; description: string; icon: React.ElementType; action: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group rounded-[24px] border border-white/60 bg-white/42 p-5 text-left shadow-[0_16px_50px_rgba(16,46,28,0.07)] backdrop-blur-3xl transition active:scale-[0.99] dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#dceadf] text-[#245c3b] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]"><Icon size={19} /></div>
      <h2 className="mt-5 text-lg font-black tracking-[-0.035em]">{title}</h2>
      <p className="mt-1.5 min-h-10 text-sm leading-5 text-black/47 dark:text-white/43">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#2d6d46] dark:text-[#9ae9b6]">{action} <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
    </button>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex min-h-28 items-center gap-3 rounded-[20px] border border-dashed border-black/10 bg-white/22 px-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-black/32 dark:bg-white/[0.05] dark:text-white/32"><Icon size={18} /></div>
      <p className="text-sm leading-5 text-black/42 dark:text-white/40">{text}</p>
    </div>
  );
}

function SubmissionTile({ icon: Icon, label, count, onClick }: { icon: React.ElementType; label: string; count: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-20 items-center gap-3 rounded-[20px] border border-white/60 bg-white/45 px-4 text-left transition active:scale-[0.99] dark:border-white/[0.07] dark:bg-white/[0.035]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-[#dceadf] text-[#245c3b] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]"><Icon size={17} /></div>
      <div><p className="text-lg font-black leading-none">{count}</p><p className="mt-1 text-xs font-bold text-black/45 dark:text-white/42">{label}</p></div>
    </button>
  );
}
