"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";

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
      className="relative flex justify-center items-center min-h-[60vh] md:min-h-[70vh] overflow-hidden"
    >
      {/* 3D Mountain Background */}
      <MountainScene className="opacity-60" />

      {/* Gradient overlays */}
      <div className="z-[1] absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      <div className="z-[1] absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

      {/* Mountain silhouette SVG */}
      <motion.div className="right-0 bottom-0 left-0 z-[2] absolute" style={{ y }}>
        <svg viewBox="0 0 1440 320" className="fill-current w-full text-background">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </motion.div>

      {/* Content */}
      <motion.div
        className="z-10 relative mx-auto px-4 text-center container"
        style={{ opacity, scale }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-md mb-5 px-5 py-2 border border-primary/20 rounded-full"
        >
          <Mountain className="w-4 h-4 text-primary" />
          <span className="font-medium text-primary text-sm">2024 Yeni Sezon Koleksiyonu</span>
        </motion.div>

        {/* Animated title */}
        <h1 className="mb-4 font-black text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
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
                <span className="bg-clip-text bg-gradient-to-r from-primary via-alpine-meadow to-accent text-transparent">
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
          className="mx-auto mb-6 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed"
        >
          Profesyonel dağ bisikletlerinden şehir bisikletlerine, outdoor ekipmanlardan aksesuarlara
          — macera burada başlıyor.
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
            className="shadow-lg shadow-primary/25 hover:shadow-primary/30 hover:shadow-xl px-7 rounded-full h-12 text-sm transition-all"
            asChild
          >
            <Link href="/urunler">
              Ürünleri Keşfet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-background/50 backdrop-blur-sm px-7 rounded-full h-12 text-sm"
            asChild
          >
            <Link href="/urunler?kategori=bisikletler">Bisikletler</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
