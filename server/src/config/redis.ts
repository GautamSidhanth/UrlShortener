import Redis, { RedisOptions } from 'ioredis';

const {
  REDIS_HOST = 'redis',
  REDIS_DOCKER_PORT = '6379',
  REDIS_PASSWORD,
} = process.env;


export enum RedisExpirationMode {
  EX = 'EX',
}

let client: Redis | null = null;

const createRedisOptions = (): RedisOptions => {
  const port = Number(REDIS_DOCKER_PORT || 6379);
  const opts: RedisOptions = {
    host: REDIS_HOST,
    port,
    ...(REDIS_PASSWORD ? { password: REDIS_PASSWORD } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    reconnectOnError: (err) => {
      const message = (err && (err as any).message) || '';
      if (message.includes('READONLY')) return true;
      if (message.includes('ECONNREFUSED')) return true;
      return false;
    },
  };

  return opts;
};

const getRedisClient = (): Redis => {
  if (!client) {
    client = new Redis(createRedisOptions());

    client.on('connect', () => console.log('Redis: connect'));
    client.on('ready', () => console.log('Redis: ready — connected and ready to use'));
    client.on('error', (err) =>
      console.error('Redis error:', err && (err as Error).message ? (err as Error).message : err)
    );
    client.on('close', () => console.warn('Redis: connection closed'));
    client.on('reconnecting', (delay: number) => {
      console.log(`Redis: reconnecting in ${delay}ms`);
    });
  }
  return client;
};

export const connectToRedis = async (): Promise<void> => {
  const redis = getRedisClient();
  if (redis.status === 'ready') return;
  try {
    await redis.connect();
  } catch (err) {
    console.warn('Redis connect() rejected:', err && (err as Error).message ? (err as Error).message : err);
  }
};

export const set = async (
  key: string,
  value: string,
  expirationMode: RedisExpirationMode,
  seconds: number
): Promise<void> => {
  try {
    await getRedisClient().set(key, value, expirationMode, seconds);
    console.info(`Key ${key} created in Redis cache`);
  } catch (error) {
    console.error(`Failed to create key in Redis cache: ${error}`);
  }
};

export const get = async (key: string): Promise<string | null> => {
  try {
    const value = await getRedisClient().get(key);
    console.info(`Value with key ${key} retrieved from Redis cache`);
    return value;
  } catch (error) {
    console.error(`Failed to retrieve value with key ${key} in Redis cache: ${error}`);
    return null;
  }
};

export const extendTTL = async (key: string, additionalTimeInSeconds: number) => {
  try {
    const currentTTL = await getRedisClient().ttl(key);
    if (currentTTL > 0) {
      const newTTL = currentTTL + additionalTimeInSeconds;
      await getRedisClient().expire(key, newTTL);
      console.info(`TTL for key ${key} extended to ${newTTL} in Redis cache`);
    } else {
      console.error(`Failed to extend TTL of key ${key} in Redis cache. ttl=${currentTTL}`);
    }
  } catch (error) {
    console.error(`Error extending TTL for key ${key}: ${error}`);
  }
};
