import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Their current sitemap lists three URLs: home, contact, privacy policy. Every
// page a customer actually wants was missing from it because it did not exist.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/menu", "/events", "/story", "/visit", "/order"];
  return routes.map((r) => ({
    url: `${SITE.url}${r}`,
    changeFrequency: r === "/menu" || r === "/order" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/menu" ? 0.9 : 0.7,
  }));
}
