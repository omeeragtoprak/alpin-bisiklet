"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRelatedProducts } from "@/hooks";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";

interface SimilarProductsProps {
	productId: number;
	categoryName?: string;
}

export function SimilarProducts({
	productId,
	categoryName,
}: SimilarProductsProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data, isLoading: loading } = useRelatedProducts(productId);
	const products = data?.similar ?? [];

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) return;
		const amount = direction === "left" ? -400 : 400;
		scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
	};

	if (loading) {
		return (
			<section className="py-12">
				<div className="flex gap-6 overflow-hidden">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0 aspect-[3/4] bg-muted animate-pulse rounded-2xl"
						/>
					))}
				</div>
			</section>
		);
	}

	if (products.length === 0) return null;

	return (
		<section className="py-12">
			{/* Header */}
			<div className="flex items-end justify-between mb-8">
				<div>
					<motion.span
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block"
					>
						{categoryName ?? "Aynı Kategori"}
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-2xl md:text-3xl font-black tracking-tight"
					>
						Benzer Ürünler
					</motion.h2>
					<p className="text-sm text-muted-foreground mt-1">
						Aynı kategorideki diğer modeller
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="rounded-full"
						onClick={() => scroll("left")}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="rounded-full"
						onClick={() => scroll("right")}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Carousel */}
			<div
				ref={scrollRef}
				className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{products.map((product, index) => (
					<motion.div
						key={product.id}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4, delay: index * 0.05 }}
						className="w-[200px] sm:w-[240px] md:w-[280px] flex-shrink-0 snap-start"
					>
						<ProductCard product={product} />
					</motion.div>
				))}
			</div>
		</section>
	);
}
