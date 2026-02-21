// Admin hesabına 2FA manuel olarak ekler
// Kullanım: npx tsx prisma/enable-admin-2fa.ts

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const { symmetricEncrypt } = await import("better-auth/crypto");
  const { generateRandomString } = await import("better-auth/crypto");

  // Gerçek admin emailini buraya yaz
const adminEmail = process.env.ADMIN_EMAIL || "admin@alpinbisiklet.com";
  const appSecret = process.env.BETTER_AUTH_SECRET!;

  if (!appSecret) {
    console.error("❌ BETTER_AUTH_SECRET env değişkeni bulunamadı.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    console.error("❌ Admin kullanıcı bulunamadı:", adminEmail);
    process.exit(1);
  }

  console.log("✅ Admin bulundu:", user.email, "| ID:", user.id);

  // TOTP secret oluştur ve şifrele
  const rawSecret = generateRandomString(32);
  const encryptedSecret = await symmetricEncrypt({ key: appSecret, data: rawSecret });

  // Backup kodları oluştur (better-auth formatı: 5+5 char, encrypted JSON)
  const backupCodes = Array.from({ length: 10 }).map(() => {
    const code = generateRandomString(10, "a-z", "0-9", "A-Z");
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
  const encryptedBackupCodes = await symmetricEncrypt({
    key: appSecret,
    data: JSON.stringify(backupCodes),
  });

  // Mevcut two_factor kaydını sil
  await prisma.twoFactor.deleteMany({ where: { userId: user.id } });

  // Yeni two_factor kaydı oluştur
  await prisma.twoFactor.create({
    data: {
      userId: user.id,
      secret: encryptedSecret,
      backupCodes: encryptedBackupCodes,
    },
  });

  // twoFactorEnabled = true yap
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true },
  });

  console.log("🔐 2FA etkinleştirildi!");
  console.log("📧 Admin email:", adminEmail);
  console.log("💾 Backup kodlar kaydedildi.");
  console.log("");
  console.log("Artık /admin/giris üzerinden giriş yapınca OTP emaili gelecek.");

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
