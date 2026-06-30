import { FLOOR_PLAN_CONFIGURATION_UID } from '../constants/api-constants';
import { syncEngrainFromApi } from '../engrain/syncEngrainFromApi';

/**
 * Finds floor-plan-configuration by document id, checking draft first then published.
 */
const findFloorPlanConfig = async (documentId?: string) => {
  if (documentId) {
    return (
      (await strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).findOne({
        documentId,
        status: 'draft',
      })) ??
      (await strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).findOne({
        documentId,
        status: 'published',
      }))
    );
  }

  return (
    (await strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).findFirst({ status: 'draft' })) ??
    (await strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).findFirst({ status: 'published' }))
  );
};

/**
 * Saves incoming admin form values to floor-plan-configuration draft.
 */
const saveFloorPlanConfigDraft = async (data: Record<string, unknown>) => {
  const documentId = data.documentId as string | undefined;
  const { documentId: _documentId, ...fields } = data;

  if (documentId) {
    return strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).update({
      documentId,
      data: fields as never,
      status: 'draft',
    });
  }

  const existing = await findFloorPlanConfig();

  if (existing) {
    return strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).update({
      documentId: existing.documentId,
      data: fields as never,
      status: 'draft',
    });
  }

  return strapi.documents(FLOOR_PLAN_CONFIGURATION_UID).create({
    data: fields,
    status: 'draft',
  });
};

/**
 * Manual Engrain sync triggered from the admin UI or content API.
 */
const updateEngrainPrice = async (data: Record<string, unknown> = {}) => {
  if (Object.keys(data).length > 0) {
    await saveFloorPlanConfigDraft(data);
  }

  const config = await findFloorPlanConfig(data.documentId as string | undefined);

  if (!config) {
    throw new Error('Floor plan configuration not found');
  }

  if (!config.enableEngrainPricing) {
    throw new Error('Engrain pricing is disabled');
  }

  const { config: updatedConfig, priceRange } = await syncEngrainFromApi(config.documentId);

  const formattedPrice =
    priceRange.min === priceRange.max
      ? `$${priceRange.min}`
      : `$${priceRange.min}-${priceRange.max}`;

  return {
    message: 'Engrain price synced',
    engrainPrice: formattedPrice,
    config: updatedConfig,
  };
};

export default {
  updateEngrainPrice,
};
