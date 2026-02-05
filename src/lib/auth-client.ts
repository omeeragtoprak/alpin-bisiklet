"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Hook'ları dışa aktar
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  // getSession, // Server component'lerde kullanmak için
} = authClient;
