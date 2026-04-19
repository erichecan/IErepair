"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/data/fonfix/blog-posts";

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Hero */}
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            The IErepair Blog
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg max-w-xl mx-auto">
            Repair guides, device tips, and advice for every smartphone owner.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--fonfix-blue)] text-white"
                  : "bg-white text-[var(--fonfix-text-muted)] border border-[var(--fonfix-border)] hover:border-[var(--fonfix-blue)] hover:text-[var(--fonfix-blue)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="group bg-white rounded-2xl border border-[var(--fonfix-border)] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] bg-[var(--fonfix-blue-light)] overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-semibold text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] rounded-full px-2.5 py-1 mb-3">
                  {post.category}
                </span>
                <h2 className="font-bold text-[var(--fonfix-text)] leading-snug mb-2 group-hover:text-[var(--fonfix-blue)] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--fonfix-text-muted)] line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-[var(--fonfix-text-muted)]">
                  <span>{post.publishedAt}</span>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
