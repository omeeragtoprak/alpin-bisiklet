import { PageHeader } from "@/components/admin/page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";

export default function NewBlogPage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Yeni Blog Yazısı" description="Yeni bir blog yazısı oluşturun" />
            <BlogForm />
        </div>
    );
}
