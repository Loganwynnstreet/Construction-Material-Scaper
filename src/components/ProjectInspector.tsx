"use client";
import { X, MapPin, PencilRuler } from "lucide-react";
import { type Project, LOT_STATUS } from "../lib/site-data";
import { nzd } from "../lib/format";
import { Badge, Button, Progress, cx } from "./ui";

function Info({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-2xs text-fg-faint">{k}</div>
      <div className={cx("mt-0.5 text-sm text-fg", mono && "data")}>{v}</div>
    </div>
  );
}

export default function ProjectInspector({
  project, onClose, onEditBoundary,
}: { project: Project; onClose: () => void; onEditBoundary: () => void }) {
  const status = LOT_STATUS[project.status];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-raised/95 shadow-pop backdrop-blur-md">
      <div className="flex items-start gap-3 border-b border-line-subtle px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-md font-semibold">{project.name}</h2>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted"><MapPin className="h-3 w-3" />{project.region}</div>
        </div>
        <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-fg-muted hover:bg-surface-overlay"><X className="h-4 w-4" /></button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-fg-muted">Build progress</span>
            <span className="data text-fg">{project.progress}%</span>
          </div>
          <Progress value={project.progress} tone={status.tone === "neutral" ? "info" : status.tone} />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Info k="Contract value" v={nzd(project.value, 0)} mono />
          <Info k="Units / lots" v={String(project.units)} mono />
          <Info k="Client" v={project.client} />
          <Info k="Head contractor" v={project.contractor} />
          <Info k="Region" v={project.region} />
          <Info k="Target" v={project.eta} />
        </div>

        <Button variant="secondary" className="w-full" onClick={onEditBoundary}>
          <PencilRuler className="h-3.5 w-3.5" /> Edit site boundary
        </Button>
      </div>
    </div>
  );
}
