import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// The staff board and the API are not for crawlers. The pitch path is
// additionally noindexed by header in next.config.ts, because a robots
// disallow asks and a header tells.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/kitchen", "/api/", "/pitch/"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
