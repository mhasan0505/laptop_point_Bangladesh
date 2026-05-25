import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laptop Routers & Network Accessories",
  description:
    "Shop Wi-Fi routers and networking accessories for stable internet performance with laptops and workstations.",
  alternates: {
    canonical: "https://laptoppointbd.com/accessories/routers",
  },
};

const page = () => {
  return (
    <div className="min-h-screen container ">This a Router Products Page</div>
  );
};

export default page;
