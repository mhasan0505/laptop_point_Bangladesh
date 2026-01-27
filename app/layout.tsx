import WhatsAppButton from "@/components/application/WhatsAppButton";
import { SEO_CONFIG } from "@/lib/seo-config";
import { localBusinessSchema, organizationSchema } from "@/lib/seo-schemas";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laptoppointbd.com"),
  title: {
    default: SEO_CONFIG.metaTags.defaultTitle,
    template: "%s | Laptop Point Bangladesh",
  },
  description: SEO_CONFIG.metaTags.defaultDescription,
  keywords: SEO_CONFIG.keywords.primary.concat(SEO_CONFIG.keywords.secondary),
  authors: [{ name: "Laptop Point Bangladesh" }],
  creator: "Laptop Point Bangladesh",
  publisher: "Laptop Point Bangladesh",
  alternates: {
    canonical: "https://laptoppointbd.com",
    languages: {
      en: "https://laptoppointbd.com",
      bn: "https://laptoppointbd.com/bn",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    url: "https://laptoppointbd.com",
    siteName: "Laptop Point Bangladesh",
    title: SEO_CONFIG.metaTags.defaultTitle,
    description: SEO_CONFIG.metaTags.defaultDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Laptop Point Bangladesh - Premium Brnd New And Used Laptops",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.metaTags.defaultTitle,
    description: SEO_CONFIG.metaTags.defaultDescription,
    creator: SEO_CONFIG.metaTags.twitterHandle,
    images: ["/og-image.jpg"],
  },
  verification: {
    google: "add-your-google-verification-code",
    other: {
      "msvalidate.01": "add-your-bing-verification-code",
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
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

const jsonLd = organizationSchema;

const localBusinessJsonLd = localBusinessSchema;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.facebook.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Multiple JSON-LD Schemas for Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          key="org-schema"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
          key="local-schema"
        />

        <Script
          id="fb-pixel-base"
          strategy="lazyOnload"
          src="https://connect.facebook.net/en_US/fbevents.js"
        />
        <Script id="fb-pixel-init" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1676617903511293');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Facebook Pixel"
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=1676617903511293&ev=PageView&noscript=1"
            />
          </noscript>
        )}
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
