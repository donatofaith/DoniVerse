import { NextRequest, NextResponse } from "next/server";

type RouteRequestBody = {
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
};

type ValhallaManeuver = {
  instruction?: string;
  verbal_pre_transition_instruction?: string;
  length?: number;
  time?: number;
  type?: number;
};

type ValhallaLeg = {
  shape?: string;
  maneuver?: ValhallaManeuver[];
};

type ValhallaResponse = {
  trip?: {
    summary?: {
      time?: number;
      length?: number;
    };
    legs?: ValhallaLeg[];
  };
  error?: string;
  error_code?: number;
  status_message?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RouteRequestBody;

    const {
      startLat,
      startLng,
      endLat,
      endLng,
    } = body;

    if (
      !isValidCoordinate(startLat, -90, 90) ||
      !isValidCoordinate(endLat, -90, 90) ||
      !isValidCoordinate(startLng, -180, 180) ||
      !isValidCoordinate(endLng, -180, 180)
    ) {
      return NextResponse.json(
        {
          error: "Invalid route coordinates.",
        },
        {
          status: 400,
        }
      );
    }

    const routingResponse = await fetch(
      "https://valhalla1.openstreetmap.de/route",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Id": "futago",
        },
        body: JSON.stringify({
          locations: [
            {
              lat: startLat,
              lon: startLng,
              type: "break",
            },
            {
              lat: endLat,
              lon: endLng,
              type: "break",
            },
          ],
          costing: "pedestrian",
          units: "kilometers",
          language: "en-US",
          directions_type: "instructions",
          shape_format: "polyline6",
        }),
        cache: "no-store",
      }
    );

    const routingData =
      (await routingResponse.json()) as ValhallaResponse;

    if (!routingResponse.ok || !routingData.trip) {
      console.error("Valhalla error:", routingData);

      return NextResponse.json(
        {
          error:
            "A walking route could not be calculated for these locations.",
        },
        {
          status: 502,
        }
      );
    }

    const legs = routingData.trip.legs ?? [];

    const coordinates: [number, number][] = [];

    const maneuvers: {
      instruction: string;
      distanceKm: number;
      timeSeconds: number;
    }[] = [];

    for (const leg of legs) {
      if (leg.shape) {
        const decoded = decodePolyline6(leg.shape);

        if (coordinates.length > 0 && decoded.length > 0) {
          decoded.shift();
        }

        coordinates.push(...decoded);
      }

      for (const maneuver of leg.maneuver ?? []) {
        const instruction =
          maneuver.instruction ??
          maneuver.verbal_pre_transition_instruction;

        if (!instruction) {
          continue;
        }

        maneuvers.push({
          instruction,
          distanceKm: maneuver.length ?? 0,
          timeSeconds: maneuver.time ?? 0,
        });
      }
    }

    if (coordinates.length < 2) {
      return NextResponse.json(
        {
          error:
            "The routing service returned an incomplete walking route.",
        },
        {
          status: 502,
        }
      );
    }

    const summary = routingData.trip.summary;

    return NextResponse.json({
      route: coordinates,
      distanceKm: summary?.length ?? 0,
      durationSeconds: summary?.time ?? 0,
      maneuvers,
    });
  } catch (error) {
    console.error("Walking route error:", error);

    return NextResponse.json(
      {
        error:
          "FUTAGO could not calculate the walking route right now.",
      },
      {
        status: 500,
      }
    );
  }
}

function isValidCoordinate(
  value: number | undefined,
  min: number,
  max: number
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function decodePolyline6(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];

  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const latitudeResult = decodeValue(encoded, index);

    index = latitudeResult.nextIndex;
    latitude += latitudeResult.value;

    const longitudeResult = decodeValue(encoded, index);

    index = longitudeResult.nextIndex;
    longitude += longitudeResult.value;

    coordinates.push([
      latitude / 1_000_000,
      longitude / 1_000_000,
    ]);
  }

  return coordinates;
}

function decodeValue(encoded: string, startIndex: number) {
  let result = 0;
  let shift = 0;
  let index = startIndex;
  let byte: number;

  do {
    byte = encoded.charCodeAt(index++) - 63;

    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20 && index < encoded.length);

  const value =
    result & 1
      ? ~(result >> 1)
      : result >> 1;

  return {
    value,
    nextIndex: index,
  };
}