"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Mountain, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeroBanners } from "@/hooks";

const MountainScene = dynamic(
  () => import("@/components/3d/mountain-scene").then((mod) => mod.MountainScene),
  { ssr: false },
);

// ─── Default "Zirveye Pedalla" Slide ──────────────────────────────────────────

function DefaultSlide({ isActive }: { isActive: boolean }) {
  const words = "Zirveye Pedalla".split(" ");

  return (
    <div className="relative flex items-center justify-center min-h-[60vh] md:min-h-[70vh] overflow-hidden">
      {/* 3D Mountain Background */}
      <MountainScene className="opacity-60" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background/30 via-transparent to-background" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

      {/* Mountain silhouette SVG */}
      <div className="absolute bottom-0 left-0 right-0 z-[2]">
        <svg viewBox="0 0 1440 320" className="fill-current w-full text-background">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,170.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
              animate={isActive ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: -40 }}
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
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mb-6 max-w-2xl text-muted-foreground text-base md:text-lg leading-relaxed"
        >
          Profesyonel dağ bisikletlerinden şehir bisikletlerine, outdoor ekipmanlardan aksesuarlara
          — macera burada başlıyor.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
      </div>
    </div>
  );
}

// ─── Banner Slide (DB) ─────────────────────────────────────────────────────────

function BannerSlide({ banner, isActive }: { banner: any; isActive: boolean }) {
  return (
    <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <div className="max-w-xl">
          {/* Subtitle badge */}
          {banner.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/80 backdrop-blur-sm mb-5 px-5 py-2 rounded-full"
            >
              <span className="font-medium text-white text-sm">{banner.subtitle}</span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5 font-black text-4xl md:text-6xl lg:text-7xl text-white leading-[0.9] tracking-tight drop-shadow-lg"
          >
            {banner.title}
          </motion.h1>

          {/* CTA */}
          {banner.link && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-7 rounded-full h-12 text-sm shadow-xl"
                asChild
              >
                <Link href={banner.link}>
                  {banner.buttonText || "İncele"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ active, paused, duration = 5000 }: { active: boolean; paused: boolean; duration?: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-30">
      {active && (
        <motion.div
          key={`${active}-${paused}`}
          className="h-full bg-white/60"
          initial={{ width: "0%" }}
          animate={paused ? {} : { width: "100%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
}

// ─── Main HeroCarousel ─────────────────────────────────────────────────────────

export function HeroCarousel() {
  const { data: banners = [] } = useHeroBanners();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Total slides: default slide + DB banners
  const total = 1 + banners.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
      setProgressKey((k) => k + 1);
    },
    [total],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, total]);

  const showControls = total > 1;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ─── Slides ────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {current === 0 ? (
            <DefaultSlide isActive />
          ) : (
            <BannerSlide banner={banners[current - 1]} isActive />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Progress bar ──────────────────────────────────────────────────── */}
      {showControls && (
        <ProgressBar key={`pb-${progressKey}-${current}`} active paused={paused} />
      )}

      {/* ─── Prev / Next buttons ───────────────────────────────────────────── */}
      {showControls && (
        <>
          <button
            type="button"
            onClick={prev}
            className="group absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white transition-all opacity-70 hover:opacity-100 hover:scale-105"
            aria-label="Önceki slayt"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="group absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/25 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white transition-all opacity-70 hover:opacity-100 hover:scale-105"
            aria-label="Sonraki slayt"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* ─── Bottom controls: dots + pause ────────────────────────────────── */}
      {showControls && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-3">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Slayt ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 h-2 bg-white shadow-sm"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Pause/Play toggle */}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Otomatik oynat" : "Duraklat"}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-all ml-1"
          >
            {paused ? (
              <Play className="h-3 w-3 fill-white" />
            ) : (
              <Pause className="h-3 w-3 fill-white" />
            )}
          </button>
        </div>
      )}

      {/* ─── Slide counter (top right) ─────────────────────────────────────── */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 text-xs text-white/60 font-medium tabular-nums">
          {current + 1} / {total}
        </div>
      )}
    </div>
  );
}
