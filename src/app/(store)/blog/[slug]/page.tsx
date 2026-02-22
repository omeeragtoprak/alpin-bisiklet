import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { ChevronRight, Calendar } from "lucide-react";
import { BlogPostingSchema, BreadcrumbSchema } from "@/components/seo/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const blog = await prisma.blog.findFirst({
        where: { slug, isPublished: true },
        select: { title: true, metaTitle: true, metaDescription: true, excerpt: true, coverImage: true, publishedAt: true },
    });

    if (!blog) return {};

    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.excerpt || undefined;
    const imageUrl = blog.coverImage?.startsWith("http")
        ? blog.coverImage
        : blog.coverImage
          ? `${BASE_URL}${blog.coverImage}`
          : undefined;

    return {
        title,
        description,
        alternates: { canonical: `${BASE_URL}/blog/${slug}` },
        openGraph: {
            title,
            description,
            type: "article",
            url: `${BASE_URL}/blog/${slug}`,
            images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
            publishedTime: blog.publishedAt?.toISOString(),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: imageUrl ? [imageUrl] : undefined,
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;

    const blog = await prisma.blog.findFirst({
        where: { slug, isPublished: true },
        select: {
            id: true,
            title: true,
            excerpt: true,
            content: true,
            coverImage: true,
            publishedAt: true,
        },
    });

    if (!blog) notFound();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <BlogPostingSchema blog={blog} slug={slug} />
            <BreadcrumbSchema
                items={[
                    { name: "Ana Sayfa", url: "/" },
                    { name: "Blog", url: "/blog" },
                    { name: blog.title, url: `/blog/${slug}` },
                ]}
            />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                <span className="text-foreground font-medium line-clamp-1">{blog.title}</span>
            </nav>

            {blog.coverImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
                    <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 1200px) 100vw, 896px"
                    />
                </div>
            )}

            <header className="mb-8">
                {blog.publishedAt && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <time dateTime={blog.publishedAt.toISOString()}>
                            {new Date(blog.publishedAt).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </time>
                    </div>
                )}
                <h1 className="text-3xl md:text-4xl font-bold">{blog.title}</h1>
            </header>

            <div
                className="prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />
        </div>
    );
}
