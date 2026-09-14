"use client";

import {
  ArrowLeft,
  BedDouble,
  Building2,
  Bus,
  CheckCircle2,
  ChevronRight,
  Church,
  Compass,
  Cross,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  Library,
  Loader2,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  Route,
  Search,
  ShieldPlus,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";
import type { MapPlace, UserLocation } from "@/components/explore/FutaMap";

const FUTA_CAMPUS_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/2/29/Federal_University_of_Technology%2C_Akure%2C_Ondo_State11.jpg";

const FutaMap = dynamic(() => import("@/components/explore/FutaMap"), {
  ssr: false,
  loading: () => <MapLoading />,
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

type Place = MapPlace & { category: PlaceCategory };
type CategoryFilter = "all" | PlaceCategory;

type WalkingRoute = {
  route: [number, number][];
  distanceKm: number;
  durationSeconds: number;
  maneuvers: {
    instruction: string;
    distanceKm: number;
    timeSeconds: number;
  }[];
};

const categories: { label: string; value: CategoryFilter; icon: React.ElementType }[] = [
  { label: "All", value: "all", icon: Compass },
  { label: "Academic", value: "academic", icon: Building2 },
  { label: "Study", value: "study", icon: Library },
  { label: "Health", value: "health", icon: ShieldPlus },
  { label: "Food", value: "food", icon: UtensilsCrossed },
  { label: "Services", value: "services", icon: GraduationCap },
  { label: "Support", value: "support", icon: HeartHandshake },
  { label: "Transport", value: "transport", icon: Bus },
  { label: "Sports", value: "sports", icon: Dumbbell },
  { label: "Hostels", value: "hostel", icon: BedDouble },
  { label: "Religious", value: "religious", icon: Church },
];

export default function ExplorePage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [focusUserRequest, setFocusUserRequest] = useState(0);
  const [walkingRoute, setWalkingRoute] = useState<WalkingRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("places")
        .select(`
          id,
          name,
          slug,
          category,
          short_name,
          description,
          latitude,
          longitude,
          building_name,
          floor,
          is_featured,
          is_verified,
          is_active
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setLoadError("FUTAGO could not load campus places right now.");
        setLoading(false);
        return;
      }

      const loaded = (data as Place[] | null) ?? [];
      setPlaces(loaded);

      if (loaded.length > 0) {
        setSelectedPlace(loaded.find((place) => place.is_featured) ?? loaded[0]);
      }

      setLoading(false);
    };

    void loadPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return places.filter((place) => {
      const categoryMatch = activeCategory === "all" || place.category === activeCategory;
      const searchMatch =
        !query ||
        place.name.toLowerCase().includes(query) ||
        (place.short_name ?? "").toLowerCase().includes(query) ||
        (place.building_name ?? "").toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [places, search, activeCategory]);

  useEffect(() => {
    if (selectedPlace && !filteredPlaces.some((place) => place.id === selectedPlace.id)) {
      setSelectedPlace(filteredPlaces[0] ?? null);
    }

    if (!selectedPlace && filteredPlaces.length > 0) {
      setSelectedPlace(filteredPlaces[0]);
    }
  }, [filteredPlaces, selectedPlace]);

  useEffect(() => {
    setWalkingRoute(null);
    setRouteError("");
  }, [selectedPlace?.id]);

  const requestLocation = useCallback(
    () =>
      new Promise<UserLocation>((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          reject(new Error("Location is not supported by this browser."));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              reject(new Error("Location permission was denied. Allow location access in your browser to use campus navigation."));
              return;
            }

            if (error.code === error.POSITION_UNAVAILABLE) {
              reject(new Error("Your current location could not be determined."));
              return;
            }

            if (error.code === error.TIMEOUT) {
              reject(new Error("Finding your location took too long. Please try again."));
              return;
            }

            reject(new Error("FUTAGO could not access your location."));
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
        );
      }),
    [],
  );

  const handleLocateMe = async () => {
    if (userLocation) {
      setFocusUserRequest((value) => value + 1);
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    try {
      const location = await requestLocation();
      setUserLocation(location);
      setFocusUserRequest((value) => value + 1);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "FUTAGO could not access your location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleDirections = async () => {
    if (!selectedPlace) return;

    setRouteLoading(true);
    setRouteError("");
    setLocationError("");

    try {
      let location = userLocation;

      if (!location) {
        setLocationLoading(true);
        location = await requestLocation();
        setUserLocation(location);
        setLocationLoading(false);
      }

      const response = await fetch("/api/route/walking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLat: location.latitude,
          startLng: location.longitude,
          endLat: selectedPlace.latitude,
          endLng: selectedPlace.longitude,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Walking route unavailable.");
      setWalkingRoute(data as WalkingRoute);
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : "FUTAGO could not calculate this route.");
    } finally {
      setRouteLoading(false);
      setLocationLoading(false);
    }
  };

  const clearRoute = () => {
    setWalkingRoute(null);
    setRouteError("");
  };

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#edf2ed] pb-32 text-[#102017] dark:bg-[#050b07] dark:text-white">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.28] dark:opacity-[0.2]" style={{ backgroundImage: `url(${FUTA_CAMPUS_IMAGE})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(239,246,239,0.82)_0%,rgba(239,246,239,0.9)_35%,rgba(239,246,239,0.96)_100%)] dark:bg-[linear-gradient(180deg,rgba(5,11,7,0.78)_0%,rgba(5,11,7,0.9)_38%,rgba(5,11,7,0.97)_100%)]" />
        <div className="absolute -right-28 top-10 h-[320px] w-[320px] rounded-full bg-[#75d59a]/25 blur-[110px] dark:bg-[#75d59a]/10" />
        <div className="absolute -left-28 top-[560px] h-[320px] w-[320px] rounded-full bg-[#e7c563]/18 blur-[120px] dark:bg-[#e7c563]/[0.06]" />
      </div>

      <div className="relative mx-auto min-h-[100dvh] w-full max-w-[1280px] px-4 pb-8 pt-4 sm:px-6 md:px-8 lg:px-10">
        <header className="relative z-30 flex items-center justify-between gap-3 rounded-[24px] border border-white/55 bg-white/42 p-3 shadow-[0_18px_55px_rgba(20,63,42,0.08)] backdrop-blur-[24px] dark:border-white/[0.08] dark:bg-white/[0.035] sm:p-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/58 text-[#183624] shadow-sm backdrop-blur-xl transition active:scale-95 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/65 bg-white/58 text-[#2d6d47] shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#8ce6ad]">
              <Map size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black tracking-[-0.045em]">Explore FUTA</p>
              <p className="truncate text-[11px] text-black/40 dark:text-white/35">Find places and know where to go.</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleLocateMe}
            disabled={locationLoading}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm backdrop-blur-xl transition ${
              userLocation
                ? "border-[#67ad7e]/35 bg-[#dff3e4]/72 text-[#236d43] dark:border-[#8ce6ad]/18 dark:bg-[#8ce6ad]/14 dark:text-[#9bedb7]"
                : "border-white/65 bg-white/55 text-[#2d6d47] dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-[#8ce6ad]"
            }`}
            aria-label="Locate me"
          >
            {locationLoading ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
          </motion.button>
        </header>

        <section className="relative z-20 mt-5 rounded-[30px] border border-white/55 bg-white/38 p-5 shadow-[0_20px_60px_rgba(20,63,42,0.08)] backdrop-blur-[26px] dark:border-white/[0.07] dark:bg-white/[0.03] sm:p-6">
          <p className="text-sm font-bold text-[#34734a] dark:text-[#8ce6ad]">Campus navigation</p>
          <h1 className="mt-2 max-w-2xl text-[37px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[48px] md:text-[56px]">
            Find what you need.
            <span className="block text-[#4c8f66] dark:text-[#91eab0]">Then find your way.</span>
          </h1>

          <AnimatePresence>
            {locationError && <MessageBanner type="error" message={locationError} onClose={() => setLocationError("")} />}
            {routeError && <MessageBanner type="error" message={routeError} onClose={() => setRouteError("")} />}
          </AnimatePresence>

          <div className="mt-6 flex min-h-[62px] items-center gap-3 rounded-[22px] border border-white/65 bg-white/52 px-4 shadow-sm backdrop-blur-2xl dark:border-white/[0.075] dark:bg-white/[0.045]">
            <Search size={18} className="shrink-0 text-[#34734a] dark:text-[#8ce6ad]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments, offices, halls..."
              className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50 text-black/40 dark:bg-white/[0.05] dark:text-white/40">
                <Cross size={16} />
              </button>
            )}
          </div>

          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {categories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.value;

              return (
                <motion.button
                  key={category.value}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-bold backdrop-blur-xl transition ${
                    active
                      ? "border-white/70 bg-[#dff1e4]/78 text-[#286d45] shadow-sm dark:border-[#8ce6ad]/15 dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]"
                      : "border-white/55 bg-white/42 text-black/48 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-white/40"
                  }`}
                >
                  <Icon size={15} />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <MapLoading />
        ) : loadError ? (
          <div className="mt-6 rounded-[28px] border border-red-500/10 bg-red-500/[0.08] p-6 text-sm text-red-700 backdrop-blur-xl dark:text-red-300">{loadError}</div>
        ) : (
          <section className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-white/60 bg-white/34 p-1.5 shadow-[0_24px_80px_rgba(24,54,35,0.12)] backdrop-blur-[24px] dark:border-white/[0.08] dark:bg-white/[0.03] sm:min-h-[620px] lg:min-h-[690px]">
              <div className="h-full min-h-[507px] overflow-hidden rounded-[27px] sm:min-h-[607px] lg:min-h-[677px]">
                <FutaMap
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={setSelectedPlace}
                  userLocation={userLocation}
                  routeCoordinates={walkingRoute?.route ?? []}
                  focusUserRequest={focusUserRequest}
                />
              </div>

              <div className="pointer-events-none absolute left-5 top-5 z-[500] rounded-[18px] border border-white/55 bg-white/64 px-4 py-3 shadow-lg backdrop-blur-2xl dark:border-white/[0.09] dark:bg-[#08150e]/72">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/35 dark:text-white/30">{walkingRoute ? "Walking route" : "Live campus map"}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#4d9a68]" />
                  <span className="text-xs font-bold">
                    {walkingRoute
                      ? `${formatDistance(walkingRoute.distanceKm)} · ${formatDuration(walkingRoute.durationSeconds)}`
                      : `${filteredPlaces.length} locations`}
                  </span>
                </div>
              </div>

              {walkingRoute && (
                <button
                  type="button"
                  onClick={clearRoute}
                  className="absolute right-5 top-5 z-[500] flex h-10 items-center gap-2 rounded-full border border-white/55 bg-white/68 px-4 text-xs font-bold shadow-lg backdrop-blur-2xl dark:border-white/[0.09] dark:bg-[#08150e]/76"
                >
                  <X size={14} /> End route
                </button>
              )}
            </div>

            <div className="space-y-4">
              {selectedPlace && (
                <div className="rounded-[28px] border border-white/58 bg-white/46 p-5 shadow-[0_16px_48px_rgba(20,63,42,0.07)] backdrop-blur-[24px] dark:border-white/[0.07] dark:bg-white/[0.035]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/65 bg-white/58 text-[#30744a] shadow-sm backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                      <MapPin size={20} />
                    </div>

                    {selectedPlace.is_verified ? (
                      <span className="flex items-center gap-1.5 rounded-full border border-white/60 bg-[#e8f5eb]/72 px-3 py-1.5 text-[10px] font-bold text-[#267146] backdrop-blur-xl dark:border-[#8ce6ad]/10 dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/55 bg-[#fff3cf]/72 px-3 py-1.5 text-[10px] font-bold text-[#82691f] backdrop-blur-xl dark:border-[#e2c96d]/10 dark:bg-[#e2c96d]/10 dark:text-[#e2c96d]">Candidate</span>
                    )}
                  </div>

                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#397451] dark:text-[#8ce6ad]">{formatCategory(selectedPlace.category)}</p>
                  <h2 className="mt-2 text-[26px] font-black leading-[1.02] tracking-[-0.045em]">{selectedPlace.name}</h2>

                  {selectedPlace.description && <p className="mt-4 text-sm leading-6 text-black/45 dark:text-white/40">{selectedPlace.description}</p>}

                  {walkingRoute && (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <RouteMetric label="Walking time" value={formatDuration(walkingRoute.durationSeconds)} />
                      <RouteMetric label="Distance" value={formatDistance(walkingRoute.distanceKm)} />
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    disabled={routeLoading || locationLoading}
                    onClick={handleDirections}
                    className="mt-5 flex min-h-[58px] w-full items-center justify-between rounded-[19px] border border-white/65 bg-[#dff1e4]/78 px-5 text-left text-[#245f3c] shadow-sm backdrop-blur-xl disabled:opacity-60 dark:border-[#8ce6ad]/15 dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]"
                  >
                    <div>
                      <p className="text-sm font-extrabold">{routeLoading ? "Finding your route..." : walkingRoute ? "Refresh route" : "Get directions"}</p>
                      <p className="mt-0.5 text-xs text-[#245f3c]/60 dark:text-[#9bedb7]/60">{userLocation ? "Walk from your current location" : "Uses your location after permission"}</p>
                    </div>
                    {routeLoading || locationLoading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                  </motion.button>
                </div>
              )}

              {walkingRoute && walkingRoute.maneuvers.length > 0 && (
                <div className="rounded-[28px] border border-white/58 bg-white/44 p-4 shadow-[0_14px_42px_rgba(20,63,42,0.06)] backdrop-blur-[24px] dark:border-white/[0.07] dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Route size={17} className="text-[#33734a] dark:text-[#8ce6ad]" />
                    <h3 className="text-sm font-black">Walking directions</h3>
                  </div>

                  <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto">
                    {walkingRoute.maneuvers.map((maneuver, index) => (
                      <div key={`${maneuver.instruction}-${index}`} className="flex gap-3 rounded-[17px] border border-white/45 bg-white/40 p-3 backdrop-blur-xl dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dff1e4] text-[10px] font-black text-[#286d45] dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]">{index + 1}</div>
                        <div>
                          <p className="text-xs font-semibold leading-5">{maneuver.instruction}</p>
                          {maneuver.distanceKm > 0 && <p className="mt-1 text-[10px] text-black/35 dark:text-white/30">{formatDistance(maneuver.distanceKm)}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[28px] border border-white/58 bg-white/44 p-4 shadow-[0_14px_42px_rgba(20,63,42,0.06)] backdrop-blur-[24px] dark:border-white/[0.07] dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#397351] dark:text-[#8ce6ad]">Campus places</p>
                    <h3 className="mt-1 text-lg font-black">Explore nearby</h3>
                  </div>
                  <Sparkles size={18} className="text-[#c59b2c]" />
                </div>

                <div className="mt-4 max-h-[390px] space-y-2 overflow-y-auto">
                  {filteredPlaces.map((place) => {
                    const active = selectedPlace?.id === place.id;
                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => setSelectedPlace(place)}
                        className={`group flex w-full items-center gap-3 rounded-[18px] border p-3 text-left backdrop-blur-xl transition ${
                          active
                            ? "border-white/65 bg-[#e7f3e9]/70 dark:border-[#8ce6ad]/10 dark:bg-[#8ce6ad]/10"
                            : "border-transparent bg-white/20 hover:border-white/45 hover:bg-white/36 dark:bg-white/[0.015] dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${active ? "bg-white/72 text-[#286d45] shadow-sm dark:bg-[#8ce6ad]/12 dark:text-[#9bedb7]" : "bg-white/40 text-black/35 dark:bg-white/[0.05] dark:text-white/35"}`}>
                          <MapPin size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{place.short_name ?? place.name}</p>
                          <p className="mt-0.5 text-xs text-black/35 dark:text-white/30">{formatCategory(place.category)}</p>
                        </div>
                        <ChevronRight size={16} className="text-black/20 dark:text-white/20" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function RouteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[17px] border border-white/45 bg-white/38 p-3 backdrop-blur-xl dark:border-white/[0.05] dark:bg-white/[0.035]">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/30 dark:text-white/25">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function MessageBanner({ message, onClose }: { type: "error"; message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-4 flex items-start justify-between gap-3 rounded-[18px] border border-red-500/10 bg-red-500/[0.08] px-4 py-3 backdrop-blur-xl"
    >
      <p className="text-xs leading-5 text-red-700 dark:text-red-300">{message}</p>
      <button type="button" onClick={onClose}><X size={15} /></button>
    </motion.div>
  );
}

function MapLoading() {
  return (
    <div className="mt-6 flex min-h-[520px] items-center justify-center rounded-[32px] border border-white/55 bg-white/40 shadow-[0_20px_60px_rgba(20,63,42,0.08)] backdrop-blur-[24px] dark:border-white/[0.07] dark:bg-white/[0.03]">
      <div className="text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#34734a] dark:text-[#8ce6ad]" />
        <p className="mt-3 text-xs font-bold">Loading campus map...</p>
      </div>
    </div>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatDistance(kilometers: number) {
  if (kilometers < 1) return `${Math.round(kilometers * 1000)} m`;
  return `${kilometers.toFixed(1)} km`;
}

function formatCategory(category: PlaceCategory) {
  const labels: Record<PlaceCategory, string> = {
    academic: "Academic",
    study: "Study",
    health: "Health",
    food: "Food",
    services: "Services",
    support: "Support",
    sports: "Sports",
    hostel: "Hostel",
    religious: "Religious",
    transport: "Transport",
    other: "Other",
  };

  return labels[category];
}
