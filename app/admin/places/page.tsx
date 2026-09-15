"use client";

import dynamic from "next/dynamic";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

const PlacePinPicker = dynamic(() => import("@/components/admin/PlacePinPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-[22px] border border-white/60 bg-white/35 dark:border-white/10 dark:bg-white/[0.04]">
      <Loader2 size={20} className="animate-spin" />
    </div>
  ),
});

type PlaceCategory =
  | "academic"
  | "study"
  | "health"
  | "food"
  | "services"
  | "support"
  | "sports"
  | "hostel"
  | "religious"
  | "transport"
  | "other";

type PlaceRow = {
  id: number;
  name: string;
  slug: string;
  category: PlaceCategory;
  short_name: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  building_name: string | null;
  floor: string | null;
  is_featured: boolean;
  is_verified: boolean;
  is_active: boolean;
  aliases: string[];
  campus_area: string | null;
  source: "doniverse" | "openstreetmap" | "community" | "import";
};

type RemotePlace = {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  category: string;
  source: "openstreetmap";
};

type PlaceForm = {
  id: number | null;
  name: string;
  shortName: string;
  aliases: string;
  category: PlaceCategory;
  description: string;
  buildingName: string;
  floor: string;
  campusArea: string;
  latitude: number;
  longitude: number;
  isFeatured: boolean;
  isVerified: boolean;
  isActive: boolean;
  source: "doniverse" | "openstreetmap" | "community" | "import";
};

const categories: { value: PlaceCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "study", label: "Study" },
  { value: "health", label: "Health" },
  { value: "food", label: "Food" },
  { value: "services", label: "Services" },
  { value: "support", label: "Support" },
  { value: "sports", label: "Sports" },
  { value: "hostel", label: "Hostel" },
  { value: "religious", label: "Religious" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Other" },
];

const emptyForm: PlaceForm = {
  id: null,
  name: "",
  shortName: "",
  aliases: "",
  category: "academic",
  description: "",
  buildingName: "",
  floor: "",
  campusArea: "",
  latitude: 7.303,
  longitude: 5.137,
  isFeatured: false,
  isVerified: true,
  isActive: true,
  source: "doniverse",
};

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseAliases(value: string) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return fallback;
}

export default function AdminPlacesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PlaceForm>(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [mapSearching, setMapSearching] = useState(false);
  const [mapResults, setMapResults] = useState<RemotePlace[]>([]);

  const loadPlaces = useCallback(async () => {
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

    const { data, error: placesError } = await supabase
      .from("places")
      .select("id,name,slug,category,short_name,description,latitude,longitude,building_name,floor,is_featured,is_verified,is_active,aliases,campus_area,source")
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (placesError) {
      setError(
        placesError.message.includes("aliases") || placesError.message.includes("campus_area")
          ? "Places management needs its database setup first. Run supabase/places-management.sql in Supabase."
          : placesError.message,
      );
      setLoading(false);
      return;
    }

    setPlaces((data ?? []) as PlaceRow[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadPlaces();
  }, [loadPlaces]);

  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return places;

    return places.filter((place) =>
      [
        place.name,
        place.short_name ?? "",
        place.building_name ?? "",
        place.campus_area ?? "",
        place.category,
        ...(place.aliases ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [places, query]);

  const openNew = () => {
    setForm({ ...emptyForm });
    setFormOpen(true);
    setError("");
    setMessage("");
    setMapResults([]);
    setMapQuery("");
  };

  const openEdit = (place: PlaceRow) => {
    setForm({
      id: place.id,
      name: place.name,
      shortName: place.short_name ?? "",
      aliases: (place.aliases ?? []).join(", "),
      category: place.category,
      description: place.description ?? "",
      buildingName: place.building_name ?? "",
      floor: place.floor ?? "",
      campusArea: place.campus_area ?? "",
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      isFeatured: place.is_featured,
      isVerified: place.is_verified,
      isActive: place.is_active,
      source: place.source ?? "doniverse",
    });
    setFormOpen(true);
    setError("");
    setMessage("");
    setMapResults([]);
    setMapQuery(place.name);
  };

  const savePlace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (!name) {
      setError("Enter the place name.");
      return;
    }

    if (!Number.isFinite(form.latitude) || !Number.isFinite(form.longitude)) {
      setError("Choose a valid location on the map.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      router.replace("/auth");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name,
      slug: makeSlug(name),
      category: form.category,
      short_name: form.shortName.trim() || null,
      description: form.description.trim() || null,
      latitude: form.latitude,
      longitude: form.longitude,
      building_name: form.buildingName.trim() || null,
      floor: form.floor.trim() || null,
      is_featured: form.isFeatured,
      is_verified: form.isVerified,
      is_active: form.isActive,
      aliases: parseAliases(form.aliases),
      campus_area: form.campusArea.trim() || null,
      source: form.source,
      updated_by: userId,
    };

    try {
      if (form.id) {
        const { error: updateError } = await supabase.from("places").update(payload).eq("id", form.id);
        if (updateError) throw updateError;
        setMessage("Place updated.");
      } else {
        const { error: insertError } = await supabase.from("places").insert({ ...payload, created_by: userId });
        if (insertError) throw insertError;
        setMessage("Place added to DoniVerse.");
      }

      setFormOpen(false);
      await loadPlaces();
    } catch (caughtError) {
      setError(errorMessage(caughtError, "We could not save this place."));
    } finally {
      setSaving(false);
    }
  };

  const removePlace = async (place: PlaceRow) => {
    if (!window.confirm(`Delete ${place.name}? This should only be used for duplicate or incorrect records.`)) return;

    const { error: deleteError } = await supabase.from("places").delete().eq("id", place.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Place deleted.");
    await loadPlaces();
  };

  const searchExternalMap = async () => {
    const search = mapQuery.trim();
    if (search.length < 2 || mapSearching) return;

    setMapSearching(true);
    setMapResults([]);
    setError("");

    try {
      const response = await fetch(`/api/places/search?q=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error("Map search is unavailable right now.");
      const payload = (await response.json()) as { results?: RemotePlace[] };
      setMapResults(payload.results ?? []);
    } catch (caughtError) {
      setError(errorMessage(caughtError, "Map search is unavailable right now."));
    } finally {
      setMapSearching(false);
    }
  };

  const useExternalResult = (place: RemotePlace) => {
    setForm((current) => ({
      ...current,
      name: current.name || place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      source: "openstreetmap",
    }));
    setMapResults([]);
    setMapQuery(place.name);
  };

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-transparent px-5 text-[#102017] dark:text-white">
        <div className="rounded-[26px] border border-white/60 bg-white/55 px-7 py-6 text-center shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/70">
          <Loader2 className="mx-auto animate-spin" size={22} />
          <p className="mt-3 text-sm font-bold">Opening DoniVerse Places...</p>
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
          <p className="mt-2 text-sm text-black/50 dark:text-white/45">Only DoniVerse administrators can manage campus places.</p>
          <button onClick={() => router.replace("/")} className="mt-5 min-h-12 rounded-[16px] bg-white/60 px-5 text-sm font-extrabold dark:bg-white/[0.08]">
            Back to DoniVerse
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-28 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
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
            onClick={() => void loadPlaces()}
            className="flex min-h-11 items-center gap-2 rounded-full border border-white/65 bg-white/50 px-4 text-xs font-black backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/46 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#397151] dark:text-[#9bedb7]">DoniVerse Places</p>
              <h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">Build the campus map.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 dark:text-white/45">
                Add permanent campus locations, correct their map pins and store the names students actually use.
              </p>
            </div>

            <button
              type="button"
              onClick={openNew}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-[17px] bg-[#dff3e5]/95 px-5 text-sm font-black text-[#17462d] shadow-sm transition active:scale-[0.99] dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]"
            >
              <Plus size={18} /> Add place
            </button>
          </div>
        </section>

        {(error || message) && (
          <div className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold backdrop-blur-2xl ${error ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"}`}>
            {error || message}
          </div>
        )}

        <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-4 shadow-[0_20px_60px_rgba(16,46,28,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-5">
          <div className="flex min-h-[54px] items-center gap-3 rounded-[18px] border border-white/65 bg-white/48 px-4 dark:border-white/10 dark:bg-[#101914]/70">
            <Search size={18} className="text-black/35 dark:text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names, aliases, blocks or categories..."
              className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-black/28 dark:text-white dark:placeholder:text-white/25"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-black/35 dark:text-white/35">{filteredPlaces.length} places</p>
            <p className="text-xs text-black/35 dark:text-white/35">{places.filter((place) => place.is_active).length} active</p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {filteredPlaces.map((place) => (
              <article key={place.id} className="rounded-[22px] border border-white/60 bg-white/40 p-4 backdrop-blur-xl dark:border-white/8 dark:bg-white/[0.035]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-black">{place.name}</h2>
                      {place.is_featured && <Star size={14} className="fill-current text-[#8a6c23]" />}
                      {place.is_verified && <CheckCircle2 size={14} className="text-[#397151] dark:text-[#9bedb7]" />}
                    </div>
                    <p className="mt-1 text-xs font-bold capitalize text-black/40 dark:text-white/38">
                      {place.category}{place.campus_area ? ` · ${place.campus_area}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${place.is_active ? "bg-emerald-400/10 text-emerald-800 dark:text-emerald-200" : "bg-black/[0.05] text-black/40 dark:bg-white/[0.06] dark:text-white/40"}`}>
                    {place.is_active ? "Active" : "Hidden"}
                  </span>
                </div>

                {place.aliases?.length > 0 && (
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-black/45 dark:text-white/42">Also known as: {place.aliases.join(", ")}</p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(place)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[15px] border border-white/65 bg-white/52 text-xs font-black text-[#245c3a] dark:border-white/10 dark:bg-white/[0.06] dark:text-[#a9efc1]"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removePlace(place)}
                    className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-red-400/15 bg-red-400/[0.07] text-red-700 dark:text-red-300"
                    aria-label={`Delete ${place.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="py-12 text-center text-sm text-black/45 dark:text-white/42">No places match that search.</div>
          )}
        </section>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/38 p-3 backdrop-blur-sm sm:p-5">
          <div className="mx-auto my-3 w-full max-w-[900px] rounded-[30px] border border-white/60 bg-[#f6f8f4]/95 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0a130e]/96 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">{form.id ? "Edit place" : "New place"}</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{form.id ? form.name : "Add to DoniVerse"}</h2>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.06]" aria-label="Close">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={savePlace} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Place name">
                  <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Obafemi Hall" className="field-input" />
                </Field>
                <Field label="Short name">
                  <input value={form.shortName} onChange={(event) => setForm((current) => ({ ...current, shortName: event.target.value }))} placeholder="e.g. Obafemi" className="field-input" />
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as PlaceCategory }))} className="field-input">
                    {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                  </select>
                </Field>
                <Field label="Campus area">
                  <input value={form.campusArea} onChange={(event) => setForm((current) => ({ ...current, campusArea: event.target.value }))} placeholder="e.g. Obanla" className="field-input" />
                </Field>
                <Field label="Building / block">
                  <input value={form.buildingName} onChange={(event) => setForm((current) => ({ ...current, buildingName: event.target.value }))} placeholder="Building or block" className="field-input" />
                </Field>
                <Field label="Floor">
                  <input value={form.floor} onChange={(event) => setForm((current) => ({ ...current, floor: event.target.value }))} placeholder="Optional" className="field-input" />
                </Field>
              </div>

              <Field label="Aliases students may search">
                <input value={form.aliases} onChange={(event) => setForm((current) => ({ ...current, aliases: event.target.value }))} placeholder="TI Francis, T.I. Francis, Francis Auditorium" className="field-input" />
                <p className="mt-2 text-xs text-black/38 dark:text-white/35">Separate aliases with commas.</p>
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Short useful description for students" className="field-input min-h-[100px] py-3" />
              </Field>

              <section className="rounded-[24px] border border-white/60 bg-white/35 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field label="Find on external map" className="flex-1">
                    <input value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Search a campus location" className="field-input" />
                  </Field>
                  <button type="button" onClick={() => void searchExternalMap()} disabled={mapSearching || mapQuery.trim().length < 2} className="flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] border border-white/65 bg-white/60 px-4 text-sm font-black disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06]">
                    {mapSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search map
                  </button>
                </div>

                {mapResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {mapResults.slice(0, 5).map((place) => (
                      <button key={place.id} type="button" onClick={() => useExternalResult(place)} className="flex w-full items-center justify-between gap-3 rounded-[16px] border border-white/60 bg-white/55 p-3 text-left dark:border-white/10 dark:bg-white/[0.05]">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">{place.name}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-black/40 dark:text-white/38">{place.subtitle}</p>
                        </div>
                        <ChevronRight size={16} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <PlacePinPicker latitude={form.latitude} longitude={form.longitude} onChange={(latitude, longitude) => setForm((current) => ({ ...current, latitude, longitude }))} />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Latitude">
                      <input type="number" step="any" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: Number(event.target.value) }))} className="field-input" />
                    </Field>
                    <Field label="Longitude">
                      <input type="number" step="any" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: Number(event.target.value) }))} className="field-input" />
                    </Field>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-black/40 dark:text-white/38"><MapPin size={13} /> Tap the map or drag the pin to correct the location.</p>
                </div>
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <Toggle label="Active" checked={form.isActive} onChange={(checked) => setForm((current) => ({ ...current, isActive: checked }))} />
                <Toggle label="Verified" checked={form.isVerified} onChange={(checked) => setForm((current) => ({ ...current, isVerified: checked }))} />
                <Toggle label="Featured" checked={form.isFeatured} onChange={(checked) => setForm((current) => ({ ...current, isFeatured: checked }))} />
              </div>

              <button type="submit" disabled={saving} className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[18px] bg-[#dff3e5] text-sm font-black text-[#17462d] shadow-sm disabled:opacity-60 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                {saving ? "Saving..." : form.id ? "Save changes" : "Add place to DoniVerse"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-bold text-black/55 dark:text-white/55">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex min-h-[52px] items-center justify-between rounded-[16px] border px-4 text-sm font-black ${checked ? "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200" : "border-white/60 bg-white/38 text-black/45 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45"}`}>
      {label}
      <span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-emerald-500/70" : "bg-black/15 dark:bg-white/15"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </span>
    </button>
  );
}
