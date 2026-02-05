import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // Database yapılandırması - Prisma, Drizzle veya doğrudan veritabanı bağlantısı kullanabilirsiniz
  // Örnek Prisma kullanımı:
  // database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Örnek SQLite kullanımı (geliştirme için):
  // database: {
  //   url: "file:./dev.db",
  //   type: "sqlite",
  // },

  emailAndPassword: {
    enabled: true,
    // Email doğrulama (opsiyonel)
    // requireEmailVerification: true,
  },

  // Sosyal giriş sağlayıcıları (opsiyonel)
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },

  plugins: [
    nextCookies(), // Server actions için cookie desteği
  ],
});

// Auth türlerini dışa aktar
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
