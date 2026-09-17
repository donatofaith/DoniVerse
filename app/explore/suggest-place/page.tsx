"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Crosshair, Loader2, MapPin, Navigation, Search, Send, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const PlacePinPicker = dynamic(() => import("@/components/admin/PlacePinPicker"), {
  ssr: false,
  loading: () => <div className="flex h-[300px] items-center justify-center rounded-[22px] border border-white/60 bg-white/35 dark:border-white/10 dark:bg-white/[0.04]"><Loader2 size={20} className="animate-spin" /></div>,
});

type PlaceCategory = "academic" | "study" | "health" | "food" | "services" | "support" | "sports" | "hostel" | "religious" | "transport" | "other";
type NearbyPlace = { id: number; name: string; short_name: string | null; aliases: string[] | null; latitude: number; longitude: number };

const categories: { value: PlaceCategory; label: string }[] = [
  { value: "academic", label: "Academic" }, { value: "study", label: "Study" }, { value: "health", label: "Health" },
  { value: "food", label: "Food" }, { value: "services", label: "Services" }, { value: "support", label: "Support" },
  { value: "sports", label: "Sports" }, { value: "hostel", label: "Hostel" }, { value: "religious", label: "Religious" },
  { value: "transport", label: "Transport" }, { value: "other", label: "Other" },
];

const DEFAULT_LAT = 7.303;
const DEFAULT_LNG = 5.137;

function normalizeName(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, ""); }
function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371000; const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat); const dLng = toRad(bLng - aLng); const lat1 = toRad(aLat); const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export default function SuggestPlacePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(""); const [authLoading, setAuthLoading] = useState(true); const [saving, setSaving] = useState(false); const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [name, setName] = useState(""); const [shortName, setShortName] = useState(""); const [aliases, setAliases] = useState(""); const [category, setCategory] = useState<PlaceCategory>("academic");
  const [description, setDescription] = useState(""); const [campusArea, setCampusArea] = useState(""); const [buildingName, setBuildingName] = useState(""); const [floor, setFloor] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_LAT); const [longitude, setLongitude] = useState(DEFAULT_LNG); const [accuracy, setAccuracy] = useState<number | null>(null); const [locationSource, setLocationSource] = useState<"gps" | "map">("map");

  useEffect(() => { void (async () => { const { data } = await supabase.auth.getSession(); if (!data.session) { router.replace("/auth"); return; } setUserId(data.session.user.id); setAuthLoading(false); })(); }, [router]);
  useEffect(() => { void (async () => { const { data } = await supabase.from("places").select("id,name,short_name,aliases,latitude,longitude").eq("is_active", true).limit(250); setNearbyPlaces((data ?? []) as NearbyPlace[]); })(); }, [latitude, longitude]);

  const possibleDuplicates = useMemo(() => {
    const target = normalizeName(name);
    return nearbyPlaces.map((place) => {
      const meters = distanceMeters(latitude, longitude, Number(place.latitude), Number(place.longitude));
      const names = [place.name, place.short_name ?? "", ...(place.aliases ?? [])].map(normalizeName).filter(Boolean);
      const nameMatch = !!target && names.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
      return { ...place, meters, nameMatch };
    }).filter((place) => place.meters <= 40 || place.nameMatch).sort((a, b) => a.meters - b.meters).slice(0, 4);
  }, [nearbyPlaces, latitude, longitude, name]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError("Location is not supported on this device."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(position.coords.latitude); setLongitude(position.coords.longitude); setAccuracy(position.coords.accuracy); setLocationSource("gps"); setLocating(false);
    }, (geoError) => {
      setLocating(false);
      if (geoError.code === geoError.PERMISSION_DENIED) setError("Location permission was denied. You can still place the pin manually.");
      else if (geoError.code === geoError.TIMEOUT) setError("Finding your location took too long. Try again or place the pin manually.");
      else setError("We could not determine your current location. You can still place the pin manually.");
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
  };

  const handlePinChange = (lat: number, lng: number) => { setLatitude(lat); setLongitude(lng); setLocationSource("map"); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (saving) return; if (!name.trim()) { setError("Enter the place name."); return; } if (!userId) { router.replace("/auth"); return; }
    setSaving(true); setError(""); setMessage("");
    const parsedAliases = [...new Set(aliases.split(",").map((item) => item.trim()).filter(Boolean))];
    const { error: submitError } = await supabase.from("place_suggestions").insert({
      created_by: userId, name: name.trim(), short_name: shortName.trim() || null, aliases: parsedAliases, category,
      description: description.trim() || null, campus_area: campusArea.trim() || null, building_name: buildingName.trim() || null,
      floor: floor.trim() || null, latitude, longitude, gps_accuracy_m: locationSource === "gps" ? accuracy : null, location_source: locationSource, status: "pending",
    });
    if (submitError) { setError(submitError.message || "We could not submit this place."); setSaving(false); return; }
    setMessage("Place submitted. An admin will review the name and map pin before it appears in Explore."); setSaving(false);
  };

  if (authLoading) return <main className="flex min-h-[100dvh] items-center justify-center"><Loader2 className="animate-spin" /></main>;

  return (
    <main className="relative min-h-[100dvh] bg-[#edf2ed] pb-32 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div className="mx-auto w-full max-w-[900px] px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => router.push("/explore")} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/55 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]" aria-label="Back to Explore"><ArrowLeft size={18} /></button>
          <div className="rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#397151] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:text-[#9bedb7]">Suggest a place</div>
        </header>

        <section className="mt-6 rounded-[32px] border border-white/60 bg-white/48 p-5 shadow-[0_26px_80px_rgba(16,46,28,0.10)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62 sm:p-7">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#dff3e5]/90 text-[#245f3c] dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]"><MapPin size={21} /></div><div><p className="text-xs font-black uppercase tracking-[0.13em] text-[#397151] dark:text-[#9bedb7]">Help build the campus map</p><h1 className="mt-2 text-[34px] font-black leading-none tracking-[-0.05em] sm:text-[44px]">Add a place students should be able to find.</h1><p className="mt-3 text-sm leading-6 text-black/50 dark:text-white/45">If you are standing at the place, use your current location. Otherwise, drag the pin to the entrance students should navigate to.</p></div></div>
        </section>

        {(error || message) && <div className={`mt-4 rounded-[18px] border px-4 py-3 text-sm font-semibold ${error ? "border-red-400/20 bg-red-400/10 text-red-700 dark:text-red-300" : "border-emerald-500/20 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200"}`}>{error || message}</div>}

        {message ? (
          <section className="mt-5 rounded-[30px] border border-white/60 bg-white/48 p-6 text-center backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/62"><CheckCircle2 size={34} className="mx-auto text-[#397151] dark:text-[#9bedb7]" /><h2 className="mt-4 text-2xl font-black">Thanks for improving DoniVerse.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/50 dark:text-white/45">Approved places automatically become searchable and routable in Explore.</p><button type="button" onClick={() => router.push("/explore")} className="mt-5 min-h-12 rounded-[16px] bg-[#dff3e5]/95 px-5 text-sm font-black text-[#17462d] dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">Back to Explore</button></section>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-5">
            <section className="rounded-[28px] border border-white/60 bg-white/44 p-5 backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-6">
              <h2 className="text-lg font-black">1. Tell us about the place</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Place name"><input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Engineering Workshop" /></Field>
                <Field label="Short name"><input className="field-input" value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="Optional" /></Field>
                <Field label="Category"><select className="field-input" value={category} onChange={(e) => setCategory(e.target.value as PlaceCategory)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
                <Field label="Campus area"><input className="field-input" value={campusArea} onChange={(e) => setCampusArea(e.target.value)} placeholder="e.g. Obanla" /></Field>
                <Field label="Building / block"><input className="field-input" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="Optional" /></Field>
                <Field label="Floor"><input className="field-input" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Optional" /></Field>
              </div>
              <div className="mt-4"><Field label="Other names students use"><input className="field-input" value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="Separate aliases with commas" /></Field></div>
              <div className="mt-4"><Field label="Helpful description"><textarea className="field-input min-h-[110px] resize-y py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this place, and how can students identify it?" /></Field></div>
            </section>

            <section className="rounded-[28px] border border-white/60 bg-white/44 p-5 backdrop-blur-3xl dark:border-white/10 dark:bg-[#0b1410]/58 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-black">2. Pin the entrance</h2><p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/40">For the best directions, pin where students should arrive—not the middle of a large building.</p></div><button type="button" onClick={useCurrentLocation} disabled={locating} className="flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-[#dff3e5]/95 px-4 text-sm font-black text-[#17462d] disabled:opacity-60 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">{locating ? <Loader2 size={17} className="animate-spin" /> : <Crosshair size={17} />}{locating ? "Finding you..." : "Use my current location"}</button></div>
              <div className="mt-4"><PlacePinPicker latitude={latitude} longitude={longitude} onChange={handlePinChange} /></div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-black/[0.05] px-3 py-1.5 font-bold dark:bg-white/[0.06]">{locationSource === "gps" ? "GPS location" : "Manual map pin"}</span>{accuracy != null && locationSource === "gps" && <span className="rounded-full bg-black/[0.05] px-3 py-1.5 dark:bg-white/[0.06]">Accuracy: about {Math.round(accuracy)} m</span>}</div>
              {accuracy != null && locationSource === "gps" && accuracy > 35 && <div className="mt-3 flex gap-3 rounded-[17px] border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-900 dark:text-amber-200"><TriangleAlert size={17} className="mt-0.5 shrink-0" />GPS accuracy is weak right now. Move closer to the entrance or adjust the pin manually before submitting.</div>}
            </section>

            {possibleDuplicates.length > 0 && <section className="rounded-[28px] border border-amber-400/20 bg-amber-400/[0.08] p-5 backdrop-blur-3xl sm:p-6"><div className="flex gap-3"><Search size={19} className="mt-0.5 shrink-0 text-amber-800 dark:text-amber-200" /><div><h2 className="font-black">This place may already exist</h2><p className="mt-1 text-xs leading-5 text-black/50 dark:text-white/45">We found a similar name or a saved place within about 40 metres. Check these before creating a duplicate.</p></div></div><div className="mt-4 space-y-2">{possibleDuplicates.map((place) => <div key={place.id} className="flex items-center justify-between gap-3 rounded-[16px] bg-white/45 px-4 py-3 dark:bg-white/[0.05]"><div><p className="text-sm font-black">{place.name}</p><p className="mt-0.5 text-xs text-black/40 dark:text-white/35">About {Math.round(place.meters)} m away</p></div><Navigation size={16} className="shrink-0 opacity-50" /></div>)}</div><button type="button" onClick={() => router.push("/explore")} className="mt-4 min-h-11 rounded-[15px] border border-white/60 bg-white/55 px-4 text-xs font-black dark:border-white/10 dark:bg-white/[0.06]">Use an existing place instead</button></section>}

            <button type="submit" disabled={saving} className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-[19px] bg-[#dff3e5]/95 px-5 text-sm font-black text-[#17462d] shadow-sm disabled:opacity-60 dark:bg-[#8ce6ad]/15 dark:text-[#a9efc1]">{saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}{saving ? "Submitting..." : "Submit for review"}</button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-black/40 dark:text-white/38">{label}</span>{children}</label>;
}
