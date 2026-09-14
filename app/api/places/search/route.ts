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

function normalizeQuery(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  const compact = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (compact.includes("tiafrancis") || compact.includes("tifrancis")) {
    return "T I Francis Auditorium";
  }

  return cleaned;
}

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q") ?? "";
  const query = normalizeQuery(rawQuery);

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const params = new URLSearchParams({
    q: `${query}, Federal University of Technology Akure`,
    format: "jsonv2",
    addressdetails: "1",
    limit: "7",
    bounded: "1",
    viewbox: FUTA_VIEWBOX,
  });

  try {
    let response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "FUTAGO campus companion venue search",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    let data = (response.ok ? await response.json() : []) as NominatimResult[];

    if (!data.length) {
      const fallback = new URLSearchParams({
        q: query,
        format: "jsonv2",
        addressdetails: "1",
        limit: "7",
        bounded: "1",
        viewbox: FUTA_VIEWBOX,
      });

      response = await fetch(`https://nominatim.openstreetmap.org/search?${fallback.toString()}`, {
        headers: {
          "User-Agent": "FUTAGO campus companion venue search",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });

      data = (response.ok ? await response.json() : []) as NominatimResult[];
    }

    const results = data.map((item) => ({
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
