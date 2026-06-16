import { NextRequest, NextResponse } from "next/server";

/**
 * Returns the OpenStreetMap building footprint nearest a clicked point, via the
 * Overpass API. Free, keyless, real geometry. Coverage of new NZ subdivisions
 * is patchy — callers fall back to an approximate boundary when `found` is false.
 */
export const dynamic = "force-dynamic";

type Ring = [number, number][];
interface OverpassWay {
  type: string;
  geometry?: { lat: number; lon: number }[];
  tags?: Record<string, string>;
}

function centroid(ring: Ring): [number, number] {
  const lat = ring.reduce((a, p) => a + p[0], 0) / ring.length;
  const lng = ring.reduce((a, p) => a + p[1], 0) / ring.length;
  return [lat, lng];
}

function pointInPoly([x, y]: [number, number], ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const query = `[out:json][timeout:20];way(around:80,${lat},${lng})["building"];out geom;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass returns 406 without an identifying User-Agent.
        "User-Agent": "ConstructionOS/0.1 (construction platform; contact@construction-os.app)",
      },
      body: "data=" + encodeURIComponent(query),
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json({ found: false, error: `overpass ${res.status}` }, { status: 502 });

    const data = (await res.json()) as { elements?: OverpassWay[] };
    const polys = (data.elements ?? [])
      .filter((e) => e.type === "way" && e.geometry)
      .map((w) => ({ ring: (w.geometry ?? []).map((g) => [g.lat, g.lon] as [number, number]), name: w.tags?.name ?? null }))
      .filter((p) => p.ring.length >= 3);

    if (polys.length === 0) return NextResponse.json({ found: false });

    const pt: [number, number] = [lat, lng];
    let chosen = polys.find((p) => pointInPoly(pt, p.ring));
    if (!chosen) {
      let bestD = Infinity;
      for (const p of polys) {
        const [cy, cx] = centroid(p.ring);
        const d = (cy - lat) ** 2 + (cx - lng) ** 2;
        if (d < bestD) {
          bestD = d;
          chosen = p;
        }
      }
    }
    return NextResponse.json({ found: true, ring: chosen!.ring, name: chosen!.name });
  } catch (e) {
    return NextResponse.json({ found: false, error: String(e) }, { status: 502 });
  }
}
