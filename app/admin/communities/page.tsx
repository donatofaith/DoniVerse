"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

import VenuePicker, { type CampusVenue } from "@/components/events/VenuePicker";
import { supabase } from "@/lib/supabase/client";

type CommunityStatus = "draft" | "pending" | "approved" | "rejected";
type CommunityCategory =
  | "faith"
  | "academic"
  | "tech"
  | "creative"
  | "volunteering"
  | "student"
  | "sports"
  | "other";

type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  category: CommunityCategory;
  description: string | null;
  location_name: string | null;
  place_id: number | null;
  contact_url: string | null;
  official_url: string | null;
  status: CommunityStatus;
  is_verified: boolean;
  created_at: string;
};

type CommunityForm = {
  name: string;
  category: CommunityCategory;
  description: string;
  locationName: string;
  placeId: number | null;
  contactUrl: string;
  officialUrl: string;
  status: CommunityStatus;
  isVerified: boolean;
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

const emptyForm: CommunityForm = {
  name: "",
  category: "student",
  description: "",
  locationName: "",
  placeId: null,
  contactUrl: "",
  officialUrl: "",
  status: "approved",
  isVerified: false,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message || "We could not save this community.");
  }
  return "We could not save this community.";
}

export default function AdminCommunitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [communities, setCommunities] = useState<CommunityRow[]>([]);
  const [filter, setFilter] = useState<CommunityStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CommunityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.replace("/auth");
      return;
    }

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

    const { data, error: communitiesError } = await supabase
      .from("communities")
      .select(
        "id,name,slug,category,description,location_name,place_id,contact_url,official_url,status,is_verified,created_at",
      )
      .order("created_at", { ascending: false });

    if (communitiesError) {
      setCommunities([]);
      setError(communitiesError.message);
    } else {
      setCommunities((data ?? []) as CommunityRow[]);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadCommunities();
  }, [loadCommunities]);

  const visibleCommunities = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return communities.filter((community) => {
      if (filter !== "all" && community.status !== filter) return false;
      if (!normalized) return true;
      return `${community.name} ${community.category} ${community.description ?? ""} ${community.location_name ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [communities, filter, query]);

  const counts = useMemo(
    () => ({
      all: communities.length,
      approved: communities.filter((community) => community.status === "approved").length,
      pending: communities.filter((community) => community.status === "pending").length,
      rejected: communities.filter((community) => community.status === "rejected").length,
    }),
    [communities],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
    setError("");
    setMessage("");
  };

  const openEdit = (community: CommunityRow) => {
    setEditingId(community.id);
    setForm({
      name: community.name,
      category: community.category,
      description: community.description ?? "",
      locationName: community.location_name ?? "",
      placeId: community.place_id,
      contactUrl: community.contact_url ?? "",
      officialUrl: community.official_url ?? "",
      status: community.status,
      isVerified: community.is_verified,
    });
    setEditorOpen(true);
    setError("");
    setMessage("");
  };

  const saveCommunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (!name) return setError("Enter the community name.");

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name,
        category: form.category,
        description: form.description.trim() || null,
        location_name: form.locationName.trim() || null,
        place_id: form.placeId,
        contact_url: form.contactUrl.trim() || null,
        official_url: form.officialUrl.trim() || null,
        status: form.status,
        is_verified: form.isVerified,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("communities")
          .update(payload)
          .eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const baseSlug = slugify(name) || "community";
        const { error: insertError } = await supabase.from("communities").insert({
          ...payload,
          slug: `${baseSlug}-${Date.now().toString(36)}`,
        });
        if (insertError) throw insertError;
      }

      setMessage(editingId ? "Community updated." : "Community created.");
      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadCommunities();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (community: CommunityRow, status: CommunityStatus) => {
    if (actingId) return;
    setActingId(community.id);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("communities")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", community.id);

    if (updateError) setError(updateError.message);
    else {
      setMessage(status === "approved" ? "Community published." : `Community marked ${status}.`);
      await loadCommunities();
    }

    setActingId(null);
  };

  const deleteCommunity = async (community: CommunityRow) => {
    if (actingId) return;
    if (!window.confirm(`Delete “${community.name}”?`)) return;

    setActingId(community.id);
    const { error: deleteError } = await supabase
      .from("communities")
      .delete()
      .eq("id", community.id);

    if (deleteError) setError(deleteError.message);
    else {
      setMessage("Community deleted.");
      await loadCommunities();
    }
    setActingId(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[26px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/70">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Loading communities...</p>
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
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-5 min-h-12 rounded-[16px] bg-white/60 px-5 text-sm font-extrabold dark:bg-white/[0.06]"
          >
            Back to DoniVerse
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-16 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
            aria-label="Back to admin"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => void loadCommunities()}
            className="flex min-h-11 items-center gap-2 rounded-full border border-white/60 bg-white/45 px-4 text-xs font-black backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]"
          >
            <RefreshCcw size={15} /> Refresh
          </button>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/45 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#397151] dark:text-[#9bedb7]">
                <Users size={16} /> DoniVerse Communities
              </div>
              <h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.055em] sm:text-[46px]">Manage communities.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-black/50 dark:text-white/45">
                Create, verify, publish and maintain campus groups students can discover.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="flex min-h-12 items-center justify-center gap-2 rounded-[17px] bg-[#174d31] px-5 text-sm font-black text-white shadow-lg dark:bg-[#9bedb7] dark:text-[#0b2717]"
            >
              <Plus size={18} /> Add community
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="All" value={counts.all} />
            <Stat label="Approved" value={counts.approved} />
            <Stat label="Pending" value={counts.pending} />
            <Stat label="Rejected" value={counts.rejected} />
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-4 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-[17px] border border-white/65 bg-white/48 px-4 dark:border-white/10 dark:bg-[#101914]/70">
              <Search size={17} className="text-black/35 dark:text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search communities..."
                className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-black/28 dark:text-white dark:placeholder:text-white/25"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "approved", "pending", "rejected"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`min-h-11 rounded-full px-4 text-xs font-black capitalize transition ${
                    filter === item
                      ? "bg-[#174d31] text-white dark:bg-[#9bedb7] dark:text-[#0b2717]"
                      : "border border-white/60 bg-white/45 text-black/55 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {(error || message) && (
          <div className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold backdrop-blur-2xl ${error ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"}`}>
            {error || message}
          </div>
        )}

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          {visibleCommunities.length ? (
            visibleCommunities.map((community) => (
              <article
                key={community.id}
                className="rounded-[26px] border border-white/60 bg-white/42 p-5 shadow-[0_18px_55px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#286140] dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">
                        {community.category}
                      </span>
                      <StatusPill status={community.status} />
                      {community.is_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-blue-700 dark:text-blue-300">
                          <Check size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-black tracking-[-0.035em]">{community.name}</h2>
                    {community.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/48 dark:text-white/42">{community.description}</p>
                    )}
                    {community.location_name && (
                      <p className="mt-3 text-xs font-semibold text-black/38 dark:text-white/34">{community.location_name}</p>
                    )}
                  </div>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-black/25 dark:text-white/25" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/55 pt-4 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => openEdit(community)}
                    className="flex min-h-10 items-center gap-2 rounded-[14px] border border-white/60 bg-white/50 px-3 text-xs font-black dark:border-white/10 dark:bg-white/[0.05]"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  {community.status !== "approved" && (
                    <button
                      type="button"
                      disabled={actingId === community.id}
                      onClick={() => void changeStatus(community, "approved")}
                      className="flex min-h-10 items-center gap-2 rounded-[14px] bg-emerald-400/14 px-3 text-xs font-black text-emerald-800 dark:text-emerald-200"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}

                  {community.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={actingId === community.id}
                      onClick={() => void changeStatus(community, "rejected")}
                      className="flex min-h-10 items-center gap-2 rounded-[14px] bg-amber-400/12 px-3 text-xs font-black text-amber-800 dark:text-amber-200"
                    >
                      <X size={14} /> Reject
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actingId === community.id}
                    onClick={() => void deleteCommunity(community)}
                    className="ml-auto flex min-h-10 items-center gap-2 rounded-[14px] bg-red-400/10 px-3 text-xs font-black text-red-700 dark:text-red-300"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 rounded-[26px] border border-dashed border-white/60 bg-white/28 p-8 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.025]">
              <Users size={24} className="mx-auto text-black/25 dark:text-white/25" />
              <p className="mt-3 text-sm font-black">No communities match this view.</p>
            </div>
          )}
        </section>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/45 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto my-4 w-full max-w-2xl rounded-[30px] border border-white/65 bg-[#f4f7f3]/96 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.24)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#08110c]/96 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#397151] dark:text-[#9bedb7]">
                  {editingId ? "Edit community" : "New community"}
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  {editingId ? "Update community" : "Add a campus community"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/55 dark:border-white/10 dark:bg-white/[0.05]"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={saveCommunity} className="mt-6 space-y-4">
              <Field label="Community name">
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. DoniVerse Developers Club"
                  className="input-shell"
                  maxLength={140}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as CommunityCategory }))}
                    className="input-shell"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CommunityStatus }))}
                    className="input-shell"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="What does this community do?"
                  className="input-shell min-h-32 resize-y py-4"
                  maxLength={1200}
                />
              </Field>

              <VenuePicker
                label="Meeting location (optional)"
                value={form.locationName}
                selectedPlaceId={form.placeId}
                onChange={(value) => setForm((current) => ({ ...current, locationName: value }))}
                onSelect={(place: CampusVenue) =>
                  setForm((current) => ({
                    ...current,
                    locationName: place.name,
                    placeId: place.id,
                  }))
                }
                onClearSelection={() => setForm((current) => ({ ...current, placeId: null }))}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact / join link (optional)">
                  <input
                    type="url"
                    value={form.contactUrl}
                    onChange={(event) => setForm((current) => ({ ...current, contactUrl: event.target.value }))}
                    placeholder="https://..."
                    className="input-shell"
                  />
                </Field>
                <Field label="Official website (optional)">
                  <input
                    type="url"
                    value={form.officialUrl}
                    onChange={(event) => setForm((current) => ({ ...current, officialUrl: event.target.value }))}
                    placeholder="https://..."
                    className="input-shell"
                  />
                </Field>
              </div>

              <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-[18px] border border-white/60 bg-white/45 px-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div>
                  <p className="text-sm font-black">Verified community</p>
                  <p className="mt-0.5 text-xs text-black/40 dark:text-white/35">Show students that DoniVerse has verified this listing.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(event) => setForm((current) => ({ ...current, isVerified: event.target.checked }))}
                  className="h-5 w-5 accent-[#34744c]"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#174d31] px-5 text-sm font-black text-white shadow-lg disabled:opacity-60 dark:bg-[#9bedb7] dark:text-[#0b2717]"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? "Saving..." : editingId ? "Save changes" : "Create community"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/40 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-black/35 dark:text-white/35">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: CommunityStatus }) {
  const classes = {
    approved: "bg-emerald-400/12 text-emerald-800 dark:text-emerald-200",
    pending: "bg-amber-400/12 text-amber-800 dark:text-amber-200",
    rejected: "bg-red-400/10 text-red-700 dark:text-red-300",
    draft: "bg-black/[0.05] text-black/45 dark:bg-white/[0.06] dark:text-white/45",
  }[status];

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${classes}`}>
      {status}
    </span>
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
