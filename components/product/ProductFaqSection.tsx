import React from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

export const PRODUCT_FAQS: FAQItem[] = [
  {
    question: "What warranty and service support are provided with this laptop?",
    answer:
      "Every laptop purchased from Laptop Point BD includes a 15-day replacement guarantee and a 2-year free service warranty. In addition, returns for refund or exchange are supported within 7 days of purchase for items in original unused condition, and defective items will be replaced free of charge within 30 days.",
  },
  {
    question: "How are pre-owned and refurbished laptops tested before sale?",
    answer:
      "Every device sold by Laptop Point BD is rigorously inspected by certified hardware technicians. We conduct stress tests and diagnostics on the battery health, display screen, keyboard, ports, motherboard, and cooling performance before any laptop is made available for sale.",
  },
  {
    question: "Can I upgrade the RAM and SSD storage on this laptop?",
    answer:
      "Yes, RAM and SSD storage can be customized and upgraded according to your computing requirements. You can select your preferred RAM capacity (up to 32GB) and SSD storage (up to 1TB) during order placement or contact our technical team for custom configurations.",
  },
  {
    question: "Do you offer Cash on Delivery (COD) outside Dhaka?",
    answer:
      "Yes, we provide Cash on Delivery across all 64 districts in Bangladesh with real-time courier tracking. Inside Dhaka, same-day delivery is available with hands-on physical inspection before payment. Standard shipping is also available with express courier options nationwide.",
  },
  {
    question: "Can I visit your showroom to inspect and test the laptop before purchasing?",
    answer:
      "Yes, you are welcome to visit our physical showroom located at Madbar Mansion, Shop-08, Mirpur-10, Dhaka-1216, Bangladesh. We are open everyday from 10:00 AM to 9:00 PM where you can test the laptop hands-on before making payment.",
  },
];

interface ProductFaqSectionProps {
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function ProductFaqSection({
  faqs = PRODUCT_FAQS,
  title = "Frequently Asked Questions",
  subtitle = "Clear, factual answers regarding warranty, testing, upgrades, shipping, and showroom visits.",
}: ProductFaqSectionProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-5 sm:p-7 shadow-2xs mb-6 scroll-mt-28">
      {/* FAQPage Schema rendered server-side */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-lg bg-[#002b60]/10 text-[#002b60] dark:bg-primary/20 dark:text-primary">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#002b60] dark:text-foreground uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group border border-gray-200 dark:border-border rounded-lg bg-gray-50/50 dark:bg-card/50 transition-colors open:bg-white dark:open:bg-card open:border-[#002b60]/30"
          >
            <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 select-none list-none">
              <span>{faq.question}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2" />
            </summary>
            <div className="px-4 pb-3.5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-border/50">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
