import Link from "next/link";
import { Laptop, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-gray-50/50">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-sm">
          <Laptop className="w-10 h-10" />
        </div>

        <span className="block text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 text-base mb-8 max-w-md mx-auto leading-relaxed">
          The laptop or page you are looking for does not exist, has been relocated, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Laptops
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
