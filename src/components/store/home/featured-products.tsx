"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import { ProductListItem } from "@/types";
import { useCartStore } from "@/store/use-cart-store";
import { useToast } from "@/hooks/use-toast";

export function FeaturedProducts() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartStore();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.getAll({ isFeatured: true, take: 8 });
                // The service returns PaginatedResponse, so we need .data.
                // Wait, productService.getAll returns apiClient.get<PaginatedResponse<ProductListItem>>
                // api/products returns { data: ..., meta: ... } which matches PaginatedResponse
                // So response.data is the array.
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
            category: product.category?.name || "Genel"
        });

        toast({
            title: "Sepete Eklendi",
            description: `${product.name} sepetinize eklendi.`,
        });
    };

    if (loading) {
        return (
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[3/4] bg-background animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Öne Çıkan Ürünler</h2>
                        <p className="text-muted-foreground">
                            En popüler ve çok satan ürünlerimiz
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/urunler?featured=true">
                            Tümünü Gör
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="bg-background rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                <div className="relative aspect-square bg-white p-4">
                                    {product.images?.[0] ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={product.images[0].url}
                                                alt={product.images[0].alt || product.name}
                                                fill
                                                className="object-contain p-2"
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                            />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center text-muted-foreground">
                                            Görsel Yok
                                        </div>
                                    )}

                                    {/* Badges */}
                                    {product.stock <= 0 && (
                                        <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] uppercase font-bold px-2 py-1 rounded z-10">
                                            Tükendi
                                        </span>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-10">
                                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm" asChild>
                                            <Link href={`/urunler/${product.slug}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
                                        <Link href={`/urunler/${product.slug}`}>
                                            {product.name}
                                        </Link>
                                    </h3>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg text-primary">
                                                {product.price.toLocaleString("tr-TR")} TL
                                            </span>
                                        </div>
                                        <Button
                                            className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                                            size="sm"
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
