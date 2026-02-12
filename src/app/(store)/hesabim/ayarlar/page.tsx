"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Settings, Save, User, Lock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function AccountSettingsPage() {
    const { data: session } = authClient.useSession();
    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
    const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
    const [passwords, setPasswords] = useState({ current: "", newPassword: "", confirm: "" });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (session?.user) {
            setProfile({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "",
            });
        }
    }, [session]);

    const updateProfile = useMutation({
        mutationFn: async () => {
            await authClient.updateUser({ name: profile.name });
        },
        onSuccess: () => {
            setMessage({ type: "success", text: "Profil güncellendi" });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: () => {
            setMessage({ type: "error", text: "Profil güncellenemedi" });
        },
    });

    const changePassword = useMutation({
        mutationFn: async () => {
            if (passwords.newPassword !== passwords.confirm) {
                throw new Error("Şifreler eşleşmiyor");
            }
            await authClient.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.newPassword,
            });
        },
        onSuccess: () => {
            setMessage({ type: "success", text: "Şifre değiştirildi" });
            setPasswords({ current: "", newPassword: "", confirm: "" });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: (error: Error) => {
            setMessage({ type: "error", text: error.message || "Şifre değiştirilemedi" });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Hesap Ayarları</h1>
                <p className="text-muted-foreground">Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
            </div>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`} role="alert">
                        {message.text}
                    </div>
                </motion.div>
            )}

            <div className="flex gap-2" role="tablist">
                <Button
                    variant={activeTab === "profile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("profile")}
                    role="tab"
                    aria-selected={activeTab === "profile"}
                >
                    <User className="h-4 w-4 mr-2" aria-hidden="true" />
                    Profil
                </Button>
                <Button
                    variant={activeTab === "password" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("password")}
                    role="tab"
                    aria-selected={activeTab === "password"}
                >
                    <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                    Şifre
                </Button>
            </div>

            {activeTab === "profile" ? (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Bilgileri</CardTitle>
                            <CardDescription>Ad, email ve iletişim bilgileriniz</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }}
                                className="space-y-4 max-w-md"
                            >
                                <div>
                                    <Label htmlFor="profile-name">Ad Soyad</Label>
                                    <Input id="profile-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="profile-email">E-posta</Label>
                                    <Input id="profile-email" value={profile.email} disabled className="bg-muted" />
                                    <p className="text-xs text-muted-foreground mt-1">E-posta değiştirilemez</p>
                                </div>
                                <Button type="submit" disabled={updateProfile.isPending}>
                                    <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                                    {updateProfile.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Şifre Değiştir</CardTitle>
                            <CardDescription>Hesap güvenliğiniz için şifrenizi düzenli değiştirin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }}
                                className="space-y-4 max-w-md"
                            >
                                <div>
                                    <Label htmlFor="current-pass">Mevcut Şifre</Label>
                                    <Input id="current-pass" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
                                </div>
                                <div>
                                    <Label htmlFor="new-pass">Yeni Şifre</Label>
                                    <Input id="new-pass" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={8} />
                                </div>
                                <div>
                                    <Label htmlFor="confirm-pass">Yeni Şifre (Tekrar)</Label>
                                    <Input id="confirm-pass" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
                                    {passwords.confirm && passwords.newPassword !== passwords.confirm && (
                                        <p className="text-xs text-destructive mt-1">Şifreler eşleşmiyor</p>
                                    )}
                                </div>
                                <Button type="submit" disabled={changePassword.isPending || passwords.newPassword !== passwords.confirm}>
                                    <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
                                    {changePassword.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
