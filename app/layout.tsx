import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Breadcrumb from "@/components/application/Breadcrumb";
import Footer from "@/components/application/Footer";
import Header from "@/components/application/Header";
import StickyMobileBar from "@/components/application/StickyMobileBar";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laptop Point Bangladesh",
  description: "Laptop Point Bangladesh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <CartProvider>
          <Header />
          <Breadcrumb />
          {children}
          <SpeedInsights />
          <Footer />
          <StickyMobileBar />
        </CartProvider>
      </body>
    </html>
  );
}
