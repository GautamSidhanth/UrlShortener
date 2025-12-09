// server/src/routes/urlsRoutes.ts
import { FastifyInstance } from 'fastify';
import { postUrl, getUrls, getUrl } from '../controllers/urlController';

export const urlsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(
    async (router: FastifyInstance) => {
      router.get('/', getUrls);
      router.get('/:shortenUrlKey', getUrl);
      router.post('/', postUrl);
    },
    { prefix: '/urls' }
  );
};
