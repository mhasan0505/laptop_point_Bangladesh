import { Calendar, Facebook, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock Data (duplicated for now, ideally moved to a separate data file)
const posts = [
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
    slug: "how-to-maintain-laptop",
    coverImage:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200&auto=format&fit=crop",
    date: "2024-03-10",
    author: {
      name: "Sonia Akter",
      picture: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    category: "Tips",
    content: "<p>Content for maintaining your laptop...</p>",
  },
  // ... other posts would go here
];

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="pb-16 bg-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 w-full">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center text-white">
            <div className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Image
                  src={post.author.picture}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white"
                />
                <span className="font-semibold">{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Calendar size={16} />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 mt-12">
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:underline prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share & Tags */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h4 className="text-lg font-bold text-gray-900">
              Share this post:
            </h4>
            <div className="flex gap-4">
              <button title="Share on Facebook" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <Facebook size={20} />
              </button>
              <button title="Share on Twitter" className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors">
                <Twitter size={20} />
              </button>
              <button title="Share on LinkedIn" className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors">
                <Linkedin size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
