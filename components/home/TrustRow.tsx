import { CheckCircle2, CreditCard, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface TrustRowProps {
  className?: string;
  showroomAddress?: string;
}

export default function TrustRow({
  className = "",
  showroomAddress = "Mirpur-10, Dhaka",
}: TrustRowProps) {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Warranty Guaranteed",
      description: "15-day replacement & 2-year service warranty",
      href: "/warranty",
    },
    {
      icon: CheckCircle2,
      title: "Tested & Certified",
      description: "Inspected by hardware engineers before delivery",
      href: "/about",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment",
      description: "bKash, Nagad, Visa, Mastercard & Cash on Delivery",
      href: "/payment-methods",
    },
    {
      icon: MapPin,
      title: "Visit Our Showroom",
      description: `Test in person at ${showroomAddress}`,
      href: "/contact",
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}
      aria-label="Store Trust Highlights"
    >
      {trustItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={index}
            href={item.href}
            className="flex items-start gap-3 p-4 rounded-xl border border-line bg-surface dark:bg-card hover:bg-surface-2 dark:hover:bg-surface-3/10 transition-colors shadow-soft group"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-navy/10 dark:bg-primary/20 text-brand-navy dark:text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-small font-semibold text-ink dark:text-foreground leading-snug">
                {item.title}
              </h4>
              <p className="text-caption text-ink-2 dark:text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
