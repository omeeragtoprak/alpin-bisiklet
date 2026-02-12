import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/category-form";
import prisma from "@/lib/prisma";

interface EditCategoryPageProps {
    params: {
        id: string;
    };
}

// Helper to get category directly from DB since it's a server component
async function getCategory(id: string) {
    const category = await prisma.category.findUnique({
        where: { id: parseInt(id) },
    });
    return category;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Kategoriyi Düzenle</h1>
                <p className="text-muted-foreground">{category.name} kategorisini düzenleyin</p>
            </div>
            <CategoryForm initialData={category} />
        </div>
    );
}
