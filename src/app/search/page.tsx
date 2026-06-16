"use client";
import { useMemo, useState } from "react";
import { SideRail } from "../../components/Shell";
import { PRODUCTS, optimize } from "../../lib/mock-data";
import { nzd } from "../../lib/format";
import {
  Input, Card, CardHeader, CardTitle, CardBody, Table, THead, TBody, TR, TH, TD, Badge,
} from "../../components/ui";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [qty, setQty] = useState(100);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) => !query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <div className="min-h-[100dvh] bg-surface-base pb-16 md:pb-0 md:pl-rail">
      <SideRail />

      <header className="sticky top-0 z-20 border-b border-line-subtle bg-surface-raised/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <h1 className="mb-2.5 text-lg font-semibold">Search &amp; supplier comparison</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search materials… e.g. GIB, H1.2 framing, concrete"
                className="pl-9"
              />
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm text-fg-muted">
              Qty
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-24"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-fg-faint">
            {results.length} product{results.length === 1 ? "" : "s"} · landed cost includes your trade discount,
            delivery &amp; rebate (synthetic ex-GST demo figures)
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5">
        {results.length === 0 && <p className="text-base text-fg-muted">No products match “{q}”.</p>}

        {results.map((p) => {
          const r = optimize(p, qty);
          return (
            <Card key={p.key}>
              <CardHeader>
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <div className="mt-0.5 text-xs text-fg-faint">
                    {p.category} · per {p.unit} · {r.rows.length} suppliers · {qty.toLocaleString()} {p.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-md text-fg">{nzd(r.cheapest.landed)}</div>
                  <div className="text-xs text-positive-fg">save {nzd(r.maxSaving)} vs dearest</div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto px-4 pb-2">
                  <Table>
                    <THead>
                      <TH>Supplier</TH>
                      <TH align="right">List</TH>
                      <TH align="right">Your net</TH>
                      <TH align="right">Delivery</TH>
                      <TH align="right">Rebate</TH>
                      <TH align="right">Landed</TH>
                      <TH align="right">/ {p.unit}</TH>
                      <TH align="right">Lead</TH>
                    </THead>
                    <TBody>
                      {r.rows.map((row) => (
                        <TR key={row.code}>
                          <TD>
                            <div className="flex items-center gap-2">
                              <span className="text-fg">{row.name}</span>
                              {row.recommended && <Badge tone="positive">Best</Badge>}
                              {row.cheapest && !row.recommended && <Badge tone="info">Cheapest</Badge>}
                            </div>
                          </TD>
                          <TD align="right" mono className="text-fg-muted">{nzd(row.listPrice)}</TD>
                          <TD align="right" mono>{nzd(row.unitNet)}</TD>
                          <TD align="right" mono className="text-fg-muted">{row.delivery ? nzd(row.delivery) : "Free"}</TD>
                          <TD align="right" mono className="text-fg-muted">{row.rebate ? "−" + nzd(row.rebate) : "—"}</TD>
                          <TD align="right" mono className="text-fg">{nzd(row.landed)}</TD>
                          <TD align="right" mono className="text-fg-muted">{nzd(row.landedUnit)}</TD>
                          <TD align="right" className="text-fg-muted">{row.leadDays}d</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
