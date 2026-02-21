import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const page = await prisma.page.findFirst({
        where: { slug, isPublished: true },
        select: { title: true, metaTitle: true, metaDescription: true },
    });

    if (!page) return {};

    return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || undefined,
    };
}

export default async function CmsPage({ params }: Props) {
    const { slug } = await params;

    const page = await prisma.page.findFirst({
        where: { slug, isPublished: true },
        select: { id: true, title: true, content: true, updatedAt: true },
    });

    if (!page) notFound();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">{page.title}</h1>
            <div
                className="prose prose-neutral max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
            />
        </div>
    );
}
