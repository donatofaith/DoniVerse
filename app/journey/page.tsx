"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  Navigation,
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
      "Make sure your acceptance fee has been confirmed, then create or access your FUTA student account with your UTME details.",
    details: [
      "FUTA's fresher registration procedure asks new students to verify that their acceptance fee has been paid and confirmed before account creation.",
      "Use your own active email address and phone number on official FUTA systems because the university may use them for important communication.",
      "Keep your portal password private. FUTAGO will never ask for your FUTA portal password.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Open FUTA student portal",
    icon: Landmark,
  },
  {
    id: "biodata",
    eyebrow: "Step 02",
    title: "Complete your registration data carefully",
    summary:
      "Fill the required student data forms on the official FUTA portal and review every entry before final submission.",
    details: [
      "Enter your personal and admission information exactly as required by FUTA.",
      "Check spellings, dates and uploaded information before moving forward.",
      "Do not mark this FUTAGO step complete until you have actually completed the corresponding action on FUTA's official system.",
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
      "Gather the documents FUTA lists for fresh-student registration and make sure your digital copies are clear and correctly prepared.",
    requirements: [
      "Birth certificate",
      "Certificate of origin",
      "Court affidavit where required by the current portal procedure",
      "Attestation letter",
      "Passport photograph",
      "O'Level result(s)",
      "JAMB admission letter where applicable",
      "For Direct Entry: the relevant ND/NCE/IJMB/JUPEB/A'Level result",
    ],
    details: [
      "The official registration procedure has historically required scanned image uploads for key documents, so follow the file type and size shown on the current portal.",
      "If your portal instruction differs from an older FUTA notice, follow the current official portal instruction.",
    ],
    officialUrl: "https://studentportal.futa.edu.ng/home/news/263",
    officialLabel: "View FUTA registration procedure",
    icon: FileCheck2,
    note: "Requirements can change by session. Always confirm the latest instruction on the official FUTA portal before uploading.",
  },
  {
    id: "finalise-screening",
    eyebrow: "Step 04",
    title: "Finalise submission and check your screening remark",
    summary:
      "After reviewing your forms and uploads, finalise the official submission and check the screening result or remark shown by FUTA.",
    details: [
      "Review your official registration details before finalising because some information may become harder to edit afterwards.",
      "Keep a copy of any preview, report or acknowledgement page the portal provides.",
      "FUTAGO cannot see or verify your screening status unless FUTA provides an authorised integration in the future.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Check official portal",
    icon: ShieldCheck,
  },
  {
    id: "school-fees",
    eyebrow: "Step 05",
    title: "Pay and confirm school fees when eligible",
    summary:
      "Once FUTA says you are eligible to proceed, follow the payment instructions generated from your official student profile and confirm the payment on the portal.",
    details: [
      "Use only payment instructions generated through FUTA's official systems.",
      "Keep your payment evidence and confirmation details.",
      "Do not send money to anyone claiming they can complete FUTA registration privately for you.",
    ],
    officialUrl: "https://firars.futa.edu.ng/app/welcome/appindex",
    officialLabel: "Open official payment portal",
    icon: WalletCards,
  },
  {
    id: "course-registration",
    eyebrow: "Step 06",
    title: "Complete course registration and approval",
    summary:
      "Register the courses shown for your session, print the registration form and follow FUTA's approval and endorsement process.",
    details: [
      "FUTA's current portal information says course registration depends on confirmed school-fee payment for the relevant session or semester.",
      "Fresh students should select the displayed courses, submit and print the course registration form.",
      "The printed form is then presented to the appropriate Level Registration Office for approval, followed by the required endorsement and departmental submission.",
    ],
    officialUrl: "https://firarsapp.futa.edu.ng/apps/applications",
    officialLabel: "Read official course-registration guidance",
    location: "Your Level Registration Office / Department",
    icon: BookOpenCheck,
  },
  {
    id: "campus-followup",
    eyebrow: "Step 07",
    title: "Handle any required campus follow-up",
    summary:
      "Use FUTAGO Explore to find the department, Student Affairs or another campus office when an official FUTA instruction requires an in-person visit.",
    details: [
      "Not every student will need the same physical follow-up, so use the instruction shown on your official portal or given by the relevant FUTA office.",
      "For portal or registration problems, use FUTA's official support channels rather than relying on unverified messages.",
    ],
    officialUrl: "https://helpdesk.futa.edu.ng/undergraduate",
    officialLabel: "Open FUTA undergraduate helpdesk",
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
        const parsed = JSON.parse(stored) as Record<string, StepStatus>;
        setStatuses(parsed);
      }
    } catch {
      // Ignore malformed or unavailable local storage and use defaults.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      // Progress still works for the current session if storage is unavailable.
    }
  }, [ready, statuses]);

  const completedCount = useMemo(
    () =>
      steps.filter((step) => (statuses[step.id] ?? "not_started") === "completed")
        .length,
    [statuses]
  );

  const progress = Math.round((completedCount / steps.length) * 100);

  const setStatus = (id: string, status: StepStatus) => {
    setStatuses((current) => ({ ...current, [id]: status }));
  };

  const cycleStatus = (id: string) => {
    const current = statuses[id] ?? "not_started";
    setStatus(id, NEXT_STATUS[current]);
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f3f3ed] text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="touch-manipulation flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.06] bg-white/80 text-[#183624] shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-white"
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
              <p className="truncate text-[11px] text-black/40 dark:text-white/35">
                Your fresher registration companion.
              </p>
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
                <Sparkles size={14} />
                Fresher guide
              </div>
              <h1 className="mt-5 text-[38px] font-black leading-[0.95] tracking-[-0.055em] sm:text-[50px]">
                Know what comes next.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
                Follow the official FUTA process, then use FUTAGO to keep your own checklist organised. Your FUTAGO progress is a personal guide, not your university registration status.
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#fff4c9] text-[#745a0c] dark:bg-[#e5cd74]/10 dark:text-[#e5cd74]">
                <BadgeCheck size={19} />
              </div>
              <div>
                <p className="font-black tracking-[-0.025em]">Important distinction</p>
                <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/50">
                  Marking a FUTAGO step complete does not change anything on FUTA's systems. Complete every official action on the university portal or at the required office first.
                </p>
              </div>
            </div>

            <a
              href="https://firars.futa.edu.ng/app/welcome/appindex"
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex min-h-12 touch-manipulation items-center justify-between rounded-[18px] bg-[#102f20] px-4 text-sm font-black text-white transition active:scale-[0.98] dark:bg-[#8ce6ad] dark:text-[#082013]"
            >
              Official FUTA portal
              <ArrowUpRight size={17} />
            </a>
          </aside>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#397950] dark:text-[#8ce6ad]">
                Registration checklist
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] sm:text-3xl">
                Your path through registration
              </h2>
            </div>
            <p className="hidden text-right text-xs leading-5 text-black/40 sm:block dark:text-white/35">
              Tap a status to move it forward.
              <br />Tap the card for details.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
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
                      className={`mt-0.5 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[15px] border transition active:scale-95 ${statusClasses(status)}`}
                      aria-label={`Change ${step.title} status. Current status: ${STATUS_LABELS[status]}`}
                    >
                      {status === "completed" ? (
                        <Check size={19} strokeWidth={3} />
                      ) : status === "in_progress" ? (
                        <Clock3 size={18} />
                      ) : (
                        <Circle size={17} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenStep(isOpen ? "" : step.id)}
                      className="min-w-0 flex-1 touch-manipulation text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#3d7e53] dark:text-[#8ce6ad]">
                              {step.eyebrow}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusBadgeClasses(status)}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          <h3 className="mt-2 text-[17px] font-black leading-6 tracking-[-0.025em] sm:text-lg">
                            {step.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-6 text-black/50 dark:text-white/45">
                            {step.summary}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <div className="hidden h-10 w-10 items-center justify-center rounded-[14px] bg-[#edf5ee] text-[#245e3a] sm:flex dark:bg-white/[0.055] dark:text-[#8ce6ad]">
                            <Icon size={18} />
                          </div>
                          <ChevronDown
                            size={18}
                            className={`mt-2 text-black/35 transition-transform dark:text-white/35 ${isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-black/[0.055] px-4 pb-5 pt-4 sm:px-5 dark:border-white/[0.075]">
                      <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-black/35 dark:text-white/35">
                            What to do
                          </p>
                          <div className="mt-3 space-y-3">
                            {step.details.map((detail) => (
                              <div key={detail} className="flex gap-3 text-sm leading-6 text-black/60 dark:text-white/52">
                                <CheckCircle2 className="mt-1 shrink-0 text-[#41855a] dark:text-[#8ce6ad]" size={16} />
                                <p>{detail}</p>
                              </div>
                            ))}
                          </div>

                          {step.requirements && (
                            <div className="mt-5 rounded-[20px] bg-[#f4f0dc] p-4 dark:bg-[#e5cd74]/[0.07]">
                              <p className="text-xs font-black uppercase tracking-[0.13em] text-[#775f18] dark:text-[#e5cd74]">
                                Documents to prepare
                              </p>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {step.requirements.map((item) => (
                                  <div key={item} className="flex items-start gap-2 text-xs leading-5 text-[#5f5124] dark:text-white/55">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a7d26] dark:bg-[#e5cd74]" />
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {step.note && (
                            <p className="mt-4 rounded-[18px] border border-[#a87c21]/15 bg-[#fff8df] p-3.5 text-xs leading-5 text-[#6a5319] dark:border-[#e5cd74]/10 dark:bg-[#e5cd74]/[0.055] dark:text-[#dbc979]">
                              {step.note}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          {step.location && (
                            <div className="rounded-[20px] border border-black/[0.05] bg-[#f6f7f1] p-4 dark:border-white/[0.07] dark:bg-black/10">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-black/35 dark:text-white/35">
                                <MapPin size={14} /> Location
                              </div>
                              <p className="mt-2 text-sm font-bold">{step.location}</p>
                              <button
                                type="button"
                                onClick={() => router.push("/explore")}
                                className="mt-3 flex min-h-11 w-full touch-manipulation items-center justify-between rounded-[15px] bg-[#e2f3e6] px-3.5 text-xs font-black text-[#24613a] active:scale-[0.98] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]"
                              >
                                Open FUTAGO Explore
                                <Navigation size={15} />
                              </button>
                            </div>
                          )}

                          {step.officialUrl && (
                            <a
                              href={step.officialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex min-h-12 touch-manipulation items-center justify-between rounded-[18px] border border-black/[0.055] bg-white px-4 text-sm font-black text-[#214d32] transition active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-[#9af0b9]"
                            >
                              <span className="pr-3">{step.officialLabel ?? "Open official FUTA page"}</span>
                              <ExternalLink size={16} className="shrink-0" />
                            </a>
                          )}

                          <div className="rounded-[20px] border border-black/[0.055] p-4 dark:border-white/[0.07]">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-black/35 dark:text-white/35">
                              Mark your progress
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {(["not_started", "in_progress", "completed"] as StepStatus[]).map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setStatus(step.id, option)}
                                  className={`min-h-11 touch-manipulation rounded-[14px] px-2 text-[10px] font-extrabold leading-tight transition active:scale-95 ${
                                    status === option
                                      ? "bg-[#153f2a] text-white dark:bg-[#8ce6ad] dark:text-[#082013]"
                                      : "bg-black/[0.035] text-black/50 dark:bg-white/[0.05] dark:text-white/45"
                                  }`}
                                >
                                  {STATUS_LABELS[option]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] bg-[#e3efe4] p-5 dark:bg-[#8ce6ad]/[0.07]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/70 text-[#2e7147] dark:bg-white/[0.06] dark:text-[#8ce6ad]">
              <ShieldCheck size={19} />
            </div>
            <h2 className="mt-4 text-lg font-black tracking-[-0.03em]">Use official information first</h2>
            <p className="mt-2 text-sm leading-6 text-black/55 dark:text-white/48">
              FUTAGO simplifies the journey, but FUTA can update requirements, deadlines and portal procedures. When there is any difference, the current official FUTA instruction is the authority.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#173f2a] p-5 text-white dark:bg-[#10291b]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-[#9af0b9]">
              <Navigation size={19} />
            </div>
            <h2 className="mt-4 text-lg font-black tracking-[-0.03em]">Need to find an office?</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Open Explore to search FUTA places and get campus navigation support.
            </p>
            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="mt-4 flex min-h-11 w-full touch-manipulation items-center justify-between rounded-[16px] bg-[#9af0b9] px-4 text-sm font-black text-[#092214] active:scale-[0.98]"
            >
              Go to Explore
              <Navigation size={16} />
            </button>
          </div>
        </section>

        <p className="mx-auto mt-7 max-w-3xl text-center text-[11px] leading-5 text-black/35 dark:text-white/30">
          FUTAGO is an independent student companion and is not an official FUTA portal. Checklist progress is stored on this device for now and does not represent official university registration status.
        </p>
      </div>
    </main>
  );
}

function statusClasses(status: StepStatus) {
  if (status === "completed") {
    return "border-[#318250]/15 bg-[#dff5e5] text-[#23703f] dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad] dark:text-[#082013]";
  }

  if (status === "in_progress") {
    return "border-[#b0882a]/15 bg-[#fff2c8] text-[#806315] dark:border-[#e5cd74]/15 dark:bg-[#e5cd74]/10 dark:text-[#e5cd74]";
  }

  return "border-black/[0.055] bg-black/[0.025] text-black/35 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/35";
}

function statusBadgeClasses(status: StepStatus) {
  if (status === "completed") {
    return "bg-[#e0f3e5] text-[#286d40] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]";
  }

  if (status === "in_progress") {
    return "bg-[#fff1c4] text-[#806315] dark:bg-[#e5cd74]/10 dark:text-[#e5cd74]";
  }

  return "bg-black/[0.045] text-black/40 dark:bg-white/[0.05] dark:text-white/40";
}
