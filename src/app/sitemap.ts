import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const courses = await db.course.findMany({ where: { published: true }, select: { slug: true, createdAt: true } });
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/live`, changeFrequency: "daily", priority: 0.6 },
    ...courses.map((c) => ({
      url: `${base}/courses/${encodeURIComponent(c.slug)}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
