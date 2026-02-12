"use client";

import { CMSPage } from "@/components/store/cms-page";

export default function ShippingInfoPage() {
    return (
        <CMSPage
            slug="kargo-bilgileri"
            title="Kargo Bilgileri"
            fallbackContent={`Alpin Bisiklet olarak siparişlerinizi en hızlı ve güvenli şekilde ulaştırmayı hedefliyoruz.

1. Kargo Ücreti
- 500 TL ve üzeri siparişlerde kargo ücretsizdir.
- 500 TL altı siparişlerde kargo ücreti 50 TL'dir.

2. Teslimat Süresi
- Stokta bulunan ürünler 1-3 iş günü içinde kargoya verilir.
- Kargo teslimat süresi 1-3 iş günüdür (bölgeye göre değişiklik gösterebilir).
- Toplam teslimat süresi ortalama 2-5 iş günüdür.

3. Kargo Takip
- Siparişiniz kargoya verildiğinde kargo takip numarası SMS ve e-posta ile bildirilir.
- Hesabım > Siparişlerim bölümünden sipariş durumunuzu takip edebilirsiniz.

4. Teslimat
- Kargo teslimatı adrese yapılır.
- Teslimat sırasında paket kontrolü yapmanızı öneririz.
- Hasarlı paket için tutanak tutulmasını talep edin.

5. Bisiklet Teslimatı
- Bisikletler özel koruyucu ambalajla gönderilir.
- %90 montajlı olarak teslim edilir.
- Kurulum kılavuzu paket içinde bulunur.

6. Mağazadan Teslim
- Siparişinizi mağazamızdan da teslim alabilirsiniz.
- Mağazadan teslim alınan bisikletler %100 montajlı olarak teslim edilir.`}
        />
    );
}
