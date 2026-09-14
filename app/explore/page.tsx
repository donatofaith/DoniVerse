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

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";

import type {
  MapPlace,
  UserLocation,
} from "@/components/explore/FutaMap";

const FutaMap = dynamic(
  () => import("@/components/explore/FutaMap"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

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

type Place = MapPlace & {
  category: PlaceCategory;
};

type CategoryFilter =
  | "all"
  | PlaceCategory;

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

const categories: {
  label: string;
  value: CategoryFilter;
  icon: React.ElementType;
}[] = [
  {
    label: "All",
    value: "all",
    icon: Compass,
  },
  {
    label: "Academic",
    value: "academic",
    icon: Building2,
  },
  {
    label: "Study",
    value: "study",
    icon: Library,
  },
  {
    label: "Health",
    value: "health",
    icon: ShieldPlus,
  },
  {
    label: "Food",
    value: "food",
    icon: UtensilsCrossed,
  },
  {
    label: "Services",
    value: "services",
    icon: GraduationCap,
  },
  {
    label: "Support",
    value: "support",
    icon: HeartHandshake,
  },
  {
    label: "Transport",
    value: "transport",
    icon: Bus,
  },
  {
    label: "Sports",
    value: "sports",
    icon: Dumbbell,
  },
  {
    label: "Hostels",
    value: "hostel",
    icon: BedDouble,
  },
  {
    label: "Religious",
    value: "religious",
    icon: Church,
  },
];

export default function ExplorePage() {
  const router = useRouter();

  const reduceMotion =
    useReducedMotion();

  const [places, setPlaces] =
    useState<Place[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState<CategoryFilter>("all");

  const [
    selectedPlace,
    setSelectedPlace,
  ] =
    useState<Place | null>(null);

  const [
    userLocation,
    setUserLocation,
  ] =
    useState<UserLocation | null>(null);

  const [
    locationLoading,
    setLocationLoading,
  ] =
    useState(false);

  const [
    locationError,
    setLocationError,
  ] =
    useState("");

  const [
    focusUserRequest,
    setFocusUserRequest,
  ] =
    useState(0);

  const [
    walkingRoute,
    setWalkingRoute,
  ] =
    useState<WalkingRoute | null>(null);

  const [
    routeLoading,
    setRouteLoading,
  ] =
    useState(false);

  const [
    routeError,
    setRouteError,
  ] =
    useState("");

  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true);
      setLoadError("");

      const {
        data,
        error,
      } = await supabase
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
        .eq(
          "is_active",
          true
        )
        .order(
          "is_featured",
          {
            ascending: false,
          }
        )
        .order("name", {
          ascending: true,
        });

      if (error) {
        console.error(error);

        setLoadError(
          "FUTAGO could not load campus places right now."
        );

        setLoading(false);
        return;
      }

      const loaded =
        (data as Place[] | null) ??
        [];

      setPlaces(loaded);

      if (loaded.length > 0) {
        setSelectedPlace(
          loaded.find(
            (place) =>
              place.is_featured
          ) ?? loaded[0]
        );
      }

      setLoading(false);
    };

    loadPlaces();
  }, []);

  const filteredPlaces =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return places.filter(
        (place) => {
          const categoryMatch =
            activeCategory ===
              "all" ||
            place.category ===
              activeCategory;

          const searchMatch =
            !query ||
            place.name
              .toLowerCase()
              .includes(query) ||
            (
              place.short_name ??
              ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              place.building_name ??
              ""
            )
              .toLowerCase()
              .includes(query) ||
            place.category
              .toLowerCase()
              .includes(query);

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      places,
      search,
      activeCategory,
    ]);

  useEffect(() => {
    if (
      selectedPlace &&
      !filteredPlaces.some(
        (place) =>
          place.id ===
          selectedPlace.id
      )
    ) {
      setSelectedPlace(
        filteredPlaces[0] ??
          null
      );
    }

    if (
      !selectedPlace &&
      filteredPlaces.length >
        0
    ) {
      setSelectedPlace(
        filteredPlaces[0]
      );
    }
  }, [
    filteredPlaces,
    selectedPlace,
  ]);

  useEffect(() => {
    setWalkingRoute(null);
    setRouteError("");
  }, [selectedPlace?.id]);

  const requestLocation =
    useCallback(
      () =>
        new Promise<UserLocation>(
          (resolve, reject) => {
            if (
              typeof navigator ===
                "undefined" ||
              !navigator.geolocation
            ) {
              reject(
                new Error(
                  "Location is not supported by this browser."
                )
              );

              return;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude:
                    position.coords
                      .latitude,

                  longitude:
                    position.coords
                      .longitude,

                  accuracy:
                    position.coords
                      .accuracy,
                });
              },

              (error) => {
                if (
                  error.code ===
                  error.PERMISSION_DENIED
                ) {
                  reject(
                    new Error(
                      "Location permission was denied. Allow location access in your browser to use campus navigation."
                    )
                  );

                  return;
                }

                if (
                  error.code ===
                  error.POSITION_UNAVAILABLE
                ) {
                  reject(
                    new Error(
                      "Your current location could not be determined."
                    )
                  );

                  return;
                }

                if (
                  error.code ===
                  error.TIMEOUT
                ) {
                  reject(
                    new Error(
                      "Finding your location took too long. Please try again."
                    )
                  );

                  return;
                }

                reject(
                  new Error(
                    "FUTAGO could not access your location."
                  )
                );
              },

              {
                enableHighAccuracy:
                  true,

                timeout: 12000,

                maximumAge: 30000,
              }
            );
          }
        ),
      []
    );

  const handleLocateMe =
    async () => {
      if (userLocation) {
        setFocusUserRequest(
          (value) => value + 1
        );

        return;
      }

      setLocationLoading(true);
      setLocationError("");

      try {
        const location =
          await requestLocation();

        setUserLocation(
          location
        );

        setFocusUserRequest(
          (value) => value + 1
        );
      } catch (error) {
        setLocationError(
          error instanceof Error
            ? error.message
            : "FUTAGO could not access your location."
        );
      } finally {
        setLocationLoading(false);
      }
    };

  const handleDirections =
    async () => {
      if (!selectedPlace) {
        return;
      }

      setRouteLoading(true);
      setRouteError("");
      setLocationError("");

      try {
        let location =
          userLocation;

        if (!location) {
          setLocationLoading(
            true
          );

          location =
            await requestLocation();

          setUserLocation(
            location
          );

          setLocationLoading(
            false
          );
        }

        const response =
          await fetch(
            "/api/route/walking",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                startLat:
                  location.latitude,

                startLng:
                  location.longitude,

                endLat:
                  selectedPlace.latitude,

                endLng:
                  selectedPlace.longitude,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Walking route unavailable."
          );
        }

        setWalkingRoute(
          data as WalkingRoute
        );
      } catch (error) {
        setRouteError(
          error instanceof Error
            ? error.message
            : "FUTAGO could not calculate this route."
        );
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
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3ed] text-[#102017] dark:bg-[#061009] dark:text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-[1280px] px-4 pb-10 pt-4 sm:px-6 md:px-8 lg:px-10">
        <AmbientBackground />

        <header className="relative z-30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.055] bg-white/80 text-[#183624] shadow-sm backdrop-blur-xl transition hover:scale-[1.03] dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-white"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#123f29] text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
              <Map size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-lg font-black tracking-[-0.045em]">
                Explore FUTA
              </p>

              <p className="truncate text-[11px] text-black/40 dark:text-white/35">
                Find places and know where to go.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{
              scale: 0.94,
            }}
            type="button"
            onClick={
              handleLocateMe
            }
            disabled={
              locationLoading
            }
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm backdrop-blur-xl transition ${
              userLocation
                ? "border-[#52a971]/20 bg-[#daf5e3] text-[#176238] dark:border-[#8ce6ad]/20 dark:bg-[#8ce6ad] dark:text-[#082013]"
                : "border-black/[0.055] bg-white/80 text-[#265d3d] dark:border-white/[0.08] dark:bg-white/[0.055] dark:text-[#8ce6ad]"
            }`}
          >
            {locationLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <LocateFixed
                size={18}
              />
            )}
          </motion.button>
        </header>

        <section className="relative z-20 mt-7">
          <p className="text-sm font-bold text-[#34734a] dark:text-[#8ce6ad]">
            Campus navigation
          </p>

          <h1 className="mt-2 max-w-2xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[48px] md:text-[56px]">
            Find what you need.

            <span className="block text-[#326d49] dark:text-[#91eab0]">
              Then find your way.
            </span>
          </h1>

          <AnimatePresence>
            {locationError && (
              <MessageBanner
                type="error"
                message={
                  locationError
                }
                onClose={() =>
                  setLocationError(
                    ""
                  )
                }
              />
            )}

            {routeError && (
              <MessageBanner
                type="error"
                message={
                  routeError
                }
                onClose={() =>
                  setRouteError("")
                }
              />
            )}
          </AnimatePresence>

          <div className="mt-6 flex min-h-[62px] items-center gap-3 rounded-[22px] border border-black/[0.055] bg-white/85 px-4 backdrop-blur-xl dark:border-white/[0.075] dark:bg-white/[0.045]">
            <Search
              size={18}
              className="shrink-0 text-[#336f49] dark:text-[#8ce6ad]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search departments, offices, halls..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/30 dark:placeholder:text-white/25"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                <Cross
                  size={16}
                />
              </button>
            )}
          </div>

          <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {categories.map(
              (category) => {
                const Icon =
                  category.icon;

                const active =
                  activeCategory ===
                  category.value;

                return (
                  <motion.button
                    key={
                      category.value
                    }
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category.value
                      )
                    }
                    className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-bold ${
                      active
                        ? "border-[#286d45]/20 bg-[#173f2a] text-white dark:bg-[#8ce6ad] dark:text-[#082013]"
                        : "border-black/[0.05] bg-white/70 text-black/45 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/40"
                    }`}
                  >
                    <Icon
                      size={15}
                    />

                    {
                      category.label
                    }
                  </motion.button>
                );
              }
            )}
          </div>
        </section>

        {loading ? (
          <MapLoading />
        ) : loadError ? (
          <div className="mt-6 rounded-[28px] bg-red-500/10 p-6 text-sm text-red-600">
            {loadError}
          </div>
        ) : (
          <section className="relative z-10 mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-black/[0.05] bg-[#dfe8dc] shadow-[0_22px_70px_rgba(24,54,35,0.08)] dark:border-white/[0.07] dark:bg-[#0d1a12] sm:min-h-[620px] lg:min-h-[690px]">
              <FutaMap
                places={
                  filteredPlaces
                }
                selectedPlace={
                  selectedPlace
                }
                onSelectPlace={
                  setSelectedPlace
                }
                userLocation={
                  userLocation
                }
                routeCoordinates={
                  walkingRoute?.route ??
                  []
                }
                focusUserRequest={
                  focusUserRequest
                }
              />

              <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-[18px] border border-white/40 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#08150e]/85">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/35 dark:text-white/30">
                  {walkingRoute
                    ? "Walking route"
                    : "Live campus map"}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3d9d61]" />

                  <span className="text-xs font-bold">
                    {walkingRoute
                      ? `${formatDistance(
                          walkingRoute.distanceKm
                        )} · ${formatDuration(
                          walkingRoute.durationSeconds
                        )}`
                      : `${filteredPlaces.length} locations`}
                  </span>
                </div>
              </div>

              {walkingRoute && (
                <button
                  type="button"
                  onClick={
                    clearRoute
                  }
                  className="absolute right-4 top-4 z-[500] flex h-10 items-center gap-2 rounded-full border border-white/40 bg-white/90 px-4 text-xs font-bold shadow-lg backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#08150e]/90"
                >
                  <X size={14} />
                  End route
                </button>
              )}
            </div>

            <div className="space-y-4">
              {selectedPlace && (
                <div className="rounded-[28px] border border-black/[0.05] bg-white/85 p-5 backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.045]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#eaf4ec] text-[#30744a] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                      <MapPin
                        size={20}
                      />
                    </div>

                    {selectedPlace.is_verified ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-[#e7f5eb] px-3 py-1.5 text-[10px] font-bold text-[#267146] dark:bg-[#8ce6ad]/10 dark:text-[#8ce6ad]">
                        <CheckCircle2
                          size={12}
                        />
                        Verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#d0ae4b]/10 px-3 py-1.5 text-[10px] font-bold text-[#82691f] dark:text-[#e2c96d]">
                        Candidate
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#397451] dark:text-[#8ce6ad]">
                    {formatCategory(
                      selectedPlace.category
                    )}
                  </p>

                  <h2 className="mt-2 text-[26px] font-black leading-[1.02] tracking-[-0.045em]">
                    {
                      selectedPlace.name
                    }
                  </h2>

                  {selectedPlace.description && (
                    <p className="mt-4 text-sm leading-6 text-black/45 dark:text-white/40">
                      {
                        selectedPlace.description
                      }
                    </p>
                  )}

                  {walkingRoute && (
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <RouteMetric
                        label="Walking time"
                        value={formatDuration(
                          walkingRoute.durationSeconds
                        )}
                      />

                      <RouteMetric
                        label="Distance"
                        value={formatDistance(
                          walkingRoute.distanceKm
                        )}
                      />
                    </div>
                  )}

                  <motion.button
                    whileTap={{
                      scale: 0.985,
                    }}
                    type="button"
                    disabled={
                      routeLoading ||
                      locationLoading
                    }
                    onClick={
                      handleDirections
                    }
                    className="mt-5 flex min-h-[58px] w-full items-center justify-between rounded-[19px] bg-[#123f29] px-5 text-left text-white disabled:opacity-60 dark:bg-[#8ce6ad] dark:text-[#082013]"
                  >
                    <div>
                      <p className="text-sm font-extrabold">
                        {routeLoading
                          ? "Finding your route..."
                          : walkingRoute
                            ? "Refresh route"
                            : "Get directions"}
                      </p>

                      <p className="mt-0.5 text-xs text-white/55 dark:text-[#082013]/55">
                        {userLocation
                          ? "Walk from your current location"
                          : "Uses your location only after permission"}
                      </p>
                    </div>

                    {routeLoading ||
                    locationLoading ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Navigation
                        size={18}
                      />
                    )}
                  </motion.button>
                </div>
              )}

              {walkingRoute &&
                walkingRoute.maneuvers.length >
                  0 && (
                  <div className="rounded-[28px] border border-black/[0.05] bg-white/75 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">
                    <div className="flex items-center gap-2">
                      <Route
                        size={17}
                        className="text-[#33734a] dark:text-[#8ce6ad]"
                      />

                      <h3 className="text-sm font-black">
                        Walking directions
                      </h3>
                    </div>

                    <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto">
                      {walkingRoute.maneuvers.map(
                        (
                          maneuver,
                          index
                        ) => (
                          <div
                            key={`${maneuver.instruction}-${index}`}
                            className="flex gap-3 rounded-[17px] bg-black/[0.025] p-3 dark:bg-white/[0.035]"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173f2a] text-[10px] font-black text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
                              {index +
                                1}
                            </div>

                            <div>
                              <p className="text-xs font-semibold leading-5">
                                {
                                  maneuver.instruction
                                }
                              </p>

                              {maneuver.distanceKm >
                                0 && (
                                <p className="mt-1 text-[10px] text-black/35 dark:text-white/30">
                                  {formatDistance(
                                    maneuver.distanceKm
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              <div className="rounded-[28px] border border-black/[0.05] bg-white/70 p-4 dark:border-white/[0.07] dark:bg-white/[0.035]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#397351] dark:text-[#8ce6ad]">
                      Campus places
                    </p>

                    <h3 className="mt-1 text-lg font-black">
                      Explore nearby
                    </h3>
                  </div>

                  <Sparkles
                    size={18}
                    className="text-[#c59b2c]"
                  />
                </div>

                <div className="mt-4 max-h-[390px] space-y-2 overflow-y-auto">
                  {filteredPlaces.map(
                    (place) => {
                      const active =
                        selectedPlace?.id ===
                        place.id;

                      return (
                        <button
                          key={
                            place.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedPlace(
                              place
                            )
                          }
                          className={`group flex w-full items-center gap-3 rounded-[18px] p-3 text-left ${
                            active
                              ? "bg-[#edf6ef] dark:bg-[#8ce6ad]/10"
                              : "hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
                              active
                                ? "bg-[#173f2a] text-white dark:bg-[#8ce6ad] dark:text-[#082013]"
                                : "bg-black/[0.04] text-black/35 dark:bg-white/[0.05] dark:text-white/35"
                            }`}
                          >
                            <MapPin
                              size={17}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {place.short_name ??
                                place.name}
                            </p>

                            <p className="mt-0.5 text-xs text-black/35 dark:text-white/30">
                              {formatCategory(
                                place.category
                              )}
                            </p>
                          </div>

                          <ChevronRight
                            size={16}
                            className="text-black/20 dark:text-white/20"
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function RouteMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[17px] bg-black/[0.025] p-3 dark:bg-white/[0.04]">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/30 dark:text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}

function MessageBanner({
  message,
  onClose,
}: {
  type: "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -5,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      className="mt-4 flex items-start justify-between gap-3 rounded-[18px] border border-red-500/10 bg-red-500/[0.07] px-4 py-3"
    >
      <p className="text-xs leading-5 text-red-700 dark:text-red-300">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}

function MapLoading() {
  return (
    <div className="mt-6 flex min-h-[520px] items-center justify-center rounded-[32px] bg-[#dfe8dc] dark:bg-[#0d1a12]">
      <div className="text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#34734a] dark:text-[#8ce6ad]" />

        <p className="mt-3 text-xs font-bold">
          Loading campus map...
        </p>
      </div>
    </div>
  );
}

function formatDuration(
  seconds: number
) {
  const minutes = Math.max(
    1,
    Math.round(seconds / 60)
  );

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainder =
    minutes % 60;

  return remainder
    ? `${hours}h ${remainder}m`
    : `${hours}h`;
}

function formatDistance(
  kilometers: number
) {
  if (kilometers < 1) {
    return `${Math.round(
      kilometers * 1000
    )} m`;
  }

  return `${kilometers.toFixed(
    1
  )} km`;
}

function formatCategory(
  category: PlaceCategory
) {
  const labels: Record<
    PlaceCategory,
    string
  > = {
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

function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-32 top-16 h-[320px] w-[320px] rounded-full bg-[#7edc9e]/[0.055] blur-[100px]" />

      <div className="absolute -left-32 top-[620px] h-[320px] w-[320px] rounded-full bg-[#e4c45d]/[0.045] blur-[100px]" />
    </div>
  );
}