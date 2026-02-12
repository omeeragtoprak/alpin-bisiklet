"use client";

import { CMSPage } from "@/components/store/cms-page";

export default function ReturnPolicyPage() {
    return (
        <CMSPage
            slug="iade-kosullari"
            title="İade ve Değişim Koşulları"
            fallbackContent={`Alpin Bisiklet'ten satın aldığınız ürünleri aşağıdaki koşullar dahilinde iade edebilirsiniz.

1. İade Süresi
Ürünlerinizi teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz.

2. İade Koşulları
- Ürün kullanılmamış ve orijinal ambalajında olmalıdır.
- Ürün etiketi çıkarılmamış olmalıdır.
- Fatura veya e-fatura ibraz edilmelidir.
- Kişiye özel üretilen ürünlerde iade kabul edilmez.

3. İade Süreci
- Hesabınızdan veya müşteri hizmetlerimizden iade talebi oluşturun.
- Ürünü orijinal ambalajında, faturasıyla birlikte kargoya verin.
- İade kargo ücreti tarafımızca karşılanır.
- Ürün bize ulaştıktan sonra kontrol edilir ve 5 iş günü içinde ödemeniz iade edilir.

4. Değişim
Farklı beden veya renk için değişim talebinde bulunabilirsiniz. Değişim ürünü stoklarda mevcutsa gönderilir.

5. Hasarlı Ürün
Kargo sırasında hasar görmüş ürünler için tutanak tutulmasını ve 3 gün içinde bizimle iletişime geçilmesini rica ederiz.

Sorularınız için: 0850 123 45 67 veya info@alpinbisiklet.com`}
        />
    );
}
