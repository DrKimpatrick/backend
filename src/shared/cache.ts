import { Request, Response } from 'express';
import NodeCache from 'node-cache';

let cacheInstance: NodeCache;

const cacheRedirectUrl = (req: Request, res: Response, next: (...args: any) => void) => {
  if (req.query.redirect_url) {
    saveToCache('SOCIAL_AUTH_REDIRECT_URL', req.query.redirect_url);
  }
  next();
};

const saveToCache = (key: string, value: any): void => {
  cacheInstance.set(key, JSON.stringify(value));
};

const getFromCache = (key: string) => {
  try {
    const v = cacheInstance.get(key);
    // @ts-ignore
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};

const removeFromCache = (key: string) => {
  cacheInstance.del(key);
};

const initCache = () => {
  if (!getFromCache('isCacheActive')) {
    cacheInstance = new NodeCache();
    saveToCache('isCacheActive', true);
  }
  return cacheInstance;
};

const cache = {
  cacheRedirectUrl,
  init: initCache,
  get: getFromCache,
  save: saveToCache,
  remove: removeFromCache,
};
export default cache;
