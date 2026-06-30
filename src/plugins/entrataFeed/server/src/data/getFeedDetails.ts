import type { Core } from '@strapi/strapi';

import {
  AMENITY_UID,
  PROPERTY_SETTING_UID,
  SPECIAL_UID,
  VIRTUAL_TOUR_UID,
} from '../constants/api-constants';
import parseFeedDetails from '../utils/shared/parseFeedDetails';

/** Loads published specials with linked floorplans, units, and offer details. */
const fetchSpecials = (strapi: Core.Strapi) =>
  strapi.documents(SPECIAL_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
      specials: { populate: { links: true } },
      customFloorplans: { fields: ['floorplan_id'] },
    },
    fields: ['special_id', 'special_type', 'floorplanTypes', 'isOverRide'],
  });

/** Loads property-level special banner configuration. */
const fetchPropertySetting = (strapi: Core.Strapi) =>
  strapi.documents(PROPERTY_SETTING_UID).findFirst({
    status: 'published',
    populate: {
      topSpecial: { populate: { links: true } },
      popupSpecial: { populate: { links: true } },
    },
  });

/** Loads amenity assignments grouped by floor level. */
const fetchAmenities = (strapi: Core.Strapi) =>
  strapi.documents(AMENITY_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
      amenitiesList: true,
    },
    fields: ['floorLevel'],
  });

/** Loads virtual tour links mapped to floorplans and units. */
const fetchVirtualTours = (strapi: Core.Strapi) =>
  strapi.documents(VIRTUAL_TOUR_UID).findMany({
    status: 'published',
    populate: {
      floorplans: { fields: ['floorplan_id'] },
      units: { fields: ['unitId'] },
    },
    fields: ['virtualTourLink'],
  });

/**
 * Loads all Strapi content needed to enrich the floorplan feed JSON.
 * Runs every query in parallel for faster feed generation.
 */
const getFeedDetails = async (strapi: Core.Strapi, floorplans: unknown[] = []) => {
  const [specials, amenities, virtualTours, propertySetting] = await Promise.all([
    fetchSpecials(strapi),
    fetchAmenities(strapi),
    fetchVirtualTours(strapi),
    fetchPropertySetting(strapi),
  ]);

  return parseFeedDetails(
    {
      specials,
      amenities,
      virtualTours,
      propertySetting,
    },
    floorplans,
  );
};

export default getFeedDetails;
