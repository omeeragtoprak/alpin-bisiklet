/**
 * Ortam değişkeni doğrulama
 * Bu dosyayı import ederek gerekli değişkenlerin varlığını garanti edin
 */

function requiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `❌ Gerekli ortam değişkeni eksik: ${key}\n` +
            `Lütfen .env dosyasını kontrol edin.`,
        );
    }
    return value;
}

function optionalEnv(key: string, fallback: string): string {
    return process.env[key] || fallback;
}

export const env = {
    // Database
    DATABASE_URL: requiredEnv("DATABASE_URL"),

    // Auth
    BETTER_AUTH_SECRET: requiredEnv("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: optionalEnv("BETTER_AUTH_URL", "http://localhost:3000"),

    // Redis
    REDIS_URL: optionalEnv("REDIS_URL", "redis://localhost:6379"),

    // Iyzico (opsiyonel — sandbox anahtarları sonra eklenecek)
    IYZICO_API_KEY: optionalEnv("IYZICO_API_KEY", ""),
    IYZICO_SECRET_KEY: optionalEnv("IYZICO_SECRET_KEY", ""),
    IYZICO_BASE_URL: optionalEnv("IYZICO_BASE_URL", "https://sandbox-api.iyzipay.com"),

    // App
    NEXT_PUBLIC_APP_URL: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
} as const;
