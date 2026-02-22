"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Save, User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileInput, type ChangePasswordInput } from "@/lib/validations";
import { formatTurkishPhone } from "@/lib/phone";

export default function AccountSettingsPage() {
  const { data: session } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // --- Profile Form ---
  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        phone: "",
      });
    }
  }, [session]);

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      await authClient.updateUser({ name: data.name });
    },
    onSuccess: () => {
      toast({ title: "Profil güncellendi" });
    },
    onError: () => {
      toast({ title: "Profil güncellenemedi", variant: "destructive" });
    },
  });

  // --- Password Form ---
  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (result.error) throw new Error(result.error.message || "Şifre değiştirilemedi");
    },
    onSuccess: () => {
      toast({ title: "Şifre değiştirildi" });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Şifre değiştirilemedi", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hesap Ayarları</h1>
        <p className="text-muted-foreground">Profil bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
      </div>

      <div className="flex gap-2" role="tablist">
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("profile")}
          role="tab"
          aria-selected={activeTab === "profile"}
        >
          <User className="h-4 w-4 mr-2" />
          Profil
        </Button>
        <Button
          variant={activeTab === "password" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("password")}
          role="tab"
          aria-selected={activeTab === "password"}
        >
          <Lock className="h-4 w-4 mr-2" />
          Şifre
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>Ad ve iletişim bilgileriniz</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit((data) => updateProfile.mutate(data))}
                    className="space-y-4 max-w-md"
                  >
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ahmet Yılmaz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <Input
                        value={session?.user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">E-posta değiştirilemez</p>
                    </FormItem>

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="05XX XXX XX XX"
                              inputMode="tel"
                              {...field}
                              onChange={(e) => {
                                field.onChange(formatTurkishPhone(e.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {updateProfile.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>Hesap güvenliğiniz için şifrenizi düzenli değiştirin</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit((data) => changePassword.mutate(data))}
                    className="space-y-4 max-w-md"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mevcut Şifre *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yeni Şifre *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yeni Şifre (Tekrar) *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={changePassword.isPending}>
                      {changePassword.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {changePassword.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
