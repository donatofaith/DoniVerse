"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Edit3,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type EventStatus = "draft" | "pending" | "approved" | "rejected";
type EventType =
  | "academic"
  | "community"
  | "faith"
  | "social"
  | "sports"
  | "career"
  | "campus"
  | "other";

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: EventType;
  starts_at: string;
  ends_at: string | null;
  venue_name: string | null;
  organizer_name: string;
  official_url: string | null;
  image_url: string | null;
  inquiry_name: string | null;
  inquiry_phone: string | null;
  status: EventStatus;
  is_featured: boolean;
  created_at: string;
};

type EventForm = {
  title: string;
  description: string;
  eventType: EventType;
  startsAt: string;
  endsAt: string;
  venueName: string;
  organizerName: string;
  officialUrl: string;
  imageUrl: string;
  inquiryName: string;
  inquiryPhone: string;
  status: EventStatus;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  eventType: "campus",
  startsAt: "",
  endsAt: "",
  venueName: "",
  organizerName: "",
  officialUrl: "",
  imageUrl: "",
  inquiryName: "",
  inquiryPhone: "",
  status: "approved",
};

const eventTypes: EventType[] = [
  "campus",
  "academic",
  "community",
  "faith",
  "social",
  "sports",
  "career",
  "other",
];

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export default function AdminEventsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [filter, setFilter] = useState<EventStatus | "all">("pending");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const clearPosterPreview = useCallback(() => {
    setPosterFile(null);
    setPosterPreview("");
    setForm((current) => ({ ...current, imageUrl: "" }));
  }, []);

  useEffect(() => {
    return () => {
      if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    };
  }, [posterPreview]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.replace("/auth");
      return;
    }

    setCurrentUserId(session.user.id);

    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const { data, error: eventsError } = await supabase
      .from("events")
      .select(
        "id,title,slug,description,event_type,starts_at,ends_at,venue_name,organizer_name,official_url,image_url,inquiry_name,inquiry_phone,status,is_featured,created_at",
      )
      .order("created_at", { ascending: false });

    if (eventsError) {
      setError(eventsError.message);
      setEvents([]);
    } else {
      setEvents((data ?? []) as EventRow[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const visibleEvents = useMemo(
    () => (filter === "all" ? events : events.filter((event) => event.status === filter)),
    [events, filter],
  );

  const pendingCount = events.filter((event) => event.status === "pending").length;

  const openCreate = () => {
    if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setEditingId(null);
    setForm(emptyForm);
    setPosterFile(null);
    setPosterPreview("");
    setEditorOpen(true);
    setError("");
    setMessage("");
  };

  const openEdit = (event: EventRow) => {
    if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description ?? "",
      eventType: event.event_type,
      startsAt: toLocalDateTime(event.starts_at),
      endsAt: toLocalDateTime(event.ends_at),
      venueName: event.venue_name ?? "",
      organizerName: event.organizer_name,
      officialUrl: event.official_url ?? "",
      imageUrl: event.image_url ?? "",
      inquiryName: event.inquiry_name ?? "",
      inquiryPhone: event.inquiry_phone ?? "",
      status: event.status,
    });
    setPosterFile(null);
    setPosterPreview(event.image_url ?? "");
    setEditorOpen(true);
    setError("");
    setMessage("");
  };

  const choosePoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the event poster.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Poster must be 5 MB or smaller.");
      return;
    }

    if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError("");
  };

  const uploadPoster = async () => {
    if (!posterFile) return form.imageUrl.trim() || null;

    const path = `${currentUserId}/${Date.now()}-${safeFileName(posterFile.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("event-posters")
      .upload(path, posterFile, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("event-posters").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const organizer = form.organizerName.trim();

    if (!title) return setError("Enter an event title.");
    if (!organizer) return setError("Enter the organiser name.");
    if (!form.startsAt) return setError("Choose the event start date and time.");

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const posterUrl = await uploadPoster();
      const payload = {
        title,
        description: form.description.trim() || null,
        event_type: form.eventType,
        starts_at: new Date(form.startsAt).toISOString(),
        ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        venue_name: form.venueName.trim() || null,
        organizer_name: organizer,
        official_url: form.officialUrl.trim() || null,
        image_url: posterUrl,
        inquiry_name: form.inquiryName.trim() || null,
        inquiry_phone: form.inquiryPhone.trim() || null,
        status: form.status,
        approved_by: form.status === "approved" ? currentUserId : null,
        approved_at: form.status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: saveError } = await supabase.from("events").update(payload).eq("id", editingId);
        if (saveError) throw saveError;
      } else {
        const slugBase = slugify(title) || "event";
        const { error: saveError } = await supabase.from("events").insert({
          ...payload,
          slug: `${slugBase}-${Date.now().toString(36)}`,
          created_by: currentUserId,
        });
        if (saveError) throw saveError;
      }

      setMessage(editingId ? "Event updated." : "Event created.");
      if (posterPreview.startsWith("blob:")) URL.revokeObjectURL(posterPreview);
      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setPosterFile(null);
      setPosterPreview("");
      await loadEvents();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "We could not save this event.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (event: EventRow, status: EventStatus) => {
    if (actingId) return;
    setActingId(event.id);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("events")
      .update({
        status,
        approved_by: status === "approved" ? currentUserId : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    if (updateError) setError(updateError.message);
    else {
      setMessage(status === "approved" ? "Event approved and published." : "Event rejected.");
      await loadEvents();
    }

    setActingId(null);
  };

  const deleteEvent = async (event: EventRow) => {
    if (actingId) return;
    if (!window.confirm(`Delete “${event.title}”?`)) return;

    setActingId(event.id);
    const { error: deleteError } = await supabase.from("events").delete().eq("id", event.id);

    if (deleteError) setError(deleteError.message);
    else {
      setMessage("Event deleted.");
      await loadEvents();
    }

    setActingId(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[26px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/70">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Loading event moderation...</p>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="w-full max-w-md rounded-[30px] border border-white/60 bg-white/55 p-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72">
          <ShieldCheck className="mx-auto text-[#397151] dark:text-[#9bedb7]" size={30} />
          <h1 className="mt-4 text-2xl font-black">Admin access required</h1>
          <button onClick={() => router.replace("/")} className="mt-5 min-h-12 rounded-[16px] bg-white/60 px-5 text-sm font-extrabold dark:bg-white/[0.06]">
            Back to FUTAGO
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-14 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-3">
          <button onClick={() => router.push("/admin")} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]" aria-label="Back to admin">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => void loadEvents()} className="flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 text-xs font-black backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
            <RefreshCcw size={15} /> Refresh
          </button>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/45 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#397151] dark:text-[#9bedb7]">
                <CalendarDays size={16} /> Event moderation
              </div>
              <h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[46px]">Manage campus events.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">Approve submissions, reject invalid events, or publish events directly.</p>
            </div>
            <button onClick={openCreate} className="flex min-h-12 items-center justify-center gap-2 rounded-[17px] border border-[#77b68d]/35 bg-[#dff3e5]/90 px-5 text-sm font-black text-[#17462d] shadow-sm dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">
              <Plus size={17} /> New event
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["pending", "approved", "rejected", "all"] as const).map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`min-h-11 rounded-[15px] border px-3 text-xs font-black capitalize ${filter === item ? "border-[#79b98f]/40 bg-[#dff3e5]/85 text-[#245c3a] dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]" : "border-white/60 bg-white/35 text-black/45 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45"}`}>
                {item}{item === "pending" ? ` (${pendingCount})` : ""}
              </button>
            ))}
          </div>
        </section>

        {(error || message) && (
          <div className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold backdrop-blur-2xl ${error ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"}`}>
            {error || message}
          </div>
        )}

        {editorOpen && (
          <section className="mt-5 rounded-[28px] border border-white/60 bg-white/50 p-5 shadow-[0_24px_70px_rgba(16,46,28,0.12)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#397151] dark:text-[#9bedb7]">{editingId ? "Edit event" : "Create event"}</p>
                <h2 className="mt-1 text-xl font-black">{editingId ? "Update event details" : "Add a campus event"}</h2>
              </div>
              <button onClick={() => setEditorOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/45 dark:border-white/10 dark:bg-white/[0.05]" aria-label="Close editor"><X size={17} /></button>
            </div>

            <form onSubmit={saveEvent} className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Event title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" /></Field>
              <Field label="Organiser"><input value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} placeholder="Organiser name" /></Field>
              <Field label="Starts"><input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></Field>
              <Field label="Ends"><input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></Field>
              <Field label="Venue"><input value={form.venueName} onChange={(e) => setForm({ ...form, venueName: e.target.value })} placeholder="Venue" /></Field>
              <Field label="Event type"><select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}>{eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
              <Field label="Inquiry name"><input value={form.inquiryName} onChange={(e) => setForm({ ...form, inquiryName: e.target.value })} placeholder="Contact person" /></Field>
              <Field label="Inquiry phone"><input value={form.inquiryPhone} onChange={(e) => setForm({ ...form, inquiryPhone: e.target.value })} placeholder="Phone number" inputMode="tel" /></Field>

              <div className="md:col-span-2">
                <span className="text-sm font-bold text-black/60 dark:text-white/60">Event poster</span>
                <div className="mt-2 overflow-hidden rounded-[20px] border border-white/65 bg-white/40 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#101914]/70">
                  {posterPreview ? (
                    <div className="relative overflow-hidden rounded-[16px] border border-white/60 bg-black/5 dark:border-white/10 dark:bg-black/20">
                      <img src={posterPreview} alt="Event poster preview" className="max-h-[360px] w-full object-contain" />
                      <button
                        type="button"
                        onClick={clearPosterPreview}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-xl"
                        aria-label="Remove poster"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[16px] border border-dashed border-black/10 bg-white/25 px-5 text-center dark:border-white/10 dark:bg-white/[0.03]">
                      <ImagePlus size={25} className="text-[#397151] dark:text-[#9bedb7]" />
                      <p className="mt-3 text-sm font-black">Upload event poster</p>
                      <p className="mt-1 text-xs text-black/40 dark:text-white/35">JPG, PNG or WebP · maximum 5 MB</p>
                    </div>
                  )}

                  <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[15px] border border-white/65 bg-white/55 px-4 text-sm font-black text-[#214f34] transition active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]">
                    <ImagePlus size={17} />
                    {posterPreview ? "Change poster" : "Choose poster"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePoster} className="hidden" />
                  </label>
                </div>
              </div>

              <Field label="Official link"><input value={form.officialUrl} onChange={(e) => setForm({ ...form, officialUrl: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></Field>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this event about?" /></Field></div>

              <button type="submit" disabled={saving} className="md:col-span-2 flex min-h-[56px] items-center justify-center gap-2 rounded-[18px] border border-[#77b68d]/35 bg-[#dff3e5]/90 px-5 text-sm font-black text-[#17462d] disabled:opacity-60 dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">
                {saving ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
                {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
              </button>
            </form>
          </section>
        )}

        <section className="mt-5 space-y-3">
          {visibleEvents.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-white/60 bg-white/30 p-8 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.03]">
              <CalendarDays size={22} className="mx-auto text-black/25 dark:text-white/25" />
              <p className="mt-3 text-sm font-black">No {filter === "all" ? "" : filter} events right now.</p>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <article key={event.id} className="overflow-hidden rounded-[24px] border border-white/60 bg-white/42 shadow-[0_18px_55px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58">
                {event.image_url && <img src={event.image_url} alt="" className="h-44 w-full object-cover sm:h-52" />}
                <div className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusClass(event.status)}`}>{event.status}</span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-black/35 dark:text-white/35">{event.event_type}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-black tracking-[-0.035em]">{event.title}</h2>
                      <p className="mt-2 text-sm text-black/48 dark:text-white/45">{new Date(event.starts_at).toLocaleString()}</p>
                      {event.venue_name && <p className="mt-1 flex items-center gap-1.5 text-sm text-black/48 dark:text-white/45"><MapPin size={14} /> {event.venue_name}</p>}
                      <p className="mt-2 text-xs font-semibold text-black/35 dark:text-white/35">Organiser: {event.organizer_name}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button onClick={() => openEdit(event)} className="flex min-h-10 items-center gap-2 rounded-[14px] border border-white/60 bg-white/45 px-3 text-xs font-black dark:border-white/10 dark:bg-white/[0.05]"><Edit3 size={14} /> Edit</button>
                      {event.status !== "approved" && <button disabled={actingId === event.id} onClick={() => void changeStatus(event, "approved")} className="flex min-h-10 items-center gap-2 rounded-[14px] border border-emerald-500/20 bg-emerald-400/10 px-3 text-xs font-black text-emerald-800 dark:text-emerald-200"><Check size={14} /> Approve</button>}
                      {event.status !== "rejected" && <button disabled={actingId === event.id} onClick={() => void changeStatus(event, "rejected")} className="flex min-h-10 items-center gap-2 rounded-[14px] border border-amber-500/20 bg-amber-400/10 px-3 text-xs font-black text-amber-800 dark:text-amber-200"><X size={14} /> Reject</button>}
                      <button disabled={actingId === event.id} onClick={() => void deleteEvent(event)} className="flex min-h-10 items-center gap-2 rounded-[14px] border border-red-400/15 bg-red-400/[0.07] px-3 text-xs font-black text-red-700 dark:text-red-300"><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-black/60 dark:text-white/60">{label}</span>
      <div className="mt-2 [&_input]:min-h-[54px] [&_input]:w-full [&_input]:rounded-[16px] [&_input]:border [&_input]:border-white/65 [&_input]:bg-white/48 [&_input]:px-4 [&_input]:text-base [&_input]:font-semibold [&_input]:outline-none [&_input]:backdrop-blur-xl dark:[&_input]:border-white/10 dark:[&_input]:bg-[#101914]/70 dark:[&_input]:text-white [&_select]:min-h-[54px] [&_select]:w-full [&_select]:rounded-[16px] [&_select]:border [&_select]:border-white/65 [&_select]:bg-white/80 [&_select]:px-4 [&_select]:text-base [&_select]:font-semibold [&_select]:outline-none dark:[&_select]:border-white/10 dark:[&_select]:bg-[#101914] dark:[&_select]:text-white [&_textarea]:w-full [&_textarea]:rounded-[16px] [&_textarea]:border [&_textarea]:border-white/65 [&_textarea]:bg-white/48 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-base [&_textarea]:font-medium [&_textarea]:outline-none [&_textarea]:backdrop-blur-xl dark:[&_textarea]:border-white/10 dark:[&_textarea]:bg-[#101914]/70 dark:[&_textarea]:text-white">
        {children}
      </div>
    </label>
  );
}

function statusClass(status: EventStatus) {
  if (status === "approved") return "bg-emerald-400/15 text-emerald-800 dark:text-emerald-200";
  if (status === "rejected") return "bg-red-400/15 text-red-700 dark:text-red-300";
  if (status === "pending") return "bg-amber-400/15 text-amber-800 dark:text-amber-200";
  return "bg-black/[0.06] text-black/55 dark:bg-white/[0.08] dark:text-white/55";
}
