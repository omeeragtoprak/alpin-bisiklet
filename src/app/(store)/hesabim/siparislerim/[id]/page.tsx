"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
    ChevronRight,
    Package,
    MapPin,
    CreditCard,
    Clock,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Beklemede", color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED: { label: "Onaylandı", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Hazırlanıyor", color: "bg-indigo-100 text-indigo-700" },
    SHIPPED: { label: "Kargoda", color: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Teslim Edildi", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "İptal Edildi", color: "bg-red-100 text-red-700" },
    REFUNDED: { label: "İade Edildi", color: "bg-gray-100 text-gray-700" },
};

const paymentLabels: Record<string, string> = {
    PENDING: "Bekleniyor",
    PAID: "Ödendi",
    FAILED: "Başarısız",
    REFUNDED: "İade Edildi",
};

export default function OrderDetailPage() {
    const params = useParams();

    const { data: order, isLoading } = useQuery({
        queryKey: ["order", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/orders/${params.id}`);
            if (!res.ok) throw new Error("Sipariş bulunamadı");
            const json = await res.json();
            return json.data;
        },
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-xl font-semibold mb-4">Sipariş bulunamadı</p>
                <Button asChild>
                    <Link href="/hesabim/siparislerim">Siparişlerime Dön</Link>
                </Button>
            </div>
        );
    }

    const statusInfo = statusLabels[order.status] || { label: order.status, color: "bg-muted text-muted-foreground" };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
                <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/hesabim/siparislerim" className="hover:text-primary transition-colors">Siparişlerim</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{order.orderNumber}</span>
            </nav>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Sipariş #{order.orderNumber}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} w-fit`}>
                        {statusInfo.label}
                    </span>
                </div>

                {/* Ürünler */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5" />
                            Ürünler
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                        {item.product?.images?.[0]?.url ? (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.productName}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                Görsel Yok
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.productName}</p>
                                        {item.variantName && (
                                            <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">{item.quantity} adet</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold">{Number(item.total).toLocaleString("tr-TR")} TL</p>
                                        <p className="text-sm text-muted-foreground">
                                            {Number(item.price).toLocaleString("tr-TR")} TL/adet
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ara Toplam</span>
                                <span>{Number(order.subtotal).toLocaleString("tr-TR")} TL</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kargo</span>
                                <span>{Number(order.shippingCost) === 0 ? "Ücretsiz" : `${Number(order.shippingCost).toLocaleString("tr-TR")} TL`}</span>
                            </div>
                            {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>İndirim</span>
                                    <span>-{Number(order.discount).toLocaleString("tr-TR")} TL</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <span>Toplam</span>
                                <span className="text-primary">{Number(order.total).toLocaleString("tr-TR")} TL</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Teslimat Adresi */}
                    {order.shippingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="h-5 w-5" />
                                    Teslimat Adresi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.district}, {order.shippingAddress.city}
                                </p>
                                {order.shippingAddress.phone && (
                                    <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Ödeme Bilgisi */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5" />
                                Ödeme Bilgisi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ödeme Durumu</span>
                                <span className="font-medium">{paymentLabels[order.paymentStatus] || order.paymentStatus}</span>
                            </div>
                            {order.payment?.cardType && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kart Tipi</span>
                                    <span>{order.payment.cardType}</span>
                                </div>
                            )}
                            {order.payment?.lastFourDigits && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kart</span>
                                    <span>**** {order.payment.lastFourDigits}</span>
                                </div>
                            )}
                            {order.trackingNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kargo Takip No</span>
                                    <span className="font-mono">{order.trackingNumber}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Durum Geçmişi */}
                {order.statusHistory?.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5" />
                                Sipariş Geçmişi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.statusHistory.map((history: any, index: number) => (
                                    <div key={history.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`h-3 w-3 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                            {index < order.statusHistory.length - 1 && (
                                                <div className="w-px h-full bg-muted-foreground/20 my-1" />
                                            )}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-medium text-sm">
                                                {statusLabels[history.status]?.label || history.status}
                                            </p>
                                            {history.note && (
                                                <p className="text-xs text-muted-foreground">{history.note}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(history.createdAt).toLocaleDateString("tr-TR", {
                                                    day: "numeric", month: "long", year: "numeric",
                                                    hour: "2-digit", minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Button variant="outline" asChild>
                    <Link href="/hesabim/siparislerim">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Siparişlerime Dön
                    </Link>
                </Button>
            </motion.div>
        </div>
    );
}
