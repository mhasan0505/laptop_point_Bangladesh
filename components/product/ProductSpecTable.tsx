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
  const raw = product.specs || {};
  const brand = product.brand || "HP";
  const name = product.name;

  // CPU
  let processorBrand = "Intel";
  if (/ryzen|amd/i.test(name) || /ryzen|amd/i.test(raw.processor || "")) {
    processorBrand = "AMD";
  } else if (/apple|m1|m2|m3/i.test(name)) {
    processorBrand = "Apple";
  }

  const processorModel =
    raw.processor ||
    (brand === "HP" ? "Intel Core i5 Processor" : "Intel Core i5 Processor");

  // Display
  let displaySize = "14.0 Inch";
  if (/13\.3/i.test(name) || /13\.3/i.test(raw.display || "")) {
    displaySize = "13.3 Inch";
  } else if (/15\.6/i.test(name) || /15\.6/i.test(raw.display || "")) {
    displaySize = "15.6 Inch";
  } else if (raw.display) {
    displaySize = raw.display;
  }

  const displayType = raw.displayType || "FHD IPS Anti-Glare LED Display";
  const displayRes = "1920 x 1080 (Full HD)";

  // Ram & SSD (use selected variant if provided, otherwise product specs)
  const activeRam = selectedRam || raw.ram || "8GB DDR4";
  const activeSsd = selectedSsd || raw.storage || "256GB NVMe SSD";

  // Condition & Grade
  const conditionGrade = product.grade
    ? `Grade ${product.grade}`
    : product.condition && product.condition.length > 0
    ? product.condition.join(", ")
    : "Grade A (Pre-Owned)";

  const warrantyGuarantee =
    product.warranty || "15 Days Replacement Guarantee";
  const serviceWarranty = "2 Years Free Service Warranty";

  const categories: SpecCategory[] = [
    {
      category: "PROCESSOR & PERFORMANCE",
      items: [
        { label: "Processor Brand", value: processorBrand },
        { label: "Processor Model", value: processorModel },
        ...(raw.os ? [{ label: "Operating System", value: raw.os }] : []),
      ],
    },
    {
      category: "MEMORY (RAM)",
      items: [
        { label: "Installed RAM", value: activeRam },
        { label: "RAM Type", value: "DDR4 SDRAM" },
        { label: "RAM Slots", value: "Dual Channel SODIMM Slots (Upgradable)" },
      ],
    },
    {
      category: "STORAGE",
      items: [
        { label: "Installed Storage", value: activeSsd },
        { label: "Storage Interface", value: "M.2 PCIe NVMe SSD" },
        { label: "Storage Upgrade", value: "Upgradable up to 1TB / 2TB SSD" },
      ],
    },
    {
      category: "DISPLAY & GRAPHICS",
      items: [
        { label: "Display Size", value: displaySize },
        { label: "Display Type", value: displayType },
        { label: "Resolution", value: displayRes },
        {
          label: "Touchscreen",
          value: raw.touchscreen ? "Yes (Touchscreen Enabled)" : "No",
        },
        {
          label: "Graphics",
          value: raw.graphics || "Intel Integrated Graphics",
        },
      ],
    },
    {
      category: "PORTS & CONNECTIVITY",
      items: [
        {
          label: "Ports",
          value:
            raw.ports && raw.ports.length > 0
              ? raw.ports.join(", ")
              : "USB 3.1, HDMI, Audio Combo Jack, RJ-45 LAN",
        },
        { label: "Wireless", value: "Wi-Fi Dual Band + Bluetooth" },
      ],
    },
    {
      category: "BATTERY & PHYSICAL",
      items: [
        {
          label: "Battery Backup",
          value: raw.battery || "Up to 3-4 Hours (Tested)",
        },
        { label: "Weight", value: raw.weight || "Approx 1.4 - 1.6 kg" },
        { label: "Color", value: "Silver / Dark Ash Black" },
      ],
    },
    {
      category: "CONDITION & WARRANTY",
      items: [
        { label: "Condition Grade", value: conditionGrade },
        { label: "Testing Status", value: "100% Tested & Certified Hardware" },
        { label: "Replacement Warranty", value: warrantyGuarantee },
        { label: "Service Warranty", value: serviceWarranty },
      ],
    },
  ];

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
                    className="px-4 py-2.5 font-semibold text-gray-600 dark:text-gray-400 w-1/3 align-top font-normal"
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
