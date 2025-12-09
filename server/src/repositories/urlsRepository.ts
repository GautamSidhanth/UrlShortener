// server/src/repositories/urlsRepository.ts
import Url, { IUrl } from '../models/Urls';

interface ICreateParams {
  shortenUrlKey: string;
  originalUrl: string;
}

interface IFindOneParams {
  shortenUrlKey?: string;
  originalUrl?: string;
}

const create = async (params: ICreateParams): Promise<IUrl> => {
  console.log(`Creating URL with params: ${JSON.stringify(params)}`);
  const result: IUrl = await Url.create({ ...params });
  console.log(`Created URL: ${JSON.stringify(result)}`);
  return result;
};

const findAll = async (): Promise<IUrl[]> => {
  console.log('Finding all URLs');
  const result: IUrl[] = await Url.find();
  console.log(`Found URLs: ${result?.length || 0}`);
  return result;
};

const findOne = async (params: IFindOneParams): Promise<IUrl | null> => {
  console.log(`Finding one URL with params: ${JSON.stringify(params)}`);
  const result: IUrl | null = await Url.findOne({ ...params });
  console.log(`Found URL: ${JSON.stringify(result)}`);
  return result;
};

export { create, findAll, findOne };
