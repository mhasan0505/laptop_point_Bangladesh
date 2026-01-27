export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 mb-4">
              Laptop Point Bangladesh (&quot;we&quot;, &quot;us&quot;,
              &quot;our&quot;, or &quot;Company&quot;) operates the
              laptoppointbd.com website. This page informs you of our policies
              regarding the collection, use, and disclosure of personal data
              when you use our Service and the choices you have associated with
              that data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Information Collection and Use
            </h2>
            <p className="text-gray-700 mb-4">
              We collect several different types of information for various
              purposes to provide and improve our Service to you.
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>
                Personal identification information (name, email address, phone
                number, etc.)
              </li>
              <li>Billing and shipping information</li>
              <li>Technical data about your browser and device</li>
              <li>Usage data and analytics information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Use of Data
            </h2>
            <p className="text-gray-700 mb-4">
              Laptop Point Bangladesh uses the collected data for various
              purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>
                To allow you to participate in interactive features of our
                Service
              </li>
              <li>To provide customer support</li>
              <li>
                To gather analysis or valuable information to improve our
                Service
              </li>
              <li>To monitor the usage of our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Security of Data
            </h2>
            <p className="text-gray-700 mb-4">
              The security of your data is important to us but remember that no
              method of transmission over the Internet or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your personal data, we cannot
              guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at:
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
