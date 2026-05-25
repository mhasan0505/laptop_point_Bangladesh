import { BLOG_POSTS } from "@/lib/blog-posts";
import { articleSchema } from "@/lib/seo-schemas";
import { Calendar, Facebook, Linkedin, Twitter } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const htmlToText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    post.excerpt ||
    htmlToText(post.content).slice(0, 155) ||
    "Read laptop buying guides and insights from Laptop Point Bangladesh.";

  const canonicalUrl = `https://laptoppointbd.com/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.date,
      images: [
        {
          url: post.coverImage,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const blogPostingJsonLd = articleSchema({
    title: post.title,
    description:
      post.excerpt ||
      htmlToText(post.content).slice(0, 155) ||
      "Read laptop buying guides and insights from Laptop Point Bangladesh.",
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.date,
    author: post.author.name,
  });

  return (
    <article className="pb-16 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

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
              <button
                title="Share on Facebook"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Facebook size={20} />
              </button>
              <button
                title="Share on Twitter"
                className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
              >
                <Twitter size={20} />
              </button>
              <button
                title="Share on LinkedIn"
                className="p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
              >
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
