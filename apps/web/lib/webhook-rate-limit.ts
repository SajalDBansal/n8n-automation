// Simple in-memory sliding-window rate limiter for the public webhook
// trigger endpoint. In-memory only — resets on redeploy and does not share
// state across multiple instances, same known limitation as Better Auth's
// own rate limiter and the in-memory SSE pub/sub used elsewhere in this app.
// Good enough for a single-instance deployment; revisit with a Redis-backed
// counter if this ever runs behind a load balancer.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const requestLog = new Map<string, number[]>();

export function isWebhookRateLimited(webhookId: string): boolean {
    const now = Date.now();
    const timestamps = (requestLog.get(webhookId) ?? []).filter((t) => now - t < WINDOW_MS);

    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        requestLog.set(webhookId, timestamps);
        return true;
    }

    timestamps.push(now);
    requestLog.set(webhookId, timestamps);
    return false;
}
