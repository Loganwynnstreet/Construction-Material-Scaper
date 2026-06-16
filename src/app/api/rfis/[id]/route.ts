import { NextResponse } from "next/server";
import { patchRfi } from "../../../../server/store";
import type { RfiStatus } from "../../../../lib/site-data";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const patch = (await req.json()) as { status?: RfiStatus; ballInCourt?: string };
  const rfi = await patchRfi(params.id, patch);
  if (!rfi) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ rfi });
}
