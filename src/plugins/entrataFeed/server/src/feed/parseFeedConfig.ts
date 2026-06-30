import pick from '../shared/pick';
import type {
  FeedConfig,
  FloorplanCard,
  FloorplanFilter,
  FloorPlanConfig,
  FloorplanWithUnits,
} from '../types/feed';
import { buildBedFilterLabels, getBedFilter } from '../utils/shared/bedFilter';

const FLOORPLAN_CARD_FIELDS = [
  'listingType',
  'initialListingType',
  'cardButtonType',
  'paginationLimit',
  'paginationType',
];

const FLOORPLAN_FILTER_FIELDS = ['title', 'slug', 'placeholder', 'filterType'];

/** Extracts floorplan card settings from the Strapi component document. */
const parseFloorplanCard = (card: unknown): FloorplanCard | null => {
  if (!card || typeof card !== 'object') {
    return null;
  }

  return pick(card as Record<string, unknown>, FLOORPLAN_CARD_FIELDS) as FloorplanCard;
};

/** Normalizes the floorplan filter relation into a flat array for the feed JSON. */
const parseFloorplanFilters = (filters: unknown): FloorplanFilter[] => {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters.map(
    (filter) => pick(filter as Record<string, unknown>, FLOORPLAN_FILTER_FIELDS) as FloorplanFilter,
  );
};

const getPropertyFilters = (floorplans: FloorplanWithUnits[]) => {
  type PropertyFilterBounds = {
    maxRent: number;
    minRent: number;
    maxSqft: number;
    minSqft: number;
  };

  const initialBounds: PropertyFilterBounds = {
    maxRent: -Infinity,
    minRent: Infinity,
    maxSqft: -Infinity,
    minSqft: Infinity,
  };

  return floorplans.reduce<PropertyFilterBounds>(
    (acc, item) => ({
      maxRent: Math.max(acc.maxRent, Number(item.minRent)),
      minRent: Math.min(acc.minRent, Number(item.minRent)),
      maxSqft: Math.max(acc.maxSqft, Number(item.minSqFt)),
      minSqft: Math.min(acc.minSqft, Number(item.minSqFt)),
    }),
    initialBounds,
  );
};

/**
 * Builds the `feedConfig` section of the final JSON from floor-plan-configuration.
 */
const buildFeedConfig = (
  config: NonNullable<FloorPlanConfig>,
  floorplans: FloorplanWithUnits[] = [],
): FeedConfig => {
  const bedFilter = floorplans.length > 0 ? getBedFilter(floorplans) : [];

  return {
    engrainPrice: config.engrainPrice,
    enableEngrainPricing: config.enableEngrainPricing,
    engrainPriceLabel: config.engrainPriceLabel,
    sortOrder: config.sortOrder,
    priceIncrement: config.priceIncrement ?? 1000,
    sqftIncrement: config.sqftIncrement ?? 500,
    floorplanCard: parseFloorplanCard(config.floorplanCard),
    floorplanFilters: parseFloorplanFilters(config.floorplanFilters),
    ...(floorplans.length > 0 ? getPropertyFilters(floorplans) : {}),
    ...(bedFilter.length > 0
      ? {
          bedFilter,
          bedFilterLabels: buildBedFilterLabels(bedFilter),
        }
      : {}),
  };
};

export { buildFeedConfig, parseFloorplanCard, parseFloorplanFilters };
