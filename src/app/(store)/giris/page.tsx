"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (session?.user) {
			const user = session.user as { role?: string };
			router.replace(user.role === "ADMIN" ? "/admin" : "/hesabim");
		}
	}, [session, router]);
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

			const data = await res.json();
			const role = data?.user?.role;
			router.push(role === "ADMIN" ? "/admin" : "/hesabim");
			router.refresh();
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Bir hata oluştu");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-[calc(100vh-var(--header-height,8rem))]">
			{/* Sol — logo / ileride video */}
			<div className="hidden lg:flex lg:w-1/2 relative items-center justify-center border-r border-border">
				{/* Logo placeholder — video gelince burası <video> olacak */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6 }}
					className="flex flex-col items-center gap-6 px-12 text-center"
				>
					<Image
						src="/logo.png"
						alt="Alpin Bisiklet"
						width={260}
						height={260}
					/>
					<div className="space-y-3">
						<h2 className="text-3xl font-bold tracking-tight">
							Alpin Bisiklet'e<br />Hoş Geldiniz
						</h2>
						<p className="text-muted-foreground text-base max-w-xs leading-relaxed">
							Türkiye'nin en güvenilir bisiklet mağazasında hesabınıza giriş yapın.
						</p>
					</div>
				</motion.div>
			</div>

			{/* Sağ — form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-20 py-16 bg-background">
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-sm"
				>
					{/* Başlık */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">Giriş Yap</h1>
						<p className="text-muted-foreground mt-2">
							Hesabınıza giriş yapın
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						{error && (
							<div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
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
									className="pl-10 h-11"
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
									className="pl-10 h-11"
									required
								/>
							</div>
						</div>

						<Button type="submit" className="w-full h-11" disabled={loading}>
							{loading ? "Giriş yapılıyor..." : "Giriş Yap"}
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>

						<p className="text-center text-sm text-muted-foreground">
							Hesabınız yok mu?{" "}
							<Link href="/kayit" className="text-primary font-medium hover:underline">
								Üye ol
							</Link>
						</p>
					</form>
				</motion.div>
			</div>
		</div>
	);
}
