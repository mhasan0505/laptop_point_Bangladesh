import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { Button } from "../ui/button";

const BentoGridSection = () => {
  return (
    <section className="py-20 bg-neutral-50/40 dark:bg-neutral-900/40 overflow-hidden">
      <div className="container px-4 md:px-6 w-full max-w-[95%] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Premium Laptop Collection
            </h2>
            <p className="text-muted-foreground text-lg max-w-[600px]">
              Explore our diverse range of high-performance laptops designed for
              every need.
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="rounded-full group">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <BentoGrid className="max-w-none md:auto-rows-[300px]">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};

const items = [
  {
    title: "HP Elitebook 840 G6",
    description: "Power and performance in a sleek design.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 rounded-xl overflow-hidden relative">
        <Image
          src="/products/hp/HP_Elitebook_840_G6/main.png"
          alt="HP Elitebook 840 G6"
          fill
          className="object-contain hover:scale-105 transition-transform duration-500"
        />
      </div>
    ),
    className: "md:col-span-2 md:row-span-2 min-h-[400px]",
  },
  {
    title: "Compact Powerhouse",
    description: "HP Probook 440 G3 for portability.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 rounded-xl overflow-hidden relative bg-muted/30">
        <Image
          src="/products/hp/HP_Probook_440_G3/front.png"
          alt="HP Probook 440 G3"
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-500"
        />
      </div>
    ),
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Side View Elegance",
    description: "Slim profile of the Elitebook G6.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 rounded-xl overflow-hidden relative bg-muted/30">
        <Image
          src="/products/hp/HP_Elitebook_840_G6/side01.png"
          alt="HP Elitebook Side"
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-500"
        />
      </div>
    ),
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Connectivity Hub",
    description: "Versatile ports for all your devices.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 rounded-xl overflow-hidden relative bg-muted/30">
        <Image
          src="/products/hp/HP_Elitebook_840_G6/port.png"
          alt="Connectivity Ports"
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-500"
        />
      </div>
    ),
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Classic Design",
    description: "Reliable HP Elitebook 840 G3.",
    header: (
      <div className="flex flex-1 w-full h-full min-h-24 rounded-xl overflow-hidden relative bg-muted/30">
        <Image
          src="/products/hp/HP_Elitebook_840_G3/main.png"
          alt="HP Elitebook 840 G3"
          fill
          className="object-contain p-4 hover:scale-105 transition-transform duration-500"
        />
      </div>
    ),
    className: "md:col-span-2 md:row-span-1",
  },
];

export default BentoGridSection;
