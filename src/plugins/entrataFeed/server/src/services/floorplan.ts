import type { Core } from '@strapi/strapi';
import { fetchEntrataFeed, fetchEntrataSpecials } from '../utils/entrata/fetchEntrataData';
import syncToStrapi from '../utils/persist/syncToStrapi';
import importSpecials from '../utils/specials';
import getFeedDetails from '../utils/shared/dbCalls';
import s3Service from './s3';
import { LRUCache } from 'lru-cache';
import updateEngrainPrice from '../utils/engrain/engrainCalculator';
import { addEngrainToUnitPrice, parseEngrainRange } from '../utils/shared/parsePrice';

type FloorplanCard = {
  listingType?: string;
  initialListingType?: string;
  cardButtonType?: string;
  paginationLimit?: number;
  paginationType?: string;
};

type FloorplanFilter = {
  title?: string;
  slug?: string;
  placeholder?: string;
  filterType?: string;
};

type FloorPlanConfig = {
  engrainPrice?: string;
  enableEngrainPricing?: boolean;
  engrainPriceLabel?: string;
  sortOrder?: string;
  floorplanCard?: FloorplanCard | null;
  floorplanFilters?: FloorplanFilter[] | null;
} | null;

const pick = (item: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => key in item).map((key) => [key, item[key]]));

const parseFloorplanCard = (card: unknown): FloorplanCard | null => {
  if (!card || typeof card !== 'object') {
    return null;
  }

  return pick(card as Record<string, unknown>, [
    'listingType',
    'initialListingType',
    'cardButtonType',
    'paginationLimit',
    'paginationType',
  ]) as FloorplanCard;
};

const parseFloorplanFilters = (filters: unknown): FloorplanFilter[] => {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters.map((filter) =>
    pick(filter as Record<string, unknown>, ['title', 'slug', 'placeholder', 'filterType']),
  ) as FloorplanFilter[];
};

const buildFeedConfig = (config: NonNullable<FloorPlanConfig>) => ({
  engrainPrice: config.engrainPrice,
  enableEngrainPricing: config.enableEngrainPricing,
  engrainPriceLabel: config.engrainPriceLabel,
  sortOrder: config.sortOrder,
  floorplanCard: parseFloorplanCard(config.floorplanCard),
  floorplanFilters: parseFloorplanFilters(config.floorplanFilters),
});

const FEED_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FLOORPLANS_FEED_CACHE_KEY = 'floorplans-feed';

const feedCache = new LRUCache<string, unknown>({
  max: 1000,
  ttl: FEED_CACHE_TTL_MS,
});

const buildFinalFeedJson = async (
  strapi: Core.Strapi,
  floorplansWithUnits: unknown,
  config: FloorPlanConfig,
) => {
  const floorplans = floorplansWithUnits as Record<string, unknown>[];
  const feedDetails = await getFeedDetails(strapi, floorplans);

  return {
    floorplans,
    feedConfig: config ? buildFeedConfig(config) : null,
    ...feedDetails,
  };
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getFeedData() {
    try {
      const [floorplansWithUnits, specials, config] = await Promise.all([
        fetchEntrataFeed(),
        fetchEntrataSpecials(),
        updateEngrainPrice(strapi),
      ]);

      const floorPlanConfig = config as FloorPlanConfig;
      const engrainRange = parseEngrainRange(floorPlanConfig?.engrainPrice);

      for (const floorplan of floorplansWithUnits as { units?: Record<string, unknown>[] }[]) {
        for (const unit of floorplan.units ?? []) {
          unit.engrainPrice = addEngrainToUnitPrice(unit.best_price, engrainRange);
        }
      }

      await syncToStrapi(strapi, floorplansWithUnits);
      await importSpecials(strapi, specials);
      const finalJson = await buildFinalFeedJson(strapi, floorplansWithUnits, floorPlanConfig);

      const url = await s3Service().uploadJson(
        finalJson,
        `feeds/${process.env.ENTRATA_PROPERTY_ID}/floorplans.json`
      );

      return {
        success: true,
        message: 'floorplans synced successfully',
        url
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

    const finalJson = await buildFinalFeedJson(strapi, floorplansWithUnits, null);

    const url = await s3Service().uploadJson(finalJson, 'feeds/floorplans.json');

    return {
      success: true,
      message: 'floorplans synced to S3 from cache',
      url,
    };
  },
});
