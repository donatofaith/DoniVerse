"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

import VenuePicker, { type CampusVenue } from "@/components/events/VenuePicker";
import { supabase } from "@/lib/supabase/client";

type EventType =
  | "academic"
  | "community"
  | "faith"
  | "social"
  | "sports"
  | "career"
  | "campus"
  | "other";

type EventForm = {
  title: string;
  description: string;
  eventType: EventType;
  startsAt: string;
  endsAt: string;
  venueName: string;
  venuePlaceId: number | null;
  organizerName: string;
  officialUrl: string;
  inquiryName: string;
  inquiryPhone: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  eventType: "campus",
  startsAt: "",
  endsAt: "",
  venueName: "",
  venuePlaceId: null,
  organizerName: "",
  officialUrl: "",
  inquiryName: "",
  inquiryPhone: "",
};

const eventTypes: { value: EventType; label: string }[] = [
  { value: "campus", label: "Campus" },
  { value: "academic", label: "Academic" },
  { value: "community", label: "Community" },
  { value: "faith", label: "Faith" },
  { value: "social", label: "Social" },
  { value: "sports", label: "Sports" },
  { value: "career", label: "Career" },
  { value: "other", label: "Other" },
];

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() || "jpg";
  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "poster"}.${extension}`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message || "We could not submit this event.");
  }
  return "We could not submit this event.";
}

export default function SubmitEventPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
        router.replace("/auth");
        return;
      }

      setUserId(data.session.user.id);
      setCheckingSession(false);
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  const choosePoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Poster must be 2 MB or smaller.");
      return;
    }

    if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError("");
  };

  const removePoster = () => {
    if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setPosterFile(null);
    setPosterPreview("");
  };

  const uploadPoster = async () => {
    if (!posterFile) return null;

    const path = `${userId}/submissions/${Date.now()}-${safeFileName(posterFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("event-posters")
      .upload(path, posterFile, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("event-posters").getPublicUrl(path);
    return data.publicUrl;
  };

  const submitEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const organizerName = form.organizerName.trim();

    if (!title) return setError("Enter the event title.");
    if (!organizerName) return setError("Enter the organiser name.");
    if (!form.startsAt) return setError("Choose the event start date and time.");

    const start = new Date(form.startsAt);
    const end = form.endsAt ? new Date(form.endsAt) : null;

    if (Number.isNaN(start.getTime())) return setError("Choose a valid start date and time.");
    if (end && (Number.isNaN(end.getTime()) || end < start)) {
      return setError("End time must be after the start time.");
    }

    setSaving(true);
    setError("");

    try {
      const posterUrl = await uploadPoster();

      const { error: submitError } = await supabase.rpc("submit_doniverse_event", {
        p_title: title,
        p_description: form.description.trim() || "",
        p_event_type: form.eventType,
        p_starts_at: start.toISOString(),
        p_ends_at: end ? end.toISOString() : null,
        p_venue_name: form.venueName.trim() || "",
        p_venue_place_id: form.venuePlaceId,
        p_organizer_name: organizerName,
        p_official_url: form.officialUrl.trim() || "",
        p_image_url: posterUrl || "",
        p_inquiry_name: form.inquiryName.trim() || "",
        p_inquiry_phone: form.inquiryPhone.trim() || "",
      });

      if (submitError) throw submitError;

      if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
      setSubmitted(true);
      setForm(emptyForm);
      setPosterFile(null);
      setPosterPreview("");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[24px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/70">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Preparing event submission...</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 pb-24 text-[#102017] dark:text-white">
        <section className="w-full max-w-lg rounded-[32px] border border-white/65 bg-white/52 p-7 text-center shadow-[0_28px_90px_rgba(16,46,28,0.13)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72 sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[21px] border border-emerald-500/15 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em]">Event submitted.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50 dark:text-white/45">
            DoniVerse will review it before it appears publicly in Discover.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="min-h-12 rounded-[16px] border border-white/65 bg-white/55 px-5 text-sm font-black text-[#214f34] dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
            >
              Submit another
            </button>
            <button
              type="button"
              onClick={() => router.replace("/discover")}
              className="min-h-12 rounded-[16px] bg-[#174d31] px-5 text-sm font-black text-white shadow-lg dark:bg-[#9bedb7] dark:text-[#0b2717]"
            >
              Back to Discover
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-28 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 text-xs font-black text-[#397151] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">
            <ShieldCheck size={15} /> Reviewed before publishing
          </div>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/46 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/60 bg-white/55 text-[#397151] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#9bedb7]">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">DoniVerse Discover</p>
              <h1 className="mt-1 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[44px]">Submit an event.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">
                Share a campus event with students. Your submission stays pending until a DoniVerse admin reviews it.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={submitEvent} className="mt-5 space-y-4">
          <FormCard title="Event details">
            <Field label="Event title">
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. Tech Community Meetup"
                className="input-shell"
                maxLength={140}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What should students know about the event?"
                className="input-shell min-h-32 resize-y py-4"
                maxLength={1500}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event type">
                <select
                  value={form.eventType}
                  onChange={(event) => setForm((current) => ({ ...current, eventType: event.target.value as EventType }))}
                  className="input-shell"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Organiser">
                <input
                  value={form.organizerName}
                  onChange={(event) => setForm((current) => ({ ...current, organizerName: event.target.value }))}
                  placeholder="Club, department or organiser name"
                  className="input-shell"
                  maxLength={140}
                />
              </Field>
            </div>
          </FormCard>

          <FormCard title="Date & venue">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts">
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                  className="input-shell"
                />
              </Field>
              <Field label="Ends (optional)">
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                  className="input-shell"
                />
              </Field>
            </div>

            <VenuePicker
              value={form.venueName}
              selectedPlaceId={form.venuePlaceId}
              onChange={(value) => setForm((current) => ({ ...current, venueName: value }))}
              onSelect={(place: CampusVenue) =>
                setForm((current) => ({
                  ...current,
                  venueName: place.name,
                  venuePlaceId: place.id,
                }))
              }
              onClearSelection={() => setForm((current) => ({ ...current, venuePlaceId: null }))}
            />
          </FormCard>

          <FormCard title="Poster & contact">
            <div>
              <p className="text-sm font-bold text-black/60 dark:text-white/60">Poster (optional)</p>
              {posterPreview ? (
                <div className="relative mt-2 overflow-hidden rounded-[22px] border border-white/65 bg-white/40 dark:border-white/10 dark:bg-white/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterPreview} alt="Event poster preview" className="max-h-[460px] w-full object-contain" />
                  <button
                    type="button"
                    onClick={removePoster}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/55 text-white backdrop-blur-xl"
                    aria-label="Remove poster"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex min-h-28 cursor-pointer items-center justify-center gap-3 rounded-[20px] border border-dashed border-white/70 bg-white/36 px-5 text-sm font-black text-[#397151] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:text-[#9bedb7]">
                  <ImagePlus size={20} /> Add JPG, PNG or WebP poster
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePoster} className="sr-only" />
                </label>
              )}
              <p className="mt-2 text-xs text-black/38 dark:text-white/34">Maximum file size: 2 MB.</p>
            </div>

            <Field label="Official link (optional)">
              <input
                type="url"
                value={form.officialUrl}
                onChange={(event) => setForm((current) => ({ ...current, officialUrl: event.target.value }))}
                placeholder="https://..."
                className="input-shell"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Public inquiry name (optional)">
                <input
                  value={form.inquiryName}
                  onChange={(event) => setForm((current) => ({ ...current, inquiryName: event.target.value }))}
                  placeholder="Name students can contact"
                  className="input-shell"
                  maxLength={100}
                />
              </Field>
              <Field label="Public inquiry phone (optional)">
                <input
                  type="tel"
                  value={form.inquiryPhone}
                  onChange={(event) => setForm((current) => ({ ...current, inquiryPhone: event.target.value }))}
                  placeholder="Phone number"
                  className="input-shell"
                  maxLength={30}
                />
              </Field>
            </div>
            <p className="text-xs leading-5 text-black/42 dark:text-white/36">
              Only enter inquiry contact details you want displayed publicly if the event is approved. DoniVerse does not publish your account contact automatically.
            </p>
          </FormCard>

          {error && (
            <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-2xl dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[19px] bg-[#174d31] px-5 text-sm font-black text-white shadow-[0_18px_50px_rgba(23,77,49,0.22)] transition active:scale-[0.995] disabled:opacity-60 dark:bg-[#9bedb7] dark:text-[#0b2717]"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {saving ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </div>

      <style jsx>{`
        :global(.input-shell) {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.65);
          background: rgba(255,255,255,.48);
          padding: 0 16px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          backdrop-filter: blur(14px);
        }
        :global(.dark .input-shell) {
          border-color: rgba(255,255,255,.10);
          background: rgba(16,25,20,.70);
          color: white;
        }
      `}</style>
    </main>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-[28px] border border-white/60 bg-white/42 p-5 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-6">
      <h2 className="text-lg font-black tracking-[-0.03em]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-black/60 dark:text-white/60">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
