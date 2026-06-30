import type { Core } from '@strapi/strapi';

import { FLOOR_PLAN_CONFIGURATION_UID } from '../constants/api-constants';
import type { FloorPlanConfig } from '../types/feed';
import { syncEngrainFromApi } from './syncEngrainFromApi';

/**
 * Loads the published floor-plan-configuration document.
 */
const findPublishedFloorPlanConfig = async (strapi: Core.Strapi) =>
  strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).findFirst({
    status: 'published',
  });

/**
 * Syncs Engrain pricing into floor-plan-configuration during feed generation.
 * Returns the updated configuration used to build `feedConfig` in the final JSON.
 */
const syncFloorPlanEngrain = async (strapi: Core.Strapi): Promise<FloorPlanConfig> => {
  const config = await findPublishedFloorPlanConfig(strapi);

  if (!config?.documentId) {
    throw new Error('Floor plan configuration not found');
  }

  if (!config.enableEngrainPricing) {
    return config as FloorPlanConfig;
  }

  const { config: updatedConfig } = await syncEngrainFromApi(config.documentId);

  return updatedConfig as FloorPlanConfig;
};

export default syncFloorPlanEngrain;
