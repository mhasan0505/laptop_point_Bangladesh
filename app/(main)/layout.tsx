import AnnouncementBar from "@/components/home/AnnouncementBar";
import WhatsAppButton from "@/components/application/WhatsAppButton";
import Breadcrumb from "@/components/application/Breadcrumb";
import CookieConsent from "@/components/application/CookieConsent";
import Footer from "@/components/application/Footer";
import Header from "@/components/application/Header";
import NewsletterPopup from "@/components/application/NewsletterPopup";
import StickyMobileBar from "@/components/application/StickyMobileBar";
import ComparisonBar from "@/components/product/ComparisonBar";
import {
  getMegaMenuFeaturedProducts,
  getStorefrontContact,
  getStorefrontNavigation,
} from "@/lib/public-content";
import { CartProvider } from "@/contexts/CartContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contact, navigation, megaMenuFeatured] = await Promise.all([
    getStorefrontContact(),
    getStorefrontNavigation(),
    getMegaMenuFeaturedProducts(),
  ]);

  return (
    <CartProvider>
      <WishlistProvider>
        <ComparisonProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#002b60] focus:font-semibold focus:shadow-xl focus:rounded-md focus:ring-2 focus:ring-[#002b60] focus:outline-none"
          >
            Skip to main content
          </a>
          <AnnouncementBar />
          <Header
            navigation={navigation}
            megaMenuFeatured={megaMenuFeatured}
            contact={contact}
          />
          <Breadcrumb />
          <main id="main-content" tabIndex={-1} className="pb-20 lg:pb-0 focus:outline-none">
            {children}
          </main>
          <Footer contact={contact} footerLinks={navigation.footerLinks} />
          <ComparisonBar />
          <CookieConsent />
          <NewsletterPopup />
          <StickyMobileBar />
          <WhatsAppButton contact={contact} />
        </ComparisonProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
