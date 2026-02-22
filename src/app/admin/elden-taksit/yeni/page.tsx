import { PageHeader } from "@/components/admin/page-header";
import { EldenTaksitPlanForm } from "@/components/admin/elden-taksit/plan-form";

export default function YeniEldenTaksitPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Yeni Taksit Planı"
				description="Müşteri için elden taksit planı oluşturun"
			/>
			<EldenTaksitPlanForm />
		</div>
	);
}
