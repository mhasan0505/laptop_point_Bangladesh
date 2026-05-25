import BlogCard from "@/components/application/BlogCard";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laptop Tips, Reviews & Buying Guides",
  description:
    "Read the latest laptop buying guides, maintenance tips, and product reviews from Laptop Point Bangladesh.",
  alternates: {
    canonical: "https://laptoppointbd.com/blog",
  },
  openGraph: {
    title: "Laptop Tips, Reviews & Buying Guides",
    description:
      "Read the latest laptop buying guides, maintenance tips, and product reviews from Laptop Point Bangladesh.",
    url: "https://laptoppointbd.com/blog",
    type: "website",
    images: ["/Hero_Image.png"],
  },
};

export default function BlogPage() {
  const blogCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Laptop Point Bangladesh Blog",
    url: "https://laptoppointbd.com/blog",
    description:
      "Laptop buying guides, maintenance tips, and product reviews for Bangladesh shoppers.",
    hasPart: BLOG_POSTS.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `https://laptoppointbd.com/blog/${post.slug}`,
      datePublished: post.date,
      image: post.coverImage,
      author: {
        "@type": "Person",
        name: post.author.name,
      },
    })),
  };

  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogCollectionSchema),
        }}
      />

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
        {BLOG_POSTS.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
