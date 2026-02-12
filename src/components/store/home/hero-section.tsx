"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Autoplay from "embla-carousel-autoplay";

import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Banner } from "@/types";
import { useEffect, useState } from "react";
import { bannerService } from "@/services/banner.service";

export function HeroSection() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getActive();
                // Filter for HERO position
                const heroBanners = data.filter(b => b.position === "HERO").sort((a, b) => a.order - b.order);
                setBanners(heroBanners);
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[60vh] min-h-[500px] bg-muted animate-pulse" />
        );
    }

    if (banners.length === 0) {
        // Fallback if no banners
        return (
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden min-h-[60vh] flex items-center">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                                Yeni Sezon 2024
                            </span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                                Özgürlüğün
                                <span className="text-primary block">Pedalını Çevir</span>
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                                Profesyonel bisikletlerden aksesuarlara, ihtiyacınız olan her
                                şey burada. Kaliteli ürünler, uygun fiyatlar.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" asChild>
                                    <Link href="/urunler">
                                        Ürünleri Keşfet
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/kategoriler">Kategoriler</Link>
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative aspect-square max-w-lg mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                                <span className="text-muted-foreground">Görsel Yok</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative w-full overflow-hidden">
            <Carousel
                plugins={[
                    Autoplay({
                        delay: 5000,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {banners.map((banner) => (
                        <CarouselItem key={banner.id} className="relative w-full h-[60vh] min-h-[500px]">
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={banner.image}
                                    alt={banner.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>

                            <div className="relative z-10 h-full container mx-auto px-4 flex flex-col justify-center text-white">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="max-w-2xl"
                                >
                                    {banner.subtitle && (
                                        <span className="inline-block bg-primary/80 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
                                            {banner.subtitle}
                                        </span>
                                    )}
                                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
                                        {banner.title}
                                    </h1>
                                    {banner.link && (
                                        <Button
                                            size="lg"
                                            className="bg-white text-black hover:bg-white/90 border-0 text-base px-8 h-12"
                                            asChild
                                        >
                                            <Link href={banner.link}>
                                                {banner.buttonText || "İncele"}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    )}
                                </motion.div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {banners.length > 1 && (
                    <>
                        <CarouselPrevious className="left-4 bg-background/20 hover:bg-background/40 border-0 text-white" />
                        <CarouselNext className="right-4 bg-background/20 hover:bg-background/40 border-0 text-white" />
                    </>
                )}
            </Carousel>
        </section>
    );
}
