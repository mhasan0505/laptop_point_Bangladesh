import Breadcrumb from "@/components/application/Breadcrumb";
import Footer from "@/components/application/Footer";
import Header from "@/components/application/Header";
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
          <StickyMobileBar />
        </ComparisonProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
