"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * PageTransition - Wraps children with smooth page enter/exit animations.
 * Should be used in layouts to animate page changes.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
