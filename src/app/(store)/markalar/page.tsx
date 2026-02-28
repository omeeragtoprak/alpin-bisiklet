"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

export default function BrandsPage() {
    const { data: brands, isLoading } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const res = await fetch("/api/brands");
            if (!res.ok) throw new Error("Markalar yüklenemedi");
            const json = await res.json();
            return json.data;
        },
    });

    return (
        <div className="container mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Markalar</h1>
                <p className="text-muted-foreground text-center mb-12">
                    Dünya&apos;nın en iyi bisiklet markalarını keşfedin.
                </p>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : brands?.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Henüz marka eklenmemiş.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {brands?.map((brand: any, index: number) => (
                            <motion.div
                                key={brand.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/markalar/${brand.slug}`}
                                    className="group block bg-card border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all text-center"
                                >
                                    {brand.logo ? (
                                        <div className="relative h-24 w-full mb-4">
                                            <Image
                                                src={brand.logo}
                                                alt={brand.name}
                                                fill
                                                className="object-contain group-hover:scale-105 transition-transform"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center mb-4">
                                            <span className="text-3xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                                                {brand.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                        {brand.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {brand._count?.products || 0} ürün
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
