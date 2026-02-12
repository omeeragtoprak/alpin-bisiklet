"use client";

import { BrandForm } from "@/components/admin/brands/brand-form";

export default function NewBrandPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Yeni Marka</h1>
                <p className="text-muted-foreground">Yeni bir marka oluşturun</p>
            </div>
            <BrandForm />
        </div>
    );
}
