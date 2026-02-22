"use client";

import { motion } from "motion/react";
import { useRelatedProducts } from "@/hooks";
import { ProductCard } from "@/components/store/product-card";

interface ComplementaryProductsProps {
	productId: number;
}

export function ComplementaryProducts({
	productId,
}: ComplementaryProductsProps) {
	const { data, isLoading: loading } = useRelatedProducts(productId);
	const products = data?.complementary ?? [];

	if (loading) {
		return (
			<section className="py-12">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="aspect-[3/4] bg-muted animate-pulse rounded-2xl"
						/>
					))}
				</div>
			</section>
		);
	}

	if (products.length === 0) return null;

	// Group products by category for badge coloring
	const categoryColors: Record<string, string> = {};
	const palette = [
		"bg-blue-100 text-blue-700",
		"bg-emerald-100 text-emerald-700",
		"bg-violet-100 text-violet-700",
		"bg-amber-100 text-amber-700",
		"bg-rose-100 text-rose-700",
		"bg-cyan-100 text-cyan-700",
	];
	let colorIndex = 0;
	products.forEach((p) => {
		const key = p.category?.name ?? "";
		if (key && !categoryColors[key]) {
			categoryColors[key] = palette[colorIndex % palette.length];
			colorIndex++;
		}
	});

	return (
		<section className="py-12">
			{/* Header */}
			<div className="mb-8">
				<motion.span
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2 block"
				>
					Tamamlayıcı Ürünler
				</motion.span>
				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-2xl md:text-3xl font-black tracking-tight"
				>
					İlginizi Çekebilir
				</motion.h2>
				<p className="text-sm text-muted-foreground mt-1">
					Bunlar da işinize yarayabilir
				</p>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
				{products.map((product, index) => (
					<motion.div
						key={product.id}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4, delay: index * 0.06 }}
						className="relative"
					>
						{/* Category badge */}
						{product.category?.name && (
							<span
								className={`absolute top-3 right-3 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[product.category.name] ?? "bg-muted text-muted-foreground"}`}
							>
								{product.category.name}
							</span>
						)}
						<ProductCard product={product} />
					</motion.div>
				))}
			</div>
		</section>
	);
}
