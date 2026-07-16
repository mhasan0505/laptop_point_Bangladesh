export default function ReturnsRefund() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Returns & Refund Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Return Period
            </h2>
            <p className="text-gray-700 mb-4">
              We want you to be completely satisfied with your purchase. If you
              are not happy with your laptop or accessory, you can return it
              within 7 days of purchase for a full refund or exchange, provided
              the item is unused and in original condition.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Return Eligibility
            </h2>
            <p className="text-gray-700 mb-4">
              To be eligible for a return, items must meet the following
              conditions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Returned within 7 days of purchase</li>
              <li>Unused and in original packaging</li>
              <li>All accessories and documentation included</li>
              <li>No signs of physical damage or wear</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              How to Initiate a Return
            </h2>
            <p className="text-gray-700 mb-4">
              To start a return, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Contact our support team with your order number</li>
              <li>Provide photos of the item and packaging</li>
              <li>Receive return authorization and shipping instructions</li>
              <li>Ship the item back to us in original condition</li>
              <li>Receive refund or replacement after inspection</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Refund Processing
            </h2>
            <p className="text-gray-700 mb-4">
              Once we receive and inspect your returned item:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                We will verify the condition of the item (2-3 business days)
              </li>
              <li>
                Approve and process your refund (within 5-7 business days)
              </li>
              <li>
                The refund will be credited to your original payment method
              </li>
              <li>
                Bank transfers may take additional 1-2 business days to reflect
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Defective Items
            </h2>
            <p className="text-gray-700 mb-4">
              If you receive a defective item, we will replace it free of charge
              within 30 days of purchase. Please contact us immediately with
              photos and a description of the defect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Non-Returnable Items
            </h2>
            <p className="text-gray-700 mb-4">
              The following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Items purchased as final sale</li>
              <li>Items damaged due to customer misuse</li>
              <li>Items purchased over 30 days ago</li>
              <li>Custom-built PCs (unless defective)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              For return inquiries, please contact us at:
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
