// server/src/index.ts
import Fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import mongoose from 'mongoose';
import { connectToMongoDB } from './config/mongoose';
import { connectToRedis } from './config/redis';
import { connectToZookeeper, closeZookeeper } from './config/zookeeper'; // closeZookeeper is optional but helpful
import { urlsRoutes } from './routes/urlsRoutes';

type Connector = {
  name: string;
  fn: () => Promise<void>;
};

const fastify = Fastify({ logger: true });

fastify.register(fastifyCors);
fastify.register(
  async (instance: FastifyInstance) => {
    instance.register(urlsRoutes);
  },
  { prefix: '/api' }
);

// track which services are up
const services: Record<string, boolean> = {
  mongodb: false,
  redis: false,
  zookeeper: false,
};

const retryConnect = async (
  name: string,
  fn: () => Promise<void>,
  maxAttempts = 6,
  initialDelayMs = 500
): Promise<void> => {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      fastify.log.info({ attempt, name }, `Connecting to ${name} (attempt ${attempt}/${maxAttempts})`);
      await fn();
      services[name] = true;
      fastify.log.info({ name }, `${name} connected`);
      return;
    } catch (err) {
      services[name] = false;
      fastify.log.warn({ attempt, name, err: (err as Error).message }, `Failed to connect to ${name}`);
      if (attempt >= maxAttempts) {
        fastify.log.error({ name }, `Exceeded max attempts (${maxAttempts}) connecting to ${name}`);
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 5000); // exponential backoff up to 5s
    }
  }
};

fastify.get('/health', async () => {
  // mongoose.connection.readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
  const mongoState = mongoose?.connection?.readyState ?? 'unknown';
  return {
    status: 'ok',
    uptime: process.uptime(),
    services,
    mongooseReadyState: mongoState,
    timestamp: new Date().toISOString(),
  };
});

const shutdown = async (signal: string) => {
  fastify.log.info({ signal }, 'Shutdown initiated');
  try {
    await fastify.close();
    fastify.log.info('Fastify closed');
  } catch (err) {
    fastify.log.warn({ err }, 'Error closing Fastify');
  }

  // try to close optional graceful resources (best effort)
  try {
    if (typeof closeZookeeper === 'function') {
      closeZookeeper();
      fastify.log.info('Zookeeper client closed (if existed)');
    }
  } catch (err) {
    fastify.log.warn({ err }, 'Error closing Zookeeper client');
  }

  try {
    // call mongoose disconnect to close DB pool
    await mongoose.disconnect();
    fastify.log.info('Mongoose disconnected');
  } catch (err) {
    fastify.log.warn({ err }, 'Error disconnecting mongoose');
  }

  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

const start = async () => {
  try {
    // connectors in order with retry/backoff (adjust attempts/delays to your needs)
    const connectors: Connector[] = [
      { name: 'mongodb', fn: connectToMongoDB },
      { name: 'redis', fn: connectToRedis },
      { name: 'zookeeper', fn: connectToZookeeper },
    ];

    for (const c of connectors) {
      // If you want to skip any (for local dev), set env like SKIP_ZOOKEEPER=true and handle here.
      await retryConnect(c.name, c.fn, 6, 500);
    }

    // only start server when connectors are good (or at least attempted)
    const port = Number(process.env.NODE_SERVER_LOCAL_PORT) || 3000;
    const host = process.env.NODE_SERVER_HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info({ host, port }, 'Server is now listening');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to start server, exiting');
    process.exit(1);
  }
};

start();
