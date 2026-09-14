"use client";

import {
  CircleHelp,
  ExternalLink,
  HeartHandshake,
  LifeBuoy,
  Phone,
  ShieldAlert,
  Siren,
  UserRoundSearch,
  UsersRound,
  WifiOff,
} from "lucide-react";

type EmergencyContact = {
  role: string;
  number: string;
  description: string;
  priority?: "emergency" | "support";
};

type SupportArea = {
  title: string;
  description: string;
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

const supportAreas: SupportArea[] = [
  {
    title: "Registration support",
    description:
      "Get help from a FUTAGO campus supporter when you are confused about where to go or what to do next during registration.",
  },
  {
    title: "Accommodation support",
    description:
      "Get guidance when you need help finding the right accommodation information or the right person to speak with.",
  },
  {
    title: "Campus guidance",
    description:
      "Reach a student supporter when you are lost, new to campus or need someone to point you in the right direction.",
  },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#edf2ed] pb-32 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-28 top-[-70px] h-[330px] w-[330px] rounded-full bg-[#78d89b]/20 blur-[110px] dark:bg-[#78d89b]/10" />
        <div className="absolute -left-32 top-[520px] h-[360px] w-[360px] rounded-full bg-[#e8c75e]/15 blur-[120px] dark:bg-[#e8c75e]/[0.06]" />
        <div className="absolute bottom-0 right-[20%] h-[300px] w-[300px] rounded-full bg-[#5a9f78]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1120px] px-4 pb-8 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-[26px] border border-white/50 bg-white/45 p-4 shadow-[0_18px_55px_rgba(20,63,42,0.08)] backdrop-blur-[24px] dark:border-white/[0.08] dark:bg-white/[0.035] sm:p-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#397151] dark:text-[#8ce6ad]">
              <HeartHandshake size={15} /> Help
            </div>
            <h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[46px]">
              Need help?
              <span className="block text-[#34744c] dark:text-[#8ce6ad]">Someone can help.</span>
            </h1>
            <p className="mt-3 max-w-[660px] text-sm leading-6 text-black/48 dark:text-white/42 sm:text-[15px]">
              Find the right campus contact for urgent assistance, student support or official university help.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/25 bg-[#153f2a]/95 text-[#9bedb7] shadow-lg backdrop-blur-xl sm:flex">
            <CircleHelp size={21} />
          </div>
        </header>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-white/12 bg-[#103d28]/94 p-5 text-white shadow-[0_28px_80px_rgba(18,63,41,0.22)] backdrop-blur-2xl sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a9efc1] backdrop-blur-xl">
                <UsersRound size={14} /> Campus support
              </div>
              <h2 className="mt-4 max-w-[590px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Get help from people who know the campus.
              </h2>
              <p className="mt-3 max-w-[590px] text-sm leading-6 text-white/58">
                FUTAGO campus supporters will help students with registration guidance, accommodation questions and finding their way around campus.
              </p>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/[0.08] p-4 shadow-inner backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#9bedb7]">Support network</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Support contacts will be assigned by school or faculty so students can reach someone familiar with their area.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {supportAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-[26px] border border-white/55 bg-white/48 p-5 shadow-[0_14px_42px_rgba(20,63,42,0.07)] backdrop-blur-[24px] dark:border-white/[0.075] dark:bg-white/[0.035] dark:shadow-none"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/60 bg-white/62 text-[#34744c] shadow-sm backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                <UserRoundSearch size={19} />
              </div>
              <h3 className="mt-4 text-lg font-black tracking-[-0.03em]">{area.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/45 dark:text-white/40">{area.description}</p>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.11em] text-[#397151] dark:text-[#8ce6ad]">
                Campus supporter contact
              </p>
              <p className="mt-1 text-sm font-bold text-black/35 dark:text-white/30">Not assigned yet</p>
            </article>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-[#b4472c]/12 bg-[#fff4ed]/72 shadow-[0_20px_60px_rgba(116,52,35,0.09)] backdrop-blur-[24px] dark:border-[#ff9b76]/10 dark:bg-[#29130e]/72">
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
              <article key={contact.role} className="bg-white/58 p-5 backdrop-blur-xl dark:bg-[#160d0a]/75">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      contact.priority === "emergency"
                        ? "bg-[#b4472c] text-white"
                        : "bg-[#f4dfd5]/85 text-[#93472f] dark:bg-[#ff9b76]/10 dark:text-[#ff9b76]"
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#153f2a] text-white shadow-lg transition active:scale-95 dark:bg-[#8ce6ad] dark:text-[#092417]"
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

        <section className="mt-5 rounded-[28px] border border-white/55 bg-white/48 p-5 shadow-[0_14px_42px_rgba(20,63,42,0.07)] backdrop-blur-[24px] dark:border-white/[0.07] dark:bg-white/[0.035] dark:shadow-none sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#397151] dark:text-[#8ce6ad]">
                <LifeBuoy size={14} /> Official help
              </div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.035em]">Need official university assistance?</h2>
              <p className="mt-2 max-w-[650px] text-sm leading-6 text-black/45 dark:text-white/40">
                For issues that require an official FUTA response, use the university&apos;s undergraduate helpdesk.
              </p>
            </div>

            <a
              href="https://helpdesk.futa.edu.ng/undergraduate"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-[16px] bg-[#153f2a] px-5 text-sm font-extrabold text-white shadow-lg transition active:scale-[0.98] dark:bg-[#8ce6ad] dark:text-[#092417]"
            >
              Official FUTA help <ExternalLink size={16} />
            </a>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/50 bg-white/38 p-5 backdrop-blur-[22px] dark:border-white/[0.06] dark:bg-white/[0.025]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#fff2c8]/85 text-[#806315] dark:bg-[#e0c563]/10 dark:text-[#e0c563]">
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
