// Pure helpers converting between the admin form's grouped specifications and
// the flat shape the storefront cards/filters already rely on. No server imports.

export type SpecGroups = Record<string, Record<string, string>>;

export interface FlatSpecs {
  processor: string;
  ram: string;
  storage: string;
  display: { size: string; resolution: string; type: string; touchscreen: boolean };
  graphics: string;
  ports: string[];
  weight: string;
  os: string;
}

/** Group names the admin form produces. Used to tell grouped specs from legacy flat specs. */
export const KNOWN_SPEC_GROUPS = [
  "Processor",
  "Display",
  "Memory",
  "Storage",
  "Graphics",
  "Keyboard & TouchPad",
  "Camera & Audio",
  "Ports & Slots",
  "Network & Connectivity",
  "Security",
  "Software",
  "Power",
  "Physical Specification",
  "Other Features",
  "Warranty",
  "General",
  "Peripherals & Accessories",
] as const;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** True when `specs` uses the admin form's grouped layout (not legacy flat keys). */
export function isGroupedSpecs(specs: unknown): specs is SpecGroups {
  if (!isPlainObject(specs)) return false;
  return Object.keys(specs).some(
    (k) => (KNOWN_SPEC_GROUPS as readonly string[]).includes(k) && isPlainObject(specs[k]),
  );
}

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

/** Grouped → the flat fields storefront cards, search and filters read. */
export function groupsToFlat(groups: SpecGroups): FlatSpecs {
  const g = (group: string, label: string) => clean(groups[group]?.[label]);
  const ports = [
    g("Ports & Slots", "USB 3.0 Port"),
    g("Ports & Slots", "USB Type-C / Thunderbolt Port"),
    g("Ports & Slots", "Headphone & Microphone Port"),
  ].filter(Boolean);

  const touch = g("Display", "Touch Screen").toLowerCase();
  const processor =
    [g("Processor", "Processor Brand"), g("Processor", "Processor Model")]
      .filter(Boolean)
      .join(" ")
      .replace(/^(Intel|AMD)\s+\1\s+/i, "$1 ") || g("Processor", "Processor Model");

  return {
    processor,
    ram: [g("Memory", "RAM"), g("Memory", "RAM Type")].filter(Boolean).join(" "),
    storage: [g("Storage", "Storage Capacity"), g("Storage", "Storage Type")].filter(Boolean).join(" "),
    display: {
      size: g("Display", "Display Size"),
      resolution: g("Display", "Display Resolution"),
      type: g("Display", "Display Type"),
      touchscreen: ["yes", "true", "touch", "touchscreen"].includes(touch),
    },
    graphics: g("Graphics", "Graphics Model"),
    ports,
    weight: g("Physical Specification", "Weight"),
    os: g("Software", "Operating System"),
  };
}

/** Legacy flat specs → grouped, so the admin form can edit products created before grouping existed. */
export function flatToGroups(flat: Partial<FlatSpecs> | undefined | null): SpecGroups {
  if (!flat) return {};
  const out: SpecGroups = {};
  const put = (group: string, label: string, value: unknown) => {
    const v = clean(value);
    if (!v) return;
    (out[group] ??= {})[label] = v;
  };
  put("Processor", "Processor Model", flat.processor);
  put("Memory", "RAM", flat.ram);
  put("Storage", "Storage Capacity", flat.storage);
  put("Graphics", "Graphics Model", flat.graphics);
  put("Software", "Operating System", flat.os);
  put("Physical Specification", "Weight", flat.weight);
  const d = flat.display as FlatSpecs["display"] | string | undefined;
  if (isPlainObject(d)) {
    put("Display", "Display Size", d.size);
    put("Display", "Display Resolution", d.resolution);
    put("Display", "Display Type", d.type);
    if (d.touchscreen) put("Display", "Touch Screen", "Yes");
  } else {
    put("Display", "Display Size", d);
  }
  if (Array.isArray(flat.ports) && flat.ports.length > 0) {
    put("Ports & Slots", "USB 3.0 Port", flat.ports.join(", "));
  }
  return out;
}

/** Drop empty values/groups so storage and the storefront never carry blanks. */
export function pruneGroups(groups: SpecGroups): SpecGroups {
  const out: SpecGroups = {};
  for (const [group, rows] of Object.entries(groups)) {
    if (!isPlainObject(rows)) continue;
    const kept: Record<string, string> = {};
    for (const [label, value] of Object.entries(rows)) {
      const v = clean(value);
      if (label.trim() && v) kept[label.trim()] = v;
    }
    if (Object.keys(kept).length > 0) out[group] = kept;
  }
  return out;
}
