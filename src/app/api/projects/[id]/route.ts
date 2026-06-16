import { NextResponse } from "next/server";
import { setBoundary } from "../../../../server/store";
import { projectById } from "../../../../lib/site-data";

export const dynamic = "force-dynamic";

// Persist an edited site boundary for a project.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!projectById(params.id)) return NextResponse.json({ error: "unknown project" }, { status: 404 });
  const body = (await req.json()) as { boundary?: [number, number][] };
  if (!Array.isArray(body.boundary) || body.boundary.length < 3) {
    return NextResponse.json({ error: "boundary must have at least 3 points" }, { status: 400 });
  }
  const boundary = await setBoundary(params.id, body.boundary);
  return NextResponse.json({ boundary });
}
