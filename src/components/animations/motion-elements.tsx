"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FloatingElementProps {
    children: ReactNode;
    className?: string;
    amplitude?: number;
    duration?: number;
    delay?: number;
}

/**
 * FloatingElement - Creates a gentle floating animation.
 * Perfect for decorative elements, icons, or featured items.
 */
export function FloatingElement({
    children,
    className = "",
    amplitude = 10,
    duration = 3,
    delay = 0,
}: FloatingElementProps) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [-amplitude, amplitude, -amplitude],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}

interface StaggerContainerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

/**
 * StaggerContainer - Parent container for staggered child animations.
 */
export function StaggerContainer({
    children,
    className = "",
    staggerDelay = 0.1,
}: StaggerContainerProps) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

/**
 * StaggerItem - Child element for StaggerContainer.
 */
export function StaggerItem({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: "easeOut" },
                },
            }}
        >
            {children}
        </motion.div>
    );
}
