import BlogCard from "@/components/application/BlogCard";

// Mock Data
const posts = [
  {
    title: "Top 5 Laptops for Programming in 2024",
    excerpt:
      "Choosing the right laptop for coding can be tricky. We break down the best options based on performance, keyboard quality, and battery life.",
    slug: "top-5-laptops-programming-2024",
    coverImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    date: "2024-03-15",
    author: {
      name: "Arif Islam",
      picture: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    category: "Guides",
  },
  {
    title: "How to Maintain Your Laptop for Longevity",
    excerpt:
      "Simple tips and tricks to keep your laptop running smoothly for years. From battery care to cleaning the vents.",
    slug: "how-to-maintain-laptop",
    coverImage:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&auto=format&fit=crop",
    date: "2024-03-10",
    author: {
      name: "Sonia Akter",
      picture: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    category: "Tips",
  },
  {
    title: "Refurbished vs. Used: What's the Difference?",
    excerpt:
      "Understand the key differences between refurbished and used laptops to make an informed buying decision.",
    slug: "refurbished-vs-used-laptops",
    coverImage:
      "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?q=80&w=600&auto=format&fit=crop",
    date: "2024-03-05",
    author: {
      name: "Rahim Ahmed",
      picture: "https://randomuser.me/api/portraits/men/85.jpg",
    },
    category: "Buying Guide",
  },
  {
    title: "HP EliteBook 840 G5 Review",
    excerpt:
      "A detailed look at the HP EliteBook 840 G5. Is it still worth buying in 2024? We test its performance and durability.",
    slug: "hp-elitebook-840-g5-review",
    coverImage:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3bd99?q=80&w=600&auto=format&fit=crop",
    date: "2024-02-28",
    author: {
      name: "Tanvir Hasan",
      picture: "https://randomuser.me/api/portraits/men/12.jpg",
    },
    category: "Reviews",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Latest Insights & News
        </h1>
        <p className="text-gray-600">
          Stay updated with the latest trends, reviews, and buying guides from
          the world of laptops and technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
