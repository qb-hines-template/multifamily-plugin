/** UI configuration for how floorplan cards are displayed in the feed. */
export type FloorplanCard = {
  listingType?: string;
  initialListingType?: string;
  cardButtonType?: string;
  paginationLimit?: number;
  paginationType?: string;
};

/** A single filter option shown on the floorplan listing page. */
export type FloorplanFilter = {
  title?: string;
  slug?: string;
  placeholder?: string;
  filterType?: string;
};

/** Published floor-plan-configuration document used in the feed JSON. */
export type FloorPlanConfig = {
  engrainPrice?: string;
  enableEngrainPricing?: boolean;
  engrainPriceLabel?: string;
  sortOrder?: string;
  priceIncrement?: number;
  sqftIncrement?: number;
  floorplanCard?: FloorplanCard | null;
  floorplanFilters?: FloorplanFilter[] | null;
} | null;

/** Shape of a unit while building the feed (before/after engrain is applied). */
export type FeedUnit = Record<string, unknown> & {
  best_price?: number | string;
  engrainPrice?: number | string;
};

/** Floorplan entry returned from Entrata with nested units. */
export type FloorplanWithUnits = {
  minRent?: number;
  minSqFt?: number;
  bed_count?: number | string;
  floorplan_name?: string;
  units?: FeedUnit[];
  [key: string]: unknown;
};

/** Subset of floor-plan configuration exposed in the final feed JSON. */
export type FeedConfig = {
  engrainPrice?: string;
  enableEngrainPricing?: boolean;
  engrainPriceLabel?: string;
  sortOrder?: string;
  priceIncrement?: number;
  sqftIncrement?: number;
  floorplanCard: FloorplanCard | null;
  floorplanFilters: FloorplanFilter[];
  minRent?: number;
  maxRent?: number;
  minSqft?: number;
  maxSqft?: number;
  bedFilter?: number[];
  bedFilterLabels?: string[];
};
