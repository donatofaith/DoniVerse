"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

const DISMISSED_KEY = "doniverse-pwa-install-dismissed";

export default function PWAInstallCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISSED_KEY) === "1";
    if (dismissed) {
      setIsInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    setIsIOS(ios);
    setIsInstalled(false);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setIsInstalled(true);
  };

  const install = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
        setIsInstalled(true);
      }
      return;
    }

    if (isIOS) {
      setShowIOSHelp((current) => !current);
    }
  };

  if (isInstalled || (!installPrompt && !isIOS)) return null;

  return (
    <section className="relative z-10 mt-8 rounded-[28px] border border-white/65 bg-white/42 p-5 shadow-[0_18px_55px_rgba(20,50,32,0.09)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1510]/44 sm:p-6">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide install suggestion"
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/45 text-black/45 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45"
      >
        <X size={15} />
      </button>

      <div className="flex items-start gap-4 pr-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#174d31] text-white shadow-sm dark:bg-[#9bedb7] dark:text-[#12351f]">
          <Smartphone size={21} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">
            DoniVerse on your phone
          </p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.04em]">
            Add DoniVerse to your home screen.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">
            Open it like an app without searching for the website every time.
          </p>
        </div>
      </div>

      {showIOSHelp && (
        <div className="mt-4 rounded-[18px] border border-[#397151]/15 bg-[#dff3e5]/55 p-4 text-sm leading-6 text-[#214f34] dark:border-[#9bedb7]/15 dark:bg-[#9bedb7]/[0.08] dark:text-[#c9f7d8]">
          <div className="flex gap-3">
            <Share2 size={18} className="mt-1 shrink-0" />
            <p>
              On iPhone or iPad: tap the <strong>Share</strong> button in Safari, then choose
              <strong> Add to Home Screen</strong>.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => void install()}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#174d31] px-5 text-sm font-black text-white shadow-[0_14px_35px_rgba(23,77,49,0.18)] dark:bg-[#9bedb7] dark:text-[#12351f] sm:w-auto"
      >
        {isIOS ? <Share2 size={17} /> : <Download size={17} />}
        {isIOS ? "How to install" : "Install DoniVerse"}
      </button>
    </section>
  );
}
