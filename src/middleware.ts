import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // ============================================
    // Security Headers
    // ============================================
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    );
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://alpinbisiklet.com https://*.alpinbisiklet.com; font-src 'self' data:; connect-src 'self' https://sandbox-api.iyzipay.com https://api.iyzipay.com; frame-src 'self' https://sandbox-api.iyzipay.com https://api.iyzipay.com;",
    );

    // ============================================
    // API Rate Limiting (basit, in-memory)
    // ============================================
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const key = `${ip}:${request.nextUrl.pathname}`;
        const now = Date.now();

        // Basit rate limit: dakikada 60 istek
        const windowMs = 60_000;
        const maxRequests = 60;

        if (!rateLimitMap.has(key)) {
            rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        } else {
            const entry = rateLimitMap.get(key)!;
            if (now > entry.resetTime) {
                entry.count = 1;
                entry.resetTime = now + windowMs;
            } else {
                entry.count++;
            }

            if (entry.count > maxRequests) {
                return NextResponse.json(
                    { error: "Çok fazla istek. Lütfen bekleyin." },
                    { status: 429, headers: { "Retry-After": "60" } },
                );
            }
        }

        // Eski kayıtları temizle (her 1000 istekte bir)
        if (rateLimitMap.size > 1000) {
            for (const [k, v] of rateLimitMap) {
                if (now > v.resetTime) rateLimitMap.delete(k);
            }
        }
    }

    return response;
}

// In-memory rate limit store
const rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
>();

export const config = {
    matcher: [
        // Tüm sayfalar ve API'ler (static dosyalar hariç)
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
