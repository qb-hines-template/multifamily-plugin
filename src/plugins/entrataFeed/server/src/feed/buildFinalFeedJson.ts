import type { Core } from '@strapi/strapi';

import getFeedDetails from '../data/getFeedDetails';
import type { FloorPlanConfig, FloorplanWithUnits } from '../types/feed';
import { buildFeedConfig } from './parseFeedConfig';

/**
 * Assembles the complete feed payload uploaded to S3:
 * floorplans, feedConfig, specials, amenities, virtual tours, and property settings.
 */
const buildFinalFeedJson = async (
  strapi: Core.Strapi,
  floorplansWithUnits: FloorplanWithUnits[],
  config: FloorPlanConfig,
) => {
  const feedDetails = await getFeedDetails(strapi, floorplansWithUnits);

  return {
    floorplans: floorplansWithUnits,
    feedConfig: config ? buildFeedConfig(config, floorplansWithUnits) : null,
    ...feedDetails,
  };
};

export default buildFinalFeedJson;
