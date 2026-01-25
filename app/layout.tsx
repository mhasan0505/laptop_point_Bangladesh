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
  metadataBase: new URL("https://laptop-point-bangladesh.vercel.app"),
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
    canonical: "https://laptop-point-bangladesh.vercel.app",
    languages: {
      en: "https://laptop-point-bangladesh.vercel.app",
      bn: "https://laptop-point-bangladesh.vercel.app/bn",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    url: "https://laptop-point-bangladesh.vercel.app",
    siteName: "Laptop Point Bangladesh",
    title: SEO_CONFIG.metaTags.defaultTitle,
    description: SEO_CONFIG.metaTags.defaultDescription,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Laptop Point Bangladesh - Premium New & Used Laptops",
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

        {/* Alternate Language Links for Bangladesh */}
        <link
          rel="alternate"
          hrefLang="en-BD"
          href="https://laptop-point-bangladesh.vercel.app"
        />
        <link
          rel="alternate"
          hrefLang="bn-BD"
          href="https://laptop-point-bangladesh.vercel.app/bn"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://laptop-point-bangladesh.vercel.app"
        />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://laptop-point-bangladesh.vercel.app"
        />

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

        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="add-your-google-verification-code"
        />
        <meta name="msvalidate.01" content="add-your-bing-verification-code" />

        {/* Bangladesh-specific Meta Tags */}
        <meta name="geo.country" content="BD" />
        <meta name="geo.region" content="BD-30" />
        <meta name="geo.placename" content="Dhaka" />

        {/* Additional Meta Tags for SEO */}
        <meta httpEquiv="content-language" content="en-BD" />
        <meta name="format-detection" content="telephone=+8801612182408" />

        {/* Google Analytics - Deferred */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y7GRYG9473"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y7GRYG9473', {
              'allow_google_signals': true,
              'allow_ad_personalization_signals': true,
              'geo_restrictions': ['BD']
            });
          `}
        </Script>

        {/* Facebook Pixel - Deferred */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <>
            <Script
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
              strategy="lazyOnload"
            />
            <noscript>
              <img
                height="1"
                width="1"
                className="hidden"
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt="Facebook Pixel"
              />
            </noscript>
          </>
        )}
      </head>
      <body className={`${poppins.variable} antialiased`}>
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
