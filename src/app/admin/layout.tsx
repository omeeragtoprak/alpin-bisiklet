import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { CommandPalette } from "@/components/admin/command-palette";
import { auth } from "@/lib/auth";
import "./admin.css";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session || session.user?.role !== "ADMIN") {
		redirect("/giris");
	}

	return (
		<div data-admin="" className="flex h-screen overflow-hidden bg-background">
			<AdminSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-6">
					{children}
				</main>
				<CommandPalette />
			</div>
		</div>
	);
}
