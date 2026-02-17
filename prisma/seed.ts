import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
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

async function main() {
	console.log("Seeding database...");

	// Clean existing data
	await prisma.productImage.deleteMany();
	await prisma.productAttribute.deleteMany();
	await prisma.productVariant.deleteMany();
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.brand.deleteMany();

	console.log("Cleaned existing data.");

	// ==========================================
	// BRANDS
	// ==========================================
	const brands = await Promise.all(
		[
			{ name: "Trek", description: "Amerikan bisiklet markası, 1976'dan beri kaliteli bisikletler üretiyor." },
			{ name: "Specialized", description: "Yüksek performanslı bisikletler ve ekipmanlar." },
			{ name: "Giant", description: "Dünyanın en büyük bisiklet üreticisi." },
			{ name: "Cannondale", description: "Yenilikçi tasarımlarıyla öne çıkan Amerikan markası." },
			{ name: "Scott", description: "İsviçre menşeli spor ekipmanları markası." },
			{ name: "Bianchi", description: "1885'ten beri İtalyan bisiklet geleneği." },
			{ name: "Merida", description: "Tayvan merkezli global bisiklet markası." },
			{ name: "Cube", description: "Alman mühendisliği ile üretilen bisikletler." },
			{ name: "Kona", description: "Kanada'dan macera ve dağ bisikletleri." },
			{ name: "GT", description: "BMX ve dağ bisikletlerinde dünya lideri." },
		].map((b) =>
			prisma.brand.create({
				data: { ...b, slug: slugify(b.name), isActive: true },
			}),
		),
	);
	console.log(`Created ${brands.length} brands.`);

	const brandMap = Object.fromEntries(brands.map((b) => [b.name, b.id]));

	// ==========================================
	// CATEGORIES
	// ==========================================
	const parentCategories = await Promise.all(
		[
			{ name: "Dağ Bisikleti", description: "Off-road ve arazi bisikletleri", order: 1, image: "https://picsum.photos/seed/cat-mountain/800/600" },
			{ name: "Yol Bisikleti", description: "Asfalt ve uzun mesafe bisikletleri", order: 2, image: "https://picsum.photos/seed/cat-road/800/600" },
			{ name: "Şehir Bisikleti", description: "Günlük ulaşım ve şehir içi bisikletler", order: 3, image: "https://picsum.photos/seed/cat-city/800/600" },
			{ name: "Elektrikli Bisiklet", description: "Motor destekli elektrikli bisikletler", order: 4, image: "https://picsum.photos/seed/cat-electric/800/600" },
			{ name: "Çocuk Bisikleti", description: "Çocuklar için güvenli bisikletler", order: 5, image: "https://picsum.photos/seed/cat-kids/800/600" },
			{ name: "Aksesuar", description: "Bisiklet aksesuarları ve ekipmanları", order: 6, image: "https://picsum.photos/seed/cat-accessory/800/600" },
			{ name: "Yedek Parça", description: "Bisiklet yedek parçaları ve bileşenleri", order: 7, image: "https://picsum.photos/seed/cat-parts/800/600" },
		].map((c) =>
			prisma.category.create({
				data: { ...c, slug: slugify(c.name), isActive: true },
			}),
		),
	);
	console.log(`Created ${parentCategories.length} parent categories.`);

	const catMap = Object.fromEntries(parentCategories.map((c) => [c.name, c.id]));

	// Sub-categories
	const subCategories = await Promise.all(
		[
			{ name: "Cross Country", parentId: catMap["Dağ Bisikleti"], description: "Hafif ve hızlı dağ bisikletleri", order: 1 },
			{ name: "Trail", parentId: catMap["Dağ Bisikleti"], description: "Çok yönlü patika bisikletleri", order: 2 },
			{ name: "Enduro", parentId: catMap["Dağ Bisikleti"], description: "Agresif iniş odaklı bisikletler", order: 3 },
			{ name: "Kask", parentId: catMap["Aksesuar"], description: "Bisiklet kaskları", order: 1 },
			{ name: "Aydınlatma", parentId: catMap["Aksesuar"], description: "Bisiklet ışıkları ve farlar", order: 2 },
		].map((c) =>
			prisma.category.create({
				data: { ...c, slug: slugify(c.name), isActive: true },
			}),
		),
	);
	console.log(`Created ${subCategories.length} sub-categories.`);

	const subCatMap = Object.fromEntries(subCategories.map((c) => [c.name, c.id]));

	// ==========================================
	// PRODUCTS
	// ==========================================
	const products = [
		// === DAĞ BİSİKLETİ (8) ===
		{
			name: "Trek Marlin 7",
			description: "Trek Marlin 7, zorlu arazilerde bile güvenle sürebileceğiniz dayanıklı bir dağ bisikletidir. Shimano Deore vites grubu ve hidrolik disk frenler ile donatılmıştır.",
			price: 32999,
			comparePrice: 38999,
			stock: 15,
			categoryId: catMap["Dağ Bisikleti"],
			brandId: brandMap["Trek"],
			isFeatured: true,
			isNew: false,
			sku: "TRK-MRL7-001",
		},
		{
			name: "Specialized Rockhopper Expert",
			description: "Rockhopper Expert, cross country yarışlarından teknik patikalara kadar her yerde parlayan bir performans makinesidir. 29 jant ve 120mm süspansiyon.",
			price: 45999,
			comparePrice: null,
			stock: 8,
			categoryId: subCatMap["Cross Country"],
			brandId: brandMap["Specialized"],
			isFeatured: true,
			isNew: true,
			sku: "SPC-RCK-001",
		},
		{
			name: "Giant Talon 1",
			description: "Giant Talon 1, hafif ALUXX alüminyum kadrosu ve Shimano Deore 11 vites ile mükemmel tırmanış performansı sunar.",
			price: 27499,
			comparePrice: 31999,
			stock: 22,
			categoryId: catMap["Dağ Bisikleti"],
			brandId: brandMap["Giant"],
			isFeatured: false,
			isNew: false,
			sku: "GNT-TLN1-001",
		},
		{
			name: "Scott Spark 960",
			description: "Scott Spark 960, full suspension tasarımı ile hem tırmanışta hem inişte üstün performans sergiler. TwinLoc süspansiyon kontrol sistemi.",
			price: 68999,
			comparePrice: null,
			stock: 5,
			categoryId: subCatMap["Trail"],
			brandId: brandMap["Scott"],
			isFeatured: true,
			isNew: true,
			sku: "SCT-SPR960-001",
		},
		{
			name: "Cannondale Trail SE 4",
			description: "Cannondale Trail SE 4, SmartForm C2 alüminyum kadro ile hafiflik ve dayanıklılığı bir arada sunar. MicroShift 1x9 vites.",
			price: 22999,
			comparePrice: 26999,
			stock: 18,
			categoryId: catMap["Dağ Bisikleti"],
			brandId: brandMap["Cannondale"],
			isFeatured: false,
			isNew: false,
			sku: "CND-TRL4-001",
		},
		{
			name: "Merida Big Nine 300",
			description: "Merida Big Nine 300, 29 jant büyük tekerlekleri ile hız ve stabiliteyi birleştirir. Shimano Deore 2x10 vites sistemi.",
			price: 29999,
			comparePrice: null,
			stock: 12,
			categoryId: catMap["Dağ Bisikleti"],
			brandId: brandMap["Merida"],
			isFeatured: false,
			isNew: true,
			sku: "MRD-BN300-001",
		},
		{
			name: "Cube Stereo 120 HPC",
			description: "Cube Stereo 120, karbon kadrosu ile yarış seviyesinde hafiflik sunan trail bisiklettir. Fox süspansiyon ve SRAM Eagle vites.",
			price: 89999,
			comparePrice: 99999,
			stock: 3,
			categoryId: subCatMap["Trail"],
			brandId: brandMap["Cube"],
			isFeatured: true,
			isNew: true,
			sku: "CUB-STR120-001",
		},
		{
			name: "Kona Process 153 DL",
			description: "Kona Process 153, enduro yarışları için tasarlanmış agresif geometriye sahip bir performans bisikletidir. 160mm süspansiyon.",
			price: 75999,
			comparePrice: null,
			stock: 4,
			categoryId: subCatMap["Enduro"],
			brandId: brandMap["Kona"],
			isFeatured: false,
			isNew: true,
			sku: "KNA-PRC153-001",
		},

		// === YOL BİSİKLETİ (7) ===
		{
			name: "Trek Domane SL 5",
			description: "Trek Domane SL 5, uzun mesafe konforunu ve yarış performansını mükemmel şekilde dengeler. IsoSpeed teknolojisi ile titreşim emilimi.",
			price: 79999,
			comparePrice: 89999,
			stock: 6,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Trek"],
			isFeatured: true,
			isNew: false,
			sku: "TRK-DMN5-001",
		},
		{
			name: "Specialized Allez Sprint",
			description: "Specialized Allez Sprint, alüminyum kadro segmentinin en hızlı bisikletidir. Aero tasarım ve Shimano 105 vites grubu.",
			price: 42999,
			comparePrice: null,
			stock: 10,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Specialized"],
			isFeatured: true,
			isNew: false,
			sku: "SPC-ALZ-001",
		},
		{
			name: "Giant Defy Advanced 2",
			description: "Giant Defy Advanced 2, Advanced-Grade kompozit karbon kadrosu ile uzun mesafe konforunda sınıf lideridir.",
			price: 64999,
			comparePrice: 72999,
			stock: 7,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Giant"],
			isFeatured: false,
			isNew: true,
			sku: "GNT-DFY2-001",
		},
		{
			name: "Bianchi Oltre RC",
			description: "Bianchi Oltre RC, İtalyan tasarımının zirvesi. Tam karbon kadro, Shimano Ultegra Di2 elektronik vites ve aerodinamik profil.",
			price: 159999,
			comparePrice: null,
			stock: 2,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Bianchi"],
			isFeatured: true,
			isNew: true,
			sku: "BNC-OLT-001",
		},
		{
			name: "Cannondale CAAD13 Disc",
			description: "Cannondale CAAD13, alüminyum yol bisikletlerinin referans noktası. SmartSense entegre güvenlik sistemi.",
			price: 38999,
			comparePrice: 44999,
			stock: 9,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Cannondale"],
			isFeatured: false,
			isNew: false,
			sku: "CND-CAD13-001",
		},
		{
			name: "Scott Addict RC 30",
			description: "Scott Addict RC 30, sadece 7.3 kg ağırlığıyla tırmanış odaklı bir yarış bisikletidir. HMX karbon kadro.",
			price: 94999,
			comparePrice: null,
			stock: 4,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Scott"],
			isFeatured: false,
			isNew: false,
			sku: "SCT-ADC30-001",
		},
		{
			name: "Merida Scultura 4000",
			description: "Merida Scultura 4000, CF2 karbon kadrosu ile yarış performansını uygun fiyata sunar. Shimano 105 R7000 vites grubu.",
			price: 52999,
			comparePrice: 59999,
			stock: 11,
			categoryId: catMap["Yol Bisikleti"],
			brandId: brandMap["Merida"],
			isFeatured: false,
			isNew: false,
			sku: "MRD-SCL4K-001",
		},

		// === ŞEHİR BİSİKLETİ (6) ===
		{
			name: "Trek FX 3 Disc",
			description: "Trek FX 3, şehir içi ulaşım için ideal bir fitness bisikletidir. Karbon çatal, hidrolik disk fren ve Shimano Alivio vites.",
			price: 19999,
			comparePrice: 23999,
			stock: 20,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Trek"],
			isFeatured: true,
			isNew: false,
			sku: "TRK-FX3-001",
		},
		{
			name: "Giant Escape 2 City Disc",
			description: "Giant Escape 2, günlük ulaşım ve hafta sonu turları için tasarlanmış çok yönlü bir şehir bisikletidir.",
			price: 14999,
			comparePrice: null,
			stock: 25,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Giant"],
			isFeatured: false,
			isNew: false,
			sku: "GNT-ESC2-001",
		},
		{
			name: "Specialized Sirrus X 4.0",
			description: "Specialized Sirrus X 4.0, şehirden toprak yollara geçiş yapabilen macera odaklı fitness bisikletidir. Future Shock süspansiyon.",
			price: 34999,
			comparePrice: 39999,
			stock: 8,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Specialized"],
			isFeatured: false,
			isNew: true,
			sku: "SPC-SRX4-001",
		},
		{
			name: "Bianchi C-Sport Cross",
			description: "Bianchi C-Sport Cross, İtalyan elegansı ile şehir kullanımını birleştiren şık bir bisiklettir. Celeste renk seçeneği.",
			price: 22499,
			comparePrice: null,
			stock: 14,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Bianchi"],
			isFeatured: false,
			isNew: false,
			sku: "BNC-CSP-001",
		},
		{
			name: "Cube Hyde Pro",
			description: "Cube Hyde Pro, şık tasarımı ve Gates karbon kayış sistemiyle bakım gerektirmeyen bir şehir bisikletidir.",
			price: 27999,
			comparePrice: 32999,
			stock: 6,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Cube"],
			isFeatured: false,
			isNew: true,
			sku: "CUB-HYD-001",
		},
		{
			name: "Cannondale Quick 4",
			description: "Cannondale Quick 4, hafif alüminyum kadrosu ile hızlı şehir içi ulaşım sağlar. Fitness ve commute için ideal.",
			price: 16999,
			comparePrice: null,
			stock: 18,
			categoryId: catMap["Şehir Bisikleti"],
			brandId: brandMap["Cannondale"],
			isFeatured: false,
			isNew: false,
			sku: "CND-QCK4-001",
		},

		// === ELEKTRİKLİ BİSİKLET (6) ===
		{
			name: "Trek Powerfly FS 5",
			description: "Trek Powerfly FS 5, Bosch Performance CX motoru ile dağlarda sınırsız macera sunar. 625Wh batarya ile 120km menzil.",
			price: 124999,
			comparePrice: 139999,
			stock: 4,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Trek"],
			isFeatured: true,
			isNew: true,
			sku: "TRK-PWR5-001",
		},
		{
			name: "Specialized Turbo Vado 4.0",
			description: "Specialized Turbo Vado 4.0, şehir içi e-bisiklet segmentinin en akıllı modeli. Turbo Connect Display ve Mission Control uygulaması.",
			price: 89999,
			comparePrice: null,
			stock: 6,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Specialized"],
			isFeatured: true,
			isNew: false,
			sku: "SPC-TVD4-001",
		},
		{
			name: "Giant Explore E+ 1 Pro",
			description: "Giant Explore E+, SyncDrive Pro motoru ile güçlü pedal desteği sunan tur e-bisikletidir. EnergyPak 500Wh batarya.",
			price: 79999,
			comparePrice: 89999,
			stock: 7,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Giant"],
			isFeatured: false,
			isNew: false,
			sku: "GNT-EXP1-001",
		},
		{
			name: "Cube Reaction Hybrid Pro 625",
			description: "Cube Reaction Hybrid Pro, Bosch CX motoru ve 625Wh batarya ile dağ bisikleti deneyimini elektrikli olarak yaşatır.",
			price: 99999,
			comparePrice: null,
			stock: 5,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Cube"],
			isFeatured: false,
			isNew: true,
			sku: "CUB-RHP625-001",
		},
		{
			name: "Merida eBig Nine 600",
			description: "Merida eBig Nine 600, Shimano EP6 motoru ile doğal sürüş hissi veren elektrikli dağ bisikletidir.",
			price: 69999,
			comparePrice: 79999,
			stock: 9,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Merida"],
			isFeatured: false,
			isNew: false,
			sku: "MRD-EB600-001",
		},
		{
			name: "Scott Strike eRide 930",
			description: "Scott Strike eRide 930, Bosch Performance Line motoru ve kompakt batarya ile zarif bir e-MTB deneyimi sunar.",
			price: 109999,
			comparePrice: null,
			stock: 3,
			categoryId: catMap["Elektrikli Bisiklet"],
			brandId: brandMap["Scott"],
			isFeatured: false,
			isNew: false,
			sku: "SCT-STR930-001",
		},

		// === ÇOCUK BİSİKLETİ (5) ===
		{
			name: "Trek Precaliber 20",
			description: "Trek Precaliber 20, 6-8 yaş arası çocuklar için tasarlanmış hafif ve güvenli bir bisiklettir. Alüminyum kadro.",
			price: 7999,
			comparePrice: 9499,
			stock: 30,
			categoryId: catMap["Çocuk Bisikleti"],
			brandId: brandMap["Trek"],
			isFeatured: false,
			isNew: false,
			sku: "TRK-PRC20-001",
		},
		{
			name: "Giant ARX 24",
			description: "Giant ARX 24, büyüyen çocuklar için ALUXX-Grade alüminyum kadro ile hafif ve dayanıklı bir bisiklet. 8-11 yaş arası.",
			price: 9499,
			comparePrice: null,
			stock: 20,
			categoryId: catMap["Çocuk Bisikleti"],
			brandId: brandMap["Giant"],
			isFeatured: false,
			isNew: true,
			sku: "GNT-ARX24-001",
		},
		{
			name: "Scott Scale 24 Disc",
			description: "Scott Scale 24 Disc, küçük yarışçılar için gerçek dağ bisikleti deneyimi sunar. Shimano vites ve disk fren.",
			price: 12999,
			comparePrice: 14999,
			stock: 15,
			categoryId: catMap["Çocuk Bisikleti"],
			brandId: brandMap["Scott"],
			isFeatured: false,
			isNew: false,
			sku: "SCT-SCL24-001",
		},
		{
			name: "Specialized Jett 20",
			description: "Specialized Jett 20, çocukların ilk büyük bisiklet macerası için tasarlanmıştır. Ayarlanabilir kadro boyutu.",
			price: 8499,
			comparePrice: null,
			stock: 25,
			categoryId: catMap["Çocuk Bisikleti"],
			brandId: brandMap["Specialized"],
			isFeatured: false,
			isNew: false,
			sku: "SPC-JET20-001",
		},
		{
			name: "Cube Cubie 160 RT",
			description: "Cube Cubie 160, 4-6 yaş arası çocuklar için ilk bisiklet deneyimi. Geri tepme freni ve eğitim tekerlekleri dahil.",
			price: 5999,
			comparePrice: 6999,
			stock: 35,
			categoryId: catMap["Çocuk Bisikleti"],
			brandId: brandMap["Cube"],
			isFeatured: false,
			isNew: false,
			sku: "CUB-CUB160-001",
		},

		// === AKSESUAR (8) ===
		{
			name: "Giro Aether MIPS Kask",
			description: "Giro Aether MIPS, profesyonel seviye yol bisikleti kaskı. MIPS teknolojisi ile üstün darbe koruması. Hafif ve havalandırmalı.",
			price: 4999,
			comparePrice: 5999,
			stock: 40,
			categoryId: subCatMap["Kask"],
			brandId: null,
			isFeatured: false,
			isNew: true,
			sku: "ACC-GIRO-001",
		},
		{
			name: "Fox Speedframe Pro Kask",
			description: "Fox Speedframe Pro, dağ bisikleti için tasarlanmış MIPS korumalı enduro kaskı. Geniş vizör ve güçlü havalandırma.",
			price: 3499,
			comparePrice: null,
			stock: 30,
			categoryId: subCatMap["Kask"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "ACC-FOX-001",
		},
		{
			name: "Lezyne Mega Drive 1800i",
			description: "Lezyne Mega Drive 1800i, 1800 lümen gücünde şarj edilebilir ön far. Gece sürüşleri için mükemmel aydınlatma.",
			price: 2799,
			comparePrice: 3299,
			stock: 50,
			categoryId: subCatMap["Aydınlatma"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "ACC-LZN-001",
		},
		{
			name: "Knog Blinder 900",
			description: "Knog Blinder 900, kompakt tasarımlı 900 lümen ön far. USB-C şarj ve akıllı ışık modları.",
			price: 1999,
			comparePrice: null,
			stock: 45,
			categoryId: subCatMap["Aydınlatma"],
			brandId: null,
			isFeatured: false,
			isNew: true,
			sku: "ACC-KNG-001",
		},

		// === YEDEK PARÇA (5) ===
		{
			name: "Shimano Deore XT M8100 Fren Seti",
			description: "Shimano Deore XT M8100, profesyonel seviye hidrolik disk fren seti. Güçlü frenleme ve hassas kontrol.",
			price: 4299,
			comparePrice: 4999,
			stock: 25,
			categoryId: catMap["Yedek Parça"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "YP-SHIM-001",
		},
		{
			name: "Continental Grand Prix 5000 Lastik",
			description: "Continental GP5000, yol bisikletleri için en popüler performans lastiği. BlackChili bileşik, düşük yuvarlanma direnci.",
			price: 899,
			comparePrice: null,
			stock: 60,
			categoryId: catMap["Yedek Parça"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "YP-CONT-001",
		},
		{
			name: "SRAM Eagle GX 12V Vites Grubu",
			description: "SRAM Eagle GX, 12 vitesli dağ bisikleti vites grubu. 10-52T kaseti ile geniş vites aralığı.",
			price: 6999,
			comparePrice: 7999,
			stock: 15,
			categoryId: catMap["Yedek Parça"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "YP-SRAM-001",
		},
		{
			name: "RockShox Pike Ultimate Süspansiyon",
			description: "RockShox Pike Ultimate, 140mm stroklu trail süspansiyon çatalı. Charger 3 kartuş ve DebonAir+ hava yayı.",
			price: 12999,
			comparePrice: 14999,
			stock: 8,
			categoryId: catMap["Yedek Parça"],
			brandId: null,
			isFeatured: false,
			isNew: true,
			sku: "YP-RSHX-001",
		},
		{
			name: "Shimano Ultegra R8170 Di2 Vites Kolu",
			description: "Shimano Ultegra R8170 Di2, kablosuz elektronik vites kolu. Ergonomik tasarım ve anlık vites geçişleri.",
			price: 8999,
			comparePrice: null,
			stock: 12,
			categoryId: catMap["Yedek Parça"],
			brandId: null,
			isFeatured: false,
			isNew: false,
			sku: "YP-SHIM-002",
		},
	];

	// Create products with images
	let imageId = 100; // Starting picsum ID
	for (const productData of products) {
		const { sku, ...rest } = productData;
		const product = await prisma.product.create({
			data: {
				...rest,
				slug: slugify(rest.name),
				sku,
				isActive: true,
				images: {
					create: [
						{
							url: `https://picsum.photos/seed/${imageId}/800/800`,
							alt: rest.name,
							order: 0,
						},
						{
							url: `https://picsum.photos/seed/${imageId + 1}/800/800`,
							alt: `${rest.name} - alternatif görünüm`,
							order: 1,
						},
					],
				},
			},
		});
		imageId += 2;
		console.log(`  Created product: ${product.name}`);
	}

	console.log(`\nCreated ${products.length} products.`);
	console.log("\nSeed completed successfully!");

	// Summary
	const totalProducts = await prisma.product.count();
	const featuredCount = await prisma.product.count({ where: { isFeatured: true } });
	const newCount = await prisma.product.count({ where: { isNew: true } });
	const discountCount = await prisma.product.count({ where: { comparePrice: { not: null } } });

	console.log("\n--- Summary ---");
	console.log(`Categories: ${parentCategories.length} parent + ${subCategories.length} sub = ${parentCategories.length + subCategories.length}`);
	console.log(`Brands: ${brands.length}`);
	console.log(`Products: ${totalProducts}`);
	console.log(`  Featured: ${featuredCount}`);
	console.log(`  New: ${newCount}`);
	console.log(`  Discounted: ${discountCount}`);
}

main()
	.catch((e) => {
		console.error("Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
