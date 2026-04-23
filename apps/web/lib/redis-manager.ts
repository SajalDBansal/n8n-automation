import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;
type RedisClientReturn = Awaited<ReturnType<typeof createRedisClient>>;

const createRedisClient = async (): Promise<RedisClient> => {
    const URL = process.env.REDIS_URL || "redis://localhost:6379";
    const client = createClient({
        url: URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    console.error("Redis: Too Many Reconnection Attempts");
                    return new Error("Too Many Reconnection Attempts");
                }
                return Math.min(retries * 100, 3000);
            },
            connectTimeout: 10000,
        },
        disableOfflineQueue: false
    });

    client.on('error', (err) => console.error("Redis: Client Error : ", err));
    client.on('connect', () => console.log("Redis: Client Connected"));
    client.on('reconnecting', () => console.log("Redis: Client Reconnecting"));
    client.on('ready', () => console.log("Redis: Client Ready"));

    await client.connect();

    try {
        // when memory is full → evict least recently used keys
        await client.configSet("maxmemory-policy", "allkeys-lru");
        console.log("Redis: Eviction Policy Set To allkey-lru");
    } catch (error) {
        console.warn("Redis: Could Not Set Client Eviction Policy", error);
    }
    return client;
}

// A connection in SUBSCRIBE mode cannot run normal commands.
// So:
// main client → commands(GET, SET, etc.)
// subscriber → pub / sub only

let redisClient: RedisClient | null = null;
let subscriber: RedisClient | null = null;

export const getRedisClient = async (): Promise<RedisClientReturn> => {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    redisClient = await createRedisClient();
    return redisClient;
}

const getSubscriber = async (): Promise<RedisClientReturn> => {
    if (subscriber && subscriber.isOpen) {
        return subscriber;
    }

    const client = await getRedisClient();
    console.log("Redis: Creating new Sunscriber..");
    subscriber = client.duplicate();

    subscriber.on('error', (err) => console.error("Redis: Subscriber Error: ", err));
    subscriber.on('connect', () => console.log("Redis: Subscriber Connected"));
    subscriber.on('reconnecting', () => console.log("Redis: Subscriber Reconnecting"));
    subscriber.on('ready', () => console.log("Redis: Subscriber Ready"));

    await subscriber.connect();
    return subscriber;
}

export { createRedisClient, getSubscriber };