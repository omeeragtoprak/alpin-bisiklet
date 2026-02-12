"use client";

import { ProductForm } from "@/components/admin/products/product-form";

export default function NewProductPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Yeni Ürün</h1>
				<p className="text-muted-foreground">Yeni bir ürün oluşturun</p>
			</div>
			<ProductForm />
		</div>
	);
}
