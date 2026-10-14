import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

export default function WhyUs() {
  const points = [
    {
      icon: CheckCircle2,
      title: "Every laptop is tested",
      description:
        "Our hardware technicians inspect and stress-test the battery, screen, keyboard, and motherboard before any unit is listed.",
      linkText: "Our testing standards",
      href: "/returns",
    },
    {
      icon: ShieldCheck,
      title: "Warranty you can claim",
      description:
        "Every device comes with genuine replacement warranty coverage and dedicated in-house technical support if anything goes wrong.",
      linkText: "Read return & warranty policy",
      href: "/returns",
    },
    {
      icon: MapPin,
      title: "Visit before you buy",
      description:
        "Experience and test any laptop hands-on at our physical showroom in Dhaka before paying a single taka.",
      linkText: "Find showroom location",
      href: "/contact",
    },
  ];

  return (
    <section
      aria-labelledby="why-us-heading"
      className="py-12 sm:py-16 lg:py-20 bg-surface-2 border-y border-line"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <span className="text-caption font-semibold tracking-wider uppercase text-brand-navy mb-2 block">
            Trust & Transparency
          </span>
          <h2
            id="why-us-heading"
            className="text-h2 font-bold text-ink tracking-tight mb-3"
          >
            Why buying refurbished from Laptop Point BD makes sense
          </h2>
          <p className="text-body text-ink-2 max-w-[65ch]">
            We eliminate the risk of buying used electronics with rigorous quality
            verification, clear warranty terms, and an open showroom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="flex flex-col bg-surface p-6 sm:p-7 rounded-[var(--radius-lg)] border border-line shadow-soft"
              >
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-brand-navy/5 text-brand-navy flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-h3 font-semibold text-ink mb-2">
                  {point.title}
                </h3>
                <p className="text-body text-ink-2 mb-6 flex-1 leading-relaxed">
                  {point.description}
                </p>
                <div>
                  <Link
                    href={point.href}
                    className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-navy hover:text-brand-red transition-colors group"
                  >
                    <span>{point.linkText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
