import test from "node:test";
import assert from "node:assert/strict";
import {
  isGroupedSpecs,
  groupsToFlat,
  flatToGroups,
  pruneGroups,
} from "../../lib/product-specs.ts";

test("isGroupedSpecs - detection", () => {
  // Valid grouped specs
  assert.equal(
    isGroupedSpecs({
      Processor: { "Processor Model": "Core i7-1165G7" },
      Memory: { RAM: "16GB" },
    }),
    true
  );

  assert.equal(
    isGroupedSpecs({
      Storage: { "Storage Capacity": "512GB" },
      Display: { "Display Size": "14.0 Inch" },
    }),
    true
  );

  // Legacy flat specs
  assert.equal(
    isGroupedSpecs({
      processor: "Core i7-1165G7",
      ram: "16GB",
      storage: "512GB",
    }),
    false
  );

  // Primitives, arrays, and null/undefined
  assert.equal(isGroupedSpecs(null), false);
  assert.equal(isGroupedSpecs(undefined), false);
  assert.equal(isGroupedSpecs([]), false);
  assert.equal(isGroupedSpecs("string"), false);
  assert.equal(isGroupedSpecs(123), false);
  assert.equal(isGroupedSpecs({}), false);
});

test("groupsToFlat - converts grouped to flat format", () => {
  const groups = {
    Processor: {
      "Processor Brand": "Intel",
      "Processor Model": "Core i7-1165G7",
    },
    Memory: {
      RAM: "16GB",
      "RAM Type": "DDR4",
    },
    Storage: {
      "Storage Capacity": "512GB",
      "Storage Type": "NVMe SSD",
    },
    Display: {
      "Display Size": "14 Inch",
      "Display Resolution": "1920 x 1080",
      "Display Type": "IPS",
      "Touch Screen": "Yes",
    },
    Graphics: {
      "Graphics Model": "Intel Iris Xe",
    },
    "Ports & Slots": {
      "USB 3.0 Port": "2x USB 3.2",
      "USB Type-C / Thunderbolt Port": "1x Thunderbolt 4",
      "Headphone & Microphone Port": "1x Audio Combo Jack",
    },
    "Physical Specification": {
      Weight: "1.3 kg",
    },
    Software: {
      "Operating System": "Windows 11 Pro",
    },
  };

  const flat = groupsToFlat(groups);

  assert.equal(flat.processor, "Intel Core i7-1165G7");
  assert.equal(flat.ram, "16GB DDR4");
  assert.equal(flat.storage, "512GB NVMe SSD");
  assert.equal(flat.display.size, "14 Inch");
  assert.equal(flat.display.resolution, "1920 x 1080");
  assert.equal(flat.display.type, "IPS");
  assert.equal(flat.display.touchscreen, true);
  assert.equal(flat.graphics, "Intel Iris Xe");
  assert.equal(flat.weight, "1.3 kg");
  assert.equal(flat.os, "Windows 11 Pro");

  // Verify ports is kept as an array
  assert.ok(Array.isArray(flat.ports));
  assert.equal(flat.ports.length, 3);
  assert.deepEqual(flat.ports, [
    "2x USB 3.2",
    "1x Thunderbolt 4",
    "1x Audio Combo Jack",
  ]);
});

test("flatToGroups and round-trip conversion", () => {
  const originalFlat = {
    processor: "AMD Ryzen 7 5800U",
    ram: "16GB",
    storage: "512GB SSD",
    display: {
      size: "13.3 Inch",
      resolution: "1920x1080",
      type: "FHD IPS",
      touchscreen: true,
    },
    graphics: "AMD Radeon Graphics",
    ports: ["2x USB-A", "1x USB-C"],
    weight: "1.25 kg",
    os: "Windows 11",
  };

  const groups = flatToGroups(originalFlat);

  assert.equal(groups.Processor["Processor Model"], "AMD Ryzen 7 5800U");
  assert.equal(groups.Memory["RAM"], "16GB");
  assert.equal(groups.Storage["Storage Capacity"], "512GB SSD");
  assert.equal(groups.Display["Display Size"], "13.3 Inch");
  assert.equal(groups.Display["Display Resolution"], "1920x1080");
  assert.equal(groups.Display["Display Type"], "FHD IPS");
  assert.equal(groups.Display["Touch Screen"], "Yes");
  assert.equal(groups["Ports & Slots"]["USB 3.0 Port"], "2x USB-A, 1x USB-C");

  // Round trip: groupsToFlat(groups)
  const roundTripFlat = groupsToFlat(groups);

  assert.equal(roundTripFlat.processor, originalFlat.processor);
  assert.equal(roundTripFlat.ram, originalFlat.ram);
  assert.equal(roundTripFlat.storage, originalFlat.storage);
  assert.equal(roundTripFlat.display.size, originalFlat.display.size);
  assert.equal(roundTripFlat.display.resolution, originalFlat.display.resolution);
  assert.equal(roundTripFlat.display.touchscreen, true);
  assert.equal(roundTripFlat.graphics, originalFlat.graphics);
  assert.equal(roundTripFlat.weight, originalFlat.weight);
  assert.equal(roundTripFlat.os, originalFlat.os);

  // Keeps ports as an array
  assert.ok(Array.isArray(roundTripFlat.ports));
  assert.equal(roundTripFlat.ports.length, 1);
  assert.equal(roundTripFlat.ports[0], "2x USB-A, 1x USB-C");
});

test("pruneGroups - drops empty and whitespace values", () => {
  const dirtyGroups = {
    Processor: {
      "Processor Model": "Core i5-8250U",
      "Processor Cache": "   ",
      "Core Count": "",
    },
    Memory: {
      RAM: "",
      "RAM Type": null,
    },
    Storage: {
      "Storage Capacity": "256GB SSD",
    },
    EmptyGroup: {
      "Field 1": "",
    },
  };

  const pruned = pruneGroups(dirtyGroups);

  assert.deepEqual(pruned, {
    Processor: {
      "Processor Model": "Core i5-8250U",
    },
    Storage: {
      "Storage Capacity": "256GB SSD",
    },
  });

  // Entirely empty groups are removed
  assert.equal(pruned.Memory, undefined);
  assert.equal(pruned.EmptyGroup, undefined);
});
