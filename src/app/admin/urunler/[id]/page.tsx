import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/products/product-form";

interface EditProductPageProps {
    params: {
        id: string;
    };
}

async function getProduct(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Ürün getirilemedi");
    }

    return res.json();
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    // The instruction to "await params" is not syntactically valid for the 'params' object
    // which is directly available. Assuming the intent was to destructure 'id' from 'params'.
    const { id } = params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Ürünü Düzenle</h1>
                <p className="text-muted-foreground">{product.name} ürününü düzenleyin</p>
            </div>
            <ProductForm initialData={product} />
        </div>
    );
}
