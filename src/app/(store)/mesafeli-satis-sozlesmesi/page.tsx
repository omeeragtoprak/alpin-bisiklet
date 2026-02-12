"use client";

import { CMSPage } from "@/components/store/cms-page";

export default function DistanceSalesAgreementPage() {
    return (
        <CMSPage
            slug="mesafeli-satis-sozlesmesi"
            title="Mesafeli Satış Sözleşmesi"
            fallbackContent={`MESAFELİ SATIŞ SÖZLEŞMESİ

1. TARAFLAR
SATICI: Alpin Bisiklet
Adres: Örnek Mah. Bisiklet Cad. No:123, Kadıköy / İstanbul
Tel: 0850 123 45 67
E-posta: info@alpinbisiklet.com

ALICI: Sipariş sahibi üye

2. KONU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait web sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.

3. SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ
Ürünün temel nitelikleri sipariş sayfasında ve ürün detay sayfasında belirtilmiştir. Ürün fiyatları KDV dahildir.

4. GENEL HÜKÜMLER
ALICI, SATICI'ya ait web sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat ve kargo ücretine ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.

5. TESLİMAT
Ürün, ALICI'nın sipariş formunda belirttiği adrese teslim edilecektir. Teslimat süresi, ödeme onayından itibaren 30 günü geçmeyecektir.

6. CAYMA HAKKI
ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir.

7. İADE KOŞULLARI
Cayma hakkının kullanılması halinde ürünün ambalajının açılmamış, bozulmamış ve kullanılmamış olması gerekmektedir.

8. UYUŞMAZLIK
İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.

Bu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.`}
        />
    );
}
