"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeCTA() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 rounded-3xl overflow-hidden border"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          <div className="relative p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Yeni Üyelere Özel{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                %10 İndirim!
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              Hemen üye olun, ilk siparişinizde %10 indirim kazanın.
              Kampanyalardan ve fırsatlardan ilk siz haberdar olun.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="h-14 px-8 text-base rounded-full shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/kayit">
                  Hemen Üye Ol
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base rounded-full"
                asChild
              >
                <Link href="/urunler">Ürünleri İncele</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
