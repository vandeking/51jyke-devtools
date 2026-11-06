import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/home/", "/api/"] }, sitemap: "https://51jyke.com/sitemap.xml", host: "https://51jyke.com" };
}
