import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNewsletterEmail } from "@/lib/mail";

const NEWSLETTER_HEADLINES = [
	"Bu Hafta Kaçırmamanız Gereken Fırsatlar!",
	"Yeni Sezon, Yeni Bisikletler — Şimdi İnceleyin",
	"Haftanın Özel Seçimleri Sizin İçin Hazır",
	"Pedallamaya Hazır mısınız? Fırsatlar Sizi Bekliyor",
	"Bu Haftanın Öne Çıkan Ürünleri",
];

export async function GET(request: NextRequest) {
	// Güvenlik kontrolü
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
	}

	try {
		// Kayıtlı müşteriler + anonim bülten aboneleri
		const [registeredCustomers, anonymousSubscribers] = await Promise.all([
			prisma.user.findMany({
				where: { role: "CUSTOMER" },
				select: { email: true, name: true },
			}),
			prisma.newsletterSubscriber.findMany({
				select: { email: true },
			}),
		]);

		// Kayıtlı müşteri e-postalarını bir Set'e al, tekrar gönderimi önle
		const registeredEmails = new Set(registeredCustomers.map((c) => c.email));
		const anonRecipients = anonymousSubscribers
			.filter((s) => !registeredEmails.has(s.email))
			.map((s) => ({ email: s.email, name: null }));

		const customers = [...registeredCustomers, ...anonRecipients];

		if (customers.length === 0) {
			return NextResponse.json({ sent: 0, failed: 0, message: "Alıcı bulunamadı" });
		}

		// Öne çıkan / indirimli ürünleri çek
		const rawProducts = await prisma.product.findMany({
			where: {
				isActive: true,
				OR: [{ isFeatured: true }, { comparePrice: { not: null } }],
			},
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

		const products = rawProducts.map((p) => ({
			name: p.name,
			price: p.price,
			comparePrice: p.comparePrice,
			slug: p.slug,
			imageUrl: p.images[0]?.url ?? null,
		}));

		// En güncel yayınlanmış blog yazısını çek
		const latestBlog = await prisma.blog.findFirst({
			where: { isPublished: true },
			orderBy: { publishedAt: "desc" },
			select: { title: true, slug: true, excerpt: true, coverImage: true },
		});

		const blog = latestBlog
			? {
					title: latestBlog.title,
					slug: latestBlog.slug,
					excerpt: latestBlog.excerpt ?? null,
					coverImage: latestBlog.coverImage ?? null,
				}
			: null;

		// Rastgele başlık seç
		const headline = NEWSLETTER_HEADLINES[Math.floor(Math.random() * NEWSLETTER_HEADLINES.length)];

		// Mailleri gönder
		let sent = 0;
		let failed = 0;

		for (const customer of customers) {
			try {
				await sendNewsletterEmail({
					to: customer.email,
					name: customer.name ?? customer.email.split("@")[0],
					subject: headline,
					headline,
					products,
					latestBlog: blog,
				});
				sent++;

				// Rate limiting: her mail arasında 200ms bekle
				await new Promise((resolve) => setTimeout(resolve, 200));
			} catch (err) {
				console.error(`Newsletter gönderilemedi (${customer.email}):`, err);
				failed++;
			}
		}

		return NextResponse.json({ sent, failed, total: customers.length });
	} catch (error) {
		console.error("Newsletter cron error:", error);
		return NextResponse.json({ error: "Bülten gönderilemedi" }, { status: 500 });
	}
}
