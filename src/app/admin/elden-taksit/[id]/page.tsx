import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EldenTaksitPlanDetail } from "@/components/admin/elden-taksit/plan-detail";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function EldenTaksitDetailPage({ params }: Props) {
	const { id } = await params;
	const numId = Number(id);

	if (Number.isNaN(numId)) {
		notFound();
	}

	const plan = await prisma.eldenTaksit.findUnique({
		where: { id: numId },
		include: {
			user: { select: { id: true, name: true, email: true } },
			product: { select: { id: true, name: true, slug: true, price: true } },
			installments: { orderBy: { installmentNo: "asc" } },
		},
	});

	if (!plan) {
		notFound();
	}

	// Serialize dates for client component
	const serialized = JSON.parse(JSON.stringify(plan));

	return <EldenTaksitPlanDetail plan={serialized} />;
}
