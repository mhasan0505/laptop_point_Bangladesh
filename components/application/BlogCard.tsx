"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaCalendarAlt, FaUser } from "react-icons/fa";

interface BlogPost {
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
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block relative h-48 sm:h-64 overflow-hidden"
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wide">
          {post.category}
        </div>
      </Link>
      <div className="p-6">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <FaCalendarAlt />
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <FaUser />
            {post.author.name}
          </span>
        </div>
        <Link href={`/blog/${post.slug}`} className="block">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-primary font-semibold text-sm hover:underline"
        >
          Read Article &rarr;
        </Link>
      </div>
    </motion.article>
  );
}
