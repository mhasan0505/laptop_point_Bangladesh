import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Laptop Chargers & Adapters | Original & Compatible | Laptop Point BD",
  description:
    "Buy original and compatible laptop chargers and adapters for HP, Dell, Lenovo, Asus, Acer, and more. Fast charging, warranty included. Shop now at Laptop Point Bangladesh.",
  keywords:
    "laptop charger, laptop adapter, HP charger, Dell adapter, Lenovo charger, USB-C charger, laptop power supply",
};

const chargerProducts = [
  {
    brand: "HP",
    model: "65W USB-C Charger",
    compatibility: "HP EliteBook, ProBook, ZBook Series",
    price: 2490,
    originalPrice: 3500,
    features: ["Fast Charging", "USB-C", "Original Quality"],
    inStock: true,
  },
  {
    brand: "Dell",
    model: "90W AC Adapter",
    compatibility: "Dell Latitude, Precision, Inspiron",
    price: 2290,
    originalPrice: 3200,
    features: ["OEM Quality", "Short Circuit Protection", "1 Year Warranty"],
    inStock: true,
  },
  {
    brand: "Lenovo",
    model: "65W Round Pin Charger",
    compatibility: "Lenovo ThinkPad T, X, L Series",
    price: 1990,
    originalPrice: 2800,
    features: ["Genuine Replacement", "Energy Efficient", "Compact Design"],
    inStock: true,
  },
  {
    brand: "Universal",
    model: "90W Universal Adapter",
    compatibility: "Multiple Brands & Models",
    price: 1590,
    originalPrice: 2200,
    features: ["8 Connector Tips", "Auto Voltage", "LED Indicator"],
    inStock: true,
  },
  {
    brand: "Asus",
    model: "45W Adapter",
    compatibility: "Asus VivoBook, ZenBook Series",
    price: 1790,
    originalPrice: 2500,
    features: ["Original Quality", "Lightweight", "Over Voltage Protection"],
    inStock: true,
  },
  {
    brand: "Acer",
    model: "65W Charger",
    compatibility: "Acer Aspire, Swift, TravelMate",
    price: 1890,
    originalPrice: 2600,
    features: ["Compatible Replacement", "6 Month Warranty", "Safe Charging"],
    inStock: false,
  },
];

const benefits = [
  {
    icon: "✓",
    title: "Original & Compatible Options",
    description: "Choose from genuine OEM or high-quality compatible chargers",
  },
  {
    icon: "⚡",
    title: "Fast & Safe Charging",
    description: "Optimized charging with built-in safety protection",
  },
  {
    icon: "🛡️",
    title: "Warranty Included",
    description: "All chargers come with warranty for peace of mind",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Quick delivery in Dhaka or pickup at Mirpur-10",
  },
];

export default function ChargerAdapterPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Laptop Chargers & Adapters
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Original and compatible chargers for all major laptop brands. Fast
              charging, safety certified, and backed by warranty. Find the
              perfect power solution for your laptop.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-2xl">⚡</span>
                <span>Fast Charging</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-2xl">🛡️</span>
                <span>Safety Protection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-2xl">✓</span>
                <span>Warranty Included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Chargers & Adapters
            </h2>
            <p className="text-gray-600 mt-1">
              {chargerProducts.length} products available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargerProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Brand Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {product.brand}
                  </span>
                  {product.inStock ? (
                    <span className="text-xs font-semibold text-green-600">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-red-600">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {product.model}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {product.compatibility}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.features.map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ৳{product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100,
                    )}
                    % OFF
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2">
                  <Link
                    href="/contact"
                    className="flex-1 h-11 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center transition-colors"
                  >
                    Order Now
                  </Link>
                  <Link
                    href={`https://wa.me/8801234567890?text=I'm interested in ${product.brand} ${product.model}`}
                    target="_blank"
                    className="h-11 px-4 rounded-lg border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold flex items-center justify-center transition-colors"
                  >
                    WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Can&apos;t Find Your Charger?
            </h2>
            <p className="text-lg text-blue-100 mb-6">
              Contact us with your laptop model and we&apos;ll help you find the
              perfect charger. We can source original or compatible options for
              any laptop brand.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="h-12 px-8 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Contact Us
              </Link>
              <Link
                href="https://wa.me/8801234567890"
                target="_blank"
                className="h-12 px-8 rounded-xl border-2 border-white text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                WhatsApp Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Laptop Point BD for Chargers & Adapters?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              At Laptop Point Bangladesh, we understand the importance of
              reliable laptop chargers and adapters. Whether you&apos;ve lost
              your original charger or need a replacement, we offer both genuine
              OEM and high-quality compatible options for all major laptop
              brands.
            </p>
            <p className="text-gray-700 mb-4">
              Our chargers feature built-in safety mechanisms including
              over-voltage protection, short-circuit protection, and temperature
              control to ensure safe and efficient charging. All products come
              with warranty coverage for your peace of mind.
            </p>
            <p className="text-gray-700">
              Located in Mirpur-10, Dhaka, we offer convenient pickup or fast
              delivery across Bangladesh. Contact us today to find the perfect
              charger for your laptop model.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
