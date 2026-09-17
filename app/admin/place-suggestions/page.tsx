"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, RefreshCw, Search, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const PlacePinPicker = dynamic(() => import("@/components/admin/PlacePinPicker"), {
  ssr: false,
  loading: () => <div className="flex h-[300px] items-center justify-center rounded-[22px] border border-white/60 bg-white/35 dark:border-white/10 dark:bg-white/[0.04]"><Loader2 size={20} className="animate-spin" /></div>,
});

type PlaceCategory = "academic" | "study" | "health" | "food" | "services" | "support" | "sports" | "hostel" | "religious" | "transport" | "other";
type SuggestionStatus = "pending" | "approved" | "rejected";
type Suggestion = {
  id: string; created_by: string; name: string; short_name: string | null; aliases: string[]; category: PlaceCategory; description: string | null;
  building_name: string | null; floor: string | null; campus_area: string | null; latitude: number; longitude: number; gps_accuracy_m: number | null;
  location_source: "gps" | "map"; status: SuggestionStatus; admin_note: string | null; created_at: string; approved_place_id: number | null;
};
type Place = { id: number; name: string; short_name: string | null; aliases: string[] | null; latitude: number; longitude: number };

const categories: { value: PlaceCategory; label: string }[] = [
  { value: "academic", label: "Academic" }, { value: "study", label: "Study" }, { value: "health", label: "Health" },
  { value: "food", label: "Food" }, { value: "services", label: "Services" }, { value: "support", label: "Support" },
  { value: "sports", label: "Sports" }, { value: "hostel", label: "Hostel" }, { value: "religious", label: "Religious" },
  { value: "transport", label: "Transport" }, { value: "other", label: "Other" },
];

function normalizeName(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371000; const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat); const dLng = toRad(bLng - aLng); const lat1 = toRad(aLat); const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export default function AdminPlaceSuggestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); const [accessDenied, setAccessDenied] = useState(false); const [busyId, setBusyId] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]); const [places, setPlaces] = useState<Place[]>([]); const [selected, setSelected] = useState<Suggestion | null>(null);
  const [query, setQuery] = useState(""); const [status, setStatus] = useState<"all" | SuggestionStatus>("pending"); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [rejectNote, setRejectNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const { data: sessionData } = await supabase.auth.getSession(); const session = sessionData.session;
    if (!session) { router.replace("/auth"); return; }
    const { data: adminRow, error: adminError } = await supabase.from("admin_users").select("role").eq("user_id", session.user.id).maybeSingle();
    if (adminError || !adminRow) { setAccessDenied(true); setLoading(false); return; }
    const [{ data: suggestionRows, error: suggestionError }, { data: placeRows }] = await Promise.all([
      supabase.from("place_suggestions").select("id,created_by,name,short_name,aliases,category,description,building_name,floor,campus_area,latitude,longitude,gps_accuracy_m,location_source,status,admin_note,created_at,approved_place_id").order("created_at", { ascending: false }),
      supabase.from("places").select("id,name,short_name,aliases,latitude,longitude").eq("is_active", true).limit(500),
    ]);
    if (suggestionError) { setError(suggestionError.message); setLoading(false); return; }
    setSuggestions((suggestionRows ?? []) as Suggestion[]); setPlaces((placeRows ?? []) as Place[]); setLoading(false);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suggestions.filter((item) => (status === "all" || item.status === status) && (!q || [item.name, item.short_name ?? "", item.campus_area ?? "", item.category, ...(item.aliases ?? [])].join(" ").toLowerCase().includes(q)));
  }, [suggestions, query, status]);

  const duplicates = useMemo(() => {
    if (!selected) return [];
    const target = normalizeName(selected.name);
    return places.map((place) => {
      const meters = distanceMeters(selected.latitude, selected.longitude, Number(place.latitude), Number(place.longitude));
      const names = [place.name, place.short_name ?? "", ...(place.aliases ?? [])].map(normalizeName).filter(Boolean);
      const nameMatch = names.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
      return { ...place, meters, nameMatch };
    }).filter((place) => place.meters <= 40 || place.nameMatch).sort((a, b) => a.meters - b.meters).slice(0, 5);
  }, [selected, places]);

  const saveCorrections = async () => {
    if (!selected || selected.status !== "pending") return true;
    const { error: updateError } = await supabase.from("place_suggestions").update({
      name: selected.name.trim(), short_name: selected.short_name?.trim() || null, aliases: selected.aliases ?? [], category: selected.category,
      description: selected.description?.trim() || null, building_name: selected.building_name?.trim() || null, floor: selected.floor?.trim() || null,
      campus_area: selected.campus_area?.trim() || null, latitude: selected.latitude, longitude: selected.longitude,
    }).eq("id", selected.id);
    if (updateError) { setError(updateError.message); return false; }
    return true;
  };

  const approve = async () => {
    if (!selected || busyId) return;
    setBusyId(selected.id); setError(""); setMessage("");
    if (!(await saveCorrections())) { setBusyId(""); return; }
    const { error: approveError } = await supabase.rpc("approve_doniverse_place_suggestion", { p_suggestion_id: selected.id });
    if (approveError) setError(approveError.message); else { setMessage(`${selected.name} is now live in Explore.`); setSelected(null); await load(); }
    setBusyId("");
  };

  const reject = async () => {
    if (!selected || busyId) return;
    setBusyId(selected.id); setError(""); setMessage("");
    const { error: rejectError } = await supabase.rpc("reject_doniverse_place_suggestion", { p_suggestion_id: selected.id, p_admin_note: rejectNote.trim() || null });
    if (rejectError) setError(rejectError.message); else { setMessage("Suggestion rejected."); setSelected(null); setRejectNote(""); await load(); }
    setBusyId("");
  };

  if (loading) return <main className="flex min-h-[100dvh] items-center justify-center"><Loader2 className="animate-spin" /></main>;
  if (accessDenied) return <main className="flex min-h-[100dvh] items-center justify-center px-5"><div className="max-w-md rounded-[28px] border border-white/60 bg-white/55 p-6 text-center backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/72"><ShieldCheck className="mx-auto" /><h1 className="mt-4 text-2xl font-black">Admin access required</h1><button onClick={() => router.replace("/")} className="mt-5 min-h-12 rounded-[16px] bg-white/60 px-5 text-sm font-black dark:bg-white/[0.08]">Back home</button></div></main>;

  return (
    <main className="relative min-h-[100dvh] bg-transparent pb-28 text-[#102017] dark:text-white">
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 md:px-8">
        <header className="flex items-center justify-between gap-3"><button onClick={() => router.push("/admin")} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/50 dark:border-white/10 dark:bg-white/[0.06]"><ArrowLeft size={18} /></button><button onClick={() => void load()} className="flex min-h-11 items-center gap-2 rounded-full border border-white/65 bg-white/50 px-4 text-xs font-black dark:border-white/10 dark:bg-white/[0.06]"><RefreshCw size={15} /> Refresh</button></header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/46 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#397151] dark:text-[#9bedb7]">Place review</p><h1 className="mt-2 text-[36px] font-black leading-none tracking-[-0.055em] sm:text-[48px]">Review student map suggestions.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-black/50 dark:text-white/45">Correct names or pins, check nearby duplicates, then approve only locations students should be able to navigate to.</p></section>

        {(error || message) && <div className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold ${error ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"}`}>{error || message}</div>}

        <section className="mt-5 rounded-[28px] border border-white/60 bg-white/42 p-4 backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="flex min-h-[54px] items-center gap-3 rounded-[18px] border border-white/65 bg-white/48 px-4 dark:border-white/10 dark:bg-[#101914]/70"><Search size={18} className="opacity-40" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search suggestions..." className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none" /></div><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field-input min-w-[150px]"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option></select></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{filtered.map((item) => <button key={item.id} type="button" onClick={() => { setSelected({ ...item }); setRejectNote(item.admin_note ?? ""); }} className="rounded-[22px] border border-white/60 bg-white/40 p-4 text-left dark:border-white/8 dark:bg-white/[0.035]"><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-black">{item.name}</h2><p className="mt-1 text-xs capitalize text-black/40 dark:text-white/38">{item.category}{item.campus_area ? ` · ${item.campus_area}` : ""}</p></div><span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[10px] font-black uppercase dark:bg-white/[0.06]">{item.status}</span></div><p className="mt-3 text-xs text-black/42 dark:text-white/38">{item.location_source === "gps" ? `GPS${item.gps_accuracy_m ? ` · ±${Math.round(item.gps_accuracy_m)}m` : ""}` : "Manual pin"} · {new Date(item.created_at).toLocaleDateString()}</p></button>)}</div>
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-black/45 dark:text-white/42">No suggestions in this view.</div>}
        </section>
      </div>

      {selected && <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/40 p-3 backdrop-blur-sm sm:p-5"><div className="mx-auto my-3 w-full max-w-[900px] rounded-[30px] border border-white/60 bg-[#f6f8f4]/95 p-4 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-[#0a130e]/96 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">{selected.status} suggestion</p><h2 className="mt-1 text-2xl font-black">{selected.name}</h2></div><button onClick={() => setSelected(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.06]"><XCircle size={18} /></button></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Place name"><input className="field-input" value={selected.name} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, name: e.target.value })} /></Field><Field label="Short name"><input className="field-input" value={selected.short_name ?? ""} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, short_name: e.target.value })} /></Field><Field label="Category"><select className="field-input" value={selected.category} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, category: e.target.value as PlaceCategory })}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Campus area"><input className="field-input" value={selected.campus_area ?? ""} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, campus_area: e.target.value })} /></Field><Field label="Building"><input className="field-input" value={selected.building_name ?? ""} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, building_name: e.target.value })} /></Field><Field label="Floor"><input className="field-input" value={selected.floor ?? ""} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, floor: e.target.value })} /></Field></div>
        <div className="mt-4"><Field label="Aliases"><input className="field-input" value={(selected.aliases ?? []).join(", ")} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, aliases: [...new Set(e.target.value.split(",").map((v) => v.trim()).filter(Boolean))] })} /></Field></div><div className="mt-4"><Field label="Description"><textarea className="field-input min-h-[100px] py-3" value={selected.description ?? ""} disabled={selected.status !== "pending"} onChange={(e) => setSelected({ ...selected, description: e.target.value })} /></Field></div>
        <div className="mt-5"><div className="mb-3 flex items-center gap-2"><MapPin size={17} /><h3 className="font-black">Review map pin</h3></div><PlacePinPicker latitude={selected.latitude} longitude={selected.longitude} onChange={(lat, lng) => selected.status === "pending" && setSelected({ ...selected, latitude: lat, longitude: lng })} /></div>
        {duplicates.length > 0 && <div className="mt-4 rounded-[20px] border border-amber-400/20 bg-amber-400/10 p-4"><div className="flex gap-3"><TriangleAlert size={18} className="mt-0.5 shrink-0" /><div><p className="text-sm font-black">Possible duplicate</p><p className="mt-1 text-xs text-black/50 dark:text-white/45">Check these saved places before approving.</p></div></div><div className="mt-3 space-y-2">{duplicates.map((place) => <div key={place.id} className="rounded-[14px] bg-white/45 px-3 py-2 dark:bg-white/[0.05]"><p className="text-sm font-black">{place.name}</p><p className="text-xs opacity-50">About {Math.round(place.meters)} m away</p></div>)}</div></div>}
        {selected.status === "pending" && <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]"><input value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason if rejecting (optional)" className="field-input" /><button onClick={() => void reject()} disabled={busyId === selected.id} className="min-h-[52px] rounded-[16px] border border-red-400/20 bg-red-400/10 px-5 text-sm font-black text-red-700 disabled:opacity-60 dark:text-red-300">Reject</button><button onClick={() => void approve()} disabled={busyId === selected.id} className="flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-[#dff3e5]/95 px-5 text-sm font-black text-[#17462d] disabled:opacity-60 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">{busyId === selected.id ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}Approve & publish</button></div>}
      </div></div>}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-black/40 dark:text-white/38">{label}</span>{children}</label>; }
