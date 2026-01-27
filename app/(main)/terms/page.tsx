export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 mb-4">
              Welcome to Laptop Point Bangladesh. These Terms of Service
              (&quot;Terms&quot;) govern your access to and use of our website,
              products, and services. By accessing or using our website, you
              agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on Laptop Point Bangladesh's
              website for personal, non-commercial transitory viewing only. This
              is the grant of a license, not a transfer of title, and under this
              license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Modifying or copying the materials</li>
              <li>
                Using the materials for any commercial purpose or for any public
                display
              </li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>
                Removing any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transferring the materials to another person or
                &quot;mirror&quot; the materials on any other server
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Disclaimer
            </h2>
            <p className="text-gray-700 mb-4">
              The materials on Laptop Point Bangladesh's website are provided on
              an &apos;as is&apos; basis. Laptop Point Bangladesh makes no
              warranties, expressed or implied, and hereby disclaims and negates
              all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Limitations
            </h2>
            <p className="text-gray-700 mb-4">
              In no event shall Laptop Point Bangladesh or its suppliers be
              liable for any damages (including, without limitation, damages for
              loss of data or profit, or due to business interruption) arising
              out of the use or inability to use the materials on Laptop Point
              Bangladesh's website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Accuracy of Materials
            </h2>
            <p className="text-gray-700 mb-4">
              The materials appearing on Laptop Point Bangladesh's website could
              include technical, typographical, or photographic errors. Laptop
              Point Bangladesh does not warrant that any of the materials on our
              website are accurate, complete, or current. Laptop Point
              Bangladesh may make changes to the materials contained on our
              website at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. Links
            </h2>
            <p className="text-gray-700 mb-4">
              Laptop Point Bangladesh has not reviewed all of the sites linked
              to our website and is not responsible for the contents of any such
              linked site. The inclusion of any link does not imply endorsement
              by Laptop Point Bangladesh of the site. Use of any such linked
              website is at the user&apos;s own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. Modifications
            </h2>
            <p className="text-gray-700 mb-4">
              Laptop Point Bangladesh may revise these Terms of Service for our
              website at any time without notice. By using this website, you are
              agreeing to be bound by the then current version of these Terms of
              Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. Governing Law
            </h2>
            <p className="text-gray-700 mb-4">
              These terms and conditions are governed by and construed in
              accordance with the laws of Bangladesh, and you irrevocably submit
              to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please
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
