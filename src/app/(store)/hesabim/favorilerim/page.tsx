"use client";

import { motion } from "motion/react";
import { Heart, Trash2, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useFavorites, useToggleFavorite } from "@/hooks";

export default function FavoritesPage() {
    const { data, isLoading } = useFavorites();
    const toggleFavorite = useToggleFavorite();

    const favorites = data?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Favorilerim</h1>
                <p className="text-muted-foreground">
                    {favorites.length > 0
                        ? `${favorites.length} ürün favorilerinizde`
                        : "Favori ürünleriniz"}
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4">
                                <div className="aspect-square bg-muted rounded-lg mb-3" />
                                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : favorites.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Heart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                        <h2 className="text-lg font-medium mb-2">Favori listeniz boş</h2>
                        <p className="text-sm mb-4">
                            Beğendiğiniz ürünleri favorilere ekleyerek kolayca takip edin
                        </p>
                        <Button asChild>
                            <Link href="/urunler">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Ürünlere Göz At
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((fav, i) => (
                        <motion.div
                            key={fav.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                                <CardContent className="p-0">
                                    <div className="relative aspect-square bg-muted">
                                        {fav.product.images[0]?.url ? (
                                            <Image
                                                src={fav.product.images[0].url}
                                                alt={fav.product.images[0].alt || fav.product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <ShoppingCart className="h-12 w-12 opacity-30" />
                                            </div>
                                        )}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/90 text-white hover:bg-destructive"
                                            onClick={() => toggleFavorite.mutate(fav.productId)}
                                            disabled={toggleFavorite.isPending}
                                            aria-label={`${fav.product.name} favorilerden çıkar`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        {fav.product.category && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {fav.product.category.name}
                                            </p>
                                        )}
                                        <h3 className="font-medium text-sm line-clamp-2 mb-2">
                                            {fav.product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-lg font-bold">
                                                    {fav.product.price.toLocaleString("tr-TR")} ₺
                                                </span>
                                                {fav.product.comparePrice && (
                                                    <span className="text-sm text-muted-foreground line-through ml-2">
                                                        {fav.product.comparePrice.toLocaleString("tr-TR")} ₺
                                                    </span>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link
                                                    href={`/urunler/${fav.product.slug}`}
                                                    aria-label={`${fav.product.name} ürün detayına git`}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
