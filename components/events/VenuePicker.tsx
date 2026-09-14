"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Search, X } from "lucide-react";

import { supabase } from "@/lib/supabase/client";

export type CampusVenue = {
  id: number;
  name: string;
  short_name: string | null;
  building_name: string | null;
  category: string;
};

type VenuePickerProps = {
  value: string;
  selectedPlaceId: number | null;
  onChange: (value: string) => void;
  onSelect: (place: CampusVenue) => void;
  onClearSelection: () => void;
  label?: string;
};

function searchableText(place: CampusVenue) {
  return `${place.name} ${place.short_name ?? ""} ${place.building_name ?? ""} ${place.category}`.toLowerCase();
}

export default function VenuePicker({
  value,
  selectedPlaceId,
  onChange,
  onSelect,
  onClearSelection,
  label = "Venue",
}: VenuePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<CampusVenue[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      const { data } = await supabase
        .from("places")
        .select("id,name,short_name,building_name,category")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("name", { ascending: true });

      if (cancelled) return;
      setPlaces((data ?? []) as CampusVenue[]);
      setLoading(false);
    }

    void loadPlaces();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return places.slice(0, 6);

    return places
      .filter((place) => searchableText(place).includes(query))
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(query) ? 0 : 1;
        const bStarts = bName.startsWith(query) ? 0 : 1;
        return aStarts - bStarts || aName.localeCompare(bName);
      })
      .slice(0, 7);
  }, [places, value]);

  const selectedPlace = selectedPlaceId
    ? places.find((place) => place.id === selectedPlaceId) ?? null
    : null;

  return (
    <label className="block" ref={rootRef}>
      <span className="text-sm font-bold text-black/60 dark:text-white/60">{label}</span>

      <div className="relative mt-2">
        <div className="flex min-h-[54px] items-center gap-3 rounded-[16px] border border-white/65 bg-white/48 px-4 backdrop-blur-xl focus-within:border-[#69a87f]/60 dark:border-white/10 dark:bg-[#101914]/70">
          <Search size={17} className="shrink-0 text-black/35 dark:text-white/35" />
          <input
            value={value}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              onChange(event.target.value);
              if (selectedPlaceId) onClearSelection();
              setOpen(true);
            }}
            placeholder="Start typing a campus location..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-black/28 dark:text-white dark:placeholder:text-white/25"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                onClearSelection();
                setOpen(true);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/35 dark:text-white/35"
              aria-label="Clear venue"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {selectedPlace && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black text-emerald-800 dark:text-emerald-200">
            <Check size={13} /> Linked to FUTAGO map
          </div>
        )}

        {open && (
          <div className="absolute left-0 right-0 top-[62px] z-[80] max-h-[300px] overflow-y-auto rounded-[20px] border border-white/70 bg-white/95 p-2 shadow-[0_22px_70px_rgba(16,46,28,0.20)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#09130e]/96">
            {loading ? (
              <p className="px-3 py-4 text-sm font-semibold text-black/45 dark:text-white/45">Loading campus locations...</p>
            ) : suggestions.length ? (
              suggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    onSelect(place);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-[15px] px-3 py-3 text-left transition hover:bg-[#e7f3ea] dark:hover:bg-white/[0.06]"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#dff3e5] text-[#2f6947] dark:bg-[#8ce6ad]/12 dark:text-[#a9efc1]">
                    <MapPin size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#102017] dark:text-white">{place.name}</p>
                    <p className="mt-0.5 truncate text-xs text-black/42 dark:text-white/38">
                      {[place.short_name, place.building_name, place.category]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4">
                <p className="text-sm font-bold">No mapped location found.</p>
                <p className="mt-1 text-xs leading-5 text-black/42 dark:text-white/38">
                  You can keep the typed venue, but it will not be linked to a FUTAGO map location.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </label>
  );
}
