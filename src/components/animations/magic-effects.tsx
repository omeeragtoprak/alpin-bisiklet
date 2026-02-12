"use client";

import { type ReactNode, type CSSProperties } from "react";
import { motion } from "motion/react";

/**
 * ShimmerButton — A button with an animated shimmer/gradient sweep effect.
 * Magic UI-inspired.
 */
export function ShimmerButton({
    children,
    className = "",
    shimmerColor = "rgba(255,255,255,0.3)",
    shimmerSize = "0.1em",
}: {
    children: ReactNode;
    className?: string;
    shimmerColor?: string;
    shimmerSize?: string;
}) {
    return (
        <button
            className={`relative overflow-hidden rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 ${className}`}
        >
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `linear-gradient(120deg, transparent 25%, ${shimmerColor} 50%, transparent 75%)`,
                    backgroundSize: "200% 100%",
                }}
                animate={{
                    backgroundPosition: ["200% 0", "-200% 0"],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <span className="relative z-10">{children}</span>
        </button>
    );
}

/**
 * GradientText — Animated gradient text effect.
 */
export function GradientText({
    children,
    className = "",
    colors = ["var(--color-primary)", "var(--color-accent)", "var(--color-alpine-meadow)"],
}: {
    children: ReactNode;
    className?: string;
    colors?: string[];
}) {
    const gradientStyle: CSSProperties = {
        backgroundImage: `linear-gradient(135deg, ${colors.join(", ")})`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
    };

    return (
        <motion.span
            className={`inline-block ${className}`}
            style={gradientStyle}
            animate={{
                backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {children}
        </motion.span>
    );
}

/**
 * SpotlightCard — Card that tracks cursor and creates a spotlight effect.
 */
export function SpotlightCard({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`group relative rounded-xl border bg-card overflow-hidden ${className}`}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty("--spotlight-x", `${x}px`);
                e.currentTarget.style.setProperty("--spotlight-y", `${y}px`);
            }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background:
                        "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(var(--color-primary) / 0.08), transparent 40%)",
                }}
            />
            {children}
        </div>
    );
}

/**
 * AnimatedCounter — Counts up from 0 to a target number.
 */
export function AnimatedCounter({
    target,
    duration = 2,
    className = "",
    suffix = "",
}: {
    target: number;
    duration?: number;
    className?: string;
    suffix?: string;
}) {
    return (
        <motion.span
            className={className}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
        >
            <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                {target.toLocaleString("tr-TR")}
                {suffix}
            </motion.span>
        </motion.span>
    );
}
