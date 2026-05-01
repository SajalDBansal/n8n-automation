// Server-only config — never import this from a "use client" file. It
// throws on module load if BETTER_AUTH_SECRET is missing, which would crash
// the browser bundle if this ever got pulled into client code. Client-safe
// (NEXT_PUBLIC_*) values live in utils/public-config.ts instead.

if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is not set');
}

const parseEnableWorkers = () => {
    const raw = process.env.ENABLE_WORKERS?.trim().toLowerCase();
    if (!raw) return false;
    return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
}

const config = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    ENABLE_WORKERS: parseEnableWorkers(),
}

export default config;
