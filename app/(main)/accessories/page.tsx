import Link from "next/link";
import { ArrowRight, Check, Headphones, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";

const categories = [
  {
    title: "Chargers & Adapters",
    description: "Original and compatible chargers for popular brands.",
    icon: Zap,
    href: "/accessories/charger-and-adapter",
    accent: "from-amber-400 to-orange-500",
  },
  {
    title: "Routers",
    description: "Reliable wireless connectivity for home and office.",
    icon: Truck,
    href: "/accessories/routers",
    accent: "from-sky-400 to-blue-500",
  },
  {
    title: "Batteries",
    description: "Reliable replacement batteries for everyday use.",
    icon: Sparkles,
    href: "#",
    accent: "from-emerald-400 to-green-500",
  },
  {
    title: "Bags & Sleeves",
    description: "Protective bags for work, travel, and daily carry.",
    icon: ShieldCheck,
    href: "#",
    accent: "from-violet-400 to-purple-500",
  },
  {
    title: "Keyboards & Mice",
    description: "Comfortable peripherals for productivity.",
    icon: Headphones,
    href: "#",
    accent: "from-rose-400 to-pink-500",
  },
  {
    title: "Storage",
    description: "SSDs, HDDs, and external storage options.",
    icon: Zap,
    href: "#",
    accent: "from-cyan-400 to-teal-500",
  },
];

const featured = [
  {
    name: "65W USB-C Charger",
    price: "BDT 1,490",
    tag: "Fast Charge",
    image: "/products/lenovo/Lenovo-Thinkpad-X1-Carbon-Gen-6-i5-8TH-Gen-8-256/key.webp",
  },
  {
    name: "Laptop Battery Replacement",
    price: "BDT 2,690",
    tag: "Warranty Included",
    image: "/products/lenovo/Lenovo-Thinkpad-T14/main.jpg",
  },
  {
    name: "Premium Laptop Backpack",
    price: "BDT 1,890",
    tag: "Water Resistant",
    image: "/products/hp/HP-Elitebook-840-G6-Core-i5-8TH-Gen-8-256/main.jpg",
  },
  {
    name: "Wireless Mouse + Keyboard",
    price: "BDT 1,350",
    tag: "Combo Pack",
    image: "/products/microsoft/Microsoft-Surface-laptop-3-code-i5/main.png",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Quality Checked",
    description: "Every accessory is tested for performance and safety.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Get help choosing the right accessory for your laptop.",
  },
  {
    icon: Sparkles,
    title: "Great Value",
    description: "Affordable prices without compromising on quality.",
  },
  {
    icon: Truck,
    title: "Quick Pickup",
    description: "Pick up at Mirpur-10 or get fast delivery in Dhaka.",
  },
];

const stats = [
  { value: "12k+", label: "Accessories Sold" },
  { value: "6", label: "Product Categories" },
  { value: "4.8", label: "Avg. Customer Rating" },
  { value: "24h", label: "Avg. Delivery Time" },
];

const faqs = [
  {
    q: "Are your chargers compatible with my laptop model?",
    a: "Yes. We stock original and verified compatible chargers for all major brands. Share your model number and we'll confirm the right fit.",
  },
  {
    q: "Do accessories come with a warranty?",
    a: "Most accessories include a warranty—batteries and chargers come with coverage so you can buy with confidence.",
  },
  {
    q: "Can I pick up my order in person?",
    a: "Absolutely. You can collect from our Mirpur-10 showroom or choose fast delivery across Dhaka.",
  },
];

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0b1220_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.22),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid items-center gap-12 py-20 lg:py-28 lg:grid-cols-2">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Premium Accessories for Used Laptops
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Upgrade, Protect &amp;{" "}
                <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                  Power
                </span>{" "}
                Your Laptop
              </h1>
              <p className="mt-5 max-w-xl text-lg text-gray-300">
                Discover a curated collection of tested accessories—chargers,
                batteries, bags, and more—designed to fit your laptop and your
                budget.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/accessories/charger-and-adapter"
                  className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-slate-900 shadow-lg shadow-black/30 transition-all hover:bg-gray-100"
                >
                  Browse Accessories
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center rounded-xl border border-white/20 px-6 font-semibold text-white/90 backdrop-blur transition-all hover:border-white/40 hover:text-white"
                >
                  Get Recommendations
                </Link>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-2xl font-bold text-white">{s.value}</dt>
                    <dd className="mt-1 text-xs text-gray-400">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Floating showcase card */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-sky-400/20 to-violet-500/20 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {featured.map((item, i) => (
                  <div
                    key={item.name}
                    className={`group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10 ${
                      i % 2 === 1 ? "translate-y-6" : ""
                    }`}
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-white/90">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain p-4 mix-blend-multiply"
                      />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              Collections
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-gray-600">
              Find the right accessory for your exact laptop model.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white">
            6 Categories
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
              >
                <div
                  className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${item.accent} opacity-10 transition-all duration-300 group-hover:scale-150 group-hover:opacity-20`}
                />
                <div className="relative flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 transition-colors group-hover:text-sky-600">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <h3 className="relative mt-5 text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="relative mt-2 text-sm text-gray-600">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="rounded-[2rem] border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-8 shadow-sm md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">
                Handpicked
              </span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                Featured Accessories
              </h2>
              <p className="mt-2 text-gray-600">
                Best picks for popular used laptop models.
              </p>
            </div>
            <Link
              href="/accessories/charger-and-adapter"
              className="inline-flex h-11 items-center rounded-xl border border-gray-200 px-5 font-semibold text-gray-700 transition-all hover:border-gray-300 hover:text-gray-900"
            >
              View All
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <div
                key={item.name}
                className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                    {item.tag}
                  </span>
                  <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-lg font-bold text-gray-900">{item.price}</p>
                <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-black">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-sky-600">
            Good to Know
          </span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition-all open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                {item.q}
                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform group-open:rotate-45 group-open:bg-sky-500 group-open:text-white">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl md:p-14">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">
                Need the right accessory?
              </h2>
              <p className="mt-2 max-w-xl text-white/80">
                Tell us your laptop model and we&apos;ll suggest compatible
                options.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
                {["Free compatibility check", "Warranty backed", "Same-day pickup"].map(
                  (t) => (
                    <li key={t} className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {t}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-xl bg-white px-6 font-semibold text-slate-900 transition-all hover:bg-gray-100"
              >
                Ask on WhatsApp
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 font-semibold text-white transition-all hover:border-white/60"
              >
                Call Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
