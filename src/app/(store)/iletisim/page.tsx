"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        // Form verisi - şimdilik sadece toast göster
        // Production'da bu bir API endpoint'e POST yapmalı
        setTimeout(() => {
            toast({
                title: "Mesajınız Alındı",
                description: "En kısa sürede size dönüş yapacağız.",
            });
            setLoading(false);
            (e.target as HTMLFormElement).reset();
        }, 500);
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">İletişim</h1>
                <p className="text-muted-foreground text-center mb-12">
                    Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.
                </p>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* İletişim Bilgileri */}
                    <div className="space-y-4">
                        {[
                            {
                                icon: MapPin,
                                title: "Adres",
                                content: "Örnek Mah. Bisiklet Cad. No:123\nKadıköy / İstanbul",
                            },
                            {
                                icon: Phone,
                                title: "Telefon",
                                content: "0850 123 45 67",
                            },
                            {
                                icon: Mail,
                                title: "E-posta",
                                content: "info@alpinbisiklet.com",
                            },
                            {
                                icon: Clock,
                                title: "Çalışma Saatleri",
                                content: "Pazartesi - Cumartesi: 09:00 - 19:00\nPazar: Kapalı",
                            },
                        ].map((item) => (
                            <Card key={item.title}>
                                <CardContent className="flex items-start gap-4 pt-6">
                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {item.content}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* İletişim Formu */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bize Mesaj Gönderin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Adınız Soyadınız</Label>
                                            <Input id="name" name="name" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-posta</Label>
                                            <Input id="email" name="email" type="email" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Konu</Label>
                                        <Input id="subject" name="subject" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Mesajınız</Label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            required
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {loading ? "Gönderiliyor..." : "Gönder"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
