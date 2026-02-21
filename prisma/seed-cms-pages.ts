import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const pages = [
    {
        title: "Gizlilik Politikası",
        slug: "gizlilik-politikasi",
        metaTitle: "Gizlilik Politikası | Alpin Bisiklet",
        metaDescription: "Alpin Bisiklet kişisel verilerin korunması ve gizlilik politikası hakkında bilgi edinin.",
        content: `
<p>Alpin Bisiklet olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.</p>

<h2>1. Toplanan Bilgiler</h2>
<p>Sitemizi kullandığınızda aşağıdaki bilgiler toplanmaktadır:</p>
<ul>
  <li>Ad, soyad ve iletişim bilgileri (e-posta, telefon)</li>
  <li>Teslimat ve fatura adresi</li>
  <li>Sipariş ve ödeme geçmişi</li>
  <li>Tarayıcı ve cihaz bilgileri (çerezler aracılığıyla)</li>
</ul>

<h2>2. Bilgilerin Kullanımı</h2>
<p>Toplanan bilgiler aşağıdaki amaçlarla kullanılmaktadır:</p>
<ul>
  <li>Siparişlerinizi işlemek ve teslim etmek</li>
  <li>Müşteri hizmetleri sağlamak</li>
  <li>Yasal yükümlülüklerimizi yerine getirmek</li>
  <li>Hizmet kalitesini iyileştirmek</li>
</ul>

<h2>3. Bilgi Güvenliği</h2>
<p>Kişisel verileriniz 256-bit SSL sertifikası ile korunmaktadır. Ödeme bilgileriniz hiçbir şekilde sunucularımızda saklanmaz; güvenli ödeme altyapısı üzerinden işlenir.</p>

<h2>4. Çerezler</h2>
<p>Web sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Oturum çerezleri, tercih çerezleri ve analitik çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi değiştirebilirsiniz.</p>

<h2>5. Üçüncü Taraflar</h2>
<p>Kişisel verileriniz; yasal zorunluluklar, kargo ve lojistik iş ortakları ile ödeme aracı kuruluşları dışında üçüncü taraflarla paylaşılmaz.</p>

<h2>6. Haklarınız</h2>
<p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
<ul>
  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
  <li>Verilerinize erişim talep etme</li>
  <li>Hatalı verilerin düzeltilmesini isteme</li>
  <li>Verilerin silinmesini talep etme</li>
  <li>İşlemeye itiraz etme</li>
</ul>

<p>Haklarınızı kullanmak veya politikamız hakkında sorularınız için <strong>info@alpinbisiklet.com</strong> adresinden bize ulaşabilirsiniz.</p>
`.trim(),
    },
    {
        title: "İade ve Değişim Koşulları",
        slug: "iade-kosullari",
        metaTitle: "İade ve Değişim Koşulları | Alpin Bisiklet",
        metaDescription: "Alpin Bisiklet iade ve değişim koşulları, süreçleri ve haklarınız hakkında bilgi edinin.",
        content: `
<p>Alpin Bisiklet'ten satın aldığınız ürünleri aşağıdaki koşullar dahilinde iade veya değiştirme hakkına sahipsiniz. Müşteri memnuniyeti bizim için her şeyden önce gelir.</p>

<h2>1. İade Süresi</h2>
<p>Ürünlerinizi teslim aldığınız tarihten itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz. Bu süre, Tüketicinin Korunması Hakkında Kanun kapsamında tanınan cayma hakkı süresidir.</p>

<h2>2. İade Koşulları</h2>
<ul>
  <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır.</li>
  <li>Ürün etiketi ve barkodu çıkarılmamış olmalıdır.</li>
  <li>Fatura veya e-fatura ibraz edilmelidir.</li>
  <li>Kişiye özel üretilen veya kişiselleştirilen ürünlerde iade kabul edilmez.</li>
  <li>Hijyen ürünlerinde (kask iç astarı, şort vb.) iade yapılamamaktadır.</li>
</ul>

<h2>3. İade Süreci</h2>
<ol>
  <li>Hesabınızdan veya müşteri hizmetlerimizden iade talebi oluşturun.</li>
  <li>Ürünü orijinal ambalajında, faturasıyla birlikte kargoya verin.</li>
  <li>İade kargo ücreti tarafımızca karşılanır.</li>
  <li>Ürün bize ulaştıktan sonra incelenir ve <strong>5 iş günü</strong> içinde ödemeniz iade edilir.</li>
</ol>

<h2>4. Değişim</h2>
<p>Farklı beden, renk veya model için değişim talebinde bulunabilirsiniz. Değişim talebiniz ürün bize ulaştıktan sonra işleme alınır. Stok durumuna göre değişim ürünü gönderilir veya ödeme iadesi yapılır.</p>

<h2>5. Hasarlı veya Hatalı Ürün</h2>
<p>Kargo sırasında hasar görmüş veya hatalı ürünler için:</p>
<ul>
  <li>Teslim sırasında paket kontrolü yapmanızı öneririz.</li>
  <li>Hasarlı paket için kargo görevlisiyle tutanak tutulmasını talep edin.</li>
  <li>Durumu <strong>3 gün</strong> içinde fotoğraflı olarak bildirmenizi rica ederiz.</li>
</ul>

<p>Sorularınız için: <strong>0850 123 45 67</strong> veya <strong>info@alpinbisiklet.com</strong></p>
`.trim(),
    },
    {
        title: "Kargo Bilgileri",
        slug: "kargo-bilgileri",
        metaTitle: "Kargo Bilgileri ve Teslimat | Alpin Bisiklet",
        metaDescription: "Alpin Bisiklet kargo ücretleri, teslimat süreleri ve kargo takip bilgileri.",
        content: `
<p>Alpin Bisiklet olarak siparişlerinizi en hızlı ve güvenli şekilde ulaştırmayı hedefliyoruz. Tüm kargolarımız sigortalı olarak gönderilmektedir.</p>

<h2>1. Kargo Ücreti</h2>
<ul>
  <li><strong>500 TL ve üzeri</strong> siparişlerde kargo tamamen ücretsizdir.</li>
  <li>500 TL altı siparişlerde kargo ücreti <strong>50 TL</strong>'dir.</li>
  <li>Bisiklet siparişlerinde kargo ücretsizdir (tüm tutarlarda).</li>
</ul>

<h2>2. Teslimat Süresi</h2>
<ul>
  <li>Stokta bulunan ürünler <strong>1-3 iş günü</strong> içinde kargoya verilir.</li>
  <li>Kargo teslimat süresi <strong>1-3 iş günüdür</strong> (bölgeye göre değişiklik gösterebilir).</li>
  <li>Toplam teslimat süresi ortalama <strong>2-5 iş günüdür</strong>.</li>
  <li>Cumartesi siparişleri Pazartesi işleme alınır.</li>
</ul>

<h2>3. Kargo Takip</h2>
<p>Siparişiniz kargoya verildiğinde:</p>
<ul>
  <li>Kargo takip numarası SMS ve e-posta ile bildirilir.</li>
  <li><strong>Hesabım &gt; Siparişlerim</strong> bölümünden sipariş durumunuzu anlık takip edebilirsiniz.</li>
</ul>

<h2>4. Teslimat Koşulları</h2>
<ul>
  <li>Teslimat belirtilen adrese yapılır. Adresinizde kimse yoksa kapıya not bırakılır.</li>
  <li>Teslimat sırasında paketi kontrol etmenizi öneririz.</li>
  <li>Hasarlı paket için kargo görevlisiyle tutanak tutulmasını talep edin.</li>
</ul>

<h2>5. Bisiklet Teslimatı</h2>
<p>Bisikletler için özel teslimat koşulları uygulanmaktadır:</p>
<ul>
  <li>Bisikletler özel koruyucu ambalajla, sigortalı olarak gönderilir.</li>
  <li><strong>%90 montajlı</strong> olarak teslim edilir, son ayarlar için kurulum kılavuzu paket içindedir.</li>
  <li>İstanbul içi siparişlerde ücretsiz evde montaj hizmeti sunulmaktadır.</li>
</ul>

<h2>6. Mağazadan Teslim</h2>
<p>Siparişinizi mağazamızdan teslim almak isterseniz, sipariş sırasında "Mağazadan Teslim" seçeneğini seçebilirsiniz. Mağazadan teslim alınan bisikletler <strong>%100 montajlı</strong> olarak teslim edilir.</p>
`.trim(),
    },
    {
        title: "Mesafeli Satış Sözleşmesi",
        slug: "mesafeli-satis-sozlesmesi",
        metaTitle: "Mesafeli Satış Sözleşmesi | Alpin Bisiklet",
        metaDescription: "Alpin Bisiklet mesafeli satış sözleşmesi metni ve tüketici hakları.",
        content: `
<h2>1. TARAFLAR</h2>
<p><strong>SATICI:</strong> Alpin Bisiklet<br>
Adres: Örnek Mah. Bisiklet Cad. No:123, Kadıköy / İstanbul<br>
Tel: 0850 123 45 67<br>
E-posta: info@alpinbisiklet.com</p>

<p><strong>ALICI:</strong> Sipariş sahibi üye (ad, adres ve iletişim bilgileri sipariş formunda yer almaktadır)</p>

<h2>2. KONU</h2>
<p>İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait web sitesinden elektronik ortamda siparişini verdiği ürünlerin satışı ve teslimi ile ilgili olarak <strong>6502 sayılı Tüketicinin Korunması Hakkında Kanun</strong> ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

<h2>3. SÖZLEŞME KONUSU ÜRÜN BİLGİLERİ</h2>
<p>Ürünün temel nitelikleri, sipariş özeti sayfasında ve ürün detay sayfasında belirtilmiştir. Listelenen tüm ürün fiyatları KDV dahildir.</p>

<h2>4. GENEL HÜKÜMLER</h2>
<p>ALICI, SATICI'ya ait web sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimat ve kargo ücretine ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.</p>

<h2>5. TESLİMAT</h2>
<p>Ürün, ALICI'nın sipariş formunda belirttiği adrese teslim edilecektir. Teslimat süresi, ödeme onayından itibaren <strong>30 günü</strong> geçmeyecektir. Olağanüstü durumlarda bu süre uzayabilir; bu durumda ALICI bilgilendirilir.</p>

<h2>6. CAYMA HAKKI</h2>
<p>ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkını kullanabilir. Cayma hakkı bildiriminin yazılı olarak yapılması tavsiye edilir.</p>

<h2>7. İADE KOŞULLARI</h2>
<p>Cayma hakkının kullanılması halinde:</p>
<ul>
  <li>Ürünün ambalajının açılmamış, bozulmamış ve kullanılmamış olması gerekmektedir.</li>
  <li>İade kargo ücreti SATICI tarafından karşılanır.</li>
  <li>Ödeme iadesi, ürünün teslim alınmasından itibaren 14 gün içinde yapılır.</li>
</ul>

<h2>8. UYUŞMAZLIK</h2>
<p>İşbu sözleşmeden doğan uyuşmazlıklarda öncelikle Tüketici Hakem Heyetleri'ne başvurulabilir. Yasal sınırın üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.</p>

<p>Bu sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.</p>
`.trim(),
    },
];

async function main() {
    console.log("CMS sayfaları ekleniyor...\n");

    for (const page of pages) {
        const existing = await prisma.page.findUnique({ where: { slug: page.slug } });

        if (existing) {
            await prisma.page.update({
                where: { slug: page.slug },
                data: {
                    title: page.title,
                    content: page.content,
                    metaTitle: page.metaTitle,
                    metaDescription: page.metaDescription,
                    isPublished: true,
                },
            });
            console.log(`✓ Güncellendi: ${page.title} (/${page.slug})`);
        } else {
            await prisma.page.create({
                data: {
                    title: page.title,
                    slug: page.slug,
                    content: page.content,
                    metaTitle: page.metaTitle,
                    metaDescription: page.metaDescription,
                    isPublished: true,
                },
            });
            console.log(`✓ Oluşturuldu: ${page.title} (/${page.slug})`);
        }
    }

    console.log("\n✅ Tüm CMS sayfaları başarıyla eklendi.");
    console.log("\nSayfalar artık şu adreslerde yayında:");
    for (const page of pages) {
        console.log(`   → /${page.slug}`);
    }
}

main()
    .catch((e) => {
        console.error("Hata:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
