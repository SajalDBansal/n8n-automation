// next/font self-hosts Geist/Geist Mono at build time (no runtime request to
// fonts.googleapis.com), the editor's node icons are the only external image
// source (img.icons8.com), and the SSE execution stream + all client fetches
// are same-origin — so this CSP only needs to allowlist icons8, not any
// third-party script/style/connect host.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://img.icons8.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    domains: ['img.icons8.com'],
  },
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Only takes effect over HTTPS (browsers ignore it on plain HTTP,
          // e.g. local dev) — no includeSubDomains/preload yet since those
          // are effectively irreversible without knowing the real domain
          // and subdomain layout this deploys to.
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
}

export default nextConfig
