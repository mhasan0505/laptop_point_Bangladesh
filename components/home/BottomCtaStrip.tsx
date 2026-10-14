import { getStorefrontContact } from "@/lib/public-content";
import { MessageCircle, Phone } from "lucide-react";
import PromoBanner from "./PromoBanner";

const dialable = (s: string) => s.replace(/[^\d+]/g, "");

/** Hotline / WhatsApp strip fed by Store Profile + the `home.bottom-cta` banner. */
export default async function BottomCtaStrip({
  heading,
  subheading,
}: {
  heading?: string;
  subheading?: string;
}) {
  const profile = await getStorefrontContact();
  const wa = dialable(profile.whatsapp).replace(/^\+/, "");

  return (
    <>
      <PromoBanner
        placement="home.bottom-cta"
        aspectClassName="aspect-[16/6] sm:aspect-[16/3]"
      />
      <section
        aria-labelledby="bottom-cta-heading"
        className="bg-brand-navy py-12 sm:py-16 text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="max-w-2xl">
            <h2
              id="bottom-cta-heading"
              className="text-h2 font-bold tracking-tight text-white mb-2"
            >
              {heading || "Not sure which laptop fits your needs?"}
            </h2>
            <p className="text-body text-white/80 max-w-[65ch]">
              {subheading ||
                "Talk directly to our hardware team — we'll help you pick by budget and intended use."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={`tel:${dialable(profile.hotline)}`}
              className="inline-flex items-center gap-2 h-12 sm:h-11 px-6 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-small font-semibold shadow-soft hover:shadow-lift transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>{profile.hotline}</span>
            </a>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 sm:h-11 px-6 rounded-full border border-white/30 hover:border-white/60 hover:bg-white/10 text-white text-small font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-navy"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
