"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";
import { Shield, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function AdminGirisPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Zaten giriş yapmış admin varsa direkt yönlendir (hard nav — layout cache bypass)
  useEffect(() => {
    const user = session?.user as { role?: string } | undefined;
    if (!isPending && user?.role === "ADMIN") {
      window.location.replace("/admin");
    }
  }, [session, isPending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn.email({
        email,
        password,
        callbackURL: "/admin",
        fetchOptions: {
          onError(ctx) {
            setError(ctx.error.message || "Giriş başarısız. Bilgilerinizi kontrol edin.");
            setLoading(false);
          },
          onSuccess(ctx) {
            if (ctx.data?.twoFactorRedirect) {
              // 2FA sayfasına normal navigation — bu sayfada sidebar yok (public page)
              router.push("/admin/iki-adim-dogrulama");
            } else {
              // Hard navigation — layout cache'i bypass ederek sidebar'lı versiyonu yükle
              window.location.href = "/admin";
            }
          },
        },
      });
    } catch {
      setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Admin Girişi
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Alpin Bisiklet Yönetim Paneli
          </p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                E-posta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@alpinbisiklet.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-600 transition"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-900 rounded-lg px-3.5 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-400 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-gray-600">
          Bu sayfa yalnızca yetkili admin kullanıcıları içindir.
        </p>
      </div>
    </div>
  );
}
