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
          <AnnouncementBar />
          <Header
            navigation={navigation}
            megaMenuFeatured={megaMenuFeatured}
            contact={contact}
          />
          <Breadcrumb />
          <main className="pb-20 lg:pb-0">{children}</main>
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
