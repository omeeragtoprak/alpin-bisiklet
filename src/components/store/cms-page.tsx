"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

interface CMSPageProps {
    slug: string;
    title: string;
    fallbackContent: string;
}

export function CMSPage({ slug, title, fallbackContent }: CMSPageProps) {
    const { data: page, isLoading } = useQuery({
        queryKey: ["page", slug],
        queryFn: async () => {
            const res = await fetch(`/api/pages/by-slug/${slug}`);
            if (!res.ok) return null;
            const json = await res.json();
            return json.data;
        },
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <div className="space-y-4">
                    <div className="h-10 bg-muted animate-pulse rounded w-1/2 mx-auto" />
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                    {page?.title || title}
                </h1>

                {page?.content ? (
                    <div
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                ) : (
                    <div className="prose prose-neutral max-w-none text-muted-foreground whitespace-pre-line">
                        {fallbackContent}
                    </div>
                )}

                {page?.updatedAt && (
                    <p className="text-sm text-muted-foreground mt-8 text-center">
                        Son güncelleme: {new Date(page.updatedAt).toLocaleDateString("tr-TR")}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
