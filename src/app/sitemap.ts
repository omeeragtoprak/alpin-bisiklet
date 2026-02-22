import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Statik sayfalar
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
        { url: `${BASE_URL}/urunler`, changeFrequency: "daily", priority: 0.9 },
        { url: `${BASE_URL}/markalar`, changeFrequency: "weekly", priority: 0.7 },
        { url: `${BASE_URL}/hakkimizda`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${BASE_URL}/iletisim`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${BASE_URL}/sikca-sorulan-sorular`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${BASE_URL}/gizlilik-politikasi`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE_URL}/iade-kosullari`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE_URL}/kargo-bilgileri`, changeFrequency: "yearly", priority: 0.3 },
        { url: `${BASE_URL}/mesafeli-satis-sozlesmesi`, changeFrequency: "yearly", priority: 0.3 },
    ];

    // Ürünler
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        });

        productPages = products.map((product) => ({
            url: `${BASE_URL}/urunler/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));
    } catch {
        // DB bağlantısı yoksa devam et
    }

    // Kategoriler
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
        });

        categoryPages = categories.map((category) => ({
            url: `${BASE_URL}/urunler?kategori=${category.slug}`,
            lastModified: category.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));
    } catch {
        // DB bağlantısı yoksa devam et
    }

    // Blog yazıları
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const blogs = await prisma.blog.findMany({
            where: { isPublished: true },
            select: { slug: true, updatedAt: true },
        });

        blogPages = blogs.map((blog) => ({
            url: `${BASE_URL}/blog/${blog.slug}`,
            lastModified: blog.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));
    } catch {
        // DB bağlantısı yoksa devam et
    }

    // CMS Sayfaları
    let cmsPages: MetadataRoute.Sitemap = [];
    try {
        const pages = await prisma.page.findMany({
            where: { isPublished: true },
            select: { slug: true, updatedAt: true },
        });

        cmsPages = pages.map((page) => ({
            url: `${BASE_URL}/sayfalar/${page.slug}`,
            lastModified: page.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.5,
        }));
    } catch {
        // DB bağlantısı yoksa devam et
    }

    // Blog ana sayfası
    const blogIndex: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    ];

    return [
        ...staticPages,
        ...blogIndex,
        ...productPages,
        ...categoryPages,
        ...blogPages,
        ...cmsPages,
    ];
}
