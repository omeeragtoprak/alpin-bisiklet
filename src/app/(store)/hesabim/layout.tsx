import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { User, Package, MapPin, Heart, Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function AccountLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/giris");
	}

	const menuItems = [
		{ href: "/hesabim", icon: User, label: "Dashboard" },
		{ href: "/hesabim/siparislerim", icon: Package, label: "Siparişlerim" },
		{ href: "/hesabim/adreslerim", icon: MapPin, label: "Adreslerim" },
		{ href: "/hesabim/favorilerim", icon: Heart, label: "Favorilerim" },
		{ href: "/hesabim/ayarlar", icon: Settings, label: "Ayarlar" },
	];

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid lg:grid-cols-4 gap-6">
				{/* Sidebar */}
				<aside className="lg:col-span-1">
					<div className="bg-muted/30 rounded-lg p-6 mb-6">
						<div className="text-center mb-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto mb-3">
								{session.user?.name?.charAt(0).toUpperCase()}
							</div>
							<h3 className="font-semibold">{session.user?.name}</h3>
							<p className="text-sm text-muted-foreground">
								{session.user?.email}
							</p>
						</div>
					</div>

					<nav className="space-y-1">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
							>
								<item.icon className="h-5 w-5" />
								<span>{item.label}</span>
							</Link>
						))}
					</nav>

					<div className="mt-4">
						<SignOutButton />
					</div>
				</aside>

				{/* Main Content */}
				<main className="lg:col-span-3">{children}</main>
			</div>
		</div>
	);
}
