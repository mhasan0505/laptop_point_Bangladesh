import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laptop-point-bangladesh.vercel.app"), // Placeholder URL
  title: {
    default: "Laptop Point Bangladesh | Premium Used & Refurbished Laptops",
    template: "%s | Laptop Point Bangladesh",
  },
  description:
    "Best source for premium used and refurbished laptops in Bangladesh. HP, Dell, Lenovo, Microsoft Surface at unbeatable prices. Official warranty & free delivery.",
  keywords: [
    "Used Laptop Bangladesh",
    "Refurbished Laptop",
    "Second Hand Laptop BD",
    "HP Elitebook Price list",
    "Dell Latitude Price",
    "Lenovo Thinkpad Bangladesh",
    "Microsoft Surface used",
    "Laptop Point",
  ],
  authors: [{ name: "Laptop Point Bangladesh" }],
  creator: "Laptop Point Bangladesh",
  publisher: "Laptop Point Bangladesh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://laptop-point-bangladesh.vercel.app",
    siteName: "Laptop Point Bangladesh",
    title: "Laptop Point Bangladesh | Premium Used & Refurbished Laptops",
    description:
      "Find your perfect laptop at Laptop Point. Wide range of premium used HP, Dell, Lenovo, and Microsoft laptops with warranty.",
    images: [
      {
        url: "/og-image.jpg", // We need to ensure this exists or use a product image
        width: 1200,
        height: 630,
        alt: "Laptop Point Bangladesh Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Laptop Point Bangladesh | Premium Used Laptops",
    description: "Best deals on used and refurbished laptops in Bangladesh.",
    images: ["/og-image.jpg"],
    creator: "@laptoppointbd", // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/Logo_icon.webp",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Laptop Point Bangladesh",
  url: "https://laptop-point-bangladesh.vercel.app",
  logo: "https://laptop-point-bangladesh.vercel.app/logo.png",
  sameAs: [
    "https://www.facebook.com/laptoppointbd", // Placeholder
    "https://www.instagram.com/laptoppointbd",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+880-1234-567890", // Placeholder
    contactType: "customer service",
    areaServed: "BD",
    availableLanguage: "en",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
