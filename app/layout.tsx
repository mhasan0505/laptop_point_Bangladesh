import WhatsAppButton from "@/components/application/WhatsAppButton";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Script from "next/script";
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
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
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y7GRYG9473"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Y7GRYG9473');
          `}
        </Script>

        {/* Facebook Pixel */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <Image
                height={1}
                width={1}
                className="hidden"
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <WhatsAppButton />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
