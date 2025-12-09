// server/src/config/mongoose.ts
import mongoose from "mongoose";

export function buildMongoUri(): string {
  // Prefer the explicit MONGO_* names used in your compose output, but accept common fallbacks
  const user = process.env.MONGO_ROOT_USERNAME || process.env.MONGODB_USER || "";
  const pass = process.env.MONGO_ROOT_PASSWORD || process.env.MONGODB_PASSWORD || "";
  const host = process.env.MONGO_HOST || process.env.MONGODB_HOST || "mongo";
  const port = process.env.MONGODB_DOCKER_PORT || process.env.MONGO_PORT || "27017";
  const db = process.env.MONGO_DATABASE || process.env.MONGODB_DATABASE || process.env.MONGO_INITDB_DATABASE || "urlshortner";

  // Only include auth part if both username and password are provided
  const auth = (user && pass) ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : "";

  // Return a simple mongodb:// URI (works for local dev). Use srv scheme if you need DNS seedlist.
  return `mongodb://${auth}${host}:${port}/${db}?authSource=admin&retryWrites=true&w=majority`;
}

/**
 * connectToMongoDB - named export used by your index.ts
 * Retries connection with exponential backoff. Throws if maxAttempts exceeded.
 */
export async function connectToMongoDB(maxAttempts = 6, initialDelayMs = 500): Promise<void> {
  const uri = buildMongoUri();
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      // mongoose.connect accepts a URI string. You can add options here if needed.
      await mongoose.connect(uri, {
        // recommended options can go here, but modern mongoose doesn't require many.
        // keep this minimal to avoid extra TS noise.
      });
      // connection succeeded
      // tslint:disable-next-line:no-console
      console.log(`Connected to MongoDB (attempt ${attempt})`);
      return;
    } catch (err) {
      // log and retry
      // tslint:disable-next-line:no-console
      console.warn(`MongoDB connection attempt ${attempt} failed:`, (err as Error).message || err);
      if (attempt >= maxAttempts) {
        // tslint:disable-next-line:no-console
        console.error(`Exceeded max attempts (${maxAttempts}) connecting to MongoDB`);
        throw err;
      }
      // wait then backoff
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 5000);
    }
  }
}
