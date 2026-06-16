"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { SideRail } from "../../components/Shell";
import ProjectInspector from "../../components/ProjectInspector";
import { Button, Card, cx } from "../../components/ui";
import { PROJECTS, LOT_STATUS, type LotStatus } from "../../lib/site-data";
import { nzd } from "../../lib/format";
import { Truck, Check, RotateCcw, Undo2 } from "lucide-react";

type LL = [number, number];

const SiteMap = dynamic(() => import("../../components/SiteMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-surface-inset text-sm text-fg-faint">Loading map…</div>,
});

const LEGEND: LotStatus[] = ["design", "consented", "in_progress", "at_risk", "complete"];

export default function MapPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showDeliveries, setShowDeliveries] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [boundaries, setBoundaries] = React.useState<Record<string, LL[]>>(
    () => Object.fromEntries(PROJECTS.map((p) => [p.id, p.boundary])),
  );
  const stashRef = React.useRef<LL[] | null>(null);

  React.useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { projects?: { id: string; boundary: LL[] }[] }) => {
        if (!d.projects) return;
        setBoundaries((b) => { const next = { ...b }; d.projects!.forEach((p) => { next[p.id] = p.boundary; }); return next; });
      })
      .catch(() => {});
  }, []);

  const project = PROJECTS.find((p) => p.id === selectedId) ?? null;
  const editing = !!editingId;

  const startEdit = () => { if (!selectedId) return; stashRef.current = boundaries[selectedId]; setEditingId(selectedId); };
  const saveEdit = () => {
    if (editingId) {
      fetch(`/api/projects/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ boundary: boundaries[editingId] }) }).catch(() => {});
    }
    setEditingId(null);
  };
  const cancelEdit = () => {
    if (editingId && stashRef.current) setBoundaries((b) => ({ ...b, [editingId]: stashRef.current as LL[] }));
    setEditingId(null);
  };
  const removeLast = () => {
    if (!editingId) return;
    setBoundaries((b) => { const c = b[editingId] ?? []; return c.length > 3 ? { ...b, [editingId]: c.slice(0, -1) } : b; });
  };

  return (
    <div className="md:pl-rail">
      <SideRail />
      <div className="relative h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <SiteMap
            selectedId={selectedId}
            onSelect={setSelectedId}
            showDeliveries={showDeliveries}
            editingId={editingId}
            boundaries={boundaries}
            onBoundaryChange={(id, c) => setBoundaries((b) => ({ ...b, [id]: c }))}
          />
        </div>

        {/* left panel (hidden while editing) */}
        {!editing && (
          <div className="absolute inset-x-3 bottom-[4.75rem] top-auto z-[1000] flex max-h-[60vh] flex-col gap-2 md:inset-x-auto md:bottom-3 md:left-3 md:top-3 md:max-h-[calc(100dvh-1.5rem)] md:w-[300px]">
            <button onClick={() => setShowDeliveries((v) => !v)}
              className={cx("flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                showDeliveries ? "border-primary/50 bg-primary/12 text-primary-fg" : "border-line bg-surface-raised/95 text-fg-muted backdrop-blur hover:text-fg")}>
              <Truck className="h-4 w-4" /> Deliveries
              <span className={cx("ml-auto text-2xs", showDeliveries ? "text-primary-fg" : "text-fg-faint")}>{showDeliveries ? "On" : "Off"}</span>
            </button>

            {project ? (
              <ProjectInspector project={project} onClose={() => setSelectedId(null)} onEditBoundary={startEdit} />
            ) : (
              <Card className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between border-b border-line-subtle px-3.5 py-2.5">
                  <h2 className="font-display text-sm font-semibold">Projects</h2>
                  <span className="text-2xs text-fg-faint">{PROJECTS.length}</span>
                </div>
                <div className="min-h-0 overflow-y-auto">
                  {PROJECTS.map((p) => {
                    const s = LOT_STATUS[p.status];
                    return (
                      <button key={p.id} onClick={() => setSelectedId(p.id)}
                        className="flex w-full items-center gap-2.5 border-b border-line-subtle px-3.5 py-2.5 text-left transition-colors last:border-0 hover:bg-surface-overlay">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">{p.name}</span>
                          <span className="block truncate text-2xs text-fg-faint">{p.region} · {nzd(p.value, 0)}</span>
                        </span>
                        <span className="data shrink-0 text-2xs text-fg-muted">{p.progress}%</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* edit toolbar */}
        {editing && project && (
          <div className="absolute left-1/2 top-3 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-line bg-surface-raised/95 px-3 py-2 shadow-pop backdrop-blur">
            <span className="text-sm font-medium">Editing <span className="text-fg">{project.name}</span></span>
            <span className="hidden text-2xs text-fg-faint sm:inline">· click to add · drag handles · right-click to remove</span>
            <div className="mx-1 h-5 w-px bg-line" />
            <Button size="sm" variant="ghost" onClick={removeLast}><Undo2 className="h-3.5 w-3.5" /> Remove last</Button>
            <Button size="sm" variant="ghost" onClick={cancelEdit}><RotateCcw className="h-3.5 w-3.5" /> Cancel</Button>
            <Button size="sm" variant="primary" onClick={saveEdit}><Check className="h-3.5 w-3.5" /> Save boundary</Button>
          </div>
        )}

        {/* legend */}
        {!editing && (
          <div className="absolute bottom-3 right-3 z-[1000] hidden items-center gap-3 rounded-md border border-line bg-surface-raised/90 px-3 py-2 text-2xs text-fg-muted backdrop-blur md:flex">
            {LEGEND.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: LOT_STATUS[s].color }} />
                {LOT_STATUS[s].label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
