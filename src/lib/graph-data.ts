/**
 * Entity link-graph — "what connects to what / what's waiting on whom".
 * Suppliers → projects → queries/RFIs → the person each is waiting on.
 */
import { PROJECTS, projectById, PROJECT_SUPPLIERS, TEAM, type Rfi } from "./site-data";
import { SUPPLIER_BRANCHES } from "./mock-data";

export type NodeKind = "supplier" | "project" | "rfi" | "person";

export interface GNode { id: string; kind: NodeKind; label: string; sub?: string; ref?: string }
export interface GEdge { from: string; to: string }
export interface Graph { nodes: GNode[]; edges: GEdge[] }

const GRAPH_SUPPLIERS = ["PM", "ITM", "CAR", "BUN"] as const;

export function buildGraph(rfis: Rfi[]): Graph {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];

  const usedSuppliers = new Set<string>();
  Object.values(PROJECT_SUPPLIERS).forEach((codes) => codes.forEach((c) => usedSuppliers.add(c)));
  for (const code of GRAPH_SUPPLIERS) {
    if (!usedSuppliers.has(code)) continue;
    nodes.push({ id: `sup:${code}`, kind: "supplier", label: SUPPLIER_BRANCHES[code]?.nm.split(" ").slice(0, 2).join(" ") ?? code });
  }

  for (const p of PROJECTS) {
    nodes.push({ id: `proj:${p.id}`, kind: "project", label: p.name, sub: p.region });
    for (const code of PROJECT_SUPPLIERS[p.id] ?? []) edges.push({ from: `sup:${code}`, to: `proj:${p.id}` });
  }

  const usedPeople = new Set<string>();
  for (const r of rfis) {
    nodes.push({ id: `rfi:${r.id}`, kind: "rfi", label: r.subject, sub: r.type, ref: r.ref });
    if (projectById(r.projectId)) edges.push({ from: `proj:${r.projectId}`, to: `rfi:${r.id}` });
    edges.push({ from: `rfi:${r.id}`, to: `person:${r.ballInCourt}` });
    usedPeople.add(r.ballInCourt);
  }

  for (const p of TEAM) {
    if (!usedPeople.has(p.id)) continue;
    nodes.push({ id: `person:${p.id}`, kind: "person", label: p.name, sub: p.role });
  }

  return { nodes, edges };
}

export function neighbours(graph: Graph, id: string): Set<string> {
  const set = new Set<string>([id]);
  for (const e of graph.edges) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
}

export const KIND_COLOR: Record<NodeKind, string> = {
  supplier: "#8f99a8",
  project: "#4c90f0",
  rfi: "#ec9a3c",
  person: "#3fa6da",
};
export const KIND_LABEL: Record<NodeKind, string> = {
  supplier: "Supplier", project: "Project", rfi: "Query / RFI", person: "Person",
};
