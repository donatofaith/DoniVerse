"use client";

import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import "leaflet/dist/leaflet.css";

type PlacePinPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
};

const DEFAULT_CENTER: [number, number] = [7.303, 5.137];

export default function PlacePinPicker({ latitude, longitude, onChange }: PlacePinPickerProps) {
  const position: [number, number] = [
    Number.isFinite(latitude) ? latitude : DEFAULT_CENTER[0],
    Number.isFinite(longitude) ? longitude : DEFAULT_CENTER[1],
  ];

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: '<div style="width:28px;height:28px;border-radius:999px;background:#2f7a4d;border:4px solid white;box-shadow:0 8px 24px rgba(17,55,33,.35)"></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-[22px] border border-white/60 shadow-inner dark:border-white/10">
      <MapContainer center={position} zoom={16} scrollWheelZoom className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        <Marker
          position={position}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const point = marker.getLatLng();
              onChange(point.lat, point.lng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onChange }: { onChange: (latitude: number, longitude: number) => void }) {
  useMapEvents({
    click: (event) => onChange(event.latlng.lat, event.latlng.lng),
  });
  return null;
}
