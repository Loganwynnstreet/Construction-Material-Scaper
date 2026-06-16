"use client";
import * as React from "react";
import Link from "next/link";
import { SideRail, PageHeader } from "../../components/Shell";
import { Card, CardHeader, CardTitle, CardBody, Badge, cx } from "../../components/ui";
import { useCollab } from "../../lib/collab-store";
import { PROJECTS, projectById, TEAM, RFI_STATUS, type RfiStatus } from "../../lib/site-data";
import { SHIPMENTS } from "../../lib/mock-data";
import { ago } from "../../lib/format";

const HOUR = 3600000;
function dur(h: number) {
  if (!isFinite(h) || h <= 0) return "—";
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export default function AnalyticsPage() {
  const { rfis, currentUserId, personName } = useCollab();

  // first-response time (first reply after the opening message)
  const responseHrs = rfis
    .filter((r) => r.messages.length >= 2)
    .map((r) => (new Date(r.messages[1].at).getTime() - new Date(r.messages[0].at).getTime()) / HOUR);
  const avgResponse = responseHrs.length ? responseHrs.reduce((a, b) => a + b, 0) / responseHrs.length : NaN;

  // variation approval cycle
  const varCycle = rfis
    .filter((r) => r.type === "Variation" && (r.status === "answered" || r.status === "closed") && r.messages.length >= 2)
    .map((r) => (new Date(r.messages[r.messages.length - 1].at).getTime() - new Date(r.createdAt).getTime()) / HOUR);
  const avgVar = varCycle.length ? varCycle.reduce((a, b) => a + b, 0) / varCycle.length : NaN;

  const open = rfis.filter((r) => r.status === "open" || r.status === "in_review");
  const onYou = open.filter((r) => r.ballInCourt === currentUserId).length;
  const delivered = SHIPMENTS.filter((s) => s.status === "delivered").length;
  const onTime = Math.round((delivered / SHIPMENTS.length) * 100);
  const atRisk = SHIPMENTS.filter((s) => s.risk).length;
  const avgProgress = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length);

  // ball-in-court load
  const load = TEAM.map((p) => ({ p, n: open.filter((r) => r.ballInCourt === p.id).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const maxLoad = Math.max(...load.map((l) => l.n), 1);

  // status breakdown
  const statusCounts: Record<RfiStatus, number> = { open: 0, in_review: 0, answered: 0, closed: 0 };
  rfis.forEach((r) => statusCounts[r.status]++);

  // oldest unresolved (friction)
  const oldest = [...open].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(0, 5);

  const metrics = [
    { label: "Avg. first response", value: dur(avgResponse), sub: `${responseHrs.length} answered threads` },
    { label: "Variation approval", value: dur(avgVar), sub: "request → decision" },
    { label: "Open queries", value: String(open.length), sub: `${onYou} on you`, hot: onYou > 0 },
    { label: "On-time deliveries", value: `${onTime}%`, sub: `${atRisk} at risk`, hot: atRisk > 0 },
    { label: "Avg. build progress", value: `${avgProgress}%`, sub: `${PROJECTS.length} projects` },
  ];

  return (
    <div className="md:pl-rail">
      <SideRail />
      <div className="pb-20 md:pb-0">
        <PageHeader title="Analytics" sub="Operational cadence — response times, approval cycles and where work is piling up." />

        <div className="space-y-4 px-4 py-4 md:px-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {metrics.map((m) => (
              <div key={m.label} className="rounded border border-line-subtle bg-surface-raised p-3.5">
                <div className="text-xs text-fg-muted">{m.label}</div>
                <div className="data mt-1.5 text-2xl font-semibold tracking-tight">{m.value}</div>
                <div className={cx("mt-1 text-2xs", m.hot ? "text-warning-fg" : "text-fg-faint")}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* ball-in-court load */}
            <Card>
              <CardHeader><CardTitle>Ball-in-court load</CardTitle><span className="text-2xs text-fg-faint">open items waiting on each party</span></CardHeader>
              <CardBody className="space-y-3">
                {load.length === 0 && <p className="text-sm text-fg-muted">Nothing outstanding.</p>}
                {load.map(({ p, n }) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 truncate text-sm">{p.name}<span className="ml-1 text-2xs text-fg-faint">{p.role.split(" ")[0]}</span></div>
                    <div className="h-4 flex-1 overflow-hidden rounded-sm bg-surface-inset">
                      <div className={cx("h-full rounded-sm", p.id === currentUserId ? "bg-warning" : "bg-primary")} style={{ width: `${(n / maxLoad) * 100}%` }} />
                    </div>
                    <span className="data w-5 text-right text-sm">{n}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* status breakdown */}
            <Card>
              <CardHeader><CardTitle>Query status</CardTitle><span className="text-2xs text-fg-faint">{rfis.length} total</span></CardHeader>
              <CardBody className="space-y-3">
                {(Object.keys(statusCounts) as RfiStatus[]).map((s) => {
                  const n = statusCounts[s];
                  const pctW = (n / Math.max(rfis.length, 1)) * 100;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-24 shrink-0"><Badge tone={RFI_STATUS[s].tone}>{RFI_STATUS[s].label}</Badge></div>
                      <div className="h-4 flex-1 overflow-hidden rounded-sm bg-surface-inset">
                        <div className="h-full rounded-sm bg-line-strong" style={{ width: `${pctW}%` }} />
                      </div>
                      <span className="data w-5 text-right text-sm">{n}</span>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </div>

          {/* friction: oldest unresolved */}
          <Card>
            <CardHeader><CardTitle>Oldest unresolved</CardTitle><span className="text-2xs text-fg-faint">friction — clear these first</span></CardHeader>
            <CardBody className="p-0">
              {oldest.length === 0 && <p className="px-4 py-4 text-sm text-fg-muted">Nothing open.</p>}
              {oldest.map((r) => (
                <Link key={r.id} href="/rfis" className="flex items-center gap-3 border-b border-line-subtle px-4 py-2.5 last:border-0 hover:bg-surface-overlay/50">
                  <span className="data w-16 shrink-0 text-2xs text-fg-faint">{r.ref}</span>
                  <Badge tone={RFI_STATUS[r.status].tone}>{RFI_STATUS[r.status].label}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm">{r.subject}</span>
                  <span className="hidden text-2xs text-fg-faint sm:block">{projectById(r.projectId)?.name}</span>
                  <span className="w-20 shrink-0 text-right text-2xs text-fg-muted">waiting on {personName(r.ballInCourt).split(" ")[0]}</span>
                  <span className="w-16 shrink-0 text-right text-2xs text-warning-fg">{ago(r.createdAt)}</span>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
