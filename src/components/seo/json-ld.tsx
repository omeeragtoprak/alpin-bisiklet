const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

/** Genel JSON-LD script tag */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data is safe
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization schema — marka güveni ve Knowledge Graph */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "Alpin Bisiklet",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo.png`,
          width: 200,
          height: 200,
        },
        sameAs: [
          process.env.NEXT_PUBLIC_FACEBOOK_URL,
          process.env.NEXT_PUBLIC_INSTAGRAM_URL,
          process.env.NEXT_PUBLIC_TWITTER_URL,
          process.env.NEXT_PUBLIC_YOUTUBE_URL,
        ].filter(Boolean),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
            ? `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
            : undefined,
          contactType: "customer service",
          availableLanguage: "Turkish",
        },
      }}
    />
  );
}

/** WebSite schema — Sitelinks Search Box için kritik */
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        name: "Alpin Bisiklet",
        url: BASE_URL,
        description:
          "Türkiye'nin en güvenilir bisiklet mağazası. Dağ bisikleti, yol bisikleti, şehir bisikleti ve aksesuarlar.",
        publisher: { "@id": `${BASE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/urunler?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** LocalBusiness schema — yerel arama için kritik */
export function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BicycleStore",
        "@id": `${BASE_URL}/#localbusiness`,
        name: "Alpin Bisiklet",
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        image: `${BASE_URL}/logo.png`,
        description:
          "30 yılı aşkın tecrübemizle Türkiye'nin en güvenilir bisiklet mağazası. Dağ bisikleti, yol bisikleti, şehir bisikleti, aksesuar ve yedek parça.",
        priceRange: "₺₺",
        currenciesAccepted: "TRY",
        paymentAccepted: "Cash, Credit Card, Bank Transfer",
        areaServed: {
          "@type": "Country",
          name: "Turkey",
        },
        hasMap: "https://maps.google.com",
        sameAs: [`${BASE_URL}`],
      }}
    />
  );
}

/** Product schema — Google Shopping rich results */
export function ProductSchema({
  product,
  slug,
}: {
  product: {
    name: string;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    brand?: { name: string } | null;
    images?: { url: string; alt?: string | null }[];
    sku?: string | null;
  };
  slug: string;
}) {
  const image = product.images?.[0];
  const imageUrl = image?.url?.startsWith("http")
    ? image.url
    : image?.url
      ? `${BASE_URL}${image.url}`
      : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || undefined,
        url: `${BASE_URL}/urunler/${slug}`,
        image: imageUrl,
        sku: product.sku || undefined,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand.name }
          : undefined,
        offers: {
          "@type": "Offer",
          url: `${BASE_URL}/urunler/${slug}`,
          priceCurrency: "TRY",
          price: product.price,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "Alpin Bisiklet",
          },
          ...(product.comparePrice && product.comparePrice > product.price
            ? {
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: product.price,
                  priceCurrency: "TRY",
                },
              }
            : {}),
        },
      }}
    />
  );
}

/** BreadcrumbList schema — navigasyon rich results */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
        })),
      }}
    />
  );
}

/** BlogPosting schema — blog yazıları için */
export function BlogPostingSchema({
  blog,
  slug,
}: {
  blog: {
    title: string;
    excerpt?: string | null;
    coverImage?: string | null;
    publishedAt?: Date | null;
  };
  slug: string;
}) {
  const imageUrl = blog.coverImage?.startsWith("http")
    ? blog.coverImage
    : blog.coverImage
      ? `${BASE_URL}${blog.coverImage}`
      : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.excerpt || undefined,
        image: imageUrl,
        url: `${BASE_URL}/blog/${slug}`,
        datePublished: blog.publishedAt?.toISOString(),
        author: {
          "@type": "Organization",
          name: "Alpin Bisiklet",
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "Alpin Bisiklet",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${BASE_URL}/blog/${slug}`,
        },
      }}
    />
  );
}

/** FAQPage schema — SSS sayfası için */
export function FAQPageSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}
