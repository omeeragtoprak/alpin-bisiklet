import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendNewsletterConfirmationEmail } from "@/lib/mail";
import { z } from "zod";

const subscribeSchema = z.object({
	email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = subscribeSchema.parse(body);

		const result = await prisma.newsletterSubscriber.upsert({
			where: { email },
			update: {},
			create: { email },
		});

		// Yeni abone ise onay maili gönder
		// upsert her zaman kaydı döndürür; yeni kayıt olup olmadığını subscribedAt ile anlıyoruz
		const isNew = Date.now() - result.subscribedAt.getTime() < 5000;
		if (isNew) {
			sendNewsletterConfirmationEmail(email).catch((err) =>
				console.error("Bülten onay maili gönderilemedi:", err),
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.issues[0]?.message ?? "Geçersiz e-posta" }, { status: 400 });
		}
		console.error("Newsletter subscribe error:", error);
		return NextResponse.json({ error: "Abonelik işlemi başarısız" }, { status: 500 });
	}
}
