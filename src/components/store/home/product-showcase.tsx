"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Eye, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import { ProductListItem } from "@/types";
import { useCartStore } from "@/store/use-cart-store";
import { useToast } from "@/hooks/use-toast";

export function ProductShowcase() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartStore();
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll({ isFeatured: true, take: 12 });
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (e: React.MouseEvent, product: ProductListItem) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id.toString(),
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url || "",
            slug: product.slug,
            category: product.category?.name || "Genel",
        });
        toast({
            title: "Sepete Eklendi ✓",
            description: `${product.name} sepetinize eklendi.`,
        });
    };

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
                            <div className="group relative bg-card rounded-2xl overflow-hidden border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 h-full flex flex-col">
                                {/* Image */}
                                <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted p-6">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0].url}
                                            alt={product.images[0].alt || product.name}
                                            fill
                                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                                            sizes="300px"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                                            <Mountain className="h-16 w-16" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                                        {product.isNew && (
                                            <span className="bg-accent text-accent-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                                                Yeni
                                            </span>
                                        )}
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <span className="bg-destructive text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                                                %{Math.round((1 - product.price / product.comparePrice) * 100)} İndirim
                                            </span>
                                        )}
                                        {product.stock <= 0 && (
                                            <span className="bg-foreground/80 text-background text-[10px] font-bold px-2.5 py-1 rounded-md">
                                                Tükendi
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick actions */}
                                    <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-10">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-9 w-9 rounded-full shadow-lg backdrop-blur-sm bg-background/80"
                                            asChild
                                        >
                                            <Link href={`/urunler/${product.slug}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5 flex flex-col flex-1">
                                    {product.category?.name && (
                                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                                            {product.category.name}
                                        </span>
                                    )}
                                    <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug">
                                        <Link href={`/urunler/${product.slug}`}>{product.name}</Link>
                                    </h3>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black text-primary">
                                                {product.price.toLocaleString("tr-TR")} ₺
                                            </span>
                                            {product.comparePrice && product.comparePrice > product.price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {product.comparePrice.toLocaleString("tr-TR")} ₺
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full rounded-xl h-11 font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                            disabled={product.stock <= 0}
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Sepete Ekle
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Mountain(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    );
}
