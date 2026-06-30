import { LRUCache } from 'lru-cache';

import { FEED_CACHE_TTL_MS } from './constants';

/** In-memory cache for Entrata feed responses keyed by move-in date or generate run. */
const feedCache = new LRUCache<string, unknown>({
  max: 1000,
  ttl: FEED_CACHE_TTL_MS,
});

export default feedCache;
