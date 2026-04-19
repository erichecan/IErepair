import Link from "next/link";
import { BLOG_POSTS } from "@/data/fonfix/blog-posts";

export default function BlogPreview() {
  const posts = BLOG_POSTS.slice(0, 3);

  return (
    <section className="py-20 md:py-28 bg-[#F8FAFD]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-2">
              From the Fonfix blog
            </h2>
            <p className="text-[var(--fonfix-text-muted)]">
              Repair guides, tips, and advice for every device.
            </p>
          </div>
          <Link
            href="/blogs"
            className="hidden md:inline-block text-sm font-semibold text-[var(--fonfix-blue)] hover:underline"
          >
            View all posts →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
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
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-semibold text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] rounded-full px-2.5 py-1 mb-3">
                  {post.category}
                </span>
                <h3 className="font-bold text-[var(--fonfix-text)] leading-snug mb-2 group-hover:text-[var(--fonfix-blue)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--fonfix-text-muted)] line-clamp-2">{post.excerpt}</p>
                <p className="text-xs text-[var(--fonfix-text-muted)] mt-3">{post.readTime} min read</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden text-center mt-8">
          <Link
            href="/blogs"
            className="text-sm font-semibold text-[var(--fonfix-blue)] hover:underline"
          >
            View all posts →
          </Link>
        </div>
      </div>
    </section>
  );
}
