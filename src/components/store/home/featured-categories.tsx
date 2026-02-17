"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import { Category } from "@/types";
import { ArrowUpRight } from "lucide-react";

interface CategoryWithImages extends Category {
    productImages: string[];
}

export function FeaturedCategories() {
    const [categories, setCategories] = useState<CategoryWithImages[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await categoryService.getAll();
                const parents = data
                    .filter((c) => !c.parentId && c.isActive)
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 6);

                // Fetch product images for each category
                const withImages = await Promise.all(
                    parents.map(async (cat) => {
                        try {
                            const res = await productService.getAll({ categoryId: cat.id, limit: 6 });
                            const images = res.data
                                .filter((p) => p.images?.length > 0)
                                .map((p) => p.images[0].url);
                            return { ...cat, productImages: images };
                        } catch {
                            return { ...cat, productImages: [] };
                        }
                    })
                );

                setCategories(withImages);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    const largeItems = categories.slice(0, 2);
    const smallItems = categories.slice(2);

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                {/* Section header */}
                <div className="text-center mb-8">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block"
                    >
                        Kategoriler
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black tracking-tight mb-3"
                    >
                        İhtiyacına Uygun Olanı Bul
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground max-w-lg mx-auto"
                    >
                        Dağdan şehre, yarıştan gezmeye — her tarza ve ihtiyaca uygun bisikletler
                    </motion.p>
                </div>

                {/* Bento grid layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]">
                    {largeItems.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="col-span-2 row-span-2"
                        >
                            <CategoryCard category={category} large />
                        </motion.div>
                    ))}
                    {smallItems.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                            className="col-span-1 row-span-1"
                        >
                            <CategoryCard category={category} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CategoryCard({
    category,
    large = false,
}: {
    category: CategoryWithImages;
    large?: boolean;
}) {
    // Use product images if available, otherwise fall back to category image
    const images = category.productImages.length > 0
        ? category.productImages
        : category.image
            ? [category.image]
            : [];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <Link
            href={`/urunler?categoryId=${category.id}`}
            className="group block relative h-full rounded-2xl overflow-hidden"
        >
            {/* Background images with crossfade */}
            {images.length > 0 ? (
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[currentIndex]}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                        />
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-primary/10" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500 z-[1]" />

            {/* Content */}
            <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end z-[2]">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className={`text-white font-bold mb-1 ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>
                        {category.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span>Ürünleri İncele</span>
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Image indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-2 right-3 flex gap-1 z-[3]">
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                i === currentIndex ? "w-4 bg-white/80" : "w-1.5 bg-white/30"
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Glassmorphism badge on hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[2]">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
            </div>
        </Link>
    );
}
