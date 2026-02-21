"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import { ProductListItem } from "@/types";
import { ProductCard } from "@/components/store/product-card";

export function ProductShowcase() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll({ isFeatured: true, isActive: true, limit: 12 });
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = direction === "left" ? -400 : 400;
        scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    };

    if (loading) {
        return (
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-[300px] flex-shrink-0 aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-20 relative">
            <div className="container mx-auto px-4">
                {/* Section header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block"
                        >
                            Öne Çıkanlar
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-black tracking-tight"
                        >
                            En Çok Tercih Edilenler
                        </motion.h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("left")}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll("right")}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" asChild className="ml-2 hidden md:flex">
                            <Link href="/urunler">
                                Tümünü Gör →
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Horizontal scroll */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            className="w-[280px] md:w-[300px] flex-shrink-0 snap-start"
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
