"use client";

import Link from "next/link";
import { ArrowRight, Mountain } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MountainScene = dynamic(
    () => import("@/components/3d/mountain-scene").then((mod) => mod.MountainScene),
    { ssr: false }
);

export function ParallaxHero() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    const words = "Zirveye Pedalla".split(" ");

    return (
        <section
            ref={ref}
            className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
        >
            {/* 3D Mountain Background */}
            <MountainScene className="opacity-60" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background z-[1]" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 z-[1]" />

            {/* Mountain silhouette SVG */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-[2]"
                style={{ y }}
            >
                <svg viewBox="0 0 1440 320" className="w-full text-background fill-current">
                    <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
                </svg>
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 container mx-auto px-4 text-center"
                style={{ opacity, scale }}
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full px-5 py-2 mb-8"
                >
                    <Mountain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">2024 Yeni Sezon Koleksiyonu</span>
                </motion.div>

                {/* Animated title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-6 tracking-tight">
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 40, rotateX: -40 }}
                            animate={{ opacity: 1, y: 0, rotateX: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: i * 0.15,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="inline-block mr-4"
                        >
                            {i === 1 ? (
                                <span className="bg-gradient-to-r from-primary via-alpine-meadow to-accent bg-clip-text text-transparent">
                                    {word}
                                </span>
                            ) : (
                                word
                            )}
                        </motion.span>
                    ))}
                </h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    Profesyonel dağ bisikletlerinden şehir bisikletlerine, outdoor ekipmanlardan
                    aksesuarlara — macera burada başlıyor.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Button
                        size="lg"
                        className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                        asChild
                    >
                        <Link href="/urunler">
                            Ürünleri Keşfet
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 text-base rounded-full backdrop-blur-sm bg-background/50"
                        asChild
                    >
                        <Link href="/urunler?kategori=bisikletler">Bisikletler</Link>
                    </Button>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-24 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-foreground/20 flex justify-center pt-2">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
