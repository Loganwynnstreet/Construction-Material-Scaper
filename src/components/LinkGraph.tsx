"use client";
import * as React from "react";
import { type Graph, type NodeKind, neighbours, KIND_COLOR } from "../lib/graph-data";

const COL: Record<NodeKind, { x: number; w: number }> = {
  supplier: { x: 40, w: 150 },
  project: { x: 300, w: 170 },
  rfi: { x: 640, w: 300 },
  person: { x: 1000, w: 150 },
};
const ORDER: NodeKind[] = ["supplier", "project", "rfi", "person"];
const ROW = 46;
const NH = 30; // node height
const PAD = 40;

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export default function LinkGraph({ graph, selected, onSelect }: { graph: Graph; selected: string | null; onSelect: (id: string | null) => void }) {
  const pos = React.useMemo(() => {
    const byKind: Record<NodeKind, string[]> = { supplier: [], project: [], rfi: [], person: [] };
    graph.nodes.forEach((n) => byKind[n.kind].push(n.id));
    const maxN = Math.max(...ORDER.map((k) => byKind[k].length), 1);
    const H = maxN * ROW + PAD * 2;
    const map: Record<string, { x: number; y: number; w: number }> = {};
    for (const k of ORDER) {
      const ids = byKind[k];
      const colH = ids.length * ROW;
      const startY = (H - colH) / 2 + ROW / 2;
      ids.forEach((id, i) => { map[id] = { x: COL[k].x, y: startY + i * ROW, w: COL[k].w }; });
    }
    return { map, H, W: 1170 };
  }, [graph]);

  const near = selected ? neighbours(graph, selected) : null;
  const dim = (id: string) => (near ? !near.has(id) : false);

  return (
    <svg viewBox={`0 0 ${pos.W} ${pos.H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet"
      onClick={() => onSelect(null)}>
      {/* column headers */}
      {ORDER.map((k) => (
        <text key={k} x={COL[k].x} y={22} fill="#6e7681" fontSize={11} fontWeight={600}
          style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
          {k === "rfi" ? "Queries / RFIs" : k === "person" ? "People" : k + "s"}
        </text>
      ))}

      {/* edges */}
      <g>
        {graph.edges.map((e, i) => {
          const a = pos.map[e.from], b = pos.map[e.to];
          if (!a || !b) return null;
          const sx = a.x + a.w, sy = a.y, tx = b.x, ty = b.y;
          const mx = (sx + tx) / 2;
          const hot = selected != null && (e.from === selected || e.to === selected);
          const faded = selected != null && !hot;
          return (
            <path key={i} d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`} fill="none"
              stroke={hot ? "#4c90f0" : "#2f333b"} strokeWidth={hot ? 1.6 : 1} opacity={faded ? 0.18 : 0.9} />
          );
        })}
      </g>

      {/* nodes */}
      <g>
        {graph.nodes.map((n) => {
          const p = pos.map[n.id];
          if (!p) return null;
          const sel = selected === n.id;
          const faded = dim(n.id);
          return (
            <g key={n.id} transform={`translate(${p.x},${p.y - NH / 2})`} style={{ cursor: "pointer", opacity: faded ? 0.35 : 1 }}
              onClick={(ev) => { ev.stopPropagation(); onSelect(sel ? null : n.id); }}>
              <rect width={p.w} height={NH} rx={3} fill="#23262d" stroke={sel ? "#4c90f0" : "#2f333b"} strokeWidth={sel ? 1.6 : 1} />
              <rect width={4} height={NH} rx={1} fill={KIND_COLOR[n.kind]} />
              <text x={14} y={n.sub ? 13 : 19} fill="#f2f4f7" fontSize={11.5} style={{ fontFamily: "var(--font-sans)" }}>
                {trunc(n.label, n.kind === "rfi" ? 40 : 18)}
              </text>
              {n.sub && (
                <text x={14} y={23} fill="#6e7681" fontSize={9.5} style={{ fontFamily: "var(--font-mono), monospace" }}>
                  {trunc(n.sub, n.kind === "rfi" ? 44 : 22)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
