import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";
import { sendAdminOtpEmail } from "./mail";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    // Email doğrulama (opsiyonel)
    // requireEmailVerification: true,
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
