"use client";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polygon, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { Plus, Minus, Layers } from "lucide-react";
import { PROJECTS, LOT_STATUS, projectById } from "../lib/site-data";
import { SHIPMENTS, SUPPLIER_BRANCHES, PROJECT_SITES, STATUS_COLOR } from "../lib/mock-data";
import { cx } from "./ui";

type LL = [number, number];

function curve(a: LL, b: LL): LL[] {
  const mid: LL = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.08, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.08];
  const pts: LL[] = [];
  for (let t = 0; t <= 1.0001; t += 0.05) {
    pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mid[0] + t ** 2 * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * mid[1] + t ** 2 * b[1]]);
  }
  return pts;
}

// fly to the active project (editing or selected); otherwise frame all of NZ
function MapView({ editingId, selectedId }: { editingId: string | null; selectedId: string | null }) {
  const map = useMap();
  React.useEffect(() => {
    const id = editingId ?? selectedId;
    if (id) {
      const p = projectById(id);
      if (p) map.flyToBounds(L.latLngBounds(p.boundary as LL[]), { maxZoom: editingId ? 17 : 16, padding: [120, 120] });
    } else {
      map.flyToBounds(L.latLngBounds(PROJECTS.map((p) => [p.lat, p.long] as LL)), { padding: [70, 70] });
    }
  }, [editingId, selectedId, map]);
  return null;
}

function Controls({ layer, setLayer }: { layer: "imagery" | "map"; setLayer: (l: "imagery" | "map") => void }) {
  const map = useMap();
  const btn = "grid h-9 w-9 place-items-center text-fg-muted hover:text-fg transition-colors";
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
      <div className="flex flex-col overflow-hidden rounded-md border border-line bg-surface-raised/95 backdrop-blur">
        <button onClick={() => map.zoomIn()} className={cx(btn, "border-b border-line-subtle")} aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        <button onClick={() => map.zoomOut()} className={btn} aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
      </div>
      <button onClick={() => setLayer(layer === "imagery" ? "map" : "imagery")}
        className="flex items-center gap-1.5 rounded-md border border-line bg-surface-raised/95 px-2.5 py-1.5 text-2xs font-medium text-fg-muted backdrop-blur hover:text-fg">
        <Layers className="h-3.5 w-3.5" /> {layer === "imagery" ? "Imagery" : "Map"}
      </button>
    </div>
  );
}

const handleIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;background:#fff;border:2px solid #4c90f0;border-radius:2px;box-shadow:0 0 0 2px rgba(0,0,0,.45)"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});
const pinIcon = (color: string) => L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.6)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

// click map to append a vertex; drag handles to move; right-click handle to remove
function BoundaryEditor({ coords, onChange }: { coords: LL[]; onChange: (c: LL[]) => void }) {
  useMapEvents({ click: (e) => onChange([...coords, [e.latlng.lat, e.latlng.lng]]) });
  return (
    <>
      <Polygon positions={coords} pathOptions={{ color: "#4c90f0", weight: 2, dashArray: "5 4", fillColor: "#4c90f0", fillOpacity: 0.12 }} />
      {coords.map((c, i) => (
        <Marker key={i} position={c} draggable icon={handleIcon}
          eventHandlers={{
            drag: (e) => { const ll = (e.target as L.Marker).getLatLng(); onChange(coords.map((p, idx) => (idx === i ? [ll.lat, ll.lng] : p))); },
            contextmenu: () => { if (coords.length > 3) onChange(coords.filter((_, idx) => idx !== i)); },
          }} />
      ))}
    </>
  );
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  showDeliveries: boolean;
  editingId: string | null;
  boundaries: Record<string, LL[]>;
  onBoundaryChange: (id: string, coords: LL[]) => void;
}

export default function SiteMap({ selectedId, onSelect, showDeliveries, editingId, boundaries, onBoundaryChange }: Props) {
  const [layer, setLayer] = React.useState<"imagery" | "map">("map");
  const editing = !!editingId;
  const sel = !editing && selectedId ? projectById(selectedId) : null;

  return (
    <MapContainer center={[-41, 173.2]} zoom={5} zoomControl={false} attributionControl
      style={{ height: "100%", width: "100%", background: "#0f1113" }}>
      {layer === "imagery" ? (
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Imagery © Esri" maxZoom={19} />
      ) : (
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap © CARTO" maxZoom={19} />
      )}
      <MapView editingId={editingId} selectedId={selectedId} />

      {/* boundary editor (focused) */}
      {editing && editingId && (
        <BoundaryEditor coords={boundaries[editingId] ?? []} onChange={(c) => onBoundaryChange(editingId, c)} />
      )}

      {/* only the selected project shows on the map */}
      {sel && (
        <>
          <Polygon positions={boundaries[sel.id] ?? sel.boundary} eventHandlers={{ click: () => onSelect(sel.id) }}
            pathOptions={{ color: LOT_STATUS[sel.status].color, weight: 2.5, opacity: 0.95, fillColor: LOT_STATUS[sel.status].color, fillOpacity: 0.35 }} />
          <Marker position={[sel.lat, sel.long]} icon={pinIcon(LOT_STATUS[sel.status].color)}>
            <Tooltip permanent direction="top" offset={[0, -8]} className="lot-tip">{sel.name}</Tooltip>
          </Marker>
        </>
      )}

      {/* deliveries overlay (independent toggle) */}
      {!editing && showDeliveries && SHIPMENTS.map((s) => {
        const a = [SUPPLIER_BRANCHES[s.from].lat, SUPPLIER_BRANCHES[s.from].long] as LL;
        const b = [PROJECT_SITES[s.to].lat, PROJECT_SITES[s.to].long] as LL;
        const pts = curve(a, b);
        const col = s.risk ? "#e76a6e" : STATUS_COLOR[s.status];
        return (
          <React.Fragment key={`d${s.id}`}>
            <Polyline positions={pts} pathOptions={{ color: col, weight: 2, opacity: 0.85, dashArray: s.status === "in_transit" ? "1 7" : undefined }} />
            {s.status !== "delivered" && (
              <Marker position={pts[Math.round(s.progress * (pts.length - 1))]}
                icon={L.divIcon({ className: "", html: `<div class="mk-dot ${s.status === "in_transit" ? "is-live" : ""}" style="background:${col}"></div>`, iconSize: [10, 10], iconAnchor: [5, 5] })}>
                <Tooltip>{s.material} → {PROJECT_SITES[s.to].nm} · {s.eta}</Tooltip>
              </Marker>
            )}
          </React.Fragment>
        );
      })}

      <Controls layer={layer} setLayer={setLayer} />
    </MapContainer>
  );
}
