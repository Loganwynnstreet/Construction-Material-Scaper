import { NextResponse } from "next/server";
import { getBoundaries } from "../../../server/store";
import { PROJECTS } from "../../../lib/site-data";

export const dynamic = "force-dynamic";

// Returns projects with any persisted (edited) boundaries merged over the seed.
export async function GET() {
  const saved = await getBoundaries();
  const projects = PROJECTS.map((p) => ({ ...p, boundary: saved[p.id] ?? p.boundary }));
  return NextResponse.json({ projects });
}
