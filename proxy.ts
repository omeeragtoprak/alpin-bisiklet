import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy
 * Route protection ve authentication kontrolü
 */
export function proxy(request: NextRequest) {
  // Session cookie'sini kontrol et
  const sessionCookie = getSessionCookie(request);

  // Korunan rotalar için giriş kontrolü
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/giris", request.url));
  }

  return NextResponse.next();
}

// Korunacak rotaları belirle
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/hesap/:path*",
    "/profil/:path*",
    // Diğer korunan rotalar...
  ],
};
