// server/src/services/urlsService.ts
import { generateUniqueToken } from '../config/zookeeper';
import { get, set, extendTTL, RedisExpirationMode } from '../config/redis';
import { IUrl } from '../models/Urls';
import { isValidUrl } from '../utils';
import { create, findAll, findOne } from '../repositories/urlsRepository';

const ONE_MINUTE_IN_SECONDS = 60;

export const getAllUrls = async (): Promise<IUrl[]> => await findAll();

export const getUrlByShortenUrlKey = async (
  shortenUrlKey: string
): Promise<string | null> => {
  const cachedOriginalUrl = await get(shortenUrlKey);
  if (cachedOriginalUrl) {
    await extendTTL(shortenUrlKey, ONE_MINUTE_IN_SECONDS);
    return cachedOriginalUrl;
  }

  const savedUrl = await findOne({ shortenUrlKey });
  if (savedUrl) {
    await set(
      savedUrl.shortenUrlKey,
      savedUrl.originalUrl,
      RedisExpirationMode.EX,
      ONE_MINUTE_IN_SECONDS
    );

    return savedUrl.originalUrl;
  }

  return null;
};

export const createShortenedUrl = async (
  originalUrl: string
): Promise<string | null> => {
  if (!isValidUrl(originalUrl)) {
    return null;
  }

  const savedUrl = await findOne({ originalUrl });
  if (savedUrl) {
    return savedUrl.shortenUrlKey;
  }

  const shortenUrlKey = await generateUniqueToken();
  if (shortenUrlKey) {
    const newUrl = await create({
      originalUrl,
      shortenUrlKey,
    });

    await set(
      newUrl.shortenUrlKey,
      newUrl.originalUrl,
      RedisExpirationMode.EX,
      ONE_MINUTE_IN_SECONDS
    );

    return newUrl.shortenUrlKey;
  }

  return null;
};
