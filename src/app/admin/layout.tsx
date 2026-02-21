import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { CommandPalette } from "@/components/admin/command-palette";
import { auth } from "@/lib/auth";
import "./admin.css";

// Auth check yapılmayan sayfalar
const publicPages = ["/admin/giris", "/admin/iki-adim-dogrulama"];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? "";

	// Public sayfalar: sadece children render et
	if (publicPages.some((p) => pathname.startsWith(p))) {
		return <>{children}</>;
	}

	// Auth + role kontrolü
	const session = await auth.api.getSession({ headers: headersList });

	if (!session || session.user?.role !== "ADMIN") {
		redirect("/admin/giris");
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
