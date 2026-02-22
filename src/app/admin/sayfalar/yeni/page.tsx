import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/sayfalar/page-form";

export default function NewPagePage() {
    return (
        <div className="space-y-6">
            <PageHeader title="Yeni Sayfa" description="Yeni bir CMS sayfası oluşturun" />
            <PageForm />
        </div>
    );
}
