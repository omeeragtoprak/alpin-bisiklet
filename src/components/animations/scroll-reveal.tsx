"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

/**
 * ScrollReveal - Animates children when they enter the viewport.
 * Supports directional reveal animations.
 */
export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    duration = 0.5,
    className,
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: "-50px" });

    const directionMap = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    };

    const { x, y } = directionMap[direction];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x, y }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x, y }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
