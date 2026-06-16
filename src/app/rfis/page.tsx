"use client";
import * as React from "react";
import { SideRail, PageHeader } from "../../components/Shell";
import {
  Button, IconButton, Input, Textarea, Select, Badge, Avatar, Tabs, Field, EmptyState, cx,
} from "../../components/ui";
import { useCollab } from "../../lib/collab-store";
import {
  PROJECTS, projectById, TEAM, RFI_STATUS, PRIORITY_TONE, type RfiStatus, type RfiType, type Rfi,
} from "../../lib/site-data";
import { ago, dateTime } from "../../lib/format";
import { MessageSquarePlus, ArrowLeft, Send, MapPin, CornerUpLeft, X } from "lucide-react";

type Filter = "all" | RfiStatus;

export default function RfisPage() {
  const { rfis, addMessage, setStatus, setBallInCourt, createRfi, personName, personRole, currentUserId } = useCollab();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(rfis[0]?.id ?? null);
  const [reply, setReply] = React.useState("");
  const [composing, setComposing] = React.useState(false);

  const counts = React.useMemo(() => {
    const c: Record<Filter, number> = { all: rfis.length, open: 0, in_review: 0, answered: 0, closed: 0 };
    rfis.forEach((r) => { c[r.status]++; });
    return c;
  }, [rfis]);

  const list = rfis.filter((r) => filter === "all" || r.status === filter);
  const selected = rfis.find((r) => r.id === selectedId) ?? null;

  const post = () => {
    if (!selected || !reply.trim()) return;
    addMessage(selected.id, reply);
    setReply("");
  };

  return (
    <div className="md:pl-rail">
      <SideRail />
      <div className="flex h-[100dvh] flex-col pb-16 md:pb-0">
        <PageHeader
          title="Queries & RFIs"
          sub="Every question, variation and answer — on one shared timeline. Visible to client, contractors and PM."
          actions={<Button variant="primary" onClick={() => setComposing(true)}><MessageSquarePlus className="h-4 w-4" /> New query</Button>}
        >
          <div className="px-4 md:px-6">
            <Tabs<Filter>
              value={filter}
              onChange={setFilter}
              tabs={[
                { id: "all", label: "All", count: counts.all },
                { id: "open", label: "Open", count: counts.open },
                { id: "in_review", label: "In review", count: counts.in_review },
                { id: "answered", label: "Answered", count: counts.answered },
                { id: "closed", label: "Closed", count: counts.closed },
              ]}
            />
          </div>
        </PageHeader>

        <div className="flex min-h-0 flex-1">
          {/* list */}
          <aside className={cx("min-h-0 w-full overflow-y-auto border-r border-line-subtle md:w-[360px] md:shrink-0", selected && "hidden md:block")}>
            {list.length === 0 && <EmptyState title="Nothing here" hint="No items match this filter." />}
            {list.map((r) => (
              <ThreadRow key={r.id} rfi={r} active={r.id === selectedId} onClick={() => setSelectedId(r.id)} ballName={personName(r.ballInCourt)} />
            ))}
          </aside>

          {/* detail */}
          <section className={cx("min-h-0 flex-1 flex-col", selected ? "flex" : "hidden md:flex")}>
            {!selected ? (
              <EmptyState icon={<MessageSquarePlus className="h-6 w-6" />} title="Select a query" hint="Pick a thread to read and respond." />
            ) : (
              <Thread
                key={selected.id}
                rfi={selected}
                reply={reply}
                setReply={setReply}
                onPost={post}
                onBack={() => setSelectedId(null)}
                onStatus={(s) => setStatus(selected.id, s)}
                onBall={(id) => setBallInCourt(selected.id, id)}
                personName={personName}
                personRole={personRole}
                currentUserId={currentUserId}
              />
            )}
          </section>
        </div>
      </div>

      {composing && (
        <NewQuery
          onClose={() => setComposing(false)}
          onCreate={(n) => { const id = createRfi(n); setComposing(false); setSelectedId(id); setFilter("all"); }}
        />
      )}
    </div>
  );
}

function ThreadRow({ rfi, active, onClick, ballName }: { rfi: Rfi; active: boolean; onClick: () => void; ballName: string }) {
  const last = rfi.messages[rfi.messages.length - 1];
  return (
    <button onClick={onClick}
      className={cx("block w-full border-b border-line-subtle px-4 py-3 text-left transition-colors", active ? "bg-surface-overlay" : "hover:bg-surface-raised")}>
      <div className="flex items-center gap-2">
        <span className="data text-2xs text-fg-faint">{rfi.ref}</span>
        <Badge tone={rfi.type === "Variation" ? "info" : rfi.type === "Query" ? "neutral" : "warning"}>{rfi.type}</Badge>
        <span className="ml-auto text-2xs text-fg-faint">{ago(last.at)}</span>
      </div>
      <div className="mt-1 line-clamp-1 text-sm font-medium text-fg">{rfi.subject}</div>
      <div className="mt-1.5 flex items-center gap-2">
        <Badge tone={RFI_STATUS[rfi.status].tone}>{RFI_STATUS[rfi.status].label}</Badge>
        <span className="inline-flex items-center gap-1 text-2xs text-fg-faint"><MapPin className="h-2.5 w-2.5" />{projectById(rfi.projectId)?.name}</span>
        <span className="ml-auto truncate text-2xs text-fg-faint">↳ {ballName}</span>
      </div>
    </button>
  );
}

function Thread({
  rfi, reply, setReply, onPost, onBack, onStatus, onBall, personName, personRole, currentUserId,
}: {
  rfi: Rfi; reply: string; setReply: (s: string) => void; onPost: () => void; onBack: () => void;
  onStatus: (s: RfiStatus) => void; onBall: (id: string) => void;
  personName: (id: string) => string; personRole: (id: string) => string; currentUserId: string;
}) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [rfi.messages.length]);
  const project = projectById(rfi.projectId);

  return (
    <>
      {/* thread header */}
      <div className="border-b border-line-subtle px-4 py-3 md:px-6">
        <div className="flex items-start gap-3">
          <button onClick={onBack} className="mt-0.5 text-fg-muted hover:text-fg md:hidden" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="data text-xs text-fg-faint">{rfi.ref}</span>
              <Badge tone={rfi.type === "Variation" ? "info" : rfi.type === "Query" ? "neutral" : "warning"}>{rfi.type}</Badge>
              <Badge tone={RFI_STATUS[rfi.status].tone}>{RFI_STATUS[rfi.status].label}</Badge>
              <Badge tone={PRIORITY_TONE[rfi.priority]}>{rfi.priority}</Badge>
            </div>
            <h2 className="mt-1.5 font-display text-lg font-semibold leading-tight">{rfi.subject}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{project?.name} · {project?.region}</span>
              <span>Raised by {personName(rfi.createdById)}</span>
              {rfi.due && <span className="text-warning-fg">Due {dateTime(rfi.due)}</span>}
            </div>
          </div>
        </div>

        {/* ball-in-court + status controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-2xs text-fg-faint">
            Waiting on
            <Select value={rfi.ballInCourt} onChange={(e) => onBall(e.target.value)} className="h-8 w-auto text-sm">
              {TEAM.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}
            </Select>
          </label>
          <div className="ml-auto flex items-center gap-1.5">
            {rfi.status !== "answered" && <Button size="sm" onClick={() => onStatus("answered")}>Mark answered</Button>}
            {rfi.status !== "closed" ? (
              <Button size="sm" variant="ghost" onClick={() => onStatus("closed")}>Close</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => onStatus("open")}><CornerUpLeft className="h-3.5 w-3.5" /> Reopen</Button>
            )}
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6">
        {rfi.messages.map((m) => {
          const mine = m.authorId === currentUserId;
          return (
            <div key={m.id} className={cx("flex gap-3", mine && "flex-row-reverse")}>
              <Avatar name={personName(m.authorId)} size={30} />
              <div className={cx("max-w-[80%]", mine && "items-end text-right")}>
                <div className={cx("flex items-center gap-2", mine && "flex-row-reverse")}>
                  <span className="text-sm font-medium text-fg">{personName(m.authorId)}</span>
                  <span className="text-2xs text-fg-faint">{personRole(m.authorId)}</span>
                  <span className="text-2xs text-fg-faint">· {ago(m.at)}</span>
                </div>
                <div className={cx("mt-1 inline-block rounded-lg border px-3 py-2 text-sm leading-relaxed text-fg",
                  mine ? "border-line bg-surface-overlay" : "border-line-subtle bg-surface-raised")}>
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="border-t border-line-subtle bg-surface-base px-4 py-3 md:px-6">
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onPost(); }}
            placeholder="Write a reply…  (⌘↵ to send)"
            className="flex-1"
          />
          <Button variant="primary" onClick={onPost} disabled={!reply.trim()}><Send className="h-4 w-4" /> Send</Button>
        </div>
      </div>
    </>
  );
}

function NewQuery({ onClose, onCreate }: { onClose: () => void; onCreate: (n: { projectId: string; type: RfiType; subject: string; priority: "low" | "normal" | "high" | "urgent"; body: string; ballInCourt: string }) => void }) {
  const [projectId, setProjectId] = React.useState(PROJECTS[0].id);
  const [type, setType] = React.useState<RfiType>("RFI");
  const [priority, setPriority] = React.useState<"low" | "normal" | "high" | "urgent">("normal");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [ball, setBall] = React.useState("u-sina");
  const valid = subject.trim() && body.trim();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg animate-fadeIn rounded-xl border border-line bg-surface-raised shadow-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line-subtle px-5 py-3.5">
          <h2 className="font-display text-md font-semibold">Raise a query</h2>
          <IconButton label="Close" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></IconButton>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project"><Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            <Field label="Type"><Select value={type} onChange={(e) => setType(e.target.value as RfiType)}><option>RFI</option><option>Variation</option><option>Query</option></Select></Field>
            <Field label="Priority"><Select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high" | "urgent")}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></Select></Field>
            <Field label="Waiting on"><Select value={ball} onChange={(e) => setBall(e.target.value)}>{TEAM.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          </div>
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Confirm cladding profile on west elevation" /></Field>
          <Field label="Details"><Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the question or change…" /></Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line-subtle px-5 py-3.5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid}
            onClick={() => onCreate({ projectId, type, subject: subject.trim(), priority, body: body.trim(), ballInCourt: ball })}>
            Post query
          </Button>
        </div>
      </div>
    </div>
  );
}
