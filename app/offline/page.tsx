import Link from "next/link";
import { WifiOff, RefreshCw, MapPin } from "lucide-react";

export const metadata = {
  title: "Offline | DoniVerse",
  description: "DoniVerse is temporarily offline.",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#e8f0ea] px-5 text-[#102017]">
      <section className="w-full max-w-md rounded-[30px] border border-white/70 bg-white/70 p-7 text-center shadow-[0_24px_80px_rgba(16,46,28,0.14)] backdrop-blur-3xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#174d31] text-white">
          <WifiOff size={28} />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#397151]">
          DoniVerse
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">
          You&apos;re offline.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/55">
          DoniVerse needs a connection for live campus information, maps and account data.
          Reconnect and try again.
        </p>

        <div className="mt-6 grid gap-3">
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-[#174d31] px-5 text-sm font-black text-white"
          >
            <RefreshCw size={17} />
            Try again
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-black/45">
            <MapPin size={14} />
            Your saved app can still open from your home screen.
          </div>
        </div>
      </section>
    </main>
  );
}
