/**
 * Client-side mock dataset + cost engine port.
 * Lets the web app run fully standalone (NEXT_PUBLIC_DEMO_MODE) with no backend.
 * Mirrors packages/db/src/nz-dataset.ts and apps/api .../cost-engine.ts.
 * All prices are synthetic NZD ex-GST demo figures — not live quotes.
 */

export interface Supplier {
  code: string;
  name: string;
  reliability: number;
  avgLeadDays: number;
  baseDiscount: number;
  deliveryFlat: number;
  distanceKm: number;
  freeDeliveryThreshold?: number;
  rebatePct?: number;
}

export const SUPPLIERS: Supplier[] = [
  { code: "PLACEMAKERS", name: "PlaceMakers", reliability: 0.96, avgLeadDays: 1, baseDiscount: 0.14, deliveryFlat: 0, distanceKm: 12, freeDeliveryThreshold: 1500, rebatePct: 0.02 },
  { code: "CARTERS", name: "Carters", reliability: 0.94, avgLeadDays: 2, baseDiscount: 0.11, deliveryFlat: 50, distanceKm: 22 },
  { code: "ITM", name: "ITM", reliability: 0.93, avgLeadDays: 2, baseDiscount: 0.1, deliveryFlat: 45, distanceKm: 18 },
  { code: "MITRE10_TRADE", name: "Mitre 10 Trade", reliability: 0.92, avgLeadDays: 1, baseDiscount: 0.08, deliveryFlat: 55, distanceKm: 20 },
  { code: "BUNNINGS_TRADE", name: "Bunnings Trade", reliability: 0.9, avgLeadDays: 1, baseDiscount: 0.05, deliveryFlat: 60, distanceKm: 16 },
  { code: "MICO", name: "Mico", reliability: 0.91, avgLeadDays: 2, baseDiscount: 0.09, deliveryFlat: 55, distanceKm: 24 },
  { code: "PLUMBING_WORLD", name: "Plumbing World", reliability: 0.92, avgLeadDays: 2, baseDiscount: 0.1, deliveryFlat: 50, distanceKm: 26 },
  { code: "REECE", name: "Reece", reliability: 0.93, avgLeadDays: 2, baseDiscount: 0.09, deliveryFlat: 55, distanceKm: 28 },
  { code: "BUILDLINK", name: "BuildLink", reliability: 0.89, avgLeadDays: 3, baseDiscount: 0.07, deliveryFlat: 70, distanceKm: 35 },
  { code: "TIMBERWORLD", name: "TimberWorld", reliability: 0.9, avgLeadDays: 2, baseDiscount: 0, deliveryFlat: 65, distanceKm: 40 },
  { code: "CST_TRADE", name: "CST Trade", reliability: 0.88, avgLeadDays: 3, baseDiscount: 0.06, deliveryFlat: 70, distanceKm: 38 },
  { code: "SCP", name: "Specialized Construction Products", reliability: 0.9, avgLeadDays: 3, baseDiscount: 0.08, deliveryFlat: 75, distanceKm: 42 },
];

export interface Product {
  key: string;
  name: string;
  category: string;
  unit: string;
  prices: Record<string, number>;
}

export const PRODUCTS: Product[] = [
  { key: "h12-sg8-90x45", name: "H1.2 SG8 90x45 Framing Timber", category: "FRAMING", unit: "lm", prices: { PLACEMAKERS: 8.2, CARTERS: 7.95, ITM: 7.7, MITRE10_TRADE: 8.05, BUNNINGS_TRADE: 7.45, TIMBERWORLD: 7.1, BUILDLINK: 7.6 } },
  { key: "h32-140x45", name: "H3.2 SG8 140x45 Treated Timber", category: "TIMBER", unit: "lm", prices: { PLACEMAKERS: 14.6, CARTERS: 14.1, ITM: 13.85, MITRE10_TRADE: 14.4, BUNNINGS_TRADE: 13.5, TIMBERWORLD: 12.95 } },
  { key: "gib-standard-13", name: "GIB Standard 13mm 2400x1200", category: "GIB", unit: "sheet", prices: { PLACEMAKERS: 28.9, CARTERS: 29.4, ITM: 28.6, MITRE10_TRADE: 27.95, BUNNINGS_TRADE: 27.5, BUILDLINK: 28.2 } },
  { key: "gib-aqualine-13", name: "GIB Aqualine 13mm 2400x1200", category: "GIB", unit: "sheet", prices: { PLACEMAKERS: 46.5, CARTERS: 47.2, ITM: 45.9, MITRE10_TRADE: 45.1, BUNNINGS_TRADE: 44.8 } },
  { key: "pink-batts-r32", name: "Pink Batts R3.2 Ceiling Insulation", category: "INSULATION", unit: "pack", prices: { PLACEMAKERS: 78, CARTERS: 76.5, ITM: 77.2, MITRE10_TRADE: 74.9, BUNNINGS_TRADE: 73.5, SCP: 72.8 } },
  { key: "concrete-20mpa", name: "Ready-Mix Concrete 20MPa", category: "CONCRETE", unit: "m³", prices: { PLACEMAKERS: 245, CARTERS: 250, ITM: 248, SCP: 239 } },
  { key: "rebar-d12-6m", name: "Reinforcing Bar D12 6m 500E", category: "CONCRETE", unit: "each", prices: { PLACEMAKERS: 18.4, CARTERS: 18.9, ITM: 17.95, SCP: 17.2, CST_TRADE: 17.5 } },
  { key: "gib-screws-32", name: "GIB Grabber Screws 32mm (1000pk)", category: "FASTENERS", unit: "box", prices: { PLACEMAKERS: 32.5, CARTERS: 31.9, ITM: 31.5, MITRE10_TRADE: 30.9, BUNNINGS_TRADE: 29.8, CST_TRADE: 28.9 } },
  { key: "coloursteel-roof", name: "COLORSTEEL Endura Corrugate Roofing", category: "ROOFING", unit: "m²", prices: { PLACEMAKERS: 41, CARTERS: 42.5, ITM: 40.5, BUILDLINK: 39.9, SCP: 39.2 } },
  { key: "weatherboard-180", name: "Bevel Back Weatherboard 180mm Primed", category: "CLADDING", unit: "lm", prices: { PLACEMAKERS: 11.9, CARTERS: 11.4, ITM: 11.2, TIMBERWORLD: 10.6 } },
  { key: "pvc-pipe-100", name: "DWV PVC Pipe 100mm x 6m", category: "PLUMBING", unit: "each", prices: { MICO: 64, PLUMBING_WORLD: 62.5, REECE: 63.2, PLACEMAKERS: 66 } },
  { key: "tps-cable-25", name: "TPS Cable 2.5mm 100m Coil", category: "ELECTRICAL", unit: "coil", prices: { PLACEMAKERS: 168, MITRE10_TRADE: 162, BUNNINGS_TRADE: 159, CST_TRADE: 154, SCP: 157 } },
];

const FRAMING_CATEGORY_DISCOUNT: Record<string, number> = { PLACEMAKERS: 0.18 };

export interface Ranked {
  code: string;
  name: string;
  listPrice: number;
  discount: number;
  unitNet: number;
  subtotal: number;
  delivery: number;
  rebate: number;
  landed: number;
  landedUnit: number;
  leadDays: number;
  reliability: number;
  score: number;
  recommended: boolean;
  cheapest: boolean;
}

export function optimize(product: Product, qty: number) {
  const weights = { cost: 0.7, reliability: 0.2, leadTime: 0.1 };
  const rows = Object.entries(product.prices).map(([code, listPrice]) => {
    const s = SUPPLIERS.find((x) => x.code === code)!;
    const catDisc = product.category === "FRAMING" ? FRAMING_CATEGORY_DISCOUNT[code] : undefined;
    const discount = catDisc ?? s.baseDiscount;
    const unitNet = +(listPrice * (1 - discount)).toFixed(4);
    const subtotal = +(unitNet * qty).toFixed(2);
    const delivery = s.freeDeliveryThreshold && subtotal >= s.freeDeliveryThreshold ? 0 : s.deliveryFlat;
    const rebate = +(subtotal * (s.rebatePct ?? 0)).toFixed(2);
    const landed = +(subtotal + delivery - rebate).toFixed(2);
    return { code, name: s.name, listPrice, discount, unitNet, subtotal, delivery, rebate, landed, landedUnit: +(landed / qty).toFixed(4), leadDays: s.avgLeadDays, reliability: s.reliability, score: 0, recommended: false, cheapest: false } as Ranked;
  });

  const landeds = rows.map((r) => r.landed);
  const leads = rows.map((r) => r.leadDays);
  const min = Math.min(...landeds), max = Math.max(...landeds);
  const minL = Math.min(...leads), maxL = Math.max(...leads);
  rows.forEach((r) => {
    const costScore = max === min ? 1 : (max - r.landed) / (max - min);
    const leadScore = maxL === minL ? 1 : (maxL - r.leadDays) / (maxL - minL);
    r.score = +(weights.cost * costScore + weights.reliability * r.reliability + weights.leadTime * leadScore).toFixed(4);
  });
  rows.sort((a, b) => b.score - a.score);
  const cheapest = [...rows].sort((a, b) => a.landed - b.landed)[0];
  rows[0].recommended = true;
  cheapest.cheapest = true;
  return { rows, best: rows[0], cheapest, maxSaving: +(max - min).toFixed(2) };
}

// ─── Geo + delivery tracking (for the central map) ───
// lat/long → SVG coords for viewBox 460×640 (see DeliveryMap).
export const project = (lat: number, long: number) => ({
  x: ((long - 166.2) / 12.6) * 380 + 40,
  y: ((-34.0 - lat) / 13.4) * 560 + 40,
});

export interface Place { nm: string; lat: number; long: number }

export const SUPPLIER_BRANCHES: Record<string, Place> = {
  PM: { nm: "PlaceMakers Riccarton", lat: -43.53, long: 172.578 },
  ITM: { nm: "ITM Hornby", lat: -43.545, long: 172.527 },
  CAR: { nm: "Carters Sydenham", lat: -43.546, long: 172.636 },
  TW: { nm: "TimberWorld Woolston", lat: -43.555, long: 172.69 },
  M10: { nm: "Mitre 10 Mega Papanui", lat: -43.487, long: 172.602 },
  BUN: { nm: "Bunnings Shirley", lat: -43.503, long: 172.66 },
};

// delivery destinations — aligned to the Christchurch projects
export const PROJECT_SITES: Record<string, Place> = {
  HOB: { nm: "Riccarton Townhouses", lat: -43.531, long: 172.585 },
  CAM: { nm: "Halswell Subdivision", lat: -43.548, long: 172.552 },
  TGA: { nm: "Papanui Apartments", lat: -43.492, long: 172.607 },
  JVL: { nm: "Sumner Cliff House", lat: -43.566, long: 172.756 },
  ROL: { nm: "Rolleston Industrial", lat: -43.589, long: 172.383 },
  QTN: { nm: "Lincoln Lifestyle Build", lat: -43.645, long: 172.484 },
};

export type ShipStatus = "in_transit" | "scheduled" | "delivered";
export interface Shipment {
  id: number; po: string; from: string; to: string; material: string; qty: string;
  carrier: string; value: number; status: ShipStatus; eta: string; progress: number; risk?: boolean;
}

export const SHIPMENTS: Shipment[] = [
  { id: 1, po: "PO-104471", from: "PM", to: "TGA", material: "H1.2 90×45 framing", qty: "1,450 lm", carrier: "Mainfreight", value: 11700, status: "in_transit", eta: "Today 2:00pm", progress: 0.6 },
  { id: 2, po: "PO-104468", from: "ITM", to: "HOB", material: "GIB Standard 13mm", qty: "220 sheets", carrier: "PBT", value: 6300, status: "in_transit", eta: "Tomorrow 9am", progress: 0.3 },
  { id: 3, po: "PO-104452", from: "CAR", to: "CAM", material: "Pink Batts R3.2", qty: "38 packs", carrier: "Carters Fleet", value: 2900, status: "scheduled", eta: "Thu 8:00am", progress: 0 },
  { id: 4, po: "PO-104470", from: "TW", to: "TGA", material: "Bevel Back Weatherboard", qty: "640 lm", carrier: "Owner driver", value: 4100, status: "in_transit", eta: "Today 4:00pm", progress: 0.8 },
  { id: 5, po: "PO-104440", from: "M10", to: "JVL", material: "COLORSTEEL Endura roof", qty: "210 m²", carrier: "NZ Post", value: 8800, status: "delivered", eta: "Delivered 9:12am", progress: 1 },
  { id: 6, po: "PO-104466", from: "BUN", to: "ROL", material: "20MPa concrete + D12 rebar", qty: "12 m³ + 80", carrier: "Mainfreight", value: 14200, status: "in_transit", eta: "At risk · +1 day", progress: 0.45, risk: true },
  { id: 7, po: "PO-104475", from: "PM", to: "QTN", material: "Cladding system", qty: "185 m²", carrier: "Owner driver", value: 9500, status: "scheduled", eta: "Mon 7:00am", progress: 0 },
];

// Semantic delivery status colours (Foundry intents).
export const STATUS_COLOR: Record<ShipStatus, string> = {
  in_transit: "#4c90f0", scheduled: "#8f99a8", delivered: "#32a467",
};
export const STATUS_TONE: Record<ShipStatus, "info" | "neutral" | "positive"> = {
  in_transit: "info", scheduled: "neutral", delivered: "positive",
};
export const STATUS_LABEL: Record<ShipStatus, string> = {
  in_transit: "In transit", scheduled: "Scheduled", delivered: "Delivered",
};

// Stylized NZ island outlines for the SVG map.
export const ISLAND_NORTH = "M235,58 C250,90 280,120 298,159 C340,150 390,165 412,194 C400,225 375,250 363,269 C345,300 320,330 299,345 C285,320 270,290 277,251 C260,220 245,150 240,110 C238,90 233,72 235,58 Z";
export const ISLAND_SOUTH = "M236,312 C248,325 255,335 253,344 C250,380 240,410 234,438 C215,475 190,510 170,536 C150,552 125,562 105,566 C80,548 62,532 55,516 C95,470 150,425 184,404 C205,375 220,340 236,312 Z";

export const EXEC = {
  totalSpend: 1284500,
  totalSavings: 138920,
  costReductionPct: 9.8,
  openPOs: 14,
  topSuppliers: [
    { name: "PlaceMakers", spend: 512000, savings: 61000 },
    { name: "ITM", spend: 318000, savings: 34200 },
    { name: "Carters", spend: 224500, savings: 21800 },
    { name: "TimberWorld", spend: 130000, savings: 14600 },
  ],
  monthlyTrend: [
    { month: "Jan", spend: 188000, savings: 17600 },
    { month: "Feb", spend: 201000, savings: 19900 },
    { month: "Mar", spend: 214000, savings: 22100 },
    { month: "Apr", spend: 226500, savings: 24800 },
    { month: "May", spend: 233000, savings: 26600 },
    { month: "Jun", spend: 222000, savings: 27920 },
  ],
};
