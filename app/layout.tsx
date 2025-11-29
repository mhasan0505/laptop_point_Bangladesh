import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Header from "@/components/application/Header";
import "./globals.css";
import Footer from "@/components/application/Footer";
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
        <Header />
        {children}
        <SpeedInsights />
        <Footer/>
      </body>
    </html>
  );
}
