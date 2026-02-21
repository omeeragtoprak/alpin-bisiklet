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

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "Alpin Bisiklet'e Hoş Geldiniz!",
    html: `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#111827;padding:24px 32px;text-align:center;">
                    <span style="color:#fff;font-size:20px;font-weight:700;">Alpin Bisiklet</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="margin:0 0 12px;color:#111827;">Hoş Geldiniz, ${name}!</h2>
                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                      Alpin Bisiklet ailesine katıldığınız için teşekkürler. Hesabınız başarıyla oluşturuldu.
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
