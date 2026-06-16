import { NextResponse } from "next/server";
import { listRfis, createRfi } from "../../../server/store";
import type { Rfi } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ rfis: await listRfis() });
}

export async function POST(req: Request) {
  const rfi = (await req.json()) as Rfi;
  if (!rfi?.id || !rfi?.projectId) return NextResponse.json({ error: "invalid rfi" }, { status: 400 });
  return NextResponse.json({ rfi: await createRfi(rfi) });
}
