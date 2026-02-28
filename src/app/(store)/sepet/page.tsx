"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	// Kupon state'i
	const [couponCode, setCouponCode] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<{
		code: string;
		discount: number;
		message: string;
	} | null>(null);
	const [couponLoading, setCouponLoading] = useState(false);

	const { data: cart, isLoading } = useQuery({
		queryKey: ["cart"],
		queryFn: async () => {
			const res = await fetch("/api/cart");
			return res.json();
		},
	});

	const updateQuantity = useMutation({
		mutationFn: async ({
			itemId,
			quantity,
		}: {
			itemId: number;
			quantity: number;
		}) => {
			const res = await fetch(`/api/cart/${itemId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quantity }),
			});
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	const removeItem = useMutation({
		mutationFn: async (itemId: number) => {
			const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	const validateCoupon = async () => {
		if (!couponCode.trim()) return;
		const items2 = cart?.data?.items || [];
		if (items2.length === 0) return;
		setCouponLoading(true);
		try {
			const cartItems = items2.map((item: any) => ({
				productId: item.productId,
				categoryId: item.product?.categoryId ?? null,
				quantity: item.quantity,
				price: Number(item.variant?.price || item.product?.price || 0),
			}));
			const res = await fetch("/api/coupons/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: couponCode.toUpperCase(), items: cartItems }),
			});
			const data = await res.json();
			if (data.valid) {
				setAppliedCoupon({ code: couponCode.toUpperCase(), discount: data.discount, message: data.message });
				toast({ title: "Kupon uygulandı", description: data.message });
			} else {
				toast({ title: data.message, variant: "destructive" });
			}
		} catch {
			toast({ title: "Kupon doğrulanamadı", variant: "destructive" });
		} finally {
			setCouponLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-20">Yükleniyor...</div>
			</div>
		);
	}

	const items = cart?.data?.items || [];
	const isEmpty = items.length === 0;

	const subtotal = items.reduce((sum: number, item: any) => {
		const price = item.variant?.price || item.product.price;
		return sum + Number(price) * item.quantity;
	}, 0);

	const shipping = subtotal >= 500 ? 0 : 50;
	const couponDiscount = appliedCoupon?.discount || 0;
	const total = subtotal + shipping - couponDiscount;

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Sepetim</h1>

			{isEmpty ? (
				<Card>
					<CardContent className="text-center py-20">
						<ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
						<h2 className="text-2xl font-semibold mb-2">Sepetiniz boş</h2>
						<p className="text-muted-foreground mb-6">
							Alışverişe başlamak için ürünleri keşfedin
						</p>
						<Button size="lg" asChild>
							<Link href="/urunler">
								Ürünleri Keşfet
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4">
						{items.map((item: any, index: number) => {
							const price = item.variant?.price || item.product.price;

							return (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<Card>
										<CardContent className="p-4">
											<div className="flex gap-4">
												<div className="w-24 h-24 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
													{item.product.images?.[0]?.url ? (
														<Image
															src={item.product.images[0].url}
															alt={item.product.name}
															fill
															className="object-cover"
															sizes="96px"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-muted-foreground">
															-
														</div>
													)}
												</div>

												<div className="flex-1 min-w-0">
													<Link
														href={`/urunler/${item.product.slug}`}
														className="font-semibold hover:text-primary transition-colors line-clamp-2"
													>
														{item.product.name}
													</Link>
													{item.product.brand?.name && (
														<p className="text-sm text-muted-foreground mt-1">
															{item.product.brand.name}
														</p>
													)}
													{item.variant && (
														<p className="text-sm text-muted-foreground">
															{item.variant.name}
														</p>
													)}

													<div className="flex items-center gap-4 mt-3">
														<div className="flex items-center border rounded-lg">
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	updateQuantity.mutate({
																		itemId: item.id,
																		quantity: item.quantity - 1,
																	})
																}
																disabled={item.quantity <= 1}
															>
																<Minus className="h-3 w-3" />
															</Button>
															<span className="w-8 text-center text-sm font-medium">
																{item.quantity}
															</span>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
																onClick={() =>
																	updateQuantity.mutate({
																		itemId: item.id,
																		quantity: item.quantity + 1,
																	})
																}
																disabled={item.quantity >= item.product.stock}
															>
																<Plus className="h-3 w-3" />
															</Button>
														</div>

														<Button
															variant="ghost"
															size="sm"
															onClick={() => removeItem.mutate(item.id)}
															className="text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4 mr-1" />
															Sil
														</Button>
													</div>
												</div>

												<div className="text-right">
													<p className="font-bold text-lg">
														{(Number(price) * item.quantity).toLocaleString(
															"tr-TR",
														)}{" "}
														TL
													</p>
													<p className="text-sm text-muted-foreground">
														{Number(price).toLocaleString("tr-TR")} TL / adet
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>

					{/* Summary */}
					<div className="lg:col-span-1">
						<Card className="sticky top-24">
							<CardContent className="p-6 space-y-4">
								<h2 className="text-xl font-bold">Sipariş Özeti</h2>

								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Ara Toplam ({items.length} ürün):
										</span>
										<span>{subtotal.toLocaleString("tr-TR")} TL</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Kargo:</span>
										<span>
											{shipping === 0 ? (
												<span className="text-green-600 font-medium">
													Ücretsiz
												</span>
											) : (
												`${shipping.toLocaleString("tr-TR")} TL`
											)}
										</span>
									</div>
									{subtotal < 500 && (
										<p className="text-xs text-muted-foreground">
											500 TL ve üzeri alışverişlerde kargo ücretsiz
										</p>
									)}
								</div>

								<Separator />

								{/* Kupon Kodu */}
								<div className="space-y-2">
									<p className="text-sm font-medium flex items-center gap-1.5">
										<Tag className="h-4 w-4" />
										Kupon Kodu
									</p>
									{appliedCoupon ? (
										<div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
											<div>
												<span className="font-mono text-sm font-bold text-green-700">{appliedCoupon.code}</span>
												<p className="text-xs text-green-600">-{appliedCoupon.discount.toLocaleString("tr-TR")} TL indirim</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-green-700 hover:text-destructive"
												onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
											>
												<X className="h-3.5 w-3.5" />
											</Button>
										</div>
									) : (
										<div className="flex gap-2">
											<Input
												value={couponCode}
												onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
												placeholder="KUPON KODU"
												className="font-mono text-sm h-9"
												onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
											/>
											<Button
												size="sm"
												variant="outline"
												onClick={validateCoupon}
												disabled={couponLoading || !couponCode.trim()}
												className="h-9"
											>
												{couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Uygula"}
											</Button>
										</div>
									)}
								</div>

								<Separator />

								<div className="space-y-2">
									{couponDiscount > 0 && (
										<div className="flex justify-between text-sm text-green-600 font-medium">
											<span>Kupon İndirimi:</span>
											<span>-{couponDiscount.toLocaleString("tr-TR")} TL</span>
										</div>
									)}
								</div>

								<div className="flex justify-between text-lg font-bold">
									<span>Toplam:</span>
									<span className="text-primary">
										{total.toLocaleString("tr-TR")} TL
									</span>
								</div>

								<Button size="lg" className="w-full" asChild>
									<Link href="/odeme">
										Ödemeye Geç
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>

								<Button variant="outline" className="w-full" asChild>
									<Link href="/urunler">Alışverişe Devam Et</Link>
								</Button>

								<div className="pt-4 space-y-2 text-xs text-muted-foreground">
									<p className="flex items-center gap-2">
										<span className="h-1 w-1 rounded-full bg-green-600" />
										Güvenli ödeme
									</p>
									<p className="flex items-center gap-2">
										<span className="h-1 w-1 rounded-full bg-green-600" />
										256-bit SSL şifreleme
									</p>
									<p className="flex items-center gap-2">
										<span className="h-1 w-1 rounded-full bg-green-600" />
										14 gün koşulsuz iade
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</div>
	);
}
