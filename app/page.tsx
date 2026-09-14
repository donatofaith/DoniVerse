"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  BookOpenCheck,
  Building2,
  ChevronRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  Home,
  Library,
  Map,
  MapPin,
  Navigation,
  Search,
  ShieldPlus,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

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
    distance: "Popular",
  },
  {
    name: "Health Centre",
    category: "Health",
    icon: ShieldPlus,
    distance: "Essential",
  },
  {
    name: "Student Affairs",
    category: "Student Services",
    icon: GraduationCap,
    distance: "Useful",
  },
];

const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/",
    active: true,
  },
  {
    label: "Explore",
    icon: Compass,
    href: "/explore",
  },
  {
    label: "Journey",
    icon: BookOpenCheck,
    href: "/journey",
  },
  {
    label: "Discover",
    icon: Sparkles,
    href: "/discover",
  },
  {
    label: "Help",
    icon: HeartHandshake,
    href: "/help",
  },
];

export default function HomePage() {
  const router = useRouter();
  const reduceMotion = !!useReducedMotion();

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f3ed] text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-[1120px] px-4 pb-32 pt-4 sm:px-6 md:px-8 lg:px-10">
        <AmbientBackground />

        {/* HEADER */}
        <motion.header
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -2, 0],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-20 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() => router.push("/")}
            className="group flex items-center gap-3 text-left"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[15px] bg-[#123f29] text-white shadow-[0_12px_30px_rgba(18,63,41,0.15)] dark:bg-[#8ce6ad] dark:text-[#082013]">
              <motion.div
                initial={false}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <GraduationCap size={21} />
              </motion.div>

              <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/15 blur-md" />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.045em]">
                FUTAGO
              </p>

              <p className="text-[11px] text-black/40 dark:text-white/35">
                Know where to go.
              </p>
            </div>
          </button>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.055] bg-white/80 text-[#183624] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-white"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <motion.span
              initial={false}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.2, 1],
                    }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e3b94f] ring-2 ring-white dark:ring-[#0b1510]"
            />
          </motion.button>
        </motion.header>

        {/* HERO */}
        <section className="relative z-10 mt-9 sm:mt-12">
          <p className="text-sm font-semibold text-[#37714d] dark:text-[#8ce6ad]">
            Good day 👋
          </p>

          <h1 className="mt-2 max-w-[660px] text-[38px] font-black leading-[0.97] tracking-[-0.058em] sm:text-[52px] md:text-[62px]">
            Where are you
            <span className="block text-[#326d49] dark:text-[#91eab0]">
              going today?
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-6 text-black/45 dark:text-white/40 sm:text-[15px]">
            Find places, understand your student journey and move
            around FUTA with less stress.
          </p>

          {/* SEARCH */}
          <motion.button
            initial={false}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={() => router.push("/explore")}
            className="group mt-7 flex min-h-[62px] w-full items-center gap-4 rounded-[22px] border border-black/[0.055] bg-white/85 px-4 text-left shadow-[0_12px_35px_rgba(26,59,38,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/[0.075] dark:bg-white/[0.045] dark:shadow-none sm:px-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#edf5ee] text-[#336f49] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
              <Search size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-black/55 dark:text-white/55">
                Search FUTA
              </p>

              <p className="mt-0.5 truncate text-xs text-black/30 dark:text-white/25">
                Departments, halls, services, places...
              </p>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-black/25 transition group-hover:translate-x-1 dark:text-white/25"
            />
          </motion.button>
        </section>

        {/* MAIN GRID */}
        <section className="relative z-10 mt-6 grid gap-4 lg:grid-cols-[1.14fr_0.86fr]">
          {/* EXPLORE CARD */}
          <motion.button
            type="button"
            onClick={() => router.push("/explore")}
            initial={false}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -3,
                  }
            }
            whileTap={{ scale: 0.99 }}
            className="group relative min-h-[330px] overflow-hidden rounded-[32px] bg-[#113f29] p-6 text-left text-white shadow-[0_24px_70px_rgba(18,63,41,0.18)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:min-h-[360px] sm:p-7"
          >
            <ExploreAnimation reduceMotion={reduceMotion} />

            <div className="relative z-20 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 backdrop-blur-xl">
                    <span className="relative flex h-2 w-2">
                      {!reduceMotion && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8ce6ad] opacity-50" />
                      )}

                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8ce6ad]" />
                    </span>

                    <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#a5efbf]">
                      Explore campus
                    </span>
                  </div>

                  <h2 className="mt-5 max-w-[340px] text-[34px] font-black leading-[0.98] tracking-[-0.052em] sm:text-[42px]">
                    Find your way.
                    <span className="block text-white/45">
                      Without guessing.
                    </span>
                  </h2>
                </div>

                <motion.div
                  initial={false}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          rotate: [0, 10, 0],
                          y: [0, -3, 0],
                        }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.09] backdrop-blur-xl"
                >
                  <Navigation size={18} />
                </motion.div>
              </div>

              <div className="mt-16 flex items-end justify-between gap-5">
                <div>
                  <p className="max-w-[280px] text-sm leading-6 text-white/55">
                    Search places, view campus locations and get
                    directions from one place.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#a3efbd]">
                    Open Explore

                    <ArrowUpRight
                      size={16}
                      className="transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="rounded-[18px] border border-white/10 bg-[#092f1d]/60 px-4 py-3 backdrop-blur-lg">
                    <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-white/35">
                      Campus map
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <MapPin
                        size={14}
                        className="text-[#8ce6ad]"
                      />

                      <p className="text-xs font-semibold">
                        Ready to explore
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.button>

          {/* JOURNEY CARD */}
          <motion.button
            type="button"
            onClick={() => router.push("/journey")}
            initial={false}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -3,
                  }
            }
            whileTap={{ scale: 0.99 }}
            className="relative min-h-[330px] overflow-hidden rounded-[32px] border border-black/[0.05] bg-[#ebe7dc] p-6 text-left shadow-[0_20px_60px_rgba(26,55,36,0.07)] dark:border-white/[0.07] dark:bg-[#101b14] dark:shadow-none sm:min-h-[360px] sm:p-7"
          >
            <motion.div
              initial={false}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate: [0, 8, 0],
                      y: [0, -8, 0],
                    }
              }
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -right-14 -top-12 h-52 w-52 rounded-full border border-[#335d42]/10 dark:border-[#8ce6ad]/10"
            />

            <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#d9b94c]/10 blur-2xl" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-white/80 text-[#27583b] shadow-sm dark:bg-white/[0.07] dark:text-[#8ce6ad]">
                  <BookOpenCheck size={20} />
                </div>

                <span className="rounded-full bg-white/65 px-3 py-1.5 text-[11px] font-bold text-black/45 dark:bg-white/[0.06] dark:text-white/40">
                  Your Journey
                </span>
              </div>

              <h3 className="mt-7 text-[27px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[31px]">
                Keep your student
                <span className="block">
                  journey organized.
                </span>
              </h3>

              <p className="mt-3 max-w-[330px] text-sm leading-6 text-black/45 dark:text-white/40">
                Know what comes next and keep track of the important
                steps.
              </p>

              <div className="mt-auto pt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/30 dark:text-white/25">
                      Current progress
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-[-0.04em]">
                      3
                      <span className="text-base font-bold text-black/25 dark:text-white/25">
                        /8
                      </span>
                    </p>
                  </div>

                  <motion.div
                    initial={false}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            scale: [1, 1.05, 1],
                          }
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#163d29] text-white dark:bg-[#8ce6ad] dark:text-[#082013]"
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.06]">
                  <motion.div
                    initial={false}
                    animate={{
                      width: "37.5%",
                    }}
                    className="h-full rounded-full bg-[#2d7749] dark:bg-[#8ce6ad]"
                  />
                </div>
              </div>
            </div>
          </motion.button>
        </section>

        {/* QUICK ACTIONS */}
        <section className="relative z-10 mt-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
                Quick actions
              </p>

              <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">
                What do you need?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.href)}
                  initial={false}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  whileTap={{
                    scale: 0.985,
                  }}
                  className="group flex min-h-[104px] items-center gap-4 rounded-[24px] border border-black/[0.05] bg-white/75 p-4 text-left shadow-[0_12px_35px_rgba(28,58,39,0.045)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-none"
                >
                  <motion.div
                    initial={false}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            rotate: -5,
                            scale: 1.05,
                          }
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#eef4ec] text-[#316e48] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]"
                  >
                    <Icon size={20} />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">
                      {action.title}
                    </p>

                    <p className="mt-1 text-xs text-black/40 dark:text-white/35">
                      {action.subtitle}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-black/20 transition group-hover:translate-x-1 dark:text-white/20"
                  />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* POPULAR PLACES */}
        <section className="relative z-10 mt-9">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
                Around campus
              </p>

              <h2 className="mt-1 text-xl font-black tracking-[-0.035em]">
                Popular places
              </h2>
            </div>

            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="text-xs font-bold text-[#397151] dark:text-[#8ce6ad]"
            >
              See all
            </button>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {popularPlaces.map((place, index) => {
              const Icon = place.icon;

              return (
                <motion.button
                  key={place.name}
                  type="button"
                  onClick={() => router.push("/explore")}
                  initial={false}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  whileTap={{
                    scale: 0.985,
                  }}
                  className="group min-w-[235px] flex-1 rounded-[24px] border border-black/[0.05] bg-white/70 p-4 text-left shadow-[0_12px_35px_rgba(28,58,39,0.04)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.035] dark:shadow-none sm:min-w-0"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${
                        index === 1
                          ? "bg-[#f2eee0] text-[#886e28] dark:bg-[#e1bb54]/10 dark:text-[#e5c764]"
                          : "bg-[#eef5ef] text-[#35764c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]"
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="text-black/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-white/20"
                    />
                  </div>

                  <p className="mt-5 text-sm font-extrabold">
                    {place.name}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-black/35 dark:text-white/30">
                    <span>{place.category}</span>
                    <span>•</span>
                    <span>{place.distance}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      </div>

      <BottomNavigation
        onNavigate={(href) => router.push(href)}
        reduceMotion={reduceMotion}
      />
    </main>
  );
}

/* =========================================================
   EXPLORE LIVE MAP MOTION
========================================================= */

function ExploreAnimation({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* MAP GRID */}
      <div className="absolute inset-0 opacity-[0.18]">
        <div className="absolute -left-[8%] top-[28%] h-px w-[78%] rotate-[11deg] bg-white/50" />
        <div className="absolute left-[18%] top-[56%] h-px w-[77%] -rotate-[18deg] bg-white/40" />
        <div className="absolute left-[42%] top-[8%] h-[84%] w-px rotate-[17deg] bg-white/30" />
        <div className="absolute left-[70%] top-[10%] h-[78%] w-px -rotate-[8deg] bg-white/25" />
      </div>

      {/* FLOATING MAP AREAS */}
      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 15, 0],
                y: [0, -10, 0],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-16 top-16 h-56 w-56 rounded-[42%] border border-white/[0.055] bg-white/[0.025]"
      />

      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -10, 0],
                y: [0, 12, 0],
              }
        }
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-70px] left-[24%] h-52 w-52 rounded-full border border-[#92eeb2]/10"
      />

      {/* ROUTE */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 700 420"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M25 355 C125 330, 170 280, 235 294 C330 315, 345 172, 445 192 C538 210, 555 94, 682 82"
          fill="none"
          stroke="rgba(150,240,182,0.12)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <motion.path
          initial={false}
          d="M25 355 C125 330, 170 280, 235 294 C330 315, 345 172, 445 192 C538 210, 555 94, 682 82"
          fill="none"
          stroke="rgba(162,241,190,0.80)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="8 15"
          animate={
            reduceMotion
              ? undefined
              : {
                  strokeDashoffset: [0, -92],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </svg>

      {/* START POINT */}
      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[12%] left-[7%]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[#164c31]/80 backdrop-blur">
          <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
        </div>
      </motion.div>

      {/* MOVING ROUTE DOT */}
      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 44, 92, 142, 198],
                y: [0, -18, -72, -95, -145],
                opacity: [0.35, 1, 1, 1, 0.35],
              }
        }
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[25%] left-[32%] h-2.5 w-2.5 rounded-full bg-[#b5f6cb] shadow-[0_0_18px_rgba(181,246,203,0.85)]"
      />

      {/* DESTINATION */}
      <div className="absolute right-[8%] top-[14%]">
        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.55, 1],
                  opacity: [0.35, 0.08, 0.35],
                }
          }
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-5 rounded-full border border-[#a4f0bd]"
        />

        <motion.div
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -5, 0],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#92eeb2] bg-[#0f3925] shadow-[0_0_40px_rgba(140,230,173,0.28)]"
        >
          <MapPin
            size={20}
            className="text-[#a7efc0]"
          />
        </motion.div>
      </div>

      {/* FLOATING MAP ICON */}
      <motion.div
        initial={false}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -8, 0],
                x: [0, 3, 0],
              }
        }
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[30%] top-[52%] flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] text-white/55 backdrop-blur"
      >
        <Map size={14} />
      </motion.div>

      <div className="absolute -bottom-28 -left-14 h-80 w-80 rounded-full bg-[#7be39e]/10 blur-3xl" />
      <div className="absolute -right-20 top-0 h-60 w-60 rounded-full bg-[#d8bd58]/[0.06] blur-3xl" />
    </div>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNavigation({
  onNavigate,
  reduceMotion,
}: {
  onNavigate: (href: string) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-0 right-0 z-50 px-3 sm:bottom-5">
      <div className="mx-auto max-w-[620px]">
        <nav className="relative flex h-[72px] items-center justify-around overflow-hidden rounded-[25px] border border-white/50 bg-[#f9faf6]/90 px-2 shadow-[0_18px_55px_rgba(15,42,26,0.17)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0d1711]/95 dark:shadow-[0_18px_55px_rgba(0,0,0,0.36)]">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.href)}
                className="relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
              >
                {item.active && (
                  <div className="absolute inset-x-1 -inset-y-2 rounded-[18px] bg-[#e6f3e8] dark:bg-[#8ce6ad]/10" />
                )}

                <motion.div
                  initial={false}
                  animate={
                    item.active && !reduceMotion
                      ? {
                          y: [0, -2, 0],
                        }
                      : undefined
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`relative z-10 ${
                    item.active
                      ? "text-[#215c3a] dark:text-[#8ce6ad]"
                      : "text-black/35 dark:text-white/35"
                  }`}
                >
                  <Icon size={19} />
                </motion.div>

                <span
                  className={`relative z-10 max-w-full truncate text-[10px] font-bold ${
                    item.active
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

/* =========================================================
   BACKGROUND
========================================================= */

function AmbientBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -right-32 top-20 h-[300px] w-[300px] rounded-full bg-[#7edc9e]/[0.06] blur-[100px] dark:bg-[#7edc9e]/[0.04]" />

      <div className="absolute -left-32 top-[600px] h-[300px] w-[300px] rounded-full bg-[#e4c45d]/[0.05] blur-[100px]" />
    </div>
  );
}