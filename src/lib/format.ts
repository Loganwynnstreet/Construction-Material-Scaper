export const nzd = (n: number, dp = 2) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", minimumFractionDigits: dp, maximumFractionDigits: dp }).format(n);

export const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

/** Compact relative time, e.g. "3h", "2d", "just now". */
export function ago(iso: string | number | Date): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

/** "12 Jun, 2:00pm" style timestamp. */
export function dateTime(iso: string | number | Date): string {
  return new Date(iso).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function dateShort(iso: string | number | Date): string {
  return new Date(iso).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}
