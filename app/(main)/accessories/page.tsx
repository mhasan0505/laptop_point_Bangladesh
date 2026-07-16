const categories = [
  {
    title: "Chargers & Adapters",
    description: "Original and compatible chargers for popular brands.",
    icon: "⚡",
  },
  {
    title: "Batteries",
    description: "Reliable replacement batteries for everyday use.",
    icon: "🔋",
  },
  {
    title: "Bags & Sleeves",
    description: "Protective bags for work, travel, and daily carry.",
    icon: "🎒",
  },
  {
    title: "Keyboards & Mice",
    description: "Comfortable peripherals for productivity.",
    icon: "⌨️",
  },
  {
    title: "Storage",
    description: "SSDs, HDDs, and external storage options.",
    icon: "💾",
  },
  {
    title: "Display & Cables",
    description: "HDMI, USB-C, VGA, and display adapters.",
    icon: "🖥️",
  },
];

const featured = [
  {
    name: "65W USB-C Charger",
    price: "BDT 1,490",
    tag: "Fast Charge",
  },
  {
    name: "Laptop Battery Replacement",
    price: "BDT 2,690",
    tag: "Warranty Included",
  },
  {
    name: "Premium Laptop Backpack",
    price: "BDT 1,890",
    tag: "Water Resistant",
  },
  {
    name: "Wireless Mouse + Keyboard",
    price: "BDT 1,350",
    tag: "Combo Pack",
  },
];

const benefits = [
  {
    title: "Quality Checked",
    description: "Every accessory is tested for performance and safety.",
  },
  {
    title: "Expert Support",
    description: "Get help choosing the right accessory for your laptop.",
  },
  {
    title: "Great Value",
    description: "Affordable prices without compromising on quality.",
  },
  {
    title: "Quick Pickup",
    description: "Pick up at Mirpur-10 or get fast delivery in Dhaka.",
  },
];

const page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-900 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 md:py-20 lg:py-24 relative z-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
              Accessories for Used Laptops
            </p>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Upgrade, Protect, and Power Your Laptop
            </h1>
            <p className="mt-5 text-lg text-gray-300">
              Discover quality accessories curated for used laptops—chargers,
              batteries, bags, and more. Reliable options that fit your budget.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all">
                Browse Accessories
              </button>
              <button className="h-12 px-6 rounded-xl border border-white/20 text-white/90 hover:text-white hover:border-white/40 transition-all">
                Get Recommendations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="text-gray-600 mt-2">
              Find the right accessory for your exact laptop model.
            </p>
          </div>
          <span className="hidden md:inline-flex text-sm text-gray-500">
            6 Categories
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl">{item.icon}</div>
                <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                  Explore
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-14">
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Accessories
              </h2>
              <p className="text-gray-600 mt-2">
                Best picks for popular used laptop models.
              </p>
            </div>
            <button className="h-11 px-5 rounded-xl border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all">
              View All
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {item.tag}
                  </span>
                  <span className="text-xs text-gray-500">In Stock</span>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-2 text-gray-700 font-bold">{item.price}</p>
                <button className="mt-4 w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-all">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 md:p-12 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold">Need the right accessory?</h2>
              <p className="text-white/90 mt-2">
                Tell us your laptop model and we&apos;ll suggest compatible
                options.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="h-12 px-6 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-all">
                Ask on WhatsApp
              </button>
              <button className="h-12 px-6 rounded-xl border border-white/30 text-white hover:border-white/60 transition-all">
                Call Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
