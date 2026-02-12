import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/brands/brand-form";
import prisma from "@/lib/prisma";

interface EditBrandPageProps {
    params: {
        id: string;
    };
}

async function getBrand(id: string) {
    const brand = await prisma.brand.findUnique({
        where: { id: parseInt(id) },
    });
    return brand;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    const brand = await getBrand(id);

    if (!brand) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Markayı Düzenle</h1>
                <p className="text-muted-foreground">{brand.name} markasını düzenleyin</p>
            </div>
            <BrandForm initialData={brand} />
        </div>
    );
}
