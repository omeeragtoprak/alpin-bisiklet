import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/json-ld";
import { ProductDetailClient } from "@/components/store/product/product-detail-client";

interface Props {
	params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
	const { slug } = await params;

	const product = await prisma.product.findFirst({
		where: { slug, isActive: true },
		select: {
			id: true,
			slug: true,
			name: true,
			description: true,
			price: true,
			comparePrice: true,
			stock: true,
			sku: true,
			barcode: true,
			weight: true,
			brand: { select: { name: true } },
			category: { select: { id: true, name: true, slug: true } },
			images: {
				orderBy: { order: "asc" },
				select: { id: true, url: true, alt: true },
			},
			variants: {
				select: { id: true, name: true, sizeLabel: true },
			},
			attributes: {
				select: { id: true, key: true, value: true },
				orderBy: { order: "asc" },
			},
			reviews: {
				where: { isApproved: true },
				select: {
					id: true,
					rating: true,
					comment: true,
					user: { select: { name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: 20,
			},
			_count: { select: { reviews: true } },
		},
	});

	if (!product) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-20">
					<p className="text-xl font-semibold">Ürün bulunamadı</p>
					<Button asChild className="mt-4">
						<Link href="/urunler">Ürünlere Dön</Link>
					</Button>
				</div>
			</div>
		);
	}

	const breadcrumbItems = [
		{ name: "Ana Sayfa", url: "/" },
		{ name: "Ürünler", url: "/urunler" },
		...(product.category
			? [
					{
						name: product.category.name,
						url: `/urunler?kategori=${product.category.slug}`,
					},
				]
			: []),
		{ name: product.name, url: `/urunler/${slug}` },
	];

	return (
		<div className="container mx-auto px-4 py-8">
			{/* JSON-LD Schemas */}
			<ProductSchema
				product={{
					name: product.name,
					description: product.description,
					price: Number(product.price),
					comparePrice: product.comparePrice
						? Number(product.comparePrice)
						: null,
					stock: product.stock,
					brand: product.brand,
					images: product.images,
					sku: product.sku,
				}}
				slug={slug}
			/>
			<BreadcrumbSchema items={breadcrumbItems} />

			{/* Breadcrumb */}
			<nav
				className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
				aria-label="Breadcrumb"
			>
				<Link href="/" className="hover:text-primary transition-colors">
					Ana Sayfa
				</Link>
				<ChevronRight className="h-3 w-3" aria-hidden="true" />
				<Link
					href="/urunler"
					className="hover:text-primary transition-colors"
				>
					Ürünler
				</Link>
				{product.category && (
					<>
						<ChevronRight className="h-3 w-3" aria-hidden="true" />
						<Link
							href={`/urunler?kategori=${product.category.slug}`}
							className="hover:text-primary transition-colors"
						>
							{product.category.name}
						</Link>
					</>
				)}
				<ChevronRight className="h-3 w-3" aria-hidden="true" />
				<span className="text-foreground font-medium truncate max-w-[200px]">
					{product.name}
				</span>
			</nav>

			{/* Interactive product detail (gallery, cart, etc.) */}
			<ProductDetailClient
				product={{
					...product,
					price: Number(product.price),
					comparePrice: product.comparePrice
						? Number(product.comparePrice)
						: null,
					weight: product.weight ? Number(product.weight) : null,
				}}
			/>
		</div>
	);
}
