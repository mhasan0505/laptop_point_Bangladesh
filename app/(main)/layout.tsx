import Breadcrumb from "@/components/application/Breadcrumb";
import CookieConsent from "@/components/application/CookieConsent";
import Footer from "@/components/application/Footer";
import Header from "@/components/application/Header";
import NewsletterPopup from "@/components/application/NewsletterPopup";
import StickyMobileBar from "@/components/application/StickyMobileBar";
import ComparisonBar from "@/components/product/ComparisonBar";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <WishlistProvider>
        <ComparisonProvider>
          <Header />
          <Breadcrumb />
          {children}
          <Footer />
          <ComparisonBar />
          <CookieConsent />
          <NewsletterPopup />
          <StickyMobileBar />
        </ComparisonProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
