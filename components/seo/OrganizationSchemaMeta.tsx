import React from "react";
import { getStorefrontContact } from "@/lib/public-content";

export default async function OrganizationSchemaMeta() {
  const contact = await getStorefrontContact();
  const baseUrl = "https://laptoppointbd.com";

  // Build sameAs array from existing social links
  const sameAs: string[] = [];
  if (contact.social?.facebook) sameAs.push(contact.social.facebook);
  if (contact.social?.youtube) sameAs.push(contact.social.youtube);
  if (contact.social?.tiktok) sameAs.push(contact.social.tiktok);
  if (contact.social?.instagram) sameAs.push(contact.social.instagram);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "Store"],
    "@id": `${baseUrl}/#organization`,
    name: contact.name || "Laptop Point BD",
    url: baseUrl,
    logo: `${baseUrl}/Logo.webp`,
    image: `${baseUrl}/Hero_Image.png`,
    priceRange: "৳৳",
    description:
      "Showroom and retailer of certified refurbished, pre-owned and new laptops in Mirpur-10, Dhaka-1216, Bangladesh.",
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.8069,
      longitude: 90.3687,
    },
  };

  if (contact.hotline) {
    schema.telephone = contact.hotline;
  }
  if (contact.email) {
    schema.email = contact.email;
  }

  // Address in Mirpur-10, Dhaka-1216, BD
  schema.address = {
    "@type": "PostalAddress",
    streetAddress: "Madbar Mansion, Shop-08, Mirpur-10",
    addressLocality: "Dhaka",
    postalCode: "1216",
    addressCountry: "BD",
  };

  // Opening hours: Open Everyday 10:00 AM - 9:00 PM
  schema.openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "21:00",
    },
  ];

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
