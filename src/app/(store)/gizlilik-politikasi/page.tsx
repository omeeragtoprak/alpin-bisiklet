"use client";

import { CMSPage } from "@/components/store/cms-page";

export default function PrivacyPolicyPage() {
    return (
        <CMSPage
            slug="gizlilik-politikasi"
            title="Gizlilik Politikası"
            fallbackContent={`Alpin Bisiklet olarak kişisel verilerinizin korunmasına büyük önem veriyoruz.

1. Toplanan Bilgiler
Sitemizi kullandığınızda adınız, e-posta adresiniz, telefon numaranız, teslimat adresiniz ve ödeme bilgileriniz toplanmaktadır.

2. Bilgilerin Kullanımı
Toplanan bilgiler siparişlerinizi işlemek, size daha iyi hizmet sunmak ve yasal yükümlülüklerimizi yerine getirmek amacıyla kullanılmaktadır.

3. Bilgi Güvenliği
Kişisel verileriniz SSL sertifikası ile korunmaktadır. Ödeme bilgileriniz hiçbir şekilde sunucularımızda saklanmaz.

4. Çerezler
Web sitemiz, deneyiminizi iyileştirmek için çerezler kullanmaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi değiştirebilirsiniz.

5. Üçüncü Taraflar
Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.

6. Haklarınız
6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinize erişme, düzeltme ve silme hakkına sahipsiniz.

Bu politika hakkında sorularınız için info@alpinbisiklet.com adresinden bize ulaşabilirsiniz.`}
        />
    );
}
