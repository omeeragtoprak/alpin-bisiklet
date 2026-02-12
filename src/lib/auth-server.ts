import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Server-side session helper
 * Server component'lerde ve API route'larında kullanılabilir
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin() {
  const session = await getServerSession();
  return session?.user?.role === "ADMIN";
}

/**
 * Kullanıcının giriş yapmış olmasını zorunlu kılar
 * Giriş yapmamışsa null döner, sayfada redirect yapılmalı
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

/**
 * Kullanıcının admin olmasını zorunlu kılar
 * Admin değilse null döner
 */
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}
