import TrackOrderClient from "@/components/order/TrackOrderClient";
import { getStorefrontContact } from "@/lib/public-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | Laptop Point Bangladesh",
  description:
    "Track the live status, courier dispatch, and delivery progress of your Laptop Point BD order using your order number and phone number.",
  alternates: {
    canonical: "https://laptoppointbd.com/track-order",
  },
};

export default async function TrackOrderPage() {
  const contact = await getStorefrontContact().catch(() => undefined);

  return (
    <TrackOrderClient
      contactInfo={
        contact
          ? {
              hotline: contact.hotline,
              whatsapp: contact.whatsapp,
            }
          : undefined
      }
    />
  );
}
