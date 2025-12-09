// server/src/config/zookeeper.ts
import * as zk from 'node-zookeeper-client';
import { generateBase64Token } from '../utils';

const {
  ZOOKEEPER_HOST = 'zookeeper',
  ZOOKEEPER_DOCKER_PORT = '2181',
} = process.env;

const connectString = `${ZOOKEEPER_HOST}:${ZOOKEEPER_DOCKER_PORT}`;

type ZkClient = zk.Client | null;

let client: ZkClient = null;

const TOKENS_NODE_PATH = '/tokens';
const MAX_RETRIES = 3;
const MAX_TOKEN_SIZE = 6;
const CONNECT_TIMEOUT_MS = 10_000;

const getZkClient = (): zk.Client => {
  if (!client) {
    client = zk.createClient(connectString, {
      sessionTimeout: 30000,
      spinDelay: 1000,
      retries: 3,
    });
  }
  return client!;
};

export const connectToZookeeper = async (): Promise<void> => {
  const c = getZkClient();

  if (c.getState() === zk.State.SYNC_CONNECTED) {
    console.log('ZooKeeper already connected');
    await ensureTokensNode();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const onConnected = () => {
      clearHandlers();
      console.log('Successfully connected to ZooKeeper');
      resolve();
    };

    const onError = (err: any) => {
      clearHandlers();
      reject(err || new Error('Unknown ZooKeeper connection error'));
    };

    const onState = (state: zk.State) => {
      // optional debug
    };

    const clearHandlers = () => {
      c.removeListener('connected', onConnected);
      c.removeListener('error', onError as any);
      c.removeListener('state', onState);
    };

    c.once('connected', onConnected);
    c.once('error', onError as any);
    c.on('state', onState);

    // Kick off connection if not already connecting
    try {
      c.connect();
    } catch (err) {
      clearHandlers();
      reject(err);
    }

    // fallback timeout
    setTimeout(() => {
      if (c.getState() !== zk.State.SYNC_CONNECTED) {
        clearHandlers();
        reject(new Error(`ZooKeeper connection timeout after ${CONNECT_TIMEOUT_MS}ms`));
      }
    }, CONNECT_TIMEOUT_MS);
  });

  // Ensure parent tokens node exists
  await ensureTokensNode();
};

// Promise wrapper for exists
const pathExists = (path: string): Promise<boolean> => {
  const c = getZkClient();
  return new Promise((resolve, reject) => {
    c.exists(path, (err, stat) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(!!stat);
    });
  });
};

// Promise wrapper for mkdirp (node-zookeeper-client exposes mkdirp)
const mkdirp = (path: string): Promise<void> => {
  const c = getZkClient();
  return new Promise((resolve, reject) => {
    // @ts-ignore - mkdirp exists on the client
    c.mkdirp(path, (err: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const ensureTokensNode = async (): Promise<void> => {
  try {
    const exists = await pathExists(TOKENS_NODE_PATH);
    if (exists) {
      console.info(`Tokens node ${TOKENS_NODE_PATH} already exists`);
      return;
    }
    await mkdirp(TOKENS_NODE_PATH);
    console.info(`Tokens node ${TOKENS_NODE_PATH} created`);
  } catch (err) {
    console.error('Failed to ensure tokens node:', err);
    throw err;
  }
};

const createEphemeralNode = (path: string, data: Buffer): Promise<void> => {
  const c = getZkClient();
  return new Promise((resolve, reject) => {
    c.create(
      path,
      data,
      zk.CreateMode.EPHEMERAL,
      (err: any /*, createdPath?: string */) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
};

export const generateUniqueToken = async (retryCount = 0): Promise<string> => {
  const token = generateBase64Token(MAX_TOKEN_SIZE);
  const uniqueTokenPath = `${TOKENS_NODE_PATH}/${token}`;

  try {
    const exists = await pathExists(uniqueTokenPath);
    if (exists) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Token collision for ${uniqueTokenPath}, retry ${retryCount + 1}/${MAX_RETRIES}`
        );
        return generateUniqueToken(retryCount + 1);
      }
      throw new Error('Failed to generate unique token after retries');
    }

    await createEphemeralNode(uniqueTokenPath, Buffer.from(token));
    return token;
  } catch (err) {
    console.error('Error creating unique token node:', err);
    throw err;
  }
};

export const closeZookeeper = (): void => {
  if (client) {
    try {
      client.close();
    } catch (err) {
      console.warn('Error closing ZooKeeper client:', err);
    } finally {
      client = null;
    }
  }
};
