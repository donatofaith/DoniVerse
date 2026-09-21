"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpenCheck,
  Building2,
  ChevronRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Home,
  Library,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Search,
  ShieldPlus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { FUTAGO_GUEST_KEY } from "@/components/AppAccessGate";\nimport PWAInstallCard from "@/components/PWAInstallCard";
import { supabase } from "@/lib/supabase/client";

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

const quickActions = [
  {
    title: "My Journey",
    subtitle: "Track your progress",
    icon: BookOpenCheck,
    href: "/journey",
  },
  {
    title: "My Department",
    subtitle: "Find your department",
    icon: Building2,
    href: "/explore",
  },
  {
    title: "Get Help",
    subtitle: "Campus assistance",
    icon: HeartHandshake,
    href: "/help",
  },
];

const popularPlaces = [
  {
    name: "FUTA Library",
    category: "Study",
    icon: Library,
    label: "Popular",
  },
  {
    name: "Health Centre",
    category: "Health",
    icon: ShieldPlus,
    label: "Essential",
  },
  {
    name: "Student Affairs",
    category: "Student Services",
    icon: GraduationCap,
    label: "Useful",
  },
];

const navItems = [
  { label: "Home", icon: Home, href: "/", active: true },
  { label: "Explore", icon: Compass, href: "/explore" },
  { label: "Journey", icon: BookOpenCheck, href: "/journey" },
  { label: "Discover", icon: Sparkles, href: "/discover" },
  { label: "Help", icon: HeartHandshake, href: "/help" },
];

type HomeProfile = {
  fullName: string;
  department: string;
  level: string;
  isGuest: boolean;
};

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const reduceMotion = !!useReducedMotion();
  const profileRef = useRef<HTMLDivElement>(null);

  const [greeting, setGreeting] = useState("Good day");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<HomeProfile>({
    fullName: "Guest",
    department: "Not signed in",
    level: "—",
    isGuest: true,
  });

  useEffect(() => {
    const updateGreeting = () => setGreeting(getGreeting(new Date().getHours()));
    updateGreeting();
    const timer = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (!cancelled) {
          setProfile({
            fullName: "Guest",
            department: "Explore FUTAGO as a guest",
            level: "—",
            isGuest: true,
          });
        }
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("full_name, department_id, level")
        .eq("id", session.user.id)
        .maybeSingle();

      let department = "Department not set";

      if (profileRow?.department_id) {
        const { data: departmentRow } = await supabase
          .from("departments")
          .select("name, short_name")
          .eq("id", profileRow.department_id)
          .maybeSingle();

        if (departmentRow) {
          department = departmentRow.short_name || departmentRow.name;
        }
      }

      if (cancelled) return;

      setProfile({
        fullName:
          profileRow?.full_name ||
          session.user.user_metadata?.full_name ||
          "FUTARIAN",
        department,
        level: profileRow?.level ? `${profileRow.level} Level` : "Level not set",
        isGuest: false,
      });
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [profileOpen]);

  const handleAccountAction = async () => {
    setProfileOpen(false);

    if (profile.isGuest) {
      window.localStorage.removeItem(FUTAGO_GUEST_KEY);
      router.push("/auth");
      return;
    }

    await supabase.auth.signOut();
    window.localStorage.removeItem(FUTAGO_GUEST_KEY);
    router.replace("/auth");
    router.refresh();
  };

  const openProfile = () => {
    if (profile.isGuest) return;
    setProfileOpen(false);
    router.push("/onboarding");
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#e8f0ea] text-[#102017] dark:bg-[#08110c] dark:text-white">
      <CampusBackdrop />

      <div className="relative z-10 mx-auto min-h-[100dvh] w-full max-w-[1120px] px-4 pb-32 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        <header className="relative z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/55 bg-white/45 text-[#173a26] shadow-[0_12px_35px_rgba(21,51,33,0.12)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/10 dark:text-white">
              <GraduationCap size={21} />
            </div>
            <div>
              <p className="text-lg font-black tracking-[-0.045em]">FUTAGO</p>
              <p className="text-[11px] text-black/45 dark:text-white/50">Know where to go.</p>
            </div>
          </button>

          <div ref={profileRef} className="relative">
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/45 text-[#173a26] shadow-[0_12px_35px_rgba(21,51,33,0.12)] backdrop-blur-2xl dark:border-white/12 dark:bg-white/10 dark:text-white"
              aria-label="Open profile"
              aria-expanded={profileOpen}
            >
              <UserRound size={18} />
            </motion.button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-[min(310px,calc(100vw-32px))] overflow-hidden rounded-[25px] border border-white/70 bg-white/68 p-3 shadow-[0_24px_80px_rgba(15,34,23,0.2)] backdrop-blur-3xl dark:border-white/12 dark:bg-[#0b1410]/78">
                <div className="rounded-[19px] border border-white/70 bg-white/45 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-white/70 text-[#24563a] shadow-sm dark:bg-white/10 dark:text-[#a9efc1]">
                      <UserRound size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{profile.fullName}</p>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#487459] dark:text-[#a9efc1]">
                        {profile.isGuest ? "Guest" : "Profile"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[14px] border border-white/60 bg-white/38 p-3 dark:border-white/8 dark:bg-white/[0.04]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/35 dark:text-white/35">Department</p>
                      <p className="mt-1 truncate text-xs font-extrabold">{profile.department}</p>
                    </div>
                    <div className="rounded-[14px] border border-white/60 bg-white/38 p-3 dark:border-white/8 dark:bg-white/[0.04]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/35 dark:text-white/35">Level</p>
                      <p className="mt-1 truncate text-xs font-extrabold">{profile.level}</p>
                    </div>
                  </div>
                </div>

                {!profile.isGuest && (
                  <button
                    type="button"
                    onClick={openProfile}
                    className="mt-2 flex min-h-12 w-full items-center justify-between rounded-[16px] px-3 text-left text-sm font-extrabold text-[#244f35] transition hover:bg-white/35 dark:text-[#a9efc1] dark:hover:bg-white/[0.05]"
                  >
                    <span>Edit profile</span>
                    <ChevronRight size={17} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void handleAccountAction()}
                  className="mt-1 flex min-h-12 w-full items-center justify-between rounded-[16px] px-3 text-left text-sm font-extrabold text-[#244f35] transition hover:bg-white/35 dark:text-[#a9efc1] dark:hover:bg-white/[0.05]"
                >
                  <span>{profile.isGuest ? "Sign in" : "Log out"}</span>
                  {profile.isGuest ? <LogIn size={17} /> : <LogOut size={17} />}
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="relative z-10 mt-10 sm:mt-14">
          <div className="inline-flex items-center rounded-full border border-white/60 bg-white/35 px-3 py-1.5 text-sm font-semibold text-[#2d6343] shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
            {greeting}, FUTARIAN 👋
          </div>

          <h1 className="mt-4 max-w-[700px] text-[40px] font-black leading-[0.96] tracking-[-0.06em] text-[#102017] drop-shadow-[0_1px_0_rgba(255,255,255,0.25)] dark:text-white sm:text-[56px] md:text-[66px]">
            Where are you
            <span className="block text-[#44795a] dark:text-[#b3f2c8]">going today?</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-black/58 dark:text-white/58 sm:text-[15px]">
            Find places, follow your student journey and keep up with life around FUTA.
          </p>

          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="group mt-7 flex min-h-[62px] w-full items-center gap-4 rounded-[22px] border border-white/70 bg-white/48 px-4 text-left shadow-[0_18px_55px_rgba(21,51,33,0.12)] backdrop-blur-3xl transition hover:bg-white/58 dark:border-white/10 dark:bg-[#0c1511]/45 dark:hover:bg-[#0c1511]/55 sm:px-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/70 bg-white/55 text-[#336f49] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
              <Search size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-black/65 dark:text-white/70">Search FUTA</p>
              <p className="mt-0.5 truncate text-xs text-black/38 dark:text-white/38">Departments, halls, services, places...</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-black/30 transition group-hover:translate-x-1 dark:text-white/35" />
          </button>
        </section>

        <section className="relative z-10 mt-6 grid gap-4 lg:grid-cols-[1.14fr_.86fr]">
          <motion.button
            type="button"
            onClick={() => router.push("/explore")}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            whileTap={{ scale: 0.99 }}
            className="group relative min-h-[330px] overflow-hidden rounded-[32px] border border-white/65 bg-white/40 p-6 text-left shadow-[0_25px_70px_rgba(20,50,32,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/48 sm:min-h-[360px] sm:p-7"
          >
            <ExploreAnimation reduceMotion={reduceMotion} />
            <div className="relative z-20 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/42 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#326c49] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                    <span className="h-2 w-2 rounded-full bg-[#76c996]" /> Explore campus
                  </div>
                  <h2 className="mt-5 max-w-[370px] text-[34px] font-black leading-[0.98] tracking-[-0.052em] sm:text-[42px]">
                    Find your way.
                    <span className="block text-black/40 dark:text-white/45">Without guessing.</span>
                  </h2>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/42 text-[#326c49] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                  <Navigation size={18} />
                </div>
              </div>

              <div className="mt-16 flex items-end justify-between gap-5">
                <div>
                  <p className="max-w-[300px] text-sm leading-6 text-black/52 dark:text-white/50">
                    Search places, view campus locations and get directions from one place.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#326c49] dark:text-[#a9efc1]">
                    Open Explore <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="hidden rounded-[18px] border border-white/70 bg-white/36 px-4 py-3 backdrop-blur-2xl sm:block dark:border-white/10 dark:bg-white/[0.05]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/35 dark:text-white/35">Campus map</p>
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin size={14} className="text-[#477f5c] dark:text-[#a9efc1]" />
                    <p className="text-xs font-semibold">Ready to explore</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => router.push("/journey")}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            whileTap={{ scale: 0.99 }}
            className="relative min-h-[330px] overflow-hidden rounded-[32px] border border-white/65 bg-white/38 p-6 text-left shadow-[0_22px_65px_rgba(20,50,32,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/44 sm:min-h-[360px] sm:p-7"
          >
            <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-white/40 bg-white/10 blur-[1px]" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/55 text-[#2c6544] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                  <BookOpenCheck size={20} />
                </div>
                <span className="rounded-full border border-white/70 bg-white/38 px-3 py-1.5 text-[11px] font-bold text-black/50 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
                  Your Journey
                </span>
              </div>

              <h3 className="mt-7 text-[27px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[31px]">
                Keep your student
                <span className="block">journey organized.</span>
              </h3>
              <p className="mt-3 max-w-[330px] text-sm leading-6 text-black/50 dark:text-white/48">
                Know what comes next and keep track of the important steps.
              </p>

              <div className="mt-auto pt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/35 dark:text-white/30">Current progress</p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.04em]">3<span className="text-base font-bold text-black/25 dark:text-white/25">/8</span></p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#2f6847] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/45 dark:bg-white/[0.08]">
                  <div className="h-full w-[37.5%] rounded-full bg-[#5f9d76] dark:bg-[#91eab0]" />
                </div>
              </div>
            </div>
          </motion.button>
        </section>

        <section className="relative z-10 mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#47795a] dark:text-[#a9efc1]">Quick actions</p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">What do you need?</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="group flex min-h-[104px] items-center gap-4 rounded-[24px] border border-white/65 bg-white/38 p-4 text-left shadow-[0_16px_45px_rgba(20,50,32,0.08)] backdrop-blur-3xl transition hover:bg-white/48 dark:border-white/10 dark:bg-[#0b1510]/40 dark:hover:bg-[#0b1510]/48"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/70 bg-white/55 text-[#316e48] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">{action.title}</p>
                    <p className="mt-1 text-xs text-black/43 dark:text-white/40">{action.subtitle}</p>
                  </div>
                  <ChevronRight size={16} className="text-black/25 transition group-hover:translate-x-1 dark:text-white/25" />
                </button>
              );
            })}
          </div>
        </section>

        <PWAInstallCard />\n\n        <section className="relative z-10 mt-9">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#47795a] dark:text-[#a9efc1]">Around campus</p>
              <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">Popular places</h2>
            </div>
            <button type="button" onClick={() => router.push("/explore")} className="text-xs font-bold text-[#47795a] dark:text-[#a9efc1]">See all</button>
          </div>

          <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {popularPlaces.map((place) => {
              const Icon = place.icon;
              return (
                <button
                  key={place.name}
                  type="button"
                  onClick={() => router.push("/explore")}
                  className="group min-w-[235px] flex-1 rounded-[24px] border border-white/65 bg-white/38 p-4 text-left shadow-[0_16px_45px_rgba(20,50,32,0.08)] backdrop-blur-3xl transition hover:bg-white/48 dark:border-white/10 dark:bg-[#0b1510]/40 dark:hover:bg-[#0b1510]/48 sm:min-w-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/55 text-[#35764c] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                      <Icon size={19} />
                    </div>
                    <ArrowUpRight size={16} className="text-black/25 dark:text-white/25" />
                  </div>
                  <p className="mt-5 text-sm font-extrabold">{place.name}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-black/40 dark:text-white/35">
                    <span>{place.category}</span><span>•</span><span>{place.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNavigation onNavigate={(href) => router.push(href)} />
    </main>
  );
}

function CampusBackdrop() {
  return (
    <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 scale-[1.03] bg-cover bg-center"
        style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,246,240,0.78)_0%,rgba(231,241,234,0.88)_40%,rgba(230,239,232,0.96)_100%)] dark:bg-[linear-gradient(180deg,rgba(7,16,11,0.64)_0%,rgba(7,16,11,0.78)_45%,rgba(7,16,11,0.93)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#9ddbb2]/20 blur-[100px]" />
      <div className="absolute -left-20 top-[55%] h-80 w-80 rounded-full bg-[#f1d798]/20 blur-[110px]" />
    </div>
  );
}

function ExploreAnimation({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.14]">
        <div className="absolute -left-[8%] top-[28%] h-px w-[78%] rotate-[11deg] bg-[#315f43] dark:bg-white/40" />
        <div className="absolute left-[18%] top-[56%] h-px w-[77%] -rotate-[18deg] bg-[#315f43] dark:bg-white/35" />
        <div className="absolute left-[42%] top-[8%] h-[84%] w-px rotate-[17deg] bg-[#315f43] dark:bg-white/25" />
        <div className="absolute left-[70%] top-[10%] h-[78%] w-px -rotate-[8deg] bg-[#315f43] dark:bg-white/20" />
      </div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 420" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M25 355 C125 330, 170 280, 235 294 C330 315, 345 172, 445 192 C538 210, 555 94, 682 82"
          fill="none"
          stroke="rgba(70,124,87,0.18)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <motion.path
          d="M25 355 C125 330, 170 280, 235 294 C330 315, 345 172, 445 192 C538 210, 555 94, 682 82"
          fill="none"
          stroke="rgba(78,137,96,0.86)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="8 15"
          animate={reduceMotion ? undefined : { strokeDashoffset: [0, -92] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <motion.div
        animate={reduceMotion ? undefined : { x: [0, 44, 92, 142, 198], y: [0, -18, -72, -95, -145], opacity: [0.4, 1, 1, 1, 0.4] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[25%] left-[32%] h-2.5 w-2.5 rounded-full bg-[#5eaf7b] shadow-[0_0_18px_rgba(94,175,123,0.55)] dark:bg-[#b5f6cb]"
      />

      <div className="absolute right-[8%] top-[14%] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#427857] shadow-lg backdrop-blur-2xl dark:border-white/12 dark:bg-white/[0.07] dark:text-[#a9efc1]">
        <MapPin size={20} />
      </div>
    </div>
  );
}

function BottomNavigation({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-0 right-0 z-50 px-3 sm:bottom-5">
      <div className="mx-auto max-w-[620px]">
        <nav className="relative flex h-[72px] items-center justify-around overflow-hidden rounded-[25px] border border-white/70 bg-white/48 px-2 shadow-[0_20px_60px_rgba(16,42,27,0.18)] backdrop-blur-3xl dark:border-white/12 dark:bg-[#0b1410]/72">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.href)}
                className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
              >
                {item.active && <div className="absolute inset-x-1 -inset-y-2 rounded-[18px] border border-white/60 bg-white/45 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.06]" />}
                <div className={`relative z-10 ${item.active ? "text-[#2f6947] dark:text-[#a9efc1]" : "text-black/38 dark:text-white/38"}`}>
                  <Icon size={19} />
                </div>
                <span className={`relative z-10 text-[10px] font-bold ${item.active ? "text-[#2f6947] dark:text-[#a9efc1]" : "text-black/38 dark:text-white/38"}`}>
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
