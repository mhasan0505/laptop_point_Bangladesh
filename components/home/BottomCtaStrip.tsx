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
        aspectClassName="aspect-[16/6] sm:aspect-[16/2.5]"
      />
      <section className="bg-[#002b60] py-10 text-white">
        <div className="mx-auto flex w-full max-w-[95%] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              {heading || "Not sure which laptop fits you?"}
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              {subheading ||
                "Talk to our team — we'll help you pick by budget and use case."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${dialable(profile.hotline)}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#dc0303] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#b80202]"
            >
              <Phone size={16} /> {profile.hotline}
            </a>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
