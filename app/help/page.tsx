"use client";

import {
  ArrowRight,
  CircleHelp,
  ExternalLink,
  HeartHandshake,
  LifeBuoy,
  MapPin,
  Phone,
  ShieldAlert,
  Siren,
  UserRoundSearch,
  WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

type EmergencyContact = {
  role: string;
  number: string;
  description: string;
  priority?: "emergency" | "support";
};

const emergencyContacts: EmergencyContact[] = [
  {
    role: "FUTASU President",
    number: "09019499320",
    description: "Students' Union leadership and urgent student matters.",
    priority: "support",
  },
  {
    role: "FUTASU P.R.O",
    number: "09018556305",
    description: "Students' Union information and communication support.",
    priority: "support",
  },
  {
    role: "FUTASU Welfare Director",
    number: "08097536360",
    description: "Student welfare concerns and urgent welfare assistance.",
    priority: "support",
  },
  {
    role: "Chief Security Officer",
    number: "08034169128",
    description: "Security incidents, threats and urgent safety concerns on campus.",
    priority: "emergency",
  },
  {
    role: "Deputy CSO",
    number: "08162700524",
    description: "Campus security support when urgent assistance is needed.",
    priority: "emergency",
  },
  {
    role: "Ambulance",
    number: "07048091168",
    description: "Medical emergencies requiring urgent campus ambulance assistance.",
    priority: "emergency",
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f3ed] pb-32 text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
              <HeartHandshake size={15} /> Help
            </div>
            <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
              Need help?
              <span className="block text-[#34744c] dark:text-[#8ce6ad]">Start here.</span>
            </h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-[17px] bg-[#153f2a] text-[#9bedb7] shadow-lg sm:flex">
            <CircleHelp size={21} />
          </div>
        </header>

        <p className="mt-4 max-w-[660px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
          Get official support, find urgent campus contacts, or get your bearings when you&apos;re unsure where to go.
        </p>

        <section className="mt-7 overflow-hidden rounded-[30px] bg-[#123f29] p-5 text-white shadow-[0_24px_70px_rgba(18,63,41,0.16)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a9efc1]">
                <LifeBuoy size={14} /> Official help
              </div>
              <h2 className="mt-4 max-w-[560px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Need help with a FUTA service?
              </h2>
              <p className="mt-3 max-w-[560px] text-sm leading-6 text-white/58">
                For portal, registration, screening, payment or account issues, use the official FUTA undergraduate helpdesk.
              </p>
            </div>

            <a
              href="https://helpdesk.futa.edu.ng/undergraduate"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 touch-manipulation items-center justify-between gap-3 rounded-[17px] bg-[#9bedb7] px-4 text-sm font-extrabold text-[#0b2b1b] transition active:scale-[0.98]"
            >
              Open FUTA helpdesk
              <ExternalLink size={16} />
            </a>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[30px] border border-[#b4472c]/10 bg-[#fff4ed] shadow-[0_18px_50px_rgba(116,52,35,0.06)] dark:border-[#ff9b76]/10 dark:bg-[#29130e]">
          <div className="border-b border-[#b4472c]/10 p-5 sm:p-6 dark:border-[#ff9b76]/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#b4472c] text-white shadow-[0_10px_28px_rgba(180,71,44,0.22)]">
                <Siren size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.13em] text-[#a34a32] dark:text-[#ff9b76]">
                  Important campus contacts
                </p>
                <h2 className="mt-1 text-[22px] font-black tracking-[-0.035em] sm:text-[26px]">
                  Numbers every FUTARIAN should keep close.
                </h2>
                <p className="mt-2 max-w-[760px] text-sm leading-6 text-black/48 dark:text-white/42">
                  For emergencies, security matters, welfare concerns and urgent assistance on campus.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-[#b4472c]/10 dark:bg-[#ff9b76]/10 md:grid-cols-2 lg:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <article key={contact.role} className="bg-[#fffaf6] p-5 dark:bg-[#160d0a]">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      contact.priority === "emergency"
                        ? "bg-[#b4472c] text-white"
                        : "bg-[#f4dfd5] text-[#93472f] dark:bg-[#ff9b76]/10 dark:text-[#ff9b76]"
                    }`}
                  >
                    {contact.priority === "emergency" ? (
                      <ShieldAlert size={18} />
                    ) : (
                      <UserRoundSearch size={18} />
                    )}
                  </div>

                  <a
                    href={`tel:${contact.number}`}
                    aria-label={`Call ${contact.role}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#153f2a] text-white transition active:scale-95 dark:bg-[#8ce6ad] dark:text-[#092417]"
                  >
                    <Phone size={16} />
                  </a>
                </div>

                <p className="mt-4 text-sm font-black tracking-[-0.02em]">{contact.role}</p>
                <a
                  href={`tel:${contact.number}`}
                  className="mt-1 inline-block text-xl font-black tracking-[-0.025em] text-[#173f2b] dark:text-[#9bedb7]"
                >
                  {contact.number}
                </a>
                <p className="mt-2 text-xs leading-5 text-black/42 dark:text-white/36">
                  {contact.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-black/[0.055] bg-white/72 p-5 dark:border-white/[0.07] dark:bg-white/[0.035] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#edf5ee] text-[#34744c] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                <MapPin size={19} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#397151] dark:text-[#8ce6ad]">
                  I&apos;m lost on campus
                </p>
                <h2 className="mt-1 text-lg font-black">Find where you need to go.</h2>
                <p className="mt-2 max-w-[560px] text-sm leading-6 text-black/45 dark:text-white/40">
                  Open the campus map, search for your destination and get directions from your current location when available.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="flex min-h-12 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[16px] bg-[#153f2a] px-5 text-sm font-extrabold text-white transition active:scale-[0.98] dark:bg-[#8ce6ad] dark:text-[#092417]"
            >
              Open Explore <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] border border-black/[0.05] bg-white/55 p-5 dark:border-white/[0.06] dark:bg-white/[0.025]">
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
      </div>
    </main>
  );
}
