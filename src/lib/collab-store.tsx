"use client";
import * as React from "react";
import { INITIAL_RFIS, TEAM, type Rfi, type RfiStatus, type RfiType, type Priority } from "./site-data";

interface NewRfi { projectId: string; type: RfiType; subject: string; priority: Priority; body: string; ballInCourt: string }

interface CollabCtx {
  rfis: Rfi[];
  loading: boolean;
  currentUserId: string;
  personName: (id: string) => string;
  personRole: (id: string) => string;
  addMessage: (rfiId: string, body: string) => void;
  setStatus: (rfiId: string, status: RfiStatus) => void;
  setBallInCourt: (rfiId: string, personId: string) => void;
  createRfi: (n: NewRfi) => string;
}

const Ctx = React.createContext<CollabCtx | null>(null);
const uid = () => Math.random().toString(36).slice(2, 8);

export function CollabProvider({ children }: { children: React.ReactNode }) {
  const [rfis, setRfis] = React.useState<Rfi[]>(INITIAL_RFIS);
  const [loading, setLoading] = React.useState(true);
  const currentUserId = "u-logan";

  // load persisted RFIs from the backend on mount
  React.useEffect(() => {
    let alive = true;
    fetch("/api/rfis")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (alive && Array.isArray(d.rfis)) setRfis(d.rfis); })
      .catch(() => {/* offline / first run — keep seed */})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const personName = React.useCallback((id: string) => TEAM.find((p) => p.id === id)?.name ?? "Unknown", []);
  const personRole = React.useCallback((id: string) => TEAM.find((p) => p.id === id)?.role ?? "", []);

  const addMessage = React.useCallback((rfiId: string, body: string) => {
    if (!body.trim()) return;
    const msg = { id: `m-${uid()}`, authorId: currentUserId, at: new Date().toISOString(), body: body.trim() };
    setRfis((prev) => prev.map((r) => (r.id !== rfiId ? r : {
      ...r, status: r.status === "open" ? "in_review" : r.status, messages: [...r.messages, msg],
    })));
    fetch(`/api/rfis/${rfiId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msg) }).catch(() => {});
  }, []);

  const setStatus = React.useCallback((rfiId: string, status: RfiStatus) => {
    setRfis((prev) => prev.map((r) => (r.id === rfiId ? { ...r, status } : r)));
    fetch(`/api/rfis/${rfiId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).catch(() => {});
  }, []);

  const setBallInCourt = React.useCallback((rfiId: string, personId: string) => {
    setRfis((prev) => prev.map((r) => (r.id === rfiId ? { ...r, ballInCourt: personId } : r)));
    fetch(`/api/rfis/${rfiId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ballInCourt: personId }) }).catch(() => {});
  }, []);

  const createRfi = React.useCallback((n: NewRfi) => {
    const id = `rfi-${uid()}`;
    const prefix = n.type === "Variation" ? "VAR" : n.type === "Query" ? "Q" : "RFI";
    const now = new Date().toISOString();
    const rfi: Rfi = {
      id, ref: `${prefix}-${Date.now().toString().slice(-4)}`, projectId: n.projectId, type: n.type, subject: n.subject,
      status: "open", priority: n.priority, ballInCourt: n.ballInCourt, createdById: currentUserId, createdAt: now,
      messages: [{ id: `m-${uid()}`, authorId: currentUserId, at: now, body: n.body }],
    };
    setRfis((prev) => [rfi, ...prev]);
    fetch("/api/rfis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rfi) }).catch(() => {});
    return id;
  }, []);

  const value: CollabCtx = { rfis, loading, currentUserId, personName, personRole, addMessage, setStatus, setBallInCourt, createRfi };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCollab() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCollab must be used within CollabProvider");
  return ctx;
}
