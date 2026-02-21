import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
    const { id } = await params;
    const numId = Number(id);
    if (Number.isNaN(numId)) notFound();

    const blog = await prisma.blog.findUnique({ where: { id: numId } });
    if (!blog) notFound();

    return (
        <div className="space-y-6">
            <PageHeader title="Blog Yazısını Düzenle" description={blog.title} />
            <BlogForm
                initialData={{
                    id: blog.id,
                    title: blog.title,
                    slug: blog.slug,
                    content: blog.content,
                    excerpt: blog.excerpt,
                    coverImage: blog.coverImage,
                    metaTitle: blog.metaTitle,
                    metaDescription: blog.metaDescription,
                    isPublished: blog.isPublished,
                }}
            />
        </div>
    );
}
