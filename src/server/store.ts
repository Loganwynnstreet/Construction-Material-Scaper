import { promises as fs } from "fs";
import path from "path";
import { INITIAL_RFIS, PROJECTS, type Rfi, type Message, type RfiStatus } from "../lib/site-data";

/**
 * Construction OS backend store.
 *
 * A small server-side persistence layer behind the Next.js API routes. It
 * writes to a JSON file under .data/, so the app has a real backend that
 * survives reloads with zero external services (just `npm run dev`).
 *
 * The interface (load/save + the helpers below) is the seam to swap in
 * Postgres/Supabase later — the route handlers don't change.
 */

interface DB {
  // projectId -> boundary polygon (overrides the seeded boundary when edited)
  boundaries: Record<string, [number, number][]>;
  rfis: Rfi[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function seed(): DB {
  return {
    boundaries: Object.fromEntries(PROJECTS.map((p) => [p.id, p.boundary])),
    rfis: INITIAL_RFIS,
  };
}

let cache: DB | null = null;

async function load(): Promise<DB> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    cache = JSON.parse(raw) as DB;
  } catch {
    cache = seed();
    await persist();
  }
  return cache!;
}

async function persist(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2), "utf8");
}

// ---- projects / boundaries ----
export async function getBoundaries() {
  return (await load()).boundaries;
}

export async function setBoundary(projectId: string, boundary: [number, number][]) {
  const db = await load();
  db.boundaries[projectId] = boundary;
  await persist();
  return db.boundaries[projectId];
}

// ---- rfis ----
export async function listRfis(): Promise<Rfi[]> {
  return (await load()).rfis;
}

export async function createRfi(rfi: Rfi): Promise<Rfi> {
  const db = await load();
  db.rfis = [rfi, ...db.rfis.filter((r) => r.id !== rfi.id)];
  await persist();
  return rfi;
}

export async function addMessage(rfiId: string, message: Message): Promise<Rfi | null> {
  const db = await load();
  const rfi = db.rfis.find((r) => r.id === rfiId);
  if (!rfi) return null;
  rfi.messages.push(message);
  if (rfi.status === "open") rfi.status = "in_review";
  await persist();
  return rfi;
}

export async function patchRfi(rfiId: string, patch: { status?: RfiStatus; ballInCourt?: string }): Promise<Rfi | null> {
  const db = await load();
  const rfi = db.rfis.find((r) => r.id === rfiId);
  if (!rfi) return null;
  if (patch.status) rfi.status = patch.status;
  if (patch.ballInCourt) rfi.ballInCourt = patch.ballInCourt;
  await persist();
  return rfi;
}
