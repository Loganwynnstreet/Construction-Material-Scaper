"use client";
import * as React from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Buttons ---------------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md";
const BTN_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-line-strong bg-surface-overlay text-fg hover:bg-surface-hover",
  ghost: "text-fg-muted hover:bg-surface-overlay hover:text-fg",
  danger: "bg-danger text-white hover:bg-danger/90",
};
const BTN_SIZE: Record<BtnSize, string> = { sm: "h-7 px-2.5 text-xs", md: "h-8 px-3 text-sm" };

export function Button({
  variant = "secondary", size = "md", className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  return <button className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], className)} {...props} />;
}

export function IconButton({ className, label, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label}
      className={cx("grid h-8 w-8 place-items-center rounded border border-line-strong bg-surface-overlay text-fg-muted hover:bg-surface-hover hover:text-fg transition-colors", className)}
      {...props} />
  );
}

/* ---------------- Inputs ---------------- */
const FIELD =
  "w-full rounded border border-line-strong bg-surface-inset px-2.5 text-sm text-fg placeholder:text-fg-faint transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cx(FIELD, "h-8", className)} {...props} />;
  },
);

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(FIELD, "py-2 leading-relaxed resize-none", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(FIELD, "h-8 appearance-none pr-8 cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: React.ReactNode; hint?: string; error?: string | null }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-fg-muted">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-2xs text-danger-fg">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-2xs text-fg-faint">{hint}</span>
      ) : null}
    </label>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-lg border border-line-subtle bg-surface-raised shadow-panel", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("flex items-start justify-between gap-3 border-b border-line-subtle px-4 py-3", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx("text-sm font-semibold text-fg", className)} {...props} />;
}
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("p-4", className)} {...props} />;
}

/* ---------------- Table ---------------- */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx("w-full border-collapse text-sm", className)} {...props} />;
}
export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line-subtle">{children}</tr>
    </thead>
  );
}
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}
export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cx("border-b border-line-subtle last:border-0 hover:bg-surface-overlay/50", className)} {...props} />;
}
const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;
export function TH({ children, align = "left" }: { children?: React.ReactNode; align?: keyof typeof ALIGN }) {
  return <th className={cx("py-2 px-2 text-2xs font-medium uppercase tracking-wide text-fg-faint", ALIGN[align])}>{children}</th>;
}
export function TD({
  children, align = "left", mono, className,
}: { children?: React.ReactNode; align?: keyof typeof ALIGN; mono?: boolean; className?: string }) {
  return <td className={cx("py-2.5 px-2 text-sm", ALIGN[align], mono && "data", className)}>{children}</td>;
}

/* ---------------- Badge / status ---------------- */
type Tone = "neutral" | "positive" | "info" | "warning" | "danger";
const TONE: Record<Tone, string> = {
  neutral: "border-line bg-surface-overlay text-fg-muted",
  positive: "border-positive/30 bg-positive/12 text-positive-fg",
  info: "border-info/30 bg-info/12 text-info-fg",
  warning: "border-warning/30 bg-warning/12 text-warning-fg",
  danger: "border-danger/30 bg-danger/12 text-danger-fg",
};
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-2xs font-medium", TONE[tone], className)}>
      {children}
    </span>
  );
}
const DOT: Record<Tone, string> = {
  neutral: "bg-fg-faint", positive: "bg-positive", info: "bg-info", warning: "bg-warning", danger: "bg-danger",
};
export function StatusDot({ tone = "neutral", pulse }: { tone?: Tone; pulse?: boolean }) {
  return <span className={cx("inline-block h-1.5 w-1.5 rounded-full", DOT[tone], pulse && "animate-pulseDot")} />;
}

/* ---------------- Progress ---------------- */
export function Progress({ value, tone = "info", className }: { value: number; tone?: Tone; className?: string }) {
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-surface-overlay", className)}>
      <div className={cx("h-full rounded-full", DOT[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="grid shrink-0 place-items-center rounded-full border border-line bg-surface-overlay font-medium text-fg-muted"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

/* ---------------- Tabs (controlled) ---------------- */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-line-subtle">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cx(
            "relative -mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            value === t.id ? "border-primary text-fg" : "border-transparent text-fg-muted hover:text-fg",
          )}>
          {t.label}
          {t.count != null && <span className="ml-1.5 text-2xs text-fg-faint">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Segmented ---------------- */
export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: React.ReactNode }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-surface-inset p-0.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={cx("rounded px-2.5 py-1 text-xs font-medium transition-colors", value === o.id ? "bg-surface-overlay text-fg" : "text-fg-muted hover:text-fg")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-fg-faint">{icon}</div>}
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-fg-muted">{hint}</p>}
    </div>
  );
}
