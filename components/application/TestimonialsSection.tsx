import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Rahim Ahmed",
    role: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    quote:
      "Laptop Point BD provided me with an authentic HP EliteBook. The condition was pristine, just like new. Their support team was helpful in guiding me to the right choice.",
  },
  {
    id: 2,
    name: "Fatima Begum",
    role: "Student",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    quote:
      "I was looking for a budget-friendly laptop for my university work and found a great deal on a Dell Latitude. Delivery was fast and the packaging was secure.",
  },
  {
    id: 3,
    name: "Tanvir Hasan",
    role: "Digital Marketer",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    quote:
      "Bought two laptops for our office and both perform exceptionally well. Having a clear warranty and responsive customer service gave us complete peace of mind.",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-12 sm:py-16 lg:py-20 bg-surface border-t border-line"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <span className="text-caption font-semibold tracking-wider uppercase text-brand-navy mb-2 block">
            Real Customer Experiences
          </span>
          <h2
            id="testimonials-heading"
            className="text-h2 font-bold text-ink tracking-tight mb-3"
          >
            What our buyers say
          </h2>
          <p className="text-body text-ink-2 max-w-[65ch]">
            Real feedback from students, professionals, and businesses across Bangladesh
            who purchased their laptops from us.
          </p>
        </div>

        {/* 3-up minimal grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item) => (
            <figure
              key={item.id}
              className="flex flex-col bg-surface-2 p-6 sm:p-7 rounded-[var(--radius-lg)] border border-line shadow-soft"
            >
              <Quote className="w-6 h-6 text-brand-navy/30 mb-4" aria-hidden="true" />
              <blockquote className="flex-1 mb-6">
                <p className="text-body text-ink-2 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-line/60">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-line">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-small font-semibold text-ink">
                    {item.name}
                  </h3>
                  <p className="text-caption text-muted-text">
                    {item.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
