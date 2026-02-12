"use client";

import { motion } from "motion/react";

const brands = [
    "Trek", "Specialized", "Giant", "Cannondale", "Scott",
    "Bianchi", "Merida", "Cube", "GT", "Kona",
    "Santa Cruz", "Orbea", "BMC", "Pinarello", "Cervélo",
    "Focus", "Felt", "Wilier", "Lapierre", "Marin",
];

export function BrandMarquee() {
    // Duplicate brands for infinite scroll
    const allBrands = [...brands, ...brands];

    return (
        <section className="py-12 overflow-hidden bg-muted/30 border-y">
            <div className="container mx-auto px-4 mb-6">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Dünya'nın En İyi Markalarını Sunuyoruz
                </p>
            </div>
            <div className="relative">
                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

                <motion.div
                    className="flex gap-12 items-center whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                >
                    {allBrands.map((brand, i) => (
                        <div
                            key={`${brand}-${i}`}
                            className="flex-shrink-0 px-6 py-3 rounded-lg border bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-default group"
                        >
                            <span className="text-lg font-bold text-muted-foreground/60 group-hover:text-primary transition-colors tracking-wide">
                                {brand}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
