import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// In-memory rate limit store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Korunan rotalar (store)
const protectedPaths = ["/dashboard", "/hesap", "/profil"];

// Admin public sayfaları (auth check yok)
const adminPublicPaths = ["/admin/giris", "/admin/iki-adim-dogrulama"];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminPublicPath(pathname: string): boolean {
  return adminPublicPaths.some((path) => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // Admin rotaları — cookie yoksa /admin/giris
  // ============================================
  if (isAdminPath(pathname) && !isAdminPublicPath(pathname)) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/admin/giris", request.url));
    }
  }

  // ============================================
  // Store korunan rotalar
  // ============================================
  if (isProtectedPath(pathname)) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/giris", request.url));
    }
  }

  // x-pathname header — sadece sayfa rotaları için (admin layout okur)
  // API rotaları için header'ları değiştirmiyoruz (multipart/form-data parse sorunlarını önler)
  let response: ReturnType<typeof NextResponse.next>;
  if (!pathname.startsWith("/api/")) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-pathname", pathname);
    response = NextResponse.next({ request: { headers: reqHeaders } });
  } else {
    response = NextResponse.next();
  }

  // ============================================
  // Security Headers
  // ============================================
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://alpinbisiklet.com https://*.alpinbisiklet.com https://images.unsplash.com https://*.unsplash.com; font-src 'self' data:; connect-src 'self' blob: https://sandbox-api.iyzipay.com https://api.iyzipay.com; worker-src 'self' blob:; frame-src 'self' https://sandbox-api.iyzipay.com https://api.iyzipay.com;"
  );

  // ============================================
  // API Rate Limiting (basit, in-memory)
  // ============================================
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    // Auth endpoint'leri için sıkı limit: dakikada 10
    const isAuthEndpoint = pathname.startsWith("/api/auth/");
    const windowMs = 60_000;
    const maxRequests = isAuthEndpoint ? 10 : 60;

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
          { status: 429, headers: { "Retry-After": "60" } }
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

export const config = {
  matcher: [
    // Tüm sayfalar ve API'ler (static dosyalar hariç)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
