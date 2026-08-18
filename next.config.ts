import type { NextConfig } from "next";

const PITCH_HOST = "stagecoach.glazedweb.com";

const nextConfig: NextConfig = {
  images: {
    // The menu photos are the restaurant's own, still served from Toast's CDN
    // because that is where they live today. Named on the README checklist:
    // mirror them into public/ before the Toast account is switched off, or
    // the menu loses its pictures the day they leave.
    remotePatterns: [
      { protocol: "https", hostname: "d1w7312wesee68.cloudfront.net" },
      { protocol: "https", hostname: "d2s742iet3d3t1.cloudfront.net" },
      { protocol: "https", hostname: "toast-sites-resources-prod.s3.amazonaws.com" },
    ],
  },

  async rewrites() {
    // ------------------------------------------------------------------
    // stagecoach.glazedweb.com: the proposal at the root, the demo under
    // /demo. The client's own domain serves the site at its root with no
    // proposal anywhere near it, which is why this is host-scoped rather
    // than basePath (basePath is global to a build and would bury the real
    // site under /demo the day stagecoach1838.com points here).
    //
    // beforeFiles is load-bearing: app/page.tsx already answers "/", so an
    // afterFiles root rewrite would never fire.
    //
    // DELETE the pitch file and these rewrites once they sign or pass.
    // ------------------------------------------------------------------
    const onPitchHost = [{ type: "host" as const, value: PITCH_HOST }];
    return {
      beforeFiles: [
        { source: "/", destination: "/pitch/stagecoach.html", has: onPitchHost },
        { source: "/demo", destination: "/", has: onPitchHost },
        { source: "/demo/:path*", destination: "/:path*", has: onPitchHost },
      ],
      afterFiles: [
        // Path form, reachable on any host before the subdomain exists.
        { source: "/pitch/stagecoach", destination: "/pitch/stagecoach.html" },
      ],
      fallback: [],
    };
  },

  async headers() {
    return [
      {
        // The pitch host must not compete with the client's own name in
        // search, and neither should the pitch path on any other host.
        source: "/:path*",
        has: [{ type: "host", value: PITCH_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/pitch/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
