"use client";
import Link from "next/link";
import { SideRail, PageHeader } from "../components/Shell";
import { Card, CardHeader, CardTitle, CardBody, Badge, Progress, Avatar, StatusDot, cx } from "../components/ui";
import { useCollab } from "../lib/collab-store";
import { PROJECTS, PROJECT_STATUS, RFI_STATUS, projectById, ACTIVITY } from "../lib/site-data";
import { SHIPMENTS } from "../lib/mock-data";
import { nzd, ago } from "../lib/format";
import { ArrowUpRight, Inbox, Clock } from "lucide-react";

export default function Overview() {
  const { rfis, currentUserId, personName } = useCollab();

  const active = PROJECTS.filter((p) => p.status === "in_progress" || p.status === "at_risk").length;
  const avg = Math.round(PROJECTS.reduce((s, p) => s + p.progress, 0) / PROJECTS.length);
  const openItems = rfis.filter((r) => r.status === "open" || r.status === "in_review");
  const onYou = openItems.filter((r) => r.ballInCourt === currentUserId).length;
  const inTransit = SHIPMENTS.filter((s) => s.status === "in_transit").length;
  const portfolio = PROJECTS.reduce((s, p) => s + p.value, 0);

  const attention = [...openItems].sort(
    (a, b) => (b.ballInCourt === currentUserId ? 1 : 0) - (a.ballInCourt === currentUserId ? 1 : 0),
  );

  const metrics = [
    { label: "Active projects", value: String(active), sub: `${PROJECTS.length} in portfolio` },
    { label: "Avg. progress", value: `${avg}%`, sub: "across all projects" },
    { label: "Open queries", value: String(openItems.length), sub: `${onYou} waiting on you`, hot: onYou > 0 },
    { label: "In transit", value: String(inTransit), sub: "deliveries en route" },
    { label: "Portfolio value", value: nzd(portfolio, 0), sub: "contracted" },
  ];

  return (
    <div className="md:pl-rail">
      <SideRail />
      <div className="pb-20 md:pb-0">
        <PageHeader title="Overview" sub="One live view of every project, build and conversation" />

        <div className="space-y-4 px-4 py-4 md:px-6">
          {/* metrics */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-line-subtle bg-surface-raised p-4">
                <div className="text-xs text-fg-muted">{m.label}</div>
                <div className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{m.value}</div>
                <div className={cx("mt-1 text-2xs", m.hot ? "text-warning-fg" : "text-fg-faint")}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* projects */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <Link href="/map" className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg">Open site map <ArrowUpRight className="h-3 w-3" /></Link>
              </CardHeader>
              <CardBody className="p-0">
                {PROJECTS.map((p) => {
                  const s = PROJECT_STATUS[p.status];
                  return (
                    <Link key={p.id} href="/map" className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-0 hover:bg-surface-overlay/50">
                      <div className="w-28 shrink-0">
                        <div className="truncate font-display text-sm font-semibold">{p.name.split(" ")[0]}</div>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-fg">{p.region} · {nzd(p.value, 0)}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={p.progress} tone={s.tone === "neutral" ? "info" : s.tone} className="flex-1" />
                          <span className="data w-9 text-right text-2xs text-fg-muted">{p.progress}%</span>
                        </div>
                      </div>
                      <div className="hidden w-28 shrink-0 text-right text-xs text-fg-faint sm:block">{p.eta}</div>
                    </Link>
                  );
                })}
              </CardBody>
            </Card>

            {/* right column */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Needs attention</CardTitle>
                  <Link href="/rfis" className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg">All <ArrowUpRight className="h-3 w-3" /></Link>
                </CardHeader>
                <CardBody className="space-y-1.5 p-3">
                  {attention.length === 0 && (
                    <div className="px-1 py-3 text-center text-sm text-fg-muted"><Inbox className="mx-auto mb-1 h-5 w-5 text-fg-faint" />All clear.</div>
                  )}
                  {attention.slice(0, 5).map((r) => (
                    <Link key={r.id} href="/rfis" className="block rounded-md border border-line-subtle bg-surface-inset px-3 py-2 hover:bg-surface-overlay">
                      <div className="flex items-center gap-2">
                        <span className="data text-2xs text-fg-faint">{r.ref}</span>
                        <Badge tone={RFI_STATUS[r.status].tone}>{RFI_STATUS[r.status].label}</Badge>
                        <span className="ml-auto text-2xs text-fg-faint">{projectById(r.projectId)?.name.split(" ")[0]}</span>
                      </div>
                      <div className="mt-1 line-clamp-1 text-sm text-fg">{r.subject}</div>
                      <div className="mt-1 flex items-center gap-1 text-2xs text-fg-faint">
                        <StatusDot tone={r.ballInCourt === currentUserId ? "warning" : "neutral"} />
                        {r.ballInCourt === currentUserId ? "Waiting on you" : `Waiting on ${personName(r.ballInCourt)}`}
                      </div>
                    </Link>
                  ))}
                </CardBody>
              </Card>

              <Card>
                <CardHeader><CardTitle>Recent activity</CardTitle><Clock className="h-3.5 w-3.5 text-fg-faint" /></CardHeader>
                <CardBody className="space-y-3 p-4">
                  {ACTIVITY.slice(0, 7).map((a) => (
                    <div key={a.id} className="flex gap-2.5">
                      <Avatar name={personName(a.actorId)} size={26} />
                      <div className="min-w-0 flex-1 text-sm leading-snug">
                        <span className="text-fg">{personName(a.actorId)}</span>{" "}
                        <span className="text-fg-muted">{a.text}</span>{" "}
                        {a.projectId && <span className="text-fg">{projectById(a.projectId)?.name}</span>}
                        <div className="mt-0.5 text-2xs text-fg-faint">{ago(a.at)}</div>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
