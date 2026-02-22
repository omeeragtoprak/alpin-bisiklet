"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Package, MapPin, Heart, CreditCard } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks";

export default function AccountPage() {
	const { data: orders } = useQuery({
		queryKey: ["my-orders"],
		queryFn: async () => {
			const res = await fetch("/api/orders");
			return res.json();
		},
	});

	const { data: favoritesData } = useFavorites();
	const favoritesCount = favoritesData?.data?.length ?? 0;

	const stats = [
		{
			icon: Package,
			label: "Toplam Sipariş",
			value: orders?.data?.length || 0,
			color: "text-blue-600 bg-blue-100",
		},
		{
			icon: CreditCard,
			label: "Bekleyen Ödeme",
			value: 0,
			color: "text-orange-600 bg-orange-100",
		},
		{
			icon: Heart,
			label: "Favoriler",
			value: favoritesCount,
			color: "text-red-600 bg-red-100",
		},
		{
			icon: MapPin,
			label: "Kayıtlı Adres",
			value: 0,
			color: "text-green-600 bg-green-100",
		},
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold mb-2">Hesabım</h1>
				<p className="text-muted-foreground">
					Hoş geldiniz! Hesap bilgilerinizi buradan yönetebilirsiniz.
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center gap-4">
									<div className={`p-3 rounded-lg ${stat.color}`}>
										<stat.icon className="h-6 w-6" />
									</div>
									<div>
										<p className="text-2xl font-bold">{stat.value}</p>
										<p className="text-sm text-muted-foreground">{stat.label}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Recent Orders */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Son Siparişler</CardTitle>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/hesabim/siparislerim">Tümünü Gör</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{orders?.data?.length > 0 ? (
						<div className="space-y-4">
							{orders.data.slice(0, 3).map((order: any) => (
								<div
									key={order.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div>
										<p className="font-medium">{order.orderNumber}</p>
										<p className="text-sm text-muted-foreground">
											{new Date(order.createdAt).toLocaleDateString("tr-TR")}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold">
											{Number(order.total).toLocaleString("tr-TR")} TL
										</p>
										<p className="text-sm text-muted-foreground">
											{order.items.length} ürün
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 text-muted-foreground">
							<Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>Henüz siparişiniz yok</p>
							<Button asChild className="mt-4">
								<Link href="/urunler">Alışverişe Başla</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid md:grid-cols-2 gap-4">
				<Card className="hover:shadow-md transition-shadow cursor-pointer">
					<CardContent className="p-6">
						<Link href="/hesabim/adreslerim" className="flex items-start gap-4">
							<div className="p-3 bg-primary/10 text-primary rounded-lg">
								<MapPin className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">Adreslerim</h3>
								<p className="text-sm text-muted-foreground">
									Teslimat adreslerinizi yönetin
								</p>
							</div>
						</Link>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow cursor-pointer">
					<CardContent className="p-6">
						<Link href="/hesabim/favorilerim" className="flex items-start gap-4">
							<div className="p-3 bg-red-100 text-red-600 rounded-lg">
								<Heart className="h-6 w-6" />
							</div>
							<div>
								<h3 className="font-semibold mb-1">Favorilerim</h3>
								<p className="text-sm text-muted-foreground">
									Beğendiğiniz ürünlere hızlı erişin
								</p>
							</div>
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
