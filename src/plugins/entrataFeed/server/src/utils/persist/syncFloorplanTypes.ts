import type { Core } from '@strapi/strapi';
import type { Modules } from '@strapi/types';

import { FLOORPLAN_TYPE_UID } from '../../constants/api-constants';
import { buildFloorplanTypeRecords, PENTHOUSE_NAME } from '../shared/bedFilter';

type FloorplanTypeInput = Modules.Documents.Params.Data.Input<typeof FLOORPLAN_TYPE_UID> & {
  bedCount?: number | null;
  name: string;
  description: string;
};

const syncFloorplanTypes = async (
  strapi: Core.Strapi,
  floorplans: Record<string, unknown>[],
) => {
  const floorplanTypes = buildFloorplanTypeRecords(
    floorplans as { bed_count?: number | string; floorplan_name?: string }[],
  );

  if (!floorplanTypes.length) {
    return;
  }

  const bedCounts = floorplanTypes
    .map((type) => type.bedCount)
    .filter((bedCount): bedCount is number => bedCount != null);

  const [existingBedTypes, existingPenthouse] = await Promise.all([
    bedCounts.length
      ? strapi.documents(FLOORPLAN_TYPE_UID).findMany({
          filters: {
            bedCount: {
              $in: bedCounts,
            },
          },
          fields: ['bedCount', 'name', 'description'],
          status: 'published',
        })
      : Promise.resolve([]),
    floorplanTypes.some((type) => type.name === PENTHOUSE_NAME)
      ? strapi.documents(FLOORPLAN_TYPE_UID).findFirst({
          filters: {
            name: {
              $eq: PENTHOUSE_NAME,
            },
          },
          fields: ['bedCount', 'name', 'description'],
          status: 'published',
        })
      : Promise.resolve(null),
  ]);

  const existingByBedCount = new Map(existingBedTypes.map((type) => [type.bedCount, type]));

  await Promise.all(
    floorplanTypes.map(async (type) => {
      const existing =
        type.name === PENTHOUSE_NAME ? existingPenthouse : existingByBedCount.get(type.bedCount as number);

      if (existing) {
        const isUnchanged =
          existing.name === type.name && existing.description === type.description;

        if (isUnchanged) {
          return;
        }

        return strapi.documents(FLOORPLAN_TYPE_UID).update({
          documentId: existing.documentId,
          data: type as FloorplanTypeInput,
          status: 'published',
        });
      }

      return strapi.documents(FLOORPLAN_TYPE_UID).create({
        data: type as FloorplanTypeInput,
        status: 'published',
      });
    }),
  );
};

export default syncFloorplanTypes;
