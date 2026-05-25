export interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  date: string;
  author: {
    name: string;
    picture: string;
  };
  category: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Top 5 Laptops for Programming in 2024",
    excerpt:
      "Choosing the right laptop for coding can be tricky. We break down the best options based on performance, keyboard quality, and battery life.",
    slug: "top-5-laptops-programming-2024",
    coverImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
    date: "2024-03-15",
    author: {
      name: "Arif Islam",
      picture: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    category: "Guides",
    content: `
      <h2>Introduction</h2>
      <p>Programming requires a specific set of features in a laptop. You need a fast processor for compiling code, plenty of RAM for running virtual machines, and a comfortable keyboard for long coding sessions. In this guide, we'll explore the top 5 laptops that meet these criteria in 2024.</p>

      <h2>1. MacBook Pro 14-inch (M3 Pro)</h2>
      <p>The MacBook Pro remains the gold standard for many developers. The M3 Pro chip offers incredible performance per watt, meaning you get top-tier speed without sacrificing battery life. The display is stunning, and the keyboard is one of the best on the market.</p>

      <h2>2. Dell XPS 15</h2>
      <p>For Windows users, the Dell XPS 15 is a powerhouse. It features a high-resolution OLED display and premium build quality. We recommend configuring it with at least 32GB of RAM for heavy development tasks.</p>

      <h2>3. Lenovo ThinkPad X1 Carbon Gen 11</h2>
      <p>If typing experience is your priority, look no further than the ThinkPad X1 Carbon. It's lightweight, durable, and features the legendary ThinkPad keyboard. It's also great for Linux support.</p>

      <h2>4. ASUS ROG Zephyrus G14</h2>
      <p>Who says you can't game and code? The G14 is a beast of a machine in a compact form factor. It's powerful enough for game development and portable enough to carry to hackathons.</p>

      <h2>5. HP EliteBook 840 G8</h2>
      <p>A more budget-friendly business option that doesn't skimp on quality. It offers great upgradability and security features, making it a solid choice for enterprise developers.</p>

      <h2>Conclusion</h2>
      <p>The best laptop for you depends on your specific needs and budget. Consider what kind of development you do (web, mobile, game, systems) and choose accordingly.</p>
    `,
  },
  {
    title: "How to Maintain Your Laptop for Longevity",
    excerpt:
      "Simple tips and tricks to keep your laptop running smoothly for years. From battery care to cleaning the vents.",
    slug: "how-to-maintain-laptop",
    coverImage:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200&auto=format&fit=crop",
    date: "2024-03-10",
    author: {
      name: "Sonia Akter",
      picture: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    category: "Tips",
    content:
      "<p>Regular cleaning, thermal maintenance, safe charging habits, and software updates can significantly extend laptop lifespan.</p>",
  },
  {
    title: "Refurbished vs. Used: What's the Difference?",
    excerpt:
      "Understand the key differences between refurbished and used laptops to make an informed buying decision.",
    slug: "refurbished-vs-used-laptops",
    coverImage:
      "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?q=80&w=1200&auto=format&fit=crop",
    date: "2024-03-05",
    author: {
      name: "Rahim Ahmed",
      picture: "https://randomuser.me/api/portraits/men/85.jpg",
    },
    category: "Buying Guide",
    content:
      "<p>Refurbished laptops are professionally inspected and restored, while used laptops are sold in current condition without formal restoration standards.</p>",
  },
  {
    title: "HP EliteBook 840 G5 Review",
    excerpt:
      "A detailed look at the HP EliteBook 840 G5. Is it still worth buying in 2024? We test its performance and durability.",
    slug: "hp-elitebook-840-g5-review",
    coverImage:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3bd99?q=80&w=1200&auto=format&fit=crop",
    date: "2024-02-28",
    author: {
      name: "Tanvir Hasan",
      picture: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    category: "Reviews",
    content:
      "<p>The HP EliteBook 840 G5 still delivers strong business performance, portability, and keyboard quality for office and development workflows.</p>",
  },
];
