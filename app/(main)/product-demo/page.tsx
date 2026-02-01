import ProductDetailsSection from "@/components/application/ProductDetailsSection";

const ProductDemoPage = () => {
  const demoProduct = {
    name: "HP Elitebook 840 G3",
    category: "Laptops",
    description:
      "Professional business laptop featuring Intel Core i5 processor, 8GB RAM, and 256GB SSD. Perfect for productivity with a stunning 14-inch FHD display, premium build quality, and long battery life. Ideal for professionals who demand performance and reliability.",
    price: 1200.0,
    originalPrice: 1300.0,
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    images: [
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
      "/products/hp/HP_Elitebook_840_G3/front.png",
    ],
    specifications: [
      { label: "Processor Brand", value: "AMD", category: "Processor" },
      {
        label: "Processor Model",
        value: "Ryzen 7 7735HS",
        category: "Processor",
      },
      { label: "Generation", value: "7000 Series", category: "Processor" },
      {
        label: "Processor Frequency",
        value: "Up to 4.75GHz",
        category: "Processor",
      },
      { label: "Processor Core", value: "8", category: "Processor" },
      { label: "Processor Thread", value: "16", category: "Processor" },
      { label: "CPU Cache", value: "16MB L3", category: "Processor" },
      {
        label: "Chipset Model",
        value: "AMD SoC Platform",
        category: "Chipset",
      },
      { label: "Display Size", value: '15.3"', category: "Display" },
      { label: "Display Type", value: "IPS", category: "Display" },
      {
        label: "Display Resolution",
        value: "WUXGA (1920x1200)",
        category: "Display",
      },
      { label: "Touch Screen", value: "N/A", category: "Display" },
      { label: "Refresh Rate", value: "60Hz", category: "Display" },
      {
        label: "Display Features",
        value: "300nits Anti-glare, 45% NTSC, 90.7% AAR",
        category: "Display",
      },
      {
        label: "RAM",
        value: "16GB (8GB Soldered + 8GB SODIMM)",
        category: "Memory",
      },
      { label: "RAM Type", value: "DDR5", category: "Memory" },
      { label: "Removable", value: "Yes", category: "Memory" },
      { label: "Bus Speed", value: "4800 MHz", category: "Memory" },
      { label: "Total RAM Slot", value: "2", category: "Memory" },
      {
        label: "Max RAM Capacity",
        value: "Up to 24GB (8GB soldered + 16GB SODIMM) DDR5-4800",
        category: "Memory",
      },
    ],
  };

  return (
    <>
      <ProductDetailsSection product={demoProduct} />
    </>
  );
};

export default ProductDemoPage;
