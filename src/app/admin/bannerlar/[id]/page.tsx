import { notFound } from "next/navigation";
import { BannerForm } from "@/components/admin/banners/banner-form";
import prisma from "@/lib/prisma";

interface EditBannerPageProps {
    params: {
        id: string;
    };
}

async function getBanner(id: string) {
    const banner = await prisma.banner.findUnique({
        where: { id: parseInt(id) },
    });
    return banner;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    const banner = await getBanner(id);

    if (!banner) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Bannerı Düzenle</h1>
                <p className="text-muted-foreground">{banner.title} bannerını düzenleyin</p>
            </div>
            <BannerForm initialData={banner} />
        </div>
    );
}
