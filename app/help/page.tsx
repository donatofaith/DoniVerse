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

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

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
      "Get help when you are unsure where to go or what to do next during registration.",
  },
  {
    title: "Accommodation support",
    description:
      "Find the right information or person to speak with about accommodation.",
  },
  {
    title: "Campus guidance",
    description:
      "Reach someone when you are lost, new to campus or need directions.",
  },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#e8f0ea] pb-32 text-[#102017] dark:bg-[#08110c] dark:text-white">
      <div className="fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 scale-[1.03] bg-cover bg-center"
          style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,246,240,0.82)_0%,rgba(231,241,234,0.90)_44%,rgba(230,239,232,0.97)_100%)] dark:bg-[linear-gradient(180deg,rgba(7,16,11,0.66)_0%,rgba(7,16,11,0.80)_48%,rgba(7,16,11,0.94)_100%)]" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1120px] px-4 pb-8 pt-[max(18px,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/42 p-5 shadow-[0_22px_60px_rgba(20,50,32,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/45 sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#47795a] dark:text-[#a9efc1]">
              <HeartHandshake size={15} /> Help
            </div>
            <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">
              Need help?
              <span className="block text-[#527e63] dark:text-[#b3f2c8]">Someone can help.</span>
            </h1>
            <p className="mt-3 max-w-[660px] text-sm leading-6 text-black/55 dark:text-white/52 sm:text-[15px]">
              Find the right person or contact for support around campus.
            </p>
          </div>

          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/70 bg-white/50 text-[#336a49] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1] sm:flex">
            <CircleHelp size={21} />
          </div>
        </header>

        <section className="mt-5 rounded-[30px] border border-white/70 bg-white/40 p-5 shadow-[0_22px_60px_rgba(20,50,32,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/42 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/42 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#47795a] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#a9efc1]">
                <UsersRound size={14} /> Campus support
              </div>
              <h2 className="mt-4 max-w-[590px] text-[28px] font-black leading-[1.02] tracking-[-0.045em] sm:text-[36px]">
                Get help from people who know the campus.
              </h2>
              <p className="mt-3 max-w-[590px] text-sm leading-6 text-black/50 dark:text-white/48">
                Registration, accommodation and campus guidance support will be available here.
              </p>
            </div>

            <div className="rounded-[22px] border border-white/70 bg-white/38 p-4 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#47795a] dark:text-[#a9efc1]">Support network</p>
              <p className="mt-2 text-sm leading-6 text-black/48 dark:text-white/45">
                Support contacts can be assigned by school or faculty so students reach someone familiar with their area.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {supportAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-[26px] border border-white/70 bg-white/38 p-5 shadow-[0_16px_45px_rgba(20,50,32,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/55 text-[#34744c] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                <UserRoundSearch size={19} />
              </div>
              <h3 className="mt-4 text-lg font-black tracking-[-0.03em]">{area.title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/48 dark:text-white/42">{area.description}</p>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.11em] text-[#47795a] dark:text-[#a9efc1]">
                Campus supporter contact
              </p>
              <p className="mt-1 text-sm font-bold text-black/38 dark:text-white/32">Not assigned yet</p>
            </article>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-[30px] border border-white/70 bg-white/42 shadow-[0_22px_60px_rgba(20,50,32,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/45">
          <div className="border-b border-white/50 p-5 sm:p-6 dark:border-white/8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/65 bg-white/52 text-[#a84a34] shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-[#ff9b76]">
                <Siren size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.13em] text-[#9a503d] dark:text-[#ff9b76]">
                  Important campus contacts
                </p>
                <h2 className="mt-1 text-[22px] font-black tracking-[-0.035em] sm:text-[26px]">
                  Numbers every FUTARIAN should keep close.
                </h2>
                <p className="mt-2 max-w-[760px] text-sm leading-6 text-black/50 dark:text-white/45">
                  For emergencies, security matters, welfare concerns and urgent assistance on campus.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-white/35 dark:bg-white/[0.05] md:grid-cols-2 lg:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <article key={contact.role} className="bg-white/28 p-5 backdrop-blur-xl dark:bg-[#0b1510]/35">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/65 backdrop-blur-xl ${
                      contact.priority === "emergency"
                        ? "bg-[#b4472c]/12 text-[#a3432d] dark:border-white/10 dark:bg-[#ff9b76]/10 dark:text-[#ff9b76]"
                        : "bg-white/45 text-[#5f715f] dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60"
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/50 text-[#316c48] shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]"
                  >
                    <Phone size={16} />
                  </a>
                </div>

                <p className="mt-4 text-sm font-black tracking-[-0.02em]">{contact.role}</p>
                <a
                  href={`tel:${contact.number}`}
                  className="mt-1 inline-block text-xl font-black tracking-[-0.025em] text-[#315f43] dark:text-[#a9efc1]"
                >
                  {contact.number}
                </a>
                <p className="mt-2 text-xs leading-5 text-black/43 dark:text-white/36">
                  {contact.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/70 bg-white/38 p-5 shadow-[0_16px_45px_rgba(20,50,32,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/40 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#47795a] dark:text-[#a9efc1]">
                <LifeBuoy size={14} /> Official help
              </div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.035em]">Need official university assistance?</h2>
              <p className="mt-2 max-w-[650px] text-sm leading-6 text-black/48 dark:text-white/42">
                For issues that require an official FUTA response, use the university&apos;s undergraduate helpdesk.
              </p>
            </div>

            <a
              href="https://helpdesk.futa.edu.ng/undergraduate"
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-[16px] border border-white/70 bg-white/52 px-5 text-sm font-extrabold text-[#315f43] shadow-sm backdrop-blur-xl transition active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]"
            >
              Official FUTA help <ExternalLink size={16} />
            </a>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-white/65 bg-white/34 p-5 backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/35">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/65 bg-[#fff2c8]/55 text-[#806315] backdrop-blur-xl dark:border-white/10 dark:bg-[#e0c563]/10 dark:text-[#e0c563]">
              <WifiOff size={18} />
            </div>
            <div>
              <p className="text-sm font-black">If a portal is temporarily unavailable</p>
              <p className="mt-1 text-xs leading-5 text-black/42 dark:text-white/35">
                Avoid paying anyone to bypass official systems. Retry later or use the official FUTA helpdesk for confirmation.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
