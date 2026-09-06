import process from "node:process";

const scriptEvaluationPolicy =
  process.env.NODE_ENV === "development"
    ? "'unsafe-eval' 'wasm-unsafe-eval'"
    : "'wasm-unsafe-eval'";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: https:",
      `script-src 'self' 'unsafe-inline' ${scriptEvaluationPolicy} https://www.googletagmanager.com`,
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://huggingface.co https://*.hf.co https://pub-2eadf17a82cb46679204775b78a2c16a.r2.dev",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
    ].join("; "),
  },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "blog.hozorica.com" }],
        destination: "https://hozorica.com/blog",
        permanent: true,
      },
      {
        source: "/posts/:slug",
        has: [{ type: "host", value: "blog.hozorica.com" }],
        destination: "https://hozorica.com/blog/:slug",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        has: [{ type: "host", value: "blog.hozorica.com" }],
        destination: "https://hozorica.com/blog/categories/:path*",
        permanent: true,
      },
      {
        source: "/tags/:path*",
        has: [{ type: "host", value: "blog.hozorica.com" }],
        destination: "https://hozorica.com/blog/tags/:path*",
        permanent: true,
      },
      {
        source: "/rss.xml",
        has: [{ type: "host", value: "blog.hozorica.com" }],
        destination: "https://hozorica.com/blog/rss.xml",
        permanent: true,
      },
      { source: "/posts/:slug", destination: "/blog/:slug", permanent: true },
      {
        source: "/blog",
        has: [{ type: "query", key: "q", value: "(?<q>.+)" }],
        destination: "/blog/search?q=:q",
        permanent: false,
      },
      {
        source: "/blog",
        has: [{ type: "query", key: "page", value: "(?<page>[0-9]+)" }],
        destination: "/blog/page/:page",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        destination: "/blog/categories/:path*",
        permanent: true,
      },
      { source: "/tags", destination: "/blog/tags", permanent: true },
      { source: "/tags/:slug", destination: "/blog/tags/:slug", permanent: true },
      {
        source: "/tags/:slug/page/:page",
        destination: "/blog/tags/:slug/page/:page",
        permanent: true,
      },
      { source: "/rss.xml", destination: "/blog/rss.xml", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/blog/rss.xml", destination: "/rss.xml" },
      { source: "/blog/categories/:path*", destination: "/categories/:path*" },
      { source: "/blog/tags", destination: "/tags" },
      { source: "/blog/tags/:slug/page/:page", destination: "/tags/:slug/page/:page" },
      { source: "/blog/tags/:slug", destination: "/tags/:slug" },
      { source: "/blog/search", destination: "/blog/search" },
      { source: "/blog/:slug", destination: "/posts/:slug" },
    ];
  },
};

export default nextConfig;
