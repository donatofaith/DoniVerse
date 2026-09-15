"use client";

import {
  ArrowLeft,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

type Community = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  location_name: string | null;
  place_id: number | null;
  contact_url: string | null;
  official_url: string | null;
  image_url: string | null;
  is_verified: boolean;
};

const CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

export default function CommunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCommunity() {
      setLoading(true);
      setError("");

      const { data, error: loadError } = await supabase
        .from("communities")
        .select(
          "id,name,category,description,location_name,place_id,contact_url,official_url,image_url,is_verified",
        )
        .eq("id", params.id)
        .eq("status", "approved")
        .maybeSingle();

      if (cancelled) return;

      if (loadError || !data) {
        setError("This community is unavailable or has not been approved yet.");
        setCommunity(null);
      } else {
        setCommunity(data as Community);
      }

      setLoading(false);
    }

    if (params.id) void loadCommunity();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[25px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72">
          <Loader2 className="mx-auto animate-spin" size={23} />
          <p className="mt-3 text-sm font-bold">Loading community...</p>
        </div>
      </main>
    );
  }

  if (!community) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 pb-24 text-[#102017] dark:text-white">
        <section className="w-full max-w-lg rounded-[30px] border border-white/60 bg-white/50 p-7 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72">
          <Users size={29} className="mx-auto text-[#397151] dark:text-[#9bedb7]" />
          <h1 className="mt-4 text-2xl font-black">Community unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-black/50 dark:text-white/45">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/discover")}
            className="mt-5 min-h-12 rounded-[16px] bg-[#174d31] px-5 text-sm font-black text-white dark:bg-[#9bedb7] dark:text-[#0b2717]"
          >
            Back to Discover
          </button>
        </section>
      </main>
    );
  }

  const joinUrl = community.contact_url;
  const websiteUrl = community.official_url;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#e9efe9] pb-28 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-[0.24] dark:opacity-[0.16]"
        style={{ backgroundImage: `url(${CAMPUS_IMAGE})` }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(244,248,244,0.82),rgba(228,237,231,0.97))] dark:bg-[linear-gradient(180deg,rgba(5,11,7,0.78),rgba(5,11,7,0.97))]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[960px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/52 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="rounded-full border border-white/60 bg-white/48 px-4 py-2 text-xs font-black uppercase tracking-[0.11em] text-[#397151] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">
            DoniVerse Community
          </div>
        </header>

        <article className="mt-6 overflow-hidden rounded-[34px] border border-white/60 bg-white/42 shadow-[0_28px_90px_rgba(16,46,28,0.13)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/66">
          {community.image_url ? (
            <div className="relative max-h-[540px] overflow-hidden bg-black/[0.05] dark:bg-black/25">
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-3xl"
                style={{ backgroundImage: `url(${community.image_url})` }}
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={community.image_url}
                alt={`${community.name} community`}
                className="relative mx-auto max-h-[540px] w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex min-h-[230px] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(155,237,183,0.22),transparent_45%),linear-gradient(145deg,rgba(255,255,255,0.3),rgba(255,255,255,0.10))] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(155,237,183,0.12),transparent_45%),linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]">
              <Users size={48} className="text-[#397151]/55 dark:text-[#9bedb7]/65" />
            </div>
          )}

          <div className="p-5 sm:p-7 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/60 bg-white/48 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#397151] dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">
                {community.category}
              </span>
              {community.is_verified && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-800 dark:text-emerald-200">
                  <ShieldCheck size={13} /> Verified
                </span>
              )}
            </div>

            <h1 className="mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[48px]">
              {community.name}
            </h1>

            {community.description && (
              <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-black/58 dark:text-white/52">
                {community.description}
              </p>
            )}

            {community.location_name && (
              <section className="mt-7 rounded-[22px] border border-white/60 bg-white/42 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#dff3e5]/80 text-[#286140] dark:bg-[#9bedb7]/12 dark:text-[#9bedb7]">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/35 dark:text-white/30">Meeting location</p>
                    <p className="mt-1 text-sm font-black">{community.location_name}</p>
                  </div>
                </div>
              </section>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {joinUrl && (
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-[18px] bg-[#174d31] px-5 text-sm font-black text-white shadow-lg dark:bg-[#9bedb7] dark:text-[#0b2717]"
                >
                  Join / Contact <ExternalLink size={16} />
                </a>
              )}

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/65 bg-white/52 px-5 text-sm font-black text-[#214f34] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
                >
                  <Globe2 size={17} /> Official website
                </a>
              )}

              {community.place_id && (
                <button
                  type="button"
                  onClick={() => router.push("/explore")}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/65 bg-white/52 px-5 text-sm font-black text-[#214f34] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:col-span-2"
                >
                  <Navigation size={17} /> Open campus map
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
