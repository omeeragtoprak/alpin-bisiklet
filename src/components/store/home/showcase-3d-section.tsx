"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BicycleShowcase = dynamic(
  () =>
    import("@/components/3d/bicycle-showcase").then(
      (mod) => mod.BicycleShowcase,
    ),
  { ssr: false },
);

export function HomeShowcase3D() {
  return (
    <section className="py-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-br from-card via-card to-muted/50 rounded-3xl border overflow-hidden">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 lg:p-16">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block"
              >
                3D Deneyim
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-black tracking-tight mb-4"
              >
                Bisikletini{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Keşfet
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground mb-6 max-w-md"
              >
                3D modelimizi sürükleyerek her açıdan inceleyin. Her detayı
                yakından görün, hayalinizdeki bisikleti bulun.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Button size="lg" className="rounded-full" asChild>
                  <Link href="/urunler">
                    Tüm Bisikletler
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <div className="h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing">
              <BicycleShowcase />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
