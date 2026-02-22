"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (session?.user) {
			router.replace("/hesabim");
		}
	}, [session, router]);
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
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin.",
			);
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
							Şifrenizi mi<br />Unuttunuz?
						</h2>
						<p className="text-muted-foreground text-base max-w-xs leading-relaxed">
							Endişelenmeyin, e-posta adresinize sıfırlama bağlantısı gönderelim.
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
					{sent ? (
						/* Başarı durumu */
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4 }}
							className="text-center space-y-5"
						>
							<div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
								<CheckCircle className="h-8 w-8 text-green-600" />
							</div>
							<div>
								<h1 className="text-2xl font-bold tracking-tight">E-posta Gönderildi</h1>
								<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
									Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
									Lütfen gelen kutunuzu kontrol edin.
								</p>
							</div>
							<Button asChild variant="outline" className="h-11">
								<Link href="/giris">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Giriş Sayfasına Dön
								</Link>
							</Button>
						</motion.div>
					) : (
						<>
							{/* Başlık */}
							<div className="mb-8">
								<h1 className="text-3xl font-bold tracking-tight">Şifremi Unuttum</h1>
								<p className="text-muted-foreground mt-2">
									E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.
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

								<Button type="submit" className="w-full h-11" disabled={loading}>
									{loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>

								<div className="text-center">
									<Link
										href="/giris"
										className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
									>
										<ArrowLeft className="h-3 w-3" />
										Giriş sayfasına dön
									</Link>
								</div>
							</form>
						</>
					)}
				</motion.div>
			</div>
		</div>
	);
}
