"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Package, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	CONFIRMED: "bg-blue-100 text-blue-800",
	PROCESSING: "bg-purple-100 text-purple-800",
	SHIPPED: "bg-indigo-100 text-indigo-800",
	DELIVERED: "bg-green-100 text-green-800",
	CANCELLED: "bg-red-100 text-red-800",
	REFUNDED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
	PENDING: "Beklemede",
	CONFIRMED: "Onaylandı",
	PROCESSING: "Hazırlanıyor",
	SHIPPED: "Kargoda",
	DELIVERED: "Teslim Edildi",
	CANCELLED: "İptal Edildi",
	REFUNDED: "İade Edildi",
};

export default function OrdersPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["my-orders"],
		queryFn: async () => {
			const res = await fetch("/api/orders");
			return res.json();
		},
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold mb-2">Siparişlerim</h1>
				<p className="text-muted-foreground">
					Tüm siparişlerinizi buradan görüntüleyebilirsiniz
				</p>
			</div>

			{isLoading ? (
				<div className="text-center py-12">Yükleniyor...</div>
			) : data?.data?.length > 0 ? (
				<div className="space-y-4">
					{data.data.map((order: any, index: number) => (
						<motion.div
							key={order.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
						>
							<Card>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">
												{order.orderNumber}
											</CardTitle>
											<p className="text-sm text-muted-foreground mt-1">
												{new Date(order.createdAt).toLocaleDateString("tr-TR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${
												statusColors[order.status] || statusColors.PENDING
											}`}
										>
											{statusLabels[order.status] || "Beklemede"}
										</span>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{/* Order Items */}
										<div className="space-y-2">
											{order.items.map((item: any) => (
												<div
													key={item.id}
													className="flex items-center gap-4 p-2 rounded-lg bg-muted/30"
												>
													<div className="w-16 h-16 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
														{item.product?.images?.[0]?.url ? (
															<Image
																src={item.product.images[0].url}
																alt={item.productName}
																fill
																className="object-cover"
																sizes="64px"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
																-
															</div>
														)}
													</div>
													<div className="flex-1 min-w-0">
														<p className="font-medium truncate">
															{item.productName}
														</p>
														<p className="text-sm text-muted-foreground">
															{item.quantity} adet x{" "}
															{Number(item.price).toLocaleString("tr-TR")} TL
														</p>
													</div>
													<div className="text-right font-semibold">
														{Number(item.total).toLocaleString("tr-TR")} TL
													</div>
												</div>
											))}
										</div>

										{/* Totals */}
										<div className="border-t pt-4 space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Ara Toplam:</span>
												<span>
													{Number(order.subtotal).toLocaleString("tr-TR")} TL
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Kargo:</span>
												<span>
													{Number(order.shippingCost).toLocaleString("tr-TR")} TL
												</span>
											</div>
											{order.discount > 0 && (
												<div className="flex justify-between text-sm text-green-600">
													<span>İndirim:</span>
													<span>
														-{Number(order.discount).toLocaleString("tr-TR")} TL
													</span>
												</div>
											)}
											<div className="flex justify-between font-bold text-lg pt-2 border-t">
												<span>Toplam:</span>
												<span className="text-primary">
													{Number(order.total).toLocaleString("tr-TR")} TL
												</span>
											</div>
										</div>

										{/* Actions */}
										<div className="flex gap-2">
											<Button variant="outline" size="sm" asChild>
												<Link href={`/hesabim/siparislerim/${order.id}`}>
													<Eye className="mr-2 h-4 w-4" />
													Detayları Gör
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="text-center py-12">
						<Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
						<p className="text-muted-foreground mb-4">
							Henüz siparişiniz bulunmuyor
						</p>
						<Button asChild>
							<Link href="/urunler">Alışverişe Başla</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
