import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/new", "/status"],
      disallow: ["/api/", "/r/"],
    },
    sitemap: "https://bill402.vercel.app/sitemap.xml",
    host: "https://bill402.vercel.app",
  };
}
