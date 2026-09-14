"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import L, {
  LatLngBoundsExpression,
} from "leaflet";

import "leaflet/dist/leaflet.css";

export type MapPlace = {
  id: number;
  name: string;
  slug: string;
  category: string;
  short_name: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  building_name: string | null;
  floor: string | null;
  is_featured: boolean;
  is_verified: boolean;
  is_active: boolean;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type FutaMapProps = {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;

  userLocation: UserLocation | null;

  routeCoordinates: [number, number][];

  focusUserRequest: number;
};

const FUTA_CENTER: [number, number] = [
  7.303,
  5.137,
];

export default function FutaMap({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  routeCoordinates,
  focusUserRequest,
}: FutaMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={FUTA_CENTER}
        zoom={15}
        minZoom={13}
        maxZoom={20}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedPlace={selectedPlace}
          userLocation={userLocation}
          routeCoordinates={routeCoordinates}
          focusUserRequest={focusUserRequest}
        />

        {routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 0.85,
                lineCap: "round",
                lineJoin: "round",
              }}
            />

            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#187a43",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {userLocation && (
          <Marker
            position={[
              userLocation.latitude,
              userLocation.longitude,
            ]}
            icon={createUserIcon()}
            zIndexOffset={1000}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -24]}
              opacity={1}
              className="futago-you-are-here-tooltip"
            >
              You are here
            </Tooltip>
          </Marker>
        )}

        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={
              selectedPlace?.id === place.id
            }
            onSelect={() =>
              onSelectPlace(place)
            }
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] rounded-[32px] ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]" />
    </div>
  );
}

function MapController({
  selectedPlace,
  userLocation,
  routeCoordinates,
  focusUserRequest,
}: {
  selectedPlace: MapPlace | null;

  userLocation: UserLocation | null;

  routeCoordinates: [number, number][];

  focusUserRequest: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 1) {
      const bounds: LatLngBoundsExpression =
        routeCoordinates;

      map.fitBounds(bounds, {
        padding: [55, 55],
        maxZoom: 18,
        animate: true,
        duration: 1,
      });

      return;
    }

    if (!selectedPlace) {
      return;
    }

    map.flyTo(
      [
        selectedPlace.latitude,
        selectedPlace.longitude,
      ],
      Math.max(map.getZoom(), 17),
      {
        animate: true,
        duration: 1,
      }
    );
  }, [
    selectedPlace,
    routeCoordinates,
    map,
  ]);

  useEffect(() => {
    if (
      !userLocation ||
      focusUserRequest === 0
    ) {
      return;
    }

    map.flyTo(
      [
        userLocation.latitude,
        userLocation.longitude,
      ],
      18,
      {
        animate: true,
        duration: 0.9,
      }
    );
  }, [
    focusUserRequest,
    userLocation,
    map,
  ]);

  return null;
}

function PlaceMarker({
  place,
  selected,
  onSelect,
}: {
  place: MapPlace;
  selected: boolean;
  onSelect: () => void;
}) {
  const icon = useMemo(
    () =>
      createPlaceIcon(
        selected,
        place.is_verified
      ),
    [
      selected,
      place.is_verified,
    ]
  );

  return (
    <Marker
      position={[
        place.latitude,
        place.longitude,
      ]}
      icon={icon}
      eventHandlers={{
        click: onSelect,
      }}
    >
      <Popup
        closeButton={false}
        offset={[0, -10]}
        className="futago-place-popup"
      >
        <div className="min-w-[190px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#4a8b61] dark:text-[#8ce6ad]">
            {formatCategory(
              place.category
            )}
          </p>

          <p className="mt-2 text-[15px] font-black leading-tight text-[#102017] dark:text-white">
            {place.short_name ??
              place.name}
          </p>

          {place.short_name && (
            <p className="mt-1.5 text-xs leading-5 text-black/50 dark:text-white/45">
              {place.name}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {place.is_verified ? (
              <span className="rounded-full bg-[#173f2a] px-2.5 py-1 text-[10px] font-bold text-white dark:bg-[#8ce6ad] dark:text-[#082013]">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-[#e7c75b]/15 px-2.5 py-1 text-[10px] font-bold text-[#795f13] dark:text-[#e5cd74]">
                Candidate location
              </span>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function createPlaceIcon(
  selected: boolean,
  verified: boolean
) {
  const selectedClass = selected
    ? "futago-marker-selected"
    : "";

  const verifiedClass = verified
    ? "futago-marker-verified"
    : "";

  return L.divIcon({
    className: "",
    html: `
      <div class="futago-marker ${selectedClass} ${verifiedClass}">
        ${
          selected
            ? '<span class="futago-marker-pulse"></span>'
            : ""
        }

        <div class="futago-marker-pin">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 38],
    popupAnchor: [0, -38],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="futago-user-location">
        <span class="futago-user-location-wave"></span>

        <span class="futago-user-location-dot">
          <span></span>
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function formatCategory(
  category: string
) {
  return category
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}