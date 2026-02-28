import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";
import { sendAdminOtpEmail, sendWelcomeEmail } from "./mail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // Email doğrulama (opsiyonel)
    // requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Session ayarları
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 gün
    updateAge: 60 * 60 * 24, // 1 günde bir güncelle
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 dakika cache
    },
  },

  // Kullanıcı oluşturulduğunda role ata
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Sadece müşterilere hoş geldin maili gönder (admin hesapları hariç)
          if (user.role === "ADMIN") return;

          try {
            // Öne çıkan veya indirimli ürünleri çek (max 3)
            const products = await prisma.product.findMany({
              where: { isActive: true, OR: [{ isFeatured: true }, { comparePrice: { not: null } }] },
              orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
              take: 3,
              select: {
                name: true,
                price: true,
                comparePrice: true,
                slug: true,
                images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
              },
            });

            const featuredProducts = products.map((p) => ({
              name: p.name,
              price: p.price,
              comparePrice: p.comparePrice,
              slug: p.slug,
              imageUrl: p.images[0]?.url ?? null,
            }));

            await sendWelcomeEmail(
              user.email,
              user.name ?? user.email,
              featuredProducts,
            );
          } catch (err) {
            console.error("Welcome email gönderilemedi:", err);
          }
        },
      },
    },
  },

  plugins: [
    nextCookies(), // Server actions için cookie desteği
    admin(), // Admin plugin for role-based access
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await sendAdminOtpEmail(user.email, otp);
        },
      },
    }),
  ],
});

// Auth türlerini dışa aktar
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
