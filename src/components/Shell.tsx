"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCollab } from "../lib/collab-store";
import { cx, Avatar } from "./ui";
import {
  LayoutDashboard, Map, MessagesSquare, PackageSearch, Settings, ChevronsUpDown, Network, BarChart3,
  Search, Sparkles, Bell,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Site map", icon: Map },
  { href: "/explore", label: "Explore", icon: Network },
  { href: "/rfis", label: "Queries & RFIs", icon: MessagesSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/search", label: "Procurement", icon: PackageSearch },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** App-wide navigation: a fixed left rail on desktop, a bottom tab bar on mobile. */
export function SideRail() {
  const pathname = usePathname();
  const { rfis } = useCollab();
  const open = rfis.filter((r) => r.status === "open" || r.status === "in_review").length;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-rail flex-col border-r border-line-subtle bg-surface-base md:flex">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] text-white" aria-hidden="true">
            <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 7.5 L16.2 15 H7.8 Z" fill="currentColor" />
          </svg>
          <span className="font-display text-base font-semibold tracking-tight">Construction OS</span>
        </div>

        <button className="mx-3 mb-2 flex items-center justify-between rounded-md border border-line-subtle bg-surface-raised px-3 py-2 text-left hover:bg-surface-overlay">
          <span className="min-w-0">
            <span className="block text-2xs text-fg-faint">Workspace</span>
            <span className="block truncate text-sm font-medium">All projects</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-fg-faint" />
        </button>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link key={href} href={href}
                className={cx(
                  "relative flex items-center gap-3 rounded px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-surface-overlay font-medium text-fg before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-primary before:content-['']"
                    : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                )}>
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {href === "/rfis" && open > 0 && (
                  <span className="rounded-full bg-warning/15 px-1.5 text-2xs font-semibold text-warning-fg">{open}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line-subtle p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name="Logan Street" size={30} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Logan Street</div>
              <div className="truncate text-2xs text-fg-faint">Project manager</div>
            </div>
            <Settings className="h-4 w-4 text-fg-faint hover:text-fg" />
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-line-subtle bg-surface-base/95 backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href}
              className={cx("flex flex-1 flex-col items-center justify-center gap-1 text-2xs", active ? "text-fg" : "text-fg-faint")}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/** Sticky page header: a Foundry-style global command bar + page title row. */
export function PageHeader({ title, sub, actions, children }: { title: string; sub?: string; actions?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface-base/90 backdrop-blur">
      {/* command bar */}
      <div className="flex h-9 items-center gap-2 border-b border-line-subtle px-4 md:px-6">
        <span className="text-2xs text-fg-faint">Construction OS</span>
        <span className="text-fg-faint">/</span>
        <span className="text-2xs text-fg-muted">{title}</span>
        <button className="mx-auto hidden h-6 w-full max-w-sm items-center gap-2 rounded border border-line bg-surface-inset px-2.5 text-2xs text-fg-faint hover:border-line-strong md:flex">
          <Search className="h-3 w-3" />
          <span>Search ontology — objects, lots, queries…</span>
          <kbd className="ml-auto rounded border border-line px-1 text-fg-faint">⌘K</kbd>
        </button>
        <button className="ml-auto flex h-6 items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-2 text-2xs font-medium text-primary-fg hover:bg-primary/15">
          <Sparkles className="h-3 w-3" /> AIP
        </button>
        <button aria-label="Notifications" className="grid h-6 w-6 place-items-center rounded text-fg-faint hover:bg-surface-overlay hover:text-fg"><Bell className="h-3.5 w-3.5" /></button>
        <Avatar name="Logan Street" size={22} />
      </div>
      {/* title row */}
      <div className="flex items-center gap-3 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold leading-tight">{title}</h1>
          {sub && <p className="mt-0.5 truncate text-xs text-fg-muted">{sub}</p>}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
