import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alpinbisiklet.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/*", "/api", "/api/*", "/hesabim", "/hesabim/*"],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
