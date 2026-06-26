import type { Core } from '@strapi/strapi';
import { fetchEntrataFeed, fetchEntrataSpecials } from '../utils/entrata/fetchEntrataData';
import syncToStrapi from '../utils/persist/syncToStrapi';
import importSpecials from '../utils/specials';
import getFeedDetails from '../utils/shared/dbCalls';
import s3Service from './s3';
import { LRUCache } from 'lru-cache';

const FEED_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FLOORPLANS_FEED_CACHE_KEY = 'floorplans-feed';

const feedCache = new LRUCache<string, unknown>({
  max: 1000,
  ttl: FEED_CACHE_TTL_MS,
});

const buildFinalFeedJson = async (
  strapi: Core.Strapi,
  floorplansWithUnits: unknown,
) => {
  const floorplans = floorplansWithUnits as Record<string, unknown>[];
  const feedDetails = await getFeedDetails(strapi, floorplans);

  return {
    floorplans,
    ...feedDetails,
  };
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFeedData() {
    try {
      const [floorplansWithUnits, specials] = await Promise.all([
        fetchEntrataFeed(),
        fetchEntrataSpecials(),
      ]);
  
      // Cache raw feed for 1 hour
      feedCache.set(FLOORPLANS_FEED_CACHE_KEY, floorplansWithUnits, {
        ttl: FEED_CACHE_TTL_MS,
      });
  
      await syncToStrapi(strapi, floorplansWithUnits);
      await importSpecials(strapi, specials);
  
      const finalJson = await buildFinalFeedJson(strapi, floorplansWithUnits);
  
      const url = await s3Service().uploadJson(
        finalJson,
        `feeds/${process.env.ENTRATA_PROPERTY_ID}/floorplans.json`,
      );

      return {
        success: true,
        message: 'floorplans synced successfully',
        url,
      };
    } catch (error) {
      strapi.log.error('Entrata API Error', error);
      throw error;
    }
  },
  async getFeed(query: { moveInDate?: string }) {
    const { moveInDate } = query;
  
    if (!moveInDate) {
      return {
        success: false,
        message: 'Move in date is required',
      };
    }
  
    const cacheKey = `floorplans-${moveInDate}`;
  
    const cachedData = feedCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  
    const floorplansWithUnits = await fetchEntrataFeed({
      moveInDate,
    });
  
    feedCache.set(cacheKey, floorplansWithUnits);
  
    return floorplansWithUnits;
  },
  
  async syncFeed() {
    const floorplansWithUnits = feedCache.get(FLOORPLANS_FEED_CACHE_KEY);

    if (!floorplansWithUnits) {
      throw new Error('Cached floorplan feed not found. Run generate first.');
    }

    const finalJson = await buildFinalFeedJson(strapi, floorplansWithUnits);

    const url = await s3Service().uploadJson(finalJson, 'feeds/floorplans.json');

    return {
      success: true,
      message: 'floorplans synced to S3 from cache',
      url,
    };
  },
});
