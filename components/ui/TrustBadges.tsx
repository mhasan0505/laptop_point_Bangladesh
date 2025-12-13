import { CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";

interface TrustBadgeProps {
  variant?: "row" | "grid";
}

const TrustBadges = ({ variant = "row" }: TrustBadgeProps) => {
  const badges = [
    {
      icon: ShieldCheck,
      title: "Official Warranty",
      description: "100% Authentic Products",
    },
    {
      icon: RefreshCw,
      title: "7 Days Return",
      description: "Easy Return Policy",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "24-48 Hours Delivery",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "100% Secure Checkout",
    },
  ];

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-t border-gray-100">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
              <badge.icon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {badge.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Row variant (good for product page)
  return (
    <div className="flex flex-wrap gap-4 lg:gap-8 justify-between p-5 bg-yellow-50/50 rounded-xl border border-yellow-100">
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-3">
          <badge.icon className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {badge.title}
            </span>
            <span className="text-[10px] text-gray-500">
              {badge.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
