import { NextRequest, NextResponse } from "next/server";

// Rough bounding box around the Greater Toronto Area, used to bias/restrict results.
const GTA_VIEWBOX = "-80.10,43.45,-78.95,44.05";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");
  url.searchParams.set("viewbox", GTA_VIEWBOX);
  url.searchParams.set("bounded", "1");
  url.searchParams.set("countrycodes", "ca");
  url.searchParams.set("q", q);

  const res = await fetch(url, {
    headers: { "User-Agent": "ClinicGo/1.0 (contact: aryanyaksh19@gmail.com)" },
  });

  if (!res.ok) {
    return NextResponse.json({ results: [] });
  }

  const raw = (await res.json()) as Array<{ lat: string; lon: string; display_name: string; place_id: number }>;

  return NextResponse.json({
    results: raw.map((r) => ({ id: r.place_id, lat: Number(r.lat), lon: Number(r.lon), display_name: r.display_name })),
  });
}
