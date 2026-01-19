import BentoGridSection from "@/components/application/BentoGridSection";
import BrandProductSection from "@/components/application/BrandProductSection";
import HeroSection from "@/components/application/HeroSection";
import NewProductsSection from "@/components/application/NewProductsSection";
import TestimonialsSection from "@/components/application/TestimonialsSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <NewProductsSection />
      <BentoGridSection />

      {/* HP Section */}
      <BrandProductSection
        brand="HP"
        title="HP Laptop Series"
        description="Experience power and elegance with our curated selection of HP laptops. Designed for professionals, business leaders, and creators."
        badgeText="Premium Collection"
        theme="hp"
      />

      {/* Dell Section */}
      <BrandProductSection
        brand="Dell"
        title="Dell Latitude & XPS"
        description="Reliability meets performance. Explore our range of Dell laptops, from the rugged Latitude series to the premium XPS lineup."
        badgeText="Business Choice"
        theme="dell"
      />

      {/* Lenovo Section */}
      <BrandProductSection
        brand="Lenovo"
        title="Lenovo ThinkPad Series"
        description="Built for business. The legendary ThinkPad series offers unmatched durability, keyboard comfort, and performance."
        badgeText="Legendary Durability"
        theme="lenovo"
      />

      {/* Microsoft Section */}
      <BrandProductSection
        brand="Microsoft"
        title="Microsoft Surface"
        description="Sleek, powerful, and versatile. Surface laptops combine premium design with the full power of Windows."
        badgeText="Creative Studio"
        theme="microsoft"
      />
      <TestimonialsSection />
    </>
  );
};

export default HomePage;
