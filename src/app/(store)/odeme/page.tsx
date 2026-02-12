"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
    ChevronRight,
    MapPin,
    Plus,
    CreditCard,
    Truck,
    Check,
    Loader2,
    ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Address {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    district: string;
    neighborhood?: string;
    address: string;
    postalCode?: string;
    isDefault: boolean;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1); // 1: Address, 2: Review, 3: Payment
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [customerNote, setCustomerNote] = useState("");
    const [newAddress, setNewAddress] = useState({
        title: "",
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        district: "",
        neighborhood: "",
        address: "",
        postalCode: "",
        isDefault: false,
    });

    // Fetch cart
    const { data: cartData, isLoading: cartLoading } = useQuery({
        queryKey: ["checkout-cart"],
        queryFn: async () => {
            const res = await fetch("/api/cart");
            const json = await res.json();
            return json.data;
        },
    });

    // Fetch addresses
    const {
        data: addressesData,
        isLoading: addressesLoading,
        refetch: refetchAddresses,
    } = useQuery({
        queryKey: ["checkout-addresses"],
        queryFn: async () => {
            const res = await fetch("/api/addresses");
            const json = await res.json();
            return json.data || [];
        },
    });

    // Create address mutation
    const createAddressMutation = useMutation({
        mutationFn: async (data: typeof newAddress) => {
            const res = await fetch("/api/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Adres oluşturulamadı");
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Adres eklendi" });
            setShowNewAddress(false);
            setSelectedAddressId(data.data.id);
            refetchAddresses();
        },
        onError: () => {
            toast({
                title: "Hata",
                description: "Adres eklenemedi",
                variant: "destructive",
            });
        },
    });

    // Place order mutation
    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shippingAddressId: selectedAddressId,
                    billingAddressId: selectedAddressId,
                    paymentMethod: "BANK_TRANSFER",
                    customerNote,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Sipariş oluşturulamadı");
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Sipariş oluşturuldu!", description: `Sipariş No: ${data.data.orderNumber}` });
            router.push(`/hesabim/siparislerim`);
        },
        onError: (err: Error) => {
            toast({
                title: "Hata",
                description: err.message,
                variant: "destructive",
            });
        },
    });

    // Set default address
    useEffect(() => {
        if (addressesData?.length > 0 && !selectedAddressId) {
            const def = addressesData.find((a: Address) => a.isDefault);
            setSelectedAddressId(def?.id || addressesData[0].id);
        }
    }, [addressesData, selectedAddressId]);

    const items = cartData?.items || [];
    const subtotal = items.reduce((sum: number, item: any) => {
        const price = item.variant?.price || item.product.price;
        return sum + Number(price) * item.quantity;
    }, 0);
    const shippingCost = subtotal >= 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    if (cartLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
            </div>
        );
    }

    if (!cartData || items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Sepetiniz boş</h1>
                <p className="text-muted-foreground mb-6">
                    Ödeme yapmak için sepetinize ürün ekleyin.
                </p>
                <Button asChild>
                    <Link href="/urunler">Alışverişe Başla</Link>
                </Button>
            </div>
        );
    }

    const selectedAddress = addressesData?.find(
        (a: Address) => a.id === selectedAddressId,
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary">
                    Ana Sayfa
                </Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/sepet" className="hover:text-primary">
                    Sepet
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">Ödeme</span>
            </nav>

            <h1 className="text-3xl font-bold mb-8">Sipariş Tamamla</h1>

            {/* Steps */}
            <div className="flex items-center justify-center gap-4 mb-10">
                {[
                    { n: 1, label: "Adres", icon: MapPin },
                    { n: 2, label: "Sipariş", icon: Truck },
                    { n: 3, label: "Ödeme", icon: CreditCard },
                ].map((s, i) => (
                    <div key={s.n} className="flex items-center gap-2">
                        <div
                            className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${step >= s.n
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-muted-foreground/30 text-muted-foreground"
                                }`}
                        >
                            {step > s.n ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <s.icon className="h-5 w-5" />
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium hidden sm:inline ${step >= s.n
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {s.label}
                        </span>
                        {i < 2 && (
                            <div
                                className={`w-12 h-0.5 ${step > s.n
                                        ? "bg-primary"
                                        : "bg-muted-foreground/20"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Address */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Teslimat Adresi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {addressesLoading ? (
                                        <p>Yükleniyor...</p>
                                    ) : addressesData?.length > 0 ? (
                                        <div className="grid gap-3">
                                            {addressesData.map(
                                                (addr: Address) => (
                                                    <label
                                                        key={addr.id}
                                                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId ===
                                                                addr.id
                                                                ? "border-primary bg-primary/5"
                                                                : "hover:border-muted-foreground/50"
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="address"
                                                            value={addr.id}
                                                            checked={
                                                                selectedAddressId ===
                                                                addr.id
                                                            }
                                                            onChange={() =>
                                                                setSelectedAddressId(
                                                                    addr.id,
                                                                )
                                                            }
                                                            className="mt-1"
                                                        />
                                                        <div>
                                                            <p className="font-medium">
                                                                {addr.title}
                                                                {addr.isDefault && (
                                                                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                        Varsayılan
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {addr.firstName}{" "}
                                                                {addr.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {addr.address},{" "}
                                                                {addr.district}/
                                                                {addr.city}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {addr.phone}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            Kayıtlı adresiniz yok. Lütfen
                                            yeni bir adres ekleyin.
                                        </p>
                                    )}

                                    {!showNewAddress ? (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowNewAddress(true)
                                            }
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Yeni Adres Ekle
                                        </Button>
                                    ) : (
                                        <Card className="border-dashed">
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>
                                                            Adres Başlığı*
                                                        </Label>
                                                        <Input
                                                            placeholder="Ev, İş..."
                                                            value={
                                                                newAddress.title
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    title: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Telefon*
                                                        </Label>
                                                        <Input
                                                            placeholder="05XX XXX XX XX"
                                                            value={
                                                                newAddress.phone
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    phone: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Ad*</Label>
                                                        <Input
                                                            value={
                                                                newAddress.firstName
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    firstName:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Soyad*
                                                        </Label>
                                                        <Input
                                                            value={
                                                                newAddress.lastName
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    lastName:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>İl*</Label>
                                                        <Input
                                                            value={
                                                                newAddress.city
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    city: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            İlçe*
                                                        </Label>
                                                        <Input
                                                            value={
                                                                newAddress.district
                                                            }
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    district:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>
                                                        Adres Detayı*
                                                    </Label>
                                                    <Input
                                                        placeholder="Mahalle, sokak, bina no..."
                                                        value={
                                                            newAddress.address
                                                        }
                                                        onChange={(e) =>
                                                            setNewAddress({
                                                                ...newAddress,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setShowNewAddress(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        İptal
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            createAddressMutation.mutate(
                                                                newAddress,
                                                            )
                                                        }
                                                        disabled={
                                                            createAddressMutation.isPending
                                                        }
                                                    >
                                                        {createAddressMutation.isPending && (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        )}
                                                        Kaydet
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Button
                                        className="w-full mt-4"
                                        size="lg"
                                        disabled={!selectedAddressId}
                                        onClick={() => setStep(2)}
                                    >
                                        Devam Et
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Step 2: Review */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-primary" />
                                        Sipariş Detayı
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Selected Address */}
                                    {selectedAddress && (
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-semibold">
                                                    Teslimat Adresi
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setStep(1)
                                                    }
                                                >
                                                    Değiştir
                                                </Button>
                                            </div>
                                            <p className="text-sm">
                                                {selectedAddress.firstName}{" "}
                                                {selectedAddress.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedAddress.address},{" "}
                                                {selectedAddress.district}/
                                                {selectedAddress.city}
                                            </p>
                                        </div>
                                    )}

                                    {/* Items */}
                                    <div className="space-y-3">
                                        {items.map((item: any) => {
                                            const price =
                                                item.variant?.price ||
                                                item.product.price;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden relative shrink-0">
                                                        {item.product
                                                            .images?.[0]
                                                            ?.url && (
                                                                <Image
                                                                    src={
                                                                        item.product
                                                                            .images[0]
                                                                            .url
                                                                    }
                                                                    alt={
                                                                        item.product
                                                                            .name
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="56px"
                                                                />
                                                            )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.quantity}{" "}
                                                            adet ×{" "}
                                                            {Number(
                                                                price,
                                                            ).toLocaleString(
                                                                "tr-TR",
                                                            )}{" "}
                                                            TL
                                                        </p>
                                                    </div>
                                                    <p className="font-medium text-sm">
                                                        {(
                                                            Number(price) *
                                                            item.quantity
                                                        ).toLocaleString(
                                                            "tr-TR",
                                                        )}{" "}
                                                        TL
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Customer Note */}
                                    <div>
                                        <Label>Sipariş Notu (opsiyonel)</Label>
                                        <Input
                                            placeholder="Siparişinizle ilgili bir notunuz var mı?"
                                            value={customerNote}
                                            onChange={(e) =>
                                                setCustomerNote(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(1)}
                                        >
                                            Geri
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            size="lg"
                                            onClick={() => setStep(3)}
                                        >
                                            Ödemeye Geç
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                        Ödeme
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Tabs defaultValue="bank" className="w-full">
                                        <TabsList className="w-full">
                                            <TabsTrigger
                                                value="bank"
                                                className="flex-1"
                                            >
                                                Havale / EFT
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="card"
                                                className="flex-1"
                                                disabled
                                            >
                                                Kredi Kartı (Yakında)
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent
                                            value="bank"
                                            className="mt-4"
                                        >
                                            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                                                <p className="font-medium text-sm">
                                                    Havale / EFT Bilgileri
                                                </p>
                                                <div className="text-sm space-y-1">
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Banka:
                                                        </span>{" "}
                                                        <strong>
                                                            Ziraat Bankası
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Şube:
                                                        </span>{" "}
                                                        Merkez
                                                    </p>
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            IBAN:
                                                        </span>{" "}
                                                        TR00 0000 0000 0000
                                                        0000 0000 00
                                                    </p>
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Alıcı:
                                                        </span>{" "}
                                                        Alpin Bisiklet Ltd. Şti.
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Sipariş numaranızı
                                                    açıklama kısmına
                                                    yazınız. Ödemeniz
                                                    onaylandıktan sonra
                                                    siparişiniz hazırlanacaktır.
                                                </p>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="card">
                                            <div className="text-center py-8 text-muted-foreground">
                                                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
                                                <p>
                                                    Kredi kartı ile ödeme
                                                    yakında aktif olacaktır.
                                                </p>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(2)}
                                        >
                                            Geri
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            size="lg"
                                            onClick={() =>
                                                placeOrderMutation.mutate()
                                            }
                                            disabled={
                                                placeOrderMutation.isPending
                                            }
                                        >
                                            {placeOrderMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    İşleniyor...
                                                </>
                                            ) : (
                                                <>
                                                    Siparişi Onayla
                                                    <Check className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <Card className="sticky top-24">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-bold">
                                Sipariş Özeti
                            </h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Ara Toplam ({items.length} ürün)
                                    </span>
                                    <span>
                                        {subtotal.toLocaleString("tr-TR")} TL
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Kargo
                                    </span>
                                    <span>
                                        {shippingCost === 0 ? (
                                            <span className="text-green-600 font-medium">
                                                Ücretsiz
                                            </span>
                                        ) : (
                                            `${shippingCost.toLocaleString("tr-TR")} TL`
                                        )}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Toplam</span>
                                <span className="text-primary">
                                    {total.toLocaleString("tr-TR")} TL
                                </span>
                            </div>

                            <div className="pt-2 space-y-1.5 text-xs text-muted-foreground">
                                <p className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-green-600" />
                                    Güvenli ödeme (256-bit SSL)
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-green-600" />
                                    14 gün koşulsuz iade
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-green-600" />
                                    Hızlı teslimat (1-3 iş günü)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
