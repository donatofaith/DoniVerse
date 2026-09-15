"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import VenuePicker, { type CampusVenue } from "@/components/events/VenuePicker";
import { supabase } from "@/lib/supabase/client";

type CommunityCategory =
  | "faith"
  | "academic"
  | "tech"
  | "creative"
  | "volunteering"
  | "student"
  | "sports"
  | "other";

type CommunityForm = {
  name: string;
  category: CommunityCategory;
  description: string;
  locationName: string;
  placeId: number | null;
  contactUrl: string;
  officialUrl: string;
};

const emptyForm: CommunityForm = {
  name: "",
  category: "student",
  description: "",
  locationName: "",
  placeId: null,
  contactUrl: "",
  officialUrl: "",
};

const categories: { value: CommunityCategory; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "academic", label: "Academic" },
  { value: "tech", label: "Tech" },
  { value: "faith", label: "Faith" },
  { value: "creative", label: "Creative" },
  { value: "volunteering", label: "Volunteering" },
  { value: "sports", label: "Sports" },
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
  return `${base || "community"}.${extension}`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message || "We could not submit this community.");
  }
  return "We could not submit this community.";
}

export default function SubmitCommunityPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [userId, setUserId] = useState("");
  const [form, setForm] = useState<CommunityForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
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
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const chooseImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Community image must be 2 MB or smaller.");
      return;
    }

    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const path = `${userId}/submissions/${Date.now()}-${safeFileName(imageFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("community-images")
      .upload(path, imageFile, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("community-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const submitCommunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (!name) return setError("Enter the community name.");

    setSaving(true);
    setError("");

    try {
      const imageUrl = await uploadImage();

      const { error: submitError } = await supabase.rpc("submit_doniverse_community", {
        p_name: name,
        p_category: form.category,
        p_description: form.description.trim() || "",
        p_location_name: form.locationName.trim() || "",
        p_place_id: form.placeId,
        p_contact_url: form.contactUrl.trim() || "",
        p_official_url: form.officialUrl.trim() || "",
        p_image_url: imageUrl || "",
      });

      if (submitError) throw submitError;

      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview("");
      setForm(emptyForm);
      setSubmitted(true);
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
          <p className="mt-3 text-sm font-bold">Preparing community submission...</p>
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
          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em]">Community submitted.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50 dark:text-white/45">
            DoniVerse will review it before it appears publicly in Discover.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => setSubmitted(false)} className="min-h-12 rounded-[16px] border border-white/65 bg-white/55 px-5 text-sm font-black text-[#214f34] dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
              Submit another
            </button>
            <button type="button" onClick={() => router.replace("/discover")} className="min-h-12 rounded-[16px] bg-[#174d31] px-5 text-sm font-black text-white shadow-lg dark:bg-[#9bedb7] dark:text-[#0b2717]">
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
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 text-xs font-black text-[#397151] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">
            <ShieldCheck size={15} /> Reviewed before publishing
          </div>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/46 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-white/60 bg-white/55 text-[#397151] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#9bedb7]">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">DoniVerse Communities</p>
              <h1 className="mt-1 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[44px]">Add your community.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">
                Help students find your club, fellowship, association, team or campus group. Submissions stay pending until reviewed.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={submitCommunity} className="mt-5 space-y-4">
          <FormCard title="Community details">
            <Field label="Community name">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Google Developer Student Club" className="input-shell" maxLength={140} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as CommunityCategory }))} className="input-shell">
                  {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What is this community about and who is it for?" className="input-shell min-h-36 resize-y py-4" maxLength={1500} />
            </Field>
          </FormCard>

          <FormCard title="Community picture">
            <div>
              <p className="text-sm font-bold text-black/60 dark:text-white/60">Photo or cover image (optional)</p>
              <p className="mt-1 text-xs leading-5 text-black/42 dark:text-white/36">Add a photo of the church, club, team, meeting space or a community cover image.</p>

              {imagePreview ? (
                <div className="relative mt-3 overflow-hidden rounded-[22px] border border-white/65 bg-white/40 dark:border-white/10 dark:bg-white/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Community image preview" className="max-h-[460px] w-full object-cover" />
                  <button type="button" onClick={removeImage} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/55 text-white backdrop-blur-xl" aria-label="Remove community image">
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label className="mt-3 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/70 bg-white/36 px-5 text-center text-sm font-black text-[#397151] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:text-[#9bedb7]">
                  <ImagePlus size={22} />
                  Add community picture
                  <span className="text-[11px] font-semibold text-black/38 dark:text-white/34">JPG, PNG or WebP · max 2 MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" />
                </label>
              )}
            </div>
          </FormCard>

          <FormCard title="Where students can find you">
            <VenuePicker value={form.locationName} selectedPlaceId={form.placeId} onChange={(value) => setForm((current) => ({ ...current, locationName: value }))} onSelect={(place: CampusVenue) => setForm((current) => ({ ...current, locationName: place.name, placeId: place.id }))} onClearSelection={() => setForm((current) => ({ ...current, placeId: null }))} label="Meeting location (optional)" />

            <Field label="Join or contact link (optional)">
              <input type="url" value={form.contactUrl} onChange={(event) => setForm((current) => ({ ...current, contactUrl: event.target.value }))} placeholder="WhatsApp, Telegram, Discord, Instagram or form link" className="input-shell" />
            </Field>

            <Field label="Official website (optional)">
              <input type="url" value={form.officialUrl} onChange={(event) => setForm((current) => ({ ...current, officialUrl: event.target.value }))} placeholder="https://..." className="input-shell" />
            </Field>
          </FormCard>

          {error && <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-700 backdrop-blur-2xl dark:text-red-300">{error}</div>}

          <button type="submit" disabled={saving} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[19px] bg-[#174d31] px-5 text-sm font-black text-white shadow-[0_18px_50px_rgba(23,77,49,0.22)] transition active:scale-[0.995] disabled:opacity-60 dark:bg-[#9bedb7] dark:text-[#0b2717]">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {saving ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      </div>
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
