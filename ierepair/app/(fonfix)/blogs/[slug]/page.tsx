import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/fonfix/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="w-full h-64 md:h-80 bg-[var(--fonfix-blue-light)] overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--fonfix-text-muted)] mb-6">
          <Link href="/blogs" className="hover:text-[var(--fonfix-blue)]">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--fonfix-text)]">{post.category}</span>
        </nav>

        {/* Meta */}
        <span className="inline-block text-xs font-semibold text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] rounded-full px-3 py-1 mb-4">
          {post.category}
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-[var(--fonfix-text-muted)] mb-10 pb-8 border-b border-[var(--fonfix-border)]">
          <span>{post.author}</span>
          <span>·</span>
          <span>{post.publishedAt}</span>
          <span>·</span>
          <span>{post.readTime} min read</span>
        </div>

        {/* Content */}
        <div
          className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-[var(--fonfix-text)] prose-p:text-[var(--fonfix-text-muted)] prose-p:leading-relaxed prose-a:text-[var(--fonfix-blue)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 bg-[var(--fonfix-blue-light)] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-2">
            Need a repair? Book today.
          </h2>
          <p className="text-[var(--fonfix-text-muted)] mb-6">
            Same-day service · 180-day warranty · No Fix, No Fee
          </p>
          <Link
            href="/repair/book"
            className="inline-block px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
          >
            Book a Repair →
          </Link>
        </div>
      </div>
    </div>
  );
}
