/**
 * Türkçe karakterleri ASCII'ye dönüştürerek URL-uyumlu slug üretir.
 * Proje genelinde tüm route'larda bu fonksiyon kullanılmalı.
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/ğ/g, "g")
		.replace(/ü/g, "u")
		.replace(/ş/g, "s")
		.replace(/ı/g, "i")
		.replace(/ö/g, "o")
		.replace(/ç/g, "c")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
