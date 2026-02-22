"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            const res = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, redirectTo: "/sifremi-sifirla" }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Bir hata oluştu");
            }
            setSent(true);
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardContent className="pt-6 text-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                            <h2 className="text-xl font-bold">E-posta Gönderildi</h2>
                            <p className="text-muted-foreground">
                                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                                Lütfen gelen kutunuzu kontrol edin.
                            </p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href="/giris">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Giriş Sayfasına Dön
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Şifremi Unuttum</CardTitle>
                        <p className="text-center text-muted-foreground">
                            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/giris"
                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Giriş sayfasına dön
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
