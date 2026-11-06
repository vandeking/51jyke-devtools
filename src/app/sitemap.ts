import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://51jyke.com/", changeFrequency: "monthly", priority: 1 },
    { url: "https://51jyke.com/about", changeFrequency: "yearly", priority: 0.5 },
  ];
}
