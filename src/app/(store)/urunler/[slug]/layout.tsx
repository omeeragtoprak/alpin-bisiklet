import type { Metadata } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    try {
        const product = await prisma.product.findFirst({
            where: { slug, isActive: true },
            select: {
                name: true,
                description: true,
                price: true,
                images: { take: 1, orderBy: { order: "asc" }, select: { url: true, alt: true } },
                brand: { select: { name: true } },
                category: { select: { name: true } },
            },
        });

        if (!product) {
            return { title: "Ürün Bulunamadı" };
        }

        const title = product.name;
        const description = product.description?.slice(0, 160) || `${product.name} - Alpin Bisiklet'te en uygun fiyatlarla.`;
        const image = product.images?.[0]?.url;

        return {
            title,
            description,
            openGraph: {
                title: `${title} | Alpin Bisiklet`,
                description,
                type: "website",
                url: `${BASE_URL}/urunler/${slug}`,
                images: image ? [{ url: image.startsWith("http") ? image : `${BASE_URL}${image}`, alt: product.images?.[0]?.alt || title }] : undefined,
                siteName: "Alpin Bisiklet",
                locale: "tr_TR",
            },
            twitter: {
                card: "summary_large_image",
                title: `${title} | Alpin Bisiklet`,
                description,
                images: image ? [image.startsWith("http") ? image : `${BASE_URL}${image}`] : undefined,
            },
        };
    } catch {
        return { title: "Ürün Detayı" };
    }
}

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
