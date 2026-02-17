"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import { ProductListItem } from "@/types";
import { ProductCard } from "@/components/store/product-card";

export function PopularProductsSection() {
	const [products, setProducts] = useState<ProductListItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await productService.getAll({ isFeatured: true, limit: 4 });
				setProducts(response.data);
			} catch (error) {
				console.error("Failed to fetch popular products:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchProducts();
	}, []);

	if (loading) {
		return (
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (products.length === 0) return null;

	return (
		<section className="py-20">
			<div className="container mx-auto px-4">
				{/* Section header */}
				<div className="flex items-end justify-between mb-10">
					<div>
						<motion.span
							initial={{ opacity: 0, x: -20 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block"
						>
							Popüler
						</motion.span>
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="text-3xl md:text-4xl font-black tracking-tight"
						>
							Çok Tercih Edilenler
						</motion.h2>
					</div>
					<Button variant="ghost" asChild className="hidden md:flex">
						<Link href="/urunler?isFeatured=true">
							Tümünü Gör →
						</Link>
					</Button>
				</div>

				{/* 2x2 Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					{products.map((product, index) => (
						<motion.div
							key={product.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
						>
							<ProductCard product={product} />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
