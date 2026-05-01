// Client-safe config — only NEXT_PUBLIC_* vars, which Next.js already
// exposes to the browser by inlining them at build time. Safe to import
// from both client and server code. Never add a server-only secret here —
// see utils/config.ts for those.

const publicConfig = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
}

export default publicConfig;
