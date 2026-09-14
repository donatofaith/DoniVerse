"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileCheck2,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type StepStatus = "not_started" | "in_progress" | "completed";

type JourneyStep = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  details: string[];
  requirements?: string[];
  officialUrl?: string;
  officialLabel?: string;
  location?: string;
  icon: React.ElementType;
  note?: string;
};

const STORAGE_KEY = "futago-fresher-journey-v1";

const STATUS_LABELS: Record<StepStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const NEXT_STATUS: Record<StepStatus, StepStatus> = {
  not_started: "in_progress",
  in_progress: "completed",
  completed: "not_started",
};

const steps: JourneyStep[] = [
  {
    id: "acceptance-account",
    eyebrow: "Step 01",
    title: "Confirm acceptance and access the student portal",
    summary:
      "Confirm your acceptance fee, then create or access your FUTA student account with your admission details.",
    details: [
      "Make sure your acceptance fee has been paid and confirmed before moving on.",
      "Use an active email address and phone number you can access easily.",
      "Keep your portal password private and never share it with anyone offering to register for you.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Open FUTA student portal",
    icon: Landmark,
  },
  {
    id: "biodata",
    eyebrow: "Step 02",
    title: "Complete your registration details",
    summary:
      "Fill in the required student information on the FUTA portal and check every detail before submitting.",
    details: [
      "Enter your personal and admission information exactly as required.",
      "Check names, dates and other details carefully before moving forward.",
      "Mark this step complete after you have finished the corresponding action on the official portal.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Continue on FUTA portal",
    icon: FileText,
  },
  {
    id: "documents",
    eyebrow: "Step 03",
    title: "Prepare your fresher documents",
    summary:
      "Get your registration documents ready and make sure any digital copies are clear and easy to read.",
    requirements: [
      "Birth certificate",
      "Certificate of origin",
      "Court affidavit where required",
      "Attestation letter",
      "Passport photograph",
      "O'Level result(s)",
      "JAMB admission letter where applicable",
      "For Direct Entry: relevant ND/NCE/IJMB/JUPEB/A'Level result",
    ],
    details: [
      "Follow the file type and size shown on the current FUTA portal when uploading documents.",
      "If the portal gives a newer instruction, follow the instruction shown there.",
    ],
    officialUrl: "https://studentportal.futa.edu.ng/home/news/263",
    officialLabel: "View registration procedure",
    icon: FileCheck2,
    note: "Document requirements can change by session. Check the current portal before uploading.",
  },
  {
    id: "finalise-screening",
    eyebrow: "Step 04",
    title: "Finalise your submission and check screening",
    summary:
      "Review your forms and uploads, submit them, then check the screening result shown on the official portal.",
    details: [
      "Review your registration details carefully before final submission.",
      "Keep a copy of any acknowledgement, report or preview page you receive.",
      "Check your screening result directly on the official FUTA portal.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Check screening status",
    icon: ShieldCheck,
  },
  {
    id: "school-fees",
    eyebrow: "Step 05",
    title: "Pay and confirm school fees",
    summary:
      "When you are eligible to proceed, follow the payment instructions shown on your official student profile.",
    details: [
      "Use only payment instructions generated through official FUTA systems.",
      "Keep your payment evidence and confirmation details.",
      "Do not send money to anyone claiming they can privately complete registration for you.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Open payment portal",
    icon: WalletCards,
  },
  {
    id: "course-registration",
    eyebrow: "Step 06",
    title: "Complete course registration",
    summary:
      "Register your courses, print the required form and complete any approval or endorsement steps for your level.",
    details: [
      "Course registration may depend on confirmed school-fee payment for the session or semester.",
      "Select the courses shown for you, submit them and print the registration form where required.",
      "Take the printed form to the appropriate registration office or department if instructed to do so.",
    ],
    officialUrl: "https://firarsapp.futa.edu.ng/apps/applications",
    officialLabel: "View course registration",
    location: "Your Level Registration Office / Department",
    icon: BookOpenCheck,
  },
  {
    id: "campus-followup",
    eyebrow: "Step 07",
    title: "Complete any campus follow-up",
    summary:
      "If you are asked to visit a department or office, check the instruction you were given and go with the documents you need.",
    details: [
      "Your required follow-up may differ from another student's, so use the instruction on your portal or from the relevant office.",
      "If you need help understanding where to go or what to take along, use the Help section for campus support.",
    ],
    officialUrl: "https://helpdesk.futa.edu.ng/undergraduate",
    officialLabel: "Official FUTA help",
    location: "FUTA campus",
    icon: MapPin,
  },
];

export default function JourneyPage() {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [openStep, setOpenStep] = useState<string>(steps[0].id);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStatuses(JSON.parse(stored) as Record<string, StepStatus>);
      }
    } catch {
      // Use default progress when local storage is unavailable.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // Keep the current-session progress if storage is unavailable.
    }
  }, [ready, statuses]);

  const completedCount = useMemo(
    () => steps.filter((step) => (statuses[step.id] ?? "not_started") === "completed").length,
    [statuses],
  );

  const progress = Math.round((completedCount / steps.length) * 100);

  const cycleStatus = (id: string) => {
    setStatuses((current) => {
      const status = current[id] ?? "not_started";
      return { ...current, [id]: NEXT_STATUS[status] };
    });
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f3f3ed] pb-32 text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-8 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-black/[0.06] bg-white/80 text-[#183624] shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#123f29] text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
              <GraduationCap size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black tracking-[-0.045em]">My Journey</p>
              <p className="truncate text-[11px] text-black/40 dark:text-white/35">Fresher registration</p>
            </div>
          </div>

          <div className="flex h-11 min-w-11 items-center justify-center rounded-full border border-[#35794c]/15 bg-[#daf5e3] px-3 text-xs font-black text-[#176238] dark:border-[#8ce6ad]/15 dark:bg-[#8ce6ad]/12 dark:text-[#9af0b9]">
            {progress}%
          </div>
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#153f2a] p-6 text-white shadow-[0_30px_80px_rgba(20,63,42,0.16)] sm:p-8 dark:bg-[#0d2b1b]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 top-10 h-32 w-32 rounded-full bg-[#8ce6ad]/10 blur-2xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-bold text-white/80">
                <Sparkles size={14} /> Fresher guide
              </div>
              <h1 className="mt-5 text-[38px] font-black leading-[0.95] tracking-[-0.055em] sm:text-[50px]">
                Know what comes next.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Keep your registration steps in one place and know what to do next.
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/65">
                <span>{completedCount} of {steps.length} completed</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#9af0b9] transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-black/[0.055] bg-white/75 p-6 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.045]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#e8f4ea] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <p className="font-black tracking-[-0.025em]">Before you continue</p>
                <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/50">
                  Mark a step complete after you&apos;ve finished it on the official FUTA portal or at the required office.
                </p>
              </div>
            </div>

            <a
              href="https://firars.futa.edu.ng/app/welcome/appindex"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex min-h-12 touch-manipulation items-center justify-between rounded-[18px] bg-[#102f20] px-4 text-sm font-black text-white transition active:scale-[0.98] dark:bg-[#8ce6ad] dark:text-[#082013]"
            >
              FUTA student portal
              <ArrowUpRight size={17} />
            </a>
          </aside>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#397950] dark:text-[#8ce6ad]">Registration checklist</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">Your path through registration</h2>
            </div>
            <p className="hidden text-right text-xs leading-5 text-black/40 sm:block dark:text-white/35">
              Tap the status to update it.
              <br />Tap a step for details.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const status = statuses[step.id] ?? "not_started";
              const isOpen = openStep === step.id;
              const Icon = step.icon;

              return (
                <article
                  key={step.id}
                  className="overflow-hidden rounded-[26px] border border-black/[0.055] bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/[0.075] dark:bg-white/[0.045]"
                >
                  <div className="flex items-start gap-3 p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => cycleStatus(step.id)}
                      className={`mt-0.5 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[15px] border transition active:scale-95 ${
                        status === "completed"
                          ? "border-[#2f8554]/20 bg-[#dff5e7] text-[#1d6a3d] dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#9af0b9]"
                          : status === "in_progress"
                            ? "border-[#d3a53b]/20 bg-[#fff3cf] text-[#8a6815] dark:border-[#e0c563]/20 dark:bg-[#e0c563]/10 dark:text-[#e0c563]"
                            : "border-black/[0.06] bg-[#f5f5ef] text-black/30 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/30"
                      }`}
                      aria-label={`Change status for ${step.title}`}
                    >
                      {status === "completed" ? <Check size={18} /> : status === "in_progress" ? <Circle size={17} /> : <Circle size={17} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenStep(isOpen ? "" : step.id)}
                      className="min-w-0 flex-1 touch-manipulation text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.13em] text-[#397950] dark:text-[#8ce6ad]">{step.eyebrow}</span>
                        <span className="rounded-full bg-black/[0.035] px-2 py-1 text-[9px] font-bold text-black/38 dark:bg-white/[0.05] dark:text-white/35">{STATUS_LABELS[status]}</span>
                      </div>
                      <h3 className="mt-2 text-base font-black tracking-[-0.025em] sm:text-lg">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-black/45 dark:text-white/40">{step.summary}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenStep(isOpen ? "" : step.id)}
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black/35 transition dark:text-white/35 ${isOpen ? "rotate-180" : ""}`}
                      aria-label={isOpen ? "Close details" : "Open details"}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-black/[0.05] px-4 pb-5 pt-4 dark:border-white/[0.06] sm:px-5">
                      <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-black/35 dark:text-white/30">What to do</p>
                          <ul className="mt-3 space-y-3">
                            {step.details.map((detail) => (
                              <li key={detail} className="flex gap-3 text-sm leading-6 text-black/55 dark:text-white/50">
                                <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#397950] dark:text-[#8ce6ad]" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>

                          {step.requirements && (
                            <div className="mt-5 rounded-[20px] bg-[#f0eee4] p-4 dark:bg-white/[0.035]">
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-black/35 dark:text-white/30">Documents to prepare</p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {step.requirements.map((item) => (
                                  <div key={item} className="flex items-start gap-2 text-xs font-semibold leading-5 text-black/55 dark:text-white/48">
                                    <FileCheck2 size={14} className="mt-0.5 shrink-0 text-[#397950] dark:text-[#8ce6ad]" />
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#edf5ee] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                            <Icon size={19} />
                          </div>

                          {step.location && (
                            <div className="rounded-[18px] border border-black/[0.05] p-4 dark:border-white/[0.06]">
                              <p className="text-[10px] font-black uppercase tracking-[0.11em] text-black/30 dark:text-white/28">Where</p>
                              <p className="mt-1.5 text-sm font-bold">{step.location}</p>
                            </div>
                          )}

                          {step.officialUrl && (
                            <a
                              href={step.officialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-h-12 items-center justify-between rounded-[17px] bg-[#153f2a] px-4 text-sm font-extrabold text-white dark:bg-[#8ce6ad] dark:text-[#092417]"
                            >
                              {step.officialLabel ?? "Open official link"}
                              <ArrowUpRight size={16} />
                            </a>
                          )}

                          {step.note && (
                            <p className="rounded-[18px] bg-[#fff4cc] p-4 text-xs leading-5 text-[#6f5715] dark:bg-[#e0c563]/10 dark:text-[#e0c563]">{step.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <p className="mx-auto mt-7 max-w-[720px] text-center text-[11px] leading-5 text-black/32 dark:text-white/28">
          Your checklist helps you keep track of your steps. Your official registration status is shown by FUTA.
        </p>
      </div>
    </main>
  );
}
