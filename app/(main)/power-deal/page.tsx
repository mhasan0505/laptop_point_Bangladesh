import { Metadata } from "next";
import { getPowerDealConfig, getPowerDeals } from "@/lib/power-deal-data";
import PowerDealClientView from "@/components/power-deal/PowerDealClientView";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPowerDealConfig();
  return {
    title: `${config.title || "The Power Deal"} | Laptop Point Bangladesh`,
    description:
      config.subtitle ||
      "Explore curated commercial laptops and workstations at verified clearance prices. Official warranty guaranteed.",
    alternates: {
      canonical: "https://laptoppointbd.com/power-deal",
    },
    openGraph: {
      title: `${config.title || "The Power Deal"} | Laptop Point BD`,
      description: config.subtitle,
      url: "https://laptoppointbd.com/power-deal",
      type: "website",
    },
  };
}

export default async function PowerDealPage() {
  const [config, deals] = await Promise.all([
    getPowerDealConfig(),
    getPowerDeals(),
  ]);

  const activeDeals = deals
    .filter((d) => d.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return <PowerDealClientView config={config} initialDeals={activeDeals} />;
}
