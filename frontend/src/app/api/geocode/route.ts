import { NextRequest, NextResponse } from "next/server";

// Rough bounding box around the Greater Toronto Area, used to bias/restrict results.
const GTA_VIEWBOX = "-80.10,43.45,-78.95,44.05";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing ?q= address" }, { status: 400 });
  }

  const query = /ontario|canada/i.test(q) ? q : `${q}, Ontario, Canada`;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("viewbox", GTA_VIEWBOX);
  url.searchParams.set("bounded", "1");
  url.searchParams.set("q", query);

  const res = await fetch(url, {
    headers: { "User-Agent": "ClinicGo/1.0 (contact: aryanyaksh19@gmail.com)" },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding service unavailable" }, { status: 502 });
  }

  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;

  if (results.length === 0) {
    return NextResponse.json({ error: "Address not found in the GTA" }, { status: 404 });
  }

  const { lat, lon, display_name } = results[0];
  return NextResponse.json({ lat: Number(lat), lon: Number(lon), display_name });
}
