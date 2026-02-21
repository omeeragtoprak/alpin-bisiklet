"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { twoFactor } from "@/lib/auth-client";
import { Shield, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const RESEND_COOLDOWN = 30;

export default function IkiAdimDogrulamaPage() {
  // Hard navigation kullan — Next.js router cache'ini bypass eder,
  // layout doğru şekilde (sidebar ile) yeniden render edilir.
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // StrictMode'da useEffect iki kez çalışır — bu ref ile ilk çağrıyı kilitleriz
  const otpFiredRef = useRef(false);

  // Mount'ta OTP gönder (sadece bir kez)
  useEffect(() => {
    if (otpFiredRef.current) return;
    otpFiredRef.current = true;
    sendOtp();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendOtp() {
    setSending(true);
    setError("");
    try {
      await twoFactor.sendOtp();
      setOtpSent(true);
      startCooldown();
    } catch {
      setError("Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setError("");
    setLoading(true);

    try {
      await twoFactor.verifyOtp(
        { code },
        {
          onSuccess() {
            // router.push yerine hard navigation — layout cache'i temizler
            window.location.href = "/admin";
          },
          onError(ctx) {
            setError(ctx.error.message || "Geçersiz veya süresi dolmuş kod.");
          },
        }
      );
    } catch {
      setError("Doğrulama başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            İki Adımlı Doğrulama
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            E-postanıza gönderilen 6 haneli kodu girin
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* OTP gönderildi bildirimi */}
          {otpSent && !error && (
            <div className="flex items-start gap-2.5 bg-green-950/40 border border-green-900 rounded-lg px-3.5 py-3 mb-5">
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-green-300 font-medium">Kod gönderildi</p>
                <p className="text-xs text-green-400/70 mt-0.5">
                  E-posta adresinize 6 haneli doğrulama kodu gönderildi.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-gray-600 transition"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-900 rounded-lg px-3.5 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:text-gray-400 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                "Doğrula ve Giriş Yap"
              )}
            </button>
          </form>

          {/* Yeniden gönder */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-400">Kod gelmedi mi?</span>
            <button
              type="button"
              onClick={sendOtp}
              disabled={sending || cooldown > 0}
              className="text-sm font-medium text-white disabled:text-gray-500 hover:underline transition"
            >
              {sending ? (
                "Gönderiliyor..."
              ) : cooldown > 0 ? (
                `Tekrar gönder (${cooldown}s)`
              ) : (
                "Tekrar gönder"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-4">
            Mail gelmediyse spam/önemsiz klasörünüzü kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
}
