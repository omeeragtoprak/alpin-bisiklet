import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/sayfalar/page-form";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: Props) {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) notFound();

    const page = await prisma.page.findUnique({ where: { id: numId } });
    if (!page) notFound();

    return (
        <div className="space-y-6">
            <PageHeader title="Sayfayı Düzenle" description={page.title} />
            <PageForm
                initialData={{
                    id: page.id,
                    title: page.title,
                    slug: page.slug,
                    content: page.content,
                    metaTitle: page.metaTitle,
                    metaDescription: page.metaDescription,
                    isPublished: page.isPublished,
                }}
            />
        </div>
    );
}
