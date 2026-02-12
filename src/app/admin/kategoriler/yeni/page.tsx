"use client";

import { CategoryForm } from "@/components/admin/categories/category-form";

export default function NewCategoryPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Yeni Kategori</h1>
				<p className="text-muted-foreground">Yeni bir ürün kategorisi oluşturun</p>
			</div>
			<CategoryForm />
		</div>
	);
}
