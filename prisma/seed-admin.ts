// Admin kullanıcı oluşturma seed script
// Kullanım: npx tsx prisma/seed-admin.ts

import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

const ADMIN_EMAIL = "admin@alpinbisiklet.com";
const ADMIN_PASSWORD = "Admin123!";
const ADMIN_NAME = "Admin";

async function main() {
    // better-auth'un hashPassword fonksiyonunu dinamik import
    const { hashPassword } = await import("better-auth/crypto");

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        // 1. Eski admin varsa sil
        await pool.query(
            `DELETE FROM accounts WHERE "userId" IN (SELECT id FROM users WHERE email = $1)`,
            [ADMIN_EMAIL],
        );
        await pool.query(
            `DELETE FROM sessions WHERE "userId" IN (SELECT id FROM users WHERE email = $1)`,
            [ADMIN_EMAIL],
        );
        await pool.query(`DELETE FROM users WHERE email = $1`, [ADMIN_EMAIL]);

        // 2. Hash password with better-auth's own function
        const hashedPassword = await hashPassword(ADMIN_PASSWORD);

        // 3. Create user
        const userId = crypto.randomUUID();
        const now = new Date();

        await pool.query(
            `INSERT INTO users (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, 'ADMIN', $5, $6)`,
            [userId, ADMIN_NAME, ADMIN_EMAIL, true, now, now],
        );

        // 4. Create credential account
        const accountId = crypto.randomUUID();
        await pool.query(
            `INSERT INTO accounts (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, 'credential', $4, $5, $6)`,
            [accountId, userId, userId, hashedPassword, now, now],
        );

        console.log("✅ Admin kullanıcı oluşturuldu!");
        console.log("");
        console.log("📧 Email:   admin@alpinbisiklet.com");
        console.log("🔑 Şifre:   Admin123!");
        console.log("");
    } catch (error) {
        console.error("❌ Hata:", error);
    } finally {
        await pool.end();
    }
}

main();
