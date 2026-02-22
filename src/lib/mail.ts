import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailOptions & { from?: string }) {
  await transporter.sendMail({
    from:
      from ||
      process.env.SMTP_FROM ||
      '"Alpin Bisiklet" <koksaltekin@alpinbisiklet.com>',
    to,
    subject,
    html,
  });
}

// Müşterilere gönderilecek mailler için kullanın
export async function sendCustomerEmail({
  to,
  subject,
  html,
}: SendEmailOptions) {
  await sendEmail({
    to,
    subject,
    html,
    from:
      process.env.SMTP_FROM_CUSTOMER ||
      process.env.SMTP_FROM ||
      '"Alpin Bisiklet" <koksaltekin@alpinbisiklet.com>',
  });
}

export async function sendNewsletterConfirmationEmail(email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";
  const year = new Date().getFullYear();

  await sendCustomerEmail({
    to: email,
    subject: "Alpin Bisiklet Bültenine Abone Oldunuz",
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bülten Aboneliği</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;max-width:100%;">

                <!-- Logo -->
                <tr>
                  <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e2e8f0;background:#ffffff;">
                    <img src="${appUrl}/logo.png" alt="Alpin Bisiklet" width="160" style="height:auto;display:inline-block;" />
                  </td>
                </tr>

                <!-- Dark hero — solid, no gradient -->
                <tr>
                  <td style="background:#0f172a;padding:36px 32px;text-align:center;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">
                      Bülten Aboneliği
                    </p>
                    <h1 style="margin:0;color:#f8fafc;font-size:26px;font-weight:700;line-height:1.3;letter-spacing:-0.3px;">
                      Aramıza Hoş Geldiniz
                    </h1>
                    <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
                      Kampanyaları ve yenilikleri ilk siz öğreneceksiniz.
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 32px 28px;">
                    <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7;">
                      Merhaba,
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
                      <strong style="color:#0f172a;">${email}</strong> adresi bülten listemize başarıyla eklendi.
                      Bundan böyle haftada birkaç kez seçilmiş içerikler, özel fırsatlar ve
                      bisiklet dünyasından haberler doğrudan gelen kutunuza ulaşacak.
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
                    </table>

                    <!-- Benefits -->
                    <p style="margin:0 0 14px;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;color:#94a3b8;">
                      Bültenimizde neler var?
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                          <span style="display:inline-block;width:6px;height:6px;background:#16a34a;border-radius:50%;vertical-align:middle;margin-right:12px;"></span>
                          <span style="font-size:14px;color:#334155;">Haftanın öne çıkan ürün ve kampanyaları</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                          <span style="display:inline-block;width:6px;height:6px;background:#16a34a;border-radius:50%;vertical-align:middle;margin-right:12px;"></span>
                          <span style="font-size:14px;color:#334155;">Yalnızca abonelere özel indirim kodları</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                          <span style="display:inline-block;width:6px;height:6px;background:#16a34a;border-radius:50%;vertical-align:middle;margin-right:12px;"></span>
                          <span style="font-size:14px;color:#334155;">Yeni sezon bisiklet modelleri ve haberler</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;vertical-align:middle;">
                          <span style="display:inline-block;width:6px;height:6px;background:#16a34a;border-radius:50%;vertical-align:middle;margin-right:12px;"></span>
                          <span style="font-size:14px;color:#334155;">Bakım, ayar ve kullanım ipuçları</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                      <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:0 32px 36px;text-align:center;">
                    <a href="${appUrl}/urunler"
                      style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;
                             padding:14px 36px;border-radius:6px;text-decoration:none;letter-spacing:0.2px;">
                      Ürünleri Keşfet
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
                      Bu e-postayı
                      <strong style="color:#475569;">${email}</strong>
                      adresine bülten aboneliği nedeniyle gönderdik.
                    </p>
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                      © ${year} Alpin Bisiklet — Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

export async function sendAdminOtpEmail(email: string, otp: string) {
  await sendEmail({
    to: email,
    subject: "Admin Girişi — Doğrulama Kodunuz",
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Doğrulama Kodu</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#111827;padding:24px 32px;text-align:center;">
                    <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
                      🛡️ Alpin Bisiklet Admin
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;font-weight:600;">
                      İki Adımlı Doğrulama
                    </h2>
                    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                      Admin paneline giriş için doğrulama kodunuz aşağıdadır. Bu kod <strong>10 dakika</strong> geçerlidir.
                    </p>
                    <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;font-family:monospace;">
                        ${otp}
                      </span>
                    </div>
                    <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                      Bu kodu kimseyle paylaşmayın. Alpin Bisiklet ekibi hiçbir zaman bu kodu sizden istemez.
                    </p>
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      Bu isteği siz yapmadıysanız güvenlik ekibiyle iletişime geçin.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
                    <span style="color:#9ca3af;font-size:12px;">
                      © ${new Date().getFullYear()} Alpin Bisiklet. Tüm hakları saklıdır.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

export interface WelcomeProduct {
  name: string;
  price: number;
  comparePrice: number | null;
  slug: string;
  imageUrl: string | null;
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  featuredProducts: WelcomeProduct[] = [],
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";
  const year = new Date().getFullYear();

  const formatPrice = (p: number) =>
    p.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  const productCardsHtml = featuredProducts
    .map(
      (p) => `
      <td width="33%" style="padding:0 6px;vertical-align:top;">
        <a href="${appUrl}/urunler/${p.slug}" style="text-decoration:none;color:inherit;display:block;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;background:#fff;">
            <tr>
              <td style="padding:0;background:#f8fafc;">
                ${
                  p.imageUrl
                    ? `<img src="${appUrl}${p.imageUrl}" alt="${p.name}" width="180" height="130"
                        style="width:100%;height:130px;object-fit:cover;display:block;" />`
                    : `<div style="height:130px;background:#f1f5f9;"></div>`
                }
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px 14px;border-top:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#0f172a;line-height:1.4;">
                  ${p.name}
                </p>
                ${
                  p.comparePrice && p.comparePrice > p.price
                    ? `<p style="margin:0 0 1px;font-size:10px;color:#94a3b8;text-decoration:line-through;">${formatPrice(p.comparePrice)}</p>
                       <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;">${formatPrice(p.price)}</p>`
                    : `<p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${formatPrice(p.price)}</p>`
                }
              </td>
            </tr>
          </table>
        </a>
      </td>`,
    )
    .join("");

  const productsSection =
    featuredProducts.length > 0
      ? `
      <tr>
        <td style="padding:28px 32px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">
            Sizin İçin Seçtiklerimiz
          </p>
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">
            Öne Çıkan Ürünler
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>${productCardsHtml}</tr>
          </table>
        </td>
      </tr>`
      : "";

  await sendCustomerEmail({
    to: email,
    subject: `Alpin Bisiklet'e Hoş Geldiniz, ${name}`,
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alpin Bisiklet'e Hoş Geldiniz</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;max-width:100%;">

                <!-- Logo -->
                <tr>
                  <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e2e8f0;background:#ffffff;">
                    <img src="${appUrl}/logo.png" alt="Alpin Bisiklet" width="160" style="height:auto;display:inline-block;" />
                  </td>
                </tr>

                <!-- Dark hero — solid -->
                <tr>
                  <td style="background:#0f172a;padding:36px 32px;text-align:center;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;">
                      Üyelik Onayı
                    </p>
                    <h1 style="margin:0;color:#f8fafc;font-size:26px;font-weight:700;line-height:1.3;letter-spacing:-0.3px;">
                      Hoş Geldiniz, ${name}
                    </h1>
                    <p style="margin:10px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
                      Hesabınız başarıyla oluşturuldu.
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 32px 0;">
                    <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.7;">
                      Alpin Bisiklet ailesine katıldığınız için teşekkür ederiz.
                      Artık hesabınızla sipariş verebilir, sipariş takibi yapabilir ve
                      size özel kampanyalardan yararlanabilirsiniz.
                    </p>

                    <!-- Avantajlar — bordered cards -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 28px;">
                      <tr>
                        <td width="33%" style="padding:20px 16px;text-align:center;vertical-align:top;border-right:1px solid #e2e8f0;">
                          <p style="margin:0 0 6px;font-size:20px;">&#128666;</p>
                          <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#0f172a;">Ücretsiz Kargo</p>
                          <p style="margin:0;font-size:11px;color:#94a3b8;">500 TL üzeri siparişlerde</p>
                        </td>
                        <td width="33%" style="padding:20px 16px;text-align:center;vertical-align:top;border-right:1px solid #e2e8f0;">
                          <p style="margin:0 0 6px;font-size:20px;">&#128295;</p>
                          <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#0f172a;">Uzman Destek</p>
                          <p style="margin:0;font-size:11px;color:#94a3b8;">Teknik servis garantisi</p>
                        </td>
                        <td width="33%" style="padding:20px 16px;text-align:center;vertical-align:top;">
                          <p style="margin:0 0 6px;font-size:20px;">&#8617;</p>
                          <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#0f172a;">Kolay İade</p>
                          <p style="margin:0;font-size:11px;color:#94a3b8;">30 gün içinde iade</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Products section -->
                ${productsSection}

                <!-- CTA -->
                <tr>
                  <td style="padding:0 32px 36px;text-align:center;">
                    <a href="${appUrl}/urunler"
                      style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;
                             padding:14px 36px;border-radius:6px;text-decoration:none;letter-spacing:0.2px;">
                      Alışverişe Başla
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
                      Hesabınıza <a href="${appUrl}/hesabim" style="color:#16a34a;text-decoration:none;font-weight:600;">hesabım</a> sayfasından ulaşabilirsiniz.
                    </p>
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                      © ${year} Alpin Bisiklet — Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

/* ─────────────────────────────────────────────────────────────
   Periyodik Bülten Maili
   ───────────────────────────────────────────────────────────── */

export interface NewsletterProduct {
  name: string;
  price: number;
  comparePrice: number | null;
  slug: string;
  imageUrl: string | null;
}

export interface NewsletterBlog {
  title: string;
  excerpt: string | null;
  slug: string;
  coverImage: string | null;
}

// ─────────────────────────────────────────────────────────────
// Elden Taksit Mailleri
// ─────────────────────────────────────────────────────────────

export interface EldenTaksitPlanSummary {
  id: number;
  customerName: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  startDate: Date | string;
}

export interface EldenTaksitPaymentSummary {
  installmentNo: number;
  dueDate: Date | string;
  amount: number;
  paidAmount?: number | null;
}

const formatTRY = (amount: number) =>
  amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("tr-TR");

function eldenTaksitEmailWrapper(content: string, year: number) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e2e8f0;">
              <span style="font-size:20px;font-weight:700;color:#0f172a;">Alpin Bisiklet</span>
            </td>
          </tr>
          ${content}
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                © ${year} Alpin Bisiklet — Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEldenTaksitCreatedEmail(
  email: string,
  name: string,
  plan: EldenTaksitPlanSummary,
) {
  const year = new Date().getFullYear();
  const content = `
    <tr>
      <td style="background:#0f172a;padding:32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">Taksit Planı</p>
        <h1 style="margin:0;color:#f8fafc;font-size:24px;font-weight:700;">Taksit Planınız Oluşturuldu</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">Merhaba <strong>${name}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          Elden taksit planınız başarıyla oluşturulmuştur. Aşağıda plan detaylarınızı bulabilirsiniz.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin:0 0 24px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Toplam Tutar</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${formatTRY(plan.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Taksit Sayısı</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0;text-align:right;">${plan.installmentCount} ay</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Aylık Taksit</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#16a34a;border-bottom:1px solid #e2e8f0;text-align:right;">${formatTRY(plan.installmentAmount)}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">İlk Vade Tarihi</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;text-align:right;">${formatDate(plan.startDate)}</td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#94a3b8;">Her ay ödeme yaptığınızda bilgilendirme e-postası alacaksınız.</p>
      </td>
    </tr>`;
  await sendCustomerEmail({
    to: email,
    subject: "Taksit Planınız Oluşturuldu — Alpin Bisiklet",
    html: eldenTaksitEmailWrapper(content, year),
  });
}

export async function sendEldenTaksitPaymentReceivedEmail(
  email: string,
  name: string,
  payment: EldenTaksitPaymentSummary,
  plan: EldenTaksitPlanSummary,
) {
  const year = new Date().getFullYear();
  const totalPaid = (payment.paidAmount ?? payment.amount) + (payment.installmentNo - 1) * plan.installmentAmount;
  const remaining = plan.totalAmount - totalPaid;
  const nextInstallmentNo = payment.installmentNo + 1;
  const content = `
    <tr>
      <td style="background:#0f172a;padding:32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">Ödeme Makbuzu</p>
        <h1 style="margin:0;color:#f8fafc;font-size:24px;font-weight:700;">Ödemeniz Alındı</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">Merhaba <strong>${name}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          ${payment.installmentNo}. taksit ödemeniz alındı. Teşekkür ederiz.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin:0 0 24px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Ödenen Taksit</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0;text-align:right;">${payment.installmentNo}/${plan.installmentCount}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Ödenen Tutar</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#16a34a;border-bottom:1px solid #e2e8f0;text-align:right;">${formatTRY(payment.paidAmount ?? payment.amount)}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Kalan Borç</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:${remaining > 0 ? "#dc2626" : "#16a34a"};border-bottom:1px solid #e2e8f0;text-align:right;">${formatTRY(Math.max(0, remaining))}</td>
          </tr>
          ${nextInstallmentNo <= plan.installmentCount ? `
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">Sonraki Vade</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;text-align:right;">${payment.installmentNo + 1}. taksit</td>
          </tr>` : `
          <tr>
            <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:600;color:#16a34a;text-align:center;">Tüm taksitler tamamlandı!</td>
          </tr>`}
        </table>
      </td>
    </tr>`;
  await sendCustomerEmail({
    to: email,
    subject: "Ödemeniz Alındı — Alpin Bisiklet",
    html: eldenTaksitEmailWrapper(content, year),
  });
}

export async function sendEldenTaksitReminderEmail(
  email: string,
  name: string,
  payment: EldenTaksitPaymentSummary,
  plan: EldenTaksitPlanSummary,
) {
  const year = new Date().getFullYear();
  const paidCount = payment.installmentNo - 1;
  const remainingAmount = plan.totalAmount - paidCount * plan.installmentAmount;
  const content = `
    <tr>
      <td style="background:#92400e;padding:32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#fde68a;">Ödeme Hatırlatması</p>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Taksit Ödeme Hatırlatması</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">Merhaba <strong>${name}</strong>,</p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          ${payment.installmentNo}. taksit ödemenizin vadesi yaklaşmaktadır. Lütfen ödemenizi zamanında gerçekleştirmeyi unutmayın.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin:0 0 24px;">
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Taksit No</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;border-bottom:1px solid #e2e8f0;text-align:right;">${payment.installmentNo}/${plan.installmentCount}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Vade Tarihi</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#dc2626;border-bottom:1px solid #e2e8f0;text-align:right;">${formatDate(payment.dueDate)}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">Taksit Tutarı</td>
            <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #e2e8f0;text-align:right;">${formatTRY(payment.amount)}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">Toplam Kalan</td>
            <td style="padding:12px 16px;font-size:14px;color:#334155;text-align:right;">${formatTRY(Math.max(0, remainingAmount))}</td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#94a3b8;">Ödemenizi yaptıktan sonra mağazamıza bildirmeniz yeterlidir.</p>
      </td>
    </tr>`;
  await sendCustomerEmail({
    to: email,
    subject: "Taksit Ödeme Hatırlatması — Alpin Bisiklet",
    html: eldenTaksitEmailWrapper(content, year),
  });
}

export async function sendNewsletterEmail({
  to,
  name,
  subject,
  headline,
  products,
  latestBlog,
}: {
  to: string;
  name: string;
  subject: string;
  headline: string;
  products: NewsletterProduct[];
  latestBlog: NewsletterBlog | null;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";
  const year = new Date().getFullYear();

  const formatPrice = (p: number) =>
    p.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  const productCards = products
    .map(
      (p) => `
      <td width="33%" style="padding:0 6px;vertical-align:top;">
        <a href="${appUrl}/urunler/${p.slug}" style="text-decoration:none;color:inherit;display:block;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;background:#fff;">
            <tr>
              <td style="padding:0;background:#f8fafc;">
                ${
                  p.imageUrl
                    ? `<img src="${appUrl}${p.imageUrl}" alt="${p.name}" width="180" height="130"
                        style="width:100%;height:130px;object-fit:cover;display:block;" />`
                    : `<div style="height:130px;background:#f1f5f9;"></div>`
                }
              </td>
            </tr>
            <tr>
              <td style="padding:10px 12px 14px;border-top:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#0f172a;line-height:1.4;">
                  ${p.name}
                </p>
                ${
                  p.comparePrice && p.comparePrice > p.price
                    ? `<p style="margin:0 0 1px;font-size:10px;color:#94a3b8;text-decoration:line-through;">${formatPrice(p.comparePrice)}</p>
                       <p style="margin:0;font-size:13px;font-weight:700;color:#16a34a;">${formatPrice(p.price)}</p>`
                    : `<p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">${formatPrice(p.price)}</p>`
                }
              </td>
            </tr>
          </table>
        </a>
      </td>`,
    )
    .join("");

  const blogSection = latestBlog
    ? `
    <tr>
      <td style="padding:0 32px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
          <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
        </table>
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">
          Blog
        </p>
        <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#0f172a;">Son Yazımız</p>
        <a href="${appUrl}/blog/${latestBlog.slug}"
          style="display:block;text-decoration:none;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
          ${
            latestBlog.coverImage
              ? `<img src="${appUrl}${latestBlog.coverImage}" alt="${latestBlog.title}"
                   width="100%" style="width:100%;height:160px;object-fit:cover;display:block;" />`
              : ""
          }
          <div style="padding:18px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0f172a;line-height:1.4;">${latestBlog.title}</p>
            ${latestBlog.excerpt ? `<p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.6;">${latestBlog.excerpt}</p>` : ""}
            <span style="font-size:13px;color:#16a34a;font-weight:600;">Devamını oku &rarr;</span>
          </div>
        </a>
      </td>
    </tr>`
    : "";

  await sendCustomerEmail({
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;max-width:100%;">

                <!-- Logo -->
                <tr>
                  <td style="padding:24px 32px;text-align:center;border-bottom:1px solid #e2e8f0;background:#ffffff;">
                    <img src="${appUrl}/logo.png" alt="Alpin Bisiklet" width="160" style="height:auto;display:inline-block;" />
                  </td>
                </tr>

                <!-- Dark hero — solid -->
                <tr>
                  <td style="background:#0f172a;padding:32px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;">
                      Merhaba, ${name}
                    </p>
                    <h1 style="margin:0 0 20px;color:#f8fafc;font-size:24px;font-weight:700;line-height:1.3;letter-spacing:-0.3px;">
                      ${headline}
                    </h1>
                    <a href="${appUrl}/urunler"
                      style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:600;
                             padding:12px 24px;border-radius:6px;text-decoration:none;">
                      Tüm Ürünleri Gör
                    </a>
                  </td>
                </tr>

                <!-- Products -->
                ${
                  products.length > 0
                    ? `<tr>
                        <td style="padding:28px 32px 24px;">
                          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">
                            Bu Hafta Öne Çıkanlar
                          </p>
                          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">
                            Seçilmiş Ürünler
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>${productCards}</tr>
                          </table>
                        </td>
                       </tr>`
                    : ""
                }

                <!-- Blog -->
                ${blogSection}

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
                      Bu bülten, <strong style="color:#475569;">${to}</strong> adresine gönderildi.
                    </p>
                    <p style="margin:0;font-size:11px;color:#94a3b8;">
                      © ${year} Alpin Bisiklet — Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}
