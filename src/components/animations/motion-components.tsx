"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface ParallaxCardProps {
	children: ReactNode;
	className?: string;
}

export function ParallaxCard({ children, className = "" }: ParallaxCardProps) {
	return (
		<motion.div
			className={className}
			whileHover={{
				scale: 1.02,
				rotateX: 2,
				rotateY: 2,
				transition: { duration: 0.2 },
			}}
			style={{
				transformStyle: "preserve-3d",
				perspective: 1000,
			}}
		>
			{children}
		</motion.div>
	);
}

interface FloatingElementProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
}

export function FloatingElement({
	children,
	delay = 0,
	duration = 3,
}: FloatingElementProps) {
	return (
		<motion.div
			animate={{
				y: [0, -20, 0],
				rotate: [0, 5, 0, -5, 0],
			}}
			transition={{
				duration,
				delay,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
		>
			{children}
		</motion.div>
	);
}

interface TiltCardProps {
	children: ReactNode;
	className?: string;
}

export function TiltCard({ children, className = "" }: TiltCardProps) {
	return (
		<motion.div
			className={className}
			whileHover={{
				rotateX: 10,
				rotateY: 10,
				scale: 1.05,
			}}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			style={{
				transformStyle: "preserve-3d",
				perspective: 1000,
			}}
		>
			{children}
		</motion.div>
	);
}

interface StaggerContainerProps {
	children: ReactNode;
	className?: string;
}

export function StaggerContainer({
	children,
	className = "",
}: StaggerContainerProps) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-100px" }}
			variants={{
				visible: {
					transition: {
						staggerChildren: 0.1,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

interface StaggerItemProps {
	children: ReactNode;
	className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 30 },
				visible: { opacity: 1, y: 0 },
			}}
		>
			{children}
		</motion.div>
	);
}

interface ScaleOnHoverProps {
	children: ReactNode;
	scale?: number;
	className?: string;
}

export function ScaleOnHover({
	children,
	scale = 1.05,
	className = "",
}: ScaleOnHoverProps) {
	return (
		<motion.div
			className={className}
			whileHover={{ scale }}
			whileTap={{ scale: scale * 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
		>
			{children}
		</motion.div>
	);
}

interface SlideInProps {
	children: ReactNode;
	direction?: "left" | "right" | "up" | "down";
	delay?: number;
	className?: string;
}

export function SlideIn({
	children,
	direction = "up",
	delay = 0,
	className = "",
}: SlideInProps) {
	const directions = {
		up: { y: 50 },
		down: { y: -50 },
		left: { x: 50 },
		right: { x: -50 },
	};

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, ...directions[direction] }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay }}
		>
			{children}
		</motion.div>
	);
}
