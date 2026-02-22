"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const res = await fetch("/api/auth/sign-in/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Giriş başarısız");
			}

			router.push("/hesabim");
			router.refresh();
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
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
						<CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
						<p className="text-center text-muted-foreground">
							Hesabınıza giriş yapın
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

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="password">Şifre</Label>
									<Link
										href="/sifremi-unuttum"
										className="text-sm text-primary hover:underline"
									>
										Şifremi unuttum
									</Link>
								</div>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="••••••••"
										className="pl-10"
										required
									/>
								</div>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? "Giriş yapılıyor..." : "Giriş Yap"}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								Hesabınız yok mu?{" "}
								<Link href="/kayit" className="text-primary hover:underline">
									Üye ol
								</Link>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
