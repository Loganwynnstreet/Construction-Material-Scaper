/**
 * Construction OS — portfolio data model (project-centric).
 * Projects across NZ, the project team, and the collaboration record
 * (RFIs / variations / client queries) keyed to projects. Figures are
 * synthetic; timestamps anchored to mid-June 2026. Pure data (no JSX) so it
 * can seed the server store and be imported anywhere.
 */

export type Role = "Client" | "Project manager" | "Head contractor" | "Subcontractor" | "Architect" | "Council";
export interface Person { id: string; name: string; role: Role; company: string }

export const TEAM: Person[] = [
  { id: "u-logan", name: "Logan Street", role: "Project manager", company: "Construction OS" },
  { id: "u-mara", name: "Mara Wī", role: "Client", company: "HLC" },
  { id: "u-dev", name: "Devon Cole", role: "Head contractor", company: "Cole Build Ltd" },
  { id: "u-sina", name: "Sina Tuala", role: "Architect", company: "Foreground Studio" },
  { id: "u-rangi", name: "Rangi Park", role: "Subcontractor", company: "Park Electrical" },
  { id: "u-kim", name: "Kim Doyle", role: "Council", company: "Auckland Council" },
];

export type Tone = "neutral" | "positive" | "info" | "warning" | "danger";
export type ProjectStatus = "design" | "consented" | "in_progress" | "at_risk" | "complete";

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone; color: string }> = {
  design: { label: "Design", tone: "neutral", color: "#8f99a8" },
  consented: { label: "Consented", tone: "info", color: "#4c90f0" },
  in_progress: { label: "In progress", tone: "warning", color: "#ec9a3c" },
  at_risk: { label: "At risk", tone: "danger", color: "#e76a6e" },
  complete: { label: "Complete", tone: "positive", color: "#32a467" },
};

export interface Project {
  id: string;
  name: string;
  region: string;
  lat: number;
  long: number;
  status: ProjectStatus;
  progress: number;
  value: number;
  units: number;
  client: string;
  contractor: string;
  eta: string;
  boundary: [number, number][];
}

// Deterministic irregular site outline around a centre — not a square.
function genBoundary(lat: number, long: number, seed: number): [number, number][] {
  const n = 7;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const r = 0.0006 + ((Math.sin(seed * 12.9 + i * 2.7) + 1) / 2) * 0.0007;
    pts.push([lat + r * Math.cos(ang) * 0.78, long + r * Math.sin(ang)]);
  }
  return pts;
}

const RAW_PROJECTS: Omit<Project, "boundary">[] = [
  { id: "hobsonville", name: "Riccarton Townhouses", region: "Riccarton, Christchurch", lat: -43.531, long: 172.585, status: "complete", progress: 100, value: 4_100_000, units: 6, client: "Ngāi Tahu Property", contractor: "Cole Build Ltd", eta: "Handed over" },
  { id: "cambridge", name: "Halswell Subdivision", region: "Halswell, Christchurch", lat: -43.548, long: 172.552, status: "in_progress", progress: 58, value: 1_240_000, units: 1, client: "Private", contractor: "Canterbury Homes", eta: "Aug 2026" },
  { id: "tauranga", name: "Papanui Apartments", region: "Papanui, Christchurch", lat: -43.492, long: 172.607, status: "in_progress", progress: 72, value: 3_780_000, units: 9, client: "Classic Group", contractor: "Southbuild", eta: "Oct 2026" },
  { id: "johnsonville", name: "Sumner Cliff House", region: "Sumner, Christchurch", lat: -43.566, long: 172.756, status: "consented", progress: 12, value: 6_720_000, units: 14, client: "Private", contractor: "Capital Build", eta: "2027" },
  { id: "rolleston", name: "Rolleston Industrial", region: "Rolleston, Christchurch", lat: -43.589, long: 172.383, status: "at_risk", progress: 45, value: 9_200_000, units: 1, client: "Foodstuffs SI", contractor: "Southbuild", eta: "Dec 2026 (at risk)" },
  { id: "queenstown", name: "Lincoln Lifestyle Build", region: "Lincoln, Christchurch", lat: -43.645, long: 172.484, status: "design", progress: 0, value: 3_120_000, units: 1, client: "Private", contractor: "Alpine Construction", eta: "Q2 2027" },
];

export const PROJECTS: Project[] = RAW_PROJECTS.map((p, i) => ({ ...p, boundary: genBoundary(p.lat, p.long, i + 1) }));
export const projectById = (id: string) => PROJECTS.find((p) => p.id === id);

// suppliers serving each project (for the Explore link graph)
export const PROJECT_SUPPLIERS: Record<string, string[]> = {
  hobsonville: ["PM", "ITM"],
  cambridge: ["CAR"],
  tauranga: ["PM", "BUN"],
  johnsonville: ["ITM", "CAR"],
  rolleston: ["BUN", "PM"],
  queenstown: ["PM"],
};

// ---- collaboration record ----
export type RfiType = "RFI" | "Variation" | "Query";
export type RfiStatus = "open" | "in_review" | "answered" | "closed";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface Message { id: string; authorId: string; at: string; body: string }

export interface Rfi {
  id: string;
  ref: string;
  projectId: string;
  type: RfiType;
  subject: string;
  status: RfiStatus;
  priority: Priority;
  ballInCourt: string;
  createdById: string;
  createdAt: string;
  due?: string;
  messages: Message[];
}

export const RFI_STATUS: Record<RfiStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "warning" },
  in_review: { label: "In review", tone: "info" },
  answered: { label: "Answered", tone: "positive" },
  closed: { label: "Closed", tone: "neutral" },
};

export const PRIORITY_TONE: Record<Priority, Tone> = { low: "neutral", normal: "neutral", high: "warning", urgent: "danger" };

export const INITIAL_RFIS: Rfi[] = [
  {
    id: "rfi-201", ref: "RFI-201", projectId: "rolleston", type: "RFI", subject: "Confirm slab rebar spec before pour",
    status: "open", priority: "urgent", ballInCourt: "u-sina", createdById: "u-dev", createdAt: "2026-06-12T08:10:00+12:00", due: "2026-06-13T17:00:00+12:00",
    messages: [
      { id: "m1", authorId: "u-dev", at: "2026-06-12T08:10:00+12:00", body: "Footing detail F-02 calls D12 at 200crs but the PS1 says D16 for the thickened edge beam. Concrete is booked Friday — which governs?" },
      { id: "m2", authorId: "u-logan", at: "2026-06-12T08:40:00+12:00", body: "Holding the pour booking until the engineer confirms. Flagged to Sina." },
    ],
  },
  {
    id: "rfi-202", ref: "VAR-014", projectId: "tauranga", type: "Variation", subject: "Upgrade wet-area linings to Aqualine",
    status: "in_review", priority: "normal", ballInCourt: "u-mara", createdById: "u-sina", createdAt: "2026-06-11T14:20:00+12:00",
    messages: [
      { id: "m1", authorId: "u-sina", at: "2026-06-11T14:20:00+12:00", body: "Recommend upgrading standard GIB to Aqualine in the ensuites for moisture performance. ~$420/unit in materials." },
      { id: "m2", authorId: "u-logan", at: "2026-06-11T15:05:00+12:00", body: "Priced on our trade account: net variation $418/unit incl. labour. Sending to client for approval." },
      { id: "m3", authorId: "u-mara", at: "2026-06-12T09:30:00+12:00", body: "Reviewing with the owners today, will confirm tomorrow." },
    ],
  },
  {
    id: "rfi-203", ref: "Q-118", projectId: "cambridge", type: "Query", subject: "When is the framing inspection booked?",
    status: "answered", priority: "low", ballInCourt: "u-mara", createdById: "u-mara", createdAt: "2026-06-10T19:02:00+12:00",
    messages: [
      { id: "m1", authorId: "u-mara", at: "2026-06-10T19:02:00+12:00", body: "Owners are asking when we'll be weathertight — can you set expectations?" },
      { id: "m2", authorId: "u-logan", at: "2026-06-11T07:45:00+12:00", body: "Framing inspection is booked Thursday, then wrap/joinery the following week. Closed-in target is 27 June — tracked on the site map." },
    ],
  },
  {
    id: "rfi-204", ref: "RFI-205", projectId: "johnsonville", type: "RFI", subject: "Retaining wall — consent condition 7",
    status: "open", priority: "high", ballInCourt: "u-kim", createdById: "u-logan", createdAt: "2026-06-12T11:50:00+12:00",
    messages: [
      { id: "m1", authorId: "u-logan", at: "2026-06-12T11:50:00+12:00", body: "Condition 7 requires a geotech sign-off before the retaining wall. Can council confirm the PS4 is sufficient, or is a site inspection needed?" },
    ],
  },
  {
    id: "rfi-205", ref: "Q-120", projectId: "tauranga", type: "Query", subject: "Bring kitchen site-measure forward?",
    status: "in_review", priority: "normal", ballInCourt: "u-dev", createdById: "u-mara", createdAt: "2026-06-12T16:15:00+12:00",
    messages: [
      { id: "m1", authorId: "u-mara", at: "2026-06-12T16:15:00+12:00", body: "Our kitchen supplier can site-measure next Tuesday if the frames are up. Are the Stage 3 units ready?" },
    ],
  },
  {
    id: "rfi-206", ref: "RFI-198", projectId: "hobsonville", type: "RFI", subject: "Final PS3 sign-off for CCC",
    status: "closed", priority: "normal", ballInCourt: "u-kim", createdById: "u-logan", createdAt: "2026-05-30T10:00:00+12:00",
    messages: [
      { id: "m1", authorId: "u-logan", at: "2026-05-30T10:00:00+12:00", body: "Uploading PS3s for council — anything else for CCC?" },
      { id: "m2", authorId: "u-kim", at: "2026-06-02T13:20:00+12:00", body: "All producer statements received. CCC issued. Closing this out." },
    ],
  },
];

export type ActivityKind = "rfi" | "variation" | "delivery" | "progress" | "message";
export interface Activity { id: string; at: string; kind: ActivityKind; actorId: string; text: string; projectId?: string }

export const ACTIVITY: Activity[] = [
  { id: "a1", at: "2026-06-12T16:15:00+12:00", kind: "message", actorId: "u-mara", text: "asked about a kitchen site measure on", projectId: "tauranga" },
  { id: "a2", at: "2026-06-12T11:50:00+12:00", kind: "rfi", actorId: "u-logan", text: "raised RFI-205 (retaining wall) on", projectId: "johnsonville" },
  { id: "a3", at: "2026-06-12T09:30:00+12:00", kind: "variation", actorId: "u-mara", text: "is reviewing the Aqualine variation on", projectId: "tauranga" },
  { id: "a4", at: "2026-06-12T08:10:00+12:00", kind: "rfi", actorId: "u-dev", text: "raised an urgent rebar RFI on", projectId: "rolleston" },
  { id: "a5", at: "2026-06-11T15:30:00+12:00", kind: "progress", actorId: "u-dev", text: "marked Frame complete on", projectId: "tauranga" },
  { id: "a6", at: "2026-06-11T07:45:00+12:00", kind: "delivery", actorId: "u-logan", text: "scheduled COLORSTEEL roofing to", projectId: "cambridge" },
  { id: "a7", at: "2026-06-02T13:20:00+12:00", kind: "progress", actorId: "u-kim", text: "issued CCC for", projectId: "hobsonville" },
];

// Back-compat aliases (some modules import the older names).
export type LotStatus = ProjectStatus;
export const LOT_STATUS = PROJECT_STATUS;
