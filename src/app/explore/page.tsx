"use client";
import * as React from "react";
import Link from "next/link";
import { SideRail, PageHeader } from "../../components/Shell";
import LinkGraph from "../../components/LinkGraph";
import { Badge, Button, EmptyState, cx } from "../../components/ui";
import { useCollab } from "../../lib/collab-store";
import { buildGraph, KIND_COLOR, KIND_LABEL, type NodeKind } from "../../lib/graph-data";
import { projectById, TEAM, PROJECT_STATUS, RFI_STATUS } from "../../lib/site-data";
import { SUPPLIER_BRANCHES } from "../../lib/mock-data";
import { Network, ArrowUpRight, X } from "lucide-react";

export default function ExplorePage() {
  const { rfis, personName } = useCollab();
  const graph = React.useMemo(() => buildGraph(rfis), [rfis]);
  const [selected, setSelected] = React.useState<string | null>(null);

  const node = selected ? graph.nodes.find((n) => n.id === selected) : null;
  const connected = selected
    ? graph.edges
        .filter((e) => e.from === selected || e.to === selected)
        .map((e) => (e.from === selected ? e.to : e.from))
    : [];
  const connNodes = connected.map((id) => graph.nodes.find((n) => n.id === id)).filter(Boolean) as typeof graph.nodes;

  return (
    <div className="md:pl-rail">
      <SideRail />
      <div className="flex h-[100dvh] flex-col pb-16 md:pb-0">
        <PageHeader
          title="Explore"
          sub="The link graph — trace how suppliers, lots, queries and people connect, and what's blocking what."
        />
        <div className="flex min-h-0 flex-1">
          <section className="min-h-0 flex-1 overflow-auto bg-surface-inset p-4">
            <LinkGraph graph={graph} selected={selected} onSelect={setSelected} />
          </section>

          <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-line-subtle md:block">
            {!node ? (
              <EmptyState icon={<Network className="h-6 w-6" />} title="Select a node" hint="Click any supplier, lot, query or person to trace its connections." />
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: KIND_COLOR[node.kind] }} />
                      <span className="eyebrow">{KIND_LABEL[node.kind]}</span>
                    </div>
                    <h2 className="mt-1.5 font-display text-md font-semibold leading-tight">{node.label}</h2>
                    {node.sub && <div className="mt-0.5 text-xs text-fg-muted">{node.sub}</div>}
                  </div>
                  <button onClick={() => setSelected(null)} aria-label="Clear" className="text-fg-muted hover:text-fg"><X className="h-4 w-4" /></button>
                </div>

                <Detail kind={node.kind} id={node.id.split(":")[1]} rfis={rfis} personName={personName} />

                <div className="mt-5">
                  <div className="eyebrow mb-2">Connected ({connNodes.length})</div>
                  <div className="space-y-1.5">
                    {connNodes.map((c) => (
                      <button key={c.id} onClick={() => setSelected(c.id)}
                        className="flex w-full items-center gap-2 rounded border border-line-subtle bg-surface-inset px-2.5 py-1.5 text-left hover:bg-surface-overlay">
                        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: KIND_COLOR[c.kind] }} />
                        <span className="min-w-0 flex-1 truncate text-sm">{c.label}</span>
                        <span className="text-2xs text-fg-faint">{KIND_LABEL[c.kind]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function Detail({ kind, id, rfis, personName }: { kind: NodeKind; id: string; rfis: ReturnType<typeof useCollab>["rfis"]; personName: (id: string) => string }) {
  if (kind === "project") {
    const p = projectById(id);
    if (!p) return null;
    const s = PROJECT_STATUS[p.status];
    const items = rfis.filter((r) => r.projectId === id);
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2"><Badge tone={s.tone}>{s.label}</Badge><span className="data text-xs text-fg-muted">{p.progress}% complete</span></div>
        <Row k="Region" v={p.region} /><Row k="Target" v={p.eta} />
        <Row k="Open queries" v={String(items.filter((r) => r.status === "open" || r.status === "in_review").length)} />
        <Link href="/map"><Button size="sm" className="mt-1">Open on site map <ArrowUpRight className="h-3.5 w-3.5" /></Button></Link>
      </div>
    );
  }
  if (kind === "rfi") {
    const r = rfis.find((x) => x.id === id);
    if (!r) return null;
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-2"><Badge tone={RFI_STATUS[r.status].tone}>{RFI_STATUS[r.status].label}</Badge><span className="data text-xs text-fg-faint">{r.ref}</span></div>
        <Row k="Waiting on" v={personName(r.ballInCourt)} /><Row k="Raised by" v={personName(r.createdById)} />
        <Link href="/rfis"><Button size="sm" className="mt-1">Open thread <ArrowUpRight className="h-3.5 w-3.5" /></Button></Link>
      </div>
    );
  }
  if (kind === "person") {
    const p = TEAM.find((t) => t.id === id);
    const waiting = rfis.filter((r) => r.ballInCourt === id && (r.status === "open" || r.status === "in_review"));
    return (
      <div className="mt-4 space-y-3">
        <Row k="Role" v={p?.role ?? ""} /><Row k="Company" v={p?.company ?? ""} />
        <Row k="Open items waiting on them" v={String(waiting.length)} />
      </div>
    );
  }
  // supplier
  return (
    <div className="mt-4 space-y-3">
      <Row k="Branch" v={SUPPLIER_BRANCHES[id]?.nm ?? id} />
      <Row k="Carrier" v={SUPPLIER_BRANCHES[id]?.carrier ?? "—"} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-subtle pb-2 text-sm last:border-0">
      <span className="text-fg-faint">{k}</span>
      <span className="text-right text-fg">{v}</span>
    </div>
  );
}
