import { SEO_CONFIG } from "@/lib/seo-config";
import OrganizationSchemaMeta from "@/components/seo/OrganizationSchemaMeta";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "monospace"],
});

import { getStorefrontSeo, getStorefrontTracking } from "@/lib/public-content";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getStorefrontSeo();

  return {
    metadataBase: new URL("https://laptoppointbd.com"),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    keywords: SEO_CONFIG.keywords.primary.concat(SEO_CONFIG.keywords.secondary),
    authors: [{ name: "Laptop Point Bangladesh" }],
    creator: "Laptop Point Bangladesh",
    publisher: "Laptop Point Bangladesh",
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: "bn_BD",
      url: "https://laptoppointbd.com",
      siteName: "Laptop Point Bangladesh",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [
        {
          url: seo.defaultShareImage || "/Hero_Image.png",
          width: 1200,
          height: 630,
          alt: "Laptop Point Bangladesh - Premium Brand New And Used Laptops",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      creator: SEO_CONFIG.metaTags.twitterHandle,
      images: [seo.defaultShareImage || "/Hero_Image.png"],
    },
    verification: {
      google: seo.googleVerification
        ? [seo.googleVerification]
        : [
            "ljFisqvr68Zmoi6h41Y5BSMWuktGPPdHTkRCpYaeFOQ",
            "1sz9tJ4KKpP8LbTkmf5oQdcVCjW4pKNd5AVrZE9iyLg",
          ],
      other: {
        "msvalidate.01":
          seo.bingVerification ||
          process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
          "",
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
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tracking = await getStorefrontTracking();
  const GOOGLE_TAG_ID = tracking.ga4MeasurementId;
  const FB_PIXEL_ID = tracking.metaPixelId;
  const GTM_ID = tracking.gtmId;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.facebook.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>

        {/* Google Analytics (gtag.js) */}
        <Script
          id="google-tag-base"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}');
          `}
        </Script>

        {/* Organization & LocalBusiness JSON-LD Schema */}
        <OrganizationSchemaMeta />

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
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Facebook Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Facebook Pixel"
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
