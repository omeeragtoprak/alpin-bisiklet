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

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-full">
				{products.map((product, index) => (
					<motion.div
						key={product.id}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4, delay: index * 0.06 }}
						className="relative"
					>
						<ProductCard product={product} />
					</motion.div>
				))}
			</div>
		</section>
	);
}
