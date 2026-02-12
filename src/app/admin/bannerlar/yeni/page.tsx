"use client";

import { BannerForm } from "@/components/admin/banners/banner-form";

export default function NewBannerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Yeni Banner</h1>
                <p className="text-muted-foreground">Yeni bir banner oluşturun</p>
            </div>
            <BannerForm />
        </div>
    );
}
