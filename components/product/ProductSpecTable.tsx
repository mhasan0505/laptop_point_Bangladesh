import { Product } from "@/types/product";

interface ProductSpecTableProps {
  product: Product;
  selectedRam?: string;
  selectedSsd?: string;
}

export interface SpecCategory {
  category: string;
  items: Array<{ label: string; value: string }>;
}

export function buildProductSpecCategories(
  product: Product,
  selectedRam?: string,
  selectedSsd?: string
): SpecCategory[] {
  // Specifications entered in the admin form are shown exactly as entered:
  // no invented defaults for fields the shop did not fill in.
  if (product.specGroups) {
    const fromAdmin: SpecCategory[] = Object.entries(product.specGroups)
      .filter(([group]) => group !== "General")
      .map(([group, rows]) => ({
        category: group.toUpperCase(),
        items: Object.entries(rows)
          .filter(([, value]) => String(value ?? "").trim().length > 0)
          .map(([label, value]) => {
            let displayVal = String(value);
            if (label.toLowerCase().includes("installed ram") && selectedRam) {
              displayVal = selectedRam;
            } else if (label.toLowerCase().includes("installed storage") && selectedSsd) {
              displayVal = selectedSsd;
            }
            return { label, value: displayVal };
          }),
      }))
      .filter((group) => group.items.length > 0);

    const conditionItems: Array<{ label: string; value: string }> = [];
    if (product.grade) {
      conditionItems.push({ label: "Condition Grade", value: `Grade ${product.grade}` });
    } else if (product.condition && product.condition.length > 0) {
      conditionItems.push({ label: "Condition", value: product.condition.join(", ") });
    }
    if (product.warranty) conditionItems.push({ label: "Warranty", value: product.warranty });
    if (
      conditionItems.length > 0 &&
      !fromAdmin.some((g) => g.category === "WARRANTY" || g.category === "CONDITION & WARRANTY")
    ) {
      fromAdmin.push({ category: "CONDITION & WARRANTY", items: conditionItems });
    }
    if (fromAdmin.length > 0) return fromAdmin;
  }

  const raw = product.specs || {};
  const categories: SpecCategory[] = [];

  // 1. Processor & Performance
  const processorItems: Array<{ label: string; value: string }> = [];
  if (raw.processor) {
    processorItems.push({ label: "Processor", value: raw.processor });
  }
  if (raw.os) {
    processorItems.push({ label: "Operating System", value: raw.os });
  }
  if (processorItems.length > 0) {
    categories.push({ category: "PROCESSOR & PERFORMANCE", items: processorItems });
  }

  // 2. Memory (RAM)
  const activeRam = selectedRam || raw.ram;
  if (activeRam) {
    categories.push({
      category: "MEMORY (RAM)",
      items: [{ label: "Installed RAM", value: activeRam }],
    });
  }

  // 3. Storage
  const activeSsd = selectedSsd || raw.storage;
  if (activeSsd) {
    categories.push({
      category: "STORAGE",
      items: [{ label: "Installed Storage", value: activeSsd }],
    });
  }

  // 4. Display & Graphics
  const displayItems: Array<{ label: string; value: string }> = [];
  if (raw.display) {
    displayItems.push({ label: "Display", value: raw.display });
  }
  if (raw.displayType) {
    displayItems.push({ label: "Display Type", value: raw.displayType });
  }
  if (raw.touchscreen !== undefined && raw.touchscreen !== null) {
    displayItems.push({
      label: "Touchscreen",
      value: raw.touchscreen ? "Yes (Touchscreen Enabled)" : "No",
    });
  }
  if (raw.graphics) {
    displayItems.push({ label: "Graphics", value: raw.graphics });
  }
  if (displayItems.length > 0) {
    categories.push({ category: "DISPLAY & GRAPHICS", items: displayItems });
  }

  // 5. Ports & Connectivity
  const portsItems: Array<{ label: string; value: string }> = [];
  if (raw.ports && raw.ports.length > 0) {
    portsItems.push({ label: "Ports", value: raw.ports.join(", ") });
  }
  if (portsItems.length > 0) {
    categories.push({ category: "PORTS & CONNECTIVITY", items: portsItems });
  }

  // 6. Battery & Physical
  const physicalItems: Array<{ label: string; value: string }> = [];
  if (raw.battery) {
    physicalItems.push({ label: "Battery", value: raw.battery });
  }
  if (raw.weight) {
    physicalItems.push({ label: "Weight", value: raw.weight });
  }
  if (physicalItems.length > 0) {
    categories.push({ category: "BATTERY & PHYSICAL", items: physicalItems });
  }

  // 7. Condition & Warranty
  const conditionItems: Array<{ label: string; value: string }> = [];
  if (product.grade) {
    conditionItems.push({ label: "Condition Grade", value: `Grade ${product.grade}` });
  } else if (product.condition && product.condition.length > 0) {
    conditionItems.push({ label: "Condition", value: product.condition.join(", ") });
  }
  if (product.warranty) {
    conditionItems.push({ label: "Warranty", value: product.warranty });
  }
  if (conditionItems.length > 0) {
    categories.push({ category: "CONDITION & WARRANTY", items: conditionItems });
  }

  return categories;
}

export default function ProductSpecTable({
  product,
  selectedRam,
  selectedSsd,
}: ProductSpecTableProps) {
  const categories = buildProductSpecCategories(
    product,
    selectedRam,
    selectedSsd
  );

  if (categories.length === 0) {
    return (
      <div className="border border-gray-200 dark:border-border rounded-lg p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-card">
        No detailed specifications available for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((group) => (
        <div
          key={group.category}
          className="border border-gray-200 dark:border-border rounded-lg overflow-hidden bg-white dark:bg-card shadow-2xs"
        >
          <table className="w-full text-left text-xs border-collapse">
            <caption className="bg-[#f0f5fc] dark:bg-card/90 px-4 py-2.5 border-b border-gray-200 dark:border-border font-bold text-[#002b60] dark:text-primary uppercase tracking-wider text-left caption-top">
              {group.category}
            </caption>
            <tbody className="divide-y divide-gray-100 dark:divide-border/50">
              {group.items.map((row) => (
                <tr
                  key={row.label}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <th
                    scope="row"
                    className="px-4 py-2.5 font-normal text-gray-600 dark:text-gray-400 w-1/3 align-top font-normal"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100 font-medium w-2/3 align-top">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
