import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  category?: string;
};

const FUTA_VIEWBOX = "5.108,7.329,5.165,7.274";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

function cleanQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function expandQuery(value: string) {
  const cleaned = cleanQuery(value);
  const normalized = compact(cleaned);

  if (normalized.includes("tiafrancis") || normalized.includes("tifrancis")) {
    return "T I Francis Auditorium";
  }

  if (normalized.includes("multipurposehall") || normalized.includes("multipurpose")) {
    return "Multipurpose Hall";
  }

  if (normalized.includes("obafemihall") || normalized === "obafemi") {
    return "Obafemi Hall";
  }

  if (normalized.includes("lecturetheatre") || normalized.includes("lecturehall")) {
    return cleaned
      .replace(/lecture\s*theatre/gi, "Lecture Theatre")
      .replace(/lecture\s*hall/gi, "Lecture Hall");
  }

  return cleaned;
}

function queryVariants(raw: string) {
  const base = expandQuery(raw);
  const variants = [
    `${base}, Federal University of Technology Akure`,
    `${base}, FUTA, Akure`,
    `${base}, Obanla, Akure`,
    `${base}, Obakekere, Akure`,
    base,
  ];

  return [...new Set(variants.map(cleanQuery).filter(Boolean))];
}

async function nominatimSearch(query: string, bounded: boolean) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    namedetails: "1",
    limit: "10",
    viewbox: FUTA_VIEWBOX,
  });

  if (bounded) params.set("bounded", "1");

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": "FUTAGO campus companion venue search",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return [] as NominatimResult[];
  return (await response.json()) as NominatimResult[];
}

function withinFutaArea(item: NominatimResult) {
  const lat = Number(item.lat);
  const lon = Number(item.lon);

  return lat >= 7.26 && lat <= 7.34 && lon >= 5.09 && lon <= 5.18;
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const query = cleanQuery(rawQuery);

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const collected: NominatimResult[] = [];
    const seen = new Set<number>();

    for (const variant of queryVariants(query)) {
      const boundedResults = await nominatimSearch(variant, true);

      for (const item of boundedResults) {
        if (!seen.has(item.place_id)) {
          seen.add(item.place_id);
          collected.push(item);
        }
      }

      if (collected.length >= 8) break;
    }

    if (collected.length < 4) {
      for (const variant of queryVariants(query).slice(0, 3)) {
        const broaderResults = await nominatimSearch(variant, false);

        for (const item of broaderResults) {
          if (!withinFutaArea(item) || seen.has(item.place_id)) continue;
          seen.add(item.place_id);
          collected.push(item);
        }

        if (collected.length >= 8) break;
      }
    }

    const results = collected.slice(0, 10).map((item) => ({
      id: `osm-${item.place_id}`,
      name: item.name || item.display_name.split(",")[0] || "Campus location",
      subtitle: item.display_name,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      category: item.type || item.category || "location",
      source: "openstreetmap" as const,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
