import { laptopData } from "@/app/data/data";
import FlashSaleBanner from "@/components/application/FlashSaleBanner";
import ProductsCard from "@/components/ui/ProductsCard";

export default function DealsPage() {
  // Simulate discounted products
  const discountedProducts = laptopData.laptops.filter(
    (product) => product.discount && product.discount > 0
  );

  // Set target date to 3 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <h1 className="text-3xl font-bold mb-8">Hot Deals</h1>

      <FlashSaleBanner targetDate={targetDate.toISOString()} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {discountedProducts.length > 0 ? (
          discountedProducts.map((product) => (
            <ProductsCard key={product.id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No active deals at the moment. Check back later!
          </p>
        )}
      </div>
    </div>
  );
}
