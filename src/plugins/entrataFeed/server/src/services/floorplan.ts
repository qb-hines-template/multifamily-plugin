import type { Core } from '@strapi/strapi';

import { FEED_CACHE_TTL_MS, FLOORPLANS_FEED_CACHE_KEY } from '../feed/constants';
import feedCache from '../feed/cache';
import buildFinalFeedJson from '../feed/buildFinalFeedJson';
import applyEngrainToUnits from '../feed/applyEngrainToUnits';
import syncFloorPlanEngrain from '../engrain/syncFloorPlanEngrain';
import { fetchEntrataFeed, fetchEntrataSpecials } from '../utils/entrata/fetchEntrataData';
import syncToStrapi from '../utils/persist/syncToStrapi';
import importSpecials from '../utils/specials';
import type { FloorplanWithUnits, FloorPlanConfig } from '../types/feed';
import s3Service from './s3';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Full feed pipeline:
   * 1. Fetch Entrata floorplans, specials, and Engrain config in parallel
   * 2. Apply engrain pricing to units
   * 3. Persist floorplans/units/specials to Strapi
   * 4. Build final JSON and upload to S3
   */
  async getFeedData() {
    try {
      const [floorplansWithUnits, specials, config] = await Promise.all([
        fetchEntrataFeed(),
        fetchEntrataSpecials(),
        syncFloorPlanEngrain(strapi),
      ]);

      const floorplans = floorplansWithUnits as FloorplanWithUnits[];
      const floorPlanConfig = config as FloorPlanConfig;

      applyEngrainToUnits(floorplans, floorPlanConfig);

      feedCache.set(FLOORPLANS_FEED_CACHE_KEY, floorplans, { ttl: FEED_CACHE_TTL_MS });

      await Promise.all([
        syncToStrapi(strapi, floorplans),
        importSpecials(strapi, specials),
      ]);

      const finalJson = await buildFinalFeedJson(strapi, floorplans, floorPlanConfig);


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

  /** Returns Entrata floorplans for a specific move-in date, with in-memory caching. */
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

    const floorplansWithUnits = await fetchEntrataFeed({ moveInDate });

    feedCache.set(cacheKey, floorplansWithUnits);

    return floorplansWithUnits;
  },

  /** Rebuilds and uploads the feed JSON from the last cached generate run. */
  async syncFeed() {
    const floorplansWithUnits = feedCache.get(FLOORPLANS_FEED_CACHE_KEY);

    if (!floorplansWithUnits) {
      throw new Error('Cached floorplan feed not found. Run generate first.');
    }

    const finalJson = await buildFinalFeedJson(
      strapi,
      floorplansWithUnits as FloorplanWithUnits[],
      null,
    );

    const url = await s3Service().uploadJson(finalJson, 'feeds/floorplans.json');

    return {
      success: true,
      message: 'floorplans synced to S3 from cache',
      url,
    };
  },
});
