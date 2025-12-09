// server/src/utils/index.ts
import { randomBytes } from 'crypto';

export const generateBase64Token = (length: number): string => {
  const buffer = randomBytes(Math.ceil((length * 3) / 4));
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
    .slice(0, length);
};

export const isValidUrl = (value: string): boolean => {
  const pattern: RegExp = new RegExp(
    '^https?:\\/\\/' + // Protocol (http or https)
      '(?:www\\.)?' + // Optional www.
      '[-a-zA-Z0-9@:%._\\+~#=]{1,256}' + // Domain name characters
      '\\.[a-zA-Z0-9()]{1,6}\\b' + // Top-level domain
      '(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$', // Optional query string
    'i'
  );

  return pattern.test(value);
};
