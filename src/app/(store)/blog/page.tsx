import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ChevronRight, Calendar } from "lucide-react";

export const metadata: Metadata = {
    title: "Blog | Alpin Bisiklet",
    description: "Bisiklet dünyasından haberler, bakım rehberleri ve öneriler.",
};

export const revalidate = 60;

export default async function BlogListPage() {
    const blogs = await prisma.blog.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
        },
    });

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                <span className="text-foreground font-medium">Blog</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-bold mb-10">Blog</h1>

            {blogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">Henüz blog yazısı yok.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Link
                            key={blog.id}
                            href={`/blog/${blog.slug}`}
                            className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {blog.coverImage && (
                                <div className="relative aspect-video overflow-hidden">
                                    <Image
                                        src={blog.coverImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                {blog.publishedAt && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                        <time dateTime={blog.publishedAt.toISOString()}>
                                            {new Date(blog.publishedAt).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </time>
                                    </div>
                                )}
                                <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {blog.title}
                                </h2>
                                {blog.excerpt && (
                                    <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
