export default function ShippingInfo() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Shipping Information
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Shipping Methods
            </h2>
            <p className="text-gray-700 mb-4">
              We offer multiple shipping options to ensure your laptop and
              accessories arrive safely and on time.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Standard Shipping:</strong> 3-5 business days (Dhaka)
              </li>
              <li>
                <strong>Express Shipping:</strong> 1-2 business days (Dhaka)
              </li>
              <li>
                <strong>Regional Shipping:</strong> 5-7 business days (Outside
                Dhaka)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Shipping Costs
            </h2>
            <p className="text-gray-700 mb-4">
              Shipping costs vary based on location and weight:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                <strong>Dhaka:</strong> ৳100-300 depending on weight
              </li>
              <li>
                <strong>Outside Dhaka:</strong> ৳200-500 depending on location
                and weight
              </li>
              <li>
                <strong>Free Shipping:</strong> Orders above ৳50,000
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Delivery Coverage
            </h2>
            <p className="text-gray-700 mb-4">
              We deliver across Bangladesh including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>All divisions of Bangladesh</li>
              <li>Major cities and towns</li>
              <li>Select remote areas (with extended delivery time)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Tracking Your Order
            </h2>
            <p className="text-gray-700 mb-4">
              Once your order is shipped, you will receive a tracking number via
              email. You can use this number to track your package in real-time
              on our website or the courier partner&apos;s website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Packaging
            </h2>
            <p className="text-gray-700 mb-4">
              All items are carefully packed with protective materials to ensure
              they arrive in perfect condition. Laptops and sensitive equipment
              are double-boxed for maximum protection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              For shipping inquiries, please contact us at:
            </p>
            <p className="text-gray-700">
              Email:{" "}
              <a
                href="mailto:info@laptoppointbd.com"
                className="text-primary hover:underline"
              >
                info@laptoppointbd.com
              </a>
              <br />
              Phone:{" "}
              <a
                href="tel:+8801612182408"
                className="text-primary hover:underline"
              >
                +880 161 218 2408
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
