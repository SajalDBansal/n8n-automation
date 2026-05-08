import prisma from "@workspace/database";
import { createClient } from "redis";
import config from "@/utils/config";

async function checkDatabase(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error("Health check: database unreachable", error);
        return false;
    }
}

async function checkRedis(): Promise<boolean> {
    const client = createClient({ url: config.REDIS_URL, socket: { connectTimeout: 2000 } });
    client.on("error", () => { });

    try {
        await client.connect();
        const pong = await client.ping();
        return pong === "PONG";
    } catch (error) {
        console.error("Health check: redis unreachable", error);
        return false;
    } finally {
        try {
            if (client.isOpen) await client.quit();
        } catch {
            // ignore
        }
    }
}

export async function GET() {
    const [databaseHealthy, redisHealthy] = await Promise.all([
        checkDatabase(),
        checkRedis(),
    ]);

    const healthy = databaseHealthy && redisHealthy;

    return Response.json({
        success: healthy,
        message: healthy ? "API is healthy" : "One or more dependencies are unreachable",
        checks: {
            database: databaseHealthy,
            redis: redisHealthy,
        },
    }, { status: healthy ? 200 : 503 });
}
